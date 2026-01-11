# Tasks: 002-detail-and-debug-pages

## Status: Ready to Start

## Phase 0: Fix Existing Tests
**Goal**: Fix test failures caused by v0.4.7 debugging changes

**Context**: Code was fixed to use `createImageBitmap()` instead of `new Image()`, but test assertions still expect old code.

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 0.1 | Fix screenshot.test.ts: update assertion to createImageBitmap | Green | ⬜ | Test passes |
| 0.2 | Fix context-menu.test.ts: mock chrome.runtime.getURL | Green | ⬜ | Test passes |
| 0.3 | Run all tests to confirm passing | Green | ⬜ | All tests pass |
| 0.4 | Commit | - | ⬜ | Code committed |

---

## Phase 1: Extend History Data Structure
**Goal**: Add debug field to HistoryItem

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 1.1 | Write test: verify HistoryItem supports debug field | Red | ⬜ | Test written and fails |
| 1.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 1.3 | Implement: extend HistoryItem type definition | Green | ⬜ | Test passes |
| 1.4 | Refactor (if needed) | Refactor | ⬜ | Tests still pass |
| 1.5 | Commit | - | ⬜ | Code committed |

---

## Phase 2: Create User Detail Page
**Goal**: Create user-visible detail page

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 2.1 | Write test: verify detail page DOM structure | Red | ⬜ | Test written and fails |
| 2.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 2.3 | Implement: create src/detail/index.html | Green | ⬜ | Test passes |
| 2.4 | Implement: create src/detail/main.ts logic | Green | ⬜ | Test passes |
| 2.5 | Implement: Text/Markdown toggle | Green | ⬜ | Test passes |
| 2.6 | Commit | - | ⬜ | Code committed |

---

## Phase 3: Implement Detail Page Edit and Re-OCR
**Goal**: Users can edit text and re-OCR

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 3.1 | Write test: verify edit save functionality | Red | ⬜ | Test written and fails |
| 3.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 3.3 | Implement: save edited text to history | Green | ⬜ | Test passes |
| 3.4 | Implement: re-OCR button (call OCR API) | Green | ⬜ | Test passes |
| 3.5 | Commit | - | ⬜ | Code committed |

---

## Phase 4: Create Debug Page
**Goal**: Create developer debug tool page

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 4.1 | Write test: verify debug page DOM structure | Red | ⬜ | Test written and fails |
| 4.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 4.3 | Implement: create src/debug/index.html | Green | ⬜ | Test passes |
| 4.4 | Implement: original screenshot + crop box visualization | Green | ⬜ | Test passes |
| 4.5 | Implement: side-by-side comparison | Green | ⬜ | Test passes |
| 4.6 | Implement: coordinate adjustment tool | Green | ⬜ | Test passes |
| 4.7 | Commit | - | ⬜ | Code committed |

---

## Phase 5: Save Debug Information
**Goal**: Record coordinates, dimensions, etc. when saving history

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 5.1 | Write test: verify debug field is saved correctly | Red | ⬜ | Test written and fails |
| 5.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 5.3 | Implement: modify background.ts to save debug info | Green | ⬜ | Test passes |
| 5.4 | Commit | - | ⬜ | Code committed |

---

## Phase 6: Modify Popup Click Behavior
**Goal**: Clicking history item opens user detail page

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 6.1 | Write test: verify click calls chrome.tabs.create | Red | ⬜ | Test written and fails |
| 6.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 6.3 | Implement: add click event in history-panel | Green | ⬜ | Test passes |
| 6.4 | Implement: modify popup/main.ts to handle click | Green | ⬜ | Test passes |
| 6.5 | Implement: add debug entry (right-click/special key) | Green | ⬜ | Test passes |
| 6.6 | Commit | - | ⬜ | Code committed |

---

## Phase 7: Configure Manifest
**Goal**: Add pages to web_accessible_resources

| # | Task | Type | Status | Definition of Done |
|---|------|------|--------|-------------------|
| 7.1 | Write test: verify manifest configuration is correct | Red | ⬜ | Test written and fails |
| 7.2 | Run test to confirm failure | Red | ⬜ | See expected failure |
| 7.3 | Implement: modify public/manifest.json | Green | ⬜ | Test passes |
| 7.4 | Commit | - | ⬜ | Code committed |

---

## Summary

**Total Phases**: 8 (Phase 0-7)
**Total Tasks**: ~35

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
- `src/history.ts`
- `src/background.ts`
- `src/popup/main.ts`
- `src/history-panel/component.ts`
- `public/manifest.json`
- `package.json` (version 0.5.0)
