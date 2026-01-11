// Capture Area Tests for CleanClip
// Tests for the captureArea function that crops screenshots

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CaptureAreaResult } from '../src/background'

// Mock other modules
vi.mock('../src/ocr', () => ({
  recognizeImage: vi.fn(() => Promise.resolve({
    text: 'Test OCR result',
    timestamp: Date.now()
  }))
}))

// Mock offscreen module
vi.mock('../src/offscreen', () => ({
  writeToClipboardViaOffscreen: vi.fn(() => Promise.resolve({ success: true }))
}))

// Mock clipboard module - background.ts imports ensureOffscreenDocument from here
vi.mock('../src/offscreen/clipboard', () => ({
  ensureOffscreenDocument: vi.fn(() => Promise.resolve()),
  processClipboardWriteRequest: vi.fn(),
  processClipboardReadRequest: vi.fn()
}))

vi.mock('../src/history', () => ({
  addToHistory: vi.fn(() => Promise.resolve())
}))

describe('captureArea - Screenshot Cropping', () => {
  let captureArea: (selection: { x: number; y: number; width: number; height: number }, debugInfo?: any) => Promise<CaptureAreaResult>

  let messageHandler: ((message: any, sender: any, sendResponse: any) => boolean | void) | null = null

  const mockRuntime = {
    getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
    sendMessage: vi.fn((message: any) => {
      if (messageHandler) {
        let response: any = null
        const sendResponse = (res: any) => { response = res }
        messageHandler(message, {}, sendResponse)
        return Promise.resolve(response || {})
      }
      return Promise.resolve({})
    }),
    onMessage: {
      addListener: vi.fn((callback: (message: any, sender: any, sendResponse: any) => boolean | void) => {
        messageHandler = callback
        return {
          removeListener: vi.fn()
        }
      })
    },
    onInstalled: {
      addListener: vi.fn(() => ({}))
    }
  }

  const mockTabs = {
    captureVisibleTab: vi.fn(() => Promise.resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))
  }

  const mockStorage = {
    data: {} as Record<string, any>,
    get: vi.fn((keys: string | string[]) => {
      const result: Record<string, any> = {}
      const keyArray = Array.isArray(keys) ? keys : [keys]
      for (const key of keyArray) {
        if (mockStorage.data[key] !== undefined) {
          result[key] = mockStorage.data[key]
        }
      }
      return Promise.resolve(result)
    }),
    set: vi.fn((items: Record<string, any>) => {
      Object.assign(mockStorage.data, items)
      return Promise.resolve()
    }),
    remove: vi.fn((keys: string | string[]) => {
      const keyArray = Array.isArray(keys) ? keys : [keys]
      for (const key of keyArray) {
        delete mockStorage.data[key]
      }
      return Promise.resolve()
    }),
    onChanged: {
      addListener: vi.fn(() => ({}))
    }
  }

  const mockChrome = {
    runtime: mockRuntime,
    tabs: mockTabs,
    storage: {
      local: mockStorage,
      onChanged: {
        addListener: vi.fn(() => ({}))
      }
    },
    notifications: {
      create: vi.fn(() => Promise.resolve('notification-id'))
    },
    commands: {
      onCommand: {
        addListener: vi.fn(() => ({}))
      }
    },
    contextMenus: {
      create: vi.fn(() => Promise.resolve('menu-id')),
      onClicked: {
        addListener: vi.fn(() => ({}))
      }
    }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockStorage.data = {}

    // Set chrome global before each test
    vi.stubGlobal('chrome', mockChrome)
    ;(global as any).chrome = mockChrome

    // Mock OffscreenCanvas
    global.OffscreenCanvas = class {
      width: number
      height: number

      constructor(width: number, height: number) {
        this.width = width
        this.height = height
      }

      getContext(_type: string) {
        return {
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(this.width * this.height * 4).fill(0)
          }))
        }
      }

      convertToBlob() {
        return Promise.resolve(new Blob(['fake'], { type: 'image/png' }))
      }
    } as any

    // Mock FileReader
    global.FileReader = class {
      onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
      result: string | null = 'data:image/png;base64,ZmFrZQ=='

      readAsDataURL(_blob: Blob) {
        // Simulate async loading
        setTimeout(() => {
          if (this.onloadend) {
            this.onloadend({ target: this } as ProgressEvent<FileReader>)
          }
        }, 10)
      }
    } as any

    // Mock createImageBitmap (available in service workers)
    global.createImageBitmap = vi.fn((blob: Blob) => {
      return Promise.resolve({
        width: 1920,
        height: 1080,
        close: vi.fn()
      } as any)
    }) as any

    // Mock fetch for dataUrlToBlob
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        blob: () => Promise.resolve(new Blob(['fake'], { type: 'image/png' }))
      })
    }) as any

    // Dynamic import to ensure chrome mock is set up
    const bg = await import('../src/background')
    captureArea = bg.captureArea
  })

  it('should crop captured screenshot directly without polling storage', async () => {
    // This test verifies that captureArea crops the screenshot in the background
    // instead of writing to storage and waiting for a response (which times out)

    const selection = { x: 100, y: 100, width: 200, height: 150 }

    // Mock Image loading - return a 10x10 transparent PNG
    global.Image = class {
      onload: (() => void) | null = null
      onerror: ((error: any) => void) | null = null
      src = ''
      width = 1920
      height = 1080

      constructor() {
        // Simulate async loading
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      }
    } as any

    // This should succeed without timeout
    const result = await captureArea(selection, {
      devicePixelRatio: 1,
      zoomLevel: 1,
      viewportSize: { width: 1920, height: 1080 }
    })

    // Should have base64 result
    expect(result.base64).toBeTruthy()
    expect(result.base64.length).toBeGreaterThan(0)
  }, 15000)

  it('should handle selection with correct coordinates', async () => {
    const selection = { x: 50, y: 50, width: 300, height: 200 }

    global.Image = class {
      onload: (() => void) | null = null
      src = ''
      width = 1920
      height = 1080

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      }
    } as any

    const result = await captureArea(selection, {
      devicePixelRatio: 1,
      zoomLevel: 1,
      viewportSize: { width: 1920, height: 1080 }
    })

    expect(result).toBeDefined()
    expect(result.base64).toBeTruthy()
  }, 15000)

  it('should work in service worker environment without Image constructor', async () => {
    // This test verifies that captureArea works in service worker environment
    // where Image constructor is not available
    const selection = { x: 100, y: 100, width: 200, height: 150 }

    // Simulate service worker environment - no Image constructor
    delete (global as any).Image

    // This should succeed using createImageBitmap instead of Image
    const result = await captureArea(selection, {
      devicePixelRatio: 1,
      zoomLevel: 1,
      viewportSize: { width: 1920, height: 1080 }
    })

    // Should have base64 result
    expect(result.base64).toBeTruthy()
    expect(result.base64.length).toBeGreaterThan(0)

    // Should have used createImageBitmap
    expect(global.createImageBitmap).toHaveBeenCalled()
  }, 15000)
})
