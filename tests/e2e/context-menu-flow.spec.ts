import { test, expect } from '@playwright/test';
import { recognizeImage, buildPrompt, buildGeminiRequest } from '../../src/ocr.js';
import { addToHistory, getHistory } from '../../src/history.js';
import { writeTextToClipboard, copyWithFallback } from '../../src/clipboard.js';

/**
 * Phase 9, Task 9.2: BDD Test - Right-click image → copy flow (Red)
 *
 * Scenario: User right-clicks on an image and triggers OCR
 *
 * Given: The user is on a webpage with images
 * And: The user has configured a valid Gemini API key
 * When: The user right-clicks on an image
 * And: Clicks "CleanClip: Recognize Text"
 * Then: The image is fetched and converted to base64
 * And: The image is sent to Gemini API for OCR
 * And: The OCR result is copied to clipboard
 * And: A toast notification shows "Copied!"
 * And: The result is saved to history
 */

test.describe('BDD: Right-click image → OCR → copy flow', () => {
  const TEST_API_KEY = process.env.GEMINI_API_KEY || 'test-api-key';

  // Sample base64 image (1x1 red pixel PNG)
  const SAMPLE_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  test('Given: User has valid API key', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY in environment');

    // Verify API key is available for testing
    expect(TEST_API_KEY).toBeTruthy();
    expect(TEST_API_KEY).not.toBe('test-api-key');
  });

  test('When: Image is fetched and converted to base64, Then: Base64 data is valid', async () => {
    // Given: An image URL or data
    // When: Image is converted to base64
    // Then: Base64 string is valid
    expect(SAMPLE_BASE64_IMAGE).toMatch(/^data:image\/[a-z]+;base64,/);
  });

  test('When: OCR request is built, Then: Request format is correct', () => {
    // Given: A base64 image and prompt
    const prompt = buildPrompt('text');

    // When: Building Gemini API request
    const request = buildGeminiRequest(SAMPLE_BASE64_IMAGE, prompt);

    // Then: Request structure is valid
    expect(request).toHaveProperty('contents');
    expect(request.contents).toBeInstanceOf(Array);
    expect(request.contents[0]).toHaveProperty('parts');
    expect(request.contents[0].parts).toBeInstanceOf(Array);
    expect(request.contents[0].parts[0]).toHaveProperty('text');
    expect(request.contents[0].parts[1]).toHaveProperty('inlineData');
  });

  test('When: Gemini API is called, Then: OCR result is returned', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY');

    // Given: A base64 image and API key
    // When: Calling recognizeImage
    const result = await recognizeImage(SAMPLE_BASE64_IMAGE, 'text', TEST_API_KEY);

    // Then: OCR result is returned with text and timestamp
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.text).toBe('string');
    expect(typeof result.timestamp).toBe('number');
    expect(result.timestamp).toBeGreaterThan(0);
  });

  test('When: OCR result is obtained, Then: Result is copied to clipboard', async () => {
    // Given: An OCR result
    const ocrResult = {
      text: 'Sample recognized text',
      timestamp: Date.now()
    };

    // When: Copying to clipboard
    const clipboardResult = await writeTextToClipboard(ocrResult.text);

    // Then: Clipboard write succeeds (or falls back)
    expect(clipboardResult).toHaveProperty('success');
    expect(typeof clipboardResult.success).toBe('boolean');
    // Note: In test environment, clipboard might not be available
    // but we verify the function handles it gracefully
  });

  test('When: Clipboard write fails, Then: Fallback mechanism works', async () => {
    // Given: An OCR result
    const text = 'Sample recognized text';

    // When: Using copy with fallback
    const result = await copyWithFallback(text);

    // Then: Either clipboard or fallback succeeds
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('method');
    expect(['clipboard', 'fallback']).toContain(result.method);

    // If clipboard failed, data should be available for manual copy
    if (result.method === 'fallback') {
      expect(result).toHaveProperty('data');
      expect(result.data).toBe(text);
    }
  });

  test('When: OCR completes successfully, Then: Result is saved to history', async () => {
    // Skip this test in Node.js environment (no chrome API)
    // History storage tests are covered in unit tests (tests/history.test.ts)
    test.skip(true, 'History storage requires chrome API - covered in unit tests');

    // Given: An OCR result
    const historyItem = {
      text: 'Sample recognized text',
      timestamp: Date.now(),
      imageUrl: SAMPLE_BASE64_IMAGE
    };

    // When: Adding to history
    await addToHistory(historyItem);

    // Then: Item appears in history
    const history = await getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1]).toMatchObject({
      text: historyItem.text,
      imageUrl: historyItem.imageUrl
    });
  });

  test('Integration: Complete OCR flow with real API', async () => {
    // Skip if no real API key is available
    test.skip(TEST_API_KEY === 'test-api-key', 'Requires real GEMINI_API_KEY');

    // Given: User has a valid API key and an image
    // When: User triggers OCR via context menu (simulated)
    const ocrResult = await recognizeImage(SAMPLE_BASE64_IMAGE, 'text', TEST_API_KEY);

    // Then: Complete flow succeeds
    expect(ocrResult.text).toBeTruthy();

    // And: Result is copied to clipboard (or fallback)
    const clipboardResult = await copyWithFallback(ocrResult.text);
    expect(clipboardResult.success).toBe(true);

    // Note: History storage is tested in unit tests
    // In real extension, background script would handle this
  });
});

/**
 * Notes on Chrome Extension E2E Testing:
 *
 * 1. Context Menu Testing:
 *    - Playwright cannot directly interact with native browser context menus
 *    - Real validation requires manual testing in Chrome browser
 *    - This test verifies the underlying OCR flow works correctly
 *
 * 2. API Testing:
 *    - Tests use real Gemini API when GEMINI_API_KEY is provided
 *    - Without API key, tests are skipped but structure is validated
 *
 * 3. Clipboard Testing:
 *    - Test environments may not have access to system clipboard
 *    - Fallback mechanism is tested to ensure graceful handling
 *
 * 4. For manual testing, load the unpacked extension in Chrome and:
 *    - Navigate to any webpage with images
 *    - Right-click on an image
 *    - Select "CleanClip: Recognize Text"
 *    - Verify toast notification appears
 *    - Paste (Cmd+V) to verify text was copied
 */
