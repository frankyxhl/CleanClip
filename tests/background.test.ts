// Background Tests for CleanClip
// Tests for background service worker functionality

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Track command listener callbacks
let commandCallback: ((command: string, tab: any) => void) | null = null

// Mock chrome API with complete structure
const mockTabs = {
  sendMessage: vi.fn(() => Promise.resolve({ success: true })),
  captureVisibleTab: vi.fn(() => Promise.resolve('data:image/png;base64,fake'))
}

const mockNotifications = {
  create: vi.fn(() => Promise.resolve('notification-id'))
}

const mockRuntime = {
  getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
  onMessage: {
    addListener: vi.fn((_callback) => {
      // Store message listener for potential use
      return {}
    })
  },
  onInstalled: {
    addListener: vi.fn((_callback) => ({}))
  }
}

const mockCommands = {
  onCommand: {
    addListener: vi.fn((callback: (command: string, tab: any) => void) => {
      commandCallback = callback
      return {}
    })
  }
}

const mockChrome = {
  tabs: mockTabs,
  notifications: mockNotifications,
  runtime: mockRuntime,
  commands: mockCommands,
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      })),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve())
    }
  },
  contextMenus: {
    create: vi.fn(() => Promise.resolve('menu-id')),
    onClicked: {
      addListener: vi.fn((_callback) => ({}))
    }
  }
}

vi.stubGlobal('chrome', mockChrome)

// Mock other modules before import
vi.mock('../src/ocr', () => ({
  recognizeImage: vi.fn(() => Promise.resolve({
    text: 'Test OCR result',
    timestamp: Date.now()
  }))
}))

vi.mock('../src/offscreen', () => ({
  ensureOffscreenDocument: vi.fn(() => Promise.resolve()),
  writeToClipboardViaOffscreen: vi.fn(() => Promise.resolve({ success: true }))
}))

vi.mock('../src/history', () => ({
  addToHistory: vi.fn(() => Promise.resolve())
}))

describe('Background - Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    commandCallback = null
  })

  it('should send CLEANCLIP_PING to check if content script is loaded', async () => {
    // Import background module
    await import('../src/background')

    // Verify listener was registered
    expect(mockCommands.onCommand.addListener).toHaveBeenCalled()
    expect(commandCallback).toBeTruthy()

    // Mock tab
    const mockTab = { id: 1, url: 'https://example.com' }

    // Call the callback with screenshot command
    await commandCallback!('cleanclip-screenshot', mockTab)

    // Should have tried to send PING message first
    expect(mockTabs.sendMessage).toHaveBeenCalledWith(
      1,
      { type: 'CLEANCLIP_PING' }
    )
  })

  it('should show notification when content script is not loaded', async () => {
    // Make sendMessage fail (content script not loaded)
    mockTabs.sendMessage.mockRejectedValueOnce(new Error('Connection not established'))

    // Import background module
    await import('../src/background')

    // Get the callback
    const mockTab = { id: 1, url: 'https://example.com' }

    // Call the callback with screenshot command
    await commandCallback!('cleanclip-screenshot', mockTab)

    // Should have created a notification
    expect(mockNotifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'basic',
        title: 'CleanClip',
        message: expect.stringContaining('refresh')
      })
    )
  })

  it('should send CLEANCLIP_SHOW_OVERLAY when content script responds to PING', async () => {
    // Import background module
    await import('../src/background')

    // Get the callback
    const mockTab = { id: 1, url: 'https://example.com' }

    // Call the callback with screenshot command
    await commandCallback!('cleanclip-screenshot', mockTab)

    // Should have sent both PING and SHOW_OVERLAY messages
    expect(mockTabs.sendMessage).toHaveBeenCalledWith(
      1,
      { type: 'CLEANCLIP_PING' }
    )
    expect(mockTabs.sendMessage).toHaveBeenCalledWith(
      1,
      { type: 'CLEANCLIP_SHOW_OVERLAY' }
    )
  })

  it('should handle missing tab gracefully', async () => {
    // Import background module
    await import('../src/background')

    // Call the callback with no tab
    await commandCallback!('cleanclip-screenshot', null)

    // Should not have tried to send any messages
    expect(mockTabs.sendMessage).not.toHaveBeenCalled()
  })
})
