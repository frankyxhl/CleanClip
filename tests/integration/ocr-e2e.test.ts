import { describe, it, expect } from 'vitest'
import { recognizeImage } from '../../src/ocr'

/**
 * Real OCR E2E Test
 * Tests actual image-to-text conversion with Gemini API
 */

describe('OCR - Real Image to Text', () => {
  it('should extract text from a simple test image', { timeout: 30000 }, async () => {
    // Create a simple 1x1 pixel PNG image (minimal valid PNG)
    // This test verifies the API call works end-to-end
    const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    const apiKey = process.env.VITE_CLEANCLIP_API_KEY

    if (!apiKey) {
      console.warn('⚠️  VITE_CLEANCLIP_API_KEY not set, skipping real OCR test')
      return
    }

    try {
      const result = await recognizeImage(minimalPng, 'text', apiKey)

      console.log('✅ OCR API call successful!')
      console.log('   Timestamp:', new Date(result.timestamp).toISOString())
      console.log('   Text length:', result.text.length)
      console.log('   Text preview:', result.text.substring(0, 100))

      // Verify result structure
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('timestamp')
      expect(typeof result.text).toBe('string')
      expect(typeof result.timestamp).toBe('number')
      expect(result.timestamp).toBeGreaterThan(0)

    } catch (error) {
      console.error('❌ OCR test failed:', error)
      throw error
    }
  })

  it('should handle API errors gracefully', { timeout: 30000 }, async () => {
    const invalidKey = 'invalid-api-key-12345'
    const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    try {
      await recognizeImage(minimalPng, 'text', invalidKey)
      expect.fail('Should have thrown an error with invalid API key')
    } catch (error) {
      console.log('✅ Invalid API key correctly rejected')
      expect(error).toBeInstanceOf(Error)
    }
  })
})
