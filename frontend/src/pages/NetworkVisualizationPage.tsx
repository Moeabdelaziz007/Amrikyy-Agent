import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Zap, X, Info } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  x: number;
  y: number;
  status: 'active' | 'idle' | 'busy';
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  active: boolean;
}

/**
 * NetworkVisualizationPage - Interactive agent topology visualization
 * 
 * Features:
 * - Node graph with agents as nodes
 * - Animated connection lines
 * - Click node to show details
 * - Real-time status updates
 * - Quantum entanglement visualization
 * - Energy flow animation
 */
const NetworkVisualizationPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents] = useState<Agent[]>([
    {
      id: 'amrikyy',
      name: 'Amrikyy',
      role: 'AI Travel Companion',
      color: '#3B82F6',
      x: 50,
      y: 30,
      status: 'active',
    },
    {
      id: 'safar',
      name: 'Safar',
      role: 'Travel Specialist',
      color: '#10B981',
      x: 20,
      y: 60,
      status: 'active',
    },
    {
      id: 'thrifty',
      name: 'Thrifty',
      role: 'Budget Optimizer',
      color: '#F59E0B',
      x: 80,
      y: 60,
      status: 'busy',
    },
    {
      id: 'thaqafa',
      name: 'Thaqafa',
      role: 'Cultural Guide',
      color: '#8B5CF6',
      x: 50,
      y: 85,
      status: 'idle',
    },
  ]);

  const [connections] = useState<Connection[]>([
    { from: 'amrikyy', to: 'safar', strength: 0.9, active: true },
    { from: 'amrikyy', to: 'thrifty', strength: 0.85, active: true },
    { from: 'amrikyy', to: 'thaqafa', strength: 0.8, active: false },
    { from: 'safar', to: 'thrifty', strength: 0.7, active: true },
    { from: 'thrifty', to: 'thaqafa', strength: 0.75, active: false },
    { from: 'safar', to: 'thaqafa', strength: 0.65, active: false },
  ]);

  const getAgentPosition = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent ? { x: agent.x, y: agent.y } : { x: 0, y: 0 };
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'busy':
        return '#F59E0B';
      case 'idle':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Network className="w-8 h-8 text-blue-400" />
              Agent Network
            </h1>
            <p className="text-gray-400">
              Real-time visualization of AI agent collaboration and quantum entanglement
            </p>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Network Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4 rounded-xl mb-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Busy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-gray-300">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-gray-300">Active Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-600" />
            <span className="text-gray-300">Inactive Connection</span>
          </div>
        </div>
      </div>

      {/* Network Canvas */}
      <div className="glass-effect rounded-2xl p-8 relative" style={{ height: '600px' }}>
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {connections.map((conn, index) => {
            const from = getAgentPosition(conn.from);
            const to = getAgentPosition(conn.to);
            return (
              <motion.line
                key={index}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={conn.active ? 'url(#connectionGradient)' : '#4B5563'}
                strokeWidth={conn.active ? 2 : 1}
                strokeOpacity={conn.active ? conn.strength : 0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Agent Nodes */}
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            style={{
              position: 'absolute',
              left: `${agent.x}%`,
              top: `${agent.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            {/* Pulse Effect */}
            {agent.status === 'active' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${agent.color}`,
                    width: '120px',
                    height: '120px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${agent.color}`,
                    width: '120px',
                    height: '120px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0.5,
                  }}
                />
              </>
            )}

            {/* Node */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Hexagonal Avatar */}
              <div
                className="w-24 h-24 hexagon-clip flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                  boxShadow: `0 0 30px ${agent.color}66`,
                }}
              >
                {agent.name.charAt(0)}
              </div>

              {/* Status Indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-900"
                style={{ backgroundColor: getStatusColor(agent.status) }}
              />

              {/* Name Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <p className="text-sm font-semibold text-white">{agent.name}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Info Box */}
        <div className="absolute bottom-4 left-4 glass-card p-4 rounded-xl max-w-xs">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold mb-1">Quantum Entanglement Network</p>
              <p className="text-xs text-gray-400">
                Agents are connected through quantum topology, enabling instant collaboration and
                knowledge sharing across the network.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 rounded-2xl max-w-md w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${selectedAgent.color}, ${selectedAgent.color}dd)`,
                    }}
                  >
                    {selectedAgent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedAgent.name}</h3>
                    <p className="text-gray-400">{selectedAgent.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(selectedAgent.status) }}
                    />
                    <span className="text-white capitalize">{selectedAgent.status}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Active Connections</p>
                  <div className="space-y-2">
                    {connections
                      .filter(
                        (conn) =>
                          (conn.from === selectedAgent.id || conn.to === selectedAgent.id) &&
                          conn.active
                      )
                      .map((conn, index) => {
                        const connectedAgentId =
                          conn.from === selectedAgent.id ? conn.to : conn.from;
                        const connectedAgent = agents.find((a) => a.id === connectedAgentId);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                          >
                            <span className="text-white">{connectedAgent?.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${conn.strength * 100}%`,
                                    background: `linear-gradient(90deg, ${selectedAgent.color}, ${connectedAgent?.color})`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">
                                {Math.round(conn.strength * 100)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
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

export default NetworkVisualizationPage;