import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InteractiveComponentProps } from '@/types/os.types';

/**
 * Touch button variants
 */
export type TouchButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Touch button sizes
 */
export type TouchButtonSize = 'sm' | 'md' | 'lg';

/**
 * Touch button props
 */
export interface TouchButtonProps extends Omit<InteractiveComponentProps, 'onClick'> {
  /** Button variant */
  variant?: TouchButtonVariant;
  /** Button size */
  size?: TouchButtonSize;
  /** Icon component */
  icon?: LucideIcon;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Click handler with haptic feedback */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Variant styles
 */
const variantStyles: Record<TouchButtonVariant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg',
  secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white',
  ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20 text-white',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg',
};

/**
 * Size styles (WCAG compliant touch targets)
 */
const sizeStyles: Record<TouchButtonSize, string> = {
  sm: 'min-w-[44px] min-h-[44px] px-3 py-2 text-sm',
  md: 'min-w-[48px] min-h-[48px] px-4 py-3 text-base',
  lg: 'min-w-[56px] min-h-[56px] px-6 py-4 text-lg',
};

/**
 * Trigger haptic feedback (if supported)
 */
function triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const duration = intensity === 'light' ? 10 : intensity === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
}

/**
 * Touch-optimized button component with haptic feedback
 *
 * Features:
 * - WCAG 2.1 AA compliant touch targets (min 44×44px)
 * - Haptic feedback on touch devices
 * - Active state animations
 * - Loading and disabled states
 * - Icon support
 * - Accessibility features (ARIA labels, keyboard support)
 *
 * @example
 * ```tsx
 * <TouchButton
 *   variant="primary"
 *   size="lg"
 *   icon={Zap}
 *   onClick={() => console.log('Clicked')}
 * >
 *   Launch App
 * </TouchButton>
 * ```
 */
export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled = false,
      loading = false,
      onClick,
      children,
      className,
      ariaLabel,
      ariaDescription,
      testId,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Trigger haptic feedback
      triggerHaptic('light');

      // Call onClick handler
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'rounded-xl font-medium',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          'active:scale-95',
          'touch-manipulation',

          // Variant styles
          variantStyles[variant],

          // Size styles
          sizeStyles[size],

          // Full width
          fullWidth && 'w-full',

          // Disabled state
          (disabled || loading) && 'opacity-50 cursor-not-allowed active:scale-100',

          // Custom className
          className
        )}
        aria-label={ariaLabel}
        aria-description={ariaDescription}
        aria-busy={loading}
        aria-disabled={disabled}
        data-testid={testId}
        {...props}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
          </>
        )}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';
