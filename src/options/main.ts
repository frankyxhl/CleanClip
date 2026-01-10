// Options page entry point
// This file is required by the test suite
/// <reference path="../types/chrome.d.ts" />

console.log('CleanClip Options page loaded')

// Form element references
const form = document.getElementById('settings-form') as HTMLFormElement
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement
const outputFormatSelect = document.getElementById('output-format') as HTMLSelectElement
const removeLinebreaksCheckbox = document.getElementById('remove-linebreaks') as HTMLInputElement
const mergeSpacesCheckbox = document.getElementById('merge-spaces') as HTMLInputElement
const saveButton = document.getElementById('save') as HTMLButtonElement
const cancelButton = document.getElementById('cancel') as HTMLButtonElement
const statusDiv = document.getElementById('status') as HTMLDivElement

// Default settings
const defaultSettings = {
  apiKey: '',
  outputFormat: 'text',
  removeLinebreaks: true,
  mergeSpaces: true
}

// Load settings from chrome.storage.local
async function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(defaultSettings)
      apiKeyInput.value = result.apiKey || ''
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
    apiKey: apiKeyInput.value.trim(),
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

// Event listeners
form.addEventListener('submit', saveSettings)
cancelButton.addEventListener('click', resetForm)

// Initialize
loadSettings()
