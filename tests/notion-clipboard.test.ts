// Notion Clipboard Tests - OpenSpec Tasks 1.1, 1.2, 1.3
// Testing LaTeX fixes and Notion clipboard JSON generation

import { describe, it, expect } from 'vitest'
import { fixLatexForNotion, createEquationBlock, createNotionClipboardData, createTextBlock, parseContentToItems } from '../src/notion-clipboard'

describe('Notion Clipboard - fixLatexForNotion() - Operator Ending Fix (Task 1.1)', () => {
  it('should add thin space after operator+single-char ending: a=b → a=b\\,', () => {
    const input = 'a=b'
    const expected = 'a=b\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should NOT modify operator+multi-char ending: a=bc', () => {
    const input = 'a=bc'
    expect(fixLatexForNotion(input)).toBe(input)
  })

  it('should NOT modify non-operator ending: E=mc^2', () => {
    const input = 'E=mc^2'
    expect(fixLatexForNotion(input)).toBe(input)
  })

  it('should handle addition operator: x+y → x+y\\,', () => {
    const input = 'x+y'
    const expected = 'x+y\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should handle subtraction operator: a-b → a-b\\,', () => {
    const input = 'a-b'
    const expected = 'a-b\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should handle multiplication operator: x\\times y → x\\times y\\,', () => {
    const input = 'x\\times y'
    const expected = 'x\\times y\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should handle division operator: a\\div b → a\\div b\\,', () => {
    const input = 'a\\div b'
    const expected = 'a\\div b\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should preserve multi-char ending with operators: a+bc', () => {
    const input = 'a+bc'
    expect(fixLatexForNotion(input)).toBe(input)
  })

  it('should preserve expressions with exponents: x^2+y^2', () => {
    const input = 'x^2+y^2'
    expect(fixLatexForNotion(input)).toBe(input)
  })
})

describe('Notion Clipboard - fixLatexForNotion() - Differential Symbol Fix (Task 1.2)', () => {
  it('should add space after differential: dx → d x', () => {
    const input = 'dx'
    const expected = 'd x'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should fix differential in integral: \\int_0^1 dx → \\int_0^1 d x', () => {
    const input = '\\int_0^1 dx'
    const expected = '\\int_0^1 d x'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should fix dy: dy → d y', () => {
    const input = 'dy'
    const expected = 'd y'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should fix dz: dz → d z', () => {
    const input = 'dz'
    const expected = 'd z'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should fix dt: dt → d t', () => {
    const input = 'dt'
    const expected = 'd t'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should fix multiple differentials: \\int dx dy → \\int d x d y', () => {
    const input = '\\int dx dy'
    const expected = '\\int d x d y'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should NOT false-match word starting with d: define', () => {
    const input = 'define'
    expect(fixLatexForNotion(input)).toBe(input)
  })

  it('should handle complex integral: \\int_a^b f(x) dx → \\int_a^b f(x) d x', () => {
    const input = '\\int_a^b f(x) dx'
    const expected = '\\int_a^b f(x) d x'
    expect(fixLatexForNotion(input)).toBe(expected)
  })
})

describe('Notion Clipboard - fixLatexForNotion() - Combined Fixes', () => {
  it('should apply both operator and differential fixes', () => {
    const input = '\\int_0^1 x dx + a=b'
    // dx → d x, a=b → a=b\,
    const expected = '\\int_0^1 x d x + a=b\\,'
    expect(fixLatexForNotion(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    expect(fixLatexForNotion('')).toBe('')
  })

  it('should preserve already-fixed LaTeX', () => {
    const input = 'a=b\\,'
    expect(fixLatexForNotion(input)).toBe(input)
  })

  it('should preserve already-spaced differentials', () => {
    const input = 'd x'
    expect(fixLatexForNotion(input)).toBe(input)
  })
})

// Helper to extract block value from new Notion format
function getBlockValue(block: ReturnType<typeof createEquationBlock>) {
  return block.blockSubtree.block[block.blockId].value
}

describe('Notion Clipboard - createEquationBlock() - Block Structure', () => {
  it('should create block with type "equation"', () => {
    const latex = 'E=mc^2'
    const block = createEquationBlock(latex)
    const value = getBlockValue(block)

    expect(value.type).toBe('equation')
  })

  it('should include properties.title array with LaTeX content', () => {
    const latex = 'x^2 + y^2 = z^2'
    const block = createEquationBlock(latex)
    const value = getBlockValue(block)

    expect(value.properties).toBeDefined()
    expect(value.properties.title).toBeInstanceOf(Array)
    expect(value.properties.title[0]).toEqual([latex])
  })

  it('should include blockId field (UUID format)', () => {
    const latex = 'a=b'
    const block = createEquationBlock(latex)

    expect(block.blockId).toBeDefined()
    expect(typeof block.blockId).toBe('string')
    expect(block.blockId.length).toBeGreaterThan(0)
  })

  it('should include blockSubtree with __version__: 3', () => {
    const latex = 'a=b'
    const block = createEquationBlock(latex)

    expect(block.blockSubtree.__version__).toBe(3)
  })
})

describe('Notion Clipboard - createTextBlock() - Text Block Structure', () => {
  it('should create block with type "text"', () => {
    const content = 'Plain text content'
    const block = createTextBlock(content)
    const value = getBlockValue(block)

    expect(value.type).toBe('text')
  })

  it('should include properties.title array with text content', () => {
    const content = 'Some explanation'
    const block = createTextBlock(content)
    const value = getBlockValue(block)

    expect(value.properties).toBeDefined()
    expect(value.properties.title).toBeInstanceOf(Array)
    expect(value.properties.title[0]).toEqual([content])
  })

  it('should include blockId field', () => {
    const content = 'Text'
    const block = createTextBlock(content)

    expect(block.blockId).toBeDefined()
    expect(typeof block.blockId).toBe('string')
  })
})

// Helper to get block value from clipboard data block
function getClipboardBlockValue(block: ReturnType<typeof createEquationBlock>) {
  return block.blockSubtree.block[block.blockId].value
}

describe('Notion Clipboard - createNotionClipboardData() - Full JSON Structure (Task 1.3)', () => {
  it('should return object with blocks array', () => {
    const latex = 'x=y'
    const data = createNotionClipboardData(latex)

    expect(data).toHaveProperty('blocks')
    expect(data.blocks).toBeInstanceOf(Array)
  })

  it('should contain equation block in blocks array', () => {
    const latex = 'a+b=c'
    const data = createNotionClipboardData(latex)

    expect(data.blocks.length).toBeGreaterThan(0)
    const value = getClipboardBlockValue(data.blocks[0])
    expect(value.type).toBe('equation')
  })

  it('should include LaTeX content in equation block properties.title', () => {
    const latex = '\\int_0^1 f(x) dx'
    const data = createNotionClipboardData(latex)

    const block = data.blocks[0]
    const value = getClipboardBlockValue(block)
    expect(value.properties.title[0][0]).toContain('f(x)')
  })

  it('should include action: "copy" field', () => {
    const latex = 'E=mc^2'
    const data = createNotionClipboardData(latex)

    expect(data).toHaveProperty('action', 'copy')
  })

  it('should include wasContiguousSelection: true field', () => {
    const latex = 'a=b'
    const data = createNotionClipboardData(latex)

    expect(data).toHaveProperty('wasContiguousSelection', true)
  })

  it('should apply autoFix by default (autoFix=true)', () => {
    const latex = 'a=b'
    const data = createNotionClipboardData(latex)

    // With autoFix, a=b → a=b\,
    const value = getClipboardBlockValue(data.blocks[0])
    expect(value.properties.title[0][0]).toBe('a=b\\,')
  })

  it('should NOT apply autoFix when autoFix=false', () => {
    const latex = 'a=b'
    const data = createNotionClipboardData(latex, false)

    // Without autoFix, a=b stays as-is
    const value = getClipboardBlockValue(data.blocks[0])
    expect(value.properties.title[0][0]).toBe('a=b')
  })

  it('should handle complex LaTeX with multiple fixes', () => {
    const latex = '\\int_0^1 dx + x=y'
    const data = createNotionClipboardData(latex)

    // Should apply both dx→d x and x=y→x=y\,
    const value = getClipboardBlockValue(data.blocks[0])
    const result = value.properties.title[0][0]

    expect(result).toContain('d x')
    expect(result).toContain('x=y\\,')
  })
})

describe('Notion Clipboard - parseContentToItems() - Block Equations ($$...$$)', () => {
  it('should treat content without $ markers as single block-equation', () => {
    const items = parseContentToItems('E=mc^2')
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('block-equation')
    expect(items[0].content).toBe('E=mc^2')
  })

  it('should parse $$...$$ as block-equation', () => {
    const input = 'Text before\n$$E=mc^2$$\nText after'
    const items = parseContentToItems(input)
    expect(items.length).toBe(3)
    expect(items[0].type).toBe('text')
    expect(items[1].type).toBe('block-equation')
    expect(items[1].content).toBe('E=mc^2')
    expect(items[2].type).toBe('text')
  })

  it('should handle multiple block equations', () => {
    const input = '$$a=b$$\nText\n$$c=d$$'
    const items = parseContentToItems(input)
    expect(items.length).toBe(3)
    expect(items[0].type).toBe('block-equation')
    expect(items[1].type).toBe('text')
    expect(items[2].type).toBe('block-equation')
  })
})

describe('Notion Clipboard - parseContentToItems() - Inline Equations ($...$)', () => {
  it('should parse single $...$ as inline-equation', () => {
    const input = 'The value is $x=5$ here'
    const items = parseContentToItems(input)
    expect(items.length).toBe(3)
    expect(items[0].type).toBe('text')
    expect(items[0].content).toBe('The value is ')
    expect(items[1].type).toBe('inline-equation')
    expect(items[1].content).toBe('x=5')
    expect(items[2].type).toBe('text')
    expect(items[2].content).toBe(' here')
  })

  it('should parse multiple inline equations', () => {
    const input = 'We have $a=1$ and $b=2$ here'
    const items = parseContentToItems(input)
    expect(items.length).toBe(5)
    expect(items[0].type).toBe('text')
    expect(items[1].type).toBe('inline-equation')
    expect(items[1].content).toBe('a=1')
    expect(items[2].type).toBe('text')
    expect(items[3].type).toBe('inline-equation')
    expect(items[3].content).toBe('b=2')
    expect(items[4].type).toBe('text')
  })

  it('should handle $...$ at start of text', () => {
    const input = '$f(x)$ is a function'
    const items = parseContentToItems(input)
    expect(items.length).toBe(2)
    expect(items[0].type).toBe('inline-equation')
    expect(items[0].content).toBe('f(x)')
    expect(items[1].type).toBe('text')
  })

  it('should handle $...$ at end of text', () => {
    const input = 'The function is $f(x)$'
    const items = parseContentToItems(input)
    expect(items.length).toBe(2)
    expect(items[0].type).toBe('text')
    expect(items[1].type).toBe('inline-equation')
    expect(items[1].content).toBe('f(x)')
  })

  it('should NOT confuse $$ with $ $ pairs', () => {
    const input = 'Text\n$$E=mc^2$$\nMore text'
    const items = parseContentToItems(input)
    // Should be 3 items: text, block-equation, text
    // NOT misparse $$ as two empty $ $
    expect(items.length).toBe(3)
    expect(items[1].type).toBe('block-equation')
    expect(items[1].content).toBe('E=mc^2')
  })
})

describe('Notion Clipboard - parseContentToItems() - Mixed Block and Inline', () => {
  it('should handle inline equations within text before block equation', () => {
    const input = 'Consider $f(x)$ here\n$$\\int f(x) dx$$'
    const items = parseContentToItems(input)
    expect(items.length).toBe(4)
    expect(items[0].type).toBe('text')
    expect(items[0].content).toBe('Consider ')
    expect(items[1].type).toBe('inline-equation')
    expect(items[1].content).toBe('f(x)')
    expect(items[2].type).toBe('text')
    expect(items[2].content).toBe(' here')
    expect(items[3].type).toBe('block-equation')
    expect(items[3].content).toBe('\\int f(x) dx')
  })

  it('should handle complex mixed content', () => {
    const input = 'The function $f(x)$ satisfies:\n$$f\'(x) = 2x$$\nwhere $x > 0$'
    const items = parseContentToItems(input)
    // text, inline-equation(f(x)), text, block-equation(f'(x)=2x), text, inline-equation(x>0)
    const inlineEquations = items.filter(i => i.type === 'inline-equation')
    const blockEquations = items.filter(i => i.type === 'block-equation')
    const textItems = items.filter(i => i.type === 'text')
    expect(inlineEquations.length).toBe(2)
    expect(blockEquations.length).toBe(1)
    expect(textItems.length).toBe(3)
  })
})

describe('Notion Clipboard - Type Definitions', () => {
  it('should export fixLatexForNotion function', () => {
    expect(typeof fixLatexForNotion).toBe('function')
  })

  it('should export createEquationBlock function', () => {
    expect(typeof createEquationBlock).toBe('function')
  })

  it('should export createNotionClipboardData function', () => {
    expect(typeof createNotionClipboardData).toBe('function')
  })

  it('should export createTextBlock function', () => {
    expect(typeof createTextBlock).toBe('function')
  })

  it('should export parseContentToItems function', () => {
    expect(typeof parseContentToItems).toBe('function')
  })
})
