/**
 * Mini App Card Component - Reusable card for AI agents
 * @author Ona AI
 * @created 2025-10-21
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface MiniAppData {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  available: boolean;
}

interface MiniAppCardProps {
  app: MiniAppData;
  index?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onLaunch?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showBadge?: boolean;
}

export function MiniAppCard({
  app,
  index = 0,
  isSelected = false,
  onSelect,
  onLaunch,
  variant = 'default',
  showBadge = true
}: MiniAppCardProps) {
  
  const handleClick = () => {
    if (app.available && onSelect) {
      onSelect();
    }
  };

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.available && onLaunch) {
      onLaunch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={app.available ? { scale: 1.05, y: -5 } : {}}
      onClick={handleClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300
        ${app.available 
          ? 'bg-slate-800/60 backdrop-blur-lg border-2 border-slate-700/50 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20' 
          : 'bg-slate-800/30 backdrop-blur-lg border-2 border-slate-700/30 opacity-60 cursor-not-allowed'
        }
        ${isSelected ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-500/20' : ''}
        ${variant === 'compact' ? 'p-4' : ''}
      `}
    >
      {/* Available Badge */}
      {showBadge && !app.available && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-slate-700/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-400">
          Coming Soon
        </div>
      )}

      {/* Icon */}
      <div className={`
        inline-flex p-4 rounded-xl mb-4 bg-gradient-to-br ${app.gradient}
        ${app.available ? 'opacity-100' : 'opacity-50'}
        ${variant === 'compact' ? 'p-3' : ''}
      `}>
        {app.icon}
      </div>

      {/* Name */}
      <h3 className={`
        font-bold text-white mb-1
        ${variant === 'compact' ? 'text-xl' : 'text-2xl'}
      `}>
        {app.name}
      </h3>
      <p className={`
        text-slate-400 mb-3 font-arabic
        ${variant === 'compact' ? 'text-base' : 'text-lg'}
      `}>
        {app.nameAr}
      </p>

      {/* Description */}
      {variant !== 'compact' && (
        <>
          <p className="text-slate-400 mb-2">
            {app.description}
          </p>
          <p className="text-sm text-slate-500 font-arabic">
            {app.descriptionAr}
          </p>
        </>
      )}

      {/* Launch Button */}
      {app.available && (
        <button
          onClick={handleLaunch}
          className={`
            mt-4 w-full py-2 rounded-lg font-bold transition-all duration-300
            bg-gradient-to-r ${app.gradient} hover:shadow-lg hover:scale-105
            ${variant === 'compact' ? 'py-1.5 text-sm' : ''}
          `}
        >
          {variant === 'compact' ? 'Launch' : 'Launch App'}
        </button>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-4 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
        />
      )}
    </motion.div>
  );
}

export default MiniAppCard;
