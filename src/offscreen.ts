/**
 * Offscreen Document Module
 * Phase 13.2: Create and manage offscreen document for clipboard operations
 *
 * In Chrome Extension Manifest V3, service workers cannot access navigator.clipboard
 * API directly. This module provides functions to create and manage an offscreen
 * document that can perform clipboard operations on behalf of the background script.
 *
 * Uses chrome.runtime.sendMessage for communication (recommended approach).
 */

import { logger } from './logger'

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

const OFFSCREEN_URL = 'offscreen.html'
const OFFSCREEN_REASON = 'CLIPBOARD' as const
const OFFSCREEN_JUSTIFICATION = 'CleanClip needs clipboard access to copy OCR results'

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
 * Wait for offscreen document to be ready by pinging it
 */
async function waitForOffscreenReady(maxRetries = 10, intervalMs = 200): Promise<boolean> {
  if (!chrome?.runtime?.sendMessage) {
    return false
  }
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'ping' })
      if (response?.pong) {
        console.log('[Offscreen Manager] Offscreen document is ready')
        return true
      }
    } catch {
      // Offscreen not ready yet, wait and retry
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  return false
}

/**
 * Task 13.2.2: Write text to clipboard via offscreen document
 * Uses chrome.runtime.sendMessage for communication
 * Phase 019 Task 2.5: Support custom MIME types
 */
export async function writeToClipboardViaOffscreen(
  text: string,
  customMimeTypes?: ClipboardMimeData[]
): Promise<ClipboardWriteResult> {
  try {
    console.log('[Offscreen Manager] writeToClipboardViaOffscreen called')
    console.log('[Offscreen Manager] Text length:', text.length)
    console.log('[Offscreen Manager] Custom MIME types:', customMimeTypes?.length || 0)

    // Ensure offscreen document exists
    await ensureOffscreenDocument()
    console.log('[Offscreen Manager] Offscreen document ensured')

    // Wait for offscreen to be ready
    console.log('[Offscreen Manager] Waiting for offscreen to be ready...')
    const isReady = await waitForOffscreenReady()

    if (!isReady) {
      // Fallback: check storage marker
      if (!chrome?.storage?.local) {
        return { success: false, error: 'Chrome storage API not available' }
      }
      const loadCheck = await chrome.storage.local.get('__OFFSCREEN_LOADED__')
      console.log('[Offscreen Manager] Offscreen load check:', loadCheck['__OFFSCREEN_LOADED__'] || 'NOT FOUND')

      if (!loadCheck['__OFFSCREEN_LOADED__']) {
        return {
          success: false,
          error: 'Offscreen document not ready'
        }
      }
    }

    // Send message to offscreen document
    if (!chrome?.runtime?.sendMessage) {
      return { success: false, error: 'Chrome runtime API not available' }
    }
    console.log('[Offscreen Manager] Sending clipboard-write message...')
    const response = await chrome.runtime.sendMessage({
      type: 'clipboard-write',
      text,
      customMimeTypes
    })

    console.log('[Offscreen Manager] Received response:', response)

    if (response?.success) {
      logger.debug('Clipboard write successful')
      return { success: true }
    } else {
      return {
        success: false,
        error: response?.error || 'Clipboard write failed'
      }
    }
  } catch (error) {
    console.error('[Offscreen Manager] Clipboard write error:', error)
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
