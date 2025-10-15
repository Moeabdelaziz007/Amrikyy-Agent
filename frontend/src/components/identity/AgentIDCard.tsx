import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AgentSkill {
  name: string;
  level: number;
}

interface Agent {
  id: string;
  name: string;
  nickname: string;
  role: string;
  age: string;
  born: string;
  avatar: string;
  color: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  personality: {
    trait: string;
    value: number;
  }[];
  skills: AgentSkill[];
  mission: string;
  creator: string;
}

interface AgentIDCardProps {
  agent: Agent;
  onClose?: () => void;
}

/**
 * AgentIDCard - Flippable digital identity card for Amrikyy agents
 * 
 * Features:
 * - Glassmorphism design with blur backdrop
 * - Hexagonal avatar frame (Islamic geometry)
 * - Flip animation on hover (front ↔ back)
 * - Breathing avatar animation
 * - Gradient borders matching agent color
 * 
 * Reference: docs/governance/DESIGN_SYSTEM.md
 */
const AgentIDCard: React.FC<AgentIDCardProps> = ({ agent, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="agent-id-card-container"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close ID card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        className="id-card-wrapper"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1000px', cursor: 'pointer' }}
      >
        <motion.div
          className="id-card-inner"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '400px',
            height: '250px'
          }}
        >
          {/* FRONT SIDE */}
          <div
            className="id-card-face id-card-front"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: `linear-gradient(135deg, ${agent.color}dd, ${agent.color}aa)`,
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: `0 20px 60px ${agent.color}66`,
            }}
          >
            {/* Header with Avatar */}
            <div className="flex flex-col items-center mb-4">
              {/* Hexagonal Avatar Frame */}
              <div className="relative w-20 h-20 mb-3">
                <div 
                  className="absolute inset-0 animate-breathe"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                    padding: '3px'
                  }}
                >
                  <img
                    src={agent.avatar || '/avatars/placeholder.svg'}
                    alt={agent.name}
                    className="w-full h-full object-contain"
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                  />
                </div>
                
                {/* Status Indicator */}
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'busy' ? 'bg-amber-500' :
                    agent.status === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}
                />
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{agent.name}</h2>
              <p className="text-sm text-white/80">{agent.role}</p>
            </div>

            {/* Info Rows */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span className="text-white/70">Born:</span>
                <span className="font-semibold text-white">{agent.born}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span className="text-white/70">Age:</span>
                <span className="font-semibold text-white">{agent.age}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span className="text-white/70">Status:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400' :
                    agent.status === 'busy' ? 'bg-amber-400' :
                    'bg-gray-400'
                  }`} />
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Personality Bars */}
            <div className="space-y-2">
              {agent.personality.slice(0, 2).map((trait) => (
                <div key={trait.trait}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/80 capitalize">{trait.trait}</span>
                    <span className="text-white/90 font-semibold">{Math.round(trait.value * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-white/80 to-white/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${trait.value * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Flip hint */}
            <div className="absolute bottom-3 right-3 text-xs text-white/50">
              Click to flip →
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className="id-card-face id-card-back"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${agent.color}aa, ${agent.color}dd)`,
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: `0 20px 60px ${agent.color}66`,
            }}
          >
            <h3 className="text-sm uppercase tracking-wider text-white/80 mb-2">
              Mission Statement
            </h3>
            <p className="text-white italic text-base leading-relaxed mb-6">
              "{agent.mission}"
            </p>

            <h3 className="text-sm uppercase tracking-wider text-white/80 mb-3">
              Core Skills
            </h3>
            <ul className="space-y-2 mb-6">
              {agent.skills.slice(0, 4).map((skill) => (
                <li key={skill.name} className="flex justify-between text-sm">
                  <span className="text-white/90 capitalize">{skill.name.replace(/_/g, ' ')}</span>
                  <span className="text-white font-semibold">{skill.level}%</span>
                </li>
              ))}
            </ul>

            {/* Signature */}
            <div className="absolute bottom-6 left-8 right-8 pt-4 border-t border-white/20">
              <p className="text-xs text-white/70 text-center">
                Creator: {agent.creator}
              </p>
              <p className="text-xs text-white/70 text-center mt-1">
                Platform: amrikyy.com
              </p>
            </div>

            {/* Flip hint */}
            <div className="absolute bottom-3 right-3 text-xs text-white/50">
              ← Click to flip back
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
        }

        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default AgentIDCard;


