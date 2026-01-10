# CleanClip Capability Spec

## ADDED Requirements

### Requirement: REQ-001 - Right-click Image OCR

The extension SHALL provide a context menu item on images to trigger OCR recognition.

#### Scenario: User right-clicks on a web image

**Given** the user is on a webpage with images
**When** the user right-clicks on an image
**Then** a context menu item "CleanClip: Recognize Text" appears

#### Scenario: User triggers OCR from context menu

**Given** the context menu is showing on an image
**When** the user clicks "CleanClip: Recognize Text"
**Then** the image is fetched and sent to OCR
**And** the result is copied to clipboard
**And** a toast notification shows "Copied!"

#### Scenario: Image fetch fails due to CORS or permissions

**Given** the user clicks "CleanClip: Recognize Text" on an image
**When** the image cannot be fetched (CORS, permissions, or network error)
**Then** an error message explains the issue
**And** suggests using area screenshot (Cmd+Shift+C) as alternative


### Requirement: REQ-002 - Area Screenshot OCR

The extension SHALL allow users to capture a selected area of the visible tab and perform OCR.

#### Scenario: User triggers screenshot mode

**Given** the user is on any webpage
**When** the user presses `Cmd+Shift+C`
**Then** a semi-transparent overlay appears over the page
**And** the cursor changes to crosshair

#### Scenario: User selects an area

**Given** the screenshot overlay is visible
**When** the user clicks and drags to select an area
**Then** the selected area is highlighted
**And** releasing the mouse captures the area

#### Scenario: Screenshot is processed

**Given** the user has selected an area
**When** the mouse is released
**Then** the selected area is captured as an image
**And** the image is sent to OCR
**And** the result is copied to clipboard
**And** a toast notification shows "Copied!"


### Requirement: REQ-003 - Output Format Configuration

The extension SHALL allow users to choose between Plain Text and Markdown output formats.

#### Scenario: User configures output format

**Given** the user opens the extension options page
**When** the user selects "Markdown" as output format
**And** saves the settings
**Then** subsequent OCR results are formatted as Markdown

#### Scenario: Plain text is default

**Given** the user has not configured any settings
**When** an OCR operation completes
**Then** the output is plain text with cleaned formatting


### Requirement: REQ-004 - Text Processing Options

The extension SHALL provide configurable text processing options.

#### Scenario: Remove line breaks option

**Given** the user has enabled "Remove extra line breaks" in settings
**When** an OCR operation completes
**Then** consecutive line breaks are merged into single line breaks

#### Scenario: Merge spaces option

**Given** the user has enabled "Merge consecutive spaces" in settings
**When** an OCR operation completes
**Then** multiple spaces are merged into single spaces


### Requirement: REQ-005 - History Panel

The extension SHALL maintain a history of OCR results with persistent storage.

#### Scenario: OCR result saved to history

**Given** an OCR operation has completed
**When** the result is copied to clipboard
**Then** the result is also saved to history with timestamp

#### Scenario: User views history

**Given** the user has performed OCR operations previously
**When** the user opens the extension popup
**Then** a history panel shows all past results
**And** each result displays timestamp and preview

#### Scenario: User copies from history

**Given** the history panel is showing past results
**When** the user clicks "Copy" on a history item
**Then** that result is copied to clipboard
**And** a toast notification confirms the copy

#### Scenario: User deletes history item

**Given** the history panel is showing past results
**When** the user clicks "Delete" on a history item
**Then** that item is removed from history
**And** the item no longer appears in the panel

#### Scenario: History persists across sessions

**Given** the user has OCR results in history
**When** the user closes and reopens the browser
**Then** the history items are still present


### Requirement: REQ-006 - API Key Configuration (Prototype)

The extension SHALL require and store an API key locally for the OCR service. Note: For this prototype, keys are stored in chrome.storage.local which is not encrypted.

#### Scenario: User configures API key

**Given** the user opens the extension options page
**When** the user enters a valid Gemini API key
**And** clicks save
**Then** the key is stored in chrome.storage.local
**And** a success message is shown

#### Scenario: Missing API key error

**Given** no API key is configured
**When** the user attempts an OCR operation
**Then** an error message is shown
**And** the user is prompted to configure the API key

#### Scenario: Security warning displayed

**Given** the user opens the extension options page
**When** the API key input is visible
**Then** a warning message explains that keys are stored locally (unencrypted)
**And** advises using a separate API key with usage limits for this extension


### Requirement: REQ-007 - Error Handling and Fallback

The extension SHALL handle errors gracefully with user-friendly feedback.

#### Scenario: Network error during OCR

**Given** an OCR operation is in progress
**When** a network error occurs
**Then** a user-friendly error message is shown
**And** the user can retry the operation

#### Scenario: Clipboard write fails

**Given** an OCR operation has completed
**When** writing to clipboard fails (permission denied)
**Then** a fallback popup appears with the result
**And** the user can manually copy the text

#### Scenario: OCR timeout

**Given** an OCR operation is in progress
**When** the operation takes longer than 30 seconds
**Then** the operation is cancelled
**And** an error message offers retry option
