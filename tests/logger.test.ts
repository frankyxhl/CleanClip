// @vitest-environment happy-dom
// Logger Module Tests for CleanClip
// Tests for environment-controlled debug output

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Logger Module', () => {
  // Save original environment before each test
  const originalEnv = import.meta.env.VITE_CLEANCLIP_DEBUG

  afterEach(() => {
    // Restore original environment after each test
    vi.stubEnv('VITE_CLEANCLIP_DEBUG', originalEnv)
  })

  it('should export logger module with debug method', async () => {
    const { logger } = await import('../src/logger')
    expect(logger).toBeDefined()
    expect(typeof logger.debug).toBe('function')
  })

  it('should export logger module with info method', async () => {
    const { logger } = await import('../src/logger')
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
  })
})

describe('Logger DEBUG Gate', () => {
  it('should output debug when VITE_CLEANCLIP_DEBUG=true', async () => {
    // Set debug mode
    vi.stubEnv('VITE_CLEANCLIP_DEBUG', 'true')

    // Clear module cache to reload with new env
    vi.resetModules()

    const { logger } = await import('../src/logger')
    const consoleSpy = vi.spyOn(console, 'log')

    logger.debug('test message')

    expect(consoleSpy).toHaveBeenCalledWith('[CleanClip]', 'test message')
    consoleSpy.mockRestore()
  })

  it('should not output debug when VITE_CLEANCLIP_DEBUG is unset', async () => {
    // Unset debug mode
    vi.stubEnv('VITE_CLEANCLIP_DEBUG', undefined)

    // Clear module cache to reload with new env
    vi.resetModules()

    const { logger } = await import('../src/logger')
    const consoleSpy = vi.spyOn(console, 'log')

    logger.debug('test message')

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should not output debug when VITE_CLEANCLIP_DEBUG=false', async () => {
    // Set debug mode to false
    vi.stubEnv('VITE_CLEANCLIP_DEBUG', 'false')

    // Clear module cache to reload with new env
    vi.resetModules()

    const { logger } = await import('../src/logger')
    const consoleSpy = vi.spyOn(console, 'log')

    logger.debug('test message')

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
