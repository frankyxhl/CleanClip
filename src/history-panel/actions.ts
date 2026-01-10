// History Panel Actions for CleanClip
// Copy and delete operations for history items

import { deleteFromHistory } from '../history'

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(
  text: string,
  container?: HTMLElement
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)

    // Show success message if container provided
    if (container) {
      showCopySuccess(container)
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw error
  }
}

/**
 * Show copy success message
 */
function showCopySuccess(container: HTMLElement): void {
  const existingMessage = container.querySelector('.copy-success')
  if (existingMessage) {
    existingMessage.remove()
  }

  const message = document.createElement('div')
  message.className = 'copy-success'
  message.textContent = 'Copied!'
  container.appendChild(message)

  setTimeout(() => {
    message.remove()
  }, 2000)
}

/**
 * Delete history item
 */
export async function deleteItem(
  id: string,
  container: HTMLElement
): Promise<void> {
  try {
    // Remove from storage
    await deleteFromHistory(id)

    // Remove from DOM
    const itemElement = container.querySelector(`[data-id="${id}"]`)
    if (itemElement) {
      itemElement.remove()
    }

    // Check if list is empty and show empty message
    const listElement = container.querySelector('.history-list') as HTMLElement
    if (listElement && listElement.children.length === 0) {
      listElement.innerHTML = '<div class="history-empty">No history yet</div>'
    }
  } catch (error) {
    console.error('Failed to delete item:', error)
    throw error
  }
}

/**
 * Attach event listeners to history items
 */
export function attachHistoryListeners(
  container: HTMLElement,
  onItemClick?: (action: string, id: string, text: string) => void
): void {
  container.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const action = target.getAttribute('data-action')
    const itemElement = target.closest('.history-item') as HTMLElement
    const id = itemElement?.getAttribute('data-id')
    const textElement = itemElement?.querySelector('.history-item-text') as HTMLElement
    const text = textElement?.textContent || ''

    if (action && id) {
      if (action === 'copy') {
        copyToClipboard(text, container)
        if (onItemClick) {
          onItemClick(action, id, text)
        }
      } else if (action === 'delete') {
        deleteItem(id, container)
        if (onItemClick) {
          onItemClick(action, id, text)
        }
      }
    }
  })
}
