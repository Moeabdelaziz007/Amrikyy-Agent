/**
 * Keyboard Shortcuts Hook - Window Management
 * 
 * Shortcuts:
 * - Cmd+N / Ctrl+N: New window
 * - Cmd+W / Ctrl+W: Close window
 * - Cmd+M / Ctrl+M: Minimize window
 * - Cmd+K / Ctrl+K: Quick search
 * - Alt+Tab: Switch windows
 * - Cmd+Q / Ctrl+Q: Close all windows
 * - Cmd+, / Ctrl+,: Open settings
 * - Esc: Close dialog/modal
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcutHandlers {
  onNewWindow?: () => void
  onCloseWindow?: () => void
  onMinimizeWindow?: () => void
  onMaximizeWindow?: () => void
  onQuickSearch?: () => void
  onSwitchWindow?: (direction: 'next' | 'prev') => void
  onCloseAllWindows?: () => void
  onOpenSettings?: () => void
  onEscape?: () => void
  onFocusWindow?: (index: number) => void
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  handlers: KeyboardShortcutHandlers
  preventDefault?: boolean
}

/**
 * Detect if user is on Mac
 */
const isMac = typeof navigator !== 'undefined' && 
  navigator.platform.toUpperCase().indexOf('MAC') >= 0

/**
 * Check if modifier key is pressed (Cmd on Mac, Ctrl on Windows/Linux)
 */
const isModKey = (event: KeyboardEvent): boolean => {
  return isMac ? event.metaKey : event.ctrlKey
}

/**
 * Check if a key combination matches
 */
const matchesShortcut = (
  event: KeyboardEvent,
  key: string,
  modifiers: {
    mod?: boolean
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
  } = {}
): boolean => {
  const keyMatches = event.key.toLowerCase() === key.toLowerCase()
  const modMatches = modifiers.mod ? isModKey(event) : !isModKey(event)
  const ctrlMatches = modifiers.ctrl ? event.ctrlKey : !event.ctrlKey
  const altMatches = modifiers.alt ? event.altKey : !event.altKey
  const shiftMatches = modifiers.shift ? event.shiftKey : !event.shiftKey

  return keyMatches && 
    (modifiers.mod === undefined || modMatches) &&
    (modifiers.ctrl === undefined || ctrlMatches) &&
    (modifiers.alt === undefined || altMatches) &&
    (modifiers.shift === undefined || shiftMatches)
}

/**
 * Check if user is typing in an input field
 */
const isTyping = (): boolean => {
  const activeElement = document.activeElement
  const tagName = activeElement?.tagName.toLowerCase()
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    (activeElement as HTMLElement)?.isContentEditable === true
  )
}

/**
 * Custom hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { 
    enabled = true, 
    handlers, 
    preventDefault = true 
  } = options

  // Track if Alt+Tab is active for window switching
  const altTabActive = useRef(false)
  const switchWindowTimeout = useRef<NodeJS.Timeout>()

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't intercept shortcuts when typing (except for Cmd+K and Esc)
    const typing = isTyping()
    if (typing && 
        !matchesShortcut(event, 'k', { mod: true }) && 
        !matchesShortcut(event, 'Escape')) {
      return
    }

    // Cmd+N / Ctrl+N: New window
    if (matchesShortcut(event, 'n', { mod: true }) && handlers.onNewWindow) {
      if (preventDefault) event.preventDefault()
      handlers.onNewWindow()
      return
    }

    // Cmd+W / Ctrl+W: Close window
    if (matchesShortcut(event, 'w', { mod: true }) && handlers.onCloseWindow) {
      if (preventDefault) event.preventDefault()
      handlers.onCloseWindow()
      return
    }

    // Cmd+M / Ctrl+M: Minimize window
    if (matchesShortcut(event, 'm', { mod: true }) && handlers.onMinimizeWindow) {
      if (preventDefault) event.preventDefault()
      handlers.onMinimizeWindow()
      return
    }

    // Cmd+Shift+M / Ctrl+Shift+M: Maximize window
    if (matchesShortcut(event, 'm', { mod: true, shift: true }) && handlers.onMaximizeWindow) {
      if (preventDefault) event.preventDefault()
      handlers.onMaximizeWindow()
      return
    }

    // Cmd+K / Ctrl+K: Quick search
    if (matchesShortcut(event, 'k', { mod: true }) && handlers.onQuickSearch) {
      if (preventDefault) event.preventDefault()
      handlers.onQuickSearch()
      return
    }

    // Cmd+Q / Ctrl+Q: Close all windows
    if (matchesShortcut(event, 'q', { mod: true }) && handlers.onCloseAllWindows) {
      if (preventDefault) event.preventDefault()
      handlers.onCloseAllWindows()
      return
    }

    // Cmd+, / Ctrl+,: Open settings
    if (matchesShortcut(event, ',', { mod: true }) && handlers.onOpenSettings) {
      if (preventDefault) event.preventDefault()
      handlers.onOpenSettings()
      return
    }

    // Esc: Close dialog/modal
    if (matchesShortcut(event, 'Escape') && handlers.onEscape) {
      if (preventDefault) event.preventDefault()
      handlers.onEscape()
      return
    }

    // Alt+Tab: Switch windows (next)
    if (event.altKey && event.key === 'Tab' && handlers.onSwitchWindow) {
      if (preventDefault) event.preventDefault()
      
      if (!altTabActive.current) {
        altTabActive.current = true
      }
      
      handlers.onSwitchWindow(event.shiftKey ? 'prev' : 'next')
      
      // Reset Alt+Tab state after a short delay
      clearTimeout(switchWindowTimeout.current)
      switchWindowTimeout.current = setTimeout(() => {
        altTabActive.current = false
      }, 1000)
      
      return
    }

    // Cmd+1-9 / Ctrl+1-9: Focus specific window
    if (isModKey(event) && /^[1-9]$/.test(event.key) && handlers.onFocusWindow) {
      if (preventDefault) event.preventDefault()
      const index = parseInt(event.key) - 1
      handlers.onFocusWindow(index)
      return
    }
  }, [enabled, handlers, preventDefault])

  /**
   * Handle key up events (for Alt release)
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Reset Alt+Tab state when Alt is released
    if (event.key === 'Alt' && altTabActive.current) {
      altTabActive.current = false
      clearTimeout(switchWindowTimeout.current)
    }
  }, [enabled])

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearTimeout(switchWindowTimeout.current)
    }
  }, [enabled, handleKeyDown, handleKeyUp])

  /**
   * Get shortcut display strings
   */
  const getShortcutString = useCallback((
    key: string,
    modifiers: {
      mod?: boolean
      ctrl?: boolean
      alt?: boolean
      shift?: boolean
    } = {}
  ): string => {
    const parts: string[] = []
    
    if (modifiers.mod) parts.push(isMac ? '⌘' : 'Ctrl')
    if (modifiers.ctrl) parts.push('Ctrl')
    if (modifiers.alt) parts.push('Alt')
    if (modifiers.shift) parts.push('Shift')
    
    parts.push(key.toUpperCase())
    
    return parts.join('+')
  }, [])

  return {
    isMac,
    isModKey,
    getShortcutString,
    shortcuts: {
      newWindow: getShortcutString('N', { mod: true }),
      closeWindow: getShortcutString('W', { mod: true }),
      minimizeWindow: getShortcutString('M', { mod: true }),
      maximizeWindow: getShortcutString('M', { mod: true, shift: true }),
      quickSearch: getShortcutString('K', { mod: true }),
      switchWindow: getShortcutString('Tab', { alt: true }),
      closeAllWindows: getShortcutString('Q', { mod: true }),
      openSettings: getShortcutString(',', { mod: true }),
      escape: 'Esc'
    }
  }
}

/**
 * Hook for global keyboard shortcuts (always active)
 */
export function useGlobalShortcuts(handlers: KeyboardShortcutHandlers) {
  return useKeyboardShortcuts({
    enabled: true,
    handlers,
    preventDefault: true
  })
}

/**
 * Hook for window-specific shortcuts (only when window is focused)
 */
export function useWindowShortcuts(
  windowId: string | null,
  handlers: KeyboardShortcutHandlers
) {
  const enabled = windowId !== null
  
  return useKeyboardShortcuts({
    enabled,
    handlers,
    preventDefault: true
  })
}

export default useKeyboardShortcuts
