import { useRef, useState, ReactNode, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export const MagneticButton = ({
  children,
  onClick,
  className,
  size,
  variant,
  ...props
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.3;
      const y = (clientY - (top + height / 2)) * 0.3;

      // Only update if change is significant (debounce)
      if (Math.abs(x - position.x) > 1 || Math.abs(y - position.y) > 1) {
        setPosition({ x, y });
      }
    },
    [position.x, position.y]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        onClick={onClick}
        className={className}
        size={size}
        variant={variant}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
