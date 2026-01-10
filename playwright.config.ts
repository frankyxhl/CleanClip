import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for CleanClip Chrome Extension E2E testing
 *
 * Phase 9: BDD End-to-End Tests
 * - Tests real API integration with Gemini
 * - Tests complete user flows (context menu, screenshot, history)
 * - Tests error scenarios (missing API key, network errors)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Chrome extensions should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for extension testing
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
    baseURL: 'chrome-extension://__extension_id__',
  },

  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Use Chrome DevTools protocol for extension testing
        channel: 'chrome',
      },
    },
  ],

  // Pass environment variables to tests
  // GEMINI_API_KEY should be set in .env file for E2E tests
  // Run: GEMINI_API_KEY=xxx npm run test:e2e
});
