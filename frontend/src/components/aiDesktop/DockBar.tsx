import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../../types/aiDesktop';
import {
  formatAppName,
  formatTime,
  formatDate,
} from '../../utils/aiDesktopFormatters';
import { getIconComponent } from '../../utils/aiDesktopIconMapping';

interface DockBarProps {
  apps: AppData[];
  onLaunch: (app: AppData) => void;
  currentTime: Date;
}

const DockBar: React.FC<DockBarProps> = ({ apps, onLaunch, currentTime }) => {
  return (
    <motion.div
      className="dock-container flex justify-center items-center space-x-4 p-3 rounded-t-2xl border-t border-l border-r border-gray-700/50 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 17 }}
    >
      {apps.map(app => {
        const IconComponent = getIconComponent(app.icon);
        return (
          <motion.div
            key={app.id}
            className="dock-bar-item p-3 rounded-lg cursor-pointer flex flex-col items-center text-white hover:bg-gray-700/50 transition-all duration-200"
            whileHover={{ scale: 1.1, y: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onLaunch(app)}
          >
            {IconComponent && <IconComponent className="w-8 h-8 mb-1" />}
            <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {formatAppName(app.name)}
            </span>
          </motion.div>
        );
      })}
      <div className="text-gray-400 text-sm ml-6 border-l border-gray-700 pl-4">
        <p>{formatTime(currentTime)}</p>
        <p>{formatDate(currentTime)}</p>
      </div>
    </motion.div>
  );
};

export default DockBar;
