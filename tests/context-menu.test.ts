import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock chrome.runtime, chrome.contextMenus, chrome.notifications APIs
const mockContextMenus: {
  create: ReturnType<typeof vi.fn>
  onClicked: {
    addListener: ReturnType<typeof vi.fn>
    listeners: Array<(info: any, tab: any) => void>
  }
} = {
  create: vi.fn(),
  onClicked: {
    addListener: vi.fn(),
    listeners: []
  }
}

const mockNotifications = {
  create: vi.fn()
}

const mockRuntime = {
  onInstalled: {
    addListener: vi.fn()
  },
  onMessage: {
    addListener: vi.fn()
  }
}

const mockCommands = {
  onCommand: {
    addListener: vi.fn()
  }
}

const mockChrome = {
  runtime: mockRuntime,
  contextMenus: mockContextMenus,
  notifications: mockNotifications,
  commands: mockCommands
}

// Extend global window with chrome
declare global {
  // eslint-disable-next-line no-var
  var chrome: typeof mockChrome
}

describe('Context menu registration', () => {
  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks()
    mockContextMenus.onClicked.listeners = []
    // Set global chrome
    global.chrome = mockChrome
    // Clear module cache to re-import background script
    vi.resetModules()
  })

  it('should register context menu on extension install', async () => {
    // Import background script to trigger registration
    await import('../src/background')

    // Manually trigger onInstalled callback
    const onInstalledCallback = (chrome!.runtime.onInstalled.addListener as any).mock.calls[0][0]
    onInstalledCallback()

    // Verify contextMenus.create was called
    expect(chrome!.contextMenus.create).toHaveBeenCalled()
  })

  it('should create context menu with correct title', async () => {
    await import('../src/background')

    // Manually trigger onInstalled callback
    const onInstalledCallback = (chrome!.runtime.onInstalled.addListener as any).mock.calls[0][0]
    onInstalledCallback()

    const createCall = chrome!.contextMenus.create as any
    expect(createCall).toHaveBeenCalled()

    const options = createCall.mock.calls[0][0]
    expect(options.title).toBe('CleanClip: Recognize Text')
  })

  it('should set up click handler for context menu', async () => {
    await import('../src/background')

    // Verify onClicked listener was registered
    expect(chrome!.contextMenus.onClicked.addListener).toHaveBeenCalled()
  })

  it('should only show menu on images (contexts: ["image"])', async () => {
    await import('../src/background')

    // Manually trigger onInstalled callback
    const onInstalledCallback = (chrome!.runtime.onInstalled.addListener as any).mock.calls[0][0]
    onInstalledCallback()

    const createCall = chrome!.contextMenus.create as any
    const options = createCall.mock.calls[0][0]

    // Verify contexts is set to ['image'] only
    expect(options.contexts).toEqual(['image'])
  })

  it('should extract image URL when context menu is clicked', async () => {
    await import('../src/background')

    const testImageUrl = 'https://example.com/test-image.png'
    const mockInfo = { srcUrl: testImageUrl }
    const mockTab = { id: 1 }

    // Mock fetch to prevent real network calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: vi.fn(() => Promise.resolve(new Blob()))
      } as Response)
    ) as any

    // Get the onClicked callback
    const onClickedCallback = (chrome!.contextMenus.onClicked.addListener as any).mock.calls[0][0]

    // Trigger the click handler
    await onClickedCallback(mockInfo, mockTab)

    // Verify fetch was called with the image URL (behavior assertion, not console content)
    expect(global.fetch).toHaveBeenCalledWith(testImageUrl)
  })

  it('should fetch image and convert to base64 when clicked', async () => {
    await import('../src/background')

    const testImageUrl = 'https://example.com/test-image.png'
    const mockInfo = { srcUrl: testImageUrl }
    const mockTab = { id: 1 }

    // Mock fetch to return image data
    const mockImageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG signature
    const mockBlob = {
      arrayBuffer: vi.fn(() => Promise.resolve(mockImageData.buffer))
    }
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: vi.fn(() => Promise.resolve(mockBlob))
      } as Response)
    ) as any

    // Get the onClicked callback
    const onClickedCallback = (chrome!.contextMenus.onClicked.addListener as any).mock.calls[0][0]

    // Trigger the click handler
    await onClickedCallback(mockInfo, mockTab)

    // Verify fetch was called (behavior assertion)
    expect(global.fetch).toHaveBeenCalledWith(testImageUrl)
    expect(mockBlob.arrayBuffer).toHaveBeenCalled()
  })
})
