/**
 * OS Demo Page - Showcase of Amrikyy AI OS Features
 * 
 * Demonstrates:
 * - QuickSearch (Cmd+K)
 * - SystemTray
 * - Keyboard Shortcuts
 * - Window Management
 * - Complete Desktop Experience
 * 
 * @page
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DesktopOS } from '@/components/os/DesktopOS';
import { 
  Rocket, 
  Zap, 
  Terminal, 
  Settings, 
  BookOpen,
  Code,
  Sparkles
} from 'lucide-react';
import type { SearchItem } from '@/components/os/QuickSearch';
import type { User, Notification } from '@/components/os/SystemTray';

// ============================================
// DEMO DATA
// ============================================

const DEMO_USER: User = {
  name: 'Amrikyy Explorer',
  email: 'explorer@amrikyy.ai',
  role: 'AI OS Pioneer',
  avatar: undefined
};

const DEMO_SEARCH_ITEMS: SearchItem[] = [
  {
    id: 'app-maya',
    title: 'Maya Travel Assistant',
    description: 'AI-powered travel planning and booking',
    type: 'app',
    icon: <Rocket className="w-4 h-4" />,
    category: 'AI Assistants',
    keywords: ['travel', 'ai', 'assistant', 'maya', 'booking'],
    action: () => console.log('Opening Maya...')
  },
  {
    id: 'app-karim',
    title: 'Karim Budget Optimizer',
    description: 'Smart budget optimization for travel',
    type: 'app',
    icon: <Sparkles className="w-4 h-4" />,
    category: 'AI Assistants',
    keywords: ['budget', 'optimizer', 'karim', 'money'],
    action: () => console.log('Opening Karim...')
  },
  {
    id: 'app-luna',
    title: 'Luna Trip Planner',
    description: 'Intelligent trip planning and itineraries',
    type: 'app',
    icon: <Zap className="w-4 h-4" />,
    category: 'AI Assistants',
    keywords: ['trip', 'planner', 'luna', 'itinerary'],
    action: () => console.log('Opening Luna...')
  },
  {
    id: 'app-terminal',
    title: 'Terminal',
    description: 'Command line interface',
    type: 'app',
    icon: <Terminal className="w-4 h-4" />,
    category: 'System',
    keywords: ['terminal', 'console', 'shell', 'cli'],
    action: () => console.log('Opening Terminal...')
  },
  {
    id: 'app-code',
    title: 'Code Editor',
    description: 'Built-in code editor',
    type: 'app',
    icon: <Code className="w-4 h-4" />,
    category: 'Development',
    keywords: ['code', 'editor', 'ide', 'programming'],
    action: () => console.log('Opening Code Editor...')
  },
  {
    id: 'app-docs',
    title: 'Documentation',
    description: 'System documentation and guides',
    type: 'app',
    icon: <BookOpen className="w-4 h-4" />,
    category: 'Help',
    keywords: ['docs', 'documentation', 'help', 'guide'],
    action: () => console.log('Opening Docs...')
  },
  {
    id: 'app-settings',
    title: 'Settings',
    description: 'System preferences and configuration',
    type: 'app',
    icon: <Settings className="w-4 h-4" />,
    category: 'System',
    keywords: ['settings', 'preferences', 'config', 'options'],
    action: () => console.log('Opening Settings...')
  }
];

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Amrikyy AI OS! 🎉',
    message: 'Your AI-powered desktop experience is ready. Press Cmd+K to start searching.',
    time: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Maya Travel Assistant',
    message: 'New flight deals to Istanbul found! Save up to 30%.',
    time: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    type: 'info'
  },
  {
    id: '3',
    title: 'Karim Budget Optimizer',
    message: 'Your trip budget has been optimized. Saved $250!',
    time: new Date(Date.now() - 25 * 60 * 1000),
    read: false,
    type: 'success'
  },
  {
    id: '4',
    title: 'System Update Available',
    message: 'New features: Voice control, 3D knowledge graph, and more.',
    time: new Date(Date.now() - 45 * 60 * 1000),
    read: true,
    type: 'warning'
  },
  {
    id: '5',
    title: 'Luna Trip Planner',
    message: 'Your Istanbul itinerary is ready for review.',
    time: new Date(Date.now() - 120 * 60 * 1000),
    read: true,
    type: 'info'
  }
];

// ============================================
// COMPONENT
// ============================================

export function OSDemo() {
  const [showHelp, setShowHelp] = useState(true);
  
  const handleLogout = () => {
    console.log('[OSDemo] Logout clicked');
    alert('Logout functionality would go here');
  };
  
  const handleSettings = () => {
    console.log('[OSDemo] Settings clicked');
    alert('Settings functionality would go here');
  };
  
  const handleProfile = () => {
    console.log('[OSDemo] Profile clicked');
    alert('Profile functionality would go here');
  };
  
  return (
    <DesktopOS
      user={DEMO_USER}
      searchItems={DEMO_SEARCH_ITEMS}
      notifications={DEMO_NOTIFICATIONS}
      onLogout={handleLogout}
      onSettings={handleSettings}
      onProfile={handleProfile}
      showWallpaper={true}
    >
      {/* Desktop Content */}
      <div className="h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="
            max-w-4xl w-full
            bg-slate-900/50 backdrop-blur-xl
            border border-white/10 rounded-3xl
            shadow-2xl
            p-12
          "
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="
                w-24 h-24 rounded-3xl
                bg-gradient-to-br from-blue-500 to-purple-500
                flex items-center justify-center
                shadow-2xl
              ">
                <Rocket className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Welcome to Amrikyy AI OS
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/70 max-w-2xl mx-auto"
            >
              The world's first AI-native Operating System. Experience the future of computing.
            </motion.p>
          </div>
          
          {/* Features */}
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="
                bg-white/5 backdrop-blur-sm
                border border-white/10 rounded-2xl
                p-6
              "
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-sm text-white/50 hover:text-white/70 transition-colors"
                >
                  Hide
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShortcutItem
                  shortcut="⌘ K"
                  description="Quick Search"
                  highlight
                />
                <ShortcutItem
                  shortcut="⌘ N"
                  description="New Window"
                />
                <ShortcutItem
                  shortcut="⌘ W"
                  description="Close Window"
                />
                <ShortcutItem
                  shortcut="⌘ M"
                  description="Minimize Window"
                />
                <ShortcutItem
                  shortcut="Alt Tab"
                  description="Switch Windows"
                />
                <ShortcutItem
                  shortcut="⌘ ,"
                  description="Settings"
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300 text-center">
                  💡 <strong>Tip:</strong> Click "Search" button or press <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">⌘K</kbd> to try the universal search
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex justify-center gap-4"
          >
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="
                px-6 py-3 rounded-xl
                bg-white/10 hover:bg-white/20
                text-white font-medium
                transition-all
                border border-white/20
              "
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
            
            <button
              onClick={handleSettings}
              className="
                px-6 py-3 rounded-xl
                bg-gradient-to-r from-blue-500 to-purple-500
                hover:from-blue-600 hover:to-purple-600
                text-white font-medium
                transition-all
                shadow-lg
              "
            >
              Open Settings
            </button>
          </motion.div>
        </motion.div>
      </div>
    </DesktopOS>
  );
}

// ============================================
// SHORTCUT ITEM COMPONENT
// ============================================

interface ShortcutItemProps {
  shortcut: string;
  description: string;
  highlight?: boolean;
}

function ShortcutItem({ shortcut, description, highlight }: ShortcutItemProps) {
  return (
    <div className={`
      flex items-center justify-between
      px-4 py-3 rounded-xl
      ${highlight ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'}
      transition-all
      hover:bg-white/10
    `}>
      <span className="text-white/70 text-sm">{description}</span>
      <kbd className={`
        px-3 py-1.5 rounded-lg
        font-mono text-sm
        ${highlight ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-white/10 text-white/90 border-white/20'}
        border
      `}>
        {shortcut}
      </kbd>
    </div>
  );
}

export default OSDemo;
