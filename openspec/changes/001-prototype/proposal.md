# OpenSpec Proposal: 001-prototype

## Summary

Build CleanClip Chrome Extension MVP: Screenshot/Image → OCR → Smart Paste with history panel.

---

## Why

In the AI era, users acquire information visually (screenshots, PDFs, images), but pasting into work contexts (email, notes, docs) still relies on primitive copy-paste. CleanClip upgrades "screenshot copy" to "smart paste", validating this core product hypothesis.

---

## What Changes

- New Chrome Extension project (Manifest V3 + TypeScript + Vite)
- Right-click context menu for image OCR
- Area screenshot via `Cmd+Shift+C`
- Gemini 3 Flash OCR integration
- Output formats: Plain Text (default) + Markdown (configurable)
- Text processing options (remove line breaks, merge spaces)
- History panel with persistent storage
- Settings page (API Key + output preferences)

---

## Impact

- **Affected Code**: New project, no existing code
- **Affected Specs**: `docs/PRD.md`, `docs/IMPLEMENTATION.md`
- **Breaking Change**: No (new project)
- **Backward Compatible**: N/A

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Gemini API latency | Medium | Loading state + timeout handling |
| OCR accuracy insufficient | Medium | Show original image as fallback |
| Area screenshot MV3 limitation | Medium | Only supports visible tab area, document clearly |
| clipboard.writeText() permission | Medium | Use offscreen document or fallback to popup copy button |
| API Key in storage.local insecure | Low | Acceptable for prototype, add warning in UI |
| Chrome Extension review | Low | Local testing first, defer publishing |

---

## Rollback Strategy

- New project, rollback = delete code
- `git reset --hard HEAD~N` to revert to any phase

---

## Acceptance Criteria

- [ ] Right-click image → OCR → result copied to clipboard
- [ ] `Cmd+Shift+C` → area select → OCR → result copied
- [ ] OCR results saved to history panel
- [ ] History panel shows all past results with copy/delete actions
- [ ] Settings page allows API Key configuration
- [ ] Settings page allows output format selection (Text/Markdown)
- [ ] Settings page allows text processing options
- [ ] TDD unit tests pass
- [ ] BDD end-to-end tests pass

---

## Technical Decisions

### Stack

| Category | Choice | Reason |
|----------|--------|--------|
| Extension | Manifest V3 | Chrome latest standard |
| Language | TypeScript | Type safety |
| Build | Vite + CRXJS | Good DX, HMR support |
| OCR API | Gemini 3 Flash | Best price ($0.001/image) |
| Testing | Vitest + Playwright | TDD Mock + BDD E2E |
| Package Manager | pnpm | Fast, disk efficient |

### User Configuration

- **Shortcut**: `Cmd+Shift+C` (C = CleanClip)
- **Default Output**: Plain Text with line break removal
- **Optional Output**: Markdown (preserves structure)

### Scope Boundaries

**Included in 001-prototype:**
- Right-click image OCR (with CORS fallback to screenshot)
- Area screenshot OCR (visible tab only, no cross-window/desktop)
- Output formats: Plain Text + Markdown
- Text processing options (remove linebreaks, merge spaces)
- History panel with persistent storage
- Settings page (API Key + preferences)
- Error handling with user-friendly fallbacks

**Explicitly NOT in 001-prototype (future changes):**
- Site-specific paste optimization (Gmail/Notion/Sheets → 002+)
- HTML/TSV output formats
- Desktop-level screenshot
- Team/enterprise features
- Chrome Web Store publishing

---

## References

- PRD: `docs/PRD.md`
- Implementation Checklist: `docs/IMPLEMENTATION.md`
