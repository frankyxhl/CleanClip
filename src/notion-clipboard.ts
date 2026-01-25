// Notion Clipboard Integration - OpenSpec Task 1.5
// Generate Notion-compatible clipboard JSON for LaTeX equations

// MIME type for Notion blocks clipboard format
export const NOTION_BLOCKS_MIME_TYPE = 'text/_notion-blocks-v3-production'

// Type definitions
export interface NotionBlock {
  id: string
  type: 'equation' | 'text'
  properties: {
    title: [[string]]
  }
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
 * Create a Notion equation block structure
 */
export function createEquationBlock(latex: string): NotionBlock {
  return {
    id: generateUUID(),
    type: 'equation',
    properties: {
      title: [[latex]]
    }
  }
}

/**
 * Create a Notion text block structure
 */
export function createTextBlock(content: string): NotionBlock {
  return {
    id: generateUUID(),
    type: 'text',
    properties: {
      title: [[content]]
    }
  }
}

/**
 * Create complete Notion clipboard data for LaTeX equation
 *
 * @param latex - The LaTeX equation string
 * @param autoFix - Whether to apply fixLatexForNotion() (default: true)
 * @returns Notion clipboard JSON structure
 */
export function createNotionClipboardData(
  latex: string,
  autoFix: boolean = true
): NotionClipboardData {
  const processedLatex = autoFix ? fixLatexForNotion(latex) : latex

  return {
    blocks: [createEquationBlock(processedLatex)],
    action: 'copy',
    wasContiguousSelection: true
  }
}
