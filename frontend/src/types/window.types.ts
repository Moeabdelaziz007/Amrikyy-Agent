/**
 * Window Manager Type Definitions
 * For Desktop OS Experience in AMRIKYY AI OS
 * 
 * @author CURSERO AI
 * @created 2025-10-21
 * @v0-integrated Yes
 */

import { ReactNode } from 'react';

/**
 * Window position coordinates
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Window dimensions
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Window state enumeration
 */
export enum WindowState {
  NORMAL = 'normal',
  MINIMIZED = 'minimized',
  MAXIMIZED = 'maximized',
  FULLSCREEN = 'fullscreen'
}

/**
 * Window z-index management
 */
export type WindowZIndex = number;

/**
 * Window properties
 */
export interface WindowProps {
  /**
   * Unique window identifier
   */
  id: string;

  /**
   * Window title displayed in title bar
   */
  title: string;

  /**
   * Window content
   */
  children: ReactNode;

  /**
   * Initial position (defaults to center)
   */
  initialPosition?: WindowPosition;

  /**
   * Initial size
   */
  initialSize?: WindowSize;

  /**
   * Initial window state
   */
  initialState?: WindowState;

  /**
   * Minimum window size
   */
  minSize?: WindowSize;

  /**
   * Maximum window size
   */
  maxSize?: WindowSize;

  /**
   * Is window resizable?
   */
  resizable?: boolean;

  /**
   * Is window draggable?
   */
  draggable?: boolean;

  /**
   * Can window be minimized?
   */
  minimizable?: boolean;

  /**
   * Can window be maximized?
   */
  maximizable?: boolean;

  /**
   * Can window be closed?
   */
  closable?: boolean;

  /**
   * Window icon (for title bar)
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Glassmorphism intensity (0-1)
   * @default 0.8
   */
  glassIntensity?: number;

  /**
   * Window theme variant
   */
  variant?: 'default' | 'primary' | 'accent' | 'transparent';

  /**
   * Callback when window is closed
   */
  onClose?: () => void;

  /**
   * Callback when window is minimized
   */
  onMinimize?: () => void;

  /**
   * Callback when window is maximized
   */
  onMaximize?: () => void;

  /**
   * Callback when window is focused
   */
  onFocus?: () => void;

  /**
   * Callback when window position changes
   */
  onPositionChange?: (position: WindowPosition) => void;

  /**
   * Callback when window size changes
   */
  onSizeChange?: (size: WindowSize) => void;

  /**
   * Custom title bar content
   */
  titleBarContent?: ReactNode;

  /**
   * Hide default title bar?
   */
  hideDefaultTitleBar?: boolean;

  /**
   * Show in taskbar?
   */
  showInTaskbar?: boolean;

  /**
   * Window z-index
   */
  zIndex?: WindowZIndex;

  /**
   * Is window modal?
   */
  modal?: boolean;
}

/**
 * Window internal state
 */
export interface WindowInternalState {
  id: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  state: WindowState;
  zIndex: WindowZIndex;
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
}

/**
 * Window manager context state
 */
export interface WindowManagerState {
  windows: Map<string, WindowInternalState>;
  focusedWindowId: string | null;
  nextZIndex: number;
}

/**
 * Window manager actions
 */
export interface WindowManagerActions {
  /**
   * Register a new window
   */
  registerWindow: (id: string, props: Partial<WindowInternalState>) => void;

  /**
   * Unregister a window
   */
  unregisterWindow: (id: string) => void;

  /**
   * Focus a window
   */
  focusWindow: (id: string) => void;

  /**
   * Minimize a window
   */
  minimizeWindow: (id: string) => void;

  /**
   * Maximize a window
   */
  maximizeWindow: (id: string) => void;

  /**
   * Restore a window to normal state
   */
  restoreWindow: (id: string) => void;

  /**
   * Close a window
   */
  closeWindow: (id: string) => void;

  /**
   * Update window position
   */
  updateWindowPosition: (id: string, position: WindowPosition) => void;

  /**
   * Update window size
   */
  updateWindowSize: (id: string, size: WindowSize) => void;

  /**
   * Get window state
   */
  getWindowState: (id: string) => WindowInternalState | undefined;

  /**
   * Get all windows
   */
  getAllWindows: () => WindowInternalState[];

  /**
   * Get focused window
   */
  getFocusedWindow: () => WindowInternalState | null;
}

/**
 * Window manager context value
 */
export interface WindowManagerContextValue extends WindowManagerState, WindowManagerActions {}

/**
 * Resize handle position
 */
export type ResizeHandle = 
  | 'n'  // North (top)
  | 's'  // South (bottom)
  | 'e'  // East (right)
  | 'w'  // West (left)
  | 'ne' // North-East (top-right)
  | 'nw' // North-West (top-left)
  | 'se' // South-East (bottom-right)
  | 'sw'; // South-West (bottom-left)

/**
 * Drag data
 */
export interface DragData {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  handle?: ResizeHandle;
}
