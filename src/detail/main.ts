// Detail Page Main Script for CleanClip
// Loads and displays OCR result details

import { getHistory } from '../history.js'
import { recognizeImage } from '../ocr.js'

interface HistoryItem {
  id: string
  text: string
  timestamp: number
  imageUrl: string
  debug?: {
    originalImageUrl: string
    selection: { x: number; y: number; width: number; height: number }
    originalSize: { width: number; height: number }
    devicePixelRatio: number
    zoomLevel: number
  }
}

/**
 * Get history ID from URL parameters
 */
export function getHistoryIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('id')
}

/**
 * Load history item from storage by ID
 */
export async function loadHistoryItem(id: string): Promise<HistoryItem | null> {
  const history = await getHistory()
  return history.find(item => item.id === id) || null
}

/**
 * Display the cropped screenshot image
 */
export function displayScreenshot(imageUrl: string): void {
  const screenshotImg = document.querySelector('[data-screenshot-image]') as HTMLImageElement
  if (screenshotImg) {
    screenshotImg.src = imageUrl
  }
}

/**
 * Display extracted text in the textarea
 */
export function displayText(text: string): void {
  const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
  if (textInput) {
    textInput.value = text
  }
}

/**
 * Show error message and hide detail page
 */
export function showError(message: string): void {
  const detailPage = document.querySelector('[data-detail-page]') as HTMLElement
  const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

  if (detailPage) {
    detailPage.classList.add('hidden')
  }

  if (errorMessage) {
    errorMessage.classList.remove('hidden')
    const titleElement = errorMessage.querySelector('h1')

    if (titleElement) {
      titleElement.textContent = message
    }
  }
}

/**
 * Show notification message
 */
export function showNotification(message: string): void {
  const notification = document.querySelector('[data-notification]') as HTMLElement
  const notificationMessage = document.querySelector('[data-notification-message]') as HTMLElement

  if (notification && notificationMessage) {
    notificationMessage.textContent = message
    notification.classList.remove('hidden')

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('hidden')
    }, 3000)
  }
}

/**
 * Save edited text to history
 */
export async function saveEditedText(): Promise<void> {
  const historyId = getHistoryIdFromUrl()

  if (!historyId) {
    showError('History item not found')
    return
  }

  // Get the edited text from textarea
  const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
  if (!textInput) {
    return
  }

  const editedText = textInput.value

  // Get current history from storage
  const history = await getHistory()

  // Find and update the specific history item
  const updatedHistory = history.map(item => {
    if (item.id === historyId) {
      return {
        ...item,
        text: editedText
      }
    }
    return item
  })

  // Save updated history to chrome.storage.local
  if (chrome?.storage?.local) {
    await chrome.storage.local.set({
      cleanclip_history: updatedHistory
    })

    // Show success notification
    showNotification('Text saved successfully')
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
 * Re-OCR the image and update history
 */
export async function reOcrImage(): Promise<void> {
  const historyId = getHistoryIdFromUrl()

  if (!historyId) {
    showError('History item not found')
    return
  }

  try {
    // Get current history from storage
    const history = await getHistory()
    const historyItem = history.find(item => item.id === historyId)

    if (!historyItem) {
      showError('History item not found')
      return
    }

    // Get API key from storage
    const apiKey = await getApiKey()

    if (!apiKey) {
      showNotification('API Key not configured')
      return
    }

    // Determine which image to use for Re-OCR
    // Use originalImageUrl if available (debug mode), otherwise use imageUrl
    const imageUrl = historyItem.debug?.originalImageUrl || historyItem.imageUrl

    // Show loading notification
    showNotification('Re-OCR in progress...')

    // Call OCR API
    const result = await recognizeImage(imageUrl, 'text', apiKey)

    // Update history item with new OCR result
    const updatedHistory = history.map(item => {
      if (item.id === historyId) {
        return {
          ...item,
          text: result.text
        }
      }
      return item
    })

    // Save updated history to chrome.storage.local
    if (chrome?.storage?.local) {
      await chrome.storage.local.set({
        cleanclip_history: updatedHistory
      })

      // Update the text input with new result
      displayText(result.text)

      // Show success notification
      showNotification('Re-OCR completed successfully')
    }
  } catch (error) {
    console.error('Re-OCR failed:', error)
    showNotification('Re-OCR failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Set up Re-OCR button functionality
 */
function setupReOcrButton(): void {
  const reocrButton = document.querySelector('[data-reocr-button]') as HTMLButtonElement

  if (reocrButton) {
    reocrButton.addEventListener('click', async () => {
      await reOcrImage()
    })
  }
}

/**
 * Set up save button functionality
 */
function setupSaveButton(): void {
  const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      await saveEditedText()
    })
  }
}

/**
 * Set up copy button functionality
 */
export function setupCopyButton(): void {
  const copyButton = document.querySelector('[data-copy-button]') as HTMLButtonElement

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      // Get the textarea element
      const textarea = document.querySelector('[data-text-input]') as HTMLTextAreaElement

      if (textarea && navigator.clipboard) {
        try {
          // Copy the text content to clipboard
          await navigator.clipboard.writeText(textarea.value)
          // Show success notification
          showNotification('Text copied to clipboard')
        } catch (error) {
          // Show error notification
          showNotification('Failed to copy text')
        }
      }
    })
  }
}

/**
 * Initialize the detail page
 */
async function init(): Promise<void> {
  // Set up event listeners immediately (synchronous)
  setupToggleButtons()
  setupSaveButton()
  setupReOcrButton()
  setupCopyButton()

  const historyId = getHistoryIdFromUrl()

  if (!historyId) {
    showError('History item not found')
    return
  }

  const historyItem = await loadHistoryItem(historyId)

  if (!historyItem) {
    showError('History item not found')
    return
  }

  // Display the screenshot
  displayScreenshot(historyItem.imageUrl)

  // Display the text
  displayText(historyItem.text)
}

// Export init for testing purposes
export { init }

/**
 * Set up Text/Markdown toggle functionality
 */
function setupToggleButtons(): void {
  const textToggle = document.querySelector('[data-toggle-text]') as HTMLButtonElement
  const markdownToggle = document.querySelector('[data-toggle-markdown]') as HTMLButtonElement
  const textInput = document.querySelector('[data-text-input]') as HTMLElement
  const markdownPreview = document.querySelector('[data-markdown-preview]') as HTMLElement

  // Set up elements individually if they exist
  if (textInput) {
    textInput.style.display = 'block'
  }

  if (markdownPreview) {
    markdownPreview.style.display = 'none'
  }

  if (textToggle && markdownToggle && textInput && markdownPreview) {
    // Default to Text mode
    textToggle.classList.add('active')
    markdownToggle.classList.remove('active')
    textInput.classList.remove('hidden')
    markdownPreview.classList.add('hidden')

    // Text toggle handler
    textToggle.addEventListener('click', () => {
      textToggle.classList.add('active')
      markdownToggle.classList.remove('active')
      textInput.classList.remove('hidden')
      markdownPreview.classList.add('hidden')
      textInput.style.display = 'block'
      markdownPreview.style.display = 'none'
    })

    // Markdown toggle handler
    markdownToggle.addEventListener('click', () => {
      markdownToggle.classList.add('active')
      textToggle.classList.remove('active')
      markdownPreview.classList.remove('hidden')
      textInput.classList.add('hidden')
      markdownPreview.style.display = 'block'
      textInput.style.display = 'none'

      // Update markdown preview with current text
      const textarea = textInput as HTMLTextAreaElement
      markdownPreview.innerHTML = simpleMarkdownParse(textarea.value)
    })
  }
}

/**
 * Simple markdown parser for preview
 * This is a basic implementation that handles common markdown syntax
 */
function simpleMarkdownParse(text: string): string {
  if (!text) return ''

  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Line breaks
    .replace(/\n/gim, '<br>')
}

// Initialize immediately for both browser and test environments
// In tests, this will run when the module is imported
init()

// Set up initial styles for toggle buttons immediately
// This ensures the styles are set even if init() hasn't completed yet
requestAnimationFrame(() => {
  const textInput = document.querySelector('[data-text-input]') as HTMLElement
  const markdownPreview = document.querySelector('[data-markdown-preview]') as HTMLElement

  if (textInput) {
    textInput.style.display = 'block'
  }

  if (markdownPreview) {
    markdownPreview.style.display = 'none'
  }
})
