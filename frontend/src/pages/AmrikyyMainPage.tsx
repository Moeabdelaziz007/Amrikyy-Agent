import { useState } from 'react';
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
  Star,
  Rocket,
  Brain,
  MessageSquare,
  User as UserIcon,
  Workflow,
  Code,
  Database,
  Network as NetworkIcon,
  Cpu,
  BookmarkPlus,
  Mic
} from 'lucide-react';
import AgentIDCard from '../components/identity/AgentIDCard';
import HologramWorkflow from '../components/hologram/HologramWorkflow';
import VoiceControl from '../components/VoiceControl';

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
  iconBg: string;
}

/**
 * AmrikyyMainPage - Modern landing page inspired by Sorare
 * 
 * Features:
 * - Hero with male AI avatar
 * - Sorare-style kit cards grid
 * - Agent showcase
 * - Live hologram workflow demo
 * - Dark glassmorphism design
 */
const AmrikyyMainPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHologramDemo, setShowHologramDemo] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

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

  // Kits/Automations data - Sorare style
  const kits: Kit[] = [
    {
      id: 'agents-kit',
      name: 'AgentsKit',
      description: 'Create and manage AI agents with unique personalities and skills',
      icon: <Bot className="w-6 h-6" />,
      price: 'Free',
      features: ['Custom agents', 'Personality builder', 'Skill management', 'Team coordination'],
      gradient: 'from-blue-500 to-blue-600',
      iconBg: '#3B82F6'
    },
    {
      id: 'chat-kit',
      name: 'ChatKit',
      description: 'Build conversational AI interfaces with natural language processing',
      icon: <MessageSquare className="w-6 h-6" />,
      price: 'Free',
      features: ['Multi-language', 'Context aware', 'Voice support', 'Rich media'],
      gradient: 'from-purple-500 to-purple-600',
      iconBg: '#8B5CF6'
    },
    {
      id: 'workflow-kit',
      name: 'WorkflowKit',
      description: 'Automate complex workflows with visual builder and monitoring',
      icon: <Workflow className="w-6 h-6" />,
      price: 'Free',
      features: ['Visual builder', 'Scheduling', 'Monitoring', 'Integrations'],
      gradient: 'from-green-500 to-green-600',
      iconBg: '#10B981'
    },
    {
      id: 'api-kit',
      name: 'APIKit',
      description: 'Connect to any API instantly with auto-documentation',
      icon: <Code className="w-6 h-6" />,
      price: 'Free',
      features: ['API connectors', 'Auto-docs', 'Rate limiting', 'Webhooks'],
      gradient: 'from-amber-500 to-amber-600',
      iconBg: '#F59E0B'
    },
    {
      id: 'bot-kit',
      name: 'BotKit',
      description: 'Deploy bots on Telegram, WhatsApp, and other platforms',
      icon: <Globe className="w-6 h-6" />,
      price: 'Free',
      features: ['Multi-platform', 'Analytics', 'Auto-responses', 'Broadcasting'],
      gradient: 'from-cyan-500 to-cyan-600',
      iconBg: '#06B6D4'
    },
    {
      id: 'data-kit',
      name: 'DataKit',
      description: 'Process and analyze data with AI-powered insights',
      icon: <Database className="w-6 h-6" />,
      price: 'Free',
      features: ['Data processing', 'AI insights', 'Visualization', 'Export'],
      gradient: 'from-pink-500 to-pink-600',
      iconBg: '#EC4899'
    },
    {
      id: 'network-kit',
      name: 'NetworkKit',
      description: 'Build agent networks with quantum entanglement topology',
      icon: <NetworkIcon className="w-6 h-6" />,
      price: 'Free',
      features: ['Agent networks', 'Topology', 'Collaboration', 'Real-time sync'],
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: '#6366F1'
    },
    {
      id: 'brain-kit',
      name: 'BrainKit',
      description: 'Advanced AI models and neural network configurations',
      icon: <Brain className="w-6 h-6" />,
      price: 'Free',
      features: ['Custom models', 'Training', 'Fine-tuning', 'Deployment'],
      gradient: 'from-red-500 to-red-600',
      iconBg: '#EF4444'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1614189249054-df6749c95f4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5JTIwbmV0d29yayUyMGRpZ2l0YWwlMjBhYnN0cmFjdHxlbnwwfDB8fGJsdWV8MTc2MDM3NDUzM3ww&ixlib=rb-4.1.0&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        {/* Particle effects */}
        {[...Array(20)].map((_, i) => (
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
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block mb-6"
              >
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Built by Gemini
                  </span>
                </div>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-white">Quantum OS</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-300 mb-4">
                The Platform built by Gemini and powered by the first Ai OS system.
              </p>

              <p className="text-lg text-gray-400 mb-8">
                Build, deploy, and manage AI-powered solutions with our comprehensive toolkit
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Get Started Free
                </button>

                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-8 py-4 glass-effect rounded-xl font-semibold text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-5 h-5" />
                  Sign In
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>8 AI Kits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>100+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Avatar Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
                
                {/* Avatar */}
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
                    <img 
                      src="https://i.pravatar.cc/400?img=12"
                      alt="Amrikyy - AI Travel Companion"
                      className="w-full h-full object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent" />
                    
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-white">Online</span>
                    </div>

                    {/* Brand overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Amrikyy</h3>
                          <p className="text-sm text-gray-300">AI Travel Assistant</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">95%</div>
                      <div className="text-xs text-gray-400">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">1.8s</div>
                      <div className="text-xs text-gray-400">Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-xs text-gray-400">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Essential Kits Section - Sorare Style */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Essential AI Kits
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your go-to toolkit for building intelligent automation and AI-powered solutions
            </p>
          </motion.div>

          {/* Kit Cards Grid - Sorare Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kits.map((kit, index) => (
              <motion.div
                key={kit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Bookmark icon */}
                <button className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                  <BookmarkPlus className="w-4 h-4 text-white" />
                </button>

                {/* Card */}
                <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${kit.iconBg}, transparent)`,
                    }}
                  />

                  {/* Icon */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 relative z-10"
                    style={{
                      background: kit.iconBg,
                    }}
                  >
                    {kit.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{kit.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 flex-grow relative z-10">
                    {kit.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-4 relative z-10">
                    {kit.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="w-full py-2.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-all relative z-10">
                    Explore
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* More Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">More to come</h3>
              <p className="text-gray-400 mb-4">
                We're constantly building new kits and tools to boost your AI journey. Stay tuned!
              </p>
              <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                Coming Soon
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet Our Agents Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Meet Our AI Agents
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Specialized AI agents working together to deliver the best travel experience
            </p>
          </motion.div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedAgent(agent)}
                className="glass-card p-6 rounded-2xl cursor-pointer group"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-20 h-20 hexagon-clip flex items-center justify-center text-4xl"
                    style={{
                      background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                    }}
                  >
                    {agent.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-1 text-center">{agent.name}</h3>
                <p className="text-sm text-gray-400 text-center mb-4">{agent.role}</p>
                <p className="text-sm text-gray-300 text-center mb-4">{agent.description}</p>

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

      {/* Voice Control Modal */}
      <AnimatePresence>
        {showVoiceControl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowVoiceControl(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowVoiceControl(false)}
                  className="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="glass-effect rounded-2xl p-6">
                <VoiceControl />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <div className="glass-effect rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {authMode === 'login' ? 'Sign In' : 'Get Started'}
                  </h2>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  >
                    {authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                  </button>
                  
                  <div className="text-center text-gray-400 text-sm">
                    Authentication system will be integrated here
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmrikyyMainPage;