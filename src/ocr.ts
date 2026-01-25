// OCR Module for CleanClip
// Integrates with Gemini 3 Flash API for text recognition

export interface OCRResult {
  text: string
  timestamp: number
}

export type OutputFormat = 'text' | 'markdown' | 'latex-notion' | 'latex-notion-md' | 'latex-obsidian' | 'structured'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'
const MAX_RETRIES = 3
const REQUEST_TIMEOUT = 120000 // 120 seconds

/**
 * Build prompt based on output format
 */
export function buildPrompt(format: OutputFormat, options?: { removeHeaderFooter?: boolean }): string {
  // Header/footer exclusion instruction to append when removeHeaderFooter is enabled
  const exclusionInstruction = `

IMPORTANT: Do NOT include in your output:
- Page numbers (standalone numbers at page margins)
- Chapter/section headers (e.g., "CHAPTER 2", "2.4. KATAKANA")
- Running headers/footers typically found at page margins
Extract only the main body content.`

  let prompt = ''

  if (format === 'markdown') {
    prompt = `Extract all text from this image.
Preserve structure as Markdown:
- Headings → # ## ###
- Lists → - or 1. 2. 3.
- Tables → | col | col |
Output valid Markdown.`
  } else if (format === 'latex-notion') {
    // Notion KaTeX-compatible format
    prompt = `Extract mathematical content from this image.

CRITICAL RULES:
1. Output KaTeX-compatible LaTeX ONLY
2. Do NOT wrap output in $ or $$ (user will paste into Equation block)
3. NEVER use tikzcd (not supported)

For commutative diagrams, use \\begin{CD}...\\end{CD}:
- Right arrow: @>>>  or  @>label>>
- Down arrow: @VVV  or  @VlabelVV (label on LEFT of arrow)
- Down arrow with label on RIGHT: @VVlabelV
- Up arrow: @AAA
- Left arrow: @<<<
- Empty cell: @.

IMPORTANT for arrow labels:
- Match label position to the original image
- Use @V label VV when label should appear LEFT of the arrow
- Use @VV label V when label should appear RIGHT of the arrow
- Use \\scriptstyle for small labels (like textbook annotations)

Example (short exact sequence with vertical morphisms):
\\begin{CD}
@. A @>f>> B @>g>> C @>>> 0 \\\\
@. @V{\\scriptstyle a}VV @V{\\scriptstyle b}VV @V{\\scriptstyle c}VV \\\\
0 @>>> A' @>f'>> B' @>g'>> C'
\\end{CD}

Output LaTeX code only. No explanations, no outer $ symbols.`
  } else if (format === 'latex-obsidian') {
    // Obsidian full LaTeX format (requires tikzjax plugin)
    prompt = `Extract mathematical content from this image.

Output full LaTeX with tikz-cd:
- Use \\begin{tikzcd}...\\end{tikzcd} for commutative diagrams
- Arrow syntax: \\arrow[r,"label"] for right, \\arrow[d,"label"] for down
- Inline math: $...$
- Display math: $$...$$

Note: This format requires Obsidian with tikzjax plugin installed.

Output LaTeX code only, no explanations.`
  } else if (format === 'latex-notion-md') {
    // Notion LaTeX + Markdown format (mixed content)
    prompt = `Extract content from this image, separating text and math.

OUTPUT FORMAT:
- Regular text: Output as PLAIN TEXT (no LaTeX \\text{} commands)
- Inline math (variables/symbols within sentences): Wrap with single $ signs
- Block equations (standalone formulas on their own line): Wrap with $$ on separate lines

EXAMPLE INPUT: An image showing "The area is A = πr² where r is the radius"
EXAMPLE OUTPUT:
The area is $A = \\pi r^2$ where $r$ is the radius.

EXAMPLE INPUT: An image showing text, then a centered equation, then more text
EXAMPLE OUTPUT:
This is the introductory text explaining the concept.

$$\\int_0^1 f(x) \\, dx = F(1) - F(0)$$

This is the text that follows the equation.

CRITICAL RULES:
- NEVER use \\text{} commands - output regular text as plain text
- Block equations MUST have $$ on their own lines (before and after the LaTeX)
- Use KaTeX-compatible LaTeX syntax
- Preserve paragraph structure
- Do NOT use tikzcd, \\begin{aligned}, or other unsupported environments
- Simple inline variables like "where a ≠ 0" should use $ signs: where $a \\neq 0$
- IGNORE bullet points (•, -, *) - do not include them in output, just the content`
  } else if (format === 'structured') {
    // Structured format: separates text and image regions
    prompt = `Extract content from this image, separating text and image regions.

RULES:
1. Extract all text in reading order (top to bottom, left to right)
2. Mark image/figure/chart regions with: [IMAGE: brief description]
3. Preserve the relative position of images within text flow
4. For complex layouts, process column by column

OUTPUT FORMAT:
- Plain text for text regions
- [IMAGE: description] for non-text visual elements
- Maintain paragraph breaks

Output only the extracted content.`
  } else {
    // Default: plain text
    prompt = `Extract all text from this image.
Clean up: remove extra line breaks, merge spaces.
Output plain text only.`
  }

  // Append exclusion instruction if removeHeaderFooter option is enabled
  if (options?.removeHeaderFooter) {
    prompt += exclusionInstruction
  }

  return prompt
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
  apiKey: string,
  textProcessingOptions?: { removeHeaderFooter?: boolean }
): Promise<OCRResult> {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  const prompt = buildPrompt(format, textProcessingOptions)
  const requestBody = buildGeminiRequest(base64Image, prompt)

  let lastError: Error | null = null

  // Retry mechanism
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        GEMINI_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(requestBody)
        },
        REQUEST_TIMEOUT
      )

      if (!response.ok) {
        // Try to get detailed error message from response body
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = JSON.stringify(errorData)
        } catch {
          // ignore parse error
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}${errorDetail ? ` - ${errorDetail}` : ''}`)
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
