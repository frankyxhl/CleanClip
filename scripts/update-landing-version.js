#!/usr/bin/env node
/**
 * Update landing page version number
 * Called by semantic-release during the prepare step
 *
 * Usage: node scripts/update-landing-version.js <version>
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const version = process.argv[2];

if (!version) {
  console.error('Usage: node update-landing-version.js <version>');
  process.exit(1);
}

const landingPath = join(__dirname, '..', 'landing', 'index.html');

try {
  let html = readFileSync(landingPath, 'utf8');

  // Update download link: href="CleanClip-X.X.X.zip"
  html = html.replace(
    /href="CleanClip-[\d.]+\.zip"/g,
    `href="CleanClip-${version}.zip"`
  );

  // Update version display: Version X.X.X
  html = html.replace(
    /Version [\d.]+/g,
    `Version ${version}`
  );

  writeFileSync(landingPath, html, 'utf8');
  console.log(`✅ Updated landing page to version ${version}`);
} catch (error) {
  console.error('Failed to update landing page:', error.message);
  process.exit(1);
}
