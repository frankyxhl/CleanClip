import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock chrome.storage.local
const mockStorage: Record<string, any> = {}

const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | Record<string, any>) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: mockStorage[keys] })
        } else if (Array.isArray(keys)) {
          const result: Record<string, any> = {}
          keys.forEach((key) => {
            if (key in mockStorage) {
              result[key] = mockStorage[key]
            }
          })
          return Promise.resolve(result)
        } else {
          // keys is an object with defaults
          const result: Record<string, any> = {}
          for (const key in keys) {
            result[key] = key in mockStorage ? mockStorage[key] : keys[key]
          }
          return Promise.resolve(result)
        }
      }),
      set: vi.fn((items: Record<string, any>) => {
        Object.assign(mockStorage, items)
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        return Promise.resolve()
      })
    }
  }
}

// Declare global chrome
declare global {
  const chrome: typeof mockChrome | undefined
}

describe('chrome.storage.local API', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
    // Reset mock call counts
    vi.clearAllMocks()
    // Set global chrome
    global.chrome = mockChrome
  })

  describe('API Key storage and retrieval', () => {
    it('should save API Key to chrome.storage.local', async () => {
      const apiKey = 'test-api-key-12345'

      await chrome!.storage.local.set({ apiKey })

      expect(chrome!.storage.local.set).toHaveBeenCalledWith({ apiKey })
      expect(mockStorage.apiKey).toBe(apiKey)
    })

    it('should retrieve API Key from chrome.storage.local', async () => {
      const apiKey = 'test-api-key-67890'
      mockStorage.apiKey = apiKey

      const result = await chrome!.storage.local.get('apiKey')

      expect(chrome!.storage.local.get).toHaveBeenCalledWith('apiKey')
      expect(result.apiKey).toBe(apiKey)
    })

    it('should return undefined for non-existent API Key', async () => {
      const result = await chrome!.storage.local.get('apiKey')

      expect(result.apiKey).toBeUndefined()
    })

    it('should update existing API Key', async () => {
      const initialKey = 'initial-key'
      const updatedKey = 'updated-key'

      await chrome!.storage.local.set({ apiKey: initialKey })
      expect(mockStorage.apiKey).toBe(initialKey)

      await chrome!.storage.local.set({ apiKey: updatedKey })
      expect(mockStorage.apiKey).toBe(updatedKey)
    })
  })

  describe('Output format storage and retrieval', () => {
    it('should save output format to chrome.storage.local', async () => {
      const outputFormat = 'markdown'

      await chrome!.storage.local.set({ outputFormat })

      expect(chrome!.storage.local.set).toHaveBeenCalledWith({ outputFormat })
      expect(mockStorage.outputFormat).toBe(outputFormat)
    })

    it('should retrieve output format from chrome.storage.local', async () => {
      const outputFormat = 'text'
      mockStorage.outputFormat = outputFormat

      const result = await chrome!.storage.local.get('outputFormat')

      expect(result.outputFormat).toBe(outputFormat)
    })

    it('should support both text and markdown formats', async () => {
      await chrome!.storage.local.set({ outputFormat: 'text' })
      expect(mockStorage.outputFormat).toBe('text')

      await chrome!.storage.local.set({ outputFormat: 'markdown' })
      expect(mockStorage.outputFormat).toBe('markdown')
    })
  })

  describe('Text processing options storage and retrieval', () => {
    it('should save removeLinebreaks option to chrome.storage.local', async () => {
      const removeLinebreaks = true

      await chrome!.storage.local.set({ removeLinebreaks })

      expect(chrome!.storage.local.set).toHaveBeenCalledWith({ removeLinebreaks })
      expect(mockStorage.removeLinebreaks).toBe(removeLinebreaks)
    })

    it('should save mergeSpaces option to chrome.storage.local', async () => {
      const mergeSpaces = true

      await chrome!.storage.local.set({ mergeSpaces })

      expect(chrome!.storage.local.set).toHaveBeenCalledWith({ mergeSpaces })
      expect(mockStorage.mergeSpaces).toBe(mergeSpaces)
    })

    it('should retrieve removeLinebreaks option from chrome.storage.local', async () => {
      mockStorage.removeLinebreaks = false

      const result = await chrome!.storage.local.get('removeLinebreaks')

      expect(result.removeLinebreaks).toBe(false)
    })

    it('should retrieve mergeSpaces option from chrome.storage.local', async () => {
      mockStorage.mergeSpaces = true

      const result = await chrome!.storage.local.get('mergeSpaces')

      expect(result.mergeSpaces).toBe(true)
    })

    it('should handle boolean toggles correctly', async () => {
      await chrome!.storage.local.set({ removeLinebreaks: true })
      expect(mockStorage.removeLinebreaks).toBe(true)

      await chrome!.storage.local.set({ removeLinebreaks: false })
      expect(mockStorage.removeLinebreaks).toBe(false)

      await chrome!.storage.local.set({ mergeSpaces: true })
      expect(mockStorage.mergeSpaces).toBe(true)

      await chrome!.storage.local.set({ mergeSpaces: false })
      expect(mockStorage.mergeSpaces).toBe(false)
    })
  })

  describe('Complete settings storage and retrieval', () => {
    it('should save all settings at once', async () => {
      const settings = {
        apiKey: 'test-api-key',
        outputFormat: 'markdown',
        removeLinebreaks: true,
        mergeSpaces: false
      }

      await chrome!.storage.local.set(settings)

      expect(mockStorage.apiKey).toBe('test-api-key')
      expect(mockStorage.outputFormat).toBe('markdown')
      expect(mockStorage.removeLinebreaks).toBe(true)
      expect(mockStorage.mergeSpaces).toBe(false)
    })

    it('should retrieve all settings at once with defaults', async () => {
      mockStorage.apiKey = 'stored-key'
      mockStorage.outputFormat = 'text'

      const defaults = {
        apiKey: '',
        outputFormat: 'text',
        removeLinebreaks: true,
        mergeSpaces: true
      }

      const result = await chrome!.storage.local.get(defaults)

      expect(result.apiKey).toBe('stored-key')
      expect(result.outputFormat).toBe('text')
      expect(result.removeLinebreaks).toBe(true) // default
      expect(result.mergeSpaces).toBe(true) // default
    })

    it('should retrieve multiple specific keys', async () => {
      mockStorage.apiKey = 'test-key'
      mockStorage.outputFormat = 'markdown'
      mockStorage.removeLinebreaks = false

      const result = await chrome!.storage.local.get(['apiKey', 'outputFormat'])

      expect(result.apiKey).toBe('test-key')
      expect(result.outputFormat).toBe('markdown')
      expect(result.removeLinebreaks).toBeUndefined()
    })
  })

  describe('Storage operations', () => {
    it('should clear all stored data', async () => {
      mockStorage.apiKey = 'test-key'
      mockStorage.outputFormat = 'markdown'

      expect(mockStorage.apiKey).toBe('test-key')
      expect(mockStorage.outputFormat).toBe('markdown')

      await chrome!.storage.local.clear()

      expect(mockStorage.apiKey).toBeUndefined()
      expect(mockStorage.outputFormat).toBeUndefined()
      expect(Object.keys(mockStorage).length).toBe(0)
    })
  })
})
