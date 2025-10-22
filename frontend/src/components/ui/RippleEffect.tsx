/**
 * RippleEffect - Material Design ripple effect component
 *
 * Features:
 * - Touch/click ripple animations
 * - Customizable colors and timing
 * - Multiple simultaneous ripples
 * - Automatic cleanup
 * - Accessible and performant
 *
 * @component
 * @example
 * ```tsx
 * <RippleEffect>
 *   <button>Click me</button>
 * </RippleEffect>
 * ```
 *
 * @author CURSERO AI
 * @created 2025-01-25
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface RippleEffectProps {
  /** Child element to wrap */
  children: React.ReactNode;

  /** Ripple color */
  color?: string;

  /** Ripple opacity */
  opacity?: number;

  /** Ripple duration in seconds */
  duration?: number;

  /** Enable/disable ripple effect */
  disabled?: boolean;

  /** Custom className */
  className?: string;

  /** Ripple size multiplier */
  size?: number;

  /** Center ripple on element */
  center?: boolean;
}

// ============================================
// RIPPLE COMPONENT
// ============================================

interface RippleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  onComplete: () => void;
}

const Ripple: React.FC<RippleProps> = ({
  x,
  y,
  size,
  color,
  opacity,
  duration,
  onComplete
}) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        opacity: opacity,
      }}
      initial={{ scale: 0, opacity: opacity }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{
        duration: duration,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
    />
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  opacity = 0.3,
  duration = 0.4,
  disabled = false,
  className,
  size = 1,
  center = false,
  ...props
}) => {

  // ==================== State ====================

  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // ==================== Handlers ====================

  const handleInteraction = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Get touch or mouse position
    let clientX: number, clientY: number;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = center ? rect.width / 2 : clientX - rect.left;
    const y = center ? rect.height / 2 : clientY - rect.top;

    // Calculate ripple size (diagonal of container)
    const maxSize = Math.sqrt(rect.width ** 2 + rect.height ** 2) * size;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: maxSize
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, duration * 1000);
  }, [disabled, duration, size, center]);

  // ==================== Render ====================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
      {...props}
    >
      {children}

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            id={ripple.id}
            x={ripple.x}
            y={ripple.y}
            size={ripple.size}
            color={color}
            opacity={opacity}
            duration={duration}
            onComplete={() => {}}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RippleEffect;
