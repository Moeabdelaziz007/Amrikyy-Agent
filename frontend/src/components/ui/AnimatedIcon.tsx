/**
 * AnimatedIcon - Premium icon component with micro-interactions
 *
 * Features:
 * - Hover/tap animations with spring physics
 * - Scale, rotate, and bounce effects
 * - Ripple effect on tap
 * - Customizable animation presets
 * - Accessible with proper ARIA labels
 *
 * @component
 * @example
 * ```tsx
 * <AnimatedIcon
 *   icon={<Zap className="w-6 h-6" />}
 *   animation="bounce"
 *   onClick={() => console.log('Clicked!')}
 * />
 * ```
 *
 * @author CURSERO AI
 * @created 2025-01-25
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type AnimationPreset =
  | 'scale'
  | 'bounce'
  | 'rotate'
  | 'pulse'
  | 'wiggle'
  | 'heartbeat'
  | 'spring'
  | 'elastic';

export interface AnimatedIconProps extends Omit<HTMLMotionProps<"div">, "onAnimationStart" | "onAnimationEnd"> {
  /** The icon to animate */
  icon: React.ReactNode;

  /** Animation preset */
  animation?: AnimationPreset;

  /** Custom animation variants */
  customVariants?: any;

  /** Enable ripple effect on tap */
  ripple?: boolean;

  /** Ripple color */
  rippleColor?: string;

  /** Icon size class (e.g., "w-6 h-6") */
  size?: string;

  /** Enable hover effects */
  hover?: boolean;

  /** Enable tap effects */
  tap?: boolean;

  /** Animation duration in seconds */
  duration?: number;

  /** Spring stiffness for physics */
  stiffness?: number;

  /** Spring damping for physics */
  damping?: number;

  /** Scale factor for hover/tap */
  scaleFactor?: number;

  /** Rotation angle for rotate animation */
  rotationAngle?: number;

  /** Custom className */
  className?: string;

  /** Accessibility label */
  'aria-label'?: string;
}

// ============================================
// ANIMATION PRESETS
// ============================================

const ANIMATION_PRESETS = {
  scale: {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  },
  bounce: {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  rotate: {
    hover: { rotate: 15 },
    tap: { rotate: -15, scale: 0.95 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  wiggle: {
    hover: {
      rotate: [0, -3, 3, -3, 3, 0],
      transition: {
        duration: 0.5
      }
    }
  },
  heartbeat: {
    animate: {
      scale: [1, 1.25, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  spring: {
    hover: { scale: 1.15 },
    tap: { scale: 0.85 },
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  elastic: {
    hover: { scale: 1.2 },
    tap: { scale: 0.8 },
    transition: {
      type: "spring",
      stiffness: 700,
      damping: 15
    }
  }
};

// ============================================
// RIPPLE COMPONENT
// ============================================

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  onComplete: () => void;
}

const Ripple: React.FC<RippleProps> = ({ x, y, size, color, onComplete }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    />
  );
};

// ============================================
// COMPONENT
// ============================================

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  animation = 'scale',
  customVariants,
  ripple = true,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  size = 'w-6 h-6',
  hover = true,
  tap = true,
  duration = 0.2,
  stiffness = 400,
  damping = 17,
  scaleFactor = 1.1,
  rotationAngle = 15,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {

  // ==================== State ====================

  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // ==================== Handlers ====================

  const handleTap = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!ripple) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 400);
  }, [ripple]);

  // ==================== Animation Variants ====================

  const getVariants = () => {
    if (customVariants) return customVariants;

    const preset = ANIMATION_PRESETS[animation];

    return {
      initial: { scale: 1, rotate: 0 },
      hover: hover ? {
        ...preset.hover,
        scale: preset.hover?.scale || scaleFactor,
        rotate: preset.hover?.rotate || (animation === 'rotate' ? rotationAngle : 0),
      } : {},
      tap: tap ? {
        ...preset.tap,
        scale: preset.tap?.scale || (1 / scaleFactor),
        rotate: preset.tap?.rotate || (animation === 'rotate' ? -rotationAngle : 0),
      } : {},
      animate: preset.animate,
      transition: preset.transition || {
        type: "spring",
        stiffness,
        damping,
        duration
      }
    };
  };

  const variants = getVariants();

  // ==================== Render ====================

  return (
    <motion.div
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer select-none',
        size,
        className
      )}
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={animation === 'pulse' || animation === 'heartbeat' ? "animate" : undefined}
      onTap={handleTap}
      aria-label={ariaLabel}
      role="button"
      tabIndex={0}
      {...props}
    >
      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {icon}
      </div>

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            size={40}
            color={rippleColor}
            onComplete={() => {}}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// PRESET COMPONENTS
// ============================================

/**
 * BounceIcon - Bouncy spring animation
 */
export const BounceIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="bounce" />
);

/**
 * PulseIcon - Continuous pulsing animation
 */
export const PulseIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="pulse" />
);

/**
 * HeartbeatIcon - Heartbeat-like pulsing
 */
export const HeartbeatIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="heartbeat" />
);

/**
 * SpringIcon - Elastic spring physics
 */
export const SpringIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="spring" />
);

/**
 * ElasticIcon - Highly elastic animation
 */
export const ElasticIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="elastic" />
);

/**
 * RotateIcon - Rotation on hover/tap
 */
export const RotateIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="rotate" />
);

/**
 * WiggleIcon - Playful wiggle animation
 */
export const WiggleIcon: React.FC<Omit<AnimatedIconProps, 'animation'>> = (props) => (
  <AnimatedIcon {...props} animation="wiggle" />
);

export default AnimatedIcon;
