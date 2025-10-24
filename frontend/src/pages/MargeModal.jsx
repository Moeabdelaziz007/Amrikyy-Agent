import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Code, Mail, X } from 'lucide-react';

const subAgents = [
  {
    title: 'Content Creator',
    description:
      'Generate engaging marketing copy, social media posts, and articles.',
    icon: Megaphone,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'Code Assistant',
    description:
      'Get help with code snippets, debugging, and technical explanations.',
    icon: Code,
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    title: 'Email Helper',
    description:
      'Draft professional emails, summarize threads, and manage your inbox.',
    icon: Mail,
    gradient: 'from-purple-500 to-pink-500',
  },
];

const MargeModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-slate-800/50 border border-white/20 rounded-3xl w-full max-w-4xl p-8"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">Marge's Mini-Apps</h2>
          <p className="text-white/70 mt-2">
            Your AI-powered productivity suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subAgents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br ${agent.gradient}`}
              >
                <agent.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{agent.title}</h3>
              <p className="text-sm text-white/60 mt-1">{agent.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MargeModal;
