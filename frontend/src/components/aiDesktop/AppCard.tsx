import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../../types/aiDesktop';
import { formatAppName } from '../../utils/aiDesktopFormatters';
import { getIconComponent } from '../../utils/aiDesktopIconMapping';

interface AppCardProps {
  app: AppData;
  onLaunch: (app: AppData) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onLaunch }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const IconComponent = getIconComponent(app.icon);

  return (
    <motion.div
      className="holographic-card relative w-40 h-40 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
      whileHover={{ scale: 1.05, z: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onLaunch(app)}
      onMouseMove={handleMouseMove}
      style={{
        // @ts-ignore
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }}
    >
      <div className="holographic-card-inner relative w-full h-full bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-xl flex flex-col items-center justify-center p-4">
        <div className="holographic-card-glow absolute inset-0" />
        <motion.div
          className="text-white mb-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {IconComponent && <IconComponent className="w-12 h-12" />}
        </motion.div>
        <motion.p
          className="text-white text-lg font-semibold text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {formatAppName(app.name)}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AppCard;
