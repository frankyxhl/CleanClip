// Options page entry point
// This file is required by the test suite
/// <reference path="../types/chrome.d.ts" />

import { logger } from '../logger'

logger.debug('Options page loaded')

// Form element references
const form = document.getElementById('settings-form') as HTMLFormElement
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement
const removeLinebreaksCheckbox = document.getElementById('remove-linebreaks') as HTMLInputElement
const mergeSpacesCheckbox = document.getElementById('merge-spaces') as HTMLInputElement
const removeHeaderFooterCheckbox = document.getElementById('removeHeaderFooter') as HTMLInputElement
const notionFormatEnabledCheckbox = document.getElementById('notion-format-enabled') as HTMLInputElement
const cancelButton = document.getElementById('cancel') as HTMLButtonElement
const statusDiv = document.getElementById('status') as HTMLDivElement

// Fixed output format for Notion compatibility
const FIXED_OUTPUT_FORMAT = 'latex-notion-md'

// Default settings
const defaultSettings = {
  'cleanclip-api-key': '',
  outputFormat: FIXED_OUTPUT_FORMAT,
  removeLinebreaks: true,
  mergeSpaces: true,
  removeHeaderFooter: false,
  notionFormatEnabled: true
}

// Load settings from chrome.storage.local
async function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(defaultSettings)
      apiKeyInput.value = result['cleanclip-api-key'] || ''
      removeLinebreaksCheckbox.checked = result.removeLinebreaks ?? true
      mergeSpacesCheckbox.checked = result.mergeSpaces ?? true
      removeHeaderFooterCheckbox.checked = result.removeHeaderFooter ?? false
      notionFormatEnabledCheckbox.checked = result.notionFormatEnabled ?? true
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

// Save settings to chrome.storage.local
async function saveSettings(event: Event) {
  event.preventDefault()

  const settings = {
    'cleanclip-api-key': apiKeyInput.value.trim(),
    outputFormat: FIXED_OUTPUT_FORMAT, // Always use latex-notion-md
    removeLinebreaks: removeLinebreaksCheckbox.checked,
    mergeSpaces: mergeSpacesCheckbox.checked,
    removeHeaderFooter: removeHeaderFooterCheckbox.checked,
    notionFormatEnabled: notionFormatEnabledCheckbox.checked
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set(settings)
      showStatus('Settings saved successfully!', 'success')
    } else {
      showStatus('Storage not available in development mode', 'error')
    }
  } catch (error) {
    console.error('Failed to save settings:', error)
    showStatus('Failed to save settings. Please try again.', 'error')
  }
}

// Show status message
function showStatus(message: string, type: 'success' | 'error') {
  statusDiv.textContent = message
  statusDiv.className = `status ${type}`

  setTimeout(() => {
    statusDiv.className = 'status'
  }, 3000)
}

// Reset form to default values
function resetForm() {
  apiKeyInput.value = ''
  removeLinebreaksCheckbox.checked = true
  mergeSpacesCheckbox.checked = true
  removeHeaderFooterCheckbox.checked = false
  notionFormatEnabledCheckbox.checked = true
  showStatus('', 'success')
}

// Shortcut settings
const SHORTCUTS_URL = 'chrome://extensions/shortcuts'

// Get commands with callback-style Promise wrapper for compatibility
function getCommands(): Promise<chrome.commands.Command[]> {
  return new Promise((resolve) => {
    if (chrome?.commands?.getAll) {
      chrome.commands.getAll((commands) => resolve(commands || []))
    } else {
      resolve([])
    }
  })
}

// Load and display current shortcut
async function loadShortcut(): Promise<void> {
  const shortcutDisplay = document.getElementById('current-shortcut')
  if (!shortcutDisplay) return

  try {
    const commands = await getCommands()
    const screenshotCmd = commands.find(cmd => cmd.name === 'cleanclip-screenshot')
    shortcutDisplay.textContent = screenshotCmd?.shortcut || 'Not set'
  } catch (error) {
    console.error('Failed to load shortcut:', error)
    shortcutDisplay.textContent = 'Not set'
  }
}

// Initialize shortcut button with fallback hint
function initShortcutButton(): void {
  const changeBtn = document.getElementById('change-shortcut-btn')
  const hintEl = document.querySelector('#shortcut-section .hint')

  if (changeBtn) {
    changeBtn.addEventListener('click', async () => {
      try {
        if (chrome?.tabs?.create) {
          await chrome.tabs.create({ url: SHORTCUTS_URL })
        } else {
          // Fallback: show hint to open manually
          if (hintEl) {
            hintEl.textContent = `Please open ${SHORTCUTS_URL} manually to change shortcuts.`
          }
        }
      } catch (error) {
        console.error('Failed to open shortcuts page:', error)
        // Fallback: show hint to open manually
        if (hintEl) {
          hintEl.textContent = `Please open ${SHORTCUTS_URL} manually to change shortcuts.`
        }
      }
    })
  }
}

// Event listeners
form.addEventListener('submit', saveSettings)
cancelButton.addEventListener('click', resetForm)

// Initialize
loadSettings()
loadShortcut()
initShortcutButton()
