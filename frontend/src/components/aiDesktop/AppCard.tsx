import { motion } from 'framer-motion';
import { 
  Terminal, 
  Folder, 
  LayoutDashboard, 
  Newspaper, 
  Plane, 
  Bug, 
  FileText 
} from 'lucide-react';
import type { App } from '../../types/aiDesktop';

interface AppCardProps {
  app: App;
  onLaunch: () => void;
}

const iconMap = {
  terminal: Terminal,
  folder: Folder,
  'layout-dashboard': LayoutDashboard,
  newspaper: Newspaper,
  plane: Plane,
  bug: Bug,
  'file-text': FileText,
};

/**
 * AppCard - Glassmorphic app launcher card
 * Features:
 * - Dark glass effect with cyan border
 * - Icon and app name
 * - Hover lift and glow animations
 * - Click to launch app
 */
const AppCard = ({ app, onLaunch }: AppCardProps) => {
  const IconComponent = iconMap[app.icon as keyof typeof iconMap] || LayoutDashboard;

  return (
    <motion.button
      type="button"
      className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden group"
      style={{
        borderColor: app.isActive ? app.color : 'rgba(255, 255, 255, 0.1)',
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onLaunch}
      transition={{ duration: 0.3 }}
    >
      {/* Background Glow on Hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${app.color}22, transparent)`,
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10"
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <IconComponent 
          size={48} 
          color={app.color}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* App Name */}
      <span className="text-white font-medium text-sm relative z-10">
        {app.name}
      </span>

      {/* Active Indicator */}
      {app.isActive && (
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: app.color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.button>
  );
};

export default AppCard;