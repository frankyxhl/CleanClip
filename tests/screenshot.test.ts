/**
 * Tests for Phase 4: Area Screenshot functionality
 * Following TDD: Red → Green → Refactor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Helper to load manifest.json
function loadManifest() {
  const manifestPath = join(process.cwd(), 'public', 'manifest.json')
  const manifestContent = readFileSync(manifestPath, 'utf-8')
  return JSON.parse(manifestContent)
}

describe('Screenshot - Shortcut Registration', () => {
  it('4.1 should register shortcut command in manifest', async () => {
    // Read manifest.json
    const manifest = loadManifest()

    // Verify commands section exists
    expect(manifest.commands).toBeDefined()
  })

  it('4.1 should have Cmd+Shift+X shortcut registered', async () => {
    const manifest = loadManifest()

    // Verify shortcut is defined
    const cleanclipCommand = manifest.commands?.['cleanclip-screenshot']
    expect(cleanclipCommand).toBeDefined()
    expect(cleanclipCommand?.description).toBe('Area screenshot for OCR')
    expect(cleanclipCommand?.suggested_key).toBeDefined()
    expect(cleanclipCommand?.suggested_key?.default).toBe('Ctrl+Shift+X')
    expect(cleanclipCommand?.suggested_key?.mac).toBe('Command+Shift+X')
  })

  it('4.2 should have scripting permission in manifest', async () => {
    const manifest = loadManifest()

    // Verify scripting permission exists for injecting content scripts
    expect(manifest.permissions).toContain('scripting')
    expect(manifest.permissions).toContain('activeTab')
  })
})

describe('Screenshot - Overlay UI', () => {
  it('4.3 should have overlay content script file', async () => {
    // Verify overlay.ts file exists
    const overlayPath = join(process.cwd(), 'src', 'content', 'overlay.ts')
    const fs = require('fs')
    expect(fs.existsSync(overlayPath)).toBe(true)
  })

  it('4.3 should create semi-transparent overlay with correct styles', async () => {
    // Read overlay.ts content
    const overlayPath = join(process.cwd(), 'src', 'content', 'overlay.ts')
    const overlayContent = readFileSync(overlayPath, 'utf-8')

    // Verify overlay styles
    expect(overlayContent).toContain('position: fixed')
    expect(overlayContent).toContain('background-color: rgba(0, 0, 0, 0.3)')
    expect(overlayContent).toContain('cursor: crosshair')
  })

  it('4.3 should listen for runtime messages', async () => {
    // Read overlay.ts content
    const overlayPath = join(process.cwd(), 'src', 'content', 'overlay.ts')
    const overlayContent = readFileSync(overlayPath, 'utf-8')

    // Verify chrome.runtime.onMessage listener
    expect(overlayContent).toContain('chrome.runtime.onMessage.addListener')
    expect(overlayContent).toContain('CLEANCLIP_SHOW_OVERLAY')
  })
})

describe('Screenshot - Area Selection', () => {
  it('4.5 should have selection coordinate calculation logic', async () => {
    // Read overlay.ts content
    const overlayPath = join(process.cwd(), 'src', 'content', 'overlay.ts')
    const overlayContent = readFileSync(overlayPath, 'utf-8')

    // Verify drag selection logic
    expect(overlayContent).toContain('mousedown')
    expect(overlayContent).toContain('mousemove')
    expect(overlayContent).toContain('mouseup')
    expect(overlayContent).toContain('calculateSelection')
  })

  it('4.5 should highlight selected area while dragging', async () => {
    // Read overlay.ts content
    const overlayPath = join(process.cwd(), 'src', 'content', 'overlay.ts')
    const overlayContent = readFileSync(overlayPath, 'utf-8')

    // Verify selection box
    expect(overlayContent).toContain('selectionBox')
    expect(overlayContent).toContain('updateSelectionBox')
    expect(overlayContent).toContain('border: 2px dashed #ffffff')
  })
})

describe('Screenshot - Capture and Crop', () => {
  it('4.7 should have captureArea function in background script', async () => {
    // Read background.ts content
    const backgroundPath = join(process.cwd(), 'src', 'background.ts')
    const backgroundContent = readFileSync(backgroundPath, 'utf-8')

    // Verify captureArea function exists in background
    expect(backgroundContent).toContain('captureArea')
    expect(backgroundContent).toContain('captureVisibleTab')
    // Note: Cropping functionality has been updated to use createImageBitmap
    // The actual cropping implementation is handled via offscreen document communication
  })

  it('4.7 should handle screenshot capture messages', async () => {
    // Read background.ts content
    const backgroundPath = join(process.cwd(), 'src', 'background.ts')
    const backgroundContent = readFileSync(backgroundPath, 'utf-8')

    // Verify message handler for screenshot capture in background
    expect(backgroundContent).toContain('CLEANCLIP_SCREENSHOT_CAPTURE')
    // Note: Cropping is done via offscreen document using storage polling
  })

  it('4.8 should handle command events', async () => {
    // Read background.ts content
    const backgroundPath = join(process.cwd(), 'src', 'background.ts')
    const backgroundContent = readFileSync(backgroundPath, 'utf-8')

    // Verify command handler
    expect(backgroundContent).toContain('chrome.commands.onCommand')
    expect(backgroundContent).toContain('cleanclip-screenshot')
    expect(backgroundContent).toContain('chrome.tabs.sendMessage')
    expect(backgroundContent).toContain('CLEANCLIP_SHOW_OVERLAY')
  })
})
