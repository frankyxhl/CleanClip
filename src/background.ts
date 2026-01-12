// Background service worker for CleanClip extension
// Handles context menu registration, shortcuts, and image OCR triggers
// Phase 9: Enhanced error handling with user-friendly prompts
// Phase 13.5: Use offscreen clipboard for clipboard operations

import { logger } from './logger'
import { writeToClipboardViaOffscreen } from './offscreen'
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
 * Task 2.4: Show success notification to user
 * Uses chrome.notifications API to display success messages
 * Helper function for code reuse
 */
async function showSuccessNotification(title: string, message: string): Promise<void> {
  console.log(`[Notification] Creating notification: ${title} - ${message}`)
  if (chrome?.notifications) {
    try {
      const notificationId = await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon128.png'),
        title: title,
        message: message,
        priority: 2
      })
      console.log(`[Notification] ✅ Notification created: ${notificationId}`)
    } catch (error) {
      console.error('[Notification] ❌ Failed to create notification:', error)
    }
  } else {
    console.log(`CleanClip: ${title} - ${message}`)
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
      // Show OCR completion notification (REQ-003-011)
      await showSuccessNotification(
        'CleanClip',
        'OCR complete! Result copied to clipboard'
      )
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
 * Performs cropping directly in the background script using Canvas API
 */
export async function captureArea(selection: SelectionCoords, debugInfo?: DebugInfo): Promise<CaptureAreaResult> {
  if (!chrome?.tabs) {
    throw new Error('chrome.tabs API not available')
  }

  console.log('[Background] captureArea called, selection:', selection)

  console.log('[Background] Capturing tab')
  // Capture visible tab
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })
  console.log('[Background] Tab captured, data URL length:', dataUrl.length)

  // Show screenshot success notification (REQ-003-010)
  await showSuccessNotification(
    'CleanClip',
    'Screenshot captured! Sending to AI...'
  )

  // Store original image URL for debug
  const originalImageUrl = dataUrl

  // Convert data URL to Blob for use with createImageBitmap
  const sourceBlob = await dataUrlToBlob(dataUrl)
  console.log('[Background] Converted to blob, size:', sourceBlob.size)

  // Create ImageBitmap from Blob (works in service workers)
  const bitmap = await createImageBitmap(sourceBlob)
  console.log('[Background] ImageBitmap created, size:', bitmap.width, 'x', bitmap.height)
  const originalSize = { width: bitmap.width, height: bitmap.height }

  // Calculate scale factors based on debug info
  // The captured image may be scaled due to device pixel ratio and zoom level
  let scaleX = 1
  let scaleY = 1

  if (debugInfo) {
    // Use viewport size from debug info to calculate scale
    scaleX = originalSize.width / debugInfo.viewportSize.width
    scaleY = originalSize.height / debugInfo.viewportSize.height
  }

  // Scale selection coordinates to match captured image dimensions
  const scaledSelection = {
    x: selection.x * scaleX,
    y: selection.y * scaleY,
    width: selection.width * scaleX,
    height: selection.height * scaleY
  }

  console.log('[Background] Scaled selection:', scaledSelection)

  // Create canvas and crop the image
  const canvas = new OffscreenCanvas(scaledSelection.width, scaledSelection.height)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Draw the cropped portion of the image
  ctx.drawImage(
    bitmap,
    scaledSelection.x,
    scaledSelection.y,
    scaledSelection.width,
    scaledSelection.height,
    0,
    0,
    scaledSelection.width,
    scaledSelection.height
  )

  // Close the bitmap to free memory
  bitmap.close()

  // Convert to blob and then to base64
  const blob = await canvas.convertToBlob()
  const base64 = await blobToBase64(blob)

  console.log('[Background] Crop completed, base64 length:', base64.length)

  // Prepare debug information if provided
  let debug
  if (debugInfo) {
    debug = {
      originalImageUrl,
      selection,
      originalSize,
      devicePixelRatio: debugInfo.devicePixelRatio,
      zoomLevel: debugInfo.zoomLevel
    }
  }

  return {
    base64,
    originalImageUrl,
    debug
  }
}

/**
 * Convert a data URL to Blob
 * Works in service worker environment
 */
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(response => response.blob())
}

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',', 2)[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
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

      // First, try to send PING to check if content script is loaded
      let contentScriptLoaded = false
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'CLEANCLIP_PING' })
        contentScriptLoaded = true
      } catch {
        // Content script not loaded yet - this is normal after page navigation
      }

      // If content script is not loaded, try to inject it dynamically
      if (!contentScriptLoaded) {
        console.log('[CleanClip] Content script not loaded, attempting dynamic injection...')

        try {
          // Inject the overlay content script
          // Note: The file path must match what's in the built manifest
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['assets/overlay.ts-loader-DhKoN8De.js']
          })
          console.log('[CleanClip] Content script injected successfully')

          // Wait for script to initialize and set up message listeners
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.error('[CleanClip] Failed to inject content script:', error)

          // Show helpful notification to user
          await showSuccessNotification(
            'CleanClip',
            'Please refresh this page first, then use Cmd+Shift+X again.'
          )
          return
        }
      }

      // Send message to show overlay
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CLEANCLIP_SHOW_OVERLAY'
        })
        console.log('[CleanClip] Overlay shown successfully')
      } catch (error) {
        console.error('[CleanClip] Failed to show overlay:', error)
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
