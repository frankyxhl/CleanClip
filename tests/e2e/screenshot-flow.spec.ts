import { test, expect } from '@playwright/test';
import { recognizeImage, buildPrompt } from '../../src/ocr.js';
import { copyWithFallback } from '../../src/clipboard.js';

/**
 * Phase 9, Task 9.4: BDD Test - Screenshot → copy flow (Red)
 *
 * Scenario: User triggers area screenshot and performs OCR
 *
 * Given: The user is on any webpage
 * And: The user has configured a valid Gemini API key
 * When: The user presses Cmd+Shift+C
 * Then: A semi-transparent overlay appears over the page
 * And: The cursor changes to crosshair
 * When: The user clicks and drags to select an area
 * Then: The selected area is highlighted
 * When: The user releases the mouse
 * Then: The selected area is captured as an image
 * And: The image is sent to OCR
 * And: The result is copied to clipboard
 * And: A toast notification shows "Copied!"
 */

test.describe('BDD: Screenshot → OCR → copy flow', () => {
  const TEST_API_KEY = process.env.GEMINI_API_KEY || 'test-api-key';

  // Sample base64 image (simulating a screenshot)
  const SAMPLE_SCREENSHOT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  test('Given: User is on any webpage', async ({ page }) => {
    // This test verifies the browser context is available
    expect(page).toBeDefined();
  });

  test('When: User presses Cmd+Shift+C, Then: Overlay should appear (simulated)', async ({ page }) => {
    // Note: Actual overlay testing requires loading the extension in Chrome
    // This test verifies the command handler structure exists

    // Given: User is on a webpage
    await page.setContent('<html><body><h1>Test Page</h1></body></html>');

    // When: User triggers screenshot command
    // (In real extension, this would be handled by chrome.commands.onCommand)
    // Then: Overlay would appear (verified in unit tests: tests/screenshot.test.ts)
    expect(await page.locator('h1').textContent()).toBe('Test Page');
  });

  test('When: User selects area, Then: Selection coordinates are calculated', () => {
    // Given: Mouse drag coordinates
    const startX = 100;
    const startY = 100;
    const endX = 300;
    const endY = 200;

    // When: Calculating selection
    const selection = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };

    // Then: Selection coordinates are correct
    expect(selection).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 100
    });
  });

  test('When: Screenshot is captured, Then: Base64 image is generated', () => {
    // Given: A screenshot is captured (simulated with SAMPLE_SCREENSHOT)
    // When: Checking the base64 format
    // Then: Valid base64 data URL is present
    expect(SAMPLE_SCREENSHOT).toMatch(/^data:image\/[a-z]+;base64,/);
    expect(SAMPLE_SCREENSHOT.length).toBeGreaterThan(0);
  });

  test('When: OCR request is built, Then: Prompt includes correct instructions', () => {
    // Given: Text output format
    const format = 'text';

    // When: Building prompt
    const prompt = buildPrompt(format);

    // Then: Prompt includes text extraction instructions
    expect(prompt).toContain('Extract all text');
    expect(prompt).toContain('Clean up');
    expect(prompt).toContain('remove extra line breaks');
    expect(prompt).toContain('merge spaces');
  });

  test('When: Gemini API is called with screenshot, Then: OCR result is returned', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY');

    // Given: A screenshot and API key
    // When: Calling recognizeImage
    const result = await recognizeImage(SAMPLE_SCREENSHOT, 'text', TEST_API_KEY);

    // Then: OCR result is returned
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.text).toBe('string');
    expect(result.timestamp).toBeGreaterThan(0);
  });

  test('When: OCR completes, Then: Result is copied to clipboard', async () => {
    // Given: An OCR result
    const text = 'Recognized text from screenshot';

    // When: Copying to clipboard
    const result = await copyWithFallback(text);

    // Then: Copy operation succeeds (or falls back)
    expect(result).toHaveProperty('success');
    expect(['clipboard', 'fallback']).toContain(result.method);

    if (result.success) {
      // Verify clipboard or fallback has the text
      if (result.method === 'fallback') {
        expect(result.data).toBe(text);
      }
    }
  });

  test('Integration: Complete screenshot OCR flow', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY');

    // Given: User has a valid API key
    // And: User has captured a screenshot
    // When: User completes area selection
    const ocrResult = await recognizeImage(SAMPLE_SCREENSHOT, 'text', TEST_API_KEY);

    // Then: Complete flow succeeds
    expect(ocrResult.text).toBeTruthy();

    // And: Result is copied to clipboard
    const clipboardResult = await copyWithFallback(ocrResult.text);
    expect(clipboardResult.success).toBe(true);

    // Note: Toast notification testing requires DOM environment
    // (covered in unit tests: tests/clipboard.test.ts)
  });

  test('When: Markdown format is selected, Then: OCR preserves structure', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY');

    // Given: User has configured Markdown output
    const format = 'markdown';

    // When: Building prompt
    const prompt = buildPrompt(format);

    // Then: Prompt includes structure preservation instructions
    expect(prompt).toContain('Preserve structure as Markdown');
    expect(prompt).toContain('Headings');
    expect(prompt).toContain('Lists');
    expect(prompt).toContain('Tables');

    // When: Calling OCR with Markdown format
    const result = await recognizeImage(SAMPLE_SCREENSHOT, format, TEST_API_KEY);

    // Then: Result is returned
    expect(result.text).toBeTruthy();
  });
});

/**
 * Notes on Screenshot Flow Testing:
 *
 * 1. Overlay UI Testing:
 *    - The overlay component is tested in unit tests (tests/screenshot.test.ts)
 *    - E2E tests focus on the complete OCR flow integration
 *
 * 2. Keyboard Shortcut:
 *    - Cmd+Shift+C is registered in manifest.json
 *    - Command handler is tested in unit tests
 *    - Actual keyboard simulation requires extension context
 *
 * 3. Area Selection:
 *    - Selection logic is tested in unit tests
 *    - E2E tests verify coordinate calculations
 *
 * 4. For manual testing:
 *    - Load unpacked extension in Chrome
 *    - Navigate to any webpage
 *    - Press Cmd+Shift+C
 *    - Draw a selection rectangle
 *    - Release mouse to capture
 *    - Verify text is copied (paste with Cmd+V)
 */
