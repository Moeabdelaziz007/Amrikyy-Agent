/**
 * Window Manager Context - Global state for window management
 * @author Ona AI
 * @created 2025-10-21
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { WindowData, WindowState, WindowPosition, WindowSize } from '@/types/window.types';

interface WindowManagerContextType {
  windows: Map<string, WindowData>;
  registerWindow: (id: string, data: Omit<WindowData, 'zIndex' | 'isActive'>) => void;
  unregisterWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  getWindowState: (id: string) => WindowData | undefined;
  getActiveWindow: () => WindowData | undefined;
  getAllWindows: () => WindowData[];
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Map<string, WindowData>>(new Map());
  const [maxZIndex, setMaxZIndex] = useState(1000);

  const registerWindow = useCallback((id: string, data: Omit<WindowData, 'zIndex' | 'isActive'>) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      newWindows.set(id, {
        ...data,
        zIndex: maxZIndex + 1,
        isActive: true
      });
      return newWindows;
    });
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const unregisterWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      newWindows.delete(id);
      return newWindows;
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      // Deactivate all windows
      newWindows.forEach((w, wId) => {
        if (wId !== id) {
          newWindows.set(wId, { ...w, isActive: false });
        }
      });

      // Activate and bring to front
      newWindows.set(id, {
        ...window,
        isActive: true,
        zIndex: maxZIndex + 1
      });

      return newWindows;
    });
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      newWindows.set(id, {
        ...window,
        state: 'minimized',
        isActive: false
      });

      return newWindows;
    });
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      const newState: WindowState = window.state === 'maximized' ? 'normal' : 'maximized';
      
      newWindows.set(id, {
        ...window,
        state: newState
      });

      return newWindows;
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      newWindows.set(id, {
        ...window,
        state: 'closed'
      });

      // Remove after animation
      setTimeout(() => {
        setWindows(current => {
          const updated = new Map(current);
          updated.delete(id);
          return updated;
        });
      }, 300);

      return newWindows;
    });
  }, []);

  const updateWindowPosition = useCallback((id: string, position: WindowPosition) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      newWindows.set(id, {
        ...window,
        position
      });

      return newWindows;
    });
  }, []);

  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(id);
      if (!window) return prev;

      newWindows.set(id, {
        ...window,
        size
      });

      return newWindows;
    });
  }, []);

  const getWindowState = useCallback((id: string) => {
    return windows.get(id);
  }, [windows]);

  const getActiveWindow = useCallback(() => {
    let activeWindow: WindowData | undefined;
    let maxZ = -1;

    windows.forEach(window => {
      if (window.isActive && window.zIndex > maxZ) {
        maxZ = window.zIndex;
        activeWindow = window;
      }
    });

    return activeWindow;
  }, [windows]);

  const getAllWindows = useCallback(() => {
    return Array.from(windows.values());
  }, [windows]);

  const value: WindowManagerContextType = {
    windows,
    registerWindow,
    unregisterWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    updateWindowPosition,
    updateWindowSize,
    getWindowState,
    getActiveWindow,
    getAllWindows
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  return context;
}
