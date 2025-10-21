import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Circle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle';
}

interface AgentStatusListProps {
  agents: Agent[];
}

export const AgentStatusList: React.FC<AgentStatusListProps> = ({ agents }) => {
  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/80 to-slate-900/95 backdrop-blur-xl" />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-xl border border-cyan-500/20" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Agent Status</h3>
            <p className="text-sm text-slate-400">
              {activeCount} of {agents.length} active
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Circle className="w-2 h-2 fill-cyan-400 text-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-400">Live</span>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="relative group"
            >
              {/* Agent Card */}
              <div className="relative rounded-lg overflow-hidden">
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  agent.status === 'active'
                    ? 'from-cyan-500/5 to-purple-500/5'
                    : 'from-slate-800/30 to-slate-700/30'
                } backdrop-blur-sm`} />
                
                {/* Border */}
                <div className={`absolute inset-0 rounded-lg border ${
                  agent.status === 'active'
                    ? 'border-cyan-500/20 group-hover:border-cyan-500/40'
                    : 'border-slate-700/30 group-hover:border-slate-600/50'
                } transition-colors`} />

                {/* Content */}
                <div className="relative p-4 flex items-center gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${
                    agent.status === 'active'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-700/30 text-slate-500'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {agent.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {agent.role}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    agent.status === 'active'
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-slate-700/30 border border-slate-600/30'
                  }`}>
                    <Circle className={`w-1.5 h-1.5 ${
                      agent.status === 'active'
                        ? 'fill-green-400 text-green-400 animate-pulse'
                        : 'fill-slate-500 text-slate-500'
                    }`} />
                    <span className={`text-xs font-medium ${
                      agent.status === 'active' ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {agent.status === 'active' ? 'Active' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-sm font-medium text-cyan-400 transition-all"
          >
            Manage Agents
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AgentStatusList;
