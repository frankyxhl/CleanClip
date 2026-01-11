// History Module for CleanClip
// Manages persistent storage of OCR results

export interface HistoryItem {
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

const HISTORY_STORAGE_KEY = 'cleanclip_history'

/**
 * Get all history items from storage
 */
export async function getHistory(): Promise<HistoryItem[]> {
  if (!chrome?.storage?.local) {
    return []
  }

  const result = await chrome.storage.local.get(HISTORY_STORAGE_KEY)
  return result[HISTORY_STORAGE_KEY] || []
}

/**
 * Add a new item to history
 */
export async function addToHistory(item: Omit<HistoryItem, 'id'> & { id?: string }): Promise<HistoryItem> {
  if (!chrome?.storage?.local) {
    throw new Error('chrome.storage.local is not available')
  }

  const history = await getHistory()

  // Generate ID if not provided
  const id = item.id || crypto.randomUUID()
  const historyItem: HistoryItem = {
    id,
    text: item.text,
    timestamp: item.timestamp,
    imageUrl: item.imageUrl,
    debug: item.debug
  }

  history.push(historyItem)

  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: history
  })

  return historyItem
}

/**
 * Delete an item from history by ID
 */
export async function deleteFromHistory(id: string): Promise<void> {
  if (!chrome?.storage?.local) {
    throw new Error('chrome.storage.local is not available')
  }

  const history = await getHistory()
  const filteredHistory = history.filter(item => item.id !== id)

  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: filteredHistory
  })
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  if (!chrome?.storage?.local) {
    throw new Error('chrome.storage.local is not available')
  }

  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: []
  })
}
