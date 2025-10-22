import React from 'react';
import { motion } from 'framer-motion';

interface HolographicCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  title,
  description,
  icon,
  onClick,
  className = '',
}) => {
  return (
    <motion.div
      className={`relative p-6 rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm bg-white/10 border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.03, borderColor: '#22D3EE' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-700/20 opacity-20" />
      <div className="relative z-10 flex items-center mb-4">
        <div className="text-cyan-400 mr-4 text-3xl">{icon}</div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
          {title}
        </h3>
      </div>
      <p className="text-slate-300 text-sm">{description}</p>
    </motion.div>
  );
};

export default HolographicCard;
