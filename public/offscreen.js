/**
 * Offscreen Clipboard Script (non-module version)
 * Handles clipboard operations in offscreen document context
 * Uses chrome.runtime.onMessage for communication
 */

(function() {
  'use strict';

  console.log('[Offscreen] Script starting...');

  /**
   * Handle clipboard write using navigator.clipboard API
   * Falls back to execCommand if needed
   */
  async function handleClipboardWrite(text, customMimeTypes) {
    console.log('[Offscreen] handleClipboardWrite called, text length:', text.length);
    console.log('[Offscreen] Custom MIME types:', customMimeTypes?.length || 0);

    // Try navigator.clipboard.writeText first (most reliable)
    try {
      await navigator.clipboard.writeText(text);
      console.log('[Offscreen] navigator.clipboard.writeText succeeded');

      // If we have custom MIME types, try to write them via execCommand
      if (customMimeTypes && customMimeTypes.length > 0) {
        const customSuccess = await tryExecCommandWithCustomTypes(text, customMimeTypes);
        if (customSuccess) {
          console.log('[Offscreen] Custom MIME types written successfully');
        } else {
          console.log('[Offscreen] Custom MIME types failed, but text/plain was written');
        }
      }

      return { success: true };
    } catch (clipboardError) {
      console.log('[Offscreen] navigator.clipboard.writeText failed:', clipboardError.message);
    }

    // Fallback to execCommand
    try {
      const success = await tryExecCommandWithCustomTypes(text, customMimeTypes);
      if (success) {
        return { success: true };
      }
    } catch (execError) {
      console.error('[Offscreen] execCommand failed:', execError.message);
    }

    return { success: false, error: 'All clipboard methods failed' };
  }

  /**
   * Try to copy using execCommand with custom MIME types
   */
  async function tryExecCommandWithCustomTypes(text, customMimeTypes) {
    return new Promise((resolve) => {
      // Use textarea for better compatibility
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(textarea);

      // Focus and select
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      let copySuccessful = false;

      const copyHandler = (e) => {
        console.log('[Offscreen] Copy event fired!');
        e.preventDefault();

        // Set plain text
        e.clipboardData.setData('text/plain', text);

        // Set custom MIME types
        if (customMimeTypes && customMimeTypes.length > 0) {
          customMimeTypes.forEach(({ mimeType, data }) => {
            try {
              e.clipboardData.setData(mimeType, data);
              console.log('[Offscreen] Set MIME type:', mimeType);
            } catch (err) {
              console.warn('[Offscreen] Failed to set MIME type:', mimeType, err.message);
            }
          });
        }
        copySuccessful = true;
      };

      document.addEventListener('copy', copyHandler, { once: true });

      // Try execCommand
      let execResult = false;
      try {
        execResult = document.execCommand('copy');
      } catch (e) {
        console.log('[Offscreen] execCommand threw:', e.message);
      }

      // Cleanup
      document.body.removeChild(textarea);

      // Remove listener if it didn't fire
      document.removeEventListener('copy', copyHandler);

      console.log('[Offscreen] execCommand result:', execResult, 'copySuccessful:', copySuccessful);
      resolve(execResult && copySuccessful);
    });
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Offscreen] Received message:', message.type);

    if (message.type === 'clipboard-write') {
      handleClipboardWrite(message.text, message.customMimeTypes)
        .then(result => {
          console.log('[Offscreen] Sending response:', result);
          sendResponse(result);
        })
        .catch(err => {
          console.error('[Offscreen] Error:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true; // Keep channel open for async response
    }

    if (message.type === 'ping') {
      console.log('[Offscreen] Ping received, sending pong');
      sendResponse({ success: true, pong: true });
      return false;
    }
  });

  // Write load confirmation to storage
  chrome.storage.local.set({ '__OFFSCREEN_LOADED__': Date.now() }).then(() => {
    console.log('[Offscreen] Wrote load confirmation to storage');
  }).catch((err) => {
    console.error('[Offscreen] Failed to write load confirmation:', err);
  });

  console.log('[Offscreen] Message listener registered, initialization complete!');

})();
