// CleanClip Popup Entry Point
import { getHistory } from '../history'
import { renderHistoryItems } from '../history-panel'
import { attachHistoryListeners } from '../history-panel/actions'
import { logger } from '../logger'

logger.debug('Popup script loaded')

/**
 * Open detail page for a history item
 */
function openDetailPage(id: string): void {
  if (!chrome?.runtime || !chrome.tabs) {
    console.error('Chrome APIs not available')
    return
  }
  const url = chrome.runtime.getURL(`src/detail/index.html?id=${id}`)
  logger.debug('Opening detail page:', url)
  ;(chrome.tabs as any).create({ url })
}

/**
 * Open debug page for a history item
 */
function openDebugPage(id: string): void {
  if (!chrome?.runtime || !chrome.tabs) {
    console.error('Chrome APIs not available')
    return
  }
  const url = chrome.runtime.getURL(`src/debug/index.html?id=${id}`)
  logger.debug('Opening debug page:', url)
  ;(chrome.tabs as any).create({ url })
}

/**
 * Handle history item click
 */
function handleHistoryItemClick(event: Event): void {
  const target = event.target as HTMLElement
  const historyItem = target.closest('.history-item') as HTMLElement

  if (!historyItem) {
    return
  }

  // Check if click originated from an action button
  const actionButton = target.closest('[data-action]')
  if (actionButton) {
    // Let the action button handler deal with it
    return
  }

  const id = historyItem.getAttribute('data-id')
  if (!id) {
    logger.debug('History item has no ID')
    return
  }

  // Check for right-click (contextmenu event)
  if (event.type === 'contextmenu') {
    event.preventDefault()
    openDebugPage(id)
    return
  }

  // Check for Shift+click
  const mouseEvent = event as MouseEvent
  if (mouseEvent.shiftKey) {
    openDebugPage(id)
    return
  }

  // Default: open detail page
  openDetailPage(id)
}

/**
 * Initialize the popup by loading and rendering history
 */
export async function initPopup(): Promise<void> {
  logger.debug('Initializing popup...')

  // Always call getHistory to ensure it's called during initialization
  const history = await getHistory()
  logger.debug('History loaded:', history.length, 'items')
  logger.debug('History items:', history)

  const historyContainer = document.getElementById('history-container')

  if (!historyContainer) {
    console.error('History container not found')
    return
  }

  try {
    logger.debug('Rendering history items...')
    renderHistoryItems(historyContainer, history)
    logger.debug('History rendered successfully')

    // Add data-empty-state attribute to empty state element if exists
    const emptyState = historyContainer.querySelector('.history-empty')
    if (emptyState) {
      emptyState.setAttribute('data-empty-state', '')
    }

    // Add data-history-item attributes to history items
    const historyItems = historyContainer.querySelectorAll('.history-item')
    logger.debug('Found', historyItems.length, 'history item elements')
    historyItems.forEach((item) => {
      const historyItem = item as HTMLElement
      const id = historyItem.getAttribute('data-id')
      if (id) {
        historyItem.setAttribute('data-history-item', id)
      }

      // Add data-timestamp attribute to timestamp elements
      const timestampElement = historyItem.querySelector('.history-item-timestamp')
      if (timestampElement) {
        timestampElement.setAttribute('data-timestamp', '')
      }
    })

    // Attach click listeners for navigation
    historyContainer.addEventListener('click', handleHistoryItemClick)
    historyContainer.addEventListener('contextmenu', handleHistoryItemClick)

    // Attach action button listeners (copy, delete)
    attachHistoryListeners(historyContainer)

    logger.debug(`Successfully loaded ${history.length} history items`)
  } catch (error) {
    console.error('Failed to render history:', error)
    historyContainer.innerHTML = '<div class="history-error">Failed to load history</div>'
  }
}

// Auto-initialize when module is loaded
initPopup().catch(err => console.error('Failed to initialize popup:', err))
