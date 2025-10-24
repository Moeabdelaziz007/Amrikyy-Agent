import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  // <-- Import AppWindow
  Search,
  ArrowRight,
  Github,
  ExternalLink,
  PlaneTakeoff,
  DollarSign,
  MessageSquare,
  BookOpen,
  Code,
  Eye,
  Languages,
  Calendar,
  HardDrive,
  Video,
  Mail,
  Megaphone,
  Users,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Palette,
  Camera,
  FileText,
  Music,
  Globe,
  Workflow,
  Shield,
  Headphones,
  AppWindow, // <-- Import AppWindow
  LayoutGrid,
} from 'lucide-react';
import MargeModal from '../components/MargeModal';

// AgentCard Component with UiAmrikyy Design
const AgentCard = ({ app, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
      onClick={() => onClick(app.id)}
    >
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 h-full min-h-[280px]">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`${
              app.status === 'Available'
                ? 'bg-green-500'
                : app.status === 'Beta'
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            } text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {app.status}
          </div>
        </div>

        {/* Icon with Gradient Background */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${app.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <app.icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{app.title}</h3>
            <p className="text-sm text-purple-300 font-medium">{app.titleAr}</p>
            <p className="text-sm text-cyan-300 font-medium">{app.subtitle}</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
            {app.description}
          </p>
        </div>
        {/* Launch Button */}
        <div className="flex items-center gap-2 text-white font-medium pt-2 group-hover:translate-x-2 transition-transform duration-300">
          <span>
            {app.id === 'marge'
              ? 'Open Hub'
              : app.status === 'Available'
              ? 'Launch App'
              : app.status === 'Beta'
              ? 'Try Beta'
              : 'Coming Soon'}
          </span>
          {(app.status === 'Available' || app.status === 'Beta') && (
            <ArrowRight className="w-4 h-4" />
          )}
        </div>
        {/* Hover Gradient Overlay */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
        />
      </div>
    </motion.div>
  );
};

/**
 * Amrikyy AI OS - App Launcher Page
 * Beautiful UiAmrikyy Design Implementation with Marge Agent & Sub-Agents
 */
export default function AppLauncher() {
  // <-- State for Marge Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [margeModalOpen, setMargeModalOpen] = useState(false);

  // Apps data with UiAmrikyy style configuration + Marge with Sub-Agents
  const apps = [
    {
      id: 'marge',
      title: 'Marge',
      titleAr: 'مارج',
      subtitle: 'AI App Ecosystem',
      description:
        'A collection of specialized AI mini-apps to streamline your workflow and boost productivity.',
      icon: LayoutGrid, // Or another suitable icon
      gradient: 'from-amber-500 to-red-500',
      features: ['Mini-Apps', 'Productivity', 'Ecosystem'],
      status: 'Available',
    },
    {
      id: 'luna',
      title: 'Luna',
      titleAr: 'لونا',
      subtitle: 'Trip Planner',
      description:
        'AI-powered travel planning with smart itinerary builder and destination recommendations.',
      icon: PlaneTakeoff,
      gradient: 'from-cyan-500 to-blue-500',
      status: 'Available',
    },
    {
      id: 'karim',
      title: 'Karim',
      titleAr: 'كريم',
      subtitle: 'Budget Optimizer',
      description:
        'Smart cost analysis and budget optimization for your travel expenses.',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      status: 'Available',
    },
    {
      id: 'scout',
      title: 'Scout',
      titleAr: 'سكاوت',
      subtitle: 'Deal Finder',
      description:
        'Find the best prices and offers for flights, hotels, and travel packages.',
      icon: Search,
      gradient: 'from-green-500 to-emerald-500',
      status: 'Available',
    },
    {
      id: 'maya',
      title: 'Maya',
      titleAr: 'مايا',
      subtitle: 'AI Assistant',
      description:
        '24/7 AI-powered customer support and travel assistance with multilingual capabilities.',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-yellow-500',
      status: 'Coming Soon',
    },
    {
      id: 'vision',
      title: 'Vision',
      titleAr: 'الرؤية',
      subtitle: 'Image Analysis',
      description:
        'Advanced AI-powered image recognition and analysis for travel documentation.',
      icon: Eye,
      gradient: 'from-indigo-500 to-purple-500',
      status: 'Coming Soon',
    },
    {
      id: 'zara',
      title: 'Zara',
      titleAr: 'زارا',
      subtitle: 'Research Agent',
      description:
        'Data analysis and insights for travel trends and destinations with real-time updates.',
      icon: BookOpen,
      gradient: 'from-pink-500 to-rose-500',
      status: 'Coming Soon',
    },
  ];

  const filteredApps = apps.filter(
    app =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = appId => {
    const app = apps.find(a => a.id === appId);
    if (app && app.status === 'Available') {
      if (app.id === 'marge') {
        setMargeModalOpen(true);
      } else {
        console.log(`Launching ${app.title}...`);
        // Existing launch logic here
      }
    }
    if (app && (app.status === 'Available' || app.status === 'Beta')) {
      console.log(`Launching ${app.title}...`);
      // Add your app launch logic here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Marge Modal */}
      <AnimatePresence>
        {margeModalOpen && (
          <MargeModal onClose={() => setMargeModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center pt-16 pb-12"
        >
          {/* App Launcher Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <span className="text-sm text-white/90 font-medium">
              🚀 AI OS Launcher
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-8xl font-black text-white mb-6 drop-shadow-2xl"
          >
            Amrikyy
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              OS
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl text-white/80 font-medium max-w-3xl mx-auto mb-12"
          >
            AI-Powered Travel Intelligence Platform with Advanced Mini Apps
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-2xl mx-auto px-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
              <input
                type="text"
                placeholder="Search agents, mini apps, and features..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full pl-14 pr-6 py-4 text-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-xl transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Enhanced Stats & Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-sm text-white/90">
                {apps.length} AI Agents
              </span>
            </div>

            <a
              href="https://github.com/Moeabdelaziz007/Amrikyy-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <Github className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-white/90">View Source</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </a>
          </motion.div>
        </motion.div>

        {/* Apps Grid */}
        <div className="flex-1 px-8 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={searchTerm}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 1.2 + index * 0.1,
                      duration: 0.6,
                    }}
                  >
                    <AgentCard app={app} onClick={handleLaunch} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* No Results State */}
            {filteredApps.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white/60 mb-6"
                >
                  <Search className="w-16 h-16 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No agents found
                </h3>
                <p className="text-white/60 text-lg">
                  Try adjusting your search terms or explore our AI mini apps
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Footer */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center pb-12"
        >
          <div className="inline-flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              />
              <span className="text-white/90 font-medium">
                Powered by Advanced AI
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-white font-semibold">Gemini 2.5 Pro</span>
              <span className="text-white/50">+</span>
              <span className="text-white font-semibold">
                Claude 4.5 Sonnet
              </span>
              <span className="text-white/50">+</span>
              <span className="text-white font-semibold">React + Vite</span>
              <span className="text-white/50">+</span>
              <span className="text-white font-semibold">Framer Motion</span>
            </div>
            <p className="text-white/60 text-sm max-w-md text-center">
              Built with ❤️ using Advanced AI • Multi-Modal Intelligence •
              Modern Web Technologies
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
