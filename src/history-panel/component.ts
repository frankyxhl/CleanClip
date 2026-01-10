// History Panel Component for CleanClip
// Renders history items with copy and delete actions

import type { HistoryItem } from '../history'

const COPY_BUTTON_HTML = `
  <button class="history-copy-btn" data-action="copy" title="Copy to clipboard">
    📋
  </button>
`

const DELETE_BUTTON_HTML = `
  <button class="history-delete-btn" data-action="delete" title="Delete">
    🗑️
  </button>
`

/**
 * Create a history item element
 */
function createHistoryItemElement(item: HistoryItem): HTMLElement {
  const div = document.createElement('div')
  div.className = 'history-item'
  div.setAttribute('data-id', item.id)

  const timestamp = new Date(item.timestamp).toLocaleString()

  div.innerHTML = `
    <div class="history-item-content">
      <div class="history-item-text">${escapeHtml(item.text)}</div>
      <div class="history-item-meta">
        <span class="history-item-timestamp">${timestamp}</span>
      </div>
    </div>
    <div class="history-item-actions">
      ${COPY_BUTTON_HTML}
      ${DELETE_BUTTON_HTML}
    </div>
  `

  return div
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Render history items to a container
 */
export function renderHistoryItems(container: HTMLElement, items: HistoryItem[]): void {
  container.innerHTML = ''

  if (items.length === 0) {
    container.innerHTML = '<div class="history-empty">No history yet</div>'
    return
  }

  items.forEach(item => {
    const element = createHistoryItemElement(item)
    container.appendChild(element)
  })
}

/**
 * Create history panel container
 */
export function createHistoryPanel(): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'history-panel'
  panel.innerHTML = `
    <div class="history-header">
      <h2>History</h2>
    </div>
    <div class="history-list"></div>
  `
  return panel
}

/**
 * History Panel class for managing the panel state
 */
export class HistoryPanel {
  private container: HTMLElement
  private listElement: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    const panel = createHistoryPanel()
    this.listElement = panel.querySelector('.history-list') as HTMLElement
    this.container.appendChild(panel)
  }

  /**
   * Update history list with new items
   */
  update(items: HistoryItem[]): void {
    renderHistoryItems(this.listElement, items)
  }

  /**
   * Get the list element
   */
  getListElement(): HTMLElement {
    return this.listElement
  }
}
