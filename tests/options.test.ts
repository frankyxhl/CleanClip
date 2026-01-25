import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'

// Read files for content assertion style tests
const globalDts = readFileSync('./global.d.ts', 'utf-8')
const mainTs = readFileSync('./src/options/main.ts', 'utf-8')

describe('Type Definitions', () => {
  it('should have chrome.commands.getAll type', () => {
    expect(globalDts).toContain('getAll')
  })

  it('should have chrome.tabs.create type', () => {
    // Verify tabs section contains create (not just notifications.create)
    expect(globalDts).toMatch(/tabs:\s*\{[\s\S]*create\(/)
  })

  it('should have chrome.commands.Command interface', () => {
    expect(globalDts).toContain('interface Command')
  })
})

describe('Shortcut Logic', () => {
  it('should use chrome.commands.getAll', () => {
    expect(mainTs).toContain('chrome.commands.getAll')
  })

  it('should handle cleanclip-screenshot command', () => {
    expect(mainTs).toContain('cleanclip-screenshot')
  })

  it('should handle "Not set" case', () => {
    expect(mainTs).toContain('Not set')
  })

  it('should open Chrome shortcuts page', () => {
    expect(mainTs).toContain('chrome://extensions/shortcuts')
  })

  it('should have fallback hint for failed open', () => {
    expect(mainTs).toContain('manually to change shortcuts')
  })
})

describe('Shortcut Settings HTML', () => {
  const optionsHtml = readFileSync('./src/options/index.html', 'utf-8')

  it('should have shortcut section', () => {
    expect(optionsHtml).toContain('id="shortcut-section"')
  })

  it('should have current shortcut display element', () => {
    expect(optionsHtml).toContain('id="current-shortcut"')
  })

  it('should have change shortcut button', () => {
    expect(optionsHtml).toContain('id="change-shortcut-btn"')
  })
})

describe('Options page', () => {
  const optionsHtmlPath = './src/options/index.html'
  const optionsMainPath = './src/options/main.ts'

  it('should have options page HTML file', () => {
    expect(existsSync(optionsHtmlPath)).toBe(true)
  })

  it('should have options page entry point', () => {
    expect(existsSync(optionsMainPath)).toBe(true)
  })

  it('should have valid HTML structure', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toContain('<!DOCTYPE html>')
    expect(content).toContain('<html')
    expect(content).toContain('<body>')
    expect(content).toContain('</html>')
  })

  it('should have API Key input field', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toMatch(/input.*type=["']password["'].*id=["']api-key["']/i)
  })

  // Output format selector removed - now using fixed latex-notion-md format

  it('should have text processing checkboxes', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toMatch(/input.*type=["']checkbox["'].*id=["']remove-linebreaks["']/i)
    expect(content).toMatch(/input.*type=["']checkbox["'].*id=["']merge-spaces["']/i)
  })

  it('should have security warning for API Key', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toMatch(/warning|security|caution/i)
  })

  it('should have save button', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toMatch(/button.*type=["']submit["']|button.*id=["']save["']/i)
  })
})

describe('Options page - API Key storage key', () => {
  it('should save API key to cleanclip-api-key storage key', () => {
    const content = readFileSync('./src/options/main.ts', 'utf-8')

    // This test verifies that options/main.ts uses 'cleanclip-api-key' as the storage key
    // instead of 'apiKey' to match the key used by background.ts
    expect(content).toContain("'cleanclip-api-key'")
  })
})

// LaTeX Output Format Options (Task 4.1) - REMOVED
// Output format selector removed - now using fixed latex-notion-md format

// LaTeX Format Hint Display (Task 4.2) - REMOVED
// Format hints removed along with format selector

describe('Notion Format Setting (Phase 3)', () => {
  const optionsHtml = readFileSync('./src/options/index.html', 'utf-8')
  const mainTs = readFileSync('./src/options/main.ts', 'utf-8')

  it('should have notionFormatEnabled checkbox in HTML', () => {
    expect(optionsHtml).toMatch(/input.*type=["']checkbox["'].*id=["']notion-format-enabled["']/i)
  })

  it('should have label for Notion format checkbox', () => {
    expect(optionsHtml).toContain('Enable Notion equation format')
  })

  it('should have notionFormatEnabled in defaultSettings with default value true', () => {
    expect(mainTs).toContain('notionFormatEnabled: true')
  })

  it('should load notionFormatEnabled setting in loadSettings function', () => {
    expect(mainTs).toMatch(/notionFormatEnabled\s*\?\?\s*true/)
  })

  it('should save notionFormatEnabled setting in saveSettings function', () => {
    expect(mainTs).toContain('notionFormatEnabled:')
  })
})
