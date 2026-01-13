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
 * Format timestamp into human-readable string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string (e.g., "Just now", "5m ago", "2h ago", "Jan 15")
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}m ago`
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h ago`
  }

  // Older than 24 hours - show date
  const date = new Date(timestamp)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  return `${month} ${day}`
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
 * Local helper - intentionally not imported from background.ts to avoid side effects
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
 * Update active state in history navigation
 */
export function updateActiveState(newId: string): void {
  // Remove active class from all history items
  const allItems = document.querySelectorAll('[data-history-item]')
  allItems.forEach(item => {
    item.classList.remove('active')
  })

  // Add active class to the new item
  const newItem = document.querySelector(`[data-history-id="${newId}"]`)
  if (newItem) {
    newItem.classList.add('active')
  }
}

/**
 * Load history item dynamically without page reload
 */
export async function loadHistoryItemDynamic(id: string): Promise<void> {
  // Load the history item from storage
  const historyItem = await loadHistoryItem(id)

  if (!historyItem) {
    showError('History item not found')
    return
  }

  // Update the text content
  displayText(historyItem.text)

  // Update the screenshot
  displayScreenshot(historyItem.imageUrl)

  // Update URL without reloading the page
  const newUrl = new URL(window.location.href)
  newUrl.searchParams.set('id', id)

  // Use pushState for proper browser history support
  // In Happy-DOM test environment, this might fail due to origin restrictions
  try {
    window.history.pushState({ id }, '', newUrl.toString())
  } catch (error) {
    // Test environment fallback - update search params directly
    // This allows tests to verify URL parameter changes
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set('id', id)
    // Update the search property directly (no page reload in Happy-DOM)
    window.location.search = urlParams.toString()
  }

  // Update the active state in navigation
  updateActiveState(id)
}

/**
 * Render history navigation sidebar
 */
export async function renderHistoryNavigation(): Promise<void> {
  const historyNav = document.querySelector('[data-history-nav]') as HTMLElement
  if (!historyNav) {
    return
  }

  // Get current history ID from URL
  const currentId = getHistoryIdFromUrl()

  // Get all history items
  const history = await getHistory()

  // Clear existing content
  historyNav.innerHTML = ''

  // Render each history item
  history.forEach(item => {
    const historyItem = document.createElement('div')
    historyItem.setAttribute('data-history-item', '')
    historyItem.setAttribute('data-history-id', item.id)

    // Add active class if this is the current item
    if (item.id === currentId) {
      historyItem.classList.add('active')
    }

    // Create timestamp element
    const timestamp = document.createElement('div')
    timestamp.setAttribute('data-history-timestamp', '')
    timestamp.textContent = formatTimestamp(item.timestamp)

    // Create text preview element (max 2 lines)
    const textPreview = document.createElement('div')
    textPreview.setAttribute('data-history-text-preview', '')
    textPreview.textContent = item.text
    textPreview.style.cssText = `
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `

    // Append elements to history item
    historyItem.appendChild(timestamp)
    historyItem.appendChild(textPreview)

    // Add click event listener for dynamic content switching
    historyItem.addEventListener('click', () => {
      loadHistoryItemDynamic(item.id)
    })

    // Append to history nav
    historyNav.appendChild(historyItem)
  })
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

  // Render history navigation
  await renderHistoryNavigation()
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
 * Escape HTML special characters to prevent XSS attacks
 * CRITICAL: This must be called FIRST before any markdown processing
 * @param unsafe - String that may contain HTML characters
 * @returns HTML-escaped string safe for rendering
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Check if a URL protocol is safe
 * @param url - URL to check
 * @returns true if safe, false if dangerous
 */
function isSafeUrl(url: string): boolean {
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = url.toLowerCase().trim()

  // Check if URL starts with any dangerous protocol
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return false
    }
  }

  // Safe protocols: https:, http:, mailto:, or relative URLs (no protocol)
  return true
}

/**
 * Simple markdown parser for preview
 * This is a basic implementation that handles common markdown syntax
 * CRITICAL: HTML escaping happens FIRST to prevent XSS attacks
 */
export function simpleMarkdownParse(text: string): string {
  if (!text) return ''

  // CRITICAL: Escape HTML FIRST to prevent XSS attacks
  // This is the most important security step - all angle brackets must be escaped
  let safeText = escapeHtml(text)

  // STEP 1: Extract code blocks to protect them from markdown processing
  // We'll replace them with placeholders and restore them after processing
  const codeBlocks: string[] = []
  safeText = safeText.replace(/```([\s\S]*?)```/gim, (_match, code) => {
    codeBlocks.push(code)
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`
  })

  // STEP 2: Process horizontal rules (must be on their own line)
  // Match --- or *** that are on their own line (possibly with trailing spaces)
  safeText = safeText.replace(/^(\s*)(---|\*\*\*)(\s*)$/gim, '$1<hr>$3')

  // STEP 3: Process blockquotes
  // Group consecutive > lines together and wrap in <blockquote>
  const lines = safeText.split('\n')
  let inBlockquote = false
  const processedLines: string[] = []
  const blockquoteLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBlockquote = /^&gt;\s*(.*)$/.test(line)

    if (isBlockquote) {
      // Extract the content after > (already escaped as &gt;)
      const content = line.replace(/^&gt;\s*/, '')
      blockquoteLines.push(content)
      inBlockquote = true
    } else {
      if (inBlockquote) {
        // Close the blockquote
        processedLines.push('<blockquote>' + blockquoteLines.join('<br>') + '</blockquote>')
        blockquoteLines.length = 0
        inBlockquote = false
      }
      processedLines.push(line)
    }
  }

  // Handle unclosed blockquote at end
  if (inBlockquote) {
    processedLines.push('<blockquote>' + blockquoteLines.join('<br>') + '</blockquote>')
  }

  safeText = processedLines.join('\n')

  // STEP 4: Process lists (both ordered and unordered)
  // We need to group consecutive list items
  const listLines = safeText.split('\n')
  const finalLines: string[] = []
  let inUnorderedList = false
  let inOrderedList = false
  const listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  for (const line of listLines) {
    const unorderedMatch = /^[-*]\s+(.*)$/.exec(line)
    const orderedMatch = /^\d+\.\s+(.*)$/.exec(line)

    if (unorderedMatch) {
      if (!inUnorderedList) {
        // Close any open list
        if (inOrderedList) {
          finalLines.push('<ol>' + listItems.join('') + '</ol>')
          listItems.length = 0
        }
        inUnorderedList = true
        inOrderedList = false
        listType = 'ul'
      }
      listItems.push('<li>' + unorderedMatch[1] + '</li>')
    } else if (orderedMatch) {
      if (!inOrderedList) {
        // Close any open list
        if (inUnorderedList) {
          finalLines.push('<ul>' + listItems.join('') + '</ul>')
          listItems.length = 0
        }
        inOrderedList = true
        inUnorderedList = false
        listType = 'ol'
      }
      listItems.push('<li>' + orderedMatch[1] + '</li>')
    } else {
      // Close any open list
      if (inUnorderedList || inOrderedList) {
        finalLines.push('<' + listType + '>' + listItems.join('') + '</' + listType + '>')
        listItems.length = 0
        inUnorderedList = false
        inOrderedList = false
        listType = null
      }
      finalLines.push(line)
    }
  }

  // Handle unclosed list at end
  if (inUnorderedList || inOrderedList) {
    finalLines.push('<' + listType + '>' + listItems.join('') + '</' + listType + '>')
  }

  safeText = finalLines.join('\n')

  // STEP 5: Links with security filtering - process BEFORE other markdown
  // This regex matches [text](url) and extracts both parts
  safeText = safeText.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, (_match, text, url) => {
    // Check if URL is safe
    if (isSafeUrl(url)) {
      // Safe URL - render as clickable link with security attributes
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    } else {
      // Dangerous URL - render as plain text (just the link text, no URL)
      // This prevents dangerous protocols from appearing in output
      return text
    }
  })

  // STEP 6: Headers
  safeText = safeText.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  safeText = safeText.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  safeText = safeText.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // STEP 7: Bold and italic (non-greedy to avoid over-matching)
  safeText = safeText.replace(/\*\*(.+?)\*\*/gim, '<strong>$1</strong>')
  safeText = safeText.replace(/\*(.+?)\*/gim, '<em>$1</em>')

  // STEP 8: Inline code (after extracting blocks, so we don't match inside code blocks)
  safeText = safeText.replace(/`([^`]+)`/gim, '<code>$1</code>')

  // STEP 9: Convert newlines to <br>, but protect block elements
  // Split by newlines and process each line
  const outputLines = safeText.split('\n')
  const finalOutput: string[] = []

  for (const line of outputLines) {
    const trimmed = line.trim()

    // Empty line - add as <br> unless it's between block elements
    if (trimmed === '') {
      finalOutput.push('<br>')
      continue
    }

    // Check if this line starts or ends a block element
    const isBlockStart = /^<(ul|ol|li|blockquote|hr|h[1-6]|pre)>/.test(trimmed)
    const isBlockEnd = /^<\/(ul|ol|li|blockquote|hr|h[1-6]|pre)>/.test(trimmed)
    const isCodeBlockPlaceholder = /^__CODE_BLOCK_\d+__$/.test(trimmed)

    if (isBlockStart || isBlockEnd || isCodeBlockPlaceholder) {
      // Block element - don't add <br>
      finalOutput.push(line)
    } else if (/^<[a-z]/.test(trimmed) && trimmed.endsWith('>')) {
      // HTML tag on its own line - don't add <br>
      finalOutput.push(line)
    } else {
      // Regular text - add <br> after it (will be joined)
      finalOutput.push(line)
    }
  }

  // Join with <br>, then clean up extra <br> around block elements
  let result = finalOutput.join('<br>')
  // Remove <br> immediately before opening block tags
  result = result.replace(/<br>\s*(<(ul|ol|li|blockquote|hr|h[1-6]|pre)>)/g, '$1')
  // Remove <br> immediately after closing block tags
  result = result.replace(/(<\/(ul|ol|li|blockquote|hr|h[1-6]|pre)>)\s*<br>/g, '$1')
  // Remove <br> before/after code block placeholders
  result = result.replace(/<br>\s*(__CODE_BLOCK_\d+__)/g, '$1')
  result = result.replace(/(__CODE_BLOCK_\d+__)\s*<br>/g, '$1')

  // STEP 10: Restore code blocks with <pre><code> tags (without <br> inside)
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    const code = codeBlocks[parseInt(index)]
    // Preserve newlines in code blocks without converting to <br>
    return '<pre><code>' + code + '</code></pre>'
  })

  return result
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
