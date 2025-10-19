import React from 'react';
import { motion } from 'framer-motion';

export default function CyberpunkAISchoolLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050505] via-[#0D0D0D] to-[#111111] text-white overflow-hidden">
      {/* Neon Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.2)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Holographic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(57,255,20,0.25)_0%,transparent_70%)] blur-3xl opacity-40 animate-pulse" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <h1 className="text-3xl font-space tracking-widest text-[#39FF14]">
          AMRIKYY AI SCHOOL
        </h1>
        <nav className="space-x-8 text-gray-300">
          <a href="#" className="hover:text-[#39FF14] transition">
            Programs
          </a>
          <a href="#" className="hover:text-[#39FF14] transition">
            Labs
          </a>
          <a href="#" className="hover:text-[#39FF14] transition">
            Mentorship
          </a>
          <a href="#" className="hover:text-[#39FF14] transition">
            About
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center py-32 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          <span className="text-[#39FF14]">Quantum Learning</span> for Future AI
          Agents
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="max-w-2xl text-gray-400 text-lg mb-10"
        >
          Where AI learns to code, trade, and think — powered by quantum logic
          and decentralized intelligence.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 rounded-2xl bg-[#39FF14] text-black font-semibold shadow-[0_0_20px_#39FF14] hover:shadow-[0_0_40px_#39FF14] transition"
        >
          Join the Academy
        </motion.button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-10 text-gray-500 text-sm">
        © 2025 AMRIKYY AI Solutions — Quantum Education for Agents
      </footer>
    </div>
  );
}
