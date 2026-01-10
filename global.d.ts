// Chrome Extension API type declarations for CleanClip
// This provides basic type support for chrome.storage.local and chrome.contextMenus

declare const chrome: {
  storage: {
    local: {
      get(keys: string | string[] | Record<string, any>): Promise<Record<string, any>>
      set(items: Record<string, any>): Promise<void>
      clear(): Promise<void>
    }
  }
  runtime: {
    onInstalled: {
      addListener(callback: () => void): void
    }
  }
  contextMenus: {
    create(options: {
      id?: string
      title: string
      contexts?: string[]
    }): void
    onClicked: {
      addListener(callback: (info: { srcUrl?: string }, tab: any) => void): void
    }
  }
} | undefined
