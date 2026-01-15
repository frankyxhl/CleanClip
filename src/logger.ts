/**
 * Logger module for CleanClip
 * Provides debug/info logging controlled by VITE_CLEANCLIP_DEBUG environment variable
 * console.error remains unchanged for error visibility
 */

const DEBUG = import.meta.env.VITE_CLEANCLIP_DEBUG === 'true'

export const logger = {
  /**
   * Debug logging - only outputs when VITE_CLEANCLIP_DEBUG=true
   */
  debug: (...args: unknown[]): void => {
    if (DEBUG) {
      console.log('[CleanClip]', ...args)
    }
  },

  /**
   * Info logging - only outputs when VITE_CLEANCLIP_DEBUG=true
   */
  info: (...args: unknown[]): void => {
    if (DEBUG) {
      console.info('[CleanClip]', ...args)
    }
  },

  /**
   * Warning logging - always outputs regardless of debug setting
   * Used for important warnings that users should see
   */
  warn: (...args: unknown[]): void => {
    console.warn('[CleanClip]', ...args)
  }
}
