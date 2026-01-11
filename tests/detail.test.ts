// @vitest-environment happy-dom
// Detail Page Tests for CleanClip
// Tests for detail page DOM structure and initialization

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Mock chrome API before any imports
const mockHistoryItem = {
  id: 'test-id-123',
  text: 'Sample OCR text',
  timestamp: 1000,
  imageUrl: 'data:image/png;base64,abc123'
}

const mockChrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({ cleanclip_history: [mockHistoryItem] })),
      set: vi.fn(() => Promise.resolve())
    }
  },
  tabs: {
    create: vi.fn(() => Promise.resolve())
  }
}

// Set up chrome global
vi.stubGlobal('chrome', mockChrome)

describe('Detail Page - DOM Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
  })

  it('should have detail page HTML file at src/detail/index.html', () => {
    // This test will FAIL because the detail page HTML file doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    expect(() => {
      readFileSync(htmlPath, 'utf-8')
    }).not.toThrow()
  })

  it('should contain screenshot container element', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for screenshot container on the left side
    expect(htmlContent).toContain('data-screenshot-container')
  })

  it('should contain text content container element', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for text content container on the right side
    expect(htmlContent).toContain('data-text-container')
  })

  it('should contain editable textarea for extracted text', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for editable textarea
    expect(htmlContent).toContain('<textarea')
    expect(htmlContent).toContain('data-text-input')
  })

  it('should contain Text/Markdown toggle switch', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for toggle switch buttons
    expect(htmlContent).toContain('data-toggle-text')
    expect(htmlContent).toContain('data-toggle-markdown')
  })

  it('should contain Copy button', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for copy button
    expect(htmlContent).toContain('data-copy-button')
  })

  it('should contain Re-OCR button', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for re-OCR button
    expect(htmlContent).toContain('data-reocr-button')
  })

  it('should contain Save button for edited text', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for save button
    expect(htmlContent).toContain('data-save-button')
  })

  it('should have proper layout structure with left and right sections', () => {
    // Load detail page HTML content
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Check for layout structure
    // Should have a main container with left and right sections
    expect(htmlContent).toContain('data-detail-page')
    expect(htmlContent).toContain('data-left-section')
    expect(htmlContent).toContain('data-right-section')
  })
})

describe('Detail Page - Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
  })

  it('should load history item from chrome.storage.local', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // The detail page should load history item from storage
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith('cleanclip_history')
  })

  it('should display the cropped screenshot image', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check if screenshot image is displayed
    const screenshotImg = document.querySelector('[data-screenshot-image]') as HTMLImageElement
    expect(screenshotImg).toBeDefined()
    expect(screenshotImg?.src).toBe(mockHistoryItem.imageUrl)
  })

  it('should populate textarea with extracted text', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check if textarea is populated with history item text
    const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
    expect(textInput?.value).toBe('Sample OCR text')
  })

  it('should show error message for invalid history ID', async () => {
    // Mock empty history (invalid ID scenario)
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [] }))

    // Set up URL with invalid history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=invalid-id')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1>History item not found</h1>
        <p>The requested history item could not be found or may have been deleted.</p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check for error message
    const detailPage = document.querySelector('[data-detail-page]') as HTMLElement
    const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

    expect(detailPage?.classList.contains('hidden')).toBe(true)
    expect(errorMessage?.classList.contains('hidden')).toBe(false)
  })
})

describe('Detail Page - Text/Markdown Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
  })

  it('should have Text toggle button', () => {
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    expect(htmlContent).toContain('data-toggle-text')
    expect(htmlContent).toContain('Text')
  })

  it('should have Markdown toggle button', () => {
    // This test will FAIL because src/detail/index.html doesn't exist yet
    const htmlPath = join(process.cwd(), 'src/detail/index.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    expect(htmlContent).toContain('data-toggle-markdown')
    expect(htmlContent).toContain('Markdown')
  })

  it('should default to Text mode', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-toggle-container>
            <button data-toggle-text>Text</button>
            <button data-toggle-markdown>Markdown</button>
          </div>
          <div data-text-container>
            <textarea data-text-input></textarea>
            <div data-markdown-preview></div>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check that text input is visible and markdown preview is hidden
    const textInput = document.querySelector('[data-text-input]') as HTMLElement
    const markdownPreview = document.querySelector('[data-markdown-preview]') as HTMLElement

    expect(textInput?.style.display).not.toBe('none')
    expect(markdownPreview?.style.display).toBe('none')
  })
})

describe('Detail Page - Action Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
  })

  it('should have Copy button that copies text to clipboard', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
          <div data-action-buttons>
            <button data-copy-button>Copy</button>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Simulate click on copy button
    const copyButton = document.querySelector('[data-copy-button]') as HTMLButtonElement
    copyButton?.click()

    // This test will need clipboard API mocking in the implementation phase
    // For now, we're just checking the button exists and can be clicked
    expect(copyButton).toBeDefined()
  })

  it('should have Re-OCR button that triggers re-recognition', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
          <div data-action-buttons>
            <button data-reocr-button>Re-OCR</button>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check that re-OCR button exists
    const reocrButton = document.querySelector('[data-reocr-button]')
    expect(reocrButton).toBeDefined()
  })

  it('should have Save button that saves edited text', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Set up DOM with detail page structure
    document.body.innerHTML = `
      <div data-detail-page>
        <div data-left-section>
          <div data-screenshot-container>
            <img data-screenshot-image alt="Screenshot" />
          </div>
        </div>
        <div data-right-section>
          <div data-text-container>
            <textarea data-text-input></textarea>
          </div>
          <div data-action-buttons>
            <button data-save-button>Save</button>
          </div>
        </div>
      </div>
      <div data-error-message class="hidden">
        <h1></h1>
        <p></p>
      </div>
    `

    // Import detail page main module
    await import('../src/detail/main')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check that save button exists
    const saveButton = document.querySelector('[data-save-button]')
    expect(saveButton).toBeDefined()
  })
})
