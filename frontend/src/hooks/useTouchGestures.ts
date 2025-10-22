import { useEffect, useRef, useCallback } from 'react';

/**
 * Gesture direction
 */
export type GestureDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Touch gesture event data
 */
export interface GestureEvent {
  direction: GestureDirection;
  distance: number;
  duration: number;
  velocity: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Gesture configuration
 */
export interface GestureConfig {
  /** Minimum distance in pixels to trigger gesture (default: 50) */
  threshold?: number;
  /** Maximum duration in ms for gesture (default: 300) */
  maxDuration?: number;
  /** Minimum velocity in px/ms (default: 0.3) */
  minVelocity?: number;
  /** Enable/disable gesture detection (default: true) */
  enabled?: boolean;
  /** Prevent default touch behavior (default: false) */
  preventDefault?: boolean;
}

/**
 * Gesture handlers
 */
export interface GestureHandlers {
  onSwipe?: (event: GestureEvent) => void;
  onSwipeUp?: (event: GestureEvent) => void;
  onSwipeDown?: (event: GestureEvent) => void;
  onSwipeLeft?: (event: GestureEvent) => void;
  onSwipeRight?: (event: GestureEvent) => void;
  onTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onPinch?: (scale: number) => void;
}

/**
 * Default gesture configuration
 */
const DEFAULT_CONFIG: Required<GestureConfig> = {
  threshold: 50,
  maxDuration: 300,
  minVelocity: 0.3,
  enabled: true,
  preventDefault: false,
};

/**
 * Touch state
 */
interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isLongPress: boolean;
  longPressTimer: NodeJS.Timeout | null;
  initialDistance: number;
}

/**
 * Calculate distance between two touch points
 */
function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Determine gesture direction from delta values
 */
function getDirection(deltaX: number, deltaY: number): GestureDirection {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

/**
 * Advanced touch gesture detection hook with swipe, tap, long press, and pinch support
 *
 * @param handlers - Gesture event handlers
 * @param config - Gesture configuration
 * @returns Ref to attach to target element
 *
 * @example
 * ```tsx
 * const gestureRef = useTouchGestures({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   onLongPress: (x, y) => console.log('Long press at', x, y),
 * }, {
 *   threshold: 100,
 *   maxDuration: 500,
 * });
 *
 * return <div ref={gestureRef}>Swipeable content</div>;
 * ```
 */
export function useTouchGestures<T extends HTMLElement = HTMLDivElement>(
  handlers: GestureHandlers,
  config: GestureConfig = {}
) {
  const elementRef = useRef<T>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isLongPress: false,
    longPressTimer: null,
    initialDistance: 0,
  });

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled) return;

      if (mergedConfig.preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const state = touchState.current;

      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.currentX = touch.clientX;
      state.currentY = touch.clientY;
      state.startTime = Date.now();
      state.isLongPress = false;

      // Handle pinch gesture
      if (e.touches.length === 2) {
        state.initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
      }

      // Start long press timer
      if (handlers.onLongPress) {
        state.longPressTimer = setTimeout(() => {
          state.isLongPress = true;
          handlers.onLongPress?.(state.startX, state.startY);
        }, 500);
      }
    },
    [handlers, mergedConfig]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled) return;

      const touch = e.touches[0];
      const state = touchState.current;

      state.currentX = touch.clientX;
      state.currentY = touch.clientY;

      // Cancel long press if moved
      const deltaX = state.currentX - state.startX;
      const deltaY = state.currentY - state.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10 && state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && handlers.onPinch) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / state.initialDistance;
        handlers.onPinch(scale);
      }
    },
    [handlers, mergedConfig]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!mergedConfig.enabled) return;

      const state = touchState.current;

      // Clear long press timer
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }

      // Don't process if long press was triggered
      if (state.isLongPress) {
        state.isLongPress = false;
        return;
      }

      const endTime = Date.now();
      const duration = endTime - state.startTime;
      const deltaX = state.currentX - state.startX;
      const deltaY = state.currentY - state.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / duration;

      // Check if it's a tap (short duration, small distance)
      if (duration < 200 && distance < 10 && handlers.onTap) {
        handlers.onTap(state.startX, state.startY);
        return;
      }

      // Check if gesture meets threshold requirements
      if (
        distance < mergedConfig.threshold ||
        duration > mergedConfig.maxDuration ||
        velocity < mergedConfig.minVelocity
      ) {
        return;
      }

      // Determine direction and create gesture event
      const direction = getDirection(deltaX, deltaY);
      const gestureEvent: GestureEvent = {
        direction,
        distance,
        duration,
        velocity,
        startX: state.startX,
        startY: state.startY,
        endX: state.currentX,
        endY: state.currentY,
      };

      // Call appropriate handlers
      handlers.onSwipe?.(gestureEvent);

      switch (direction) {
        case 'up':
          handlers.onSwipeUp?.(gestureEvent);
          break;
        case 'down':
          handlers.onSwipeDown?.(gestureEvent);
          break;
        case 'left':
          handlers.onSwipeLeft?.(gestureEvent);
          break;
        case 'right':
          handlers.onSwipeRight?.(gestureEvent);
          break;
      }
    },
    [handlers, mergedConfig]
  );

  /**
   * Attach event listeners
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !mergedConfig.enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !mergedConfig.preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !mergedConfig.preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      // Clear any pending timers
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, mergedConfig.enabled, mergedConfig.preventDefault]);

  return elementRef;
}

/**
 * Simplified swipe-only hook for common use cases
 *
 * @example
 * ```tsx
 * const swipeRef = useSwipe({
 *   onSwipeLeft: () => nextSlide(),
 *   onSwipeRight: () => prevSlide(),
 * });
 *
 * return <div ref={swipeRef}>Swipeable carousel</div>;
 * ```
 */
export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  handlers: Pick<GestureHandlers, 'onSwipeUp' | 'onSwipeDown' | 'onSwipeLeft' | 'onSwipeRight'>,
  config?: GestureConfig
) {
  return useTouchGestures<T>(handlers, config);
}
