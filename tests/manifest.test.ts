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
})
