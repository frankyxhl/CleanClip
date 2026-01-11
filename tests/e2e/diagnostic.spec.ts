import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Diagnostic E2E test for CleanClip Extension
 * Tests basic extension functionality to identify issues
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.join(__dirname, '../../dist');

test.describe('CleanClip Extension - Diagnostic', () => {
  test.beforeAll(async ({ browser }) => {
    // Verify extension path exists
    const fs = await import('fs/promises');
    try {
      const stat = await fs.stat(EXTENSION_PATH);
      console.log('Extension path exists:', EXTENSION_PATH);
      console.log('Is directory:', stat.isDirectory());
    } catch (e) {
      console.error('Extension path not found:', EXTENSION_PATH);
      throw e;
    }
  });

  test('loads extension without errors', async ({ page, context }) => {
    // Load the extension
    await context.addInitScript({
      path: EXTENSION_PATH
    }).catch(() => {
      // addInitScript may not work for extensions, try alternative approach
    });

    // Navigate to a test page
    await page.goto('https://example.com');

    // Check if extension is accessible
    const hasExtension = await page.evaluate(() => {
      return typeof chrome !== 'undefined' && chrome.runtime !== undefined;
    });

    console.log('Chrome API available:', hasExtension);

    if (!hasExtension) {
      console.warn('Extension not loaded via addInitScript - this is expected');
      console.warn('Playwright needs special configuration for extension testing');
    }
  });

  test('checks manifest.json structure', async () => {
    const fs = await import('fs/promises');

    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    console.log('Manifest keys:', Object.keys(manifest));
    console.log('Manifest name:', manifest.name);
    console.log('Manifest version:', manifest.version);

    // Check critical configurations
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBeDefined();
    expect(manifest.options_ui).toBeDefined();
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.permissions).toContain('offscreen');

    console.log('Action popup:', manifest.action.default_popup);
    console.log('Options page:', manifest.options_ui.page);
    console.log('Content scripts:', manifest.content_scripts);
  });

  test('checks popup file exists', async () => {
    const fs = await import('fs/promises');

    const popupPath = path.join(EXTENSION_PATH, 'src/popup/index.html');
    const exists = await fs.access(popupPath).then(() => true).catch(() => false);

    console.log('Popup HTML exists:', exists);
    expect(exists).toBe(true);

    if (exists) {
      const content = await fs.readFile(popupPath, 'utf-8');
      console.log('Popup contains history-container:', content.includes('history-container'));
      console.log('Popup has script tag:', content.includes('<script type="module"'));

      // Check for bundled script (with hash name)
      const hasPopupBundle = content.includes('/assets/src/popup/index-') && content.includes('.js"></script>');
      console.log('Popup has bundled script:', hasPopupBundle);

      // Verify the bundle file exists and contains our code
      if (hasPopupBundle) {
        const bundleMatch = content.match(/\/assets\/src\/popup\/index-[^.]+\.js/);
        if (bundleMatch) {
          const bundlePath = path.join(EXTENSION_PATH, bundleMatch[0].substring(1)); // remove leading /
          const bundleExists = await fs.access(bundlePath).then(() => true).catch(() => false);
          console.log('Bundle file exists:', bundleExists);

          if (bundleExists) {
            const bundleContent = await fs.readFile(bundlePath, 'utf-8');
            console.log('Bundle contains logger:', bundleContent.includes('logger-BQ9vUDF2'));
            console.log('Bundle contains history:', bundleContent.includes('history-D7K5KsOc'));
            // Note: initPopup is minified, check for auto-initialization call instead
            console.log('Bundle has auto-init:', bundleContent.includes('history-container'));
            console.log('Bundle has render code:', bundleContent.includes('history-item'));
            console.log('Bundle size:', bundleContent.length, 'bytes');
          }
        }
      }
    }
  });

  test('checks offscreen files exist', async () => {
    const fs = await import('fs/promises');

    const offscreenHtml = path.join(EXTENSION_PATH, 'src/offscreen/clipboard.html');
    const exists = await fs.access(offscreenHtml).then(() => true).catch(() => false);

    console.log('Offscreen HTML exists:', exists);
    expect(exists).toBe(true);
  });

  test('checks background script', async () => {
    const fs = await import('fs/promises');

    // Check for background script reference in manifest
    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    console.log('Background service worker:', manifest.background);
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBeDefined();
    expect(manifest.background.type).toBe('module');

    // Check if the worker file exists
    const workerPath = path.join(EXTENSION_PATH, manifest.background.service_worker);
    const exists = await fs.access(workerPath).then(() => true).catch(() => false);

    console.log('Background script exists:', exists);
    // Note: The actual .js file might be in assets/ after build
  });

  test('lists all files in dist', async () => {
    const fs = await import('fs/promises');
    const { readdir } = fs;

    async function listFiles(dir: string, prefix = '') {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await listFiles(fullPath, prefix + entry.name + '/');
        } else {
          console.log(prefix + entry.name);
        }
      }
    }

    await listFiles(EXTENSION_PATH);
  });
});
