# Delta Spec: Progress Notifications

## ADDED Requirements

### Requirement: REQ-003-010 - Screenshot Success Notification

The extension MUST display a notification after successfully capturing a screenshot.

**Priority**: High
**Risk**: Low

#### Scenario: Screenshot captured successfully

**Given** the user triggers the screenshot command
**When** `chrome.tabs.captureVisibleTab()` succeeds
**Then** a notification MUST be displayed
**And** the notification title MUST be "CleanClip"
**And** the notification message MUST contain "Screenshot captured! Sending to AI..."
**And** the notification icon MUST use `icon128.png`
**And** the notification type MUST be "basic"
**And** the notification priority MUST be 2

---

### Requirement: REQ-003-011 - OCR Completion Notification

The extension MUST display a notification after OCR completes and results are copied to clipboard.

**Priority**: High
**Risk**: Low

#### Scenario: OCR completes successfully

**Given** the screenshot was captured
**When** OCR processing completes
**And** text is written to clipboard
**Then** a notification MUST be displayed
**And** the notification message MUST contain "OCR complete! Result copied to clipboard"
**And** the user can verify the result is available

#### Scenario: Notification confirms clipboard operation

**Given** OCR processing completes
**When** the clipboard write succeeds
**Then** the notification MUST confirm the result is in clipboard
**And** the user knows they can paste the result

---

## MODIFIED Requirements

### Requirement: REQ-003-012 - Background Notification Flow

The background service worker MUST send notifications at key workflow stages.

**Previous**: Only error notifications were shown
**New**: Success notifications at screenshot and OCR completion stages

#### Scenario: Success notifications are sent

**Given** the screenshot workflow is triggered
**When** each stage completes successfully
**Then** `showSuccessNotification()` MUST be called
**And** a notification MUST be created after screenshot capture
**And** a notification MUST be created after clipboard write

#### Scenario: Notification helper function exists

**Given** the background service worker is loaded
**When** the code is inspected
**Then** `showSuccessNotification(message: string)` function MUST exist
**And** it MUST create Chrome notifications
**And** it MUST use the standard icon and priority settings

---

## Implementation Notes

**Files**:
- `src/background.ts` - Add notification calls
- `tests/background.test.ts` - Test notification creation

**Dependencies**:
- `chrome.notifications` API

**Risks**:
- Low: Chrome notifications API is stable
- Mitigation: Graceful handling if notifications API unavailable
