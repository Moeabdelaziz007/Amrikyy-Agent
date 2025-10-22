import { useState, useEffect, useCallback } from 'react';
import type { AccessibilityPreferences } from '@/types/os.types';

/**
 * Default accessibility preferences
 */
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  screenReader: false,
  keyboardOnly: false,
  fontScale: 1.0,
};

/**
 * Detect system accessibility preferences
 */
function detectSystemPreferences(): Partial<AccessibilityPreferences> {
  if (typeof window === 'undefined') return {};

  return {
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
  };
}

/**
 * Hook for managing accessibility preferences and features
 *
 * @returns Accessibility state and controls
 *
 * @example
 * ```tsx
 * const { preferences, updatePreference, announce } = useAccessibility();
 *
 * if (preferences.reduceMotion) {
 *   return <StaticUI />;
 * }
 *
 * // Announce to screen readers
 * announce('File uploaded successfully');
 * ```
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => ({
    ...DEFAULT_PREFERENCES,
    ...detectSystemPreferences(),
  }));

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K]
    ) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /**
   * Update multiple preferences at once
   */
  const updatePreferences = useCallback(
    (updates: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  /**
   * Reset to default preferences
   */
  const resetPreferences = useCallback(() => {
    setPreferences({
      ...DEFAULT_PREFERENCES,
      ...detectSystemPreferences(),
    });
  }, []);

  /**
   * Announce message to screen readers
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  /**
   * Listen for system preference changes
   */
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updatePreference('reduceMotion', e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updatePreference('highContrast', e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, [updatePreference]);

  /**
   * Apply font scale to document
   */
  useEffect(() => {
    document.documentElement.style.fontSize = `${preferences.fontScale * 100}%`;
  }, [preferences.fontScale]);

  /**
   * Apply high contrast class
   */
  useEffect(() => {
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [preferences.highContrast]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    announce,
  };
}

/**
 * Hook to check if user prefers reduced motion
 *
 * @returns True if reduced motion is preferred
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 *
 * return (
 *   <motion.div
 *     animate={{ opacity: 1 }}
 *     transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 *   />
 * );
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const { preferences } = useAccessibility();
  return preferences.reduceMotion;
}

/**
 * Hook for keyboard navigation
 *
 * @param onEscape - Handler for Escape key
 * @param onEnter - Handler for Enter key
 *
 * @example
 * ```tsx
 * useKeyboardNavigation({
 *   onEscape: () => closeModal(),
 *   onEnter: () => submitForm(),
 * });
 * ```
 */
export function useKeyboardNavigation(handlers: {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handlers.onEscape?.();
          break;
        case 'Enter':
          handlers.onEnter?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlers.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.onArrowDown?.();
          break;
        case 'ArrowLeft':
          handlers.onArrowLeft?.();
          break;
        case 'ArrowRight':
          handlers.onArrowRight?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

/**
 * Hook for focus trap (useful for modals)
 *
 * @param containerRef - Ref to container element
 * @param active - Whether trap is active
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen);
 *
 * return <div ref={modalRef}>Modal content</div>;
 * ```
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  active: boolean
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, active]);
}
