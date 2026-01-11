import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { existsSync } from 'fs'

describe('manifest.json validation', () => {
  const manifestPath = './public/manifest.json'

  it('should have manifest.json file', () => {
    expect(existsSync(manifestPath)).toBe(true)
  })

  it('should have valid JSON content', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    expect(() => JSON.parse(content)).not.toThrow()
  })

  it('should conform to Manifest V3 spec', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)

    expect(manifest.manifest_version).toBe(3)
  })

  it('should have required fields', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)

    expect(manifest.name).toBeDefined()
    expect(manifest.version).toBeDefined()
    expect(manifest.manifest_version).toBeDefined()
  })

  it('should have content_scripts configuration', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)

    expect(manifest.content_scripts).toBeDefined()
    expect(Array.isArray(manifest.content_scripts)).toBe(true)
  })

  it('should have overlay.ts configured as content script', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)

    expect(manifest.content_scripts).toBeDefined()
    expect(Array.isArray(manifest.content_scripts)).toBe(true)

    const overlayScript = manifest.content_scripts.find(
      (script: { js?: string[] }) => script.js && script.js.some((item: string) => item.includes('overlay.ts'))
    )

    expect(overlayScript).toBeDefined()
  })

  it('should have overlay content script with <all_urls> match pattern', () => {
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)

    expect(manifest.content_scripts).toBeDefined()
    expect(Array.isArray(manifest.content_scripts)).toBe(true)

    const overlayScript = manifest.content_scripts.find(
      (script: { js?: string[] }) => script.js && script.js.some((item: string) => item.includes('overlay.ts'))
    )

    expect(overlayScript).toBeDefined()
    expect(overlayScript.matches).toBeDefined()
    expect(Array.isArray(overlayScript.matches)).toBe(true)
    expect(overlayScript.matches).toContain('<all_urls>')
  })
})
