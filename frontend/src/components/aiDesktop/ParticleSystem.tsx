import { motion } from 'framer-motion';
import type { Particle } from '../../types/aiDesktop';

interface ParticleSystemProps {
  particles: Particle[];
}

/**
 * ParticleSystem - Floating particle animation system
 * Features:
 * - Multiple colored particles
 * - Floating upward animation
 * - Different sizes and delays
 * - Creates quantum/futuristic ambiance
 */
const ParticleSystem = ({ particles }: ParticleSystemProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: 0,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 1000)],
            x: [0, Math.random() * 40 - 20],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default ParticleSystem;