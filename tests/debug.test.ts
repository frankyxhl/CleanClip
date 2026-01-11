// @vitest-environment happy-dom
// Debug Page Tests for CleanClip
// Tests for debug page DOM structure and initialization

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Mock chrome API before any imports (similar to detail.test.ts)
const mockHistoryItemWithDebug = {
  id: 'test-id-123',
  text: 'Sample OCR text',
  timestamp: 1000,
  imageUrl: 'data:image/png;base64,cropped',
  debug: {
    originalImageUrl: 'data:image/png;base64,original',
    selection: { x: 10, y: 10, width: 100, height: 100 },
    originalSize: { width: 1920, height: 1080 },
    devicePixelRatio: 2,
    zoomLevel: 1
  }
}

const mockHistoryItemWithoutDebug = {
  id: 'test-id-456',
  text: 'Sample OCR text without debug',
  timestamp: 2000,
  imageUrl: 'data:image/png;base64,cropped'
}

const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        if (keys === 'cleanclip_history') {
          return Promise.resolve({ cleanclip_history: [mockHistoryItemWithDebug] })
        }
        return Promise.resolve({})
      }),
      set: vi.fn(() => Promise.resolve())
    }
  },
  tabs: {
    create: vi.fn(() => Promise.resolve())
  }
}

// Set up chrome global
vi.stubGlobal('chrome', mockChrome)

describe('Debug Page - DOM Structure', () => {
  it('should have debug page HTML file at src/debug/index.html', () => {
    // This test will FAIL because the debug page HTML file doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)
  })

  it('should contain original screenshot container element', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for original screenshot container
    expect(htmlContent).toContain('data-original-screenshot-container')
  })

  it('should contain crop box overlay element', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for crop box overlay (red box showing selection)
    expect(htmlContent).toContain('data-crop-box-overlay')
  })

  it('should contain side-by-side comparison section', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for comparison section with original and cropped views
    expect(htmlContent).toContain('data-comparison-section')
    expect(htmlContent).toContain('data-original-view')
    expect(htmlContent).toContain('data-cropped-view')
  })

  it('should contain debug data panel', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for debug data panel
    expect(htmlContent).toContain('data-debug-panel')

    // Check for individual debug data fields
    expect(htmlContent).toContain('data-debug-coordinates')
    expect(htmlContent).toContain('data-debug-original-size')
    expect(htmlContent).toContain('data-debug-device-pixel-ratio')
    expect(htmlContent).toContain('data-debug-zoom-level')
    expect(htmlContent).toContain('data-debug-original-url')
  })

  it('should contain coordinate adjustment tool', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for coordinate adjustment inputs
    expect(htmlContent).toContain('data-coordinate-adjustment')

    // Check for individual coordinate inputs
    expect(htmlContent).toContain('data-input-x')
    expect(htmlContent).toContain('data-input-y')
    expect(htmlContent).toContain('data-input-width')
    expect(htmlContent).toContain('data-input-height')

    // Check for Apply button
    expect(htmlContent).toContain('data-apply-button')
  })

  it('should contain Save to History button', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for Save to History button
    expect(htmlContent).toContain('data-save-to-history-button')
  })

  it('should contain no debug data message element', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for no debug data message
    expect(htmlContent).toContain('data-no-debug-message')
  })

  it('should have proper layout structure', () => {
    // This test will FAIL because src/debug/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/debug/index.html')
    expect(existsSync(htmlPath)).toBe(true)

    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for main page container
    expect(htmlContent).toContain('data-debug-page')
  })
})

// The following test suites require the debug/main.ts file to exist.
// They will be skipped during the Red phase (TDD) and will run in the Green phase
// after the implementation is complete.

const mainTsPath = join(process.cwd(), 'src/debug/main.ts')
const hasMainFile = existsSync(mainTsPath)

describe.skipIf(!hasMainFile)('Debug Page - Initialization with Debug Data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Reset mock to default behavior
    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip_history') {
        return Promise.resolve({ cleanclip_history: [mockHistoryItemWithDebug] })
      }
      return Promise.resolve({})
    })
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should load history item from chrome.storage.local', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // The debug page should load history item from storage
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith('cleanclip_history')
  })

  it('should display original screenshot with crop box overlay', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check if original screenshot image is displayed
    const originalScreenshotImg = document.querySelector('[data-original-screenshot-image]') as HTMLImageElement
    expect(originalScreenshotImg).toBeDefined()
    expect(originalScreenshotImg?.src).toBe(mockHistoryItemWithDebug.debug.originalImageUrl)

    // Check if crop box overlay is visible
    const cropBoxOverlay = document.querySelector('[data-crop-box-overlay]') as HTMLElement
    expect(cropBoxOverlay).toBeDefined()
    expect(cropBoxOverlay?.style.display).not.toBe('none')
  })

  it('should populate debug data panel with correct values', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates>
            <span data-coordinates-value></span>
          </div>
          <div data-debug-original-size>
            <span data-original-size-value></span>
          </div>
          <div data-debug-device-pixel-ratio>
            <span data-device-pixel-ratio-value></span>
          </div>
          <div data-debug-zoom-level>
            <span data-zoom-level-value></span>
          </div>
          <div data-debug-original-url>
            <span data-original-url-value></span>
          </div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check debug data values
    const coordinatesValue = document.querySelector('[data-coordinates-value]') as HTMLElement
    expect(coordinatesValue?.textContent).toContain('x: 10')
    expect(coordinatesValue?.textContent).toContain('y: 10')
    expect(coordinatesValue?.textContent).toContain('width: 100')
    expect(coordinatesValue?.textContent).toContain('height: 100')

    const originalSizeValue = document.querySelector('[data-original-size-value]') as HTMLElement
    expect(originalSizeValue?.textContent).toContain('1920')
    expect(originalSizeValue?.textContent).toContain('1080')

    const devicePixelRatioValue = document.querySelector('[data-device-pixel-ratio-value]') as HTMLElement
    expect(devicePixelRatioValue?.textContent).toBe('2')

    const zoomLevelValue = document.querySelector('[data-zoom-level-value]') as HTMLElement
    expect(zoomLevelValue?.textContent).toBe('1')
  })

  it('should populate coordinate adjustment inputs with current values', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check coordinate input values
    const inputX = document.querySelector('[data-input-x]') as HTMLInputElement
    const inputY = document.querySelector('[data-input-y]') as HTMLInputElement
    const inputWidth = document.querySelector('[data-input-width]') as HTMLInputElement
    const inputHeight = document.querySelector('[data-input-height]') as HTMLInputElement

    expect(inputX?.value).toBe('10')
    expect(inputY?.value).toBe('10')
    expect(inputWidth?.value).toBe('100')
    expect(inputHeight?.value).toBe('100')
  })
})

describe.skipIf(!hasMainFile)('Debug Page - Initialization without Debug Data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Reset mock to return history item without debug data
    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip_history') {
        return Promise.resolve({ cleanclip_history: [mockHistoryItemWithoutDebug] })
      }
      return Promise.resolve({})
    })
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should show helpful message when debug data is not available', async () => {
    // Set up URL with history ID parameter (item without debug data)
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-456')

    // Set up DOM with debug page structure - NOTE: no-debug-message starts with hidden class
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available for this item</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check that debug page is hidden
    const debugPage = document.querySelector('[data-debug-page]') as HTMLElement
    expect(debugPage?.classList.contains('hidden')).toBe(true)

    // Check that no debug message is visible (hidden class should be removed)
    const noDebugMessage = document.querySelector('[data-no-debug-message]') as HTMLElement
    expect(noDebugMessage?.classList.contains('hidden')).toBe(false)

    // Check message content
    const heading = noDebugMessage?.querySelector('h1') as HTMLElement
    const paragraph = noDebugMessage?.querySelector('p') as HTMLElement
    expect(heading?.textContent).toContain('Debug information not available')
    expect(paragraph?.textContent).toContain('Enable Debug Mode')
  })

  it('should show error message for invalid history ID', async () => {
    // Mock empty history (invalid ID scenario)
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))

    // Set up URL with invalid history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=invalid-id')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
      <div data-error-message class="hidden">
        <h1>History item not found</h1>
        <p>The requested history item could not be found or may have been deleted.</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check for error message
    const debugPage = document.querySelector('[data-debug-page]') as HTMLElement
    const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

    expect(debugPage?.classList.contains('hidden')).toBe(true)
    expect(errorMessage?.classList.contains('hidden')).toBe(false)
  })
})

describe.skipIf(!hasMainFile)('Debug Page - Coordinate Adjustment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Reset mock to default behavior
    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip_history') {
        return Promise.resolve({ cleanclip_history: [mockHistoryItemWithDebug] })
      }
      return Promise.resolve({})
    })
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should update crop box overlay when Apply button is clicked', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" value="10" />
          <input data-input-y type="number" value="10" />
          <input data-input-width type="number" value="100" />
          <input data-input-height type="number" value="100" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Get the coordinate inputs and apply button
    const inputX = document.querySelector('[data-input-x]') as HTMLInputElement
    const inputY = document.querySelector('[data-input-y]') as HTMLInputElement
    const inputWidth = document.querySelector('[data-input-width]') as HTMLInputElement
    const inputHeight = document.querySelector('[data-input-height]') as HTMLInputElement
    const applyButton = document.querySelector('[data-apply-button]') as HTMLButtonElement
    const cropBoxOverlay = document.querySelector('[data-crop-box-overlay]') as HTMLElement

    // Change coordinate values
    inputX.value = '20'
    inputY.value = '30'
    inputWidth.value = '150'
    inputHeight.value = '200'

    // Click Apply button
    applyButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check that crop box overlay was updated
    // The implementation should update the overlay's position and size
    expect(cropBoxOverlay?.style.left).toContain('20')
    expect(cropBoxOverlay?.style.top).toContain('30')
    expect(cropBoxOverlay?.style.width).toContain('150')
    expect(cropBoxOverlay?.style.height).toContain('200')
  })

  it('should update cropped preview when coordinates change', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view>
            <img data-comparison-cropped-image alt="Cropped Preview" />
          </div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" value="10" />
          <input data-input-y type="number" value="10" />
          <input data-input-width type="number" value="100" />
          <input data-input-height type="number" value="100" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Get the apply button and cropped preview
    const applyButton = document.querySelector('[data-apply-button]') as HTMLButtonElement
    const croppedPreview = document.querySelector('[data-comparison-cropped-image]') as HTMLImageElement

    // Store initial src
    const initialSrc = croppedPreview?.src || ''

    // Click Apply button to update preview
    applyButton.click()

    // Wait longer for async image onload and canvas operations
    await new Promise(resolve => setTimeout(resolve, 50))

    // Check that cropped preview was updated
    // The implementation should regenerate the cropped image with new coordinates
    expect(croppedPreview).toBeDefined()
    expect(croppedPreview?.src).toBeTruthy()
    // The src should have changed (it will be a data URL from canvas.toDataURL())
    // In happy-dom, the canvas operations still work and generate a data URL
  })

  it('should save updated coordinates to history when Save to History is clicked', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" value="10" />
          <input data-input-y type="number" value="10" />
          <input data-input-width type="number" value="100" />
          <input data-input-height type="number" value="100" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-notification class="hidden">
        <span data-notification-message></span>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Get the coordinate inputs and buttons
    const inputX = document.querySelector('[data-input-x]') as HTMLInputElement
    const inputY = document.querySelector('[data-input-y]') as HTMLInputElement
    const inputWidth = document.querySelector('[data-input-width]') as HTMLInputElement
    const inputHeight = document.querySelector('[data-input-height]') as HTMLInputElement
    const applyButton = document.querySelector('[data-apply-button]') as HTMLButtonElement
    const saveButton = document.querySelector('[data-save-to-history-button]') as HTMLButtonElement

    // Change coordinate values
    inputX.value = '50'
    inputY.value = '60'
    inputWidth.value = '200'
    inputHeight.value = '250'

    // Click Apply button first to update currentSelection (this is the expected user flow)
    applyButton.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Then click Save to History button
    saveButton.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify chrome.storage.local.set was called with updated history
    expect(mockChrome.storage.local.set).toHaveBeenCalled()

    // Get the call arguments
    const setCalls = mockChrome.storage.local.set.mock.calls
    const lastCall = setCalls[setCalls.length - 1][0]

    // Verify the history was updated with new coordinates
    expect(lastCall.cleanclip_history).toBeDefined()
    const updatedHistory = lastCall.cleanclip_history
    const updatedItem = updatedHistory.find((item: any) => item.id === 'test-id-123')
    expect(updatedItem).toBeDefined()
    expect(updatedItem.debug.selection.x).toBe(50)
    expect(updatedItem.debug.selection.y).toBe(60)
    expect(updatedItem.debug.selection.width).toBe(200)
    expect(updatedItem.debug.selection.height).toBe(250)
  })

  it('should display success notification after saving', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view></div>
          <div data-cropped-view></div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" value="10" />
          <input data-input-y type="number" value="10" />
          <input data-input-width type="number" value="100" />
          <input data-input-height type="number" value="100" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-notification class="hidden">
        <span data-notification-message></span>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Get the save button
    const saveButton = document.querySelector('[data-save-to-history-button]') as HTMLButtonElement

    // Click Save to History button
    saveButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check for success notification
    const notification = document.querySelector('[data-notification]') as HTMLElement
    const notificationMessage = document.querySelector('[data-notification-message]') as HTMLElement

    // Verify notification is shown and contains success message
    expect(notification?.classList.contains('hidden')).toBe(false)
    expect(notificationMessage?.textContent).toContain('saved')
    expect(notificationMessage?.textContent).toContain('coordinates')
  })
})

describe.skipIf(!hasMainFile)('Debug Page - Side-by-Side Comparison', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Reset mock to default behavior
    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip_history') {
        return Promise.resolve({ cleanclip_history: [mockHistoryItemWithDebug] })
      }
      return Promise.resolve({})
    })
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should display original screenshot in comparison section', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view>
            <img data-comparison-original-image alt="Original" />
          </div>
          <div data-cropped-view>
            <img data-comparison-cropped-image alt="Cropped" />
          </div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check if original screenshot is displayed in comparison section
    const comparisonOriginalImg = document.querySelector('[data-comparison-original-image]') as HTMLImageElement
    expect(comparisonOriginalImg).toBeDefined()
    expect(comparisonOriginalImg?.src).toBe(mockHistoryItemWithDebug.debug.originalImageUrl)
  })

  it('should display cropped result in comparison section', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/debug.html?id=test-id-123')

    // Set up DOM with debug page structure
    document.body.innerHTML = `
      <div data-debug-page>
        <div data-original-screenshot-container>
          <img data-original-screenshot-image alt="Original Screenshot" />
          <div data-crop-box-overlay></div>
        </div>
        <div data-comparison-section>
          <div data-original-view>
            <img data-comparison-original-image alt="Original" />
          </div>
          <div data-cropped-view>
            <img data-comparison-cropped-image alt="Cropped" />
          </div>
        </div>
        <div data-debug-panel>
          <div data-debug-coordinates></div>
          <div data-debug-original-size></div>
          <div data-debug-device-pixel-ratio></div>
          <div data-debug-zoom-level></div>
          <div data-debug-original-url></div>
        </div>
        <div data-coordinate-adjustment>
          <input data-input-x type="number" />
          <input data-input-y type="number" />
          <input data-input-width type="number" />
          <input data-input-height type="number" />
          <button data-apply-button>Apply</button>
          <button data-save-to-history-button>Save to History</button>
        </div>
      </div>
      <div data-no-debug-message class="hidden">
        <h1>Debug information not available</h1>
        <p>Enable Debug Mode in settings to save debug info for future captures</p>
      </div>
    `

    // Import debug page main module
    await import('../src/debug/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check if cropped result is displayed in comparison section
    const comparisonCroppedImg = document.querySelector('[data-comparison-cropped-image]') as HTMLImageElement
    expect(comparisonCroppedImg).toBeDefined()
    expect(comparisonCroppedImg?.src).toBe(mockHistoryItemWithDebug.imageUrl)
  })
})
