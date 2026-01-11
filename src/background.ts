// Background service worker for CleanClip extension
// Handles context menu registration, shortcuts, and image OCR triggers
// Phase 9: Enhanced error handling with user-friendly prompts
// Phase 13.5: Use offscreen clipboard for clipboard operations

import { logger } from './logger'
import { writeToClipboardViaOffscreen } from './offscreen'
import { ensureOffscreenDocument } from './offscreen/clipboard'
import { recognizeImage } from './ocr'
import { addToHistory } from './history'

/**
 * Task 9.9: Show error notification to user
 * Uses chrome.notifications API to display error messages
 */
function showErrorNotification(title: string, message: string): void {
  if (chrome?.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon128.png'),
      title: `CleanClip: ${title}`,
      message: message,
      priority: 2
    })
  } else {
    console.error(`CleanClip: ${title} - ${message}`)
  }
}

/**
 * Get API key from storage
 */
async function getApiKey(): Promise<string | null> {
  if (!chrome?.storage?.local) {
    return null
  }

  const result = await chrome.storage.local.get('cleanclip-api-key')
  return result['cleanclip-api-key'] || null
}

/**
 * Check if debug mode is enabled
 */
async function isDebugMode(): Promise<boolean> {
  if (!chrome?.storage?.local) {
    return false
  }

  const result = await chrome.storage.local.get('cleanclip-debug-mode')
  return result['cleanclip-debug-mode'] === true
}

/**
 * Handle OCR operation with proper error handling
 */
async function handleOCR(base64Image: string, imageUrl?: string, captureDebug?: CaptureAreaResult['debug']): Promise<void> {
  console.log('[OCR] ===== Starting OCR process =====')
  try {
    // Get API key from storage
    const apiKey = await getApiKey()
    console.log('[OCR] API Key configured:', !!apiKey)

    if (!apiKey) {
      console.log('[OCR] ❌ API Key is missing!')
      showErrorNotification(
        'API Key Missing',
        'Please configure your Gemini API key in extension settings. Get your key from: https://makersuite.google.com/app/apikey'
      )
      return
    }

    console.log('[OCR] Calling Gemini API...')
    // Perform OCR
    const result = await recognizeImage(`data:image/png;base64,${base64Image}`, 'text', apiKey)
    console.log('[OCR] ✅ OCR Success!')
    console.log('[OCR] ===== EXTRACTED TEXT =====')
    console.log(result.text)
    console.log('[OCR] ===== END OF TEXT =====')

    // Show notification with OCR result (temporary solution)
    const previewText = result.text.length > 100
      ? result.text.substring(0, 100) + '...'
      : result.text

    showErrorNotification(
      'OCR Result',
      `Extracted: "${previewText}"\n(Text copied to console. Full text length: ${result.text.length} chars)`
    )

    // Copy to clipboard using offscreen document
    console.log('[OCR] Copying to clipboard...')
    const clipboardResult = await writeToClipboardViaOffscreen(result.text)
    console.log('[OCR] Clipboard result:', clipboardResult)

    if (!clipboardResult.success) {
      console.error('[OCR] ⚠️ Clipboard copy failed (but continuing...):', clipboardResult.error)
      // Don't throw - continue to save to history
    } else {
      console.log('[OCR] ✅ Copied to clipboard!')
    }

    // Save to history (even if clipboard failed)
    console.log('[OCR] Saving to history...')

    // Check if debug mode is enabled
    const debugEnabled = await isDebugMode()
    console.log('[OCR] Debug mode:', debugEnabled ? 'enabled' : 'disabled')

    // Prepare history item
    const historyItem: {
      text: string
      timestamp: number
      imageUrl: string
      debug?: CaptureAreaResult['debug']
    } = {
      text: result.text,
      timestamp: result.timestamp,
      imageUrl: imageUrl || `data:image/png;base64,${base64Image}`
    }

    // Only include debug information if debug mode is enabled and capture debug is available
    if (debugEnabled && captureDebug) {
      historyItem.debug = captureDebug
      console.log('[OCR] Debug info included in history')
    }

    await addToHistory(historyItem)
    console.log('[OCR] ✅ Saved to history!')
    console.log('[OCR] ===== OCR process complete =====')

  } catch (error) {
    console.error('[OCR] ❌ OCR failed:', error)
    console.error('[OCR] Error details:', error instanceof Error ? error.message : String(error))

    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('API key is required')) {
      showErrorNotification(
        'API Key Required',
        'Please configure your Gemini API key in extension settings.'
      )
    } else if (errorMessage.includes('API request failed: 401') || errorMessage.includes('API request failed: 403')) {
      showErrorNotification(
        'Invalid API Key',
        'Your API key appears to be invalid. Please check your API key in extension settings.'
      )
    } else if (errorMessage.includes('Failed to fetch')) {
      showErrorNotification(
        'Image Fetch Failed',
        'Could not fetch the image. Try using area screenshot (Cmd+Shift+X) instead.'
      )
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      showErrorNotification(
        'Request Timeout',
        'OCR request timed out. Please try again with a smaller image area.'
      )
    } else if (errorMessage.includes('No text detected')) {
      showErrorNotification(
        'No Text Detected',
        'Could not detect any text in the selected image. Try selecting a different area.'
      )
    } else {
      showErrorNotification(
        'OCR Failed',
        `An error occurred: ${errorMessage}. Please try again.`
      )
    }
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )

    return base64
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

interface SelectionCoords {
  x: number
  y: number
  width: number
  height: number
}

interface DebugInfo {
  devicePixelRatio: number
  zoomLevel: number
  viewportSize: { width: number; height: number }
}

interface CropRequestData {
  dataUrl: string
  selection: SelectionCoords
  timestamp: number
}

interface CropResponseData {
  success: boolean
  base64?: string
  error?: string
  timestamp: number
}

interface CaptureAreaResult {
  base64: string
  originalImageUrl: string
  debug?: {
    originalImageUrl: string
    selection: SelectionCoords
    originalSize: { width: number; height: number }
    devicePixelRatio: number
    zoomLevel: number
  }
}

/**
 * Capture visible tab and crop to selected area
 * Uses storage polling to communicate with offscreen document
 */
async function captureArea(selection: SelectionCoords, debugInfo?: DebugInfo): Promise<CaptureAreaResult> {
  if (!chrome?.tabs) {
    throw new Error('chrome.tabs API not available')
  }

  console.log('[Background] captureArea called, selection:', selection)

  // Ensure offscreen document exists
  await ensureOffscreenDocument()
  console.log('[Background] Offscreen document ensured')

  // Wait a bit for offscreen to be ready
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log('[Background] Capturing tab')
  // Capture visible tab
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })
  console.log('[Background] Tab captured, data URL length:', dataUrl.length)

  // Store original image URL for debug
  const originalImageUrl = dataUrl

  // Write crop request to storage
  const timestamp = Date.now()
  const request: CropRequestData = {
    dataUrl,
    selection,
    timestamp
  }

  console.log('[Background] Writing crop request to storage')
  await chrome.storage.local.set({ '__CLEANCLIP_CROP_REQUEST__': request })

  // Poll for response
  console.log('[Background] Waiting for crop response...')
  let retries = 100  // Wait up to 10 seconds
  while (retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 100))

    const result = await chrome.storage.local.get('__CLEANCLIP_CROP_RESPONSE__')
    const response = result['__CLEANCLIP_CROP_RESPONSE__'] as CropResponseData | undefined

    if (response && response.timestamp === timestamp) {
      // Clear the response
      await chrome.storage.local.remove('__CLEANCLIP_CROP_RESPONSE__')

      if (!response.success) {
        throw new Error(response.error || 'Crop failed')
      }

      console.log('[Background] Crop completed, base64 length:', response.base64!.length)

      // Prepare debug information if provided
      let debug
      if (debugInfo) {
        // Get original image dimensions from the data URL
        const img = new Image()
        const originalSize = await new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => {
            resolve({ width: img.width, height: img.height })
          }
          img.src = dataUrl
        })

        debug = {
          originalImageUrl,
          selection,
          originalSize,
          devicePixelRatio: debugInfo.devicePixelRatio,
          zoomLevel: debugInfo.zoomLevel
        }
      }

      return {
        base64: response.base64!,
        originalImageUrl,
        debug
      }
    }

    retries--
  }

  throw new Error('Crop request timeout')
}

if (chrome?.runtime && chrome?.contextMenus) {
  // Register context menu on extension install
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'cleanclip-recognize',
      title: 'CleanClip: Recognize Text',
      contexts: ['image']
    })
  })

  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener(async (info, _tab) => {
    if (info.srcUrl) {
      // Image URL is available, will be used for OCR
      logger.debug('Image URL clicked', info.srcUrl)

      try {
        // Fetch image and convert to base64
        const base64Image = await fetchImageAsBase64(info.srcUrl)
        logger.debug('Image fetched as base64', base64Image.substring(0, 50) + '...')

        // Handle OCR with error notifications
        await handleOCR(base64Image, info.srcUrl)
      } catch (error) {
        console.error('CleanClip: Failed to fetch image', error)

        // Show user-friendly error message
        showErrorNotification(
          'Image Fetch Failed',
          'Could not fetch the image. Try using area screenshot (Cmd+Shift+X) instead.'
        )
      }
    }
  })

  // Handle keyboard shortcut (Cmd+Shift+X)
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'cleanclip-screenshot') {
      logger.debug('Screenshot command triggered')

      if (!tab?.id) {
        console.error('CleanClip: No active tab')
        return
      }

      // Send message to content script to show overlay
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CLEANCLIP_SHOW_OVERLAY'
        })
      } catch (error) {
        console.error('CleanClip: Failed to show overlay, content script not loaded. Please reload the page.', error)
        // Show notification to user
        if (chrome?.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icon128.png'),
            title: 'CleanClip',
            message: 'Please reload this page to use the screenshot feature (Cmd+Shift+X)',
            priority: 2
          })
        }
      }
    }
  })

  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CLEANCLIP_SCREENSHOT_CAPTURE') {
      const selection = message.selection as SelectionCoords
      const debugInfo = message.debug as DebugInfo | undefined

      logger.debug('Capturing area', selection)

      captureArea(selection, debugInfo)
        .then(async captureResult => {
          logger.debug('Screenshot captured', captureResult.base64.substring(0, 50) + '...')

          // Handle OCR with error notifications
          await handleOCR(captureResult.base64, undefined, captureResult.debug)

          sendResponse({ success: true, base64: captureResult.base64 })
        })
        .catch(error => {
          console.error('CleanClip: Failed to capture area', error)

          // Show user-friendly error message
          showErrorNotification(
            'Screenshot Failed',
            'Could not capture the selected area. Please try again.'
          )

          sendResponse({ success: false, error: error.message })
        })

      return true // Keep message channel open for async response
    }

    return false
  })
}
