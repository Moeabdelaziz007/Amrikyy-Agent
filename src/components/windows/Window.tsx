import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Move } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose?: () => void;
  zIndex?: number;
  className?: string;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  onClose,
  zIndex = 10,
  className = '',
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: isMaximized ? 0 : initialPosition.x,
            y: isMaximized ? 0 : initialPosition.y,
            width: isMaximized ? '100vw' : initialSize.width,
            height: isMaximized ? '100vh' : initialSize.height,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed rounded-xl overflow-hidden shadow-2xl ${className}`}
          style={{ zIndex }}
          drag={!isMaximized}
          dragMomentum={false}
          dragElastic={0}
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl" />
          
          {/* Window Border Glow */}
          <div className="absolute inset-0 rounded-xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]" />

          {/* Window Header */}
          <div className="relative h-12 px-4 flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Move className="w-4 h-4 text-cyan-400/60 cursor-move" />
              <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                {title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMinimize}
                className="p-1.5 rounded-md hover:bg-cyan-500/20 text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMaximize}
                className="p-1.5 rounded-md hover:bg-purple-500/20 text-purple-400/60 hover:text-purple-400 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </motion.button>
              
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Window Content */}
          <div className="relative h-[calc(100%-3rem)] overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Window;
