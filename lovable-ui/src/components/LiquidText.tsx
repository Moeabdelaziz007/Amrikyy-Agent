import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LiquidTextProps {
  text: string;
  className?: string;
}

export const LiquidText = ({ text, className = '' }: LiquidTextProps) => {
  const [morphValue, setMorphValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMorphValue((prev) => (prev + 0.01) % 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        filter: `url(#liquid-filter-${text.replace(/\s/g, '')})`,
      }}
    >
      {text}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`liquid-filter-${text.replace(/\s/g, '')}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.003"
              numOctaves="2"
              result="warp"
            >
              <animate
                attributeName="baseFrequency"
                from="0.01 0.003"
                to="0.02 0.006"
                dur="4s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            
            <feDisplacementMap
              in="SourceGraphic"
              in2="warp"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                values="8;12;8"
                dur="3s"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
            
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 35 -15"
            />
          </filter>
        </defs>
      </svg>
    </motion.span>
  );
};
