# CleanClip UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 UX improvements to CleanClip extension in priority order: Copy button, progress notifications, history navigation sidebar, markdown preview fixes, and better icons.

**Architecture:** Chrome Extension Manifest V3 with content scripts, background service worker, and detail page. Using TDD methodology (RED-GREEN-REFACTOR) with Vitest and happy-dom.

**Tech Stack:** TypeScript, Vitest, happy-dom, Chrome Extension APIs (notifications, storage, clipboard), vanilla JavaScript for DOM manipulation.

---

## Current State

**Version:** 0.5.4 on main branch
**Branch:** Create feature-003-ux-improvements
**Base:** main

**Files of Interest:**
- `src/detail/main.ts` - Detail page logic (buttons, markdown parser)
- `src/detail/index.html` - Detail page layout
- `src/background.ts` - Background service worker (OCR flow, notifications)
- `tests/background.test.ts` - Background tests
- `tests/detail.test.ts` - Detail page tests (to be created)

---

## Feature 1: Copy Button (Priority 1)

### Task 1.1: Write test for copy button functionality

**Files:**
- Create: `tests/detail.test.ts`
- Modify: `src/detail/main.ts`

**Step 1: Write the failing test**

Create `tests/detail.test.ts`:

```typescript
// @vitest-environment happy-dom
// Detail Page Tests for CleanClip

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupCopyButton } from '../src/detail/main'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve())
}

vi.stubGlobal('navigator', { clipboard: mockClipboard })

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({
        'cleanclip-history': [
          {
            id: 'test-id',
            text: 'Test OCR result',
            timestamp: Date.now(),
            imageUrl: 'data:image/png;base64,fake'
          }
        ]
      })),
      set: vi.fn(() => Promise.resolve())
    }
  }
}

vi.stubGlobal('chrome', mockChrome)

describe('Detail Page - Copy Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `
      <textarea data-text-input>Test OCR result</textarea>
      <button data-copy-button>Copy</button>
    `
  })

  it('should copy text to clipboard when copy button is clicked', async () => {
    setupCopyButton()

    const copyButton = document.querySelector('[data-copy-button]') as HTMLButtonElement
    copyButton.click()

    await Promise.resolve() // Wait for async clipboard operation

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test OCR result')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/detail.test.ts
```

Expected: FAIL with "setupCopyButton is not defined"

**Step 3: Write minimal implementation**

Add to `src/detail/main.ts`:

```typescript
/**
 * Set up Copy button functionality
 */
export function setupCopyButton(): void {
  const copyButton = document.querySelector('[data-copy-button]') as HTMLButtonElement

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const textInput = document.querySelector('[data-text-input]') as HTMLTextAreaElement
      if (!textInput) return

      const text = textInput.value

      try {
        await navigator.clipboard.writeText(text)
        showNotification('Text copied to clipboard')
      } catch (error) {
        showNotification('Failed to copy text')
      }
    })
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/detail.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/detail.test.ts src/detail/main.ts
git commit -m "feat: add copy button functionality with notification"
```

---

### Task 1.2: Update init() to call setupCopyButton

**Files:**
- Modify: `src/detail/main.ts`

**Step 1: Verify setupCopyButton is called in init()**

Check that `init()` function calls `setupCopyButton()`:

```typescript
async function init(): Promise<void> {
  // Set up event listeners immediately (synchronous)
  setupToggleButtons()
  setupSaveButton()
  setupReOcrButton()
  setupCopyButton()  // Should be added

  // ... rest of init
}
```

**Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 3: Commit if needed**

```bash
git add src/detail/main.ts
git commit -m "fix: ensure setupCopyButton is called on init"
```

---

## Feature 2: Progress Notifications (Priority 2)

### Task 2.1: Add notification after screenshot success

**Files:**
- Modify: `src/background.ts`
- Modify: `tests/background.test.ts`

**Step 1: Write the failing test**

Add to `tests/background.test.ts`:

```typescript
it('should show notification after screenshot success', async () => {
  await import('../src/background')

  const mockTab = { id: 1, url: 'https://example.com' }

  // Call the screenshot command callback
  await commandCallback!('cleanclip-screenshot', mockTab)

  // Should have created a success notification
  expect(mockNotifications.create).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'basic',
      title: 'CleanClip',
      message: expect.stringContaining('screenshot')
    })
  )
})
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/background.test.ts
```

Expected: FAIL - notification not created yet

**Step 3: Implement notification in background.ts**

Find the screenshot capture success location in `src/background.ts` and add:

```typescript
// After successful captureVisibleTab
const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' })

// Show success notification
showSuccessNotification('Screenshot captured! Sending to AI...')
```

Add helper function if not exists:

```typescript
function showSuccessNotification(message: string): void {
  if (chrome?.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon128.png'),
      title: 'CleanClip',
      message: message,
      priority: 2
    })
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/background.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/background.ts tests/background.test.ts
git commit -m "feat: add screenshot success notification"
```

---

### Task 2.2: Add notification after OCR completion

**Files:**
- Modify: `src/background.ts`
- Modify: `tests/background.test.ts`

**Step 1: Write the failing test**

Add to `tests/background.test.ts`:

```typescript
it('should show notification after OCR completion', async () => {
  await import('../src/background')

  const mockTab = { id: 1, url: 'https://example.com' }

  await commandCallback!('cleanclip-screenshot', mockTab)

  // Should have created OCR completion notification
  // Check that notifications.create was called with OCR success message
  const calls = mockNotifications.create.mock.calls
  const ocrCall = calls.find(call =>
    call[0].message && call[0].message.includes('clipboard')
  )

  expect(ocrCall).toBeTruthy()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/background.test.ts
```

Expected: FAIL - OCR completion notification not implemented

**Step 3: Implement notification in background.ts**

Find where OCR result is written to clipboard and add:

```typescript
// After successful writeToClipboardViaOffscreen
showSuccessNotification('OCR complete! Result copied to clipboard')
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/background.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/background.ts tests/background.test.ts
git commit -m "feat: add OCR completion notification"
```

---

## Feature 3: History Navigation Sidebar (Priority 3)

### Task 3.1: Create three-column layout

**Files:**
- Modify: `src/detail/index.html`
- Modify: `src/detail/main.ts`

**Step 1: Update HTML for three-column layout**

Modify `src/detail/index.html` body content to:

```html
<div data-notification class="hidden">
  <span data-notification-message></span>
</div>

<div data-detail-page>
  <!-- Left: History Navigation (180px) -->
  <div data-history-nav>
    <div data-history-list></div>
  </div>

  <!-- Middle: Text + Buttons -->
  <div data-middle-section>
    <div data-toggle-container>
      <button data-toggle-text class="active">Text</button>
      <button data-toggle-markdown>Markdown</button>
    </div>
    <div data-text-container>
      <textarea data-text-input placeholder="Extracted text will appear here..."></textarea>
      <div data-markdown-preview></div>
    </div>
    <div data-action-buttons>
      <button data-copy-button>Copy</button>
      <button data-reocr-button>Re-OCR</button>
      <button data-save-button>Save</button>
    </div>
  </div>

  <!-- Right: Screenshot Image -->
  <div data-right-section>
    <div data-screenshot-container>
      <img data-screenshot-image alt="Screenshot" />
    </div>
  </div>
</div>

<div data-error-message class="hidden">
  <h1>History item not found</h1>
  <p>The requested history item could not be found or may have been deleted.</p>
  <button id="backToPopup">Back to Extension</button>
</div>
```

**Step 2: Update CSS for three-column layout**

Update styles in `src/detail/index.html`:

```css
[data-detail-page] {
  display: flex;
  height: 100vh;
  width: 100vw;
}

[data-history-nav] {
  width: 180px;
  min-width: 180px;
  background-color: #f5f5f5;
  border-right: 1px solid #d1d1d1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

[data-history-list] {
  padding: 8px;
}

[data-history-item] {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

[data-history-item]:hover {
  background-color: #e8e8e8;
}

[data-history-item].active {
  background-color: #007AFF;
  color: white;
}

[data-history-item-time] {
  font-size: 11px;
  opacity: 0.7;
  margin-bottom: 4px;
}

[data-history-item-preview] {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

[data-middle-section] {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 20px;
  overflow: hidden;
  min-width: 0; /* Prevent flex overflow */
}

[data-right-section] {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8e8e8;
  border-left: 1px solid #d1d1d1;
  padding: 20px;
}

/* Remove old [data-left-section] styles - no longer needed */
```

**Step 3: Commit**

```bash
git add src/detail/index.html
git commit -m "refactor: update detail page to three-column layout"
```

---

### Task 3.2: Write test for history navigation

**Files:**
- Modify: `tests/detail.test.ts`

**Step 1: Write the failing test**

Add to `tests/detail.test.ts`:

```typescript
describe('Detail Page - History Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `
      <div data-history-list></div>
      <img data-screenshot-image alt="Screenshot" />
      <textarea data-text-input></textarea>
    `
  })

  it('should render history list with items', async () => {
    const mockHistory = [
      { id: '1', text: 'First item', timestamp: 1700000000000, imageUrl: 'data:image/png;base64,1' },
      { id: '2', text: 'Second item', timestamp: 1700000001000, imageUrl: 'data:image/png;base64,2' }
    ]

    mockChrome.storage.local.get.mockResolvedValue({
      'cleanclip-history': mockHistory
    })

    await import('../src/detail/main')

    const historyItems = document.querySelectorAll('[data-history-item]')
    expect(historyItems.length).toBe(2)
  })

  it('should highlight current history item', async () => {
    const mockHistory = [
      { id: '1', text: 'First item', timestamp: 1700000000000, imageUrl: 'data:image/png;base64,1' }
    ]

    mockChrome.storage.local.get.mockResolvedValue({
      'cleanclip-history': mockHistory
    })

    // Mock URL to have id=1
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      search: '?id=1'
    } as any)

    await import('../src/detail/main')

    const activeItem = document.querySelector('[data-history-item].active')
    expect(activeItem).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/detail.test.ts
```

Expected: FAIL - history rendering not implemented

**Step 3: Implement history navigation**

Add to `src/detail/main.ts`:

```typescript
/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}

/**
 * Render history navigation sidebar
 */
export async function renderHistoryNavigation(): Promise<void> {
  const historyList = document.querySelector('[data-history-list]') as HTMLElement
  if (!historyList) return

  const history = await getHistory()
  const currentId = getHistoryIdFromUrl()

  historyList.innerHTML = ''

  history.forEach(item => {
    const itemEl = document.createElement('div')
    itemEl.setAttribute('data-history-item', '')
    if (item.id === currentId) {
      itemEl.classList.add('active')
    }

    const timeEl = document.createElement('div')
    timeEl.setAttribute('data-history-item-time', '')
    timeEl.textContent = formatTimestamp(item.timestamp)

    const previewEl = document.createElement('div')
    previewEl.setAttribute('data-history-item-preview', '')
    previewEl.textContent = item.text

    itemEl.appendChild(timeEl)
    itemEl.appendChild(previewEl)

    itemEl.addEventListener('click', () => {
      loadHistoryItemDynamic(item.id)
    })

    historyList.appendChild(itemEl)
  })
}

/**
 * Load history item dynamically without page reload
 */
export async function loadHistoryItemDynamic(id: string): Promise<void> {
  const item = await loadHistoryItem(id)
  if (!item) return

  // Update URL without reloading
  const newUrl = new URL(window.location.href)
  newUrl.searchParams.set('id', id)
  window.history.pushState({}, '', newUrl.toString())

  // Update content
  displayScreenshot(item.imageUrl)
  displayText(item.text)

  // Update active state in nav
  document.querySelectorAll('[data-history-item]').forEach(el => {
    el.classList.remove('active')
  })
  const activeItem = document.querySelector(`[data-history-item][data-id="${id}"]`)
  activeItem?.classList.add('active')
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/detail.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/detail.test.ts src/detail/main.ts
git commit -m "feat: add history navigation sidebar with dynamic loading"
```

---

### Task 3.3: Update init() to render history nav

**Files:**
- Modify: `src/detail/main.ts`

**Step 1: Add renderHistoryNavigation to init()**

Update `init()` function:

```typescript
async function init(): Promise<void> {
  setupToggleButtons()
  setupSaveButton()
  setupReOcrButton()
  setupCopyButton()

  // Render history navigation
  await renderHistoryNavigation()

  const historyId = getHistoryIdFromUrl()
  // ... rest of init
}
```

**Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/detail/main.ts
git commit -m "fix: render history navigation on page load"
```

---

## Feature 4: Markdown Preview Fix (Priority 4)

### Task 4.1: Write test for improved markdown parser

**Files:**
- Modify: `tests/detail.test.ts`

**Step 1: Write the failing test**

Add to `tests/detail.test.ts`:

```typescript
describe('Markdown Parser', () => {
  it('should parse lists correctly', () => {
    const { simpleMarkdownParse } = require('../src/detail/main')
    const input = '- Item 1\n- Item 2\n- Item 3'
    const result = simpleMarkdownParse(input)
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>Item 1</li>')
    expect(result).toContain('<li>Item 2</li>')
    expect(result).toContain('</ul>')
  })

  it('should parse links correctly', () => {
    const { simpleMarkdownParse } = require('../src/detail/main')
    const input = '[Google](https://google.com)'
    const result = simpleMarkdownParse(input)
    expect(result).toContain('<a href="https://google.com">Google</a>')
  })

  it('should not break code blocks with line breaks', () => {
    const { simpleMarkdownParse } = require('../src/detail/main')
    const input = '```\nconst x = 1;\nconst y = 2;\n```'
    const result = simpleMarkdownParse(input)
    expect(result).toContain('<pre><code>')
    expect(result).toContain('const x = 1;')
    expect(result).toContain('const y = 2;')
    // Should not have <br> inside code block
    const codeContent = result.match(/<pre><code>(.*?)<\/code><\/pre>/s)?.[1]
    expect(codeContent).not.toContain('<br>')
  })

  it('should parse blockquotes', () => {
    const { simpleMarkdownParse } = require('../src/detail/main')
    const input = '> This is a quote'
    const result = simpleMarkdownParse(input)
    expect(result).toContain('<blockquote>')
    expect(result).toContain('This is a quote')
    expect(result).toContain('</blockquote>')
  })

  it('should parse horizontal rules', () => {
    const { simpleMarkdownParse } = require('../src/detail/main')
    const input = '---'
    const result = simpleMarkdownParse(input)
    expect(result).toContain('<hr>')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/detail.test.ts
```

Expected: FAIL - parser doesn't support these features

**Step 3: Implement improved markdown parser**

Replace `simpleMarkdownParse()` in `src/detail/main.ts`:

```typescript
/**
 * Simple markdown parser for preview
 * Handles: headers, bold, italic, code blocks, inline code, lists, links, blockquotes, horizontal rules
 */
export function simpleMarkdownParse(text: string): string {
  if (!text) return ''

  // First, protect code blocks from processing
  const codeBlocks: string[] = []
  let protectedText = text.replace(/```([\s\S]*?)```/g, (match) => {
    codeBlocks.push(match)
    return `__CODEBLOCK_${codeBlocks.length - 1}__`
  })

  // Process inline code (but not inside code blocks)
  protectedText = protectedText.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headers
  protectedText = protectedText.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  protectedText = protectedText.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  protectedText = protectedText.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold and Italic
  protectedText = protectedText.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
  protectedText = protectedText.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  protectedText = protectedText.replace(/\*(.*?)\*/gim, '<em>$1</em>')

  // Horizontal rules
  protectedText = protectedText.replace(/^---$/gim, '<hr>')
  protectedText = protectedText.replace(/^\*\*\*$/gim, '<hr>')

  // Blockquotes
  protectedText = protectedText.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

  // Links
  protectedText = protectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

  // Unordered lists
  protectedText = protectedText.replace(/^\- (.*$)/gim, '<li>$1</li>')
  // Wrap consecutive <li> in <ul>
  protectedText = protectedText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  protectedText = protectedText.replace(/<\/ul>\s*<ul>/g, '')

  // Ordered lists
  protectedText = protectedText.replace(/^\d+\. (.*$)/gim, '<oli>$1</oli>')
  protectedText = protectedText.replace(/(<oli>.*<\/oli>)/s, '<ol>$1</ol>')
  protectedText = protectedText.replace(/<\/oli>/g, '</li>')
  protectedText = protectedText.replace(/<oli>/g, '<li>')
  protectedText = protectedText.replace(/<\/ol>\s*<ol>/g, '')

  // Line breaks (but not inside code blocks)
  protectedText = protectedText.replace(/\n/gim, '<br>')

  // Restore code blocks
  protectedText = protectedText.replace(/__CODEBLOCK_(\d+)__/g, (_, index) => {
    const code = codeBlocks[parseInt(index)].slice(3, -3) // Remove ```
    return `<pre><code>${code}</code></pre>`
  })

  return protectedText
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/detail.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/detail/main.ts tests/detail.test.ts
git commit -m "fix: improve markdown parser with lists, links, blockquotes, code blocks"
```

---

## Feature 5: Better Icons (Priority 5)

**Note:** User will provide new icon files. This task is a placeholder for when files are available.

### Task 5.1: Prepare for icon replacement

**Files:**
- Modify: `public/manifest.json`

**Step 1: Check current icon references**

Verify `public/manifest.json` has:

```json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

**Step 2: Document icon requirements**

Create `docs/icon-specs.md`:

```markdown
# Icon Specifications

CleanClip requires 3 icon sizes:

- **16x16**: icon16.png - Toolbar icon
- **48x48**: icon48.png - Extension management page
- **128x128**: icon128.png - Chrome Web Store, notification icon

## Current Status

Waiting for user to provide new icon files.

## Implementation Steps (when icons ready):

1. Place new icon files in project root
2. Replace existing icon16.png, icon48.png, icon128.png
3. Test icon display in:
   - Chrome toolbar
   - chrome://extensions page
   - Notification popups
4. Commit new icons
```

**Step 3: Commit**

```bash
git add docs/icon-specs.md
git commit -m "docs: add icon specifications placeholder"
```

---

## Final Steps

### Task 6.1: Bump version and rebuild

**Files:**
- Modify: `package.json`
- Modify: `public/manifest.json`

**Step 1: Bump version to 0.6.0**

Update `package.json`:

```json
"version": "0.6.0"
```

Update `public/manifest.json`:

```json
"version": "0.6.0"
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Verify dist/manifest.json**

```bash
cat dist/manifest.json | grep version
```

Expected: `"version": "0.6.0"`

**Step 4: Commit**

```bash
git add package.json public/manifest.json dist/manifest.json
git commit -m "chore: bump version to 0.6.0"
```

---

### Task 6.2: Run full test suite

**Step 1: Run all tests**

```bash
npm test
```

Expected: All 70+ tests pass

**Step 2: Test in browser**

1. Load unpacked extension from `dist/` folder
2. Test copy button functionality
3. Test progress notifications appear
4. Test history navigation sidebar
5. Test markdown preview with lists, links, code blocks
6. Test all existing functionality still works

**Step 3: Commit any fixes**

```bash
git commit -am "test: fix issues found during manual testing"
```

---

### Task 6.3: Merge to main

**Step 1: Checkout main**

```bash
git checkout main
git pull origin main
```

**Step 2: Merge feature branch**

```bash
git merge feature-003-ux-improvements
```

**Step 3: Push to remote**

```bash
git push origin main
```

**Step 4: Delete feature branch**

```bash
git branch -d feature-003-ux-improvements
```

---

## Summary

This plan implements 5 UX improvements in priority order:

1. **Copy Button** - Copy text to clipboard with notification
2. **Progress Notifications** - Show notifications after screenshot and OCR
3. **History Navigation Sidebar** - 180px left sidebar with dynamic content loading
4. **Markdown Preview Fix** - Support for lists, links, blockquotes, code blocks
5. **Better Icons** - Placeholder for user-provided icons

**Total Tasks:** ~18 tasks across 6 phases
**Estimated Time:** 2-3 hours
**Testing:** TDD methodology throughout
**Version:** 0.5.4 → 0.6.0

---

## Lessons Learned from Previous Work

1. **Always rebuild after bumping version** - `dist/manifest.json` won't update until `npm run build`
2. **Use planning files** - Don't rely on TodoWrite alone for tracking
3. **Test for service worker environment** - `Image` constructor doesn't exist there
4. **Follow TDD strictly** - RED → GREEN → REFACTOR, no shortcuts
