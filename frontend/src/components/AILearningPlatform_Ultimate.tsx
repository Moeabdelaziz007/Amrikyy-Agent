import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Code2,
  LineChart,
  Network,
  Zap,
  Shield,
  Target,
  Sparkles,
  ChevronRight,
  Play,
  BookOpen,
  Trophy,
  Users,
  TrendingUp,
  Star,
} from 'lucide-react';

export default function AILearningPlatform_Ultimate() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] relative overflow-hidden">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 left-1/3 w-48 h-48 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-2xl"
        />

        {/* Animated Grid */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkles
              size={56}
              className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-7xl md:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              AI Learning
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              Agents Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8"
          >
            Where artificial intelligence meets quantum computing, algorithmic
            mastery, and financial intelligence
          </motion.p>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center gap-8 mb-8"
          >
            {[
              { icon: Users, label: '10K+', desc: 'Active Learners' },
              { icon: BookOpen, label: '500+', desc: 'Courses' },
              { icon: Trophy, label: '95%', desc: 'Success Rate' },
              { icon: TrendingUp, label: '24/7', desc: 'Support' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon size={32} className="text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-400">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: Network,
              title: 'Quantum Computing',
              description:
                'Master quantum algorithms with IBM Qiskit, Google Cirq, and Microsoft QDK. Build quantum circuits and explore quantum supremacy.',
              tech: ['Qiskit', 'Cirq', 'QDK', 'Quirk'],
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30',
              shadow: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]',
              iconColor: 'text-cyan-400',
              iconShadow: 'drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]',
            },
            {
              icon: Code2,
              title: 'Programming & Algorithms',
              description:
                'Solve complex problems with data structures, algorithms, and competitive programming on LeetCode, HackerRank, and Codeforces.',
              tech: ['LeetCode', 'HackerRank', 'Codeforces', 'MIT 6.006'],
              gradient: 'from-blue-500/20 to-indigo-500/20',
              border: 'border-blue-500/30',
              shadow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
              iconColor: 'text-blue-400',
              iconShadow: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
            },
            {
              icon: LineChart,
              title: 'AI for Trading',
              description:
                'Develop intelligent trading strategies using reinforcement learning with FinRL, TensorTrade, and QuantConnect platforms.',
              tech: ['FinRL', 'TensorTrade', 'QuantConnect', 'Alpha Vantage'],
              gradient: 'from-emerald-500/20 to-teal-500/20',
              border: 'border-emerald-500/30',
              shadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
              iconColor: 'text-emerald-400',
              iconShadow: 'drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]',
            },
            {
              icon: Brain,
              title: 'Personalization & Analytics',
              description:
                'AI-powered tutors with adaptive learning paths, real-time analytics, and personalized education experiences.',
              tech: [
                'Adaptive AI',
                'Learning Analytics',
                'Personalization',
                'Real-time Insights',
              ],
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30',
              shadow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
              iconColor: 'text-purple-400',
              iconShadow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]',
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group cursor-pointer"
            >
              <div
                className={`relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border ${card.border} rounded-2xl shadow-2xl ${card.shadow} transition-all duration-500 overflow-hidden h-full`}
              >
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  initial={{ scale: 0 }}
                  animate={{ scale: hoveredCard === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    variants={iconVariants}
                    initial="idle"
                    whileHover="hover"
                    className="flex justify-center mb-6"
                  >
                    <card.icon
                      size={64}
                      className={`${card.iconColor} ${card.iconShadow}`}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-center mb-4 text-white">
                    {card.title}
                  </h3>

                  <p className="text-slate-300 text-center leading-relaxed mb-6">
                    {card.description}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {card.tech.map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + techIndex * 0.1 }}
                        className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600/30 backdrop-blur-sm"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <AnimatePresence>
                  {hoveredCard === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Optimized performance',
              color: 'text-yellow-400',
            },
            {
              icon: Shield,
              title: 'Secure & Reliable',
              desc: 'Enterprise-grade security',
              color: 'text-green-400',
            },
            {
              icon: Target,
              title: 'Precision Learning',
              desc: 'Targeted skill development',
              color: 'text-red-400',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="flex items-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30 rounded-xl hover:border-slate-500/50 transition-all duration-300"
            >
              <feature.icon size={40} className={`${feature.color} mr-6`} />
              <div>
                <h4 className="text-xl font-semibold text-white">
                  {feature.title}
                </h4>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 50px rgba(34,211,238,0.5)',
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-16 py-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl text-xl overflow-hidden"
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Play size={24} />
              Start Your AI Journey
              <ChevronRight size={24} />
            </div>
          </motion.button>
        </motion.div>

        {/* Enhanced Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-20 text-slate-400"
        >
          <div className="flex justify-center gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className="text-yellow-400 fill-current"
              />
            ))}
          </div>
          <p className="text-xl leading-relaxed max-w-5xl mx-auto mb-6">
            This cutting-edge AI learning ecosystem combines quantum computing
            mastery, algorithmic intelligence, financial AI expertise, and
            personalized education into one unified, adaptive, and data-driven
            experience that evolves with your learning journey.
          </p>
          <p className="text-lg">
            © 2025 AMRIKYY AI Solutions — Revolutionizing AI Education
          </p>
        </motion.div>
      </div>
    </div>
  );
}
