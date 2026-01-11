// CleanClip Popup Entry Point
import { logger } from '../logger'
import { getHistory } from '../history'
import { renderHistoryItems } from '../history-panel'

logger.debug('Popup loaded')

/**
 * Initialize the popup by loading and rendering history
 */
export async function initPopup(): Promise<void> {
  // Always call getHistory to ensure it's called during initialization
  const history = await getHistory()

  const historyContainer = document.getElementById('history-container')

  if (!historyContainer) {
    console.error('History container not found')
    return
  }

  try {
    renderHistoryItems(historyContainer, history)

    // Add data-empty-state attribute to empty state element if exists
    const emptyState = historyContainer.querySelector('.history-empty')
    if (emptyState) {
      emptyState.setAttribute('data-empty-state', '')
    }

    // Add data-history-item attributes to history items
    const historyItems = historyContainer.querySelectorAll('.history-item')
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

    logger.debug(`Loaded ${history.length} history items`)
  } catch (error) {
    console.error('Failed to render history:', error)
    historyContainer.innerHTML = '<div class="history-error">Failed to load history</div>'
  }
}

// Auto-initialize when module is loaded
initPopup().catch(err => console.error('Failed to initialize popup:', err))
