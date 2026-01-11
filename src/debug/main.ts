// Debug Page Main Module for CleanClip
// Provides visualization and adjustment tools for crop coordinates

import { getHistory } from '../history.js'

interface DebugInfo {
  originalImageUrl: string
  selection: { x: number; y: number; width: number; height: number }
  originalSize: { width: number; height: number }
  devicePixelRatio: number
  zoomLevel: number
}

interface HistoryItem {
  id: string
  text: string
  timestamp: number
  imageUrl: string
  debug?: DebugInfo
}

let currentHistoryItem: HistoryItem | null = null
let currentSelection = { x: 0, y: 0, width: 0, height: 0 }

/**
 * Initialize the debug page
 */
async function initDebugPage(): Promise<void> {
  try {
    // Get history ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const historyId = urlParams.get('id')

    if (!historyId) {
      showError('History item not found')
      return
    }

    // Load history from chrome.storage.local
    const history = await getHistory()
    const historyItem = history.find(item => item.id === historyId)

    if (!historyItem) {
      showError('History item not found')
      return
    }

    currentHistoryItem = historyItem

    // Check if debug data is available
    if (!historyItem.debug) {
      showNoDebugMessage()
      return
    }

    // Display debug information
    displayDebugInfo(historyItem)
  } catch (error) {
    console.error('Error loading debug page:', error)
    showError('Failed to load debug information')
  }
}

/**
 * Display debug information on the page
 */
function displayDebugInfo(item: HistoryItem): void {
  const debug = item.debug!
  currentSelection = { ...debug.selection }

  // Show debug page, hide messages
  const debugPage = document.querySelector('[data-debug-page]') as HTMLElement
  const noDebugMessage = document.querySelector('[data-no-debug-message]') as HTMLElement
  const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

  if (debugPage) debugPage.classList.remove('hidden')
  if (noDebugMessage) noDebugMessage.classList.add('hidden')
  if (errorMessage) errorMessage.classList.add('hidden')

  // Display original screenshot
  const originalScreenshotImg = document.querySelector('[data-original-screenshot-image]') as HTMLImageElement
  if (originalScreenshotImg) {
    originalScreenshotImg.src = debug.originalImageUrl
    originalScreenshotImg.onload = () => {
      updateCropBoxOverlay(debug.selection)
    }
  }

  // Display comparison images
  const comparisonOriginalImg = document.querySelector('[data-comparison-original-image]') as HTMLImageElement
  if (comparisonOriginalImg) {
    comparisonOriginalImg.src = debug.originalImageUrl
  }

  const comparisonCroppedImg = document.querySelector('[data-comparison-cropped-image]') as HTMLImageElement
  if (comparisonCroppedImg) {
    comparisonCroppedImg.src = item.imageUrl
  }

  // Populate debug data panel
  populateDebugPanel(debug)

  // Populate coordinate inputs
  populateCoordinateInputs(debug.selection)

  // Set up event listeners
  setupEventListeners()
}

/**
 * Update the crop box overlay position and size
 */
function updateCropBoxOverlay(selection: { x: number; y: number; width: number; height: number }): void {
  const cropBoxOverlay = document.querySelector('[data-crop-box-overlay]') as HTMLElement
  if (!cropBoxOverlay) return

  cropBoxOverlay.style.position = 'absolute'
  cropBoxOverlay.style.left = `${selection.x}px`
  cropBoxOverlay.style.top = `${selection.y}px`
  cropBoxOverlay.style.width = `${selection.width}px`
  cropBoxOverlay.style.height = `${selection.height}px`
  cropBoxOverlay.style.border = '2px solid red'
  cropBoxOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'
  cropBoxOverlay.style.pointerEvents = 'none'
}

/**
 * Populate the debug data panel with values
 */
function populateDebugPanel(debug: DebugInfo): void {
  const coordinatesValue = document.querySelector('[data-coordinates-value]') as HTMLElement
  if (coordinatesValue) {
    coordinatesValue.textContent = `x: ${debug.selection.x}, y: ${debug.selection.y}, width: ${debug.selection.width}, height: ${debug.selection.height}`
  }

  const originalSizeValue = document.querySelector('[data-original-size-value]') as HTMLElement
  if (originalSizeValue) {
    originalSizeValue.textContent = `${debug.originalSize.width} × ${debug.originalSize.height}`
  }

  const devicePixelRatioValue = document.querySelector('[data-device-pixel-ratio-value]') as HTMLElement
  if (devicePixelRatioValue) {
    devicePixelRatioValue.textContent = debug.devicePixelRatio.toString()
  }

  const zoomLevelValue = document.querySelector('[data-zoom-level-value]') as HTMLElement
  if (zoomLevelValue) {
    zoomLevelValue.textContent = debug.zoomLevel.toString()
  }

  const originalUrlValue = document.querySelector('[data-original-url-value]') as HTMLElement
  if (originalUrlValue) {
    originalUrlValue.textContent = debug.originalImageUrl.substring(0, 50) + '...'
  }
}

/**
 * Populate coordinate adjustment inputs
 */
function populateCoordinateInputs(selection: { x: number; y: number; width: number; height: number }): void {
  const inputX = document.querySelector('[data-input-x]') as HTMLInputElement
  const inputY = document.querySelector('[data-input-y]') as HTMLInputElement
  const inputWidth = document.querySelector('[data-input-width]') as HTMLInputElement
  const inputHeight = document.querySelector('[data-input-height]') as HTMLInputElement

  if (inputX) inputX.value = selection.x.toString()
  if (inputY) inputY.value = selection.y.toString()
  if (inputWidth) inputWidth.value = selection.width.toString()
  if (inputHeight) inputHeight.value = selection.height.toString()
}

/**
 * Set up event listeners for buttons
 */
function setupEventListeners(): void {
  const applyButton = document.querySelector('[data-apply-button]') as HTMLButtonElement
  const saveButton = document.querySelector('[data-save-to-history-button]') as HTMLButtonElement

  if (applyButton) {
    applyButton.addEventListener('click', handleApply)
  }

  if (saveButton) {
    saveButton.addEventListener('click', handleSaveToHistory)
  }
}

/**
 * Handle Apply button click - update crop box preview
 */
function handleApply(): void {
  const inputX = document.querySelector('[data-input-x]') as HTMLInputElement
  const inputY = document.querySelector('[data-input-y]') as HTMLInputElement
  const inputWidth = document.querySelector('[data-input-width]') as HTMLInputElement
  const inputHeight = document.querySelector('[data-input-height]') as HTMLInputElement

  const newSelection = {
    x: parseInt(inputX?.value || '0', 10),
    y: parseInt(inputY?.value || '0', 10),
    width: parseInt(inputWidth?.value || '0', 10),
    height: parseInt(inputHeight?.value || '0', 10)
  }

  currentSelection = newSelection

  // Update crop box overlay
  updateCropBoxOverlay(newSelection)

  // Update cropped preview
  updateCroppedPreview(newSelection)
}

/**
 * Update the cropped preview image
 */
function updateCroppedPreview(selection: { x: number; y: number; width: number; height: number }): void {
  if (!currentHistoryItem?.debug) return

  const croppedPreviewImg = document.querySelector('[data-comparison-cropped-image]') as HTMLImageElement
  if (!croppedPreviewImg) return

  // Create a canvas to crop the image
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = selection.width
  canvas.height = selection.height

  const img = new Image()
  img.onload = () => {
    ctx.drawImage(
      img,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    )
    const dataUrl = canvas.toDataURL()
    croppedPreviewImg.src = dataUrl
  }
  img.src = currentHistoryItem.debug.originalImageUrl
}

/**
 * Handle Save to History button click
 */
async function handleSaveToHistory(): Promise<void> {
  if (!currentHistoryItem || !chrome?.storage?.local) {
    showNotification('Failed to save: chrome.storage not available')
    return
  }

  try {
    // Get current history
    const history = await getHistory()

    // Find and update the current item
    const updatedHistory = history.map(item => {
      if (item.id === currentHistoryItem!.id && item.debug) {
        return {
          ...item,
          debug: {
            ...item.debug,
            selection: { ...currentSelection }
          }
        }
      }
      return item
    })

    // Save to chrome.storage.local
    await chrome.storage.local.set({ cleanclip_history: updatedHistory })

    // Update current history item
    if (currentHistoryItem.debug) {
      currentHistoryItem.debug.selection = { ...currentSelection }
    }

    // Update debug panel display
    populateDebugPanel(currentHistoryItem.debug!)

    showNotification('coordinates saved successfully')
  } catch (error) {
    console.error('Error saving to history:', error)
    showNotification('Failed to save coordinates')
  }
}

/**
 * Show no debug message
 */
function showNoDebugMessage(): void {
  const debugPage = document.querySelector('[data-debug-page]') as HTMLElement
  const noDebugMessage = document.querySelector('[data-no-debug-message]') as HTMLElement
  const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

  if (debugPage) debugPage.classList.add('hidden')
  if (noDebugMessage) noDebugMessage.classList.remove('hidden')
  if (errorMessage) errorMessage.classList.add('hidden')
}

/**
 * Show error message
 */
function showError(message: string): void {
  const debugPage = document.querySelector('[data-debug-page]') as HTMLElement
  const noDebugMessage = document.querySelector('[data-no-debug-message]') as HTMLElement
  const errorMessage = document.querySelector('[data-error-message]') as HTMLElement

  if (debugPage) debugPage.classList.add('hidden')
  if (noDebugMessage) noDebugMessage.classList.add('hidden')
  if (errorMessage) errorMessage.classList.remove('hidden')

  const errorHeading = errorMessage?.querySelector('h1') as HTMLElement
  if (errorHeading) {
    errorHeading.textContent = message
  }
}

/**
 * Show notification
 */
function showNotification(message: string): void {
  const notification = document.querySelector('[data-notification]') as HTMLElement
  const notificationMessage = document.querySelector('[data-notification-message]') as HTMLElement

  if (notification) {
    notification.classList.remove('hidden')
  }

  if (notificationMessage) {
    notificationMessage.textContent = message
  }

  // Hide notification after 3 seconds
  setTimeout(() => {
    if (notification) {
      notification.classList.add('hidden')
    }
  }, 3000)
}

// Initialize when DOM is ready or immediately if ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDebugPage)
} else {
  // Initialize immediately
  initDebugPage()
}

export default {}
