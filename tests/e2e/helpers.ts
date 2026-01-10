/**
 * E2E Test Helpers for CleanClip Extension
 *
 * Provides utilities for testing Chrome Extension functionality with Playwright
 */

import { Page, BrowserContext } from '@playwright/test';

export interface TestImageData {
  base64: string;
  mimeType: string;
}

/**
 * Convert a file to base64 data URL
 */
export async function fileToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Create a simple test image with text (for OCR testing)
 * Note: This is a placeholder. In real tests, use actual image files.
 */
export function createTestImageData(): TestImageData {
  // For E2E tests, we'll use actual image files from fixtures
  // This is just a type helper
  return {
    base64: '',
    mimeType: 'image/png'
  };
}

/**
 * Load extension in browser context
 */
export async function loadExtension(context: BrowserContext, extensionPath: string): Promise<string> {
  // For Chrome extension testing, we need to load the unpacked extension
  // This is typically done via Chrome launch args
  throw new Error('Extension loading must be done via browser launch arguments');
}

/**
 * Wait for extension to be ready
 */
export async function waitForExtension(page: Page): Promise<void> {
  // Wait for extension background script to be ready
  await page.waitForTimeout(1000);
}

/**
 * Navigate to extension options page
 */
export async function openOptionsPage(page: Page, extensionId: string): Promise<Page> {
  const optionsPage = await page.context().newPage();
  await optionsPage.goto(`chrome-extension://${extensionId}/src/options/options.html`);
  return optionsPage;
}

/**
 * Navigate to extension popup
 */
export async function openPopup(page: Page, extensionId: string): Promise<Page> {
  const popupPage = await page.context().newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  return popupPage;
}

/**
 * Set API key in extension storage
 */
export async function setApiKey(page: Page, apiKey: string): Promise<void> {
  await page.evaluate(async (key) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ 'cleanclip-api-key': key });
    }
  }, apiKey);
}

/**
 * Get API key from extension storage
 */
export async function getApiKey(page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('cleanclip-api-key');
      return result['cleanclip-api-key'] || null;
    }
    return null;
  });
}

/**
 * Clear extension storage
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.clear();
    }
  });
}

/**
 * Get history from extension storage
 */
export async function getHistory(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('cleanclip_history');
      return result['cleanclip_history'] || [];
    }
    return [];
  });
}

/**
 * Mock Gemini API response (for testing without real API calls)
 */
export function mockGeminiResponse(text: string): any {
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: text
            }
          ]
        }
      }
    ]
  };
}

/**
 * Simulate context menu click on image
 */
export async function triggerContextMenuOnImage(page: Page, selector: string): Promise<void> {
  await page.click(selector, { button: 'right' });
  // Note: Actual context menu interaction requires Chrome DevTools Protocol
  // This is a placeholder for the test structure
}

/**
 * Trigger screenshot command (Cmd+Shift+C)
 */
export async function triggerScreenshotCommand(page: Page): Promise<void> {
  // Send command to background script
  await page.evaluate(async () => {
    if (typeof chrome !== 'undefined' && chrome.commands) {
      // This would normally be triggered by keyboard shortcut
      // For testing, we can send a message to background script
      chrome.runtime.sendMessage({
        type: 'SIMULATE_SHORTCUT',
        command: 'cleanclip-screenshot'
      });
    }
  });
}
