/**
 * Offscreen Clipboard Script
 * Phase 13.2: Handle clipboard operations in offscreen document
 *
 * This script runs in the offscreen document context where navigator.clipboard
 * is available. It uses storage polling to communicate with background script.
 */

import { logger } from '../logger'

// Clipboard communication keys (internal only)
// Values must match offscreen.ts
const CLIPBOARD_REQUEST_KEY = '__CLEANCLIP_CLIPBOARD_REQUEST__'
const CLIPBOARD_RESPONSE_KEY = '__CLEANCLIP_CLIPBOARD_RESPONSE__'

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
    await chrome.storage.local.set({ [CLIPBOARD_RESPONSE_KEY]: responseData })
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
      if (areaName === 'local' && changes[CLIPBOARD_REQUEST_KEY]?.newValue) {
        logger.debug('Clipboard request detected via storage')
        const request = changes[CLIPBOARD_REQUEST_KEY].newValue as ClipboardWriteRequestData
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
