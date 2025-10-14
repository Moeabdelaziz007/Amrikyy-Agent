import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import HologramWorkflow from '../components/hologram/HologramWorkflow';

/**
 * HologramDemo - Showcase page for the Hologram Workflow System
 * 
 * Demonstrates the real-time AI thinking visualization
 */
const HologramDemo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [key, setKey] = useState(0);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setKey(prev => prev + 1);
    setTimeout(() => setIsActive(true), 100);
  };

  const handleComplete = () => {
    console.log('Hologram workflow completed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-semibold">
            ✨ Signature Feature
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hologram Workflow System
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Watch AI agents think in real-time. Every step, every connection, visualized beautifully.
          </p>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!isActive && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                <Play className="w-5 h-5" />
                Start Demo
              </button>
            )}
            
            {isActive && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Restart
              </button>
            )}
          </div>
        </motion.div>

        {/* Hologram Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HologramWorkflow
            key={key}
            agentName="Amrikyy"
            taskDescription="Planning a 7-day trip to Japan for $2000"
            isActive={isActive}
            onComplete={handleComplete}
          />
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold mb-2 text-blue-400">Real-Time Updates</h3>
            <p className="text-gray-400 text-sm">
              Watch each agent's thinking process unfold step by step in real-time
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold mb-2 text-purple-400">Network Topology</h3>
            <p className="text-gray-400 text-sm">
              Visualize how agents communicate and coordinate with each other
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold mb-2 text-pink-400">Glassmorphism Design</h3>
            <p className="text-gray-400 text-sm">
              Beautiful, modern UI with holographic effects and smooth animations
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HologramDemo;

