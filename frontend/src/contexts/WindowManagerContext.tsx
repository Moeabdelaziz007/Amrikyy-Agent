/**
 * Window Manager Context
 * Global state management for all windows in the Desktop OS
 * 
 * @author CURSERO AI
 * @created 2025-10-21
 * @v0-integrated Yes
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  WindowManagerContextValue,
  WindowManagerState,
  WindowInternalState,
  WindowPosition,
  WindowSize,
  WindowState as WinState
} from '@/types/window.types';

// ============================================
// CONTEXT CREATION
// ============================================

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface WindowManagerProviderProps {
  children: ReactNode;
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  // ==================== State ====================
  const [state, setState] = useState<WindowManagerState>({
    windows: new Map(),
    focusedWindowId: null,
    nextZIndex: 1000
  });

  // ==================== Actions ====================

  /**
   * Register a new window
   */
  const registerWindow = useCallback((id: string, props: Partial<WindowInternalState>) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const newWindow: WindowInternalState = {
        id,
        title: props.title || 'Untitled Window',
        position: props.position || { x: 100, y: 100 },
        size: props.size || { width: 800, height: 600 },
        state: props.state || WinState.NORMAL,
        zIndex: prev.nextZIndex,
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
        isFullscreen: false
      };

      newWindows.set(id, newWindow);

      return {
        windows: newWindows,
        focusedWindowId: id,
        nextZIndex: prev.nextZIndex + 1
      };
    });
  }, []);

  /**
   * Unregister a window
   */
  const unregisterWindow = useCallback((id: string) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      newWindows.delete(id);

      // Focus another window if this was focused
      let newFocusedId = prev.focusedWindowId;
      if (prev.focusedWindowId === id) {
        const remainingWindows = Array.from(newWindows.values());
        newFocusedId = remainingWindows.length > 0 
          ? remainingWindows[remainingWindows.length - 1].id 
          : null;
      }

      return {
        ...prev,
        windows: newWindows,
        focusedWindowId: newFocusedId
      };
    });
  }, []);

  /**
   * Focus a window
   */
  const focusWindow = useCallback((id: string) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      
      // Unfocus all windows
      newWindows.forEach((win, winId) => {
        newWindows.set(winId, { ...win, isFocused: false });
      });

      // Focus target window and bring to front
      const targetWindow = newWindows.get(id);
      if (targetWindow) {
        newWindows.set(id, {
          ...targetWindow,
          isFocused: true,
          zIndex: prev.nextZIndex
        });
      }

      return {
        windows: newWindows,
        focusedWindowId: id,
        nextZIndex: prev.nextZIndex + 1
      };
    });
  }, []);

  /**
   * Minimize a window
   */
  const minimizeWindow = useCallback((id: string) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const window = newWindows.get(id);
      
      if (window) {
        newWindows.set(id, {
          ...window,
          isMinimized: true,
          state: WinState.MINIMIZED
        });
      }

      return { ...prev, windows: newWindows };
    });
  }, []);

  /**
   * Maximize a window
   */
  const maximizeWindow = useCallback((id: string) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const window = newWindows.get(id);
      
      if (window) {
        newWindows.set(id, {
          ...window,
          isMaximized: true,
          isMinimized: false,
          state: WinState.MAXIMIZED
        });
      }

      return { ...prev, windows: newWindows };
    });
  }, []);

  /**
   * Restore a window to normal state
   */
  const restoreWindow = useCallback((id: string) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const window = newWindows.get(id);
      
      if (window) {
        newWindows.set(id, {
          ...window,
          isMaximized: false,
          isMinimized: false,
          state: WinState.NORMAL
        });
      }

      return { ...prev, windows: newWindows };
    });
  }, []);

  /**
   * Close a window
   */
  const closeWindow = useCallback((id: string) => {
    unregisterWindow(id);
  }, [unregisterWindow]);

  /**
   * Update window position
   */
  const updateWindowPosition = useCallback((id: string, position: WindowPosition) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const window = newWindows.get(id);
      
      if (window) {
        newWindows.set(id, { ...window, position });
      }

      return { ...prev, windows: newWindows };
    });
  }, []);

  /**
   * Update window size
   */
  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setState(prev => {
      const newWindows = new Map(prev.windows);
      const window = newWindows.get(id);
      
      if (window) {
        newWindows.set(id, { ...window, size });
      }

      return { ...prev, windows: newWindows };
    });
  }, []);

  /**
   * Get window state
   */
  const getWindowState = useCallback((id: string) => {
    return state.windows.get(id);
  }, [state.windows]);

  /**
   * Get all windows
   */
  const getAllWindows = useCallback(() => {
    return Array.from(state.windows.values());
  }, [state.windows]);

  /**
   * Get focused window
   */
  const getFocusedWindow = useCallback(() => {
    if (!state.focusedWindowId) return null;
    return state.windows.get(state.focusedWindowId) || null;
  }, [state.focusedWindowId, state.windows]);

  // ==================== Context Value ====================
  const value: WindowManagerContextValue = {
    ...state,
    registerWindow,
    unregisterWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
    updateWindowPosition,
    updateWindowSize,
    getWindowState,
    getAllWindows,
    getFocusedWindow
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to access Window Manager context
 * @throws Error if used outside WindowManagerProvider
 */
export function useWindowManager(): WindowManagerContextValue {
  const context = useContext(WindowManagerContext);
  
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  
  return context;
}

// ============================================
// EXPORTS
// ============================================

export { WindowManagerContext };
export type { WindowManagerContextValue };
