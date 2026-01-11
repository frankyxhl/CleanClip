/**
 * Offscreen Document Module
 * Phase 13.2: Create and manage offscreen document for clipboard operations
 *
 * In Chrome Extension Manifest V3, service workers cannot access navigator.clipboard
 * API directly. This module provides functions to create and manage an offscreen
 * document that can perform clipboard operations on behalf of the background script.
 */

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
 * Task 13.2.2: Write text to clipboard via offscreen document
 * Ensures offscreen document exists, then sends message to write text
 */
export async function writeToClipboardViaOffscreen(text: string): Promise<ClipboardWriteResult> {
  try {
    if (!chrome?.runtime) {
      throw new Error('Chrome runtime API not available')
    }

    // Ensure offscreen document exists
    await ensureOffscreenDocument()

    // Send message to offscreen document
    const response = await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_CLIPBOARD_WRITE',
      text,
    })

    return response as ClipboardWriteResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error writing to clipboard',
    }
  }
}

/**
 * Task 13.2.3: Read text from clipboard via offscreen document
 * Ensures offscreen document exists, then sends message to read text
 */
export async function readFromClipboardViaOffscreen(): Promise<ClipboardReadResult> {
  try {
    if (!chrome?.runtime) {
      throw new Error('Chrome runtime API not available')
    }

    // Ensure offscreen document exists
    await ensureOffscreenDocument()

    // Send message to offscreen document
    const response = await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_CLIPBOARD_READ',
    })

    return response as ClipboardReadResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error reading from clipboard',
    }
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
