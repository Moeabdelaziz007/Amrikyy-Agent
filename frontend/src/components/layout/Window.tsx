/**
 * Window Component - Desktop OS Experience
 * Glassmorphism + Framer Motion + Full Window Management
 * 
 * @component
 * @example
 * ```tsx
 * <Window
 *   id="app-1"
 *   title="My Application"
 *   initialPosition={{ x: 100, y: 100 }}
 *   initialSize={{ width: 800, height: 600 }}
 * >
 *   <YourAppContent />
 * </Window>
 * ```
 * 
 * @author CURSERO AI
 * @created 2025-10-21
 * @v0-integrated Yes
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Minus,
  Square,
  GripVertical 
} from 'lucide-react';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import type { 
  WindowProps, 
  WindowPosition, 
  WindowSize, 
  ResizeHandle,
  DragData 
} from '@/types/window.types';

// ============================================
// WINDOW COMPONENT
// ============================================

export function Window({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  minSize = { width: 300, height: 200 },
  maxSize,
  resizable = true,
  draggable = true,
  minimizable = true,
  maximizable = true,
  closable = true,
  icon,
  className = '',
  glassIntensity = 0.8,
  variant = 'default',
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  titleBarContent,
  hideDefaultTitleBar = false,
  modal = false
}: WindowProps) {
  
  // ==================== Window Manager ====================
  const windowManager = useWindowManager();
  const windowState = windowManager.getWindowState(id);

  // ==================== Local State ====================
  const [position, setPosition] = useState<WindowPosition>(initialPosition);
  const [size, setSize] = useState<WindowSize>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Save position before maximize for restore
  const [savedPosition, setSavedPosition] = useState<WindowPosition>(initialPosition);
  const [savedSize, setSavedSize] = useState<WindowSize>(initialSize);

  // Refs
  const windowRef = useRef<HTMLDivElement>(null);
  const dragDataRef = useRef<DragData | null>(null);

  // Motion values for smooth animations
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // ==================== Effects ====================

  /**
   * Register window on mount
   */
  useEffect(() => {
    windowManager.registerWindow(id, {
      title,
      position: initialPosition,
      size: initialSize
    });

    return () => {
      windowManager.unregisterWindow(id);
    };
  }, [id]); // Only run on mount/unmount

  /**
   * Sync position with motion values
   */
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position, x, y]);

  // ==================== Computed Values ====================

  const isMaximized = windowState?.isMaximized || false;
  const isMinimized = windowState?.isMinimized || false;
  const isFocused = windowState?.isFocused || false;
  const zIndex = windowState?.zIndex || 1000;

  // ==================== Handlers ====================

  /**
   * Handle window focus
   */
  const handleFocus = useCallback(() => {
    windowManager.focusWindow(id);
    onFocus?.();
  }, [id, windowManager, onFocus]);

  /**
   * Handle minimize
   */
  const handleMinimize = useCallback(() => {
    windowManager.minimizeWindow(id);
    onMinimize?.();
  }, [id, windowManager, onMinimize]);

  /**
   * Handle maximize/restore
   */
  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      // Restore
      windowManager.restoreWindow(id);
      setPosition(savedPosition);
      setSize(savedSize);
    } else {
      // Maximize
      setSavedPosition(position);
      setSavedSize(size);
      windowManager.maximizeWindow(id);
      
      // Full screen size
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;
      
      setPosition({ x: 0, y: 0 });
      setSize({ width: fullWidth, height: fullHeight });
    }
    onMaximize?.();
  }, [id, isMaximized, position, size, savedPosition, savedSize, windowManager, onMaximize]);

  /**
   * Handle close
   */
  const handleClose = useCallback(() => {
    windowManager.closeWindow(id);
    onClose?.();
  }, [id, windowManager, onClose]);

  /**
   * Handle drag
   */
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (!draggable || isMaximized) return;

    const newPosition = {
      x: position.x + info.delta.x,
      y: position.y + info.delta.y
    };

    setPosition(newPosition);
    windowManager.updateWindowPosition(id, newPosition);
    onPositionChange?.(newPosition);
  }, [draggable, isMaximized, position, id, windowManager, onPositionChange]);

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    handleFocus();
  }, [handleFocus]);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Start resize
   */
  const startResize = useCallback((handle: ResizeHandle, e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    handleFocus();

    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      handle
    };

    // Add global mouse move/up listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [resizable, size, handleFocus]);

  /**
   * Handle resize move
   */
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!dragDataRef.current || !resizable) return;

    const { startX, startY, startWidth, startHeight, handle } = dragDataRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = position.x;
    let newY = position.y;

    // Calculate new dimensions based on resize handle
    if (handle?.includes('e')) {
      newWidth = Math.max(minSize.width, startWidth + deltaX);
      if (maxSize) newWidth = Math.min(maxSize.width, newWidth);
    }
    if (handle?.includes('w')) {
      newWidth = Math.max(minSize.width, startWidth - deltaX);
      if (maxSize) newWidth = Math.min(maxSize.width, newWidth);
      newX = position.x + (startWidth - newWidth);
    }
    if (handle?.includes('s')) {
      newHeight = Math.max(minSize.height, startHeight + deltaY);
      if (maxSize) newHeight = Math.min(maxSize.height, newHeight);
    }
    if (handle?.includes('n')) {
      newHeight = Math.max(minSize.height, startHeight - deltaY);
      if (maxSize) newHeight = Math.min(maxSize.height, newHeight);
      newY = position.y + (startHeight - newHeight);
    }

    const newSize: WindowSize = { width: newWidth, height: newHeight };
    const newPosition: WindowPosition = { x: newX, y: newY };

    setSize(newSize);
    setPosition(newPosition);
    windowManager.updateWindowSize(id, newSize);
    windowManager.updateWindowPosition(id, newPosition);
    onSizeChange?.(newSize);
    onPositionChange?.(newPosition);
  }, [resizable, position, minSize, maxSize, id, windowManager, onSizeChange, onPositionChange]);

  /**
   * Handle resize end
   */
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    dragDataRef.current = null;
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  // ==================== Styles ====================

  const glassStyles = {
    background: `rgba(255, 255, 255, ${glassIntensity * 0.1})`,
    backdropFilter: `blur(${glassIntensity * 20}px)`,
    WebkitBackdropFilter: `blur(${glassIntensity * 20}px)`,
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: isMaximized 
      ? 'none'
      : isFocused
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        : '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
  };

  const variantStyles = {
    default: '',
    primary: 'border-blue-500/30',
    accent: 'border-purple-500/30',
    transparent: 'bg-transparent backdrop-blur-none'
  };

  // ==================== Render Conditions ====================

  // Don't render if minimized
  if (isMinimized) {
    return null;
  }

  // ==================== Render ====================

  return (
    <motion.div
      ref={windowRef}
      className={`
        fixed overflow-hidden rounded-xl
        ${variantStyles[variant]}
        ${isFocused ? 'ring-2 ring-blue-500/50' : ''}
        ${modal ? 'shadow-2xl' : ''}
        ${className}
      `}
      style={{
        ...glassStyles,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? '100vh' : size.height,
        zIndex,
        x: isMaximized ? 0 : x,
        y: isMaximized ? 0 : y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      drag={draggable && !isMaximized}
      dragMomentum={false}
      dragElastic={0}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleFocus}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title Bar */}
      {!hideDefaultTitleBar && (
        <div
          className="
            flex items-center justify-between
            px-4 py-2 
            bg-gradient-to-r from-slate-800/50 to-slate-900/50
            border-b border-white/10
            cursor-move
            select-none
          "
          onDoubleClick={maximizable ? handleMaximize : undefined}
        >
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <h3 className="text-sm font-semibold text-white truncate">
              {title}
            </h3>
            {titleBarContent}
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-2">
            {minimizable && (
              <button
                onClick={handleMinimize}
                className="
                  p-1.5 rounded-md
                  hover:bg-white/10
                  transition-colors
                  text-gray-300 hover:text-white
                "
                aria-label="Minimize"
              >
                <Minus size={16} />
              </button>
            )}
            
            {maximizable && (
              <button
                onClick={handleMaximize}
                className="
                  p-1.5 rounded-md
                  hover:bg-white/10
                  transition-colors
                  text-gray-300 hover:text-white
                "
                aria-label={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 size={16} /> : <Square size={16} />}
              </button>
            )}
            
            {closable && (
              <button
                onClick={handleClose}
                className="
                  p-1.5 rounded-md
                  hover:bg-red-500/80
                  transition-colors
                  text-gray-300 hover:text-white
                "
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="h-full overflow-auto bg-slate-900/30">
        {children}
      </div>

      {/* Resize Handles */}
      {resizable && !isMaximized && (
        <>
          {/* Edges */}
          <ResizeHandle position="n" onMouseDown={(e) => startResize('n', e)} />
          <ResizeHandle position="s" onMouseDown={(e) => startResize('s', e)} />
          <ResizeHandle position="e" onMouseDown={(e) => startResize('e', e)} />
          <ResizeHandle position="w" onMouseDown={(e) => startResize('w', e)} />
          
          {/* Corners */}
          <ResizeHandle position="ne" onMouseDown={(e) => startResize('ne', e)} />
          <ResizeHandle position="nw" onMouseDown={(e) => startResize('nw', e)} />
          <ResizeHandle position="se" onMouseDown={(e) => startResize('se', e)} />
          <ResizeHandle position="sw" onMouseDown={(e) => startResize('sw', e)} />
        </>
      )}
    </motion.div>
  );
}

// ============================================
// RESIZE HANDLE SUB-COMPONENT
// ============================================

interface ResizeHandleProps {
  position: ResizeHandle;
  onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  const positionStyles: Record<ResizeHandle, string> = {
    n: 'top-0 left-0 right-0 h-1 cursor-ns-resize',
    s: 'bottom-0 left-0 right-0 h-1 cursor-ns-resize',
    e: 'right-0 top-0 bottom-0 w-1 cursor-ew-resize',
    w: 'left-0 top-0 bottom-0 w-1 cursor-ew-resize',
    ne: 'top-0 right-0 w-3 h-3 cursor-nesw-resize',
    nw: 'top-0 left-0 w-3 h-3 cursor-nwse-resize',
    se: 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize',
    sw: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize'
  };

  return (
    <div
      className={`absolute ${positionStyles[position]} hover:bg-blue-500/30 transition-colors`}
      onMouseDown={onMouseDown}
    />
  );
}

// ============================================
// DISPLAY NAME
// ============================================

Window.displayName = 'Window';

export default Window;
