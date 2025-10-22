import React, { memo, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/useAccessibility';

/**
 * FAB position
 */
export type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/**
 * FAB size
 */
export type FABSize = 'sm' | 'md' | 'lg';

/**
 * FAB props
 */
export interface FloatingActionButtonProps {
  /** Icon component */
  icon: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Button label (for accessibility) */
  label: string;
  /** Position on screen */
  position?: FABPosition;
  /** Button size */
  size?: FABSize;
  /** Background color/gradient */
  color?: string;
  /** Badge count */
  badge?: number;
  /** Whether button is hidden */
  hidden?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Position styles
 */
const positionStyles: Record<FABPosition, string> = {
  'bottom-right': 'bottom-24 right-6',
  'bottom-left': 'bottom-24 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

/**
 * Size styles (WCAG compliant)
 */
const sizeStyles: Record<FABSize, { container: string; icon: string }> = {
  sm: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  md: { container: 'w-14 h-14', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16', icon: 'w-7 h-7' },
};

/**
 * Trigger haptic feedback
 */
function triggerHaptic() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

/**
 * Floating Action Button component
 *
 * Features:
 * - Fixed positioning with customizable location
 * - Touch-optimized (56px minimum for comfortable tapping)
 * - Haptic feedback on tap
 * - Badge support for notifications
 * - Smooth animations
 * - Shadow and elevation
 * - Accessibility support
 * - Auto-hide on scroll (optional)
 *
 * @example
 * ```tsx
 * <FloatingActionButton
 *   icon={Search}
 *   label="Quick search"
 *   onClick={() => openSearch()}
 *   position="bottom-right"
 *   badge={3}
 * />
 * ```
 */
export const FloatingActionButton = memo<FloatingActionButtonProps>(({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  size = 'md',
  color = 'bg-blue-500',
  badge,
  hidden = false,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = () => {
    triggerHaptic();
    onClick();
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  if (hidden) return null;

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'fixed z-40',
        'rounded-full shadow-2xl',
        'flex items-center justify-center',
        'transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
        'active:scale-90 touch-manipulation',
        !prefersReducedMotion && 'hover:scale-110',
        color,
        positionStyles[position],
        sizeStyles[size].container,
        isPressed && 'scale-90',
        className
      )}
      style={{
        minWidth: size === 'lg' ? '64px' : size === 'md' ? '56px' : '48px',
        minHeight: size === 'lg' ? '64px' : size === 'md' ? '56px' : '48px',
      }}
      aria-label={label}
      role="button"
    >
      {/* Icon */}
      <Icon className={cn('text-white', sizeStyles[size].icon)} />

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <div
          className={cn(
            'absolute -top-1 -right-1',
            'min-w-[20px] h-5 px-1.5',
            'bg-red-500 rounded-full',
            'flex items-center justify-center',
            'text-xs font-bold text-white',
            'shadow-lg',
            !prefersReducedMotion && 'animate-in zoom-in duration-200'
          )}
          aria-label={`${badge} notifications`}
        >
          {badge > 99 ? '99+' : badge}
        </div>
      )}

      {/* Ripple effect */}
      {!prefersReducedMotion && (
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-white/20',
            'scale-0 opacity-0',
            isPressed && 'animate-ping'
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

/**
 * FAB with extended label (for desktop/tablet)
 */
export const ExtendedFAB = memo<
  FloatingActionButtonProps & { extendedLabel?: string }
>(({ extendedLabel, ...props }) => {
  const [isExtended, setIsExtended] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Auto-collapse on scroll
  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsExtended(currentScroll < lastScroll || currentScroll < 50);
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!extendedLabel) {
    return <FloatingActionButton {...props} />;
  }

  const Icon = props.icon;

  return (
    <button
      onClick={props.onClick}
      className={cn(
        'fixed z-40',
        'rounded-full shadow-2xl',
        'flex items-center gap-3',
        'px-6 py-4',
        'transition-all duration-300',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
        'active:scale-95 touch-manipulation',
        !prefersReducedMotion && 'hover:scale-105',
        props.color || 'bg-blue-500',
        positionStyles[props.position || 'bottom-right'],
        props.className
      )}
      style={{
        minHeight: '56px',
      }}
      aria-label={props.label}
    >
      <Icon className="w-6 h-6 text-white" />
      {isExtended && (
        <span
          className={cn(
            'text-white font-medium whitespace-nowrap',
            !prefersReducedMotion && 'animate-in fade-in slide-in-from-left duration-200'
          )}
        >
          {extendedLabel}
        </span>
      )}

      {/* Badge */}
      {props.badge !== undefined && props.badge > 0 && (
        <div
          className={cn(
            'absolute -top-1 -right-1',
            'min-w-[20px] h-5 px-1.5',
            'bg-red-500 rounded-full',
            'flex items-center justify-center',
            'text-xs font-bold text-white',
            'shadow-lg'
          )}
        >
          {props.badge > 99 ? '99+' : props.badge}
        </div>
      )}
    </button>
  );
});

ExtendedFAB.displayName = 'ExtendedFAB';
