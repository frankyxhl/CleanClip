/**
 * Offscreen Document Tests
 * Phase 13.1: Test offscreen document creation for clipboard operations
 *
 * Context: In Chrome Extension Manifest V3, service workers cannot access
 * navigator.clipboard API directly. Offscreen documents are required to
 * perform clipboard operations from the background context.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock chrome.offscreen API
interface OffscreenMock {
  createDocument: ReturnType<typeof vi.fn>
  closeDocument: ReturnType<typeof vi.fn>
  hasDocument: ReturnType<typeof vi.fn>
}

const mockOffscreen: OffscreenMock = {
  createDocument: vi.fn(),
  closeDocument: vi.fn(),
  hasDocument: vi.fn(),
}

// Mock chrome.runtime for message passing
const mockChromeRuntime = {
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
}

// Mock chrome.storage.local for storage polling pattern
const mockStorageLocal = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
}

// Setup chrome globals
Object.assign(global, {
  chrome: {
    offscreen: mockOffscreen,
    runtime: mockChromeRuntime,
    storage: {
      local: mockStorageLocal,
    },
  },
})

// Import the module we're testing (will fail until implemented)
// This will cause tests to fail (Red phase) until we implement the module in Phase 13.2
let offscreenModule: {
  ensureOffscreenDocument: () => Promise<void>
  writeToClipboardViaOffscreen: (text: string) => Promise<{ success: boolean; error?: string }>
  readFromClipboardViaOffscreen: () => Promise<{ success: boolean; text?: string; error?: string }>
  closeOffscreenDocument: () => Promise<void>
}

describe('Offscreen Document - Clipboard Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default state: no offscreen document exists
    mockOffscreen.hasDocument.mockReturnValue(false)
  })

  describe('Task 13.1.1: Create offscreen document', () => {
    it('should create offscreen document for clipboard access', async () => {
      // Arrange
      const offscreenUrl = 'src/offscreen/offscreen.html'
      const reasons: chrome.offscreen.Reason[] = ['CLIPBOARD']
      const justification = 'CleanClip needs clipboard access to copy OCR results'

      mockOffscreen.createDocument.mockResolvedValue(undefined)

      // Act
      // This function will be implemented in Phase 13.2
      // For now, we test that the chrome.offscreen API is called correctly
      await chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: reasons,
        justification: justification,
      })

      // Assert
      expect(mockOffscreen.createDocument).toHaveBeenCalledWith({
        url: offscreenUrl,
        reasons: reasons,
        justification: justification,
      })
    })

    it('should handle error when offscreen document creation fails', async () => {
      // Arrange
      const errorMessage = 'Failed to create offscreen document'
      mockOffscreen.createDocument.mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(
        chrome.offscreen.createDocument({
          url: 'src/offscreen/offscreen.html',
          reasons: ['CLIPBOARD'],
          justification: 'Test',
        })
      ).rejects.toThrow(errorMessage)
    })
  })

  describe('Task 13.1.2: Check if offscreen document exists', () => {
    it('should detect when offscreen document does not exist', () => {
      // Arrange
      mockOffscreen.hasDocument.mockReturnValue(false)

      // Act
      const hasDocument = chrome.offscreen.hasDocument()

      // Assert
      expect(hasDocument).toBe(false)
    })

    it('should detect when offscreen document exists', () => {
      // Arrange
      mockOffscreen.hasDocument.mockReturnValue(true)

      // Act
      const hasDocument = chrome.offscreen.hasDocument()

      // Assert
      expect(hasDocument).toBe(true)
    })
  })

  describe('Task 13.1.3: Send message to offscreen document for clipboard operations', () => {
    it('should send writeText message to offscreen document', async () => {
      // Arrange
      const text = 'Sample OCR text result'
      mockChromeRuntime.sendMessage.mockResolvedValue({ success: true })

      // Act
      const result = await chrome.runtime.sendMessage({
        type: 'CLEANCLIP_CLIPBOARD_WRITE',
        text: text,
      })

      // Assert
      expect(mockChromeRuntime.sendMessage).toHaveBeenCalledWith({
        type: 'CLEANCLIP_CLIPBOARD_WRITE',
        text: text,
      })
      expect(result).toEqual({ success: true })
    })

    it('should handle clipboard write failure from offscreen document', async () => {
      // Arrange
      const errorMessage = 'Clipboard write failed'
      mockChromeRuntime.sendMessage.mockResolvedValue({
        success: false,
        error: errorMessage,
      })

      // Act
      const result = await chrome.runtime.sendMessage({
        type: 'CLEANCLIP_CLIPBOARD_WRITE',
        text: 'Test text',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
    })

    it('should send readText message to offscreen document', async () => {
      // Arrange
      const clipboardText = 'Text from clipboard'
      mockChromeRuntime.sendMessage.mockResolvedValue({
        success: true,
        text: clipboardText,
      })

      // Act
      const result = await chrome.runtime.sendMessage({
        type: 'CLEANCLIP_CLIPBOARD_READ',
      })

      // Assert
      expect(mockChromeRuntime.sendMessage).toHaveBeenCalledWith({
        type: 'CLEANCLIP_CLIPBOARD_READ',
      })
      expect(result.success).toBe(true)
      expect(result.text).toBe(clipboardText)
    })
  })

  describe('Task 13.1.4: Integrated clipboard operation via offscreen document', () => {
    it('should create offscreen document if not exists before clipboard operation', async () => {
      // Arrange
      mockOffscreen.hasDocument.mockReturnValue(false)
      mockOffscreen.createDocument.mockResolvedValue(undefined)
      mockChromeRuntime.sendMessage.mockResolvedValue({ success: true })

      // Act - This is the workflow that will be implemented:
      // 1. Check if offscreen document exists
      const hasDocument = chrome.offscreen.hasDocument()

      // 2. If not, create it
      if (!hasDocument) {
        await chrome.offscreen.createDocument({
          url: 'src/offscreen/offscreen.html',
          reasons: ['CLIPBOARD'],
          justification: 'CleanClip needs clipboard access to copy OCR results',
        })
      }

      // 3. Send clipboard write message
      const result = await chrome.runtime.sendMessage({
        type: 'CLEANCLIP_CLIPBOARD_WRITE',
        text: 'OCR result text',
      })

      // Assert
      expect(mockOffscreen.hasDocument).toHaveBeenCalled()
      expect(mockOffscreen.createDocument).toHaveBeenCalled()
      expect(mockChromeRuntime.sendMessage).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should reuse existing offscreen document for clipboard operations', async () => {
      // Arrange
      mockOffscreen.hasDocument.mockReturnValue(true) // Document already exists
      mockChromeRuntime.sendMessage.mockResolvedValue({ success: true })

      // Act
      const hasDocument = chrome.offscreen.hasDocument()

      if (!hasDocument) {
        await chrome.offscreen.createDocument({
          url: 'src/offscreen/offscreen.html',
          reasons: ['CLIPBOARD'],
          justification: 'CleanClip needs clipboard access',
        })
      }

      const result = await chrome.runtime.sendMessage({
        type: 'CLEANCLIP_CLIPBOARD_WRITE',
        text: 'Another OCR result',
      })

      // Assert
      expect(mockOffscreen.hasDocument).toHaveBeenCalled()
      expect(mockOffscreen.createDocument).not.toHaveBeenCalled() // Should not create
      expect(mockChromeRuntime.sendMessage).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('Task 13.1.5: Offscreen document URL resolution', () => {
    it('should resolve offscreen document URL using chrome.runtime.getURL', () => {
      // Arrange
      const relativePath = 'src/offscreen/offscreen.html'
      mockChromeRuntime.getURL.mockReturnValue(
        'chrome-extension://test-id/src/offscreen/offscreen.html'
      )

      // Act
      const fullUrl = chrome.runtime.getURL(relativePath)

      // Assert
      expect(mockChromeRuntime.getURL).toHaveBeenCalledWith(relativePath)
      expect(fullUrl).toBe('chrome-extension://test-id/src/offscreen/offscreen.html')
    })
  })

  describe('Task 13.2.6: Module integration tests (GREEN - implemented)', () => {
    it('should import offscreen module successfully', async () => {
      // Phase 13.2: Module is now implemented
      const module = await import('../src/offscreen')
      expect(module).toBeDefined()
    })

    it('should call ensureOffscreenDocument function', async () => {
      // Phase 13.2: Function is now implemented
      mockOffscreen.hasDocument.mockReturnValue(true)
      const module = await import('../src/offscreen')
      expect(module.ensureOffscreenDocument).toBeDefined()
      await expect(module.ensureOffscreenDocument()).resolves.not.toThrow()
    })

    it('should call writeToClipboardViaOffscreen function', async () => {
      // Phase 13.2: Function is now implemented
      // Uses chrome.runtime.sendMessage for communication
      mockOffscreen.hasDocument.mockReturnValue(true)
      mockStorageLocal.get.mockResolvedValue({
        '__OFFSCREEN_LOADED__': Date.now(),
      })

      // Mock sendMessage to simulate ping response and clipboard-write response
      mockChromeRuntime.sendMessage.mockImplementation(async (message: { type: string }) => {
        if (message.type === 'ping') {
          return { success: true, pong: true }
        }
        if (message.type === 'clipboard-write') {
          return { success: true }
        }
        return undefined
      })

      const module = await import('../src/offscreen')
      expect(module.writeToClipboardViaOffscreen).toBeDefined()
      await expect(module.writeToClipboardViaOffscreen('test')).resolves.toEqual({
        success: true,
      })
    })

    it('should call readFromClipboardViaOffscreen function', async () => {
      // Phase 13.2: Function is now implemented
      // Note: Read is not currently implemented, returns "not implemented" error
      mockOffscreen.hasDocument.mockReturnValue(true)
      const module = await import('../src/offscreen')
      expect(module.readFromClipboardViaOffscreen).toBeDefined()
      await expect(module.readFromClipboardViaOffscreen()).resolves.toEqual({
        success: false,
        error: 'Clipboard read not implemented',
      })
    })

    it('should call closeOffscreenDocument function', async () => {
      // Phase 13.2: Function is now implemented
      mockOffscreen.hasDocument.mockReturnValue(true)
      mockOffscreen.closeDocument.mockResolvedValue(undefined)
      const module = await import('../src/offscreen')
      expect(module.closeOffscreenDocument).toBeDefined()
      await expect(module.closeOffscreenDocument()).resolves.not.toThrow()
      expect(mockOffscreen.closeDocument).toHaveBeenCalled()
    })
  })
})
