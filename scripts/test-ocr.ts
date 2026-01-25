#!/usr/bin/env npx tsx
/**
 * CLI tool for testing OCR and Notion clipboard generation
 *
 * Usage:
 *   GEMINI_API_KEY=xxx npx tsx scripts/test-ocr.ts <image-path> [format]
 *
 * Formats: text, markdown, latex-notion, latex-notion-md, latex-obsidian, structured
 *
 * Examples:
 *   GEMINI_API_KEY=xxx npx tsx scripts/test-ocr.ts tests/fixtures/notion-multiblock-equaiton.png latex-notion
 */

import * as fs from 'fs'
import * as path from 'path'
import { recognizeImage, OutputFormat } from '../src/ocr'
import { createNotionClipboardData, NOTION_BLOCKS_MIME_TYPE } from '../src/notion-clipboard'

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log('Usage: GEMINI_API_KEY=xxx npx tsx scripts/test-ocr.ts <image-path> [format]')
    console.log('')
    console.log('Formats: text, markdown, latex-notion, latex-notion-md, latex-obsidian, structured')
    console.log('')
    console.log('Example:')
    console.log('  GEMINI_API_KEY=xxx npx tsx scripts/test-ocr.ts tests/fixtures/notion-multiblock-equaiton.png latex-notion')
    process.exit(1)
  }

  const imagePath = args[0]
  const format = (args[1] || 'latex-notion') as OutputFormat
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_CLEANCLIP_API_KEY

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY or VITE_CLEANCLIP_API_KEY environment variable is required')
    process.exit(1)
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Error: Image file not found: ${imagePath}`)
    process.exit(1)
  }

  console.log('🔍 OCR Test CLI')
  console.log('================')
  console.log(`📁 Image: ${imagePath}`)
  console.log(`📝 Format: ${format}`)
  console.log('')

  // Load image
  const imageBuffer = fs.readFileSync(imagePath)
  const ext = path.extname(imagePath).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png'
  const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`

  console.log(`📊 Image size: ${imageBuffer.length} bytes`)
  console.log('')

  try {
    console.log('🚀 Calling Gemini API...')
    const result = await recognizeImage(base64Image, format, apiKey)

    console.log('')
    console.log('✅ OCR Result:')
    console.log('─'.repeat(50))
    console.log(result.text)
    console.log('─'.repeat(50))
    console.log('')

    // Generate Notion clipboard data
    if (format === 'latex-notion' || format === 'latex-notion-md') {
      console.log('📋 Notion Clipboard Data:')
      console.log('─'.repeat(50))

      const notionData = createNotionClipboardData(result.text)

      console.log(`MIME Type: ${NOTION_BLOCKS_MIME_TYPE}`)
      console.log(`Block count: ${notionData.blocks.length}`)
      console.log('')

      notionData.blocks.forEach((block, i: number) => {
        const preview = block.properties?.title?.[0]?.[0]?.substring(0, 60) || ''
        console.log(`  [${i}] ${block.type}: ${preview}${preview.length >= 60 ? '...' : ''}`)
      })

      console.log('')
      console.log('Full JSON:')
      console.log(JSON.stringify(notionData, null, 2))
      console.log('─'.repeat(50))
    }

    // Summary
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - Text length: ${result.text.length} chars`)
    console.log(`   - Timestamp: ${new Date(result.timestamp).toISOString()}`)

  } catch (error) {
    console.error('')
    console.error('❌ OCR Failed:')
    console.error(error)
    process.exit(1)
  }
}

main()
