/**
 * Window Types - Type definitions for Window Manager
 * @author Ona AI
 * @created 2025-10-21
 */

import { ReactNode } from 'react';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export type WindowState = 'normal' | 'minimized' | 'maximized' | 'closed';

export interface WindowData {
  id: string;
  title: string;
  state: WindowState;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive: boolean;
}

export interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  initialPosition?: WindowPosition;
  initialSize?: WindowSize;
  minSize?: WindowSize;
  maxSize?: WindowSize;
  resizable?: boolean;
  draggable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  icon?: ReactNode;
  className?: string;
  glassIntensity?: number;
  variant?: 'default' | 'dark' | 'light';
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onPositionChange?: (position: WindowPosition) => void;
  onSizeChange?: (size: WindowSize) => void;
  titleBarContent?: ReactNode;
  hideDefaultTitleBar?: boolean;
  modal?: boolean;
}

export type ResizeHandle = 
  | 'n' | 's' | 'e' | 'w' 
  | 'ne' | 'nw' | 'se' | 'sw';

export interface DragData {
  startX: number;
  startY: number;
  startPosition: WindowPosition;
}
