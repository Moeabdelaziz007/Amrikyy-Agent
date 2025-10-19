import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Code2,
  LineChart,
  Network,
  Zap,
  Shield,
  Target,
  Sparkles,
} from 'lucide-react';

export default function AILearningPlatform_Enhanced() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        {/* Header Section */}
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
              size={48}
              className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              AI Learning
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-transparent bg-clip-text">
              Agents Platform
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Where artificial intelligence meets quantum computing, algorithmic
            mastery, and financial intelligence
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Quantum Computing */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            whileHover={{
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 },
            }}
            className="group"
          >
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-all duration-500 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <Network
                    size={56}
                    className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  />
                </motion.div>

                <h3 className="text-2xl font-bold text-center mb-4 text-white">
                  Quantum Computing
                </h3>

                <p className="text-slate-300 text-center leading-relaxed mb-6">
                  Master quantum algorithms with IBM Qiskit, Google Cirq, and
                  Microsoft QDK. Build quantum circuits and explore quantum
                  supremacy.
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {['Qiskit', 'Cirq', 'QDK', 'Quirk'].map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Programming & Algorithms */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            whileHover={{
              scale: 1.05,
              rotateY: -5,
              transition: { duration: 0.3 },
            }}
            className="group"
          >
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <Code2
                    size={56}
                    className="text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                  />
                </motion.div>

                <h3 className="text-2xl font-bold text-center mb-4 text-white">
                  Programming & Algorithms
                </h3>

                <p className="text-slate-300 text-center leading-relaxed mb-6">
                  Solve complex problems with data structures, algorithms, and
                  competitive programming on LeetCode, HackerRank, and
                  Codeforces.
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {['LeetCode', 'HackerRank', 'Codeforces', 'MIT 6.006'].map(
                    (tech, index) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                      >
                        {tech}
                      </motion.span>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI for Trading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            whileHover={{
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 },
            }}
            className="group"
          >
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <LineChart
                    size={56}
                    className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                  />
                </motion.div>

                <h3 className="text-2xl font-bold text-center mb-4 text-white">
                  AI for Trading
                </h3>

                <p className="text-slate-300 text-center leading-relaxed mb-6">
                  Develop intelligent trading strategies using reinforcement
                  learning with FinRL, TensorTrade, and QuantConnect platforms.
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'FinRL',
                    'TensorTrade',
                    'QuantConnect',
                    'Alpha Vantage',
                  ].map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personalization & Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            whileHover={{
              scale: 1.05,
              rotateY: -5,
              transition: { duration: 0.3 },
            }}
            className="group"
          >
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  <Brain
                    size={56}
                    className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                  />
                </motion.div>

                <h3 className="text-2xl font-bold text-center mb-4 text-white">
                  Personalization & Analytics
                </h3>

                <p className="text-slate-300 text-center leading-relaxed mb-6">
                  AI-powered tutors with adaptive learning paths, real-time
                  analytics, and personalized education experiences.
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Adaptive AI',
                    'Learning Analytics',
                    'Personalization',
                    'Real-time Insights',
                  ].map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30 rounded-xl"
          >
            <Zap size={32} className="text-yellow-400 mr-4" />
            <div>
              <h4 className="text-lg font-semibold text-white">
                Lightning Fast
              </h4>
              <p className="text-slate-400 text-sm">Optimized performance</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30 rounded-xl"
          >
            <Shield size={32} className="text-green-400 mr-4" />
            <div>
              <h4 className="text-lg font-semibold text-white">
                Secure & Reliable
              </h4>
              <p className="text-slate-400 text-sm">
                Enterprise-grade security
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30 rounded-xl"
          >
            <Target size={32} className="text-red-400 mr-4" />
            <div>
              <h4 className="text-lg font-semibold text-white">
                Precision Learning
              </h4>
              <p className="text-slate-400 text-sm">
                Targeted skill development
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-300 text-lg"
          >
            Start Your AI Journey
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-20 text-slate-400"
        >
          <p className="text-lg leading-relaxed max-w-4xl mx-auto">
            This cutting-edge AI learning ecosystem combines quantum computing
            mastery, algorithmic intelligence, financial AI expertise, and
            personalized education into one unified, adaptive, and data-driven
            experience that evolves with your learning journey.
          </p>
          <p className="mt-4 text-sm">
            © 2025 AMRIKYY AI Solutions — Revolutionizing AI Education
          </p>
        </motion.div>
      </div>
    </div>
  );
}
