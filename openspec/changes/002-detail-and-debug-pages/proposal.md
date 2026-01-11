# Proposal: History Detail and Debug Pages

## Change ID
002-detail-and-debug-pages

## Status
Proposed

## Overview
Add user-facing detail page and developer debug page for CleanClip history items, allowing users to view, edit, and re-OCR screenshots while providing debugging tools to identify and fix coordinate offset issues.

## Why

### Prerequisites
**Phase 0 (fix existing tests) is a prerequisite for this feature.** Previous code fixes (v0.4.5-0.4.7) changed implementation details (e.g., using `createImageBitmap()` instead of `new Image()`), but tests still assert old code, causing test failures. These tests must pass before implementing new features.

### User Problems
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
  - Detail and debug pages are accessible via `chrome.tabs.create({ url: chrome.runtime.getURL(...) })`
  - No `web_accessible_resources` entry needed (pages are internal to extension, not exposed to external web content)

## Storage Strategy and Privacy

### Debug Mode Configuration
- **Default**: DISABLED (opt-in for privacy and storage efficiency)
- **User Control**: Users can enable/disable "Save debug info" in settings at any time
- **Retention**: Maximum 100 history items with FIFO (first-in-first-out) cleanup
- **Storage Location**: `chrome.storage.local` (per-user, isolated, no server-side storage)

### What Gets Stored
**When Debug Mode is DISABLED (default)**:
- Cropped image URL only
- No original full screenshot
- No debug metadata
- Minimal storage usage

**When Debug Mode is ENABLED**:
- Cropped image URL (always stored)
- Original full screenshot URL
- Selection coordinates `{x, y, width, height}`
- Original capture dimensions `{width, height}`
- Device Pixel Ratio
- Zoom Level

### Storage Limits and Cleanup
- Automatic cleanup when exceeding 100 items (oldest items removed first)
- User notification when automatic cleanup occurs
- Error handling when storage quota is exceeded
- "Clear All Debug Data" button to manually remove debug fields
- Disabling debug mode stops storing new debug info but preserves existing data

### Privacy Considerations
- All data stored locally in browser (no server transmission)
- User has full control over debug data retention
- Debug mode defaults to disabled to minimize privacy surface
- Users can clear debug data at any time without losing cropped images

## Impact

### Affected Code
- `tests/screenshot.test.ts`, `tests/context-menu.test.ts` (Phase 0)
- `src/history.ts` - extend HistoryItem type
- `src/background.ts` - save debug info
- `src/popup/main.ts` - click handlers
- `src/history-panel/component.ts` - clickable items

### New Files
- `src/detail/index.html`, `src/detail/main.ts`
- `src/debug/index.html`, `src/debug/main.ts`

### Breaking Changes
None

### Backward Compatibility
Yes - debug field is optional in HistoryItem

## Risks

### Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| HistoryItem structure change may affect existing data | Low | Debug field is optional, old data compatible, automatic migration |
| Direct URL access to detail/debug pages without valid history ID | Low | Pages validate history ID exists in user's storage; invalid IDs show error UI |
| Debug page displays potentially sensitive original screenshots | Low | Only accessible through intentional user action (right-click or Shift+click); debug mode defaults to disabled |

**Access Control Implementation**:
- Detail page: only opens when user explicitly clicks history item (`chrome.tabs.create()`)
- Debug page: only opens through intentional user action (right-click or Shift+click)
- Both pages validate requested history item exists in user's storage before displaying content
- Invalid or missing history ID shows error UI: "History item not found" with button to return to extension popup
- Missing debug field shows helpful message: "Debug info not available. Enable Debug Mode in settings for future captures."

### Privacy Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Original screenshots may contain sensitive content | Low | Debug mode defaults to DISABLED; user opt-in; no server storage |
| Storage quota exhaustion from full screenshots (dataURL/base64 in chrome.storage.local) | Medium | 100-item FIFO limit; automatic cleanup with notification; "Clear All Debug Data" button; estimated ~5-10MB per item with full screenshot; users notified before quota exceeded |
| Debug data persists after disabling | Low | Disabling stops new storage; user has "Clear All Debug Data" button |

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
