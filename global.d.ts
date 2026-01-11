// Chrome Extension API type declarations for CleanClip
// This provides basic type support for chrome.storage.local, chrome.contextMenus, chrome.commands, and chrome.scripting

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
    onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void
    }
    sendMessage(message: any): Promise<any>
    getURL(path: string): string
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
  commands: {
    onCommand: {
      addListener(callback: (command: string, tab?: any) => void): void
    }
  }
  tabs: {
    captureVisibleTab(
      windowId: number | null,
      options: { format: 'png' | 'jpeg' }
    ): Promise<string>
    sendMessage(tabId: number, message: any): Promise<any>
  }
  scripting: {
    executeScript(options: {
      target: { tabId: number }
      files: string[]
    }): Promise<any[]>
  }
  notifications: {
    create(options: {
      type?: 'basic' | 'image' | 'list' | 'progress'
      iconUrl?: string
      title: string
      message: string
      priority?: number
    }): void
  }
  offscreen: {
    createDocument(options: {
      url: string
      reasons: ('CLIPBOARD' | 'MEDIA' | 'DISPLAY_MEDIA' | 'BLOBS' | 'USER_MEDIA' | 'DISPLAY_CAPTURE' | 'FOCUS')[]
      justification: string
    }): Promise<void>
    closeDocument(): Promise<void>
    hasDocument(): boolean
  }
} | undefined
