/**
 * useMicroInteractions - Hook for managing micro-interactions and animations
 *
 * Features:
 * - Unified animation utilities
 * - Spring physics configurations
 * - Gesture feedback management
 * - Performance optimized animations
 * - Theme-aware animations
 *
 * @hook
 * @example
 * ```tsx
 * const { springConfig, animateIn, animateOut } = useMicroInteractions();
 *
 * return (
 *   <motion.div
 *     initial="hidden"
 *     animate="visible"
 *     variants={animateIn}
 *     transition={springConfig}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 *
 * @author CURSERO AI
 * @created 2025-01-25
 */

import { useMemo, useCallback } from 'react';
import { Variants, Transition } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface SpringConfig {
  type: "spring";
  stiffness: number;
  damping: number;
  mass?: number;
}

export interface AnimationConfig {
  duration?: number;
  ease?: string | number[];
  delay?: number;
  staggerChildren?: number;
}

export type InteractionType =
  | 'hover'
  | 'tap'
  | 'press'
  | 'focus'
  | 'blur'
  | 'enter'
  | 'exit';

export interface MicroInteractionConfig {
  /** Spring stiffness */
  stiffness?: number;

  /** Spring damping */
  damping?: number;

  /** Animation duration */
  duration?: number;

  /** Scale factor for interactions */
  scaleFactor?: number;

  /** Enable haptic feedback (if supported) */
  haptic?: boolean;

  /** Reduce motion for accessibility */
  reduceMotion?: boolean;
}

// ============================================
// SPRING PRESETS
// ============================================

export const SPRING_PRESETS = {
  /** Gentle, smooth spring */
  gentle: { stiffness: 400, damping: 17 } as SpringConfig,

  /** Bouncy spring */
  bouncy: { stiffness: 400, damping: 10 } as SpringConfig,

  /** Snappy spring */
  snappy: { stiffness: 600, damping: 20 } as SpringConfig,

  /** Elastic spring */
  elastic: { stiffness: 700, damping: 15 } as SpringConfig,

  /** Slow, smooth spring */
  slow: { stiffness: 280, damping: 60 } as SpringConfig,

  /** Fast, responsive spring */
  fast: { stiffness: 800, damping: 25 } as SpringConfig,
} as const;

// ============================================
// ANIMATION VARIANTS
// ============================================

export const ANIMATION_VARIANTS = {
  /** Scale in/out animations */
  scale: {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  },

  /** Fade in/out animations */
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },

  /** Slide from different directions */
  slide: {
    up: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 }
    },
    down: {
      hidden: { y: -20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: 20, opacity: 0 }
    },
    left: {
      hidden: { x: 20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 }
    },
    right: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 }
    }
  },

  /** Bounce animations */
  bounce: {
    hidden: { scale: 0.3, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    exit: { scale: 0.3, opacity: 0 }
  },

  /** Stagger animations for lists */
  stagger: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }
  }
} as const;

// ============================================
// HOOK
// ============================================

export function useMicroInteractions(config: MicroInteractionConfig = {}) {
  const {
    stiffness = 400,
    damping = 17,
    duration = 0.3,
    scaleFactor = 1.1,
    haptic = false,
    reduceMotion = false
  } = config;

  // ==================== Memoized Values ====================

  const springConfig = useMemo((): SpringConfig => ({
    type: "spring",
    stiffness,
    damping
  }), [stiffness, damping]);

  const transitionConfig = useMemo((): Transition => ({
    ...springConfig,
    duration: reduceMotion ? 0 : duration
  }), [springConfig, duration, reduceMotion]);

  // ==================== Interaction Variants ====================

  const interactionVariants = useMemo(() => ({
    hover: {
      scale: scaleFactor,
      transition: transitionConfig
    },
    tap: {
      scale: 1 / scaleFactor,
      transition: transitionConfig
    },
    press: {
      scale: 0.95,
      transition: transitionConfig
    },
    focus: {
      scale: 1.02,
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
      transition: transitionConfig
    },
    blur: {
      scale: 1,
      boxShadow: 'none',
      transition: transitionConfig
    }
  }), [scaleFactor, transitionConfig]);

  // ==================== Animation Helpers ====================

  const createVariants = useCallback((
    from: Variants,
    to: Variants,
    exit?: Variants
  ): Variants => ({
    hidden: from,
    visible: to,
    exit: exit || from
  }), []);

  const animateIn = useMemo(() => ANIMATION_VARIANTS.scale, []);
  const animateOut = useMemo(() => ({
    ...ANIMATION_VARIANTS.scale,
    exit: ANIMATION_VARIANTS.scale.hidden
  }), []);

  // ==================== Gesture Feedback ====================

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!haptic || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };

    navigator.vibrate(patterns[type]);
  }, [haptic]);

  const handleInteraction = useCallback((
    type: InteractionType,
    callback?: () => void
  ) => {
    if (type === 'tap' || type === 'press') {
      triggerHaptic('light');
    }

    callback?.();
  }, [triggerHaptic]);

  // ==================== Utility Functions ====================

  const getSpringPreset = useCallback((preset: keyof typeof SPRING_PRESETS) => {
    return SPRING_PRESETS[preset];
  }, []);

  const createCustomSpring = useCallback((
    customStiffness: number,
    customDamping: number,
    mass = 1
  ): SpringConfig => ({
    type: "spring",
    stiffness: customStiffness,
    damping: customDamping,
    mass
  }), []);

  const createTransition = useCallback((
    type: 'spring' | 'tween' | 'keyframes' = 'spring',
    options: Record<string, any> = {}
  ): Transition => ({
    type,
    ...options,
    duration: reduceMotion ? 0 : (options.duration || duration)
  }), [duration, reduceMotion]);

  // ==================== Return ====================

  return {
    // Configurations
    springConfig,
    transitionConfig,

    // Variants
    interactionVariants,
    animateIn,
    animateOut,

    // Helpers
    createVariants,
    getSpringPreset,
    createCustomSpring,
    createTransition,

    // Interactions
    handleInteraction,
    triggerHaptic,

    // Animation variants
    variants: ANIMATION_VARIANTS
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook for button interactions
 */
export function useButtonInteractions(config?: MicroInteractionConfig) {
  const { interactionVariants, handleInteraction } = useMicroInteractions(config);

  const buttonVariants = {
    hover: interactionVariants.hover,
    tap: interactionVariants.tap,
    focus: interactionVariants.focus,
    blur: interactionVariants.blur
  };

  return {
    variants: buttonVariants,
    onTap: () => handleInteraction('tap'),
    onPress: () => handleInteraction('press')
  };
}

/**
 * Hook for card interactions
 */
export function useCardInteractions(config?: MicroInteractionConfig) {
  const { interactionVariants } = useMicroInteractions({
    scaleFactor: 1.02,
    ...config
  });

  return {
    variants: {
      hover: interactionVariants.hover,
      tap: interactionVariants.tap
    }
  };
}

/**
 * Hook for icon interactions
 */
export function useIconInteractions(config?: MicroInteractionConfig) {
  const { interactionVariants } = useMicroInteractions({
    scaleFactor: 1.15,
    stiffness: 500,
    damping: 20,
    ...config
  });

  return {
    variants: {
      hover: interactionVariants.hover,
      tap: interactionVariants.tap
    }
  };
}

export default useMicroInteractions;
