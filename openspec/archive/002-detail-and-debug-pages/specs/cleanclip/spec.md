# CleanClip Capability Spec - Delta for 002

## MODIFIED Requirements

### Requirement: REQ-005 - History Panel (Extended)

The extension SHALL maintain a history of OCR results with persistent storage.

**CHANGES**: Added click-to-view-detail functionality and debug information storage.

#### Scenario: User clicks history item to view detail (NEW)

**Given** the history panel is showing past results
**When** the user clicks on a history item
**Then** a new tab opens with the detail page (chrome.tabs.create)
**And** the detail page shows:
- The cropped screenshot on the left
- The extracted text on the right (with Text/Markdown toggle)
- Editable text area
- Copy button
- Re-OCR button

#### Scenario: User opens debug page (NEW)

**Given** the history panel is showing past results
**When** the user right-clicks on a history item
**Or** when the user holds Shift and clicks on a history item
**Then** a new tab opens with the debug page
**And** the debug page shows:
- The original full screenshot with crop selection box highlighted
- Side-by-side comparison (original vs cropped)
- Debug data: selection coordinates, original size, device pixel ratio, zoom level
- Coordinate adjustment tool with real-time preview


## ADDED Requirements

### Requirement: REQ-008 - History Detail Page

The extension SHALL provide a detail page for viewing complete OCR results with screenshot and extracted text.

**Prerequisites**: History item exists (REQ-005)

#### Scenario: User views OCR detail

**Given** an OCR result exists in history
**When** the user clicks on the history item
**Then** a detail page opens in a new tab
**And** displays the cropped screenshot on the left side
**And** displays the extracted text on the right side
**And** shows a Text/Markdown toggle switch
**And** shows an editable textarea with the extracted text

#### Scenario: User edits OCR text

**Given** the user is viewing a history item detail page
**When** the user edits the text in the textarea
**And** clicks "Save" button
**Then** the edited text is saved to history
**And** the history item is updated with the new text
**And** a success notification confirms the save

#### Scenario: User re-recognizes image

**Given** the user is viewing a history item detail page
**When** the user clicks "Re-OCR" button
**Then** the original image is sent to OCR again
**And** the new result replaces the previous text
**And** the history item is updated
**And** a notification shows the re-OCR status

#### Scenario: User toggles text display format

**Given** the user is viewing a history item detail page
**When** the user clicks "Markdown" tab
**Then** the text is rendered with Markdown formatting
**When** the user clicks "Text" tab
**Then** the text is shown as plain text

#### Scenario: User copies text from detail page

**Given** the user is viewing a history item detail page
**When** the user clicks the "Copy" button
**Then** the text is copied to system clipboard
**And** a notification confirms the copy


### Requirement: REQ-009 - Debug Page

The extension SHALL provide a debug page for developers to visualize crop coordinates and adjust them.

**Prerequisites**: History item with debug information exists (REQ-005 with debug field)

**Security Constraint**: Debug page should only be accessible through intentional user action (right-click or Shift+click), not through direct URL navigation.

#### Scenario: User opens debug page

**Given** a history item with debug information exists
**When** the user right-clicks on the history item
**Or** the user holds Shift and clicks on the history item
**Then** a debug page opens in a new tab
**And** displays the original full screenshot
**And** overlays a red box showing the crop selection area
**And** displays debug data in a formatted panel

#### Scenario: User views debug data

**Given** the debug page is open
**When** the user views the debug data section
**Then** the following information is displayed:
- Selection coordinates: {x, y, width, height}
- Original image size: {width, height}
- Device Pixel Ratio: <value>
- Zoom Level: <percentage>
- Original image URL (for reference)

#### Scenario: User adjusts coordinates

**Given** the debug page is open
**When** the user changes X, Y, Width, or Height values
**And** clicks "Apply" button
**Then** the crop box overlay updates in real-time
**And** the cropped preview updates to show the new selection
**When** the user clicks "Save to History" button
**Then** the history item is updated with new coordinates
**And** the cropped image is regenerated

#### Scenario: User compares original vs cropped

**Given** the debug page is open
**When** the user views the comparison section
**Then** the original screenshot is shown on the left
**And** the cropped result is shown on the right
**And** a red box on the original indicates the crop area

#### Scenario: Debug page opens without debug data

**Given** a history item exists without the debug field
**When** the user right-clicks or Shift+clicks on the history item
**Then** the debug page opens
**And** displays a helpful message: "Debug information not available for this item"
**And** shows instructions: "Enable Debug Mode in settings to save debug info for future captures"
**And** provides a button to "Open Settings" or "Re-capture with Debug Mode"


### Requirement: REQ-010 - History Data Structure Extension

The extension SHALL extend the HistoryItem data structure to optionally include debug information for coordinate troubleshooting.

**Storage Strategy**:
- Debug field is optional (backward compatible with existing history items)
- Original image URL is stored only when debug is enabled (user-controlled)
- Storage is per-user, isolated in chrome.storage.local
- No server-side storage (privacy-preserving)

**Configuration**:
- Debug mode defaults to DISABLED (opt-in for privacy)
- When enabled, original full screenshot is stored alongside cropped result
- Users can disable debug mode at any time
- Disabling debug mode stops storing new debug info, but doesn't delete existing data

#### Scenario: Debug mode disabled (default)

**Given** debug mode is disabled (default setting)
**When** an OCR operation completes
**Then** only the cropped image URL is saved
**And** the debug field is NOT stored
**And** storage usage is minimized

#### Scenario: User enables debug mode

**Given** debug mode is disabled
**When** the user enables "Save debug info" in settings
**Then** subsequent OCR operations save:
- Cropped image URL (imageUrl)
- Original full screenshot URL (originalImageUrl)
- Selection coordinates (selection)
- Original capture dimensions (originalSize)
- Device Pixel Ratio (devicePixelRatio)
- Zoom Level (zoomLevel)

#### Scenario: Storage limit management

**Given** debug mode is enabled
**When** the number of history items exceeds 100
**Then** the oldest items are automatically removed (FIFO)
**And** a notification informs the user about the cleanup
**When** storage quota is exceeded
**Then** an error message is shown
**And** the user is prompted to clear old history or disable debug mode

#### Scenario: User clears debug data

**Given** debug mode has been enabled with history items
**When** the user disables "Save debug info" in settings
**Then** new OCR operations no longer save debug info
**And** existing debug fields remain in history (not auto-deleted)
**When** the user clicks "Clear All Debug Data" button
**Then** all originalImageUrl and debug fields are removed from history
**And** storage space is freed up


### Requirement: REQ-011 - Extension Page Access Control

The extension SHALL validate history item access before displaying detail and debug page content.

**Access Control**:
- Detail page: accessible only when user explicitly clicks a history item (chrome.tabs.create)
- Debug page: accessible only through intentional user action (right-click or Shift+click)
- Both pages validate that the requested history item belongs to the user
- Invalid or missing data results in user-friendly error UI

#### Scenario: Valid detail page access

**Given** the user clicks on a history item
**When** chrome.tabs.create opens the detail page with a valid history ID
**Then** the detail page loads successfully
**And** retrieves the history item from chrome.storage.local
**And** validates the item exists before displaying content

#### Scenario: Invalid history ID access

**Given** someone tries to access detail page directly with an invalid ID
**When** the detail page loads
**Then** an error message is shown: "History item not found"
**And** a button takes the user back to the extension popup

#### Scenario: Debug page access control

**Given** the user right-clicks or Shift+clicks on a history item
**When** the debug page opens
**Then** it validates the user has permission to view this history item
**And** displays debug information only if validation passes

#### Scenario: No direct URL enumeration protection

**Given** an external script tries to enumerate extension pages
**When** it attempts to access chrome.runtime.getURL() paths directly
**Then** the pages validate history ID on load
**And** invalid IDs show error UI instead of content
**And** no directory listing is available


### Requirement: REQ-012 - Test Fix Prerequisites

The extension SHALL have all existing tests passing before implementing new features.

**Context**: This is a prerequisite requirement. Previous code fixes (v0.4.5-0.4.7) changed implementation details (createImageBitmap instead of new Image), but tests still assert old code. These tests must pass before implementing features in this change.

#### Scenario: All tests pass after fixes

**Given** Phase 0 test fixes are applied
**When** the developer runs `npm test -- --run`
**Then** all unit tests pass
**And** no test failures related to:
  - screenshot.test.ts asserting new Image()
  - context-menu.test.ts missing chrome.runtime.getURL mock
**And** the test suite is green before starting Phase 1
