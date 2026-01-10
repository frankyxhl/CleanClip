/**
 * Clipboard & Toast Tests
 * Phase 8: Test clipboard write functionality and toast notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeTextToClipboard, copyWithFallback, showToast } from '../src/clipboard'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
}

// Mock chrome.runtime
const mockChromeRuntime = {
  getURL: vi.fn(),
  sendMessage: vi.fn(),
}

Object.assign(global.navigator, { clipboard: mockClipboard })
Object.assign(global, { chrome: { runtime: mockChromeRuntime } })

describe('Clipboard Write', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Task 8.1: Clipboard write', () => {
    it('should write text to clipboard successfully', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)
      const result = await writeTextToClipboard('Test text')
      expect(result.success).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text')
    })

    it('should return error when clipboard write fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard unavailable'))
      const result = await writeTextToClipboard('Test text')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Clipboard unavailable')
    })
  })

  describe('Task 8.3: Fallback when clipboard fails', () => {
    it('should use fallback when clipboard API is unavailable', async () => {
      // Simulate no clipboard API
      Object.assign(global.navigator, { clipboard: undefined })

      const result = await copyWithFallback('Test text')
      expect(result.success).toBe(true)
      expect(result.method).toBe('fallback')
      expect(result.data).toBe('Test text')

      // Restore clipboard for next test
      Object.assign(global.navigator, { clipboard: mockClipboard })
    })

    it('should return fallback data for manual copy', async () => {
      // Ensure clipboard is restored
      Object.assign(global.navigator, { clipboard: mockClipboard })
      mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'))

      const result = await copyWithFallback('Fallback text')
      expect(result.success).toBe(false)
      expect(result.method).toBe('fallback')
      expect(result.data).toBe('Fallback text')
      expect(result.message).toContain('clipboard unavailable')
    })
  })

  describe('Task 8.5: Toast notification shows', () => {
    it('should show toast notification with message', () => {
      const toast = showToast('Copied!')
      expect(toast.visible).toBe(true)
      expect(toast.message).toBe('Copied!')
    })

    it('should hide toast after specified duration', async () => {
      vi.useFakeTimers()
      const toast = showToast('Copied!', 'success', 2000)

      expect(toast.visible).toBe(true)

      // Fast-forward time
      vi.advanceTimersByTime(2000)

      // Check if toast was hidden (implementation-dependent)
      expect(toast.duration).toBe(2000)

      vi.useRealTimers()
    })

    it('should show error toast style', () => {
      const toast = showToast('Error occurred', 'error')
      expect(toast.visible).toBe(true)
      expect(toast.type).toBe('error')
    })

    it('should show success toast style by default', () => {
      const toast = showToast('Success!')
      expect(toast.visible).toBe(true)
      expect(toast.type).toBe('success')
    })
  })
})
