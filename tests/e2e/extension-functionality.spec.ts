import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.join(__dirname, '../../dist');

test.describe('CleanClip Extension - E2E Functionality', () => {
  test('offscreen document has both clipboard and screenshot handlers', async () => {
    const { readFile } = await import('fs/promises');
    const bundlePath = path.join(EXTENSION_PATH, 'assets/clipboard-COCHh5g6.js');
    const content = await readFile(bundlePath, 'utf-8');

    // Check for clipboard handler
    expect(content).toContain('CLEANCLIP_CLIPBOARD_WRITE');
    console.log('✅ Clipboard handler found');

    // Check for screenshot handler
    expect(content).toContain('CLEANCLIP_CROP_SCREENSHOT');
    console.log('✅ Screenshot handler found');

    // Check for Image usage (only works in offscreen)
    expect(content).toContain('new Image()');
    console.log('✅ Image API usage found');

    // Check for OffscreenCanvas
    expect(content).toContain('OffscreenCanvas');
    console.log('✅ OffscreenCanvas found');
  });

  test('background service worker sends correct message', async () => {
    const { readFile } = await import('fs/promises');
    const bundlePath = path.join(EXTENSION_PATH, 'assets/background.ts-CFwTBaLN.js');
    const content = await readFile(bundlePath, 'utf-8');

    // Should send CROP_SCREENSHOT message to offscreen
    expect(content).toContain('CLEANCLIP_CROP_SCREENSHOT');
    console.log('✅ Background sends CROP_SCREENSHOT message');

    // Should ensure offscreen document exists
    expect(content).toContain('ensureOffscreenDocument');
    console.log('✅ Background ensures offscreen document');

    // Should capture visible tab
    expect(content).toContain('captureVisibleTab');
    console.log('✅ Background captures visible tab');
  });

  test('message flow verification', async () => {
    const { readFile } = await import('fs/promises');

    // Read both bundles
    const backgroundBundle = await readFile(
      path.join(EXTENSION_PATH, 'assets/background.ts-CFwTBaLN.js'),
      'utf-8'
    );
    const offscreenBundle = await readFile(
      path.join(EXTENSION_PATH, 'assets/clipboard-COCHh5g6.js'),
      'utf-8'
    );

    console.log('Message Flow Analysis:');
    console.log('=======================');

    // 1. Background should send CLEANCLIP_CROP_SCREENSHOT
    const sendsCropMessage = backgroundBundle.includes('CLEANCLIP_CROP_SCREENSHOT');
    console.log(`1. Background sends CLEANCLIP_CROP_SCREENSHOT: ${sendsCropMessage ? '✅' : '❌'}`);

    // 2. Offscreen should listen for CLEANCLIP_CROP_SCREENSHOT
    const listensForCrop = offscreenBundle.includes('CLEANCLIP_CROP_SCREENSHOT');
    console.log(`2. Offscreen listens for CLEANCLIP_CROP_SCREENSHOT: ${listensForCrop ? '✅' : '❌'}`);

    // 3. Offscreen should have chrome.runtime.onMessage listener
    const hasMessageListener = offscreenBundle.includes('chrome.runtime.onMessage.addListener');
    console.log(`3. Offscreen has message listener: ${hasMessageListener ? '✅' : '❌'}`);

    // 4. Check for the message type check
    const checksMessageType = offscreenBundle.includes('message.type === \'CLEANCLIP_CROP_SCREENSHOT\'') ||
                               offscreenBundle.includes('message.type==="CLEANCLIP_CROP_SCREENSHOT"');
    console.log(`4. Offscreen checks message type: ${checksMessageType ? '✅' : '❌'}`);

    expect(sendsCropMessage).toBeTruthy();
    expect(listensForCrop).toBeTruthy();
    expect(hasMessageListener).toBeTruthy();
  });

  test('diagnose connection issue', async () => {
    const { readFile } = await import('fs/promises');

    console.log('\n🔍 Diagnosing "Receiving end does not exist" error:');
    console.log('===================================================\n');

    // Read manifest
    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));

    console.log('1. Manifest permissions:');
    console.log('   - offscreen:', manifest.permissions.includes('offscreen') ? '✅' : '❌');

    // Read background bundle
    const backgroundBundle = await readFile(
      path.join(EXTENSION_PATH, 'assets/background.ts-CFwTBaLN.js'),
      'utf-8'
    );

    console.log('\n2. Background message sending:');
    console.log('   - Uses chrome.runtime.sendMessage:', backgroundBundle.includes('chrome.runtime.sendMessage') ? '✅' : '❌');

    // Read offscreen bundle
    const offscreenBundle = await readFile(
      path.join(EXTENSION_PATH, 'assets/clipboard-COCHh5g6.js'),
      'utf-8'
    );

    console.log('\n3. Offscreen message receiving:');
    console.log('   - Has chrome.runtime.onMessage:', offscreenBundle.includes('chrome.runtime.onMessage') ? '✅' : '❌');

    // Check for return true (async response)
    const returnsTrue = offscreenBundle.includes('return true');
    console.log('   - Returns true for async:', returnsTrue ? '✅' : '❌');

    console.log('\n4. Potential issues:');
    if (!returnsTrue) {
      console.log('   ⚠️  Offscreen listener might not return true for async response');
    }

    console.log('\n5. Message types registered:');
    const messageTypes = [
      'CLEANCLIP_CLIPBOARD_WRITE',
      'CLEANCLIP_CLIPBOARD_READ',
      'CLEANCLIP_CROP_SCREENSHOT'
    ];

    messageTypes.forEach(type => {
      const found = offscreenBundle.includes(type);
      console.log(`   - ${type}: ${found ? '✅' : '❌'}`);
    });
  });
});
