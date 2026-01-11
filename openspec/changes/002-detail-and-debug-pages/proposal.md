# Proposal: History Detail and Debug Pages

## Change ID
002-detail-and-debug-pages

## Status
Proposed

## Overview
Add user-facing detail page and developer debug page for CleanClip history items, allowing users to view, edit, and re-OCR screenshots while providing debugging tools to identify and fix coordinate offset issues.

## Why
1. Users cannot see the full screenshot content and OCR results in the history popup
2. There may be screenshot coordinate offset issues that need debugging tools to identify and fix
3. Users need to edit OCR results and re-recognize images

## What Changes

### Phase 0: Fix Existing Tests
- Fix `tests/screenshot.test.ts` - update assertions for `createImageBitmap`
- Fix `tests/context-menu.test.ts` - add `chrome.runtime.getURL` mock

### Phase 1-7: New Features
- **User Detail Page** (`src/detail/`):
  - Display cropped screenshot
  - Display extracted text with Text/Markdown toggle
  - Editable text area with save button
  - Copy to clipboard button
  - Re-OCR button (re-recognize with original image)

- **Debug Page** (`src/debug/`):
  - Display original screenshot with crop selection box visualization
  - Side-by-side comparison (original vs cropped)
  - Full debug data display (coordinates, DPI, zoom level)
  - Coordinate adjustment tool with real-time preview

- **Data Structure**:
  - Extend `HistoryItem` type with optional `debug` field
  - Store original image URL, selection coordinates, device pixel ratio, zoom level

- **User Interactions**:
  - Click history item to open detail page in new tab
  - Right-click/keyboard shortcut to open debug page

- **Configuration**:
  - Add detail and debug pages to `web_accessible_resources`

## Impact

### Affected Code
- `tests/screenshot.test.ts`, `tests/context-menu.test.ts` (Phase 0)
- `src/history.ts` - extend HistoryItem type
- `src/background.ts` - save debug info
- `src/popup/main.ts` - click handlers
- `src/history-panel/component.ts` - clickable items
- `public/manifest.json` - web_accessible_resources

### New Files
- `src/detail/index.html`, `src/detail/main.ts`
- `src/debug/index.html`, `src/debug/main.ts`

### Breaking Changes
None

### Backward Compatibility
Yes - debug field is optional in HistoryItem

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| HistoryItem structure change may affect existing data | Low | debug field is optional, old data compatible |
| Detail page URL may be exploited | Low | Only accesses user's own history data |

## Rollback Strategy
- `git revert <commit-hash>`
- Delete `src/detail/` and `src/debug/` directories
- Revert `src/history.ts` HistoryItem type

## Acceptance Criteria
- [ ] Clicking history item opens detail page in new tab
- [ ] Detail page shows screenshot (left) and text (right)
- [ ] Detail page supports Text/Markdown toggle
- [ ] Detail page text is editable with save
- [ ] Detail page supports re-OCR
- [ ] Debug page shows original screenshot + crop box
- [ ] Debug page shows full debug data (coords, size, DPI, zoom)
- [ ] Debug page supports coordinate adjustment
- [ ] All existing tests pass
- [ ] New tests cover new features

## Data Structure

```typescript
interface HistoryItem {
  id: string
  text: string
  timestamp: number
  imageUrl: string  // cropped image
  debug?: {
    originalImageUrl: string  // original full screenshot
    selection: { x: number; y: number; width: number; height: number }
    originalSize: { width: number; height: number }
    devicePixelRatio: number
    zoomLevel: number
  }
}
```

## Related Changes
- Depends on: 001-prototype (v0.4.7)
