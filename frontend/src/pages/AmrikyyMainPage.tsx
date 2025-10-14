import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Bot, 
  Zap, 
  Globe, 
  Shield,
  ArrowRight,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import AgentIDCard from '../components/identity/AgentIDCard';
import HologramWorkflow from '../components/hologram/HologramWorkflow';

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
  description: string;
  skills: { name: string; level: number; }[];
}

interface Kit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  features: string[];
  gradient: string;
}

/**
 * AmrikyyMainPage - Stunning main landing page
 * 
 * Features:
 * - Hero with animated avatar
 * - Sorare-style agent cards grid
 * - Kit marketplace cards
 * - Live hologram workflow demo
 * - Trust indicators & stats
 * - Dark glassmorphism throughout
 */
const AmrikyyMainPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHologramDemo, setShowHologramDemo] = useState(false);

  // Agents data
  const agents: Agent[] = [
    {
      id: 'amrikyy-001',
      name: 'Amrikyy',
      role: 'AI Travel Companion',
      color: '#3B82F6',
      icon: '🌟',
      description: 'Your friendly AI guide for perfect trips',
      skills: [
        { name: 'Trip Planning', level: 95 },
        { name: 'Conversation', level: 93 },
        { name: 'Coordination', level: 92 }
      ]
    },
    {
      id: 'safar-001',
      name: 'Safar',
      role: 'Travel Specialist',
      color: '#10B981',
      icon: '🗺️',
      description: 'Expert destination researcher',
      skills: [
        { name: 'Research', level: 96 },
        { name: 'Hidden Gems', level: 93 },
        { name: 'Itineraries', level: 92 }
      ]
    },
    {
      id: 'thrifty-001',
      name: 'Thrifty',
      role: 'Budget Optimizer',
      color: '#F59E0B',
      icon: '💰',
      description: 'Money-saving wizard',
      skills: [
        { name: 'Cost Analysis', level: 98 },
        { name: 'Deal Finding', level: 91 },
        { name: 'Budget Planning', level: 95 }
      ]
    },
    {
      id: 'thaqafa-001',
      name: 'Thaqafa',
      role: 'Cultural Guide',
      color: '#8B5CF6',
      icon: '🕌',
      description: 'Cultural sensitivity expert',
      skills: [
        { name: 'Cultural Etiquette', level: 97 },
        { name: 'Religious Guidance', level: 95 },
        { name: 'Local Customs', level: 94 }
      ]
    }
  ];

  // Kits data
  const kits: Kit[] = [
    {
      id: 'agents-kit',
      name: 'AgentsKit',
      description: 'Create and manage AI agents with personalities',
      icon: <Bot className="w-8 h-8" />,
      price: '$29/mo',
      features: ['Custom agents', 'Personality builder', 'Skill management'],
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'api-kit',
      name: 'APIKit',
      description: 'Connect to any API instantly',
      icon: <Zap className="w-8 h-8" />,
      price: '$49/mo',
      features: ['API connectors', 'Auto-documentation', 'Rate limiting'],
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'bot-kit',
      name: 'BotKit',
      description: 'Deploy Telegram & WhatsApp bots',
      icon: <Globe className="w-8 h-8" />,
      price: '$39/mo',
      features: ['Multi-platform', 'Analytics', 'Auto-responses'],
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'automation-kit',
      name: 'AutomationKit',
      description: 'Automate workflows visually',
      icon: <Shield className="w-8 h-8" />,
      price: '$59/mo',
      features: ['Visual builder', 'Scheduling', 'Monitoring'],
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Particle Background */}
      <div className="particle-field">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [null, '-100%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Powered by Quantum AI Intelligence
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="amrikyy-text">Meet Amrikyy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Your AI Travel Companion with a Soul
            <br />
            <span className="text-gray-400 text-lg">
              Plan trips • Save money • Respect cultures
            </span>
          </motion.p>

          {/* Avatar - Hexagonal with Breathing Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12 flex justify-center"
          >
            <div className="relative">
              {/* Hexagonal Avatar */}
              <div className="w-64 h-64 hexagon-clip bg-gradient-to-br from-blue-500 to-purple-500 p-1 animate-breathing">
                <div className="w-full h-full hexagon-clip bg-slate-900 flex items-center justify-center">
                  <span className="text-8xl">🌟</span>
                </div>
              </div>

              {/* Glow Ring */}
              <motion.div
                className="absolute inset-0 hexagon-clip border-2 border-blue-500/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Status Indicator */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse" />
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setShowHologramDemo(true)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
            >
              Watch AI Think Live
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>

            <button className="px-8 py-4 glass-effect rounded-xl font-semibold text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              Meet the Team
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>100+ travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>1,000+ trips planned</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet Our Agents Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-6 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-full">
              <span className="text-sm font-semibold text-blue-400">🤖 Our AI Team</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Meet Our AI Agents
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every agent has personality, expertise, and purpose
            </p>
          </motion.div>

          {/* Agent Cards Grid (Sorare-style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.03 }}
                onClick={() => setSelectedAgent(agent)}
                role="button"
                tabIndex={0}
                aria-label={`View ${agent.name}'s profile - ${agent.role}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedAgent(agent);
                  }
                }}
                className="glass-card p-6 rounded-2xl cursor-pointer group relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {/* Card Glow on Hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 40px ${agent.color}66`,
                  }}
                />

                {/* Icon/Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20">
                    <div
                      className="w-full h-full hexagon-clip flex items-center justify-center text-4xl"
                      style={{
                        background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                        boxShadow: `0 4px 12px ${agent.color}33`,
                      }}
                    >
                      {agent.icon}
                    </div>

                    {/* Status Dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.role}</p>
                </div>

                <p className="text-sm text-gray-300 text-center mb-4">
                  {agent.description}
                </p>

                {/* Skills Preview */}
                <div className="space-y-2 mb-4">
                  {agent.skills.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: agent.color }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{skill.level}%</span>
                    </div>
                  ))}
                </div>

                {/* View Button */}
                <button
                  className="w-full py-2.5 rounded-xl font-medium text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${agent.color}dd, ${agent.color}aa)`,
                  }}
                >
                  View Profile
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hologram Workflow Feature Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4 px-6 py-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-full">
              <span className="text-sm font-semibold text-purple-400">✨ Signature Feature</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Watch AI Think in Real-Time
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See every thought, every connection, visualized beautifully
            </p>
          </motion.div>

          {/* Hologram Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <HologramWorkflow
              agentName="Amrikyy"
              taskDescription="Planning a 7-day trip to Japan for $2000"
              isActive={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Service Kits Marketplace */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-6 py-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-full">
              <span className="text-sm font-semibold text-amber-400">🛠️ Plug & Play</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Service Marketplace
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ready-to-use AI kits for automation
            </p>
          </motion.div>

          {/* Kit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kits.map((kit, index) => (
              <motion.div
                key={kit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card p-6 rounded-2xl group"
              >
                {/* Icon */}
                <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${kit.gradient} flex items-center justify-center text-white`}>
                  {kit.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">{kit.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{kit.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {kit.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{kit.price}</span>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors">
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'AI Agents', value: '4', icon: Bot },
              { label: 'Success Rate', value: '94.8%', icon: TrendingUp },
              { label: 'Avg Response', value: '1.8s', icon: Zap },
              { label: 'Travelers', value: '100+', icon: Users },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-6 rounded-xl text-center"
              >
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent ID Card Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAgent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AgentIDCard
                agent={selectedAgent as any}
                onClose={() => setSelectedAgent(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hologram Demo Modal */}
      <AnimatePresence>
        {showHologramDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHologramDemo(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl"
            >
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowHologramDemo(false)}
                  className="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
              <HologramWorkflow
                agentName="Amrikyy"
                taskDescription="Planning your perfect trip with quantum intelligence"
                isActive={true}
                onComplete={() => console.log('Demo complete!')}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmrikyyMainPage;

