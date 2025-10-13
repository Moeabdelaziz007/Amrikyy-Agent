import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export const CursorTrail = memo(() => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let particleId = 0;
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setIsMoving(true);
      clearTimeout(timeoutId);
      
      // Create new particle
      const newParticle: Particle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]);

      timeoutId = setTimeout(() => {
        setIsMoving(false);
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  // Clean up old particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {isMoving && particles.map((particle, index) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 0.8,
              scale: 1,
              x: particle.x - 4,
              y: particle.y - 4,
            }}
            animate={{ 
              opacity: 0,
              scale: 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${217 + index * 5}, 91%, 60%), 
                hsl(${262 + index * 5}, 83%, 58%))`,
              boxShadow: `0 0 ${8 + index}px hsl(${217 + index * 5}, 91%, 60% / 0.5)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

CursorTrail.displayName = 'CursorTrail';
