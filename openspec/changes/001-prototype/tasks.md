# OpenSpec Tasks: 001-prototype

## Overview

- **Total Phases**: 10
- **Total Tasks**: 58
- **Methodology**: TDD (Red-Green-Refactor)

---

## Phase 1: Project Skeleton

**Goal**: Set up Chrome Extension foundation and test framework

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 1.1 | Write test: manifest.json validation | Red | Test fails (file not found) | [x]
| 1.2 | Create Manifest V3 config | Green | Test passes | [x]
| 1.3 | Write test: Vite build succeeds | Red | Build fails | [x]
| 1.4 | Configure Vite + CRXJS + TypeScript | Green | Build passes | [x]
| 1.5 | Configure Vitest + Playwright | Green | Test framework runs | [x]
| 1.6 | Commit | - | "Phase 1: Project skeleton" | [x]

### Acceptance Criteria

- [x] `npm install` succeeds (using npm instead of pnpm)
- [x] `npm build` generates dist directory
- [x] `npm test` can run (8/8 tests passing)
- [x] manifest.json conforms to V3 spec

---

## Phase 2: Settings Page

**Goal**: Implement API Key and output preferences configuration

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 2.1 | Write test: Options page renders | Red | Test fails |
| 2.2 | Implement Options page UI | Green | Test passes |
| 2.3 | Write test: API Key storage/retrieval | Red | Test fails |
| 2.4 | Implement chrome.storage.local storage | Green | Test passes |
| 2.5 | Write test: Output format selection | Red | Test fails |
| 2.6 | Implement format selector (Text/Markdown) | Green | Test passes |
| 2.7 | Write test: Text processing options | Red | Test fails |
| 2.8 | Implement checkboxes (remove linebreaks, merge spaces) | Green | Test passes |
| 2.9 | Add security warning for API Key | Green | Warning visible |
| 2.10 | Commit | - | "Phase 2: Settings page" |

### Acceptance Criteria

- [ ] Options page opens
- [ ] Can input and save API Key
- [ ] Key persists after refresh
- [ ] Invalid Key shows error
- [ ] Can select output format (Text/Markdown)
- [ ] Can toggle text processing options
- [ ] Security warning displayed for API Key

---

## Phase 3: Context Menu (Right-click Image)

**Goal**: Implement right-click image → OCR trigger

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 3.1 | Write test: Context menu registration | Red | Test fails |
| 3.2 | Implement chrome.contextMenus setup | Green | Test passes |
| 3.3 | Write test: Menu appears on images only | Red | Test fails |
| 3.4 | Implement contexts: ["image"] filter | Green | Test passes |
| 3.5 | Write test: Click extracts image URL | Red | Test fails |
| 3.6 | Implement image URL extraction | Green | Test passes |
| 3.7 | Write test: Fetch image as base64 | Red | Test fails |
| 3.8 | Implement image fetch and conversion | Green | Test passes |
| 3.9 | Commit | - | "Phase 3: Context menu" |

### Acceptance Criteria

- [ ] Right-click on image shows "CleanClip: Recognize Text"
- [ ] Menu only appears on images
- [ ] Clicking fetches image data

---

## Phase 4: Area Screenshot

**Goal**: Implement `Cmd+Shift+C` area selection screenshot

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 4.1 | Write test: Shortcut registration | Red | Test fails |
| 4.2 | Implement commands config | Green | Test passes |
| 4.3 | Write test: Overlay UI displays | Red | Test fails |
| 4.4 | Implement screenshot overlay component | Green | Test passes |
| 4.5 | Write test: Area selection returns coordinates | Red | Test fails |
| 4.6 | Implement drag selection logic | Green | Test passes |
| 4.7 | Write test: Screenshot generates base64 | Red | Test fails |
| 4.8 | Implement captureVisibleTab + canvas crop | Green | Test passes |
| 4.9 | Commit | - | "Phase 4: Area screenshot" |

### Acceptance Criteria

- [ ] `Cmd+Shift+C` triggers screenshot mode
- [ ] Semi-transparent overlay appears
- [ ] Can drag to select area
- [ ] Selection returns base64 image
- [ ] Only captures visible tab area (documented limitation)

---

## Phase 5: OCR Module

**Goal**: Integrate Gemini 3 Flash for text recognition

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 5.1 | Write test: OCR function signature (Mock) | Red | Test fails |
| 5.2 | Implement OCR function skeleton | Green | Test passes |
| 5.3 | Write test: Plain text prompt construction | Red | Test fails |
| 5.4 | Implement plain text prompt | Green | Test passes |
| 5.5 | Write test: Markdown prompt construction | Red | Test fails |
| 5.6 | Implement Markdown prompt | Green | Test passes |
| 5.7 | Write test: API request format (Mock) | Red | Test fails |
| 5.8 | Implement Gemini API call | Green | Test passes |
| 5.9 | Write test: Error handling | Red | Test fails |
| 5.10 | Implement timeout/retry/error handling | Green | Test passes |
| 5.11 | Commit | - | "Phase 5: OCR module" |

### Acceptance Criteria

- [ ] `recognizeImage()` returns OCRResult
- [ ] Correctly constructs Gemini API request
- [ ] Supports plain text output prompt
- [ ] Supports Markdown output prompt
- [ ] Network errors have friendly message
- [ ] Timeout has retry mechanism

---

## Phase 6: Text Processing

**Goal**: Apply user-configured text transformations

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 6.1 | Write test: Remove extra line breaks | Red | Test fails |
| 6.2 | Implement removeLineBreaks() | Green | Test passes |
| 6.3 | Write test: Merge consecutive spaces | Red | Test fails |
| 6.4 | Implement mergeSpaces() | Green | Test passes |
| 6.5 | Write test: Apply processing based on settings | Red | Test fails |
| 6.6 | Implement processText() with options | Green | Test passes |
| 6.7 | Commit | - | "Phase 6: Text processing" |

### Acceptance Criteria

- [ ] Line breaks removed when option enabled
- [ ] Spaces merged when option enabled
- [ ] Processing respects user settings
- [ ] Markdown structure preserved when applicable

---

## Phase 7: History Panel

**Goal**: Persistent storage and display of OCR results

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 7.1 | Write test: History storage schema | Red | Test fails |
| 7.2 | Implement HistoryItem type and storage | Green | Test passes |
| 7.3 | Write test: Add item to history | Red | Test fails |
| 7.4 | Implement addToHistory() | Green | Test passes |
| 7.5 | Write test: History panel UI renders | Red | Test fails |
| 7.6 | Implement history panel component | Green | Test passes |
| 7.7 | Write test: Copy button works | Red | Test fails |
| 7.8 | Implement copy action | Green | Test passes |
| 7.9 | Write test: Delete button works | Red | Test fails |
| 7.10 | Implement delete action | Green | Test passes |
| 7.11 | Write test: History persists across sessions | Red | Test fails |
| 7.12 | Implement chrome.storage.local persistence | Green | Test passes |
| 7.13 | Commit | - | "Phase 7: History panel" |

### Acceptance Criteria

- [ ] Each OCR result saved with timestamp
- [ ] History panel shows all past results
- [ ] Each item has copy button
- [ ] Each item has delete button
- [ ] History persists after browser restart
- [ ] Panel accessible from extension popup

---

## Phase 8: Clipboard & Toast

**Goal**: Write to clipboard and show notification

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 8.1 | Write test: Clipboard write | Red | Test fails |
| 8.2 | Implement clipboard.writeText() | Green | Test passes |
| 8.3 | Write test: Fallback when clipboard fails | Red | Test fails |
| 8.4 | Implement fallback (popup with copy button) | Green | Test passes |
| 8.5 | Write test: Toast notification shows | Red | Test fails |
| 8.6 | Implement toast component | Green | Test passes |
| 8.7 | Commit | - | "Phase 8: Clipboard & toast" |

### Acceptance Criteria

- [ ] Result written to system clipboard
- [ ] Toast shows "Copied!" confirmation
- [ ] Fallback works when clipboard unavailable
- [ ] Uses offscreen document if needed for permissions

---

## Phase 9: BDD End-to-End Tests

**Goal**: Validate complete flow with real API

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 9.1 | Configure .env and Playwright | - | Environment ready |
| 9.2 | Write BDD: Right-click image → copy flow | Red | Test fails |
| 9.3 | Debug and pass BDD test | Green | Test passes |
| 9.4 | Write BDD: Screenshot → copy flow | Red | Test fails |
| 9.5 | Debug and pass BDD test | Green | Test passes |
| 9.6 | Write BDD: History panel operations | Red | Test fails |
| 9.7 | Debug and pass BDD test | Green | Test passes |
| 9.8 | Write BDD: Error scenario (no API Key) | Red | Test fails |
| 9.9 | Implement error prompt | Green | Test passes |
| 9.10 | Commit | - | "Phase 9: BDD tests" |

### Acceptance Criteria

- [ ] E2E tests use real Gemini API from .env
- [ ] Complete flow automated
- [ ] Error scenarios covered
- [ ] `pnpm test:e2e` requires explicit `GEMINI_API_KEY`

---

## Phase 10: Release Preparation

**Goal**: Documentation and demo assets

| # | Task | Type | Definition of Done |
|---|------|------|-------------------|
| 10.1 | Write README (install/usage) | - | Doc complete |
| 10.2 | Record Demo GIF | - | GIF usable |
| 10.3 | Create .env.example | - | File exists |
| 10.4 | Create .gitignore (exclude .env) | - | File exists |
| 10.5 | Commit | - | "Phase 10: Release preparation" |

### Acceptance Criteria

- [ ] README has installation steps
- [ ] README has usage instructions
- [ ] Demo GIF shows core functionality
- [ ] .env.example has template
- [ ] .env is gitignored

---

## Execution Notes

### TDD Workflow (per feature)

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Optimize while keeping tests green

### Test Commands

```bash
pnpm test          # Run TDD unit tests
pnpm test:e2e      # Run BDD end-to-end tests (requires GEMINI_API_KEY)
pnpm test:watch    # Watch mode
```

### Environment Variables

```bash
# .env (gitignored)
GEMINI_API_KEY=your_key_here
```

### Gemini Prompts

```typescript
// Plain Text
const PROMPT_TEXT = `
Extract all text from this image.
Clean up: remove extra line breaks, merge spaces.
Output plain text only.
`

// Markdown
const PROMPT_MARKDOWN = `
Extract all text from this image.
Preserve structure as Markdown:
- Headings → # ## ###
- Lists → - or 1. 2. 3.
- Tables → | col | col |
Output valid Markdown.
`
```
