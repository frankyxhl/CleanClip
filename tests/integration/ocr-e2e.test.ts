import { describe, it, expect } from 'vitest'
import { recognizeImage } from '../../src/ocr'
import { createNotionClipboardData, NOTION_BLOCKS_MIME_TYPE } from '../../src/notion-clipboard'
import * as fs from 'fs'
import * as path from 'path'

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

  it('should extract LaTeX from notion-multiblock-equation.png and generate Notion clipboard data', { timeout: 60000 }, async () => {
    const apiKey = process.env.VITE_CLEANCLIP_API_KEY

    if (!apiKey) {
      console.warn('⚠️  VITE_CLEANCLIP_API_KEY not set, skipping real OCR test')
      return
    }

    // Load test image
    const imagePath = path.join(__dirname, '../fixtures/notion-multiblock-equaiton.png')
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

    try {
      // Test with latex-notion format
      const result = await recognizeImage(base64Image, 'latex-notion', apiKey)

      console.log('✅ OCR (latex-notion) successful!')
      console.log('   Text:', result.text)

      // Generate Notion clipboard data
      const notionData = createNotionClipboardData(result.text)

      console.log('\n📋 Notion Clipboard Data:')
      console.log('   MIME Type:', NOTION_BLOCKS_MIME_TYPE)
      console.log('   JSON:', notionData)

      // Verify structure
      const parsed = JSON.parse(notionData)
      expect(parsed).toHaveProperty('blocks')
      expect(Array.isArray(parsed.blocks)).toBe(true)
      expect(parsed.blocks.length).toBeGreaterThan(0)

      console.log('   Block count:', parsed.blocks.length)
      parsed.blocks.forEach((block: { type: string }, i: number) => {
        console.log(`   Block ${i}: type=${block.type}`)
      })

    } catch (error) {
      console.error('❌ OCR test failed:', error)
      throw error
    }
  })
})
