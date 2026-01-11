# OpenSpec Tasks: 001-prototype

## Overview

- **Total Phases**: 20
- **Total Tasks**: 138
- **Methodology**: TDD (Red-Green-Refactor)
- **Status**: Phase 1-10 ✅ Complete | Phase 11-16: Runtime Fixes (Planned) | Phase 17-20: Test Cleanup ✅ Complete

---

## Phase 1: Project Skeleton

**Goal**: Set up Chrome Extension foundation and test framework

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 1.1 | Write test: manifest.json validation | Red | Test fails (file not found) | [x]
| 1.2 | Create Manifest V3 config | Green | Test passes | [x]
| 1.3 | Write test: Vite build succeeds | Red | Build fails | [x]
| 1.4 | Configure Vite + CRXJS + TypeScript | Green | Build passes | [x]
| 1.5 | Configure Vitest + Playwright | Green | Test framework runs | [x]
| 1.6 | Commit | - | "Phase 1: Project skeleton" | [x]

### Acceptance Criteria

- [x] `npm install` succeeds (using npm instead of pnpm)
- [x] `npm run build` generates dist directory
- [x] `npm test` can run (8/8 tests passing)
- [x] manifest.json conforms to V3 spec

---

## Phase 2: Settings Page

**Goal**: Implement API Key and output preferences configuration

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 2.1 | Write test: Options page renders | Red | Test fails | [x]
| 2.2 | Implement Options page UI | Green | Test passes | [x]
| 2.3 | Write test: API Key storage/retrieval | Red | Test fails | [x]
| 2.4 | Implement chrome.storage.local storage | Green | Test passes | [x]
| 2.5 | Write test: Output format selection | Red | Test fails | [x]
| 2.6 | Implement format selector (Text/Markdown) | Green | Test passes | [x]
| 2.7 | Write test: Text processing options | Red | Test fails | [x]
| 2.8 | Implement checkboxes (remove linebreaks, merge spaces) | Green | Test passes | [x]
| 2.9 | Add security warning for API Key | Green | Warning visible | [x]
| 2.10 | Commit | - | "Phase 2: Settings page" | [x]

### Acceptance Criteria

- [x] Options page opens
- [x] Can input and save API Key
- [x] Key persists after refresh
- [x] Invalid Key shows error
- [x] Can select output format (Text/Markdown)
- [x] Can toggle text processing options
- [x] Security warning displayed for API Key

---

## Phase 3: Context Menu (Right-click Image)

**Goal**: Implement right-click image → OCR trigger

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 3.1 | Write test: Context menu registration | Red | Test fails |
| 3.2 | Implement chrome.contextMenus setup | Green | Test passes |
| 3.3 | Write test: Menu appears on images only | Red | Test fails |
| 3.4 | Implement contexts: ["image"] filter | Green | Test passes |
| 3.5 | Write test: Click extracts image URL | Red | Test fails |
| 3.6 | Implement image URL extraction | Green | Test passes |
| 3.7 | Write test: Fetch image as base64 | Red | Test fails |
| 3.8 | Implement image fetch and conversion | Green | Test passes |
| 3.9 | Commit | - | "Phase 3: Context menu" |

### Acceptance Criteria

- [ ] Right-click on image shows "CleanClip: Recognize Text"
- [ ] Menu only appears on images
- [ ] Clicking fetches image data

---

## Phase 4: Area Screenshot

**Goal**: Implement `Cmd+Shift+C` area selection screenshot

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 4.1 | Write test: Shortcut registration | Red | Test fails |
| 4.2 | Implement commands config | Green | Test passes |
| 4.3 | Write test: Overlay UI displays | Red | Test fails |
| 4.4 | Implement screenshot overlay component | Green | Test passes |
| 4.5 | Write test: Area selection returns coordinates | Red | Test fails |
| 4.6 | Implement drag selection logic | Green | Test passes |
| 4.7 | Write test: Screenshot generates base64 | Red | Test fails |
| 4.8 | Implement captureVisibleTab + canvas crop | Green | Test passes |
| 4.9 | Commit | - | "Phase 4: Area screenshot" |

### Acceptance Criteria

- [ ] `Cmd+Shift+C` triggers screenshot mode
- [ ] Semi-transparent overlay appears
- [ ] Can drag to select area
- [ ] Selection returns base64 image
- [ ] Only captures visible tab area (documented limitation)

---

## Phase 5: OCR Module

**Goal**: Integrate Gemini 3 Flash for text recognition

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 5.1 | Write test: OCR function signature (Mock) | Red | Test fails |
| 5.2 | Implement OCR function skeleton | Green | Test passes |
| 5.3 | Write test: Plain text prompt construction | Red | Test fails |
| 5.4 | Implement plain text prompt | Green | Test passes |
| 5.5 | Write test: Markdown prompt construction | Red | Test fails |
| 5.6 | Implement Markdown prompt | Green | Test passes |
| 5.7 | Write test: API request format (Mock) | Red | Test fails |
| 5.8 | Implement Gemini API call | Green | Test passes |
| 5.9 | Write test: Error handling | Red | Test fails |
| 5.10 | Implement timeout/retry/error handling | Green | Test passes |
| 5.11 | Commit | - | "Phase 5: OCR module" |

### Acceptance Criteria

- [ ] `recognizeImage()` returns OCRResult
- [ ] Correctly constructs Gemini API request
- [ ] Supports plain text output prompt
- [ ] Supports Markdown output prompt
- [ ] Network errors have friendly message
- [ ] Timeout has retry mechanism

---

## Phase 6: Text Processing

**Goal**: Apply user-configured text transformations

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 6.1 | Write test: Remove extra line breaks | Red | Test fails |
| 6.2 | Implement removeLineBreaks() | Green | Test passes |
| 6.3 | Write test: Merge consecutive spaces | Red | Test fails |
| 6.4 | Implement mergeSpaces() | Green | Test passes |
| 6.5 | Write test: Apply processing based on settings | Red | Test fails |
| 6.6 | Implement processText() with options | Green | Test passes |
| 6.7 | Commit | - | "Phase 6: Text processing" |

### Acceptance Criteria

- [ ] Line breaks removed when option enabled
- [ ] Spaces merged when option enabled
- [ ] Processing respects user settings
- [ ] Markdown structure preserved when applicable

---

## Phase 7: History Panel

**Goal**: Persistent storage and display of OCR results

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 7.1 | Write test: History storage schema | Red | Test fails |
| 7.2 | Implement HistoryItem type and storage | Green | Test passes |
| 7.3 | Write test: Add item to history | Red | Test fails |
| 7.4 | Implement addToHistory() | Green | Test passes |
| 7.5 | Write test: History panel UI renders | Red | Test fails |
| 7.6 | Implement history panel component | Green | Test passes |
| 7.7 | Write test: Copy button works | Red | Test fails |
| 7.8 | Implement copy action | Green | Test passes |
| 7.9 | Write test: Delete button works | Red | Test fails |
| 7.10 | Implement delete action | Green | Test passes |
| 7.11 | Write test: History persists across sessions | Red | Test fails |
| 7.12 | Implement chrome.storage.local persistence | Green | Test passes |
| 7.13 | Commit | - | "Phase 7: History panel" |

### Acceptance Criteria

- [ ] Each OCR result saved with timestamp
- [ ] History panel shows all past results
- [ ] Each item has copy button
- [ ] Each item has delete button
- [ ] History persists after browser restart
- [ ] Panel accessible from extension popup

---

## Phase 8: Clipboard & Toast

**Goal**: Write to clipboard and show notification

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 8.1 | Write test: Clipboard write | Red | Test fails |
| 8.2 | Implement clipboard.writeText() | Green | Test passes |
| 8.3 | Write test: Fallback when clipboard fails | Red | Test fails |
| 8.4 | Implement fallback (popup with copy button) | Green | Test passes |
| 8.5 | Write test: Toast notification shows | Red | Test fails |
| 8.6 | Implement toast component | Green | Test passes |
| 8.7 | Commit | - | "Phase 8: Clipboard & toast" |

### Acceptance Criteria

- [ ] Result written to system clipboard
- [ ] Toast shows "Copied!" confirmation
- [ ] Fallback works when clipboard unavailable
- [ ] Uses offscreen document if needed for permissions

---

## Phase 9: BDD End-to-End Tests

**Goal**: Validate complete flow with real API

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 9.1 | Configure .env and Playwright | - | Environment ready |
| 9.2 | Write BDD: Right-click image → copy flow | Red | Test fails |
| 9.3 | Debug and pass BDD test | Green | Test passes |
| 9.4 | Write BDD: Screenshot → copy flow | Red | Test fails |
| 9.5 | Debug and pass BDD test | Green | Test passes |
| 9.6 | Write BDD: History panel operations | Red | Test fails |
| 9.7 | Debug and pass BDD test | Green | Test passes |
| 9.8 | Write BDD: Error scenario (no API Key) | Red | Test fails |
| 9.9 | Implement error prompt | Green | Test passes |
| 9.10 | Commit | - | "Phase 9: BDD tests" |

### Acceptance Criteria

- [ ] E2E tests use real Gemini API from .env
- [ ] Complete flow automated
- [ ] Error scenarios covered
- [ ] `npm run test:e2e` requires explicit `GEMINI_API_KEY`

---

## Phase 10: Release Preparation

**Goal**: Documentation and demo assets

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 10.1 | Write README (install/usage) | - | Doc complete |
| 10.2 | Record Demo GIF | - | GIF usable |
| 10.3 | Create .env.example | - | File exists |
| 10.4 | Create .gitignore (exclude .env) | - | File exists |
| 10.5 | Commit | - | "Phase 10: Release preparation" |

### Acceptance Criteria

- [ ] README has installation steps
- [ ] README has usage instructions
- [ ] Demo GIF shows core functionality
- [ ] .env.example has template
- [ ] .env is gitignored

---

## Execution Notes

### TDD Workflow (per feature)

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Optimize while keeping tests green

### Test Commands

```bash
npm test           # Run TDD unit tests (watch mode)
npm test -- --run  # Run tests once and exit (CI/one-shot)
npm run test:e2e   # Run BDD end-to-end tests (requires GEMINI_API_KEY)
```

### Environment Variables

```bash
# .env (gitignored)
GEMINI_API_KEY=your_key_here
```

### Gemini Prompts

```typescript
// Plain Text
const PROMPT_TEXT = `
Extract all text from this image.
Clean up: remove extra line breaks, merge spaces.
Output plain text only.
`

// Markdown
const PROMPT_MARKDOWN = `
Extract all text from this image.
Preserve structure as Markdown:
- Headings → # ## ###
- Lists → - or 1. 2. 3.
- Tables → | col | col |
Output valid Markdown.
`
```

---

## Phase 11: 补全 Manifest 和构建配置

**Goal**: 确保 popup/options HTML 正确构建到 dist/

**Why**: 当前 dist/ 只包含 JS 文件，缺少 HTML 页面，导致扩展无法加载 UI

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 11.1 | Write test: dist/ contains popup HTML | Red | Test fails | [x]
| 11.2 | Write test: dist/ contains options HTML | Red | Test fails | [x]
| 11.3 | Update manifest.json: add action/options_ui/icons | Green | Tests pass |
| 11.4 | Create placeholder icons (16/48/128) | Green | Icon files exist |
| 11.5 | Verify build output structure | Green | dist/ structure complete | [x] |
| 11.6 | Commit | - | "Phase 11: Manifest and build config" | [x] |

### Acceptance Criteria

- [x] `npm run build` generates dist/ with HTML files
- [x] Build tests verify popup.html and options.html are generated
- [x] Icon files (16/48/128) are built to dist/
- [ ] chrome://extensions/ can load the extension
- [ ] Clicking extension icon opens popup
- [ ] Right-click → Options opens settings page

---

## Phase 12: 修复 API Key Storage 不一致

**Goal**: 统一 storage key 为 'cleanclip-api-key'

**Why**: background.ts 读取 'cleanclip-api-key'，options/main.ts 保存 'apiKey'，导致配置无法生效

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 12.1 | Write test: options saves to 'cleanclip-api-key' | Red | Test fails |
| 12.2 | Modify options/main.ts to use unified key | Green | Tests pass |
| 12.3 | Update storage.test.ts | Green | Tests pass | [x]
| 12.4 | Manual verify: options setting → background readable | - | Verified | [x] |
| 12.5 | Commit | - | "Phase 12: Fix API Key storage" |

### Acceptance Criteria

- [x] API Key saved in options is readable by background
- [x] OCR function works after setting API Key
- [x] All storage tests pass (117/117 tests passing)

---

## Phase 13: 使用 Offscreen Document 实现 Clipboard

**Goal**: 在 service worker 中可用 clipboard API

**Why**: navigator.clipboard 在 service worker 中不可用，需要 offscreen document

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 13.1 | Write test: offscreen document creation | Red | Test fails |
| 13.2 | Create offscreen/clipboard.html | Green | Tests pass |
| 13.3 | Implement message passing mechanism | Green | Tests pass |
| 13.4 | Update manifest.json: add offscreen permission | Green | Permission configured |
| 13.5 | Modify background.ts to use offscreen clipboard | Green | Tests pass |
| 13.6 | Commit | - | "Phase 13: Offscreen clipboard" |

### Acceptance Criteria

- [ ] OCR result successfully written to clipboard
- [ ] Toast "Copied!" notification shows
- [ ] No clipboard API errors in console

---

## Phase 14: 配置 Content Script (Overlay)

**Goal**: overlay.ts 正确注入到网页

**Why**: overlay 脚本未在 manifest 中配置，只在 background 手动注入，不够可靠

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 14.1 | Write test: overlay script injected | Red | Test fails |
| 14.2 | Update manifest.json: add content_scripts | Green | Tests pass |
| 14.3 | Remove manual injection code from background.ts | Refactor | Code cleaned |
| 14.4 | Manual verify: Cmd+Shift+C shows overlay | - | Verified |
| 14.5 | Commit | - | "Phase 14: Content script config" | [x] |

### Acceptance Criteria

- [x] Cmd+Shift+C triggers overlay on any page
- [x] Overlay allows drag selection
- [x] Selection returns coordinates correctly
- [x] All 135 tests passing

---

## Phase 15: 连接 History Panel 到 Popup

**Goal**: 点击扩展图标显示 OCR 历史记录

**Why**: 当前 popup/main.ts 只有 console.log，未显示历史记录

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 15.1 | Write test: popup loads history | Red | Test fails | [x] |
| 15.2 | Modify popup/main.ts to call getHistory() | Green | Tests pass | [x] |
| 15.3 | Update popup/index.html: add container | Green | UI renders | [x] |
| 15.4 | Manual verify: clicking icon shows history | - | Verified | [x] |
| 15.5 | Commit | - | "Phase 15: History panel in popup" | [x] |

### Acceptance Criteria

- [x] Clicking extension icon shows OCR history
- [x] Each item has copy button
- [x] Each item has delete button
- [x] History persists across sessions

---

## Phase 16: 更新文档一致性

**Goal**: 文档描述与代码实现一致

**Why**: 代码已升级到 Gemini 3 Flash，文档需要同步更新；文档混用 npm/pnpm

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 16.1 | Unify Gemini version to "3 Flash" | - | Docs updated |
| 16.2 | Unify package manager to npm | - | Docs updated |
| 16.3 | Update README.md | - | Updated |
| 16.4 | Update LOCAL_TESTING_GUIDE.md | - | Updated |
| 16.5 | Commit | - | "Phase 16: Documentation consistency" |

### Acceptance Criteria

- [x] All docs mention "Gemini 3 Flash"
- [x] All docs use `npm` commands
- [x] No conflicting package manager references

---

## Runtime Fixes Summary

**Phases 11-16** address critical runtime issues discovered after Phase 1-10 completion:

| Priority | Phase | Issue | Impact |
|----------|-------|-------|--------|
| P0 | 11 | dist/ missing HTML files | Extension cannot load UI |
| P0 | 12 | API Key storage key mismatch | Configuration doesn't work |
| P1 | 13 | Clipboard API unavailable in SW | Copy fails |
| P1 | 14 | Overlay content script not configured | Screenshot doesn't work |
| P2 | 15 | History panel not connected to popup | UX incomplete |
| P2 | 16 | Documentation inconsistencies | Non-blocking |

**Execution Order**: P0 → P1 → P2

**Total** (as of Phase 11-16): 6 new phases, 33 new tasks
**Grand Total** (as of Phase 11-16): 16 phases, 119 tasks

---

## Phase 17: 添加 Logger 模块

**Goal**: 创建环境变量控制的日志模块

**Why**: 测试输出有大量 console.log 噪音，需要环境变量控制；生产环境应静默，开发时可开启

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 17.1 | Write test: logger module exists | Red | Test fails | ✅ |
| 17.2 | Create src/logger.ts with DEBUG gate | Green | Tests pass | ✅ |
| 17.3 | Write test: logger respects VITE_CLEANCLIP_DEBUG | Red | Test fails | ✅ |
| 17.4 | Implement environment variable check | Green | Tests pass | ✅ |
| 17.5 | Commit | - | "Phase 17: Logger module" | ✅ |

### Acceptance Criteria

- [x] `src/logger.ts` module exists
- [x] log.debug() only outputs when `VITE_CLEANCLIP_DEBUG=true`
- [x] logger.info() only outputs when `VITE_CLEANCLIP_DEBUG=true`
- [x] console.error remains unchanged (always visible)
- [x] Tests pass (114/114)

---

## Phase 18: 测试代码移除 Console 断言

**Goal**: 测试断言行为而非 console 输出

**Why**: 当前测试断言 console.log 文案，不够健壮；应断言实际行为（fetch 调用、notification 创建等）

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 18.1 | Rewrite: context-menu test - remove console assertions | Refactor | Tests pass | ✅ |
| 18.2 | Add: fetch mock in beforeEach | Green | No real network calls | ✅ |
| 18.3 | Add: chrome.notifications mock | Green | No fallback to console.error | ✅ |
| 18.4 | Rewrite: assertions check behavior (fetch called, etc.) | Green | Tests pass | ✅ |
| 18.5 | Commit | - | "Phase 18: Remove console assertions" | ✅ |

### Acceptance Criteria

- [x] No test asserts console.log content
- [x] Tests assert fetch/chrome APIs are called
- [x] chrome.notifications mock prevents fallback to console.error
- [x] All tests pass (114/114)

---

## Phase 19: 测试代码定点静音

**Goal**: 针对故意触发错误的测试用例

**Why**: history test 中有故意触发 clipboard error 的用例，会产生预期 stderr；需要定点静音

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 19.1 | Add: scoped console.error mock in history test | Green | Test passes without stderr | ✅ |
| 19.2 | Verify: real errors still visible | - | Manual check | ✅ |
| 19.3 | Commit | - | "Phase 19: Scoped console suppression" | ✅ |

### Acceptance Criteria

- [x] clipboard error test produces no stderr
- [x] console.error not globally mocked
- [x] Real errors in other tests still visible

---

## Phase 20: 生产代码替换 Console 为 Logger

**Goal**: 所有 console.log 替换为 logger.debug

**Why**: 统一使用 logger 模块，生产环境静默，开发时可开启调试

| # | Task | Type | Definition of Done | Status |
|---|------|------|-------------------|--------|
| 20.1 | Replace: src/background.ts console.log → log.debug | Green | Code updated | ✅ |
| 20.2 | Replace: src/popup/main.ts console.log → log.debug | Green | Code updated | ✅ |
| 20.3 | Replace: src/options/main.ts console.log → log.debug | Green | Code updated | ✅ |
| 20.4 | Keep: console.error unchanged (always visible) | - | Verified | ✅ |
| 20.5 | Run tests: verify all pass | - | Tests pass | ✅ |
| 20.6 | Commit | - | "Phase 20: Replace console with logger" | ✅ |

### Acceptance Criteria

- [x] All `console.log('CleanClip: ...')` replaced with `logger.debug(...)`
- [x] `console.error` statements remain unchanged (always visible)
- [x] All tests pass (114/114)
- [x] CI logs are clean (no expected stderr)

---

## Test Cleanup Summary

**Phases 17-20** address test output noise and improve CI log readability:

| Priority | Phase | Issue | Impact |
|----------|-------|-------|--------|
| P1 | 17 | No logger gate | All logs always output |
| P1 | 18 | Tests assert console content | Brittle, noisy |
| P1 | 19 | Expected error test produces stderr | CI log noise |
| P1 | 20 | Production code uses console.log | No control over output |

**Execution Order**: 17 → 18 → 19 → 20

**Total**: 4 new phases, 19 new tasks
**Grand Total**: 20 phases, 138 tasks
