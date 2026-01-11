// CleanClip Popup Entry Point
import { getHistory } from '../history'
import { renderHistoryItems } from '../history-panel'

console.log('[Popup] Popup script loaded')

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

    console.log(`[Popup] Successfully loaded ${history.length} history items`)
  } catch (error) {
    console.error('[Popup] Failed to render history:', error)
    historyContainer.innerHTML = '<div class="history-error">Failed to load history</div>'
  }
}

// Auto-initialize when module is loaded
initPopup().catch(err => console.error('[Popup] Failed to initialize popup:', err))
