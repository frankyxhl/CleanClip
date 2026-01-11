import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        'offscreen/clipboard': './src/offscreen/clipboard.html',
        // Explicitly define popup and options as entry points
        'src/popup/index': './src/popup/index.html',
        'src/options/index': './src/options/index.html'
      },
      output: {
        // Disable module preloading for service worker compatibility
        manualChunks: undefined
      }
    },
    // Disable module preloading polyfill
    modulePreload: false
  }
})
