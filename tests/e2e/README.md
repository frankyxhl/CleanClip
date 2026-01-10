# E2E Tests for CleanClip Extension

## Overview

Phase 9: BDD End-to-End Tests validate complete user flows using real Gemini API integration.

## Prerequisites

### 1. Gemini API Key

Get your API key from: https://makersuite.google.com/app/apikey

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Build Extension

```bash
npm run build
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/context-menu-flow.spec.ts
```

### Run with UI

```bash
npx playwright test --ui
```

### Debug Mode

```bash
npx playwright test --debug
```

## Test Structure

### BDD Scenarios

Tests follow Behavior-Driven Development (BDD) with Given-When-Then format:

```typescript
test('Right-click image → OCR → copy flow', async ({ page }) => {
  // Given: User is on a webpage with images
  // When: User right-clicks on an image
  // Then: OCR result is copied to clipboard
});
```

### Test Files

1. **context-menu-flow.spec.ts** - Right-click image OCR flow
2. **screenshot-flow.spec.ts** - Area screenshot OCR flow
3. **history-operations.spec.ts** - History panel operations
4. **error-scenarios.spec.ts** - Error handling (no API key, network errors)

## Limitations

### Chrome Extension Testing

E2E tests for Chrome Extensions have unique challenges:

1. **Extension Loading**: Extensions must be loaded unpacked via Chrome arguments
2. **Context Menus**: Cannot interact with native browser context menus directly
3. **Clipboard**: Access to system clipboard is restricted in test environments
4. **Background Scripts**: Testing service workers requires special handling

### Manual Testing Required

Due to these limitations, some tests serve as **integration test skeletons** that verify:

- Code structure and module integration
- API request/response format
- Data flow between components
- Error handling logic

**Full validation requires manual testing in Chrome browser.**

## Manual Testing Checklist

### 1. Context Menu OCR

- [ ] Right-click on image shows "CleanClip: Recognize Text"
- [ ] Clicking menu item triggers OCR
- [ ] Result is copied to clipboard
- [ ] Toast notification shows "Copied!"

### 2. Screenshot OCR

- [ ] Cmd+Shift+C shows overlay
- [ ] Can drag to select area
- [ ] Releasing mouse captures area
- [ ] OCR result is copied to clipboard

### 3. History Panel

- [ ] Opening popup shows history
- [ ] Clicking copy button copies text
- [ ] Clicking delete button removes item
- [ ] History persists across browser restarts

### 4. Error Scenarios

- [ ] Missing API key shows error message
- [ ] Network errors are handled gracefully
- [ ] CORS errors suggest using screenshot alternative

## CI/CD Considerations

For automated testing in CI/CD:

1. **API Key**: Use secret management (GitHub Secrets, GitLab CI variables)
2. **Extension Loading**: Use Playwright's extension loading capability
3. **Test Environment**: Use headless Chrome with extension loaded
4. **Test Data**: Use sample images stored in test fixtures

## References

- [Playwright Chrome Extension Testing](https://playwright.dev/docs/chrome-extensions)
- [Chrome Extension Testing Guide](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Gemini API Documentation](https://ai.google.dev/docs)
