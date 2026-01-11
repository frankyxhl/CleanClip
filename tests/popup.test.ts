// @vitest-environment happy-dom
// Popup Tests for CleanClip
// Tests for popup initialization and history loading

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Mock chrome API before any imports
const mockHistory = [
  {
    id: '1',
    text: 'First OCR result',
    timestamp: 1000,
    imageUrl: 'data:image/png;base64,abc123'
  },
  {
    id: '2',
    text: 'Second OCR result',
    timestamp: 2000,
    imageUrl: 'data:image/png;base64,def456'
  }
]

const mockChrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({ cleanclip_history: mockHistory })),
      set: vi.fn(() => Promise.resolve()),
      clear: vi.fn(() => Promise.resolve())
    }
  }
}

// Set up chrome global
vi.stubGlobal('chrome', mockChrome)

describe('Popup - History Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Reset DOM to clean state
    document.body.innerHTML = ''
  })

  it('should call getHistory() when popup is loaded', async () => {
    // Import popup main module to trigger initialization
    await import('../src/popup/main')

    // The popup should call getHistory during initialization
    // This test will FAIL because popup/main.ts doesn't call getHistory yet
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith('cleanclip_history')
  })

  it('should have a history container element in popup/index.html', () => {
    // Load popup HTML content
    const htmlPath = join(process.cwd(), 'src/popup/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for history container element in HTML
    // This test will FAIL because popup/index.html doesn't have a history container yet
    expect(htmlContent).toContain('id="history-container"')
  })

  it('should render history items to the page', async () => {
    // Set up DOM with basic popup structure
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Check if history items are rendered
    // This test will FAIL because popup/main.ts doesn't render history yet
    const historyItems = document.querySelectorAll('[data-history-item]')
    expect(historyItems.length).toBeGreaterThan(0)
  })

  it('should render each history item with its text content', async () => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Check if history items contain the expected text
    // This test will FAIL because history items aren't rendered yet
    const firstItem = document.querySelector('[data-history-item="1"]')
    expect(firstItem?.textContent).toContain('First OCR result')
  })

  it('should render each history item with timestamp', async () => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Check if history items display timestamps
    // This test will FAIL because history items aren't rendered yet
    const firstItem = document.querySelector('[data-history-item="1"]')
    const timestampElement = firstItem?.querySelector('[data-timestamp]')
    expect(timestampElement).toBeDefined()
  })

  it('should show empty state when no history exists', async () => {
    // Mock empty history
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({}))

    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Check for empty state message
    // This test will FAIL because empty state isn't implemented yet
    const emptyState = document.querySelector('[data-empty-state]')
    expect(emptyState).toBeDefined()
    expect(emptyState?.textContent).toContain('No history')
  })
})

describe('Popup - History Container Structure', () => {
  it('should have proper HTML structure for history display', () => {
    const htmlPath = join(process.cwd(), 'src/popup/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for expected structure
    // This test will FAIL because the structure doesn't exist yet
    expect(htmlContent).toContain('id="app"')
    expect(htmlContent).toContain('id="history-container"')
  })
})

describe('Popup - History Item Click Behavior', () => {
  let mockTabsCreate: ReturnType<typeof vi.fn>
  let mockRuntimeGetURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''

    // Mock chrome.runtime.getURL
    mockRuntimeGetURL = vi.fn((path: string) => `chrome-extension://test/${path}`)
    mockChrome.runtime = { getURL: mockRuntimeGetURL }

    // Mock chrome.tabs.create
    mockTabsCreate = vi.fn()
    mockChrome.tabs = { create: mockTabsCreate }

    // Restore the storage mock after reset
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: mockHistory }))

    // Update the global chrome object to include tabs and runtime
    vi.stubGlobal('chrome', mockChrome)
  })

  it('should open detail page when clicking history item', async () => {
    // Set up DOM with history container
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Find and click the first history item
    const firstItem = document.querySelector('[data-history-item="1"]') as HTMLElement
    expect(firstItem).toBeDefined()

    // Simulate click event
    firstItem?.click()

    // Verify chrome.tabs.create was called with detail page URL
    expect(mockTabsCreate).toHaveBeenCalledWith({
      url: expect.stringContaining('src/detail/index.html?id=1')
    })
  })

  it('should open debug page when right-clicking history item', async () => {
    // Set up DOM with history container
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Find the first history item
    const firstItem = document.querySelector('[data-history-item="1"]') as HTMLElement
    expect(firstItem).toBeDefined()

    // Simulate contextmenu (right-click) event
    const contextEvent = new MouseEvent('contextmenu', { bubbles: true })
    firstItem?.dispatchEvent(contextEvent)

    // Verify chrome.tabs.create was called with debug page URL
    expect(mockTabsCreate).toHaveBeenCalledWith({
      url: expect.stringContaining('src/debug/index.html?id=1')
    })
  })

  it('should open debug page when Shift+clicking history item', async () => {
    // Set up DOM with history container
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Find the first history item
    const firstItem = document.querySelector('[data-history-item="1"]') as HTMLElement
    expect(firstItem).toBeDefined()

    // Simulate Shift+click event
    const clickEvent = new MouseEvent('click', { bubbles: true, shiftKey: true })
    firstItem?.dispatchEvent(clickEvent)

    // Verify chrome.tabs.create was called with debug page URL
    expect(mockTabsCreate).toHaveBeenCalledWith({
      url: expect.stringContaining('src/debug/index.html?id=1')
    })
  })

  it('should not open page when clicking action buttons', async () => {
    // Set up DOM with history container
    document.body.innerHTML = `
      <div id="app">
        <h1>CleanClip</h1>
        <div id="history-container"></div>
      </div>
    `

    // Import popup main module
    await import('../src/popup/main')

    // Find the copy button in the first history item
    const copyButton = document.querySelector('[data-history-item="1"] [data-action="copy"]') as HTMLElement
    expect(copyButton).toBeDefined()

    // Reset mock before clicking
    mockTabsCreate.mockClear()

    // Simulate click on copy button
    copyButton?.click()

    // Verify chrome.tabs.create was NOT called (button click should not trigger navigation)
    expect(mockTabsCreate).not.toHaveBeenCalled()
  })
})
