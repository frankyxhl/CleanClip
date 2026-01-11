# Tasks: 002-detail-and-debug-pages

## Overview

- **Total Phases**: 7 (Phase 0-6)
- **Total Tasks**: ~32
- **Methodology**: TDD (Red-Green-Refactor)
- **Status**: COMPLETE ✅

---

## Phase 0: Fix Existing Tests

**Goal**: Fix test failures caused by v0.4.7 debugging changes

**Context**: Code was fixed to use `createImageBitmap()` instead of `new Image()`, but test assertions still expect old code. This is a **prerequisite** for all other phases.

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 0.1 | Fix screenshot.test.ts: update assertion to createImageBitmap | Green | Test passes | [x] |
| 0.2 | Fix context-menu.test.ts: mock chrome.runtime.getURL | Green | Test passes | [x] |
| 0.3 | Run all tests to confirm passing | Green | All tests pass | [x] |
| 0.4 | Commit | - | "Phase 0: fix existing tests" | [x] |

### Acceptance Criteria

- [x] `npm test -- --run` passes (all tests green)
- [x] No test failures related to screenshot.test.ts
- [x] No test failures related to context-menu.test.ts

---

## Phase 1: Extend History Data Structure

**Goal**: Add debug field to HistoryItem

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 1.1 | Write test: verify HistoryItem supports debug field | Red | Test written and fails | [x] |
| 1.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 1.3 | Implement: extend HistoryItem type definition | Green | Test passes | [x] |
| 1.4 | Refactor (if needed) | Refactor | Tests still pass | [x] |
| 1.5 | Commit | - | "Phase 1: extend HistoryItem type" | [x] |

### Acceptance Criteria

- [x] HistoryItem type has optional `debug` field
- [x] Debug field matches spec structure (originalImageUrl, selection, originalSize, devicePixelRatio, zoomLevel)
- [x] Existing history items without debug field work correctly

---

## Phase 2: Create User Detail Page

**Goal**: Create user-visible detail page

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 2.1 | Write test: verify detail page DOM structure | Red | Test written and fails | [x] |
| 2.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 2.3 | Implement: create src/detail/index.html | Green | Test passes | [x] |
| 2.4 | Implement: create src/detail/main.ts logic | Green | Test passes | [x] |
| 2.5 | Implement: Text/Markdown toggle | Green | Test passes | [x] |
| 2.6 | Commit | - | "Phase 2: user detail page" | [x] |

### Acceptance Criteria

- [x] Detail page HTML file exists
- [x] Detail page shows screenshot on left
- [x] Detail page shows text on right
- [x] Text/Markdown toggle works
- [x] Page loads without errors

---

## Phase 3: Implement Detail Page Edit and Re-OCR

**Goal**: Users can edit text and re-OCR

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 3.1 | Write test: verify edit save functionality | Red | Test written and fails | [x] |
| 3.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 3.3 | Implement: save edited text to history | Green | Test passes | [x] |
| 3.4 | Implement: re-OCR button (call OCR API) | Green | Test passes | [x] |
| 3.5 | Commit | - | "Phase 3: edit and re-OCR" | [x] |

### Acceptance Criteria

- [x] Text area is editable
- [x] Save button updates history item
- [x] Success notification confirms save
- [x] Re-OCR button calls OCR API with original image
- [x] New OCR result updates history item

---

## Phase 4: Create Debug Page

**Goal**: Create developer debug tool page

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 4.1 | Write test: verify debug page DOM structure | Red | Test written and fails | [x] |
| 4.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 4.3 | Implement: create src/debug/index.html | Green | Test passes | [x] |
| 4.4 | Implement: original screenshot + crop box visualization | Green | Test passes | [x] |
| 4.5 | Implement: side-by-side comparison | Green | Test passes | [x] |
| 4.6 | Implement: coordinate adjustment tool | Green | Test passes | [x] |
| 4.7 | Commit | - | "Phase 4: debug page" | [x] |

### Acceptance Criteria

- [x] Debug page HTML file exists
- [x] Original screenshot displays with red crop box overlay
- [x] Side-by-side comparison shows original vs cropped
- [x] Debug data panel shows coordinates, size, DPI, zoom
- [x] Coordinate adjustment inputs work
- [x] Apply button updates crop box in real-time
- [x] Save to History button updates coordinates

---

## Phase 5: Save Debug Information

**Goal**: Record coordinates, dimensions, etc. when saving history

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 5.1 | Write test: verify debug field is saved correctly | Red | Test written and fails | [x] |
| 5.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 5.3 | Implement: modify background.ts to save debug info | Green | Test passes | [x] |
| 5.4 | Commit | - | "Phase 5: save debug info" | [x] |

### Acceptance Criteria

- [x] Background script saves debug info when enabled
- [x] Debug info includes originalImageUrl, selection, originalSize, devicePixelRatio, zoomLevel
- [x] Debug field is optional (not saved when mode disabled)

---

## Phase 6: Modify Popup Click Behavior

**Goal**: Clicking history item opens user detail page

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 6.1 | Write test: verify click calls chrome.tabs.create | Red | Test written and fails | [x] |
| 6.2 | Run test to confirm failure | Red | See expected failure | [x] |
| 6.3 | Implement: add click event in history-panel | Green | Test passes | [x] |
| 6.4 | Implement: modify popup/main.ts to handle click | Green | Test passes | [x] |
| 6.5 | Implement: add debug entry (right-click/special key) | Green | Test passes | [x] |
| 6.6 | Commit | - | "Phase 6: popup click handlers" | [x] |

### Acceptance Criteria

- [x] Clicking history item opens detail page in new tab
- [x] Right-clicking history item opens debug page
- [x] Shift+clicking history item opens debug page
- [x] Detail page validates history ID before loading
- [x] Invalid history ID shows error page

---

## Files

### Phase 0 (Fix Tests)
- `tests/screenshot.test.ts`
- `tests/context-menu.test.ts`

### To Create
- `src/detail/index.html`
- `src/detail/main.ts`
- `src/debug/index.html`
- `src/debug/main.ts`

### To Modify
- `src/history.ts` - add debug field to HistoryItem
- `src/background.ts` - save debug info
- `src/popup/main.ts` - click handlers
- `src/history-panel/component.ts` - clickable items
- `package.json` - version 0.5.0
