import React, { useState } from 'react';
import { 
  Home, 
  Smartphone, 
  Monitor, 
  Layout, 
  Sparkles,
  Layers,
  Grid3x3,
  ArrowRight,
  Github,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * App Launcher - Central hub for all Amrikyy OS demos
 * Built by Blackbox AI
 */
export default function AppLauncher() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const demos = [
    {
      id: 'complete-os',
      title: 'Complete OS',
      subtitle: 'Claude 4.5 Edition',
      description: 'Full-featured OS with mobile, tablet, and desktop support. Includes 10 functional apps, window management, and beautiful UI.',
      path: '/amrikyy-os',
      icon: Layout,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      features: ['10 Apps', 'Window Management', 'Split View', 'Dark Mode'],
      status: 'Production Ready',
      statusColor: 'bg-green-500'
    },
    {
      id: 'mobile-demo',
      title: 'Mobile Demo',
      subtitle: 'Touch-Optimized',
      description: 'Mobile-first interface with touch gestures, app drawer, and iOS-style dock. Perfect for smartphones.',
      path: '/mobile-demo',
      icon: Smartphone,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      features: ['Touch Gestures', 'App Drawer', 'iOS Dock', 'Safe Area'],
      status: 'Beta',
      statusColor: 'bg-blue-500'
    },
    {
      id: 'responsive-test',
      title: 'Responsive Test',
      subtitle: 'Multi-Device',
      description: 'Test responsive behavior across all device sizes. See how the OS adapts from mobile to desktop.',
      path: '/responsive-test',
      icon: Monitor,
      gradient: 'from-green-500 via-emerald-500 to-lime-500',
      features: ['Device Preview', 'Breakpoints', 'Live Testing', 'Responsive'],
      status: 'Testing',
      statusColor: 'bg-yellow-500'
    },
    {
      id: 'os-demo',
      title: 'OS Demo',
      subtitle: 'Original Version',
      description: 'Original OS implementation with basic window management and app system. Foundation for all demos.',
      path: '/os-demo',
      icon: Layers,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      features: ['Windows', 'Apps', 'Taskbar', 'Basic UI'],
      status: 'Legacy',
      statusColor: 'bg-gray-500'
    },
    {
      id: 'home',
      title: 'Home Page',
      subtitle: 'Main Dashboard',
      description: 'Main landing page with navigation to all features. Start your journey here.',
      path: '/',
      icon: Home,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      features: ['Dashboard', 'Navigation', 'Quick Links', 'Overview'],
      status: 'Active',
      statusColor: 'bg-indigo-500'
    },
    {
      id: 'landing',
      title: 'Landing Page',
      subtitle: 'Marketing Site',
      description: 'Original landing page with marketing content and feature showcase.',
      path: '/landing',
      icon: Sparkles,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      features: ['Marketing', 'Features', 'Showcase', 'CTA'],
      status: 'Legacy',
      statusColor: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
            <Grid3x3 className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white/90 font-medium">App Launcher</span>
          </div>
          
          <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
            Amrikyy<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">OS</span>
          </h1>
          
          <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto mb-8">
            Next-Generation AI Operating System
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/90">6 Demos Available</span>
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
        </div>

        {/* Demo Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {demos.map((demo) => {
            const Icon = demo.icon;
            const isHovered = hoveredCard === demo.id;

            return (
              <Link
                key={demo.id}
                to={demo.path}
                onMouseEnter={() => setHoveredCard(demo.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative"
              >
                <div className={`
                  relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20
                  transition-all duration-300 h-full
                  ${isHovered ? 'bg-white/20 scale-105 shadow-2xl' : 'hover:bg-white/15'}
                `}>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`${demo.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {demo.status}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                    bg-gradient-to-br ${demo.gradient}
                    ${isHovered ? 'scale-110 rotate-3' : ''}
                    transition-all duration-300
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {demo.title}
                  </h3>
                  <p className="text-sm text-purple-300 mb-3 font-medium">
                    {demo.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {demo.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {demo.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/20"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Launch Button */}
                  <div className={`
                    flex items-center gap-2 text-white font-medium
                    ${isHovered ? 'translate-x-2' : ''}
                    transition-transform duration-300
                  `}>
                    <span>Launch Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Hover Gradient Border */}
                  <div className={`
                    absolute inset-0 rounded-3xl bg-gradient-to-br ${demo.gradient} opacity-0
                    ${isHovered ? 'opacity-20' : ''}
                    transition-opacity duration-300 pointer-events-none
                  `} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white/90 font-medium">Powered by</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">Claude 4.5 Sonnet</span>
              <span className="text-white/50">+</span>
              <span className="text-white font-bold">Gemini 2.5 Pro</span>
              <span className="text-white/50">+</span>
              <span className="text-white font-bold">Blackbox AI</span>
            </div>
            <p className="text-white/60 text-sm">
              Built with React + TypeScript + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
