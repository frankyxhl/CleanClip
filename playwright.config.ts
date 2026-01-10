import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for CleanClip Chrome Extension E2E testing
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

  // Run local dev server before starting tests (optional for extensions)
  // webServer: {
  //   command: 'npm run build',
  //   port: 5173,
  // },
});
