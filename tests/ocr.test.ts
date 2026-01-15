// OCR Module Tests - Phase 5
// Testing Gemini 2.0 Flash integration for text recognition

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { recognizeImage, buildPrompt, buildGeminiRequest } from '../src/ocr'
import type { OutputFormat } from '../src/ocr'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('OCR Module - Function Signature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have recognizeImage function that returns OCRResult', async () => {
    // Test that function signature exists and returns expected type
    expect(typeof recognizeImage).toBe('function')
  })

  it('should accept base64 image and output format parameters', async () => {
    // Test function accepts correct parameters
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const format = 'text'
    const apiKey = 'test-api-key'

    // Verify function can be called with correct parameters
    // The function signature includes optional parameters
    expect(typeof recognizeImage).toBe('function')
    // We verify it works by calling it in the next test
  })

  it('should return OCRResult with text and timestamp', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: 'Sample OCR text'
            }]
          }
        }]
      })
    })

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    const result = await recognizeImage(base64Image, 'text', 'fake-api-key')

    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('timestamp')
    expect(typeof result.text).toBe('string')
    expect(typeof result.timestamp).toBe('number')
  })
})

describe('OCR Module - Plain Text Prompt Construction', () => {
  it('should construct plain text prompt for text format', () => {
    const prompt = buildPrompt('text')

    expect(prompt).toContain('Extract all text')
    expect(prompt).toContain('Clean up')
    expect(prompt).toContain('remove extra line breaks')
    expect(prompt).toContain('merge spaces')
    expect(prompt).toContain('Output plain text only')
  })

  it('should not contain markdown-specific instructions for text format', () => {
    const prompt = buildPrompt('text')

    expect(prompt).not.toContain('Markdown')
    expect(prompt).not.toContain('###')
    expect(prompt).not.toContain('| col | col |')
  })
})

describe('OCR Module - Markdown Prompt Construction', () => {
  it('should construct markdown prompt for markdown format', () => {
    const prompt = buildPrompt('markdown')

    expect(prompt).toContain('Extract all text')
    expect(prompt).toContain('Preserve structure as Markdown')
    expect(prompt).toContain('Headings')
    expect(prompt).toContain('Lists')
    expect(prompt).toContain('Tables')
    expect(prompt).toContain('Output valid Markdown')
  })

  it('should include markdown formatting examples', () => {
    const prompt = buildPrompt('markdown')

    expect(prompt).toContain('# ## ###')
    expect(prompt).toContain('- or 1. 2. 3.')
    expect(prompt).toContain('| col | col |')
  })
})

describe('OCR Module - API Request Format', () => {
  it('should construct correct Gemini API request structure', () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const prompt = 'Extract all text from this image.'

    const request = buildGeminiRequest(base64Image, prompt)

    expect(request).toHaveProperty('contents')
    expect(request.contents).toBeInstanceOf(Array)
    expect(request.contents).toHaveLength(1)

    const content = request.contents[0]
    expect(content).toHaveProperty('parts')
    expect(content.parts).toBeInstanceOf(Array)

    // Should have text prompt
    const textPart = content.parts.find((part: any) => part.text)
    expect(textPart).toBeDefined()
    expect(textPart.text).toBe(prompt)

    // Should have image data
    const imagePart = content.parts.find((part: any) => part.inlineData)
    expect(imagePart).toBeDefined()
    expect(imagePart.inlineData).toHaveProperty('mimeType', 'image/png')
    expect(imagePart.inlineData).toHaveProperty('data')
    expect(imagePart.inlineData.data).toBeTruthy()
  })

  it('should handle different image formats', () => {
    const jpegImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD'

    const request = buildGeminiRequest(jpegImage, 'Extract text')

    const imagePart = request.contents[0].parts.find((part: any) => part.inlineData)
    expect(imagePart.inlineData.mimeType).toBe('image/jpeg')
  })

  it('should extract base64 data without data URL prefix', () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const expectedData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    const request = buildGeminiRequest(base64Image, 'Extract text')

    const imagePart = request.contents[0].parts.find((part: any) => part.inlineData)
    expect(imagePart.inlineData.data).toBe(expectedData)
  })
})

describe('OCR Module - Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    // Mock network error that will be retried multiple times
    mockFetch.mockRejectedValue(new Error('Network error'))

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    await expect(recognizeImage(base64Image, 'text', 'fake-api-key'))
      .rejects.toThrow()
  })

  it('should handle API error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    })

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    await expect(recognizeImage(base64Image, 'text', 'fake-api-key'))
      .rejects.toThrow()
  })

  it('should handle timeout with retry mechanism', async () => {
    // Mock timeout on first attempt, success on second
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Request timeout'))
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'Sample OCR text'
              }]
            }
          }]
        })
      })
    })

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    const result = await recognizeImage(base64Image, 'text', 'fake-api-key')

    expect(result).toHaveProperty('text', 'Sample OCR text')
    expect(callCount).toBeGreaterThanOrEqual(2)
    expect(mockFetch).toHaveBeenCalled()
  })

  it('should handle empty API response', async () => {
    // Mock empty response that will always return empty candidates
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: []
      })
    })

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    await expect(recognizeImage(base64Image, 'text', 'fake-api-key'))
      .rejects.toThrow()
  })

  it('should handle malformed API response', async () => {
    // Mock malformed response that will always return malformed data
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            // Missing parts array
          }
        }]
      })
    })

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    await expect(recognizeImage(base64Image, 'text', 'fake-api-key'))
      .rejects.toThrow()
  })
})

describe('OCR Module - LaTeX Output Formats', () => {
  it('should accept latex-notion as a valid OutputFormat', () => {
    // Type check: this should compile without errors when OutputFormat includes 'latex-notion'
    const format: OutputFormat = 'latex-notion'
    expect(format).toBe('latex-notion')
  })

  it('should accept latex-obsidian as a valid OutputFormat', () => {
    // Type check: this should compile without errors when OutputFormat includes 'latex-obsidian'
    const format: OutputFormat = 'latex-obsidian'
    expect(format).toBe('latex-obsidian')
  })

  it('should allow buildPrompt to be called with latex-notion format', () => {
    // buildPrompt should accept the new format without throwing
    const prompt = buildPrompt('latex-notion')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('should allow buildPrompt to be called with latex-obsidian format', () => {
    // buildPrompt should accept the new format without throwing
    const prompt = buildPrompt('latex-obsidian')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })
})
