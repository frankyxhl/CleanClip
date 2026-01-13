/**
 * Offscreen Document Module
 * Phase 13.2: Create and manage offscreen document for clipboard operations
 *
 * In Chrome Extension Manifest V3, service workers cannot access navigator.clipboard
 * API directly. This module provides functions to create and manage an offscreen
 * document that can perform clipboard operations on behalf of the background script.
 *
 * Uses storage polling pattern for communication (sendMessage doesn't work from
 * background to offscreen documents).
 */

import { logger } from './logger'

interface ClipboardWriteResult {
  success: boolean
  error?: string
}

interface ClipboardReadResult {
  success: boolean
  text?: string
  error?: string
}

const OFFSCREEN_URL = 'src/offscreen/clipboard.html'
const OFFSCREEN_REASON = 'CLIPBOARD' as const
const OFFSCREEN_JUSTIFICATION = 'CleanClip needs clipboard access to copy OCR results'

// Clipboard communication keys (internal only, not exported)
// Values must match offscreen/clipboard.ts
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
 * Task 13.2.1: Ensure offscreen document exists
 * Creates a new offscreen document if one doesn't already exist
 */
export async function ensureOffscreenDocument(): Promise<void> {
  if (!chrome?.offscreen) {
    throw new Error('Chrome offscreen API not available')
  }

  // Check if offscreen document already exists
  if (chrome.offscreen.hasDocument()) {
    return
  }

  // Create offscreen document
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [OFFSCREEN_REASON],
      justification: OFFSCREEN_JUSTIFICATION,
    })
  } catch (error) {
    // If document already exists (race condition), ignore error
    if (
      error instanceof Error &&
      (error.message.includes('already exists') ||
        error.message.includes('Only one offscreen document may exist'))
    ) {
      return
    }
    throw error
  }
}

/**
 * Poll for a response in storage
 * Internal helper, not exported
 * Caller must verify chrome.storage.local exists before calling
 */
async function pollForResponse<T>(
  key: string,
  checkFn: (result: T) => boolean,
  maxRetries = 50,
  intervalMs = 100
): Promise<T | null> {
  let retries = maxRetries
  while (retries > 0) {
    await new Promise(resolve => setTimeout(resolve, intervalMs))
    // Non-null assertion safe: caller verifies chrome.storage.local exists
    const result = await chrome!.storage.local.get(key)
    const value = result[key] as T | undefined
    if (value && checkFn(value)) {
      return value
    }
    retries--
  }
  return null
}

/**
 * Task 13.2.2: Write text to clipboard via offscreen document
 * Uses storage polling pattern for communication
 */
export async function writeToClipboardViaOffscreen(text: string): Promise<ClipboardWriteResult> {
  try {
    if (!chrome?.storage?.local) {
      throw new Error('Chrome storage API not available')
    }

    logger.debug('writeToClipboardViaOffscreen called')

    // Ensure offscreen document exists
    await ensureOffscreenDocument()
    logger.debug('Offscreen document ensured')

    // Wait a bit for offscreen to be ready
    await new Promise(resolve => setTimeout(resolve, 500))

    // Write request to storage
    const timestamp = Date.now()
    const request: ClipboardWriteRequestData = {
      text,
      timestamp
    }

    logger.debug('Writing clipboard request to storage')
    await chrome.storage.local.set({ [CLIPBOARD_REQUEST_KEY]: request })

    // Poll for response
    logger.debug('Waiting for clipboard response...')
    const response = await pollForResponse<ClipboardWriteResponseData>(
      CLIPBOARD_RESPONSE_KEY,
      r => r.timestamp === timestamp
    )

    if (!response) {
      logger.debug('Clipboard request timeout')
      return {
        success: false,
        error: 'Clipboard request timeout'
      }
    }

    // Clear the response
    await chrome.storage.local.remove(CLIPBOARD_RESPONSE_KEY)

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Clipboard write failed'
      }
    }

    logger.debug('Clipboard write successful')
    return {
      success: true
    }
  } catch (error) {
    logger.debug('Clipboard write error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error writing to clipboard',
    }
  }
}

/**
 * Task 13.2.3: Read text from clipboard via offscreen document
 * Note: Not currently used, kept for future implementation
 */
export async function readFromClipboardViaOffscreen(): Promise<ClipboardReadResult> {
  return {
    success: false,
    error: 'Clipboard read not implemented'
  }
}

/**
 * Task 13.2.4: Close offscreen document
 * Closes the offscreen document if it exists
 */
export async function closeOffscreenDocument(): Promise<void> {
  try {
    if (!chrome?.offscreen) {
      return
    }

    if (chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument()
    }
  } catch (error) {
    // Ignore errors if document doesn't exist
    if (
      error instanceof Error &&
      !error.message.includes('No offscreen document')
    ) {
      throw error
    }
  }
}
