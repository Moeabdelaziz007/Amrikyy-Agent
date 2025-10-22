import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Terminal, 
  Folder, 
  LayoutDashboard, 
  Newspaper, 
  Plane, 
  Bug, 
  Moon, 
  VolumeX, 
  BarChart3, 
  Trash2 
} from 'lucide-react';
import { formatTime, formatDate } from '../../utils/aiDesktopFormatters';

interface DockBarProps {
  onAppLaunch?: (appId: string) => void;
}

/**
 * DockBar - macOS-style dock with icon buttons and time display
 * Features:
 * - Circular icon buttons
 * - Hover scale effects
 * - Active state indicators
 * - Real-time clock display
 * - Glassmorphic background
 */
const DockBar = ({ onAppLaunch }: DockBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dockApps = [
    { id: 'power', icon: Zap, color: '#EC4899', gradient: true },
    { id: 'terminal', icon: Terminal, color: '#22D3EE' },
    { id: 'files', icon: Folder, color: '#22D3EE' },
    { id: 'dashboard', icon: LayoutDashboard, color: '#22D3EE' },
    { id: 'news', icon: Newspaper, color: '#22D3EE' },
    { id: 'plane', icon: Plane, color: '#22D3EE' },
    { id: 'bug', icon: Bug, color: '#22D3EE' },
  ];

  const systemIcons = [
    { id: 'moon', icon: Moon, color: '#94A3B8' },
    { id: 'mute', icon: VolumeX, color: '#94A3B8' },
    { id: 'chart', icon: BarChart3, color: '#94A3B8' },
    { id: 'trash', icon: Trash2, color: '#94A3B8' },
  ];

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="dock-container rounded-2xl px-4 py-3 flex items-center gap-3">
        {/* App Icons */}
        {dockApps.map((app, index) => {
          const IconComponent = app.icon;
          return (
            <motion.button
              key={app.id}
              className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.2, y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAppLaunch?.(app.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {app.gradient ? (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <IconComponent size={24} color="white" />
                </div>
              ) : (
                <IconComponent size={24} color={app.color} />
              )}
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-white/20 mx-2" />

        {/* System Icons */}
        {systemIcons.map((icon, index) => {
          const IconComponent = icon.icon;
          return (
            <motion.button
              key={icon.id}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (dockApps.length + index) * 0.05 }}
            >
              <IconComponent size={20} color={icon.color} />
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-white/20 mx-2" />

        {/* Time Display */}
        <motion.div
          className="flex flex-col items-center justify-center px-3 min-w-[80px]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (dockApps.length + systemIcons.length) * 0.05 }}
        >
          <div className="text-white font-bold text-lg leading-none">
            {formatTime(currentTime)}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {formatDate(currentTime)}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DockBar;