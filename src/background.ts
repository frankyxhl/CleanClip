// Background service worker for CleanClip extension
// Handles context menu registration, shortcuts, and image OCR triggers
// Phase 9: Enhanced error handling with user-friendly prompts
// Phase 13.5: Use offscreen clipboard for clipboard operations

import { logger } from './logger'
import { writeToClipboardViaOffscreen } from './offscreen'

interface SelectionCoords {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Task 9.9: Show error notification to user
 * Uses chrome.notifications API to display error messages
 */
function showErrorNotification(title: string, message: string): void {
  if (chrome?.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png', // Will use default icon if not found
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
 * Handle OCR operation with proper error handling
 */
async function handleOCR(base64Image: string, imageUrl?: string): Promise<void> {
  try {
    // Get API key from storage
    const apiKey = await getApiKey()

    if (!apiKey) {
      showErrorNotification(
        'API Key Missing',
        'Please configure your Gemini API key in extension settings. Get your key from: https://makersuite.google.com/app/apikey'
      )
      return
    }

    // Import OCR module dynamically
    const { recognizeImage } = await import('./ocr.js')
    const { addToHistory } = await import('./history.js')

    // Perform OCR
    const result = await recognizeImage(`data:image/png;base64,${base64Image}`, 'text', apiKey)

    // Copy to clipboard using offscreen document
    const clipboardResult = await writeToClipboardViaOffscreen(result.text)

    if (!clipboardResult.success) {
      throw new Error(clipboardResult.error || 'Failed to copy to clipboard')
    }

    // Save to history
    await addToHistory({
      text: result.text,
      timestamp: result.timestamp,
      imageUrl: imageUrl || `data:image/png;base64,${base64Image}`
    })

  } catch (error) {
    console.error('CleanClip: OCR failed', error)

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
        'Could not fetch the image. Try using area screenshot (Cmd+Shift+C) instead.'
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

/**
 * Capture visible tab and crop to selected area
 */
async function captureArea(selection: SelectionCoords): Promise<string> {
  if (!chrome?.tabs) {
    throw new Error('chrome.tabs API not available')
  }

  // Capture visible tab
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })

  // Crop to selected area using canvas
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = new OffscreenCanvas(selection.width, selection.height)
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw selected area
        ctx.drawImage(
          img,
          selection.x,
          selection.y,
          selection.width,
          selection.height,
          0,
          0,
          selection.width,
          selection.height
        )

        // Convert to blob and then to base64
        canvas.convertToBlob({ type: 'image/png' }).then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }).catch(reject)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = dataUrl
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
          'Could not fetch the image. Try using area screenshot (Cmd+Shift+C) instead.'
        )
      }
    }
  })

  // Handle keyboard shortcut (Cmd+Shift+C)
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'cleanclip-screenshot' && tab?.id) {
      logger.debug('Screenshot command triggered')

      // Inject content script to show overlay
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/overlay.ts']
        })
      } catch (error) {
        console.error('CleanClip: Failed to inject overlay script', error)
      }
    }
  })

  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CLEANCLIP_SCREENSHOT_CAPTURE') {
      const selection = message.selection as SelectionCoords

      logger.debug('Capturing area', selection)

      captureArea(selection)
        .then(async base64Image => {
          logger.debug('Screenshot captured', base64Image.substring(0, 50) + '...')

          // Handle OCR with error notifications
          await handleOCR(base64Image)

          sendResponse({ success: true, base64: base64Image })
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
