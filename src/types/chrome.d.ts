// Chrome Extension API type declarations for CleanClip
// This provides basic type support for chrome.storage.local

declare const chrome: {
  storage: {
    local: {
      get(keys: string | string[] | Record<string, any>): Promise<Record<string, any>>
      set(items: Record<string, any>): Promise<void>
      clear(): Promise<void>
    }
  }
} | undefined

export {}
