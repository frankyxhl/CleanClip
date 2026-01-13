/**
 * Offscreen Clipboard Script
 * Phase 13.2: Handle clipboard operations in offscreen document
 *
 * This script runs in the offscreen document context where navigator.clipboard
 * is available. It uses storage polling to communicate with background script.
 */

import { logger } from '../logger'

const OFFSCREEN_URL = 'src/offscreen/clipboard.html'
const OFFSCREEN_REASON = 'CLIPBOARD'
const JUSTIFICATION = 'CleanClip needs clipboard access to copy OCR results'

/**
 * Ensure offscreen document exists
 */
export async function ensureOffscreenDocument(): Promise<void> {
  if (!chrome?.offscreen) {
    throw new Error('Chrome offscreen API not available')
  }

  // Check if already exists
  if (chrome.offscreen.hasDocument?.()) {
    return
  }

  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [OFFSCREEN_REASON],
      justification: JUSTIFICATION
    })
  } catch (error) {
    // Ignore "already exists" errors
    if (error instanceof Error &&
        !error.message.includes('already exists') &&
        !error.message.includes('Only one offscreen document may exist')) {
      throw error
    }
  }
}

interface ClipboardWriteRequestData {
  text: string
  timestamp: number
}

interface ClipboardWriteResponseData {
  success: boolean
  error?: string
  timestamp: number
}

/**
 * Handle clipboard write operations
 * Uses document.execCommand('copy') as fallback since navigator.clipboard
 * is not available in offscreen documents (they can't be focused)
 */
async function handleClipboardWrite(text: string): Promise<ClipboardWriteResponseData> {
  logger.debug('Writing text to clipboard:', text.substring(0, 50) + '...')
  try {
    // navigator.clipboard is not available in offscreen documents
    // Use document.execCommand('copy') as workaround
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      logger.debug('Clipboard write successful via execCommand')
      return {
        success: true,
        timestamp: 0
      }
    } else {
      console.error('execCommand copy failed')
      return {
        success: false,
        error: 'execCommand copy failed',
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
  logger.debug('Processing clipboard write request')
  const result = await handleClipboardWrite(request.text)

  // Write response to storage with timestamp
  const responseData: ClipboardWriteResponseData = {
    ...result,
    timestamp: request.timestamp
  }

  logger.debug('Writing response to storage')
  if (chrome?.storage?.local) {
    await chrome.storage.local.set({ '__CLEANCLIP_CLIPBOARD_RESPONSE__': responseData })
  } else {
    console.error('Chrome storage API not available')
  }
}

/**
 * Listen for clipboard write requests via storage polling
 */
function setupStorageListener() {
  if (chrome?.storage?.onChanged) {
    logger.debug('Setting up storage listener')
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes['__CLEANCLIP_CLIPBOARD_REQUEST__']?.newValue) {
        logger.debug('Clipboard request detected via storage')
        const request = changes['__CLEANCLIP_CLIPBOARD_REQUEST__'].newValue as ClipboardWriteRequestData
        processClipboardWriteRequest(request)
      }
    })
    logger.debug('Storage listener registered')
  } else {
    console.error('Chrome storage API not available for listener')
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logger.debug('DOM loaded, setting up listener')
    setupStorageListener()
  })
} else {
  setupStorageListener()
}

logger.debug('Offscreen clipboard document loaded')
