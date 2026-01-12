# Delta Spec: Markdown Preview Fixes

## ADDED Requirements

### Requirement: REQ-003-030 - Markdown List Support

The markdown parser MUST support unordered and ordered lists.

**Priority**: High
**Risk**: Low

#### Scenario: Unordered list parsing

**Given** markdown text with `- item` syntax
**When** the text is parsed
**Then** each `- item` MUST be converted to `<li>item</li>`
**And** consecutive `<li>` MUST be wrapped in `<ul>...</ul>`
**And** no duplicate `<ul>` tags MUST exist

#### Scenario: Multiple list items

**Given** markdown text with multiple `- item` lines
**When** the text is parsed
**Then** all items MUST be wrapped in a single `<ul>`
**And** each item MUST be a `<li>` element

#### Scenario: Ordered list parsing

**Given** markdown text with `1. item` syntax
**When** the text is parsed
**Then** each numbered item MUST be converted to `<li>item</li>`
**And** consecutive items MUST be wrapped in `<ol>...</ol>`

---

### Requirement: REQ-003-031 - Markdown Link Support

The markdown parser MUST support links with `[text](url)` syntax.

**Priority**: High
**Risk**: Medium (Security)

#### Scenario: Link parsing with security attributes

**Given** markdown text with `[text](url)` syntax
**When** the text is parsed
**Then** it MUST be converted to `<a href="url" target="_blank" rel="noopener noreferrer">text</a>`
**And** all external links MUST include `rel="noopener noreferrer"`
**And** all external links MUST include `target="_blank"`

#### Scenario: javascript: links are filtered

**Given** markdown text with malicious link `[click](javascript:alert(1))`
**When** the text is parsed
**Then** the link MUST NOT be rendered as HTML
**And** the text MUST be displayed as plain text
**And** NO javascript: URL MUST be present in output

#### Scenario: Other dangerous protocols are filtered

**Given** markdown text with dangerous protocols like `data:`, `vbscript:`, `file:`
**When** the text is parsed
**Then** these links MUST NOT be rendered as clickable
**And** they MUST be displayed as plain text

#### Scenario: Safe links are rendered

**Given** markdown text with `[Google](https://google.com)`
**When** the text is parsed
**Then** a proper `<a>` tag MUST be created
**And** the href MUST be `https://google.com`
**And** the link text MUST be "Google"
**And** rel="noopener noreferrer" MUST be present
**And** target="_blank" MUST be present

---

### Requirement: REQ-003-032 - Code Block Line Breaks

The markdown parser MUST NOT convert line breaks inside code blocks to `<br>`.

**Priority**: High
**Risk**: Low

#### Scenario: Code block with multiple lines

**Given** markdown text with ` ``` ` code block containing newlines
**When** the text is parsed
**Then** newlines inside the code block MUST be preserved
**And** MUST NOT be converted to `<br>` tags
**And** whitespace MUST be preserved

#### Scenario: Code block content remains intact

**Given** markdown text with:
```
```
const x = 1;
const y = 2;
```
```
**When** the text is parsed
**Then** the output MUST contain `<pre><code>`
**And** the code content MUST NOT contain `<br>` tags
**And** the newlines MUST be preserved as `\n` or whitespace

---

### Requirement: REQ-003-033 - Blockquote Support

The markdown parser MUST support blockquotes with `> quote` syntax.

**Priority**: Medium
**Risk**: Low

#### Scenario: Blockquote parsing

**Given** markdown text with `> quote` syntax
**When** the text is parsed
**Then** it MUST be converted to `<blockquote>quote</blockquote>`
**And** the quote content MUST be preserved

#### Scenario: Multiple blockquote lines

**Given** markdown text with multiple `>` lines
**When** the text is parsed
**Then** each line MUST be wrapped in `<blockquote>` tags

---

### Requirement: REQ-003-034 - Horizontal Rule Support

The markdown parser MUST support horizontal rules with `---` syntax.

**Priority**: Medium
**Risk**: Low

#### Scenario: Horizontal rule parsing

**Given** markdown text with `---` on its own line
**When** the text is parsed
**Then** it MUST be converted to `<hr>`
**And** the hr tag MUST be self-closing or properly closed

#### Scenario: Alternative horizontal rule syntax

**Given** markdown text with `***` on its own line
**When** the text is parsed
**Then** it MAY be converted to `<hr>` (optional support)

---

### Requirement: REQ-003-035 - XSS Prevention

The markdown parser MUST escape HTML to prevent XSS attacks. This is a CRITICAL security requirement.

**Priority**: Critical
**Risk**: Critical

#### Scenario: HTML tags are escaped

**Given** OCR text contains malicious HTML like `<script>alert('XSS')</script>`
**When** the text is parsed as markdown
**Then** the HTML MUST be escaped
**And** MUST NOT be rendered as actual HTML
**And** MUST be displayed as plain text
**And** `<` MUST become `&lt;`
**And** `>` MUST become `&gt;`

#### Scenario: Image tag with onerror is escaped

**Given** markdown text with `<img src=x onerror=alert(1)>`
**When** the text is parsed
**Then** the entire img tag MUST be escaped
**And** the output MUST be `&lt;img src=x onerror=alert(1)&gt;`
**And** the onerror handler MUST NOT execute
**And** the img tag MUST NOT be rendered

#### Scenario: All angle brackets are escaped

**Given** any text containing `<` or `>` characters
**When** the text is parsed
**Then** `<` MUST be converted to `&lt;`
**And** `>` MUST be converted to `&gt;`
**And** `&` MUST be converted to `&amp;`
**And** `"` MUST be converted to `&quot;`
**And** `'` MUST be converted to `&#039;`

#### Scenario: Event handler attributes are blocked

**Given** markdown text with `![x](x "onmouseover=alert(1)")`
**When** the text is parsed
**Then** the event handler MUST NOT be rendered
**And** the image MUST NOT have the onmouseover attribute
**And** all on* attributes MUST be stripped
**And** javascript: URLs MUST be removed

#### Scenario: data: URL links are blocked

**Given** markdown text with malicious link `[click](data:text/html,<script>alert(1)</script>)`
**When** the text is parsed
**Then** the link MUST NOT be rendered as clickable
**And** MUST be displayed as plain text
**And** the data: URL MUST NOT appear in href attribute

#### Scenario: HTML escaping happens before markdown processing

**Given** markdown text with any content
**When** the text is parsed
**Then** HTML escaping MUST be the FIRST step
**And** markdown processing happens AFTER escaping
**And** only recognized markdown syntax produces HTML
**And** all angle brackets MUST be escaped

---

## MODIFIED Requirements

### Requirement: REQ-003-036 - Markdown Parser Function

The `simpleMarkdownParse()` function MUST support additional syntax and prevent XSS.

**Previous**: Limited support (headers, bold, italic, code), no XSS protection
**New**: Full support (lists, links, quotes, hr), XSS safe

#### Scenario: Function is exported for testing

**Given** the detail page module is loaded
**When** the module is inspected
**Then** `simpleMarkdownParse()` MUST be exported
**And** it MUST be accessible to tests

#### Scenario: HTML escaping is first step

**Given** `simpleMarkdownParse()` is called with any input
**When** the function executes
**Then** HTML escaping MUST happen first
**And** code blocks MUST be protected from processing
**And** links MUST include security attributes
**And** only then markdown syntax is processed

---

## Implementation Notes

**Files**:
- `src/detail/main.ts` - Rewrite `simpleMarkdownParse()`
- `tests/detail.test.ts` - Add XSS tests

**Security Implementation**:

```typescript
// CRITICAL: Escape HTML FIRST, before any markdown processing
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Parse flow:
// 1. Escape all HTML (CRITICAL - prevents XSS)
// 2. Protect code blocks from processing
// 3. Process markdown syntax
// 4. Restore code blocks
// 5. Sanitize links (add rel, remove javascript:)
```

**Dependencies**:
- None (vanilla JS implementation)

**Risks**:
- **Critical**: XSS vulnerabilities if HTML not properly escaped
- **Critical**: Link injection if javascript: URLs allowed
- Mitigation: Comprehensive test suite for XSS vectors

**XSS Test Vectors** (MUST all pass):
- `<script>alert('XSS')</script>` → escaped as `&lt;script&gt;...`
- `<img src=x onerror=alert(1)>` → escaped as `&lt;img...&gt;`
- `[click](javascript:alert(1))` → rendered as plain text, not a link
- `![x](x "onmouseover=alert(1)")` → event handler removed
- `<a href="data:text/html,<script>alert(1)</script>")` → escaped
- All external links → MUST have `rel="noopener noreferrer"`
