import React, { useState, useRef, useCallback, memo } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/useAccessibility';
import type { BaseComponentProps } from '@/types/os.types';

/**
 * Split view orientation
 */
export type SplitOrientation = 'horizontal' | 'vertical';

/**
 * Split view props
 */
export interface SplitViewProps extends BaseComponentProps {
  /** Left/top panel content */
  left: React.ReactNode;
  /** Right/bottom panel content */
  right: React.ReactNode;
  /** Split orientation */
  orientation?: SplitOrientation;
  /** Initial split ratio (0-1) */
  initialRatio?: number;
  /** Minimum panel size (px) */
  minSize?: number;
  /** Whether resize is enabled */
  resizable?: boolean;
  /** Resize handler callback */
  onResize?: (ratio: number) => void;
}

/**
 * Tablet split-view component with resizable panels
 *
 * Features:
 * - Horizontal or vertical split
 * - Draggable resize handle
 * - Minimum panel sizes
 * - Snap zones (25%, 50%, 75%)
 * - Touch-optimized handle (44px)
 * - Keyboard resize support
 * - Smooth animations
 *
 * @example
 * ```tsx
 * <SplitView
 *   left={<AppOne />}
 *   right={<AppTwo />}
 *   orientation="horizontal"
 *   initialRatio={0.5}
 *   resizable
 * />
 * ```
 */
export const SplitView = memo<SplitViewProps>(({
  left,
  right,
  orientation = 'horizontal',
  initialRatio = 0.5,
  minSize = 300,
  resizable = true,
  onResize,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  /**
   * Snap zones for better UX
   */
  const snapZones = [0.25, 0.5, 0.75];
  const snapThreshold = 0.05;

  /**
   * Find nearest snap zone
   */
  const findNearestSnap = useCallback((value: number): number => {
    for (const snap of snapZones) {
      if (Math.abs(value - snap) < snapThreshold) {
        return snap;
      }
    }
    return value;
  }, []);

  /**
   * Calculate new ratio from mouse/touch position
   */
  const calculateRatio = useCallback(
    (clientX: number, clientY: number): number => {
      if (!containerRef.current) return ratio;

      const rect = containerRef.current.getBoundingClientRect();
      const isHorizontal = orientation === 'horizontal';
      const total = isHorizontal ? rect.width : rect.height;
      const position = isHorizontal ? clientX - rect.left : clientY - rect.top;

      // Calculate ratio
      let newRatio = position / total;

      // Apply minimum sizes
      const minRatio = minSize / total;
      const maxRatio = 1 - minRatio;
      newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));

      // Apply snap zones
      newRatio = findNearestSnap(newRatio);

      return newRatio;
    },
    [orientation, minSize, ratio, findNearestSnap]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const newRatio = calculateRatio(clientX, clientY);
      setRatio(newRatio);
      onResize?.(newRatio);
    },
    [isDragging, calculateRatio, onResize]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Mouse event handlers
   */
  const handleMouseDown = useCallback(() => {
    handleDragStart();
  }, [handleDragStart]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  /**
   * Touch event handlers
   */
  const handleTouchStart = useCallback(() => {
    handleDragStart();
  }, [handleDragStart]);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  /**
   * Attach global event listeners when dragging
   */
  React.useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  /**
   * Keyboard resize support
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!resizable) return;

      const step = 0.05;
      let newRatio = ratio;

      if (orientation === 'horizontal') {
        if (e.key === 'ArrowLeft') newRatio -= step;
        if (e.key === 'ArrowRight') newRatio += step;
      } else {
        if (e.key === 'ArrowUp') newRatio -= step;
        if (e.key === 'ArrowDown') newRatio += step;
      }

      if (newRatio !== ratio) {
        e.preventDefault();
        const minRatio = minSize / (containerRef.current?.getBoundingClientRect()[orientation === 'horizontal' ? 'width' : 'height'] || 1000);
        newRatio = Math.max(minRatio, Math.min(1 - minRatio, newRatio));
        setRatio(newRatio);
        onResize?.(newRatio);
      }
    },
    [resizable, ratio, orientation, minSize, onResize]
  );

  const isHorizontal = orientation === 'horizontal';
  const leftSize = `${ratio * 100}%`;
  const rightSize = `${(1 - ratio) * 100}%`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full w-full',
        isHorizontal ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {/* Left/Top Panel */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'width' : 'height']: leftSize,
          minWidth: isHorizontal ? `${minSize}px` : undefined,
          minHeight: !isHorizontal ? `${minSize}px` : undefined,
        }}
      >
        {left}
      </div>

      {/* Resize Handle */}
      {resizable && (
        <div
          className={cn(
            'relative flex items-center justify-center',
            'bg-gray-800 hover:bg-gray-700',
            'transition-colors duration-150',
            'touch-manipulation',
            'group',
            isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
            isDragging && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="separator"
          aria-label="Resize panels"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={Math.round((minSize / 1000) * 100)}
          aria-valuemax={Math.round((1 - minSize / 1000) * 100)}
        >
          {/* Visual Handle */}
          <div
            className={cn(
              'absolute',
              'bg-gray-600 group-hover:bg-gray-500 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-150',
              !prefersReducedMotion && 'group-hover:scale-110',
              isHorizontal ? 'w-6 h-12' : 'w-12 h-6',
              isDragging && 'bg-blue-500 scale-110'
            )}
            style={{
              minWidth: isHorizontal ? '24px' : '48px',
              minHeight: isHorizontal ? '48px' : '24px',
            }}
          >
            <GripVertical
              className={cn(
                'text-white',
                isHorizontal ? 'w-4 h-4' : 'w-4 h-4 rotate-90'
              )}
            />
          </div>
        </div>
      )}

      {/* Right/Bottom Panel */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'width' : 'height']: rightSize,
          minWidth: isHorizontal ? `${minSize}px` : undefined,
          minHeight: !isHorizontal ? `${minSize}px` : undefined,
        }}
      >
        {right}
      </div>
    </div>
  );
});

SplitView.displayName = 'SplitView';
