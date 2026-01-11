import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'

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
