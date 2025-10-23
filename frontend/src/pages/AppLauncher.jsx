import React, { useState } from 'react';
import { 
  Map,
  DollarSign,
  Search,
  MessageSquare,
  BookOpen,
  Code,
  ArrowRight,
  Github,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * App Launcher - Central hub for Amrikyy AI Mini Apps
 * Travel Intelligence Platform
 */
export default function AppLauncher() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const miniApps = [
    {
      id: 'luna',
      title: 'Luna',
      titleAr: 'لونا',
      subtitle: 'Trip Planner',
      description: 'AI-powered travel planning with smart itinerary builder and destination recommendations.',
      descriptionAr: 'مخطط الرحلات - تخطيط السفر بالذكاء الاصطناعي',
      path: '/apps/luna',
      icon: Map,
      gradient: 'from-cyan-500 to-blue-600',
      features: ['Trip Planning', 'AI Suggestions', 'Itinerary Builder'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true
    },
    {
      id: 'karim',
      title: 'Karim',
      titleAr: 'كريم',
      subtitle: 'Budget Optimizer',
      description: 'Smart cost analysis and budget optimization for your travel expenses.',
      descriptionAr: 'محسن الميزانية - تحليل التكاليف الذكي',
      path: '/apps/karim',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-600',
      features: ['Budget Planning', 'Cost Analysis', 'Savings Tips'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true
    },
    {
      id: 'scout',
      title: 'Scout',
      titleAr: 'سكاوت',
      subtitle: 'Deal Finder',
      description: 'Find the best prices and offers for flights, hotels, and travel packages.',
      descriptionAr: 'باحث العروض - أفضل الأسعار والعروض',
      path: '/apps/scout',
      icon: Search,
      gradient: 'from-green-500 to-emerald-600',
      features: ['Flight Deals', 'Hotel Offers', 'Price Tracking'],
      status: 'Available',
      statusColor: 'bg-green-500',
      available: true
    },
    {
      id: 'maya',
      title: 'Maya',
      titleAr: 'مايا',
      subtitle: 'AI Assistant',
      description: '24/7 AI-powered customer support and travel assistance.',
      descriptionAr: 'دعم العملاء - مساعد ذكي على مدار الساعة',
      path: '/apps/maya',
      icon: MessageSquare,
      gradient: 'from-yellow-500 to-orange-600',
      features: ['AI Chat', '24/7 Support', 'Multi-language'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false
    },
    {
      id: 'zara',
      title: 'Zara',
      titleAr: 'زارا',
      subtitle: 'Research Agent',
      description: 'Data analysis and insights for travel trends and destinations.',
      descriptionAr: 'باحثة متخصصة - تحليل البيانات والرؤى',
      path: '/apps/zara',
      icon: BookOpen,
      gradient: 'from-indigo-500 to-purple-600',
      features: ['Research', 'Data Analysis', 'Insights'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false
    },
    {
      id: 'kody',
      title: 'Kody',
      titleAr: 'كودي',
      subtitle: 'Code Interpreter',
      description: 'Data processing and automation for travel operations.',
      descriptionAr: 'مفسر الأكواد - معالجة البيانات',
      path: '/apps/kody',
      icon: Code,
      gradient: 'from-red-500 to-pink-600',
      features: ['Code Analysis', 'Data Processing', 'Automation'],
      status: 'Coming Soon',
      statusColor: 'bg-yellow-500',
      available: false
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
            <Grid className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white/90 font-medium">App Launcher</span>
          </div>
          
          <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
            Amrikyy<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">OS</span>
          </h1>
          
          <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto mb-8">
            AI-Powered Travel Intelligence Platform
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/90">6 Mini Apps</span>
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

        {/* Mini Apps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {miniApps.map((app) => {
            const Icon = app.icon;
            const isHovered = hoveredCard === app.id;

            return (
              <Link
                key={app.id}
                to={app.available ? app.path : '#'}
                onClick={(e) => !app.available && e.preventDefault()}
                onMouseEnter={() => setHoveredCard(app.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative ${!app.available ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`
                  relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20
                  transition-all duration-300 h-full
                  ${isHovered ? 'bg-white/20 scale-105 shadow-2xl' : 'hover:bg-white/15'}
                  ${!app.available ? 'opacity-75' : ''}
                `}>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`${app.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {app.status}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                    bg-gradient-to-br ${app.gradient}
                    ${isHovered ? 'scale-110 rotate-3' : ''}
                    transition-all duration-300
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {app.title}
                  </h3>
                  <p className="text-sm text-purple-300 mb-1 font-medium">{app.titleAr}</p>
                  <p className="text-sm text-cyan-300 mb-3 font-medium">
                    {app.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {app.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
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
                  <div className={`
                    flex items-center gap-2 text-white font-medium
                    ${isHovered ? 'translate-x-2' : ''}
                    transition-transform duration-300
                  `}>
                    <span>{app.available ? 'Launch App' : 'Coming Soon'}</span>
                    {app.available && <ArrowRight className="w-4 h-4" />}
                  </div>

                  {/* Hover Gradient Border */}
                  <div className={`
                    absolute inset-0 rounded-3xl bg-gradient-to-br ${app.gradient} opacity-0
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
