# Delta Spec: Detail Copy Button

## ADDED Requirements

### Requirement: REQ-003-001 - Copy Button Functionality

The detail page MUST provide a Copy button that copies the current OCR text to the clipboard.

**Priority**: High
**Risk**: Low

#### Scenario: User clicks Copy button

**Given** the detail page is displayed with OCR text
**When** the user clicks the Copy button
**Then** the text MUST be copied to the system clipboard
**And** a success notification "Text copied to clipboard" MUST be displayed

#### Scenario: Copy button handles clipboard errors

**Given** the detail page is displayed
**When** the user clicks the Copy button
**And** clipboard access is denied
**Then** an error notification "Failed to copy text" MUST be displayed
**And** no exception MUST be thrown

---

### Requirement: REQ-003-002 - Copy Button Security

The Copy button MUST handle clipboard errors gracefully.

**Priority**: Medium
**Risk**: Low

#### Scenario: Clipboard access denied

**Given** the detail page is displayed
**When** the user clicks the Copy button
**And** clipboard access is denied
**Then** an error notification "Failed to copy text" MUST be displayed
**And** no exception MUST be thrown
**And** error is logged to console

---

## MODIFIED Requirements

### Requirement: REQ-003-003 - Detail Page Action Buttons

The detail page action buttons section MUST include the Copy button.

**Previous**: Only Re-OCR and Save buttons were present
**New**: Copy, Re-OCR, and Save buttons are present

#### Scenario: Copy button exists in DOM

**Given** the detail page HTML is loaded
**When** the DOM is queried for action buttons
**Then** `<button data-copy-button>Copy</button>` MUST exist
**And** `setupCopyButton()` MUST be called in `init()`

---

## Implementation Notes

**Files**:
- `src/detail/main.ts` - Add `setupCopyButton()` function
- `src/detail/index.html` - Copy button already exists

**Dependencies**:
- `navigator.clipboard` API (modern browsers)

**Risks**:
- Low: Clipboard API widely supported
- Mitigation: Error notification on failure
