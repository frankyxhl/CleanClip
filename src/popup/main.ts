// CleanClip Popup Entry Point
import { getHistory } from '../history'
import { renderHistoryItems } from '../history-panel'
import { attachHistoryListeners } from '../history-panel/actions'

console.log('[Popup] Popup script loaded')

/**
 * Open detail page for a history item
 */
function openDetailPage(id: string): void {
  if (!chrome?.runtime || !chrome.tabs) {
    console.error('[Popup] Chrome APIs not available')
    return
  }
  const url = chrome.runtime.getURL(`src/detail/index.html?id=${id}`)
  console.log('[Popup] Opening detail page:', url)
  ;(chrome.tabs as any).create({ url })
}

/**
 * Open debug page for a history item
 */
function openDebugPage(id: string): void {
  if (!chrome?.runtime || !chrome.tabs) {
    console.error('[Popup] Chrome APIs not available')
    return
  }
  const url = chrome.runtime.getURL(`src/debug/index.html?id=${id}`)
  console.log('[Popup] Opening debug page:', url)
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
    console.warn('[Popup] History item has no ID')
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
  console.log('[Popup] Initializing popup...')

  // Always call getHistory to ensure it's called during initialization
  const history = await getHistory()
  console.log('[Popup] History loaded:', history.length, 'items')
  console.log('[Popup] History items:', history)

  const historyContainer = document.getElementById('history-container')

  if (!historyContainer) {
    console.error('[Popup] History container not found')
    return
  }

  try {
    console.log('[Popup] Rendering history items...')
    renderHistoryItems(historyContainer, history)
    console.log('[Popup] History rendered successfully')

    // Add data-empty-state attribute to empty state element if exists
    const emptyState = historyContainer.querySelector('.history-empty')
    if (emptyState) {
      emptyState.setAttribute('data-empty-state', '')
    }

    // Add data-history-item attributes to history items
    const historyItems = historyContainer.querySelectorAll('.history-item')
    console.log('[Popup] Found', historyItems.length, 'history item elements')
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

    console.log(`[Popup] Successfully loaded ${history.length} history items`)
  } catch (error) {
    console.error('[Popup] Failed to render history:', error)
    historyContainer.innerHTML = '<div class="history-error">Failed to load history</div>'
  }
}

// Auto-initialize when module is loaded
initPopup().catch(err => console.error('[Popup] Failed to initialize popup:', err))
