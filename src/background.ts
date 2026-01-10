// Background service worker for CleanClip extension
// Handles context menu registration, shortcuts, and image OCR triggers

interface SelectionCoords {
  x: number
  y: number
  width: number
  height: number
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )

    return base64
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

/**
 * Capture visible tab and crop to selected area
 */
async function captureArea(selection: SelectionCoords): Promise<string> {
  if (!chrome?.tabs) {
    throw new Error('chrome.tabs API not available')
  }

  // Capture visible tab
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })

  // Crop to selected area using canvas
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = new OffscreenCanvas(selection.width, selection.height)
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw selected area
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

        // Convert to blob and then to base64
        canvas.convertToBlob({ type: 'image/png' }).then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }).catch(reject)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

if (chrome?.runtime && chrome?.contextMenus) {
  // Register context menu on extension install
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'cleanclip-recognize',
      title: 'CleanClip: Recognize Text',
      contexts: ['image']
    })
  })

  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener(async (info, _tab) => {
    if (info.srcUrl) {
      // Image URL is available, will be used for OCR
      console.log('CleanClip: Image URL clicked', info.srcUrl)

      try {
        // Fetch image and convert to base64
        const base64Image = await fetchImageAsBase64(info.srcUrl)
        console.log('CleanClip: Image fetched as base64', base64Image.substring(0, 50) + '...')

        // TODO: Send to OCR (will be done in later phases)
      } catch (error) {
        console.error('CleanClip: Failed to fetch image', error)
        // TODO: Show error to user (will be done in later phases)
      }
    }
  })

  // Handle keyboard shortcut (Cmd+Shift+C)
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'cleanclip-screenshot' && tab?.id) {
      console.log('CleanClip: Screenshot command triggered')

      // Inject content script to show overlay
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/overlay.ts']
        })
      } catch (error) {
        console.error('CleanClip: Failed to inject overlay script', error)
      }
    }
  })

  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CLEANCLIP_SCREENSHOT_CAPTURE') {
      const selection = message.selection as SelectionCoords

      console.log('CleanClip: Capturing area', selection)

      captureArea(selection)
        .then(base64Image => {
          console.log('CleanClip: Screenshot captured', base64Image.substring(0, 50) + '...')
          // TODO: Send to OCR (will be done in later phases)
          sendResponse({ success: true, base64: base64Image })
        })
        .catch(error => {
          console.error('CleanClip: Failed to capture area', error)
          sendResponse({ success: false, error: error.message })
        })

      return true // Keep message channel open for async response
    }

    return false
  })
}
