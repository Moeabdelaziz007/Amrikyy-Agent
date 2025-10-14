import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Globe, 
  Wallet, 
  BookOpen, 
  Zap,
  ArrowRight,
  Bot,
  Network,
  Eye,
  CheckCircle
} from 'lucide-react';
import HologramWorkflow from '../components/workflow/HologramWorkflow';

/**
 * LandingPage - Amrikyy Platform Homepage
 * 
 * Design inspiration:
 * - maya-travel-agent.lovable.app (avatar design)
 * - sorare-basic-44568.lovable.app (card grid)
 * 
 * Features:
 * - Hero with main Amrikyy avatar
 * - Agent showcase grid
 * - Live hologram workflow demo
 * - CTA sections
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showWorkflowDemo, setShowWorkflowDemo] = useState(false);

  const agents = [
    {
      id: 'amrikyy',
      name: 'Amrikyy',
      nickname: 'Your AI Companion',
      description: 'Friendly AI travel guide who coordinates all specialists',
      icon: Sparkles,
      color: '#3B82F6',
      features: ['24/7 Assistance', 'Smart Planning', 'Budget Conscious']
    },
    {
      id: 'safar',
      name: 'Safar',
      nickname: 'Travel Specialist',
      description: 'Expert researcher finding perfect destinations and hidden gems',
      icon: Globe,
      color: '#10B981',
      features: ['Destination Research', 'Itinerary Planning', 'Local Insights']
    },
    {
      id: 'thrifty',
      name: 'Thrifty',
      nickname: 'Budget Optimizer',
      description: 'Money-saving wizard finding best deals without compromising quality',
      icon: Wallet,
      color: '#F59E0B',
      features: ['Price Comparison', 'Deal Finding', 'Cost Analysis']
    },
    {
      id: 'thaqafa',
      name: 'Thaqafa',
      nickname: 'Cultural Guide',
      description: 'Cultural sensitivity expert ensuring respectful travel experiences',
      icon: BookOpen,
      color: '#8B5CF6',
      features: ['Cultural Etiquette', 'Religious Guidance', 'Language Basics']
    },
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI Agent Network',
      description: 'Multiple specialized AI agents working together for you'
    },
    {
      icon: Network,
      title: 'Quantum Coordination',
      description: 'Advanced topology system for seamless agent collaboration'
    },
    {
      icon: Eye,
      title: 'Transparent Process',
      description: 'Watch AI agents work in real-time with hologram visualization'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get personalized travel plans in minutes, not hours'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-semibold">
              🚀 Powered by AIX Format v0.2
            </div>
          </motion.div>

          {/* Main Avatar - Hexagonal Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              {/* Hexagon Frame */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  padding: '4px'
                }}
              >
                <div className="w-full h-full bg-slate-900 flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                </div>
              </div>

              {/* Rotating Glow */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, #3B82F6, transparent)',
                  filter: 'blur(20px)',
                  opacity: 0.5,
                }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meet Amrikyy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
          >
            Your AI Travel Companion
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Powered by a network of specialized AI agents working together to plan your perfect trip—on budget, culturally aware, and personally crafted just for you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/chat')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Planning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowWorkflowDemo(!showWorkflowDemo)}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
            >
              {showWorkflowDemo ? 'Hide' : 'Watch'} AI in Action
            </button>
          </motion.div>
        </div>
      </div>

      {/* Workflow Demo Section */}
      {showWorkflowDemo && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <HologramWorkflow sessionId="demo" />
        </motion.div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why Amrikyy is Different
          </h2>
          <p className="text-xl text-gray-400">
            Real AI agents, real collaboration, real results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agent Network Section - Card Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-sm font-semibold border border-blue-500/30">
            🤖 The Team
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Meet Your AI Agents
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Each agent has a unique personality, expertise, and role in creating your perfect trip
          </p>
        </div>

        {/* Agent Cards - Sorare-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              onClick={() => navigate('/agents')}
              className="group cursor-pointer relative"
            >
              <div
                className="p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {/* Agent Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                      boxShadow: `0 4px 20px ${agent.color}44`,
                    }}
                  >
                    <agent.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Agent Info */}
                <h3 className="text-2xl font-bold text-center mb-1">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-400 text-center mb-4">
                  {agent.nickname}
                </p>
                <p className="text-sm text-gray-300 text-center mb-6">
                  {agent.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {agent.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* View Profile Link */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="text-center text-sm font-medium group-hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                    View Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `0 0 40px ${agent.color}66`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/agents')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
          >
            View All Agents →
          </button>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Travel Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of travelers who trust Amrikyy for their perfect trips
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
          >
            Start Your Journey Today
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;

