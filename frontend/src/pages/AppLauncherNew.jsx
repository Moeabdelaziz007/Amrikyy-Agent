import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Github,
  ExternalLink,
  PlaneTakeoff,
  DollarSign,
  Eye,
  MessageSquare,
  BookOpen,
  Code,
  Languages,
  Calendar,
  HardDrive,
  Video,
  Mail,
  Megaphone,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// AgentCard Component
const AgentCard = ({ app, onClick }) => {
  const getGradientClass = color => {
    const gradients = {
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500',
      cyan: 'from-cyan-500 to-blue-500',
      orange: 'from-orange-500 to-amber-500',
      indigo: 'from-indigo-500 to-purple-500',
      red: 'from-red-500 to-orange-500',
      pink: 'from-pink-500 to-purple-500',
      emerald: 'from-emerald-500 to-teal-500',
    };
    return gradients[color] || 'from-gray-500 to-gray-600';
  };

  const Icon = app.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        y: -5,
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
      onClick={() => onClick(app.id)}
    >
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all duration-300 h-full">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`${app.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {app.status}
          </div>
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${getGradientClass(
            app.color
          )} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{app.title}</h3>
          <p className="text-sm text-purple-300 font-medium">{app.titleAr}</p>
          <p className="text-sm text-cyan-300 font-medium mb-3">
            {app.subtitle}
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            {app.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 pt-2">
            {app.features.map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Launch Button */}
          <div className="flex items-center gap-2 text-white font-medium pt-4 group-hover:translate-x-2 transition-transform duration-300">
            <span>{app.available ? 'Launch App' : 'Coming Soon'}</span>
            {app.available && <ArrowRight className="w-4 h-4" />}
          </div>
        </div>

        {/* Hover Gradient Border */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getGradientClass(
            app.color
          )} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
        />
      </div>
    </motion.div>
  );
};

/**
 * App Launcher - UiAmrikyy Style Design
 * Beautiful Modern UI with Purple Gradients
 */
export default function AppLauncher() {
  const [searchTerm, setSearchTerm] = useState('');

  const miniApps = [
    {
      id: 'luna',
      title: 'Luna',
      titleAr: 'لونا',
      subtitle: 'Trip Planner',
      description:
        'AI-powered travel planning with smart itinerary builder and destination recommendations.',
      path: '/apps/luna',
      icon: PlaneTakeoff,
      color: 'blue',
      features: ['Trip Planning', 'AI Suggestions', 'Itinerary Builder'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true,
    },
    {
      id: 'karim',
      title: 'Karim',
      titleAr: 'كريم',
      subtitle: 'Budget Optimizer',
      description:
        'Smart cost analysis and budget optimization for your travel expenses.',
      path: '/apps/karim',
      icon: DollarSign,
      color: 'purple',
      features: ['Budget Planning', 'Cost Analysis', 'Savings Tips'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true,
    },
    {
      id: 'scout',
      title: 'Scout',
      titleAr: 'سكاوت',
      subtitle: 'Deal Finder',
      description:
        'Find the best prices and offers for flights, hotels, and travel packages.',
      path: '/apps/scout',
      icon: Search,
      color: 'green',
      features: ['Flight Deals', 'Hotel Offers', 'Price Tracking'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true,
    },
    {
      id: 'maya',
      title: 'Maya',
      titleAr: 'مايا',
      subtitle: 'AI Assistant',
      description: '24/7 AI-powered customer support and travel assistance.',
      path: '/apps/maya',
      icon: MessageSquare,
      color: 'orange',
      features: ['AI Chat', '24/7 Support', 'Multi-language'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false,
    },
    {
      id: 'zara',
      title: 'Zara',
      titleAr: 'زارا',
      subtitle: 'Research Agent',
      description:
        'Data analysis and insights for travel trends and destinations.',
      path: '/apps/zara',
      icon: BookOpen,
      color: 'indigo',
      features: ['Research', 'Data Analysis', 'Insights'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false,
    },
    {
      id: 'kody',
      title: 'Kody',
      titleAr: 'كودي',
      subtitle: 'Code Interpreter',
      description: 'Data processing and automation for travel operations.',
      path: '/apps/kody',
      icon: Code,
      color: 'emerald',
      features: ['Code Analysis', 'Data Processing', 'Automation'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false,
    },
  ];

  const filteredApps = miniApps.filter(
    app =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = appId => {
    const app = miniApps.find(a => a.id === appId);
    if (app && app.available) {
      // Handle app launch logic here
      console.log(`Launching ${app.title}...`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
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
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
            className="text-center pt-16 pb-8"
          >
            {/* App Launcher Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/90 font-medium">
                App Launcher
              </span>
            </div>

            <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
              Amrikyy
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                OS
              </span>
            </h1>

            <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto mb-8">
              AI-Powered Travel Intelligence Platform
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
                <input
                  type="text"
                  placeholder="Search apps and agents..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full pl-14 pr-6 py-4 text-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl"
                  autoFocus
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/90">
                  {miniApps.length} Mini Apps
                </span>
              </div>
              <a
                href="https://github.com/Moeabdelaziz007/Amrikyy-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Github className="w-4 h-4 text-white/90" />
                <span className="text-sm text-white/90">View Source</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </a>
            </div>
          </motion.div>

          {/* Apps Grid */}
          <div className="flex-1 px-8 pb-16">
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.3 },
              }}
            >
              <AnimatePresence>
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AgentCard app={app} onClick={handleLaunch} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* No Results */}
              {filteredApps.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-white/60 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No apps found
                  </h3>
                  <p className="text-white/60">
                    Try adjusting your search terms
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center pb-8"
          >
            <div className="inline-flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-white/90 font-medium">Powered by</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">Gemini 2.5 Pro</span>
                <span className="text-white/50">+</span>
                <span className="text-white font-bold">Claude 4.5 Sonnet</span>
                <span className="text-white/50">+</span>
                <span className="text-white font-bold">React + Vite</span>
              </div>
              <p className="text-white/60 text-sm">
                Built with ❤️ using AI and Modern Web Technologies
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
