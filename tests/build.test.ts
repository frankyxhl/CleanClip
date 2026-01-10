import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, rmSync, readFileSync } from 'fs'
import { join } from 'path'

describe('Vite build', () => {
  const distPath = './dist'
  const manifestDistPath = join(distPath, 'manifest.json')

  beforeAll(() => {
    // Clean up dist directory before test
    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true })
    }
  })

  afterAll(() => {
    // Clean up dist directory after test
    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true })
    }
  })

  it('should execute build command without errors', () => {
    expect(() => {
      execSync('npm run build', { stdio: 'pipe' })
    }).not.toThrow()
  })

  it('should generate dist directory', () => {
    execSync('npm run build', { stdio: 'pipe' })

    expect(existsSync(distPath)).toBe(true)
  })

  it('should copy manifest.json to dist directory', () => {
    execSync('npm run build', { stdio: 'pipe' })

    expect(existsSync(manifestDistPath)).toBe(true)
  })

  it('should have valid manifest.json in dist', () => {
    execSync('npm run build', { stdio: 'pipe' })

    const content = readFileSync(manifestDistPath, 'utf-8')
    expect(() => JSON.parse(content)).not.toThrow()

    const manifest = JSON.parse(content)
    expect(manifest.manifest_version).toBe(3)
    expect(manifest.name).toBeDefined()
    expect(manifest.version).toBeDefined()
  })
})
