/**
 * Offscreen Clipboard Script
 * Phase 13.2: Handle clipboard operations in offscreen document
 *
 * This script runs in the offscreen document context where navigator.clipboard
 * is available. It uses storage polling to communicate with background script.
 */

// Note: Don't import logger to avoid module loading issues in offscreen context

const CLIPBOARD_REQUEST_KEY = '__CLEANCLIP_CLIPBOARD_REQUEST__'
const CLIPBOARD_RESPONSE_KEY = '__CLEANCLIP_CLIPBOARD_RESPONSE__'

export interface ClipboardMimeData {
  mimeType: string
  data: string
}

interface ClipboardWriteRequestData {
  text: string
  timestamp: number
  customMimeTypes?: ClipboardMimeData[]
}

interface ClipboardWriteResponseData {
  success: boolean
  error?: string
  timestamp: number
}

/**
 * Handle clipboard write operations
 * Uses copy event + clipboardData.setData() to support custom MIME types
 * Phase 019 Task 2.4: Support multi-MIME type clipboard writes
 */
async function handleClipboardWrite(
  text: string,
  customMimeTypes?: ClipboardMimeData[]
): Promise<ClipboardWriteResponseData> {
  console.log('Writing text to clipboard:', text.substring(0, 50) + '...')
  console.log('Custom MIME types:', customMimeTypes?.length || 0)

  try {
    // Create temporary element to trigger copy event
    const tempDiv = document.createElement('div')
    tempDiv.style.cssText = 'position:fixed;left:-9999px;'
    tempDiv.textContent = text
    document.body.appendChild(tempDiv)

    // Select the temporary element
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(tempDiv)
    selection?.removeAllRanges()
    selection?.addRange(range)

    // Create a promise to wait for copy event result
    let copySuccessful = false
    const copyHandler = (e: ClipboardEvent) => {
      e.preventDefault()

      // Set text/plain first
      e.clipboardData?.setData('text/plain', text)

      // Set custom MIME types if provided
      if (customMimeTypes && customMimeTypes.length > 0) {
        customMimeTypes.forEach(({ mimeType, data }) => {
          e.clipboardData?.setData(mimeType, data)
          console.log(`Set MIME type: ${mimeType}`)
        })
      }

      copySuccessful = true
    }

    // Listen for copy event (once)
    document.addEventListener('copy', copyHandler, { once: true })

    // Execute copy command
    const successful = document.execCommand('copy')

    // Cleanup
    document.body.removeChild(tempDiv)
    selection?.removeAllRanges()

    if (successful && copySuccessful) {
      console.log('Clipboard write successful via copy event')
      return {
        success: true,
        timestamp: 0
      }
    } else {
      console.error('Copy command or event handler failed')
      return {
        success: false,
        error: 'Copy operation failed',
        timestamp: 0
      }
    }
  } catch (error) {
    console.error('Clipboard write failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clipboard error',
      timestamp: 0
    }
  }
}

/**
 * Process clipboard write request from storage
 */
async function processClipboardWriteRequest(request: ClipboardWriteRequestData): Promise<void> {
  console.log('Processing clipboard write request')
  const result = await handleClipboardWrite(request.text, request.customMimeTypes)

  // Write response to storage with timestamp
  const responseData: ClipboardWriteResponseData = {
    ...result,
    timestamp: request.timestamp
  }

  console.log('Writing response to storage')
  if (chrome?.storage?.local) {
    await chrome.storage.local.set({ [CLIPBOARD_RESPONSE_KEY]: responseData })
  } else {
    console.error('Chrome storage API not available')
  }
}

/**
 * Listen for clipboard write requests via storage polling
 */
function setupStorageListener() {
  console.log('[Offscreen] setupStorageListener called')
  if (chrome?.storage?.onChanged) {
    console.log('[Offscreen] Setting up storage listener')
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log('[Offscreen] Storage changed:', areaName, Object.keys(changes))
      if (areaName === 'local' && changes[CLIPBOARD_REQUEST_KEY]?.newValue) {
        console.log('[Offscreen] Clipboard request detected!')
        const request = changes[CLIPBOARD_REQUEST_KEY].newValue as ClipboardWriteRequestData
        processClipboardWriteRequest(request)
      }
    })
    console.log('[Offscreen] Storage listener registered')
  } else {
    console.error('[Offscreen] Chrome storage API not available for listener')
  }
}

// Wait for DOM to be ready
console.log('[Offscreen] Script loaded, readyState:', document.readyState)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Offscreen] DOM loaded, setting up listener')
    setupStorageListener()
  })
} else {
  setupStorageListener()
}

console.log('Offscreen clipboard document loaded')
