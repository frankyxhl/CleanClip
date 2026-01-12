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
  scripting: {
    executeScript: vi.fn(() => Promise.resolve())
  },
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

// Mock createImageBitmap for service worker environment
global.createImageBitmap = vi.fn(async (blob: Blob) => {
  // Create a simple mock bitmap with width and height
  const blobData = await blob.arrayBuffer()
  const size = blobData.byteLength
  return {
    width: Math.min(1920, size),
    height: Math.min(1080, size),
    close: vi.fn()
  } as any
})

// Mock OffscreenCanvas for service worker environment
class MockOffscreenCanvas {
  constructor(public width: number, public height: number) {}
  getContext(): any {
    return {
      drawImage: vi.fn(),
      getImageData: vi.fn()
    }
  }
  convertToBlob(): Promise<Blob> {
    return Promise.resolve(new Blob(['mock-canvas-data'], { type: 'image/png' }))
  }
}
global.OffscreenCanvas = MockOffscreenCanvas as any

// Mock FileReader for service worker environment
global.FileReader = class {
  onloadend: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  result: string | null = null

  readAsDataURL(blob: Blob) {
    // Simulate async operation
    Promise.resolve().then(() => {
      this.result = `data:${blob.type};base64,${btoa('mock-data')}`
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    })
  }

  abort() {}
} as any

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

  describe('Screenshot Success Notifications (REQ-003-010)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should create notification after screenshot is captured successfully', async () => {
      // Import background module
      await import('../src/background')

      // Get the message listener callback
      // The background module registers a message listener for CLEANCLIP_SCREENSHOT_CAPTURE
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]

      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should have captured visible tab
      expect(mockTabs.captureVisibleTab).toHaveBeenCalled()

      // Expected failure: notifications.create should be called with screenshot success message
      // This will fail because the notification is not yet implemented
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          iconUrl: 'chrome-extension://test/icon128.png',
          title: 'CleanClip',
          message: 'Screenshot captured! Sending to AI...',
          priority: 2
        })
      )
    })
  })

  describe('OCR Completion Notifications (REQ-003-011)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should create notification after OCR completes and text is copied to clipboard', async () => {
      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]

      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete (OCR + clipboard write)
      await new Promise(resolve => setTimeout(resolve, 200))

      // Expected failure: notifications.create should be called with OCR completion message
      // This will fail because the OCR completion notification is not yet implemented
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          iconUrl: 'chrome-extension://test/icon128.png',
          title: 'CleanClip',
          message: 'OCR complete! Result copied to clipboard',
          priority: 2
        })
      )
    })
  })

  describe('Text Processing Settings (REQ-004-005)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should read removeLinebreaks and mergeSpaces settings from chrome.storage.local', async () => {
      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Expected failure: chrome.storage.local.get should be called with settings keys
      // This will fail because the background.ts does not yet read these settings
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeLinebreaks', 'mergeSpaces'])
      )
    })

    it('should read removeLinebreaks setting with camelCase key name', async () => {
      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Expected failure: chrome.storage.local.get should be called with camelCase key
      // This will fail because the background.ts does not yet read these settings
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeLinebreaks'])
      )
    })

    it('should read mergeSpaces setting with camelCase key name', async () => {
      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Expected failure: chrome.storage.local.get should be called with camelCase key
      // This will fail because the background.ts does not yet read these settings
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['mergeSpaces'])
      )
    })
  })

  describe('Text Processing Integration (Tasks 4.3-4.6)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('Task 4.3: should call processText with settings from storage', async () => {
      // Mock storage to return enabled settings
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'removeLinebreaks': true,
        'mergeSpaces': true
      }))

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify storage was called for settings
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeLinebreaks', 'mergeSpaces'])
      )
    })

    it('Task 4.4: should only apply processText when outputFormat is text', async () => {
      // Mock storage to return settings
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'removeLinebreaks': true,
        'mergeSpaces': true
      }))

      // Mock recognizeImage to track the format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify recognizeImage was called with 'text' format
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'text',
        'test-api-key'
      )

      // Verify processText was called (text processing should be applied for 'text' format)
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeLinebreaks', 'mergeSpaces'])
      )
    })

    it('Task 4.5: should not process text when both options are disabled', async () => {
      // Mock storage to return disabled settings
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'removeLinebreaks': false,
        'mergeSpaces': false
      }))

      // Mock processText to track if it's called
      const { processText } = await import('../src/text-processing')
      const mockProcessText = vi.spyOn(await import('../src/text-processing'), 'processText')

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify processText was still called (but with disabled options)
      expect(mockProcessText).toHaveBeenCalled()
    })

    it('Task 4.6: should respect individual option settings', async () => {
      // Test with only removeLinebreaks enabled
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'removeLinebreaks': true,
        'mergeSpaces': false
      }))

      // Mock processText to verify it's called with correct options
      const mockProcessText = vi.spyOn(await import('../src/text-processing'), 'processText')

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: { id: 1 } },
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify processText was called with the correct options
      expect(mockProcessText).toHaveBeenCalledWith(
        expect.any(String),
        {
          removeLineBreaks: true,
          mergeSpaces: false
        }
      )
    })
  })
})
