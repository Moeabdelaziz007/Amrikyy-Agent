import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxLayer = ({ 
  children, 
  speed = 0.5, 
  className = '' 
}: ParallaxLayerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxSection = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
};
