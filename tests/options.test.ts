import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'

// Read files for content assertion style tests
const globalDts = readFileSync('./global.d.ts', 'utf-8')

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

  it('should have output format selector', () => {
    const content = readFileSync(optionsHtmlPath, 'utf-8')

    expect(content).toMatch(/select.*id=["']output-format["']/i)
  })

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
