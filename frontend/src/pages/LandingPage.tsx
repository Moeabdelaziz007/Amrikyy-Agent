/**
 * Landing Page - Amrikyy AI OS
 * Desktop-style landing page with Mini Apps Grid
 * 
 * @author Ona AI
 * @created 2025-10-21
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  Zap,
  Globe,
  Code,
  TrendingUp,
  MessageSquare,
  Search,
  DollarSign,
  Map,
  BookOpen,
  BarChart3
} from 'lucide-react';

// Mini App data
interface MiniApp {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  available: boolean;
}

const MINI_APPS: MiniApp[] = [
  {
    id: 'luna',
    name: 'Luna',
    nameAr: 'لونا',
    description: 'Trip Planner - AI-powered travel planning',
    descriptionAr: 'مخطط الرحلات - تخطيط السفر بالذكاء الاصطناعي',
    icon: <Map className="w-8 h-8" />,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    available: true
  },
  {
    id: 'karim',
    name: 'Karim',
    nameAr: 'كريم',
    description: 'Budget Optimizer - Smart cost analysis',
    descriptionAr: 'محسن الميزانية - تحليل التكاليف الذكي',
    icon: <DollarSign className="w-8 h-8" />,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    available: true
  },
  {
    id: 'scout',
    name: 'Scout',
    nameAr: 'سكاوت',
    description: 'Deal Finder - Best prices & offers',
    descriptionAr: 'باحث العروض - أفضل الأسعار والعروض',
    icon: <Search className="w-8 h-8" />,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    available: true
  },
  {
    id: 'maya',
    name: 'Maya',
    nameAr: 'مايا',
    description: 'Customer Support - 24/7 AI assistant',
    descriptionAr: 'دعم العملاء - مساعد ذكي على مدار الساعة',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-600',
    available: false
  },
  {
    id: 'zara',
    name: 'Zara',
    nameAr: 'زارا',
    description: 'Research Agent - Data analysis & insights',
    descriptionAr: 'باحثة متخصصة - تحليل البيانات والرؤى',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    available: false
  },
  {
    id: 'kody',
    name: 'Kody',
    nameAr: 'كودي',
    description: 'Code Interpreter - Data processing',
    descriptionAr: 'مفسر الأكواد - معالجة البيانات',
    icon: <Code className="w-8 h-8" />,
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    available: false
  }
];

export default function LandingPage() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo/Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <Brain className="w-16 h-16 text-cyan-400" />
                <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  AMRIKYY AI OS
                </h1>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl text-slate-300 mb-4"
            >
              Your Desktop AI Operating System
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-400 mb-12 font-arabic"
            >
              نظام التشغيل الذكي للذكاء الاصطناعي
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <button 
                onClick={() => navigate('/desktop')}
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Launch AI OS
                </span>
              </button>
              <button 
                onClick={() => navigate('/demo')}
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-lg text-white font-bold rounded-xl border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105"
              >
                View Demo
              </button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
            >
              <FeatureCard
                icon={<Brain className="w-8 h-8" />}
                title="AI-Powered"
                titleAr="مدعوم بالذكاء الاصطناعي"
                description="Advanced multi-agent system"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Real-Time"
                titleAr="فوري"
                description="Instant responses & updates"
              />
              <FeatureCard
                icon={<Globe className="w-8 h-8" />}
                title="Multi-Platform"
                titleAr="متعدد المنصات"
                description="Web, iOS, Telegram, WhatsApp"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Mini Apps Grid */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              AI Mini Apps
            </h2>
            <p className="text-xl text-slate-400 text-center mb-12">
              Specialized AI agents for every task
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {MINI_APPS.map((app, index) => (
                <MiniAppCard
                  key={app.id}
                  app={app}
                  index={index}
                  isSelected={selectedApp === app.id}
                  onSelect={() => setSelectedApp(app.id)}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <StatCard number="6" label="AI Agents" labelAr="وكلاء ذكيين" />
            <StatCard number="98%" label="Success Rate" labelAr="معدل النجاح" />
            <StatCard number="1.2s" label="Response Time" labelAr="وقت الاستجابة" />
            <StatCard number="24/7" label="Available" labelAr="متاح" />
          </motion.div>
        </section>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, titleAr, description }: {
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all duration-300 group">
      <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-2 font-arabic">{titleAr}</p>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

// Mini App Card Component
function MiniAppCard({ app, index, isSelected, onSelect }: {
  app: MiniApp;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 + index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={app.available ? onSelect : undefined}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300
        ${app.available 
          ? 'bg-slate-800/60 backdrop-blur-lg border-2 border-slate-700/50 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20' 
          : 'bg-slate-800/30 backdrop-blur-lg border-2 border-slate-700/30 opacity-60 cursor-not-allowed'
        }
        ${isSelected ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30' : ''}
      `}
    >
      {/* Available Badge */}
      {!app.available && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-slate-700/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-400">
          Coming Soon
        </div>
      )}

      {/* Icon */}
      <div className={`
        inline-flex p-4 rounded-xl mb-4 bg-gradient-to-br ${app.gradient}
        ${app.available ? 'opacity-100' : 'opacity-50'}
      `}>
        {app.icon}
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-white mb-1">
        {app.name}
      </h3>
      <p className="text-lg text-slate-400 mb-3 font-arabic">
        {app.nameAr}
      </p>

      {/* Description */}
      <p className="text-slate-400 mb-2">
        {app.description}
      </p>
      <p className="text-sm text-slate-500 font-arabic">
        {app.descriptionAr}
      </p>

      {/* Launch Button */}
      {app.available && (
        <button className={`
          mt-4 w-full py-2 rounded-lg font-bold transition-all duration-300
          bg-gradient-to-r ${app.gradient} hover:shadow-lg
        `}>
          Launch App
        </button>
      )}
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ number, label, labelAr }: {
  number: string;
  label: string;
  labelAr: string;
}) {
  return (
    <div className="text-center p-6 bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-xl">
      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-2">
        {number}
      </div>
      <div className="text-slate-300 font-semibold">{label}</div>
      <div className="text-sm text-slate-500 font-arabic">{labelAr}</div>
    </div>
  );
}
