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

const CLIPBOARD_REQUEST_KEY = '__CLEANCLIP_CLIPBOARD_REQUEST__'
const CLIPBOARD_RESPONSE_KEY = '__CLEANCLIP_CLIPBOARD_RESPONSE__'

export interface ClipboardMimeData {
  mimeType: string
  data: string
}

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
 * Poll for a result in chrome.storage.local
 * Used for offscreen document communication
 */
async function pollForResult<T>(
  key: string,
  checkFn: (result: T) => boolean,
  maxRetries = 50,
  intervalMs = 100
): Promise<T | null> {
  let retries = maxRetries
  while (retries > 0) {
    await new Promise(resolve => setTimeout(resolve, intervalMs))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const result = await chrome?.storage?.local?.get(key)
    const value = (result as Record<string, T> | undefined)?.[key]
    if (value && checkFn(value)) {
      return value
    }
    retries--
  }
  return null
}

/**
 * Task 13.2.1: Ensure offscreen document exists
 * Creates a new offscreen document if one doesn't already exist
 */
export async function ensureOffscreenDocument(): Promise<void> {
  console.log('[Offscreen Manager] ensureOffscreenDocument called')
  if (!chrome?.offscreen) {
    console.error('[Offscreen Manager] Chrome offscreen API not available')
    throw new Error('Chrome offscreen API not available')
  }

  // Check if offscreen document already exists
  const hasDoc = await chrome.offscreen.hasDocument()
  console.log('[Offscreen Manager] hasDocument:', hasDoc)
  if (hasDoc) {
    console.log('[Offscreen Manager] Document already exists, skipping creation')
    return
  }

  // Create offscreen document
  try {
    console.log('[Offscreen Manager] Creating offscreen document:', OFFSCREEN_URL)
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [OFFSCREEN_REASON],
      justification: OFFSCREEN_JUSTIFICATION,
    })
    console.log('[Offscreen Manager] Offscreen document created successfully')
  } catch (error) {
    console.error('[Offscreen Manager] Error creating document:', error)
    // If document already exists (race condition), ignore error
    if (
      error instanceof Error &&
      (error.message.includes('already exists') ||
        error.message.includes('Only one offscreen document may exist'))
    ) {
      console.log('[Offscreen Manager] Document already exists (race condition), continuing')
      return
    }
    throw error
  }
}

/**
 * Task 13.2.2: Write text to clipboard via offscreen document
 * Uses storage polling pattern for communication
 * Phase 019 Task 2.5: Support custom MIME types
 */
export async function writeToClipboardViaOffscreen(
  text: string,
  customMimeTypes?: ClipboardMimeData[]
): Promise<ClipboardWriteResult> {
  try {
    if (!chrome?.storage?.local) {
      throw new Error('Chrome storage API not available')
    }

    console.log('[Offscreen Manager] writeToClipboardViaOffscreen called')
    console.log('[Offscreen Manager] Text length:', text.length)
    console.log('[Offscreen Manager] Custom MIME types:', customMimeTypes?.length || 0)

    // Ensure offscreen document exists
    await ensureOffscreenDocument()
    console.log('[Offscreen Manager] Offscreen document ensured')

    // Wait a bit for offscreen to be ready
    console.log('[Offscreen Manager] Waiting 500ms for offscreen to be ready...')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if offscreen script actually loaded
    const loadCheck = await chrome.storage.local.get('__OFFSCREEN_LOADED__')
    console.log('[Offscreen Manager] Offscreen load check:', loadCheck['__OFFSCREEN_LOADED__'] || 'NOT FOUND')

    // Write request to storage
    const timestamp = Date.now()
    const request: ClipboardWriteRequestData = {
      text,
      timestamp,
      customMimeTypes
    }

    console.log('[Offscreen Manager] Writing clipboard request to storage, timestamp:', timestamp)
    await chrome.storage.local.set({ [CLIPBOARD_REQUEST_KEY]: request })
    console.log('[Offscreen Manager] Request written to storage')

    // Poll for response
    console.log('[Offscreen Manager] Polling for clipboard response...')
    const response = await pollForResult<ClipboardWriteResponseData>(
      CLIPBOARD_RESPONSE_KEY,
      (r) => r.timestamp === timestamp
    )

    if (response) {
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
    }

    logger.debug('Clipboard request timeout')
    return {
      success: false,
      error: 'Clipboard request timeout'
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
