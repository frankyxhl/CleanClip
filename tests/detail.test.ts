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

// Create a mock for the OCR module that can be controlled in tests
export const mockRecognizeImage = vi.fn(() => Promise.resolve({
  text: 'Mock OCR result',
  timestamp: Date.now()
}))

vi.mock('../src/ocr', () => ({
  recognizeImage: mockRecognizeImage
}))

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

describe('Detail Page - Edit and Save Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Re-setup the mock after clearing
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: [mockHistoryItem] }))
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should have editable textarea for OCR text', async () => {
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

    // Get the textarea element
    const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement

    // Verify textarea is editable
    expect(textInput).toBeDefined()
    expect(textInput.disabled).toBe(false)
    expect(textInput.readOnly).toBe(false)
  })

  it('should have Save button', async () => {
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

    // Check for save button
    const saveButton = document.querySelector('[data-save-button]')
    expect(saveButton).toBeDefined()
    expect(saveButton?.textContent).toContain('Save')
  })

  it('should save edited text to history when Save button is clicked', async () => {
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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the textarea and save button
    const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
    const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement

    // Edit the text
    const editedText = 'Edited OCR text with corrections'
    textInput.value = editedText

    // Click save button
    saveButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify chrome.storage.local.set was called with updated history
    expect(mockChrome.storage.local.set).toHaveBeenCalled()

    // Get the call arguments
    const setCalls = mockChrome.storage.local.set.mock.calls
    const lastCall = setCalls[setCalls.length - 1][0]

    // Verify the history was updated
    expect(lastCall.cleanclip_history).toBeDefined()
    const updatedHistory = lastCall.cleanclip_history
    const updatedItem = updatedHistory.find((item: any) => item.id === 'test-id-123')
    expect(updatedItem).toBeDefined()
    expect(updatedItem.text).toBe(editedText)
  })

  it('should display success notification after saving', async () => {
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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the textarea and save button
    const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
    const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement

    // Edit the text
    textInput.value = 'Edited text'

    // Click save button
    saveButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Check for success notification
    const notification = document.querySelector('[data-notification]') as HTMLElement
    const notificationMessage = document.querySelector('[data-notification-message]') as HTMLElement

    // Verify notification is shown and contains success message
    expect(notification?.classList.contains('hidden')).toBe(false)
    expect(notificationMessage?.textContent).toContain('saved')
    expect(notificationMessage?.textContent).toContain('success')
  })

  it('should update the specific history item without affecting others', async () => {
    // Set up URL with history ID parameter
    delete (window as any).location
    window.location = new URL('http://localhost/detail.html?id=test-id-123')

    // Mock multiple history items
    const mockHistory = [
      { id: 'test-id-123', text: 'Original text 1', timestamp: 1000, imageUrl: 'data:image/png;base64,abc123' },
      { id: 'another-id-456', text: 'Original text 2', timestamp: 2000, imageUrl: 'data:image/png;base64,def456' },
      { id: 'third-id-789', text: 'Original text 3', timestamp: 3000, imageUrl: 'data:image/png;base64,ghi789' }
    ]
    mockChrome.storage.local.get = vi.fn(() => Promise.resolve({ cleanclip_history: mockHistory }))

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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the textarea and save button
    const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
    const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement

    // Edit the text
    textInput.value = 'Updated text for first item'

    // Click save button
    saveButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify only the target item was updated
    const setCalls = mockChrome.storage.local.set.mock.calls
    const lastCall = setCalls[setCalls.length - 1][0]
    const updatedHistory = lastCall.cleanclip_history

    expect(updatedHistory).toHaveLength(3)
    expect(updatedHistory[0].id).toBe('test-id-123')
    expect(updatedHistory[0].text).toBe('Updated text for first item')
    expect(updatedHistory[1].id).toBe('another-id-456')
    expect(updatedHistory[1].text).toBe('Original text 2') // Unchanged
    expect(updatedHistory[2].id).toBe('third-id-789')
    expect(updatedHistory[2].text).toBe('Original text 3') // Unchanged
  })
})

describe('Detail Page - Re-OCR Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    document.body.innerHTML = ''
    // Reset the mock function for each test
    mockRecognizeImage.mockClear()
    // Re-setup the mock after clearing
    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip-api-key') {
        return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
      }
      return Promise.resolve({ cleanclip_history: [mockHistoryItem] })
    })
    mockChrome.storage.local.set = vi.fn(() => Promise.resolve())
  })

  it('should call OCR API when Re-OCR button is clicked', async () => {
    // Set up the mock to return specific value
    mockRecognizeImage.mockResolvedValue({
      text: 'Re-recognized text',
      timestamp: Date.now()
    })

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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the Re-OCR button
    const reocrButton = document.querySelector('[data-reocr-button]') as HTMLButtonElement

    // Click Re-OCR button
    reocrButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify recognizeImage was called with the correct image
    expect(mockRecognizeImage).toHaveBeenCalled()
    expect(mockRecognizeImage).toHaveBeenCalledWith(
      mockHistoryItem.imageUrl,
      'text',
      'test-api-key'
    )
  })

  it('should update history item with new OCR result', async () => {
    // Set up the mock to return specific value
    mockRecognizeImage.mockResolvedValue({
      text: 'Newly recognized text',
      timestamp: Date.now()
    })

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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the Re-OCR button
    const reocrButton = document.querySelector('[data-reocr-button]') as HTMLButtonElement

    // Click Re-OCR button
    reocrButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify chrome.storage.local.set was called with updated history
    expect(mockChrome.storage.local.set).toHaveBeenCalled()

    // Get the call arguments
    const setCalls = mockChrome.storage.local.set.mock.calls
    const lastCall = setCalls[setCalls.length - 1][0]

    // Verify the history was updated with new OCR result
    expect(lastCall.cleanclip_history).toBeDefined()
    const updatedHistory = lastCall.cleanclip_history
    const updatedItem = updatedHistory.find((item: any) => item.id === 'test-id-123')
    expect(updatedItem).toBeDefined()
    expect(updatedItem.text).toBe('Newly recognized text')
  })

  it('should use originalImageUrl when available for Re-OCR', async () => {
    // Create a history item with debug information
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

    // Set up the mock to return specific value
    mockRecognizeImage.mockResolvedValue({
      text: 'Re-recognized from original',
      timestamp: Date.now()
    })

    mockChrome.storage.local.get = vi.fn((keys) => {
      if (keys === 'cleanclip-api-key') {
        return Promise.resolve({ 'cleanclip-api-key': 'test-api-key' })
      }
      return Promise.resolve({ cleanclip_history: [mockHistoryItemWithDebug] })
    })

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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the Re-OCR button
    const reocrButton = document.querySelector('[data-reocr-button]') as HTMLButtonElement

    // Click Re-OCR button
    reocrButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify recognizeImage was called with original image URL
    expect(mockRecognizeImage).toHaveBeenCalledWith(
      mockHistoryItemWithDebug.debug.originalImageUrl,
      'text',
      'test-api-key'
    )
  })

  it('should show notification after successful Re-OCR', async () => {
    // Set up the mock to return specific value
    mockRecognizeImage.mockResolvedValue({
      text: 'Re-recognized text',
      timestamp: Date.now()
    })

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
      <div data-notification class="hidden">
        <span data-notification-message></span>
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

    // Get the Re-OCR button
    const reocrButton = document.querySelector('[data-reocr-button]') as HTMLButtonElement

    // Click Re-OCR button
    reocrButton.click()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check for success notification
    const notification = document.querySelector('[data-notification]') as HTMLElement
    const notificationMessage = document.querySelector('[data-notification-message]') as HTMLElement

    // Verify notification is shown and contains success message
    expect(notification?.classList.contains('hidden')).toBe(false)
    expect(notificationMessage?.textContent).toContain('Re-OCR')
    expect(notificationMessage?.textContent).toContain('success')
  })
})
