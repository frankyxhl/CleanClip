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
  }
  scripting: {
    executeScript(options: {
      target: { tabId: number }
      files: string[]
    }): Promise<any[]>
  }
} | undefined
