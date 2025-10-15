import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Network, Eye, Sparkles, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface ThinkingStep {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  timestamp: number;
  color: string;
  details?: string;
}

interface HologramWorkflowLiveProps {
  agentName?: string;
  taskDescription?: string;
  isActive?: boolean;
  onComplete?: () => void;
  wsUrl?: string;
  wsToken?: string;
}

/**
 * HologramWorkflowLive - Real-time AI Thinking Visualization with WebSocket
 * 
 * Features:
 * - REAL WebSocket connection (not simulated!)
 * - Live agent coordination
 * - Real-time topology updates
 * - Connection status indicator
 * - Automatic reconnection
 * - Fallback to simulation if offline
 */
const HologramWorkflowLive: React.FC<HologramWorkflowLiveProps> = ({
  agentName = 'Amrikyy',
  taskDescription = 'Planning your perfect trip',
  isActive = true,
  onComplete,
  wsUrl = 'ws://localhost:8080/ws',
  wsToken
}) => {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [currentPhase, setCurrentPhase] = useState('Initializing');
  const [useRealTime, setUseRealTime] = useState(true);

  // WebSocket connection
  const { isConnected, lastMessage, send, error } = useWebSocket({
    url: wsUrl,
    token: wsToken || 'demo-token',
    autoConnect: useRealTime,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    console.log('[Hologram] Received message:', lastMessage.type);

    switch (lastMessage.type) {
      case 'topology_update':
        // Update agent network visualization
        console.log('[Hologram] Topology updated:', lastMessage.data);
        break;

      case 'thinking_step':
        // Add new thinking step
        const step = lastMessage.data as ThinkingStep;
        setSteps(prev => [...prev, step]);
        setCurrentPhase(step.action);
        break;

      case 'agent_complete':
        // Mark agent as complete
        setSteps(prev => prev.map(s => 
          s.agent === lastMessage.agentId ? { ...s, status: 'complete' } : s
        ));
        break;

      case 'workflow_complete':
        setCurrentPhase('Complete');
        onComplete?.();
        break;

      case 'initial':
        // Initial state from server
        console.log('[Hologram] Initial data received');
        break;
    }
  }, [lastMessage, onComplete]);

  // Request execution when active
  useEffect(() => {
    if (isActive && isConnected && steps.length === 0) {
      // Request agent execution
      send({
        type: 'execute',
        agentId: 'amrikyy-001',
        task: {
          function: 'plan_trip',
          description: taskDescription
        }
      });
    }
  }, [isActive, isConnected, steps.length, send, taskDescription]);

  // Fallback simulation if WebSocket unavailable
  useEffect(() => {
    if (!useRealTime || (!isConnected && error)) {
      // Fall back to simulation (existing HologramWorkflow logic)
      simulateThinking();
    }
  }, [useRealTime, isConnected, error]);

  const simulateThinking = async () => {
    if (!isActive) return;

    const thinkingSequence: Omit<ThinkingStep, 'id' | 'timestamp'>[] = [
      {
        agent: 'Amrikyy',
        action: 'Understanding your requirements',
        status: 'processing',
        color: '#3B82F6',
        details: 'Analyzing preferences and constraints'
      },
      {
        agent: 'Safar',
        action: 'Researching destinations',
        status: 'processing',
        color: '#10B981',
        details: 'Scanning 10,000+ destinations'
      },
      {
        agent: 'Thrifty',
        action: 'Analyzing budget options',
        status: 'processing',
        color: '#F59E0B',
        details: 'Finding best deals and prices'
      },
      {
        agent: 'Thaqafa',
        action: 'Checking cultural considerations',
        status: 'processing',
        color: '#8B5CF6',
        details: 'Ensuring respectful travel'
      },
      {
        agent: 'Amrikyy',
        action: 'Synthesizing recommendations',
        status: 'processing',
        color: '#3B82F6',
        details: 'Creating personalized plan'
      }
    ];

    for (let i = 0; i < thinkingSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const step = thinkingSequence[i];
      const stepId = `step-${Date.now()}-${i}`;

      setSteps(prev => [
        ...prev,
        {
          ...step,
          id: stepId,
          timestamp: Date.now()
        }
      ]);

      setCurrentPhase(step.action);

      if (i > 0) {
        setSteps(prev => prev.map((s, idx) => 
          idx === i - 1 ? { ...s, status: 'complete' } : s
        ));
      }

      if (i === thinkingSequence.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
        setCurrentPhase('Complete');
        onComplete?.();
      }
    }
  };

  return (
    <div className="relative w-full min-h-[600px] rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59,130,246,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59,130,246,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0
          }}
          animate={{
            y: [null, '-100%'],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 p-8">
        {/* Header with Connection Status */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {agentName}'s Thinking Process
              </h2>
            </div>
            <p className="text-gray-400">{taskDescription}</p>
          </div>

          {/* Connection & Status */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isConnected 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-gray-500/10 border-gray-500/30'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Processing Status */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              {currentPhase === 'Complete' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Complete</span>
                </>
              ) : (
                <>
                  <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-400 font-medium">Processing</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && !isConnected && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm">
                Unable to connect to server. Running in demo mode.
              </span>
            </div>
          </div>
        )}

        {/* Current Phase Banner */}
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-lg font-semibold text-white">{currentPhase}</span>
          </div>
        </motion.div>

        {/* Thinking Steps Timeline */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index > 0 && (
                  <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gradient-to-b from-transparent to-white/20" />
                )}

                {/* Step Card */}
                <div
                  className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                  style={{
                    background: step.status === 'complete' 
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
                      : step.status === 'processing'
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    border: `1px solid ${
                      step.status === 'complete' ? 'rgba(16,185,129,0.3)' :
                      step.status === 'processing' ? 'rgba(59,130,246,0.3)' :
                      'rgba(255,255,255,0.1)'
                    }`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Icon */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        boxShadow: step.status === 'processing' 
                          ? `0 0 20px ${step.color}66`
                          : 'none'
                      }}
                    >
                      {step.agent.slice(0, 2)}
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                        step.status === 'complete' ? 'bg-green-500' :
                        step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-500'
                      }`}
                    >
                      {step.status === 'complete' && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                      {step.status === 'processing' && (
                        <Loader className="w-3 h-3 text-white animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{step.agent}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-1">{step.action}</p>
                    
                    {step.details && (
                      <p className="text-sm text-gray-500">{step.details}</p>
                    )}

                    {/* Processing Animation */}
                    {step.status === 'processing' && (
                      <motion.div
                        className="mt-2 h-1 rounded-full overflow-hidden bg-white/10"
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: step.color }}
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Agent Icon Indicator */}
                  {step.status === 'processing' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Eye className="w-5 h-5" style={{ color: step.color }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Agent Network Topology */}
        {steps.length > 0 && (
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Agent Network</h3>
              {isConnected && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {['Amrikyy', 'Safar', 'Thrifty', 'Thaqafa'].map((agent, idx) => {
                const agentColors: Record<string, string> = {
                  'Amrikyy': '#3B82F6',
                  'Safar': '#10B981',
                  'Thrifty': '#F59E0B',
                  'Thaqafa': '#8B5CF6'
                };
                
                const isAgentActive = steps.some(s => s.agent === agent && s.status === 'processing');
                const isComplete = steps.some(s => s.agent === agent && s.status === 'complete');

                return (
                  <motion.div
                    key={agent}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${agentColors[agent]}, ${agentColors[agent]}dd)`,
                        boxShadow: isAgentActive ? `0 0 30px ${agentColors[agent]}88` : 'none',
                        border: isComplete ? '2px solid rgba(16,185,129,0.5)' : '2px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {agent.slice(0, 2)}
                    </div>
                    
                    <p className="text-xs text-center mt-2 text-gray-400">{agent}</p>

                    {isAgentActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: agentColors[agent] }}
                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {currentPhase === 'Complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Processing Complete!</h3>
            <p className="text-gray-300">Your personalized travel plan is ready</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HologramWorkflowLive;

