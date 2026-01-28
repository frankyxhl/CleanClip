// Notion Clipboard Integration - OpenSpec Task 1.5
// Generate Notion-compatible clipboard JSON for LaTeX equations

// MIME type for Notion blocks clipboard format
export const NOTION_BLOCKS_MIME_TYPE = 'text/_notion-blocks-v3-production'

// Notion rich text segment types
// Plain text: ["text content"]
// Inline equation: ["⁍", [["e", "latex content"]]]
type NotionRichTextSegment = [string] | [string, [["e", string]]]

// Type definitions for Notion's actual clipboard format
export interface NotionBlockValue {
  id: string
  version: number
  type: 'equation' | 'text'
  properties: {
    title: NotionRichTextSegment[]
  }
  created_time: number
  last_edited_time: number
  parent_id: string
  parent_table: 'block'
  alive: boolean
  created_by_table: 'notion_user'
  created_by_id: string
  last_edited_by_table: 'notion_user'
  last_edited_by_id: string
  space_id: string
}

export interface NotionBlockSubtree {
  __version__: 3
  block: {
    [blockId: string]: {
      value: NotionBlockValue
    }
  }
}

export interface NotionBlock {
  blockId: string
  blockSubtree: NotionBlockSubtree
}

export interface NotionClipboardData {
  blocks: NotionBlock[]
  action: 'copy'
  wasContiguousSelection: true
}

/**
 * Fix known LaTeX bugs for Notion compatibility
 *
 * Applies two fixes:
 * 1. Operator + single char ending: adds \, thin space (e.g., a=b → a=b\,)
 * 2. Differential symbols: adds space after d (e.g., dx → d x)
 */
export function fixLatexForNotion(latex: string): string {
  if (!latex) return latex

  let result = latex

  // Fix 1: Operator + single character ending
  // Pattern: operator (=, +, -, \times, \div) followed by space and single letter at end
  // Match: 'a=b', 'x+y', 'x\times y' but NOT 'a=bc', 'x^2+y^2'
  // Note: Must not have already been fixed with \,
  const operatorSingleCharPattern = /([=+\-]|\\times|\\div)(\s*)([a-zA-Z])(?!\\,)$/
  if (operatorSingleCharPattern.test(result)) {
    result = result.replace(operatorSingleCharPattern, '$1$2$3\\,')
  }

  // Fix 2: Differential symbols
  // Pattern: d followed immediately by x, y, z, or t (word boundary)
  // Match: 'dx', 'dy', 'dz', 'dt' but NOT 'define', 'dx already spaced'
  // Use word boundary to ensure d is at start and variable is standalone
  const differentialPattern = /\bd([xyzt])\b/g
  result = result.replace(differentialPattern, 'd $1')

  return result
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Create a Notion block with full metadata structure
 */
function createBlockWithRichText(
  type: 'equation' | 'text',
  title: NotionRichTextSegment[]
): NotionBlock {
  const blockId = generateUUID()
  const now = Date.now()

  return {
    blockId,
    blockSubtree: {
      __version__: 3,
      block: {
        [blockId]: {
          value: {
            id: blockId,
            version: 1,
            type,
            properties: { title },
            created_time: now,
            last_edited_time: now,
            parent_id: generateUUID(),
            parent_table: 'block',
            alive: true,
            created_by_table: 'notion_user',
            created_by_id: generateUUID(),
            last_edited_by_table: 'notion_user',
            last_edited_by_id: generateUUID(),
            space_id: generateUUID()
          }
        }
      }
    }
  }
}

/**
 * Create a Notion equation block structure (block-level equation)
 */
export function createEquationBlock(latex: string): NotionBlock {
  return createBlockWithRichText('equation', [[latex]])
}

/**
 * Create a Notion text block structure (plain text)
 */
export function createTextBlock(content: string): NotionBlock {
  return createBlockWithRichText('text', [[content]])
}

/**
 * Rich text segment for building text blocks with inline equations
 */
interface RichTextSegment {
  type: 'text' | 'equation'
  content: string
}

/**
 * Create a Notion text block with rich text (supports inline equations)
 * @param segments - Array of rich text segments (text and inline equations)
 * @param autoFix - Whether to apply fixLatexForNotion() to equations
 */
export function createRichTextBlock(
  segments: RichTextSegment[],
  autoFix: boolean = true
): NotionBlock {
  const richText: NotionRichTextSegment[] = segments.map(segment => {
    if (segment.type === 'equation') {
      const latex = autoFix ? fixLatexForNotion(segment.content) : segment.content
      // Inline equation format: ["⁍", [["e", "latex"]]]
      return ["⁍", [["e", latex]]] as NotionRichTextSegment
    } else {
      // Plain text format: ["text"]
      return [segment.content] as NotionRichTextSegment
    }
  })

  return createBlockWithRichText('text', richText)
}

/**
 * Content item representing text, inline equation, block equation, paragraph break, or image
 * - text: plain text
 * - inline-equation: inline math from $...$, should be rendered inline with text
 * - block-equation: block math from $$...$$, should be a separate equation block
 * - paragraph-break: marks boundary between paragraphs, triggers new text block
 * - image-placeholder: [IMAGE: description] marker, represents a figure/diagram
 */
interface ContentItem {
  type: 'text' | 'inline-equation' | 'block-equation' | 'paragraph-break' | 'image-placeholder'
  content: string
}

/**
 * Parse text segment for inline equations ($...$) and image placeholders ([IMAGE: ...])
 * Returns array of content items preserving order
 * Preserves spacing for proper inline rendering
 */
function parseInlineEquations(text: string): ContentItem[] {
  const items: ContentItem[] = []

  // Combined regex to match both inline equations and image placeholders
  // - Inline equations: $...$ (not $$)
  // - Image placeholders: [IMAGE: description]
  const combinedRegex = /(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)|\[IMAGE:\s*([^\]]+)\]/g

  let lastIndex = 0
  let match

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before this match (preserve spaces for inline flow)
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index)
      if (textBefore) {
        items.push({ type: 'text', content: textBefore })
      }
    }

    if (match[1] !== undefined) {
      // Inline equation match (group 1)
      const equationContent = match[1].trim()
      if (equationContent) {
        items.push({ type: 'inline-equation', content: equationContent })
      }
    } else if (match[2] !== undefined) {
      // Image placeholder match (group 2)
      const imageDescription = match[2].trim()
      if (imageDescription) {
        items.push({ type: 'image-placeholder', content: imageDescription })
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text (preserve spaces)
  if (lastIndex < text.length) {
    const textAfter = text.slice(lastIndex)
    if (textAfter) {
      items.push({ type: 'text', content: textAfter })
    }
  }

  // If no matches found, return original text as single item
  if (items.length === 0 && text.trim()) {
    items.push({ type: 'text', content: text })
  }

  return items
}

/**
 * Parse input text into content items (text and equations)
 * Supports:
 * - $$...$$ for block equations (can span multiple lines) → block-equation
 * - $...$ for inline equations → inline-equation
 * - Plain text → text
 *
 * @param input - The input text to parse
 * @returns Array of content items
 */
export function parseContentToItems(input: string): ContentItem[] {
  const items: ContentItem[] = []

  // Match $$...$$ blocks (can span multiple lines)
  const blockEquationRegex = /\$\$([\s\S]*?)\$\$/g

  let lastIndex = 0
  let match
  let hasBlockEquations = false

  while ((match = blockEquationRegex.exec(input)) !== null) {
    hasBlockEquations = true

    // Add text before this equation (if any)
    if (match.index > lastIndex) {
      const textBefore = input.slice(lastIndex, match.index).trim()
      if (textBefore) {
        // Split text into paragraphs and parse inline equations
        const paragraphs = textBefore.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p)
        for (let i = 0; i < paragraphs.length; i++) {
          // Add paragraph break between paragraphs
          if (i > 0) {
            items.push({ type: 'paragraph-break', content: '' })
          }
          // Parse inline equations within each paragraph
          const inlineItems = parseInlineEquations(paragraphs[i])
          items.push(...inlineItems)
        }
      }
    }

    // Add the block equation ($$...$$)
    const equationContent = match[1].trim()
    if (equationContent) {
      items.push({ type: 'block-equation', content: equationContent })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last block equation
  if (hasBlockEquations && lastIndex < input.length) {
    const textAfter = input.slice(lastIndex).trim()
    if (textAfter) {
      const paragraphs = textAfter.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p)
      for (let i = 0; i < paragraphs.length; i++) {
        // Add paragraph break between paragraphs
        if (i > 0) {
          items.push({ type: 'paragraph-break', content: '' })
        }
        // Parse inline equations within each paragraph
        const inlineItems = parseInlineEquations(paragraphs[i])
        items.push(...inlineItems)
      }
    }
  }

  // If no $$ markers found, check for inline equations, image markers, or treat as equation
  if (!hasBlockEquations && input.trim()) {
    // Check if input contains inline equations or image placeholders
    const hasInlineEquations = /(?<!\$)\$(?!\$)/.test(input)
    const hasImageMarkers = /\[IMAGE:\s*[^\]]+\]/.test(input)

    if (hasInlineEquations || hasImageMarkers) {
      // Parse inline equations and image placeholders from the entire input
      const paragraphs = input.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p)
      for (let i = 0; i < paragraphs.length; i++) {
        // Add paragraph break between paragraphs
        if (i > 0) {
          items.push({ type: 'paragraph-break', content: '' })
        }
        const inlineItems = parseInlineEquations(paragraphs[i])
        items.push(...inlineItems)
      }
    } else {
      // No $ or [IMAGE:] markers at all - treat entire input as single block equation
      items.push({ type: 'block-equation', content: input.trim() })
    }
  }

  return items
}

/**
 * Build Notion blocks from content items
 * Groups consecutive text and inline-equations into single rich text blocks
 * Block equations and paragraph breaks trigger new blocks
 *
 * @param items - Array of content items
 * @param autoFix - Whether to apply fixLatexForNotion() to equations
 * @returns Array of Notion blocks
 */
export function buildBlocksFromItems(items: ContentItem[], autoFix: boolean = true): NotionBlock[] {
  const blocks: NotionBlock[] = []
  let currentRichTextSegments: RichTextSegment[] = []

  // Helper to flush accumulated rich text segments as a single block
  const flushRichText = () => {
    if (currentRichTextSegments.length > 0) {
      blocks.push(createRichTextBlock(currentRichTextSegments, autoFix))
      currentRichTextSegments = []
    }
  }

  for (const item of items) {
    if (item.type === 'block-equation') {
      // Flush any accumulated text/inline-equations first
      flushRichText()
      // Add block equation as separate equation block
      const processedLatex = autoFix ? fixLatexForNotion(item.content) : item.content
      blocks.push(createEquationBlock(processedLatex))
    } else if (item.type === 'paragraph-break') {
      // Flush current paragraph and start a new one
      flushRichText()
    } else if (item.type === 'image-placeholder') {
      // Flush any accumulated text first
      flushRichText()
      // Create a text block with image placeholder description
      // Format: 「📷 图片: description」
      const imageText = `📷 [图片: ${item.content}]`
      blocks.push(createTextBlock(imageText))
    } else {
      // Convert to RichTextSegment and accumulate (text or inline-equation)
      const segmentType = item.type === 'inline-equation' ? 'equation' as const : 'text' as const
      currentRichTextSegments.push({ type: segmentType, content: item.content })
    }
  }

  // Flush any remaining rich text
  flushRichText()

  return blocks
}

/**
 * Create complete Notion clipboard data for content
 * Supports mixed text and equations using $$ markers
 *
 * @param content - The content string (can include $$...$$ for equations)
 * @param autoFix - Whether to apply fixLatexForNotion() (default: true)
 * @returns Notion clipboard JSON structure
 */
export function createNotionClipboardData(
  content: string,
  autoFix: boolean = true
): NotionClipboardData {
  const items = parseContentToItems(content)
  const blocks = buildBlocksFromItems(items, autoFix)

  return {
    blocks,
    action: 'copy',
    wasContiguousSelection: true
  }
}
