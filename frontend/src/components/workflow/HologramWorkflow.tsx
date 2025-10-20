import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Network, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WorkflowStep {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'thinking' | 'processing' | 'complete' | 'error';
  timestamp: number;
  duration?: number;
  data?: any;
}

interface HologramWorkflowProps {
  sessionId?: string;
  onComplete?: (result: any) => void;
}

/**
 * HologramWorkflow - Real-time AI process visualization
 * 
 * Shows users what's happening behind the scenes as AI agents work
 * Features:
 * - 3D hologram-style animation
 * - Real-time WebSocket updates
 * - Agent coordination visualization
 * - Quantum topology connections
 * - Energy flow animations
 */
const HologramWorkflow: React.FC<HologramWorkflowProps> = ({ 
  sessionId = 'demo',
  onComplete 
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Demo mode for showcase
  useEffect(() => {
    if (sessionId === 'demo') {
      runDemoWorkflow();
    } else {
      // Connect to real WebSocket for production
      connectToWorkflowStream(sessionId);
    }

    return () => {
      // Cleanup WebSocket connection
    };
  }, [sessionId]);

  const runDemoWorkflow = () => {
    const demoSteps: Omit<WorkflowStep, 'timestamp'>[] = [
      {
        id: 'step-1',
        agent: 'Amrikyy',
        action: 'Analyzing your travel request...',
        status: 'pending',
      },
      {
        id: 'step-2',
        agent: 'Safar',
        action: 'Researching destinations matching your criteria...',
        status: 'pending',
      },
      {
        id: 'step-3',
        agent: 'Thrifty',
        action: 'Finding best prices for flights and hotels...',
        status: 'pending',
      },
      {
        id: 'step-4',
        agent: 'Thaqafa',
        action: 'Checking cultural guidelines and requirements...',
        status: 'pending',
      },
      {
        id: 'step-5',
        agent: 'Amrikyy',
        action: 'Combining results into perfect itinerary...',
        status: 'pending',
      },
    ];

    // Simulate progressive workflow
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < demoSteps.length) {
        const step = demoSteps[currentIndex];
        
        // Add step as thinking
        setSteps(prev => [...prev, { 
          ...step, 
          id: step.id || `step-${Date.now()}`,
          timestamp: Date.now(),
          status: 'thinking' 
        }]);
        setActiveStep(step.id);

        // After 2 seconds, mark as processing
        setTimeout(() => {
          setSteps(prev => prev.map(s => 
            s.id === step?.id ? { ...s, status: 'processing' } : s
          ));
        }, 1000);

        // After 4 seconds, mark as complete
        setTimeout(() => {
          setSteps(prev => prev.map(s => 
            s.id === step?.id ? { 
              ...s, 
              status: 'complete',
              duration: 3000 
            } : s
          ));
          
          if (currentIndex === demoSteps.length - 1) {
            setActiveStep(null);
            if (onComplete) {
              setTimeout(() => onComplete({ success: true }), 500);
            }
          }
        }, 3000);

        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3500);

    return () => clearInterval(interval);
  };

  const connectToWorkflowStream = (sessionId: string) => {
    // TODO: Connect to actual WebSocket
    // const ws = new WebSocket(`wss://api.amrikyy.com/workflow/${sessionId}`);
    // ws.onmessage = (event) => {
    //   const update = JSON.parse(event.data);
    //   handleWorkflowUpdate(update);
    // };
    setIsConnected(true);
  };

  const getStepIcon = (agent: string) => {
    const icons: Record<string, any> = {
      'Amrikyy': Brain,
      'Safar': Eye,
      'Thrifty': Zap,
      'Thaqafa': Network,
    };
    return icons[agent] || Brain;
  };

  const getAgentColor = (agent: string) => {
    const colors: Record<string, string> = {
      'Amrikyy': '#3B82F6',
      'Safar': '#10B981',
      'Thrifty': '#F59E0B',
      'Thaqafa': '#8B5CF6',
    };
    return colors[agent] || '#3B82F6';
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'thinking':
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-500" />;
    }
  };

  return (
    <div className="relative w-full">
      {/* Hologram Container */}
      <div className="relative p-8 rounded-2xl overflow-hidden glass-effect-enhanced"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Holographic Grid Background */}
        <div className="hologram-grid" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full"
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Workflow Active' : 'Initializing...'}
            </span>
          </motion.div>

          <h3 className="mt-4 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Agents Working
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Watch the magic happen in real-time
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative space-y-4">
          <AnimatePresence>
            {steps.map((step, index) => {
              const Icon = getStepIcon(step.agent);
              const color = getAgentColor(step.agent);
              const isActive = activeStep === step.id;

              return (
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
                    <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gradient-to-b from-blue-500/50 to-transparent" />
                  )}

                  {/* Step Card */}
                  <div
                    className={`relative p-4 rounded-xl transition-all duration-500 ${
                      isActive ? 'scale-105' : ''
                    }`}
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${color}22, ${color}11)`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isActive ? `${color}66` : 'rgba(255, 255, 255, 0.1)'}`,
                      boxShadow: isActive ? `0 0 20px ${color}44` : 'none',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Agent Avatar */}
                      <div className="relative">
                        <motion.div
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 360],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                            boxShadow: isActive ? `0 0 20px ${color}88` : 'none',
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Energy Pulse */}
                        {isActive && (
                          <>
                            <motion.div
                              animate={{
                                scale: [1, 2, 1],
                                opacity: [0.5, 0, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              className="absolute inset-0 rounded-full"
                              style={{
                                border: `2px solid ${color}`,
                              }}
                            />
                            <motion.div
                              animate={{
                                scale: [1, 2.5, 1],
                                opacity: [0.3, 0, 0.3],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: 0.5
                              }}
                              className="absolute inset-0 rounded-full"
                              style={{
                                border: `2px solid ${color}`,
                              }}
                            />
                          </>
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold" style={{ color }}>
                            {step.agent}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{step.id}
                          </span>
                        </div>

                        <p className="text-sm text-gray-300 mb-2">
                          {step.action}
                        </p>

                        {/* Progress Bar */}
                        {(step.status === 'thinking' || step.status === 'processing') && (
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 2, ease: 'linear' }}
                              className="h-full rounded-full"
                              style={{ background: color }}
                            />
                          </div>
                        )}

                        {/* Duration for completed */}
                        {step.status === 'complete' && step.duration && (
                          <div className="text-xs text-gray-500">
                            Completed in {(step.duration / 1000).toFixed(1)}s
                          </div>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                    </div>
                  </div>

                  {/* Particle Effects for Active Step */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            x: Math.random() * 100 - 50,
                            y: Math.random() * 100 - 50,
                            opacity: 0 
                          }}
                          animate={{
                            x: [null, Math.random() * 200 - 100],
                            y: [null, Math.random() * 200 - 100],
                            opacity: [0, 0.8, 0],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="absolute w-1 h-1 rounded-full"
                          style={{ 
                            background: color,
                            left: '50%',
                            top: '50%',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {steps.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p>Initializing AI agents...</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(30px);
          }
        }
      `}</style>
    </div>
  );
};

export default HologramWorkflow;

