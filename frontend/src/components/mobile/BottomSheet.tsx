import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useKeyboardNavigation, usePrefersReducedMotion } from '@/hooks/useAccessibility';
import type { BaseComponentProps } from '@/types/os.types';

/**
 * Bottom sheet props
 */
export interface BottomSheetProps extends BaseComponentProps {
  /** Whether sheet is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Snap points (0-1, percentage of viewport height) */
  snapPoints?: number[];
  /** Initial snap point index */
  initialSnap?: number;
  /** Whether sheet is dismissible */
  dismissible?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to show drag handle */
  showDragHandle?: boolean;
}

/**
 * Calculate snap point position
 */
function getSnapPosition(snapPoint: number): number {
  return window.innerHeight * (1 - snapPoint);
}

/**
 * Find nearest snap point
 */
function findNearestSnap(position: number, snapPoints: number[]): number {
  const snapPositions = snapPoints.map(getSnapPosition);
  let nearest = 0;
  let minDistance = Math.abs(position - snapPositions[0]);

  for (let i = 1; i < snapPositions.length; i++) {
    const distance = Math.abs(position - snapPositions[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = i;
    }
  }

  return nearest;
}

/**
 * Bottom sheet component with swipe gestures and snap points
 *
 * Features:
 * - Swipeable with snap points
 * - Backdrop with blur
 * - Focus trap for accessibility
 * - Keyboard navigation (Escape to close)
 * - Smooth animations
 * - Portal rendering
 * - Respects reduced motion preference
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Settings"
 *   snapPoints={[0.3, 0.7, 0.95]}
 * >
 *   <div>Sheet content</div>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  dismissible = true,
  showCloseButton = true,
  showDragHandle = true,
  children,
  className,
  testId,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Focus trap
  useFocusTrap(sheetRef, isOpen);

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: dismissible ? onClose : undefined,
  });

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setDragStart(clientY);
    setDragOffset(0);
  }, []);

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const offset = clientY - dragStart;
      // Only allow dragging down
      if (offset > 0) {
        setDragOffset(offset);
      }
    },
    [isDragging, dragStart]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    const currentPosition = getSnapPosition(snapPoints[currentSnap]) + dragOffset;

    // Check if dragged far enough to close
    if (dismissible && dragOffset > 150) {
      onClose();
      return;
    }

    // Find nearest snap point
    const nearestSnap = findNearestSnap(currentPosition, snapPoints);
    setCurrentSnap(nearestSnap);
    setDragOffset(0);
  }, [isDragging, dragOffset, currentSnap, snapPoints, dismissible, onClose]);

  /**
   * Touch event handlers
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragStart(touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.addEventListener('touchstart', handleTouchStart);
      sheet.addEventListener('touchmove', handleTouchMove);
      sheet.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (sheet) {
        sheet.removeEventListener('touchstart', handleTouchStart);
        sheet.removeEventListener('touchmove', handleTouchMove);
        sheet.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, handleDragStart, handleDragMove, handleDragEnd]);

  /**
   * Reset snap on open
   */
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(initialSnap);
      setDragOffset(0);
    }
  }, [isOpen, initialSnap]);

  /**
   * Prevent body scroll when open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const snapPosition = getSnapPosition(snapPoints[currentSnap]);
  const currentPosition = snapPosition + dragOffset;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      data-testid={testId}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          prefersReducedMotion ? '' : 'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute left-0 right-0 bg-gray-900 rounded-t-3xl shadow-2xl',
          'flex flex-col',
          prefersReducedMotion ? '' : 'transition-transform duration-300',
          className
        )}
        style={{
          top: `${currentPosition}px`,
          maxHeight: `${window.innerHeight * snapPoints[snapPoints.length - 1]}px`,
          transform: isDragging ? 'none' : undefined,
        }}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-gray-700 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            {title && (
              <h2 className="text-xl font-bold text-white">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
