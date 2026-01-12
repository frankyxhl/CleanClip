# Delta Spec: History Navigation Sidebar

## ADDED Requirements

### Requirement: REQ-003-020 - History Navigation Sidebar

The detail page MUST display a 180px sidebar showing all history items.

**Priority**: High
**Risk**: Medium

#### Scenario: Detail page loads with history

**Given** the detail page is opened
**When** the page finishes loading
**Then** a 180px sidebar MUST be displayed on the left
**And** all history items MUST be listed
**And** each item MUST show timestamp and text preview

#### Scenario: Sidebar styling is correct

**Given** the detail page is loaded
**When** the sidebar is inspected
**Then** the width MUST be 180px
**And** the background color MUST be #f5f5f5
**And** a border MUST exist on the right side
**And** the sidebar MUST be scrollable when items overflow

---

### Requirement: REQ-003-021 - History Item Display Format

Each history item MUST display formatted time and text preview.

**Priority**: High
**Risk**: Low

#### Scenario: History item rendering with time

**Given** a history item with timestamp and text
**When** the item is rendered in the sidebar
**Then** the time MUST be formatted relative to now
**And** "Just now" for items less than 1 minute old
**And** "Xm ago" for items less than 1 hour old
**And** "Xh ago" for items less than 24 hours old
**And** the date for items older than 24 hours

#### Scenario: History item text preview truncation

**Given** a history item with long text
**When** the item is rendered in the sidebar
**Then** the text preview MUST be truncated to 2 lines
**And** overflow MUST be indicated with ellipsis
**And** the preview MUST use -webkit-line-clamp: 2

---

### Requirement: REQ-003-022 - Current Item Highlight

The currently displayed history item MUST be visually highlighted.

**Priority**: High
**Risk**: Low

#### Scenario: Current item display with highlight

**Given** the detail page is showing history item with ID "abc123"
**When** the sidebar is rendered
**Then** the item with ID "abc123" MUST have background color #007AFF
**And** the text color MUST be white
**And** the item MUST have class "active"
**And** the highlight MUST match URL ?id= parameter

#### Scenario: Active state updates on item change

**Given** the user clicks on a different history item
**When** the content updates
**Then** the previous active item MUST lose the highlight
**And** the new item MUST gain the highlight
**And** only one item MUST be active at a time

---

### Requirement: REQ-003-023 - Dynamic Content Switching

Clicking a history item MUST update the detail page content without reloading.

**Priority**: High
**Risk**: Medium

#### Scenario: User clicks different history item

**Given** the detail page is showing history item "item-1"
**When** the user clicks on history item "item-2"
**Then** the URL MUST update to ?id=item-2
**And** the page MUST NOT reload
**And** the screenshot MUST update to item-2's image
**And** the text MUST update to item-2's text
**And** the highlight MUST move to item-2

#### Scenario: Browser history is preserved

**Given** the user navigates between history items
**When** the user clicks browser back button
**Then** the previous item MUST be displayed
**And** the content MUST update correctly
**And** the page MUST NOT reload

#### Scenario: pushState is used for navigation

**Given** a history item is clicked
**When** the URL is updated
**Then** history.pushState() MUST be called
**And** the URL search parameter "id" MUST be set
**And** the browser history stack MUST be preserved

---

## MODIFIED Requirements

### Requirement: REQ-003-024 - Detail Page Layout

The detail page MUST use a three-column layout.

**Previous**: Two-column layout (screenshot left, text right)
**New**: Three-column layout (navigation left, text center, screenshot right)

#### Scenario: Three-column layout renders correctly

**Given** the detail page is loaded
**When** the layout is inspected
**Then** the left column MUST be 180px wide (history navigation)
**And** the center column MUST have flex: 1 (text + buttons)
**And** the right column MUST have flex: 1 (screenshot image)
**And** all columns MUST use flexbox layout

#### Scenario: Layout is responsive

**Given** the detail page is loaded
**When** the window is resized
**Then** the columns MUST maintain their proportions
**And** the navigation sidebar MUST remain 180px
**And** the center and right columns MUST share remaining space

---

## Implementation Notes

**Files**:
- `src/detail/index.html` - Three-column HTML structure
- `src/detail/main.ts` - Navigation rendering and dynamic loading
- `tests/detail.test.ts` - Navigation tests

**Dependencies**:
- `chrome.storage.local` for history data
- `history.pushState()` for URL updates

**Risks**:
- Medium: Large history may impact performance
- Mitigation: Consider virtual scrolling if > 100 items
- Low: pushState compatibility (IE11 not supported, acceptable for extension)

---

## Performance Considerations

**Potential Issue**: Large history lists (100+ items)

**Mitigation Strategies**:
1. Lazy rendering of history items
2. Virtual scrolling (if needed)
3. Limit display to 50 most recent items
4. Add pagination or "Load more" button

**Decision**: Implement basic rendering first, add optimization if tests show performance issues.
