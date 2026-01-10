// Background service worker for CleanClip extension
// Handles context menu registration and image OCR triggers

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
}
