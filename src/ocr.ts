// OCR Module for CleanClip
// Integrates with Gemini 2.0 Flash API for text recognition

export interface OCRResult {
  text: string
  timestamp: number
}

export type OutputFormat = 'text' | 'markdown'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
const MAX_RETRIES = 3
const REQUEST_TIMEOUT = 30000 // 30 seconds

/**
 * Build prompt based on output format
 */
export function buildPrompt(format: OutputFormat): string {
  if (format === 'markdown') {
    return `Extract all text from this image.
Preserve structure as Markdown:
- Headings → # ## ###
- Lists → - or 1. 2. 3.
- Tables → | col | col |
Output valid Markdown.`
  }

  // Default: plain text
  return `Extract all text from this image.
Clean up: remove extra line breaks, merge spaces.
Output plain text only.`
}

/**
 * Extract MIME type from base64 data URL
 */
function extractMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/)
  return match ? match[1] : 'image/png'
}

/**
 * Extract base64 data without data URL prefix
 */
function extractBase64Data(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',')
  return commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl
}

/**
 * Build Gemini API request structure
 */
export function buildGeminiRequest(base64Image: string, prompt: string) {
  const mimeType = extractMimeType(base64Image)
  const base64Data = extractBase64Data(base64Image)

  return {
    contents: [
      {
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      }
    ]
  }
}

/**
 * Create a request with timeout
 */
function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

/**
 * Recognize text from image using Gemini API
 */
export async function recognizeImage(
  base64Image: string,
  format: OutputFormat = 'text',
  apiKey: string
): Promise<OCRResult> {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  const prompt = buildPrompt(format)
  const requestBody = buildGeminiRequest(base64Image, prompt)

  let lastError: Error | null = null

  // Retry mechanism
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        },
        REQUEST_TIMEOUT
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Extract text from response
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No text detected in image')
      }

      const candidate = data.candidates[0]
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid API response structure')
      }

      const text = candidate.content.parts[0].text || ''

      return {
        text,
        timestamp: Date.now()
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on certain errors
      if (error instanceof Error && error.message.includes('API request failed: 400')) {
        throw lastError
      }

      // If not the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw lastError || new Error('OCR failed after maximum retries')
}
