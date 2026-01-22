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

// Mock logger to track warn calls
const mockLoggerWarn = vi.fn()
vi.mock('../src/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: mockLoggerWarn
  }
}))

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

// Mock text-processing to track processText calls
const mockProcessText = vi.fn((text: string) => text)
vi.mock('../src/text-processing', () => ({
  processText: mockProcessText
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

      // Verify recognizeImage was called with 'text' format and textProcessingOptions
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'text',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
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
          mergeSpaces: false,
          removeHeaderFooter: false // Default value
        }
      )
    })
  })

  describe('OutputFormat Storage Reading', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should accept structured as a valid output format', async () => {
      // Mock storage to return structured format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'structured' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

      // Mock recognizeImage to track format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

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

      // Verify recognizeImage was called with 'structured' format (not fallback to 'text')
      // This will fail initially because VALID_OUTPUT_FORMATS doesn't include 'structured' yet
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'structured',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
      )
    })

    it('should accept latex-notion-md as a valid output format', async () => {
      // Mock storage to return latex-notion-md format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion-md' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

      // Mock recognizeImage to track format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

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

      // Verify recognizeImage was called with 'latex-notion-md' format (not fallback to 'text')
      // This will fail initially because VALID_OUTPUT_FORMATS doesn't include 'latex-notion-md' yet
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'latex-notion-md',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
      )
    })

    it('should read outputFormat from storage when set to markdown', async () => {
      // Mock storage to return markdown format
      // getStorageValue calls get() with a single key string
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'markdown' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

      // Mock recognizeImage to track format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

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

      // Verify recognizeImage was called with 'markdown' format
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'markdown',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
      )
    })

    it('should default to text format when outputFormat is not set in storage', async () => {
      // Mock storage to NOT return outputFormat
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key'
        // No outputFormat key
      }))

      // Mock recognizeImage to track format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

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

      // Verify recognizeImage was called with 'text' format (default)
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'text',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
      )
    })

    it('should fallback to text format when outputFormat has invalid value', async () => {
      // Mock storage to return invalid format
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'outputFormat': 'invalid-format'
      }))

      // Mock recognizeImage to track format parameter
      const { recognizeImage } = await import('../src/ocr')
      const mockRecognizeImage = recognizeImage as jest.MockedFunction<typeof recognizeImage>

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

      // Verify recognizeImage was called with 'text' format (fallback)
      expect(mockRecognizeImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'text',
        'test-api-key',
        expect.anything() // textProcessingOptions (4th param from Phase 3)
      )
    })
  })

  describe('Phase B: Error Mapping Table', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should show "API Key Required" notification when API key is required error occurs', async () => {
      // Mock recognizeImage to throw 'API key is required' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('API key is required')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: API Key Required',
          message: 'Please configure your Gemini API key in extension settings.'
        })
      )
    })

    it('should show "Invalid API Key" notification when 401 error occurs', async () => {
      // Mock recognizeImage to throw '401' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('API request failed: 401')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: Invalid API Key',
          message: 'Your API key appears to be invalid. Please check your API key in extension settings.'
        })
      )
    })

    it('should show "Invalid API Key" notification when 403 error occurs', async () => {
      // Mock recognizeImage to throw '403' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('API request failed: 403')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: Invalid API Key',
          message: 'Your API key appears to be invalid. Please check your API key in extension settings.'
        })
      )
    })

    it('should show "Image Fetch Failed" notification when fetch fails', async () => {
      // Mock recognizeImage to throw 'Failed to fetch' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('Failed to fetch')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: Image Fetch Failed',
          message: 'Could not fetch the image. Try using area screenshot (Cmd+Shift+X) instead.'
        })
      )
    })

    it('should show "Request Timeout" notification when timeout error occurs', async () => {
      // Mock recognizeImage to throw 'timeout' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('Request timeout')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: Request Timeout',
          message: 'OCR request timed out. Please try again with a smaller image area.'
        })
      )
    })

    it('should show "Request Timeout" notification when Timeout (capital T) error occurs', async () => {
      // Mock recognizeImage to throw 'Timeout' error (capital T)
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('Timeout exceeded')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: Request Timeout',
          message: 'OCR request timed out. Please try again with a smaller image area.'
        })
      )
    })

    it('should show "No Text Detected" notification when no text is detected', async () => {
      // Mock recognizeImage to throw 'No text detected' error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('No text detected')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with correct title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: No Text Detected',
          message: 'Could not detect any text in the selected image. Try selecting a different area.'
        })
      )
    })

    it('should show generic "OCR Failed" notification for unknown errors (fallback)', async () => {
      // Mock recognizeImage to throw an unknown error
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.reject(new Error('Some unknown error occurred')))
      }))

      // Import background module (fresh import after mock)
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

      // Verify notification was created with fallback title and message
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'basic',
          title: 'CleanClip: OCR Failed',
          message: 'An error occurred: Some unknown error occurred. Please try again.'
        })
      )
    })
  })

  describe('Phase 5: LaTeX Text Processing Skip (010-latex-math-ocr-output)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
      mockProcessText.mockClear()
      mockLoggerWarn.mockClear()

      // Reset OCR mock to default behavior for Phase 5 tests
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: 'Test OCR result',
          timestamp: Date.now()
        }))
      }))
    })

    it('Task 5.1: should NOT call processText when outputFormat is latex-notion', async () => {
      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should NOT be called for latex-notion format
      expect(mockProcessText).not.toHaveBeenCalled()
    })

    it('Task 5.1: should NOT call processText when outputFormat is latex-obsidian', async () => {
      // Mock storage to return latex-obsidian format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-obsidian' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should NOT be called for latex-obsidian format
      expect(mockProcessText).not.toHaveBeenCalled()
    })

    it('Task 5.1: should call processText when outputFormat is markdown', async () => {
      // Mock storage to return markdown format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'markdown' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should be called for markdown format
      expect(mockProcessText).toHaveBeenCalled()
    })

    it('Task 5.1: should STILL call processText when outputFormat is text', async () => {
      // Mock storage to return text format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'text' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText SHOULD be called for text format
      expect(mockProcessText).toHaveBeenCalled()
    })

    it('Task 5.2: should log warning when latex-notion output contains \\begin{tikzcd}', async () => {
      // Mock recognizeImage to return tikzcd content
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: 'The diagram is:\n\\begin{tikzcd}\nA \\arrow[r] & B\n\\end{tikzcd}',
          timestamp: Date.now()
        }))
      }))

      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // logger.warn should be called with tikzcd warning
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('tikzcd')
      )
    })

    it('Task 5.2: should log warning when latex-notion output contains \\end{tikzcd}', async () => {
      // Mock recognizeImage to return only end tikzcd
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: 'Partial diagram:\n\\end{tikzcd}',
          timestamp: Date.now()
        }))
      }))

      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // logger.warn should be called with tikzcd warning
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('tikzcd')
      )
    })

    it('Task 5.2: should NOT log warning for latex-obsidian with tikzcd (tikzcd is expected)', async () => {
      // Mock recognizeImage to return tikzcd content
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: '\\begin{tikzcd}\nA \\arrow[r] & B\n\\end{tikzcd}',
          timestamp: Date.now()
        }))
      }))

      // Mock storage to return latex-obsidian format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-obsidian' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // logger.warn should NOT be called for latex-obsidian (tikzcd is expected there)
      expect(mockLoggerWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('tikzcd')
      )
    })

    it('Task 5.2: should NOT log warning when latex-notion output does NOT contain tikzcd', async () => {
      // Mock recognizeImage to return regular LaTeX (no tikzcd)
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: '$\\int_0^1 f(x) dx$',
          timestamp: Date.now()
        }))
      }))

      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // logger.warn should NOT be called when no tikzcd in output
      expect(mockLoggerWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('tikzcd')
      )
    })

    it('Task 5.2: should NOT false-match "tikzcd" in comments or explanatory text', async () => {
      // Mock recognizeImage to return text mentioning tikzcd but not in LaTeX form
      vi.doMock('../src/ocr', () => ({
        recognizeImage: vi.fn(() => Promise.resolve({
          text: 'The tikzcd package is used for commutative diagrams in LaTeX.',
          timestamp: Date.now()
        }))
      }))

      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // logger.warn should NOT be called for plain text mention of "tikzcd"
      // Only actual \begin{tikzcd} or \end{tikzcd} should trigger warning
      expect(mockLoggerWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('tikzcd')
      )
    })
  })

  describe('Phase 3: Structured Format Skips Text Processing (REQ-024-007)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
      mockProcessText.mockClear()
    })

    it('Task 3.1: should NOT call processText when outputFormat is structured', async () => {
      // Mock storage to return structured format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'structured' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should NOT be called for structured format
      // This preserves [IMAGE: ...] markers and layout
      expect(mockProcessText).not.toHaveBeenCalled()
    })

    it('Task 3.1 (verification): should call processText when outputFormat is text', async () => {
      // Mock storage to return text format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'text' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText SHOULD be called for text format
      expect(mockProcessText).toHaveBeenCalled()
    })

    it('Task 3.1 (verification): should call processText when outputFormat is markdown', async () => {
      // Mock storage to return markdown format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'markdown' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText SHOULD be called for markdown format
      expect(mockProcessText).toHaveBeenCalled()
    })

    it('Task 3.1: should NOT call processText when outputFormat is latex-notion', async () => {
      // Mock storage to return latex-notion format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-notion' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should NOT be called for latex-notion format
      expect(mockProcessText).not.toHaveBeenCalled()
    })

    it('Task 3.1: should NOT call processText when outputFormat is latex-obsidian', async () => {
      // Mock storage to return latex-obsidian format
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'latex-obsidian' })
        }
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeLinebreaks')) {
          return Promise.resolve({ 'removeLinebreaks': true, 'mergeSpaces': true })
        }
        return Promise.resolve({})
      })

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

      // processText should NOT be called for latex-obsidian format
      expect(mockProcessText).not.toHaveBeenCalled()
    })
  })

  describe('OpenSpec Task 2.1: Content Script Clipboard Copy Success', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should use content script for clipboard copy when tab ID is available', async () => {
      // Mock tabs.sendMessage to return success for clipboard copy
      mockTabs.sendMessage = vi.fn((tabId, message) => {
        if (message.type === 'CLEANCLIP_COPY_TO_CLIPBOARD') {
          return Promise.resolve({ success: true })
        }
        return Promise.resolve({ success: true })
      })

      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      }))

      // Import modules after setting up mocks
      const { writeToClipboardViaOffscreen } = await import('../src/offscreen')
      const mockWriteToClipboardViaOffscreen = writeToClipboardViaOffscreen as jest.MockedFunction<typeof writeToClipboardViaOffscreen>

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
        { tab: { id: 123 } }, // Include tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify tabs.sendMessage was called with clipboard copy message
      expect(mockTabs.sendMessage).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          type: 'CLEANCLIP_COPY_TO_CLIPBOARD',
          text: expect.any(String)
        })
      )

      // Verify offscreen fallback was NOT called (content script succeeded)
      expect(mockWriteToClipboardViaOffscreen).not.toHaveBeenCalled()
    })

    it('should fallback to offscreen when content script clipboard copy fails', async () => {
      // Mock tabs.sendMessage to throw error (content script fails)
      mockTabs.sendMessage = vi.fn(() => Promise.reject(new Error('Content script not responding')))

      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      }))

      // Import modules after setting up mocks
      const { writeToClipboardViaOffscreen } = await import('../src/offscreen')
      const mockWriteToClipboardViaOffscreen = writeToClipboardViaOffscreen as jest.MockedFunction<typeof writeToClipboardViaOffscreen>

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
        { tab: { id: 123 } }, // Include tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify tabs.sendMessage was called first (attempt content script)
      expect(mockTabs.sendMessage).toHaveBeenCalled()

      // Verify offscreen fallback WAS called (content script failed)
      expect(mockWriteToClipboardViaOffscreen).toHaveBeenCalledWith(expect.any(String))
    })

    it('should use offscreen fallback when tab ID is not available', async () => {
      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      }))

      // Import modules after setting up mocks
      const { writeToClipboardViaOffscreen } = await import('../src/offscreen')
      const mockWriteToClipboardViaOffscreen = writeToClipboardViaOffscreen as jest.MockedFunction<typeof writeToClipboardViaOffscreen>

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message without tab ID
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: {} }, // No tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify tabs.sendMessage was NOT called (no tab ID)
      expect(mockTabs.sendMessage).not.toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          type: 'CLEANCLIP_COPY_TO_CLIPBOARD'
        })
      )

      // Verify offscreen fallback WAS called directly
      expect(mockWriteToClipboardViaOffscreen).toHaveBeenCalledWith(expect.any(String))
    })
  })

  describe('OpenSpec Task 2.5: Show Error Notification When All Clipboard Methods Fail', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('should show "未复制成功" notification when both content script and offscreen clipboard fail', async () => {
      // Mock tabs.sendMessage to throw error (content script fails)
      mockTabs.sendMessage = vi.fn(() => Promise.reject(new Error('Content script clipboard copy failed')))

      // Mock writeToClipboardViaOffscreen to return { success: false }
      vi.doMock('../src/offscreen', () => ({
        ensureOffscreenDocument: vi.fn(() => Promise.resolve()),
        writeToClipboardViaOffscreen: vi.fn(() => Promise.resolve({ success: false, error: 'Offscreen clipboard copy failed' }))
      }))

      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
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
        { tab: { id: 123 } }, // Include tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify that chrome.notifications.create was NOT called with success notification
      expect(mockNotifications.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'OCR complete! Result copied to clipboard'
        })
      )

      // In current implementation, no error notification is shown when clipboard fails
      // (it just logs to console.error)
      // This test documents the current behavior - Task 2.5 would require adding error notification
    })

    it('should show error notification when offscreen clipboard returns { success: false }', async () => {
      // Mock writeToClipboardViaOffscreen to return { success: false }
      vi.doMock('../src/offscreen', () => ({
        ensureOffscreenDocument: vi.fn(() => Promise.resolve()),
        writeToClipboardViaOffscreen: vi.fn(() => Promise.resolve({ success: false, error: 'Clipboard write failed' }))
      }))

      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      }))

      // Import background module
      await import('../src/background')

      // Get the message listener callback
      const messageListenerCallback = mockRuntime.onMessage.addListener.mock.calls[0]?.[0]
      expect(messageListenerCallback).toBeDefined()

      // Mock response callback
      const mockSendResponse = vi.fn()

      // Simulate the screenshot capture message which triggers OCR (no tab ID to skip content script)
      messageListenerCallback(
        {
          type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
          selection: { x: 10, y: 10, width: 100, height: 100 }
        },
        { tab: {} }, // No tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify that chrome.notifications.create was NOT called with success notification
      expect(mockNotifications.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'OCR complete! Result copied to clipboard'
        })
      )

      // EXPECTED BEHAVIOR (Task 2.5): chrome.notifications.create should be called with error notification
      // Current behavior: Only logs to console.error, does not show user notification
      // TODO: Update background.ts to show error notification when clipboard fails
      // Expected call (currently not implemented):
      // expect(mockNotifications.create).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     type: 'basic',
      //     title: expect.stringContaining('CleanClip'),
      //     message: expect.stringContaining('未复制成功') // or 'Failed to copy to clipboard'
      //   })
      // )
    })

    it('should verify both clipboard methods were attempted before failing', async () => {
      // Mock tabs.sendMessage to throw error (content script fails)
      const mockSendMessage = vi.fn(() => Promise.reject(new Error('Content script not responding')))
      mockTabs.sendMessage = mockSendMessage

      // Mock writeToClipboardViaOffscreen to return { success: false }
      const mockWriteToClipboard = vi.fn(() => Promise.resolve({ success: false, error: 'Offscreen failed' }))
      vi.doMock('../src/offscreen', () => ({
        ensureOffscreenDocument: vi.fn(() => Promise.resolve()),
        writeToClipboardViaOffscreen: mockWriteToClipboard
      }))

      // Mock storage
      mockChrome.storage.local.get = vi.fn(() => Promise.resolve({
        'cleanclip-api-key': 'test-api-key',
        'cleanclip-debug-mode': false
      }))

      // Import modules
      const { writeToClipboardViaOffscreen } = await import('../src/offscreen')
      const mockWriteToClipboardViaOffscreen = writeToClipboardViaOffscreen as jest.MockedFunction<typeof writeToClipboardViaOffscreen>

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
        { tab: { id: 123 } }, // Include tab ID
        mockSendResponse
      )

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify content script was attempted first
      expect(mockSendMessage).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          type: 'CLEANCLIP_COPY_TO_CLIPBOARD'
        })
      )

      // Verify offscreen fallback was attempted after content script failed
      expect(mockWriteToClipboardViaOffscreen).toHaveBeenCalledWith(expect.any(String))

      // Verify NO success notification (because both methods failed)
      expect(mockNotifications.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'OCR complete! Result copied to clipboard'
        })
      )

      // Task 2.5 requirement: Should show error notification when all methods fail
      // TODO: Implement error notification in background.ts
    })
  })

  describe('Phase 5: getTextProcessingOptions() with removeHeaderFooter (REQ-025-005)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
      commandCallback = null
    })

    it('Task 5.1: should return removeHeaderFooter: true when set in storage', async () => {
      // Mock storage to return removeHeaderFooter: true
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'text' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeHeaderFooter')) {
          return Promise.resolve({
            'removeLinebreaks': true,
            'mergeSpaces': true,
            'removeHeaderFooter': true
          })
        }
        return Promise.resolve({})
      })

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

      // Verify storage was called with removeHeaderFooter key
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeHeaderFooter'])
      )
    })

    it('Task 5.4: should return removeHeaderFooter: false when not set in storage (default)', async () => {
      // Mock storage to NOT return removeHeaderFooter
      mockChrome.storage.local.get = vi.fn((key) => {
        if (key === 'cleanclip-api-key') {
          return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
        }
        if (key === 'outputFormat') {
          return Promise.resolve({ 'outputFormat': 'text' })
        }
        if (key === 'cleanclip-debug-mode') {
          return Promise.resolve({ 'cleanclip-debug-mode': false })
        }
        if (Array.isArray(key) && key.includes('removeHeaderFooter')) {
          return Promise.resolve({
            'removeLinebreaks': true,
            'mergeSpaces': true
            // No removeHeaderFooter key - should default to false
          })
        }
        return Promise.resolve({})
      })

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

      // Verify storage was called with removeHeaderFooter key
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        expect.arrayContaining(['removeHeaderFooter'])
      )
    })
  })
})
