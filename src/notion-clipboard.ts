// Notion Clipboard Integration - OpenSpec Task 1.5
// Generate Notion-compatible clipboard JSON for LaTeX equations

// MIME type for Notion blocks clipboard format
export const NOTION_BLOCKS_MIME_TYPE = 'text/_notion-blocks-v3-production'

// Type definitions for Notion's actual clipboard format
export interface NotionBlockValue {
  id: string
  version: number
  type: 'equation' | 'text'
  properties: {
    title: [[string]]
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
function createBlock(type: 'equation' | 'text', content: string): NotionBlock {
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
            properties: { title: [[content]] },
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
 * Create a Notion equation block structure
 */
export function createEquationBlock(latex: string): NotionBlock {
  return createBlock('equation', latex)
}

/**
 * Create a Notion text block structure
 */
export function createTextBlock(content: string): NotionBlock {
  return createBlock('text', content)
}

/**
 * Content item representing either text or equation
 */
interface ContentItem {
  type: 'text' | 'equation'
  content: string
}

/**
 * Parse input text into content items (text and equations)
 * Supports:
 * - $$...$$ for block equations (can span multiple lines)
 * - Plain text as text blocks
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
  let hasMatches = false

  while ((match = blockEquationRegex.exec(input)) !== null) {
    hasMatches = true

    // Add text before this equation (if any)
    if (match.index > lastIndex) {
      const textBefore = input.slice(lastIndex, match.index).trim()
      if (textBefore) {
        // Split text into paragraphs (by double newlines or single newlines)
        const paragraphs = textBefore.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p)
        for (const para of paragraphs) {
          items.push({ type: 'text', content: para })
        }
      }
    }

    // Add the equation
    const equationContent = match[1].trim()
    if (equationContent) {
      items.push({ type: 'equation', content: equationContent })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last equation (only if we found at least one equation)
  if (hasMatches && lastIndex < input.length) {
    const textAfter = input.slice(lastIndex).trim()
    if (textAfter) {
      const paragraphs = textAfter.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p)
      for (const para of paragraphs) {
        items.push({ type: 'text', content: para })
      }
    }
  }

  // If no $$ markers found, treat entire input as single equation
  if (!hasMatches && input.trim()) {
    items.push({ type: 'equation', content: input.trim() })
  }

  return items
}

/**
 * Build Notion blocks from content items
 *
 * @param items - Array of content items
 * @param autoFix - Whether to apply fixLatexForNotion() to equations
 * @returns Array of Notion blocks
 */
export function buildBlocksFromItems(items: ContentItem[], autoFix: boolean = true): NotionBlock[] {
  return items.map(item => {
    if (item.type === 'equation') {
      const processedLatex = autoFix ? fixLatexForNotion(item.content) : item.content
      return createEquationBlock(processedLatex)
    } else {
      return createTextBlock(item.content)
    }
  })
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
