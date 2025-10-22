/**
 * NotificationBadge - Animated notification badge with spring physics
 *
 * Features:
 * - Spring-based animations
 * - Auto-scaling based on count
 * - Customizable colors and positioning
 * - Pulse animation for attention
 * - Accessible with screen reader support
 *
 * @component
 * @example
 * ```tsx
 * <NotificationBadge count={5} position="top-right">
 *   <Bell className="w-6 h-6" />
 * </NotificationBadge>
 * ```
 *
 * @author CURSERO AI
 * @created 2025-01-25
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type BadgePosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface NotificationBadgeProps {
  /** The count to display */
  count: number;

  /** Child element to wrap */
  children: React.ReactNode;

  /** Badge position */
  position?: BadgePosition;

  /** Badge size */
  size?: BadgeSize;

  /** Maximum count to display (shows "99+" if exceeded) */
  maxCount?: number;

  /** Show badge when count is 0 */
  showZero?: boolean;

  /** Custom color */
  color?: string;

  /** Background color */
  backgroundColor?: string;

  /** Text color */
  textColor?: string;

  /** Enable pulse animation */
  pulse?: boolean;

  /** Pulse color */
  pulseColor?: string;

  /** Animation duration */
  duration?: number;

  /** Spring stiffness */
  stiffness?: number;

  /** Spring damping */
  damping?: number;

  /** Custom className */
  className?: string;

  /** Accessibility label */
  'aria-label'?: string;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================

const SIZE_CONFIGS = {
  sm: {
    badge: 'min-w-[16px] h-4 px-1',
    text: 'text-[10px] font-medium',
    offset: 'top-[-4px] right-[-4px]'
  },
  md: {
    badge: 'min-w-[18px] h-5 px-1.5',
    text: 'text-[11px] font-semibold',
    offset: 'top-[-6px] right-[-6px]'
  },
  lg: {
    badge: 'min-w-[20px] h-6 px-2',
    text: 'text-xs font-bold',
    offset: 'top-[-8px] right-[-8px]'
  }
};

const POSITION_OFFSETS = {
  'top-right': 'top-[-6px] right-[-6px]',
  'top-left': 'top-[-6px] left-[-6px]',
  'bottom-right': 'bottom-[-6px] right-[-6px]',
  'bottom-left': 'bottom-[-6px] left-[-6px]',
  'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
};

// ============================================
// COMPONENT
// ============================================

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  children,
  position = 'top-right',
  size = 'md',
  maxCount = 99,
  showZero = false,
  color = 'bg-red-500',
  backgroundColor,
  textColor = 'text-white',
  pulse = false,
  pulseColor = 'bg-red-400',
  duration = 0.3,
  stiffness = 400,
  damping = 17,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {

  // ==================== State ====================

  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  // ==================== Effects ====================

  useEffect(() => {
    if (count !== displayCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount]);

  // ==================== Computed Values ====================

  const shouldShow = showZero ? true : count > 0;
  const finalCount = Math.min(count, maxCount);
  const countText = count > maxCount ? `${maxCount}+` : finalCount.toString();

  const sizeConfig = SIZE_CONFIGS[size];
  const positionOffset = POSITION_OFFSETS[position];

  // ==================== Animation Variants ====================

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness,
        damping,
        duration
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // ==================== Render ====================

  return (
    <div
      className={cn('relative inline-block', className)}
      aria-label={ariaLabel || `${count} notifications`}
      {...props}
    >
      {/* Child Element */}
      {children}

      {/* Notification Badge */}
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            className={cn(
              'absolute flex items-center justify-center rounded-full',
              'border-2 border-white shadow-lg',
              'pointer-events-none select-none',
              sizeConfig.badge,
              positionOffset,
              backgroundColor || color
            )}
            variants={badgeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key={displayCount} // Re-animate when count changes
          >
            {/* Pulse Background */}
            {pulse && (
              <motion.div
                className={cn(
                  'absolute inset-0 rounded-full',
                  pulseColor
                )}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
              />
            )}

            {/* Count Text */}
            <motion.span
              className={cn(
                'relative z-10 leading-none',
                sizeConfig.text,
                textColor
              )}
              animate={isAnimating ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              {countText}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
