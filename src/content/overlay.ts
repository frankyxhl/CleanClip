/**
 * Content Script: Screenshot Overlay
 * Provides area selection UI for screenshot functionality
 */

// Overlay state
interface SelectionState {
  isSelecting: boolean
  startX: number
  startY: number
  endX: number
  endY: number
}

let state: SelectionState = {
  isSelecting: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
}

// DOM elements
let overlay: HTMLDivElement | null = null
let selectionBox: HTMLDivElement | null = null

/**
 * Initialize the overlay UI
 */
function initOverlay(): void {
  // Create semi-transparent overlay
  overlay = document.createElement('div')
  overlay.id = 'cleanclip-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    cursor: crosshair;
    z-index: 2147483647;
    user-select: none;
  `

  // Create selection box
  selectionBox = document.createElement('div')
  selectionBox.id = 'cleanclip-selection'
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px dashed #ffffff;
    background-color: rgba(255, 255, 255, 0.2);
    display: none;
    pointer-events: none;
  `

  overlay.appendChild(selectionBox)
  document.body.appendChild(overlay)

  // Attach event listeners
  overlay.addEventListener('mousedown', handleMouseDown)
  overlay.addEventListener('mousemove', handleMouseMove)
  overlay.addEventListener('mouseup', handleMouseUp)
  overlay.addEventListener('keydown', handleKeyDown)
}

/**
 * Handle mouse down - start selection
 */
function handleMouseDown(e: MouseEvent): void {
  state.isSelecting = true
  state.startX = e.clientX
  state.startY = e.clientY
  state.endX = e.clientX
  state.endY = e.clientY

  if (selectionBox) {
    selectionBox.style.display = 'block'
    updateSelectionBox()
  }
}

/**
 * Handle mouse move - update selection
 */
function handleMouseMove(e: MouseEvent): void {
  if (!state.isSelecting) return

  state.endX = e.clientX
  state.endY = e.clientY
  updateSelectionBox()
}

/**
 * Handle mouse up - complete selection
 */
function handleMouseUp(_e: MouseEvent): void {
  if (!state.isSelecting) return

  state.isSelecting = false

  // Calculate selection coordinates
  const selection = calculateSelection()

  // Remove overlay
  removeOverlay()

  // Send selection to background script
  if (chrome?.runtime) {
    chrome.runtime.sendMessage({
      type: 'CLEANCLIP_SCREENSHOT_CAPTURE',
      selection
    })
  }
}

/**
 * Handle keyboard events
 */
function handleKeyDown(_e: KeyboardEvent): void {
  // Escape to cancel
  if (_e.key === 'Escape') {
    removeOverlay()
  }
}

/**
 * Update selection box position and size
 */
function updateSelectionBox(): void {
  if (!selectionBox) return

  const { x, y, width, height } = calculateSelection()

  selectionBox.style.left = `${x}px`
  selectionBox.style.top = `${y}px`
  selectionBox.style.width = `${width}px`
  selectionBox.style.height = `${height}px`
}

/**
 * Calculate selection coordinates
 */
function calculateSelection(): { x: number; y: number; width: number; height: number } {
  const x = Math.min(state.startX, state.endX)
  const y = Math.min(state.startY, state.endY)
  const width = Math.abs(state.endX - state.startX)
  const height = Math.abs(state.endY - state.startY)

  return { x, y, width, height }
}

/**
 * Remove overlay from DOM
 */
function removeOverlay(): void {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay)
    overlay = null
    selectionBox = null
  }
}

/**
 * Show overlay for screenshot selection
 */
export function showOverlay(): void {
  // Reset state
  state = {
    isSelecting: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  }

  // Initialize overlay
  initOverlay()
}

// Listen for messages from background script
if (chrome?.runtime) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CLEANCLIP_SHOW_OVERLAY') {
      showOverlay()
      sendResponse({ success: true })
    }
    return true
  })
}
