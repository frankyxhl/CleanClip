/**
 * Offscreen Clipboard Script
 * Phase 13.2: Handle clipboard operations in offscreen document
 *
 * This script runs in the offscreen document context where navigator.clipboard
 * is available. It listens for messages from the background script and performs
 * clipboard operations.
 */

interface ClipboardWriteMessage {
  type: 'CLEANCLIP_CLIPBOARD_WRITE'
  text: string
}

interface ClipboardReadMessage {
  type: 'CLEANCLIP_CLIPBOARD_READ'
}

type ClipboardMessage = ClipboardWriteMessage | ClipboardReadMessage

interface ClipboardWriteResponse {
  success: boolean
  error?: string
}

interface ClipboardReadResponse {
  success: boolean
  text?: string
  error?: string
}

/**
 * Handle clipboard write operations
 */
async function handleClipboardWrite(text: string): Promise<ClipboardWriteResponse> {
  try {
    if (!navigator.clipboard) {
      return {
        success: false,
        error: 'Clipboard API not available',
      }
    }

    await navigator.clipboard.writeText(text)
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clipboard error',
    }
  }
}

/**
 * Handle clipboard read operations
 */
async function handleClipboardRead(): Promise<ClipboardReadResponse> {
  try {
    if (!navigator.clipboard) {
      return {
        success: false,
        error: 'Clipboard API not available',
      }
    }

    const text = await navigator.clipboard.readText()
    return {
      success: true,
      text,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown clipboard error',
    }
  }
}

/**
 * Listen for messages from background script
 */
if (chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message: ClipboardMessage, _sender, sendResponse) => {
    // Handle async operations
    ;(async () => {
      if (message.type === 'CLEANCLIP_CLIPBOARD_WRITE') {
        const result = await handleClipboardWrite(message.text)
        sendResponse(result)
      } else if (message.type === 'CLEANCLIP_CLIPBOARD_READ') {
        const result = await handleClipboardRead()
        sendResponse(result)
      }
    })()

    // Return true to indicate async response
    return true
  })
}

console.log('CleanClip offscreen clipboard document loaded')
