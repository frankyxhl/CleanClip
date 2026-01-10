import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    environmentOptions: {
      happyDOM: {
        settings: {
          navigator: {
            userAgent: 'vitest'
          }
        }
      }
    }
  },
  testEnvironmentMatchGlobs: [
    ['**/history.test.ts', 'happy-dom']
  ]
})
