// Options page entry point
// This file is required by the test suite
/// <reference path="../types/chrome.d.ts" />

import { logger } from '../logger'

logger.debug('Options page loaded')

// Form element references
const form = document.getElementById('settings-form') as HTMLFormElement
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement
const outputFormatSelect = document.getElementById('output-format') as HTMLSelectElement
const formatHint = document.getElementById('format-hint')
const removeLinebreaksCheckbox = document.getElementById('remove-linebreaks') as HTMLInputElement
const mergeSpacesCheckbox = document.getElementById('merge-spaces') as HTMLInputElement
const cancelButton = document.getElementById('cancel') as HTMLButtonElement
const statusDiv = document.getElementById('status') as HTMLDivElement

// Format-specific hints for LaTeX options
const FORMAT_HINTS: Record<string, string> = {
  'latex-notion': 'Paste into Notion Equation block (/equation)',
  'latex-obsidian': 'Requires tikzjax plugin for diagram rendering'
}

// Update format hint based on selected output format
function updateFormatHint(): void {
  if (formatHint) {
    formatHint.textContent = FORMAT_HINTS[outputFormatSelect.value] || ''
  }
}

// Default settings
const defaultSettings = {
  'cleanclip-api-key': '',
  outputFormat: 'text',
  removeLinebreaks: true,
  mergeSpaces: true
}

// Load settings from chrome.storage.local
async function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(defaultSettings)
      apiKeyInput.value = result['cleanclip-api-key'] || ''
      outputFormatSelect.value = result.outputFormat || 'text'
      removeLinebreaksCheckbox.checked = result.removeLinebreaks ?? true
      mergeSpacesCheckbox.checked = result.mergeSpaces ?? true
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
    outputFormat: outputFormatSelect.value,
    removeLinebreaks: removeLinebreaksCheckbox.checked,
    mergeSpaces: mergeSpacesCheckbox.checked
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
  outputFormatSelect.value = 'text'
  removeLinebreaksCheckbox.checked = true
  mergeSpacesCheckbox.checked = true
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
outputFormatSelect.addEventListener('change', updateFormatHint)

// Initialize
loadSettings().then(() => {
  // Update hint after settings are loaded (user's existing settings won't trigger change event)
  updateFormatHint()
})
loadShortcut()
initShortcutButton()
