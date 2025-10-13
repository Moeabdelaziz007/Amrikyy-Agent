import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const CountUp = ({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: CountUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(end);
      setHasAnimated(true);
    }
  }, [isInView, end, spring, hasAnimated]);

  // Update display value efficiently
  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(prefix + latest.toFixed(decimals) + suffix);
    });
    return unsubscribe;
  }, [spring, prefix, suffix, decimals]);

  return (
    <div ref={ref} className={className}>
      <span>{displayValue}</span>
    </div>
  );
};
