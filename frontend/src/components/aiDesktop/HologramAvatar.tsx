import { motion } from 'framer-motion';
import type { HologramAvatarProps } from '../../types/aiDesktop';

/**
 * HologramAvatar - Hexagonal avatar with breathing animation and particle effects
 * Features:
 * - Hexagonal clip path (Islamic geometry)
 * - Breathing animation
 * - Gradient border matching agent color
 * - Particle aura effects
 * - Status-based pulsing glow
 */
const HologramAvatar = ({ 
  agent, 
  size = 80, 
  showParticles = true, 
  showBreathing = true 
}: HologramAvatarProps) => {
  const statusColors = {
    active: '#10B981',
    busy: '#F59E0B',
    idle: '#6B7280',
    learning: '#8B5CF6'
  };

  const statusColor = statusColors[agent.status];

  return (
    <div className="relative inline-block">
      {/* Particle Aura */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: agent.color,
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * (size / 2 + 20)],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * (size / 2 + 20)],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Avatar Container with Hexagonal Clip */}
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={showBreathing ? {
          scale: [1, 1.05, 1],
          opacity: [1, 0.9, 1]
        } : undefined}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Gradient Border */}
        <div
          className="absolute inset-0 hexagon-avatar"
          style={{
            background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`,
            padding: '3px',
          }}
        >
          {/* Inner Avatar */}
          <div
            className="w-full h-full hexagon-avatar flex items-center justify-center"
            style={{
              background: '#1E293B',
            }}
          >
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover hexagon-avatar"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ color: agent.color }}
              >
                {agent.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1E293B]"
          style={{ background: statusColor }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 hexagon-avatar blur-xl pointer-events-none"
          style={{
            background: agent.color,
            opacity: 0.3,
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </div>
  );
};

export default HologramAvatar;