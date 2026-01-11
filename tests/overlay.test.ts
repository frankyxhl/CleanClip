// @vitest-environment happy-dom
// Overlay Tests for CleanClip
// Tests for content script overlay functionality

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Track message handler to simulate message passing
let messageHandler: ((message: any, sender: any, sendResponse: any) => boolean | void) | null = null

// Mock chrome API
const mockRuntime = {
  sendMessage: vi.fn((message: any) => {
    if (messageHandler) {
      // Simulate Chrome API: call the handler and return response
      let response: any = null
      const sendResponse = (res: any) => { response = res }
      messageHandler(message, {}, sendResponse)
      // Return promise with response (Chrome API supports this for async responses)
      return Promise.resolve(response || {})
    }
    return Promise.resolve({})
  }),
  getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
  onMessage: {
    addListener: vi.fn((callback: (message: any, sender: any, sendResponse: any) => boolean | void) => {
      messageHandler = callback
      return {
        removeListener: vi.fn()
      }
    })
  }
}

const mockChrome = {
  runtime: mockRuntime
}

vi.stubGlobal('chrome', mockChrome)

describe('Overlay - Content Script', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Reset DOM
    document.body.innerHTML = ''
  })

  it('should respond to CLEANCLIP_PING message', async () => {
    // Import overlay module
    await import('../src/content/overlay')

    // Send PING message
    const response = await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_PING'
    })

    expect(response).toEqual({ success: true })
  })

  it('should respond to CLEANCLIP_SHOW_OVERLAY message', async () => {
    // Import overlay module
    await import('../src/content/overlay')

    // Send SHOW_OVERLAY message
    const response = await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_SHOW_OVERLAY'
    })

    expect(response).toEqual({ success: true })
    expect(document.querySelector('#cleanclip-overlay')).toBeTruthy()
  })

  it('should create overlay with correct styles when shown', async () => {
    // Import overlay module
    await import('../src/content/overlay')

    // Send SHOW_OVERLAY message
    await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_SHOW_OVERLAY'
    })

    const overlay = document.querySelector('#cleanclip-overlay') as HTMLElement
    expect(overlay).toBeTruthy()
    expect(overlay?.style.position).toBe('fixed')
    expect(overlay?.style.zIndex).toBe('2147483647')
  })

  it('should create selection box inside overlay', async () => {
    // Import overlay module
    await import('../src/content/overlay')

    // Send SHOW_OVERLAY message
    await chrome.runtime.sendMessage({
      type: 'CLEANCLIP_SHOW_OVERLAY'
    })

    const selectionBox = document.querySelector('#cleanclip-selection')
    expect(selectionBox).toBeTruthy()
  })
})
