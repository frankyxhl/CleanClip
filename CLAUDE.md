# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CleanClip is a Chrome extension (Manifest V3) that provides OCR functionality: right-click any image or capture a screen area, extract text using Google Gemini API, and automatically copy to clipboard. Built with TypeScript, Vite, and CRXJS.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server with hot reload
npm run build        # TypeScript check + Vite production build

# Testing
npm test             # Run Vitest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with Vitest UI
npm run test:e2e     # Run Playwright E2E tests (requires GEMINI_API_KEY)

# Run a single test file
npx vitest tests/ocr.test.ts
npx vitest tests/background.test.ts --run
```

## Architecture

### Extension Components

**Background Service Worker** (`src/background.ts`)
- Registers context menu for image OCR
- Handles keyboard shortcut (Cmd+Shift+X) for area screenshot
- Coordinates tab capture, image cropping via OffscreenCanvas, and OCR pipeline
- Manages chrome.storage for API key and settings

**Content Script** (`src/content/overlay.ts`)
- Injected into all pages
- Provides crosshair overlay UI for area selection
- Sends selection coordinates to background script via chrome.runtime.sendMessage

**Offscreen Document** (`src/offscreen.ts`, `src/offscreen/clipboard.html`)
- MV3 workaround: service workers cannot access navigator.clipboard
- Uses storage polling pattern for background↔offscreen communication
- Background writes request to storage, offscreen polls and writes response

### Core Modules

| Module | Purpose |
|--------|---------|
| `src/ocr.ts` | Gemini API integration with retry logic (3 retries, 30s timeout) |
| `src/history.ts` | chrome.storage.local persistence for OCR results |
| `src/text-processing.ts` | Post-OCR cleanup: remove excess line breaks, merge spaces |
| `src/clipboard.ts` | Clipboard operations abstraction |
| `src/logger.ts` | Debug logging utility |

### UI Pages

- `src/popup/` - Extension popup showing OCR history
- `src/options/` - Settings page (API key, output format, text processing options)
- `src/detail/` - Detailed view of individual OCR results
- `src/debug/` - Debug information page

### Message Flow

```
User triggers OCR (context menu or Cmd+Shift+X)
    ↓
Background captures tab / fetches image
    ↓
Background calls Gemini API (ocr.ts)
    ↓
Background writes to offscreen storage
    ↓
Offscreen copies to clipboard
    ↓
Background saves to history (history.ts)
```

## Testing

Tests mirror source structure: `tests/background.test.ts` tests `src/background.ts`.

- Unit tests use Vitest with node environment
- `history.test.ts` uses happy-dom for DOM simulation
- E2E tests in `tests/e2e/` use Playwright with Chrome channel
- Test fixtures in `tests/fixtures/`

Chrome extension APIs are mocked in tests via global `chrome` object setup.

## Configuration Files

- `public/manifest.json` - Chrome extension manifest (imported by vite.config.ts)
- `vite.config.ts` - Uses @crxjs/vite-plugin for extension bundling
- `vitest.config.ts` - Excludes e2e and node_modules, maps happy-dom to specific tests
- `playwright.config.ts` - Single worker, sequential execution for extension testing
