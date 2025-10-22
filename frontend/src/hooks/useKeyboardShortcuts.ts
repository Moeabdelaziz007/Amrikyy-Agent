/**
 * useKeyboardShortcuts Hook - Global keyboard shortcuts manager
 *
 * Features:
 * - Cross-platform support (Mac Cmd, Windows/Linux Ctrl)
 * - Multiple key combinations (Cmd+Shift+K, Alt+Tab, etc.)
 * - Prevent default browser shortcuts
 * - Easy to extend and customize
 * - TypeScript support
 *
 * Default Shortcuts:
 * - Cmd/Ctrl+N: New window
 * - Cmd/Ctrl+W: Close window
 * - Cmd/Ctrl+M: Minimize window
 * - Cmd/Ctrl+K: Quick search
 * - Alt+Tab: Switch windows (forward)
 * - Alt+Shift+Tab: Switch windows (backward)
 * - Cmd/Ctrl+,: Settings
 * - Cmd/Ctrl+Q: Quit/Close all
 *
 * @hook
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onNewWindow: () => createWindow(),
 *   onCloseWindow: () => closeActiveWindow(),
 *   onQuickSearch: () => setSearchOpen(true)
 * });
 * ```
 *
 * @author CURSERO AI
 * @created 2025-10-22
 */

import { useEffect, useCallback, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  preventDefault?: boolean;
  description?: string;
}

export interface KeyboardShortcutsConfig {
  // Window Management
  onNewWindow?: () => void;
  onCloseWindow?: () => void;
  onMinimizeWindow?: () => void;
  onMaximizeWindow?: () => void;
  onRestoreWindow?: () => void;

  // Navigation
  onQuickSearch?: () => void;
  onSwitchWindowNext?: () => void;
  onSwitchWindowPrev?: () => void;

  // System
  onSettings?: () => void;
  onQuit?: () => void;
  onRefresh?: () => void;

  // Custom shortcuts
  customShortcuts?: KeyboardShortcut[];

  // Options
  enabled?: boolean;
  debug?: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if Mac platform
 */
const isMac = () => {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
};

/**
 * Get modifier key name (Cmd for Mac, Ctrl for others)
 */
export const getModifierKey = () => {
  return isMac() ? 'Cmd' : 'Ctrl';
};

/**
 * Format shortcut for display
 */
export const formatShortcut = (shortcut: string) => {
  return shortcut
    .replace('Cmd', isMac() ? '⌘' : 'Ctrl')
    .replace('Ctrl', isMac() ? '⌘' : 'Ctrl')
    .replace('Alt', isMac() ? '⌥' : 'Alt')
    .replace('Shift', isMac() ? '⇧' : 'Shift')
    .replace('+', ' ');
};

/**
 * Check if event matches shortcut
 */
const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean => {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const altMatches = shortcut.alt ? event.altKey : !event.altKey;
  const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

  return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
};

// ============================================
// HOOK
// ============================================

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig = {}) {
  const {
    onNewWindow,
    onCloseWindow,
    onMinimizeWindow,
    onMaximizeWindow,
    onRestoreWindow,
    onQuickSearch,
    onSwitchWindowNext,
    onSwitchWindowPrev,
    onSettings,
    onQuit,
    onRefresh,
    customShortcuts = [],
    enabled = true,
    debug = false
  } = config;

  // Store refs to avoid stale closures
  const configRef = useRef(config);
  configRef.current = config;

  /**
   * Build shortcuts array
   */
  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    const shortcuts: KeyboardShortcut[] = [];

    // Cmd/Ctrl+N: New Window
    if (onNewWindow) {
      shortcuts.push({
        key: 'n',
        ctrl: true,
        action: onNewWindow,
        preventDefault: true,
        description: 'New window'
      });
    }

    // Cmd/Ctrl+W: Close Window
    if (onCloseWindow) {
      shortcuts.push({
        key: 'w',
        ctrl: true,
        action: onCloseWindow,
        preventDefault: true,
        description: 'Close window'
      });
    }

    // Cmd/Ctrl+M: Minimize Window
    if (onMinimizeWindow) {
      shortcuts.push({
        key: 'm',
        ctrl: true,
        action: onMinimizeWindow,
        preventDefault: true,
        description: 'Minimize window'
      });
    }

    // Cmd/Ctrl+Shift+M: Maximize Window
    if (onMaximizeWindow) {
      shortcuts.push({
        key: 'm',
        ctrl: true,
        shift: true,
        action: onMaximizeWindow,
        preventDefault: true,
        description: 'Maximize window'
      });
    }

    // Cmd/Ctrl+K: Quick Search
    if (onQuickSearch) {
      shortcuts.push({
        key: 'k',
        ctrl: true,
        action: onQuickSearch,
        preventDefault: true,
        description: 'Quick search'
      });
    }

    // Alt+Tab: Switch Window (Next)
    if (onSwitchWindowNext) {
      shortcuts.push({
        key: 'Tab',
        alt: true,
        action: onSwitchWindowNext,
        preventDefault: true,
        description: 'Switch to next window'
      });
    }

    // Alt+Shift+Tab: Switch Window (Previous)
    if (onSwitchWindowPrev) {
      shortcuts.push({
        key: 'Tab',
        alt: true,
        shift: true,
        action: onSwitchWindowPrev,
        preventDefault: true,
        description: 'Switch to previous window'
      });
    }

    // Cmd/Ctrl+,: Settings
    if (onSettings) {
      shortcuts.push({
        key: ',',
        ctrl: true,
        action: onSettings,
        preventDefault: true,
        description: 'Open settings'
      });
    }

    // Cmd/Ctrl+Q: Quit
    if (onQuit) {
      shortcuts.push({
        key: 'q',
        ctrl: true,
        action: onQuit,
        preventDefault: true,
        description: 'Quit application'
      });
    }

    // Cmd/Ctrl+R: Refresh
    if (onRefresh) {
      shortcuts.push({
        key: 'r',
        ctrl: true,
        action: onRefresh,
        preventDefault: false, // Allow default refresh
        description: 'Refresh'
      });
    }

    // Cmd/Ctrl+Shift+R: Hard Refresh
    if (onRefresh) {
      shortcuts.push({
        key: 'r',
        ctrl: true,
        shift: true,
        action: onRefresh,
        preventDefault: false, // Allow default hard refresh
        description: 'Hard refresh'
      });
    }

    // Add custom shortcuts
    shortcuts.push(...customShortcuts);

    return shortcuts;
  }, [
    onNewWindow,
    onCloseWindow,
    onMinimizeWindow,
    onMaximizeWindow,
    onRestoreWindow,
    onQuickSearch,
    onSwitchWindowNext,
    onSwitchWindowPrev,
    onSettings,
    onQuit,
    onRefresh,
    customShortcuts
  ]);

  /**
   * Handle keyboard event
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const shortcuts = getShortcuts();

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        if (debug) {
          console.log('[KeyboardShortcuts] Triggered:', {
            key: shortcut.key,
            ctrl: shortcut.ctrl,
            alt: shortcut.alt,
            shift: shortcut.shift,
            meta: shortcut.meta,
            description: shortcut.description
          });
        }

        if (shortcut.preventDefault) {
          event.preventDefault();
        }

        shortcut.action();
        break; // Only trigger first matching shortcut
      }
    }
  }, [enabled, getShortcuts, debug]);

  /**
   * Register keyboard event listener
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    if (debug) {
      console.log('[KeyboardShortcuts] Registered shortcuts:', getShortcuts().map(s => ({
        key: s.key,
        ctrl: s.ctrl,
        alt: s.alt,
        shift: s.shift,
        description: s.description
      })));
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (debug) {
        console.log('[KeyboardShortcuts] Unregistered');
      }
    };
  }, [enabled, handleKeyDown, debug, getShortcuts]);

  /**
   * Get all registered shortcuts (useful for help/settings UI)
   */
  const getAllShortcuts = useCallback(() => {
    return getShortcuts();
  }, [getShortcuts]);

  return {
    shortcuts: getAllShortcuts(),
    formatShortcut,
    getModifierKey
  };
}

// ============================================
// EXPORTS
// ============================================

export default useKeyboardShortcuts;

/**
 * Helper hook for Quick Search shortcut only
 */
export function useQuickSearchShortcut(onOpen: () => void) {
  return useKeyboardShortcuts({
    onQuickSearch: onOpen
  });
}

/**
 * Helper hook for Window Management shortcuts
 */
export function useWindowManagementShortcuts(callbacks: {
  onNew?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}) {
  return useKeyboardShortcuts({
    onNewWindow: callbacks.onNew,
    onCloseWindow: callbacks.onClose,
    onMinimizeWindow: callbacks.onMinimize,
    onMaximizeWindow: callbacks.onMaximize
  });
}

/**
 * Get all default shortcuts as readable strings
 */
export function getDefaultShortcuts() {
  const mod = getModifierKey();
  return {
    newWindow: `${mod}+N`,
    closeWindow: `${mod}+W`,
    minimizeWindow: `${mod}+M`,
    maximizeWindow: `${mod}+Shift+M`,
    quickSearch: `${mod}+K`,
    switchWindowNext: 'Alt+Tab',
    switchWindowPrev: 'Alt+Shift+Tab',
    settings: `${mod}+,`,
    quit: `${mod}+Q`,
    refresh: `${mod}+R`
  };
}
