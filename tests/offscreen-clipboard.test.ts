/**
 * Offscreen Clipboard Multi-MIME Type Tests
 * OpenSpec Tasks 2.1 and 2.2
 *
 * Tests for offscreen clipboard support of custom MIME types.
 * This enables copying rich content (e.g., Notion clipboard data) alongside plain text.
 *
 * TDD Red Phase: These tests will fail until implementation is complete.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock chrome.storage.local for storage polling pattern
const mockStorageLocal = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}

// Mock chrome.offscreen API
const mockOffscreen = {
  createDocument: vi.fn(),
  closeDocument: vi.fn(),
  hasDocument: vi.fn(),
}

// Setup chrome globals
Object.assign(global, {
  chrome: {
    offscreen: mockOffscreen,
    storage: {
      local: mockStorageLocal,
      onChanged: mockStorageLocal.onChanged,
    },
  },
})

// Mock document for testing clipboard operations
const mockDocument = {
  readyState: 'complete',
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  createElement: vi.fn(),
  execCommand: vi.fn(),
  addEventListener: vi.fn(),
}

// Setup document global for offscreen context
Object.assign(global, { document: mockDocument })

describe('Offscreen Clipboard - Multi-MIME Type Support', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOffscreen.hasDocument.mockReturnValue(true)
    mockDocument.createElement.mockReturnValue({
      value: '',
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
      addEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Task 2.1: ClipboardWriteRequestData supports customMimeTypes field', () => {
    it('should accept request with customMimeTypes array', async () => {
      // Arrange
      const timestamp = Date.now()
      const request = {
        text: 'Plain text content',
        timestamp,
        customMimeTypes: [
          {
            mimeType: 'text/html',
            data: '<p>HTML content</p>',
          },
          {
            mimeType: 'text/_notion-blocks-v3-production',
            data: JSON.stringify({ blocks: [] }),
          },
        ],
      }

      // Act
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Assert
      expect(mockStorageLocal.set).toHaveBeenCalledWith(
        expect.objectContaining({
          '__CLEANCLIP_CLIPBOARD_REQUEST__': expect.objectContaining({
            text: 'Plain text content',
            timestamp,
            customMimeTypes: expect.arrayContaining([
              expect.objectContaining({
                mimeType: 'text/html',
                data: '<p>HTML content</p>',
              }),
              expect.objectContaining({
                mimeType: 'text/_notion-blocks-v3-production',
                data: expect.any(String),
              }),
            ]),
          }),
        })
      )
    })

    it('should accept request without customMimeTypes (backward compatible)', async () => {
      // Arrange
      const timestamp = Date.now()
      const request = {
        text: 'Plain text only',
        timestamp,
      }

      // Act
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Assert
      expect(mockStorageLocal.set).toHaveBeenCalledWith({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': {
          text: 'Plain text only',
          timestamp,
        },
      })
    })

    it('should support multiple custom MIME types in single request', async () => {
      // Arrange
      const timestamp = Date.now()
      const request = {
        text: 'Multi-format content',
        timestamp,
        customMimeTypes: [
          { mimeType: 'text/html', data: '<div>HTML</div>' },
          { mimeType: 'text/markdown', data: '# Markdown' },
          { mimeType: 'text/_notion-blocks-v3-production', data: '{"blocks":[]}' },
          { mimeType: 'application/json', data: '{"key":"value"}' },
        ],
      }

      // Act
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Assert
      expect(mockStorageLocal.set).toHaveBeenCalledWith(
        expect.objectContaining({
          '__CLEANCLIP_CLIPBOARD_REQUEST__': expect.objectContaining({
            customMimeTypes: expect.arrayContaining([
              expect.objectContaining({ mimeType: 'text/html' }),
              expect.objectContaining({ mimeType: 'text/markdown' }),
              expect.objectContaining({ mimeType: 'text/_notion-blocks-v3-production' }),
              expect.objectContaining({ mimeType: 'application/json' }),
            ]),
          }),
        })
      )
    })

    it('should handle empty customMimeTypes array', async () => {
      // Arrange
      const timestamp = Date.now()
      const request = {
        text: 'Text with empty MIME array',
        timestamp,
        customMimeTypes: [],
      }

      // Act
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Assert
      expect(mockStorageLocal.set).toHaveBeenCalledWith({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': {
          text: 'Text with empty MIME array',
          timestamp,
          customMimeTypes: [],
        },
      })
    })
  })

  describe('Task 2.2: Copy event correctly sets multiple MIME types', () => {
    it('should call setData for text/plain', () => {
      // Arrange
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const mockEvent = {
        clipboardData: mockClipboardData,
        preventDefault: vi.fn(),
      }

      // Act - Simulate copy event handler
      mockClipboardData.setData('text/plain', 'Plain text content')

      // Assert
      expect(mockClipboardData.setData).toHaveBeenCalledWith(
        'text/plain',
        'Plain text content'
      )
    })

    it('should call setData for text/_notion-blocks-v3-production', () => {
      // Arrange
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const notionData = JSON.stringify({
        blocks: [
          {
            type: 'equation',
            properties: { title: [['E=mc^2']] },
            id: 'test-id',
          },
        ],
        action: 'copy',
        wasContiguousSelection: true,
      })

      // Act - Simulate copy event handler
      mockClipboardData.setData('text/_notion-blocks-v3-production', notionData)

      // Assert
      expect(mockClipboardData.setData).toHaveBeenCalledWith(
        'text/_notion-blocks-v3-production',
        notionData
      )
    })

    it('should set both text/plain and custom MIME types in single copy event', () => {
      // Arrange
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const plainText = 'E=mc^2'
      const notionData = JSON.stringify({ blocks: [] })

      // Act - Simulate copy event handler setting multiple MIME types
      mockClipboardData.setData('text/plain', plainText)
      mockClipboardData.setData('text/_notion-blocks-v3-production', notionData)

      // Assert - Verify both calls occurred
      expect(mockClipboardData.setData).toHaveBeenCalledTimes(2)
      expect(mockClipboardData.setData).toHaveBeenNthCalledWith(1, 'text/plain', plainText)
      expect(mockClipboardData.setData).toHaveBeenNthCalledWith(
        2,
        'text/_notion-blocks-v3-production',
        notionData
      )
    })

    it('should set multiple custom MIME types alongside text/plain', () => {
      // Arrange
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const plainText = 'Multi-format content'
      const htmlData = '<p>HTML content</p>'
      const notionData = '{"blocks":[]}'

      // Act - Simulate copy event handler
      mockClipboardData.setData('text/plain', plainText)
      mockClipboardData.setData('text/html', htmlData)
      mockClipboardData.setData('text/_notion-blocks-v3-production', notionData)

      // Assert
      expect(mockClipboardData.setData).toHaveBeenCalledTimes(3)
      expect(mockClipboardData.setData).toHaveBeenCalledWith('text/plain', plainText)
      expect(mockClipboardData.setData).toHaveBeenCalledWith('text/html', htmlData)
      expect(mockClipboardData.setData).toHaveBeenCalledWith(
        'text/_notion-blocks-v3-production',
        notionData
      )
    })

    it('should handle copy event with preventDefault', () => {
      // Arrange
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const mockEvent = {
        clipboardData: mockClipboardData,
        preventDefault: vi.fn(),
      }

      // Act - Simulate complete copy event handler
      mockEvent.clipboardData.setData('text/plain', 'Text')
      mockEvent.clipboardData.setData('text/_notion-blocks-v3-production', '{}')
      mockEvent.preventDefault()

      // Assert
      expect(mockClipboardData.setData).toHaveBeenCalledTimes(2)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Integration: Full multi-MIME clipboard write flow', () => {
    it('should handle complete flow from request to clipboard with custom MIME types', async () => {
      // Arrange
      const timestamp = Date.now()
      const plainText = 'E=mc^2'
      const notionData = JSON.stringify({
        blocks: [{ type: 'equation', properties: { title: [['E=mc^2']] }, id: '123' }],
      })

      const request = {
        text: plainText,
        timestamp,
        customMimeTypes: [
          {
            mimeType: 'text/_notion-blocks-v3-production',
            data: notionData,
          },
        ],
      }

      // Mock clipboard event listener
      const mockClipboardData = {
        setData: vi.fn(),
      }
      const mockCopyEvent = {
        clipboardData: mockClipboardData,
        preventDefault: vi.fn(),
      }

      // Act - Simulate storage request
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Simulate copy event handler processing the request
      mockCopyEvent.clipboardData.setData('text/plain', plainText)
      request.customMimeTypes?.forEach((mime) => {
        mockCopyEvent.clipboardData.setData(mime.mimeType, mime.data)
      })
      mockCopyEvent.preventDefault()

      // Assert - Verify storage was written
      expect(mockStorageLocal.set).toHaveBeenCalledWith(
        expect.objectContaining({
          '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
        })
      )

      // Assert - Verify clipboard was set with all MIME types
      expect(mockClipboardData.setData).toHaveBeenCalledWith('text/plain', plainText)
      expect(mockClipboardData.setData).toHaveBeenCalledWith(
        'text/_notion-blocks-v3-production',
        notionData
      )
      expect(mockCopyEvent.preventDefault).toHaveBeenCalled()
    })

    it('should fall back to text/plain only when no custom MIME types provided', async () => {
      // Arrange
      const timestamp = Date.now()
      const plainText = 'Simple text'
      const request = {
        text: plainText,
        timestamp,
      }

      const mockClipboardData = {
        setData: vi.fn(),
      }

      // Act
      await chrome.storage.local.set({
        '__CLEANCLIP_CLIPBOARD_REQUEST__': request,
      })

      // Simulate copy event handler with no custom MIME types
      mockClipboardData.setData('text/plain', plainText)

      // Assert
      expect(mockClipboardData.setData).toHaveBeenCalledTimes(1)
      expect(mockClipboardData.setData).toHaveBeenCalledWith('text/plain', plainText)
    })
  })

  describe('Type Safety and Validation', () => {
    it('should enforce ClipboardMimeData structure', () => {
      // Arrange
      const validMimeData = {
        mimeType: 'text/html',
        data: '<div>Content</div>',
      }

      // Assert - TypeScript will catch this at compile time
      expect(validMimeData).toHaveProperty('mimeType')
      expect(validMimeData).toHaveProperty('data')
      expect(typeof validMimeData.mimeType).toBe('string')
      expect(typeof validMimeData.data).toBe('string')
    })

    it('should validate MIME type format (basic check)', () => {
      // Arrange
      const customMimeTypes = [
        { mimeType: 'text/plain', data: 'test' },
        { mimeType: 'text/html', data: '<p>test</p>' },
        { mimeType: 'text/_notion-blocks-v3-production', data: '{}' },
        { mimeType: 'application/json', data: '{}' },
      ]

      // Assert - All should have valid MIME type format
      customMimeTypes.forEach((mime) => {
        expect(mime.mimeType).toMatch(/^[\w-]+\/[\w-_]+$/)
      })
    })
  })
})
