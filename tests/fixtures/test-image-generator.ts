/**
 * Generate a simple test image with text for OCR testing
 */

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function createTestImage(): void {
  const canvas = createCanvas(400, 100)
  const ctx = canvas.getContext('2d')

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 400, 100)

  // Black text
  ctx.fillStyle = '#000000'
  ctx.font = '24px Arial'
  ctx.fillText('CleanClip OCR Test', 20, 50)
  ctx.font = '16px Arial'
  ctx.fillText('This is a test image.', 20, 80)

  // Save as PNG
  const buffer = canvas.toBuffer('image/png')
  writeFileSync('test-image.png', buffer)
  console.log('✅ Test image created: test-image.png')
  console.log('   Size: ' + buffer.length + ' bytes')
}

createTestImage()
