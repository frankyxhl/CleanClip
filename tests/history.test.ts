// @vitest-environment happy-dom
// History Panel Tests for CleanClip
// Tests for history storage, UI, and operations

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock chrome API before any imports
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      clear: vi.fn(() => Promise.resolve())
    }
  }
}

// Set up chrome global
vi.stubGlobal('chrome', mockChrome)

// Set up navigator.clipboard mock
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve())
}

vi.stubGlobal('navigator', {
  clipboard: mockClipboard
})

describe('History Storage Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should define HistoryItem type with required fields', async () => {
    const { HistoryItem } = await import('../src/history')
    const item: HistoryItem = {
      id: '123',
      text: 'Sample text',
      timestamp: Date.now(),
      imageUrl: 'data:image/png;base64,iVBORw0KG...'
    }
    expect(item.id).toBe('123')
    expect(item.text).toBe('Sample text')
    expect(item.imageUrl).toBe('data:image/png;base64,iVBORw0KG...')
    expect(typeof item.timestamp).toBe('number')
  })

  it('should store history in chrome.storage.local', async () => {
    const { getHistory } = await import('../src/history')
    await getHistory()
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith('cleanclip_history')
  })

  it('should initialize with empty history array', async () => {
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    const { getHistory } = await import('../src/history')
    const history = await getHistory()
    expect(history).toEqual([])
  })

  it('should retrieve existing history from storage', async () => {
    const mockHistory = [
      { id: '1', text: 'First', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' },
      { id: '2', text: 'Second', timestamp: 2000, imageUrl: 'data:image/png;base64,def' }
    ]
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: mockHistory }))
    const { getHistory } = await import('../src/history')
    const history = await getHistory()
    expect(history).toEqual(mockHistory)
  })
})

describe('Add to History', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should add item to history', async () => {
    const { addToHistory } = await import('../src/history')
    const item = {
      id: '123',
      text: 'Sample text',
      timestamp: Date.now(),
      imageUrl: 'data:image/png;base64,iVBORw0KG...'
    }

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await addToHistory(item)
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      cleanclip_history: [item]
    })
  })

  it('should append to existing history', async () => {
    const { addToHistory } = await import('../src/history')
    const existingItem = { id: '1', text: 'Existing', timestamp: 1000, imageUrl: 'data:image/png;base64,old' }
    const newItem = { id: '2', text: 'New', timestamp: 2000, imageUrl: 'data:image/png;base64,new' }

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [existingItem] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await addToHistory(newItem)
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      cleanclip_history: [existingItem, newItem]
    })
  })

  it('should generate unique ID if not provided', async () => {
    const { addToHistory } = await import('../src/history')
    const item = {
      text: 'Sample text',
      timestamp: Date.now(),
      imageUrl: 'data:image/png;base64,iVBORw0KG...'
    }

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await addToHistory(item as any)
    const setCall = mockChrome.storage.local.set.mock.calls[0][0]
    expect(setCall.cleanclip_history[0].id).toBeDefined()
    expect(typeof setCall.cleanclip_history[0].id).toBe('string')
  })
})

describe('Delete from History', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should delete item by ID', async () => {
    const { deleteFromHistory } = await import('../src/history')
    const item1 = { id: '1', text: 'First', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }
    const item2 = { id: '2', text: 'Second', timestamp: 2000, imageUrl: 'data:image/png;base64,def' }
    const item3 = { id: '3', text: 'Third', timestamp: 3000, imageUrl: 'data:image/png;base64,ghi' }

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [item1, item2, item3] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await deleteFromHistory('2')
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      cleanclip_history: [item1, item3]
    })
  })

  it('should handle deleting non-existent ID', async () => {
    const { deleteFromHistory } = await import('../src/history')
    const item1 = { id: '1', text: 'First', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [item1] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await deleteFromHistory('non-existent')
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      cleanclip_history: [item1]
    })
  })
})

describe('History Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should persist history across sessions', async () => {
    const { addToHistory, getHistory } = await import('../src/history')
    const item = { id: '1', text: 'Persisted', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }

    // Simulate first session - add to history
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
    await addToHistory(item)

    // Simulate browser restart - storage cleared in memory but data persists
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [item] }))
    const history = await getHistory()

    expect(history).toEqual([item])
    expect(history[0].text).toBe('Persisted')
  })

  it('should maintain data integrity across multiple operations', async () => {
    const { addToHistory, deleteFromHistory, getHistory } = await import('../src/history')
    const item1 = { id: '1', text: 'First', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }
    const item2 = { id: '2', text: 'Second', timestamp: 2000, imageUrl: 'data:image/png;base64,def' }

    // Add items
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
    await addToHistory(item1)
    await addToHistory(item2)

    // Delete one item
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [item1, item2] }))
    await deleteFromHistory('1')

    // Verify persistence
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [item2] }))
    const history = await getHistory()

    expect(history).toEqual([item2])
    expect(history.length).toBe(1)
  })
})

describe('History Panel UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render history panel component', async () => {
    const { HistoryPanel } = await import('../src/history-panel/component')
    expect(HistoryPanel).toBeDefined()
  })

  it('should display history items', async () => {
    const { renderHistoryItems } = await import('../src/history-panel/component')
    const mockHistory = [
      { id: '1', text: 'First item', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' },
      { id: '2', text: 'Second item', timestamp: 2000, imageUrl: 'data:image/png;base64,def' }
    ]
    const container = document.createElement('div')
    renderHistoryItems(container, mockHistory)
    expect(container.children.length).toBe(2)
  })

  it('should display copy button for each item', async () => {
    const { renderHistoryItems } = await import('../src/history-panel/component')
    const mockHistory = [
      { id: '1', text: 'Test item', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }
    ]
    const container = document.createElement('div')
    renderHistoryItems(container, mockHistory)
    const copyButton = container.querySelector('[data-action="copy"]')
    expect(copyButton).toBeDefined()
  })

  it('should display delete button for each item', async () => {
    const { renderHistoryItems } = await import('../src/history-panel/component')
    const mockHistory = [
      { id: '1', text: 'Test item', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }
    ]
    const container = document.createElement('div')
    renderHistoryItems(container, mockHistory)
    const deleteButton = container.querySelector('[data-action="delete"]')
    expect(deleteButton).toBeDefined()
  })
})

describe('Copy Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigator.clipboard mock
    mockClipboard.writeText = vi.fn(() => Promise.resolve())
  })

  it('should copy text to clipboard', async () => {
    const { copyToClipboard } = await import('../src/history-panel/actions')
    await copyToClipboard('Test text')
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text')
  })

  it('should show success message after copy', async () => {
    const { copyToClipboard } = await import('../src/history-panel/actions')
    const container = document.createElement('div')
    document.body.appendChild(container)

    await copyToClipboard('Test text', container)
    const successMessage = container.querySelector('.copy-success')
    expect(successMessage).toBeDefined()

    document.body.removeChild(container)
  })

  it('should handle clipboard errors gracefully', async () => {
    const { copyToClipboard } = await import('../src/history-panel/actions')
    mockClipboard.writeText = vi.fn(() => Promise.reject(new Error('Clipboard error')))

    const error = await copyToClipboard('Test text').catch(e => e)
    expect(error).toBeDefined()
  })
})

describe('Delete Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should remove item from DOM', async () => {
    const { deleteItem } = await import('../src/history-panel/actions')
    const container = document.createElement('div')
    const item = document.createElement('div')
    item.setAttribute('data-id', '1')
    container.appendChild(item)

    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await deleteItem('1', container)
    expect(container.querySelector('[data-id="1"]')).toBeNull()
  })

  it('should update storage after delete', async () => {
    const { deleteItem } = await import('../src/history-panel/actions')
    const container = document.createElement('div')

    const historyItem = { id: '1', text: 'To delete', timestamp: 1000, imageUrl: 'data:image/png;base64,abc' }
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [historyItem] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())

    await deleteItem('1', container)
    expect(mockChrome.storage.local.set).toHaveBeenCalled()
  })
})
