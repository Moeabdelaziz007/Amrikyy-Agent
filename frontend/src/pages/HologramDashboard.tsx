/**
 * Holographic Command Center Dashboard
 * Real-time 3D visualization of the multi-agent system
 * Cyberpunk-themed interface with WebSocket integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHologramWebSocket } from '../hooks/useHologramWebSocket';
import { useHologramStore } from '../stores/hologramStore';
import AgentCard from '../components/hologram/AgentCard';
import WorkflowCanvas from '../components/hologram/WorkflowCanvas';
import SpaceBackground from '../components/hologram/SpaceBackground';
import RevenueDisplay from '../components/hologram/RevenueDisplay';
import SystemLog from '../components/hologram/SystemLog';
import './HologramDashboard.css';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'processing' | 'idle';
  hologram: {
    displayName: string;
    icon: string;
    color: string;
    category: string;
    description: string;
  };
  metrics?: {
    load: number;
    tasks: number;
    success: number;
  };
}

interface WorkflowStep {
  id: number;
  name: string;
  x: number;
  y: number;
  agent: string;
  active?: boolean;
}

interface RevenueData {
  travel: number;
  freelance: number;
  combined: number;
  projected: number;
  growth_rate: number;
}

const HologramDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [revenue, setRevenue] = useState<RevenueData>({
    travel: 0,
    freelance: 0,
    combined: 0,
    projected: 0,
    growth_rate: 0
  });
  const [systemStatus, setSystemStatus] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const {
    connect,
    disconnect,
    sendCommand,
    subscribe,
    unsubscribe
  } = useHologramWebSocket();

  const {
    updateAgents,
    updateRevenue,
    updateSystemStatus,
    addLog,
    setWorkflowStep
  } = useHologramStore();

  // Initialize workflow steps
  useEffect(() => {
    const steps: WorkflowStep[] = [
      { id: 1, name: 'SCAN', x: 50, y: 50, agent: 'sentinel-hunter' },
      { id: 2, name: 'DETECT', x: 250, y: 50, agent: 'sentinel-hunter' },
      { id: 3, name: 'VALIDATE', x: 450, y: 50, agent: 'validator-qc' },
      { id: 4, name: 'SCORE', x: 650, y: 50, agent: 'validator-qc' },
      { id: 5, name: 'DECIDE', x: 350, y: 200, agent: 'nexus-orchestrator' },
      { id: 6, name: 'EXECUTE', x: 350, y: 350, agent: 'nexus-orchestrator' }
    ];
    setWorkflowSteps(steps);
  }, []);

  // WebSocket connection and event handling
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('🔗 Connected to Holographic Command Center');
      
      // Subscribe to all relevant topics
      subscribe(['agent:*', 'task:*', 'revenue:*', 'workflow:*', 'system:*']);
      
      // Request initial data
      sendCommand('get_system_status', {});
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Disconnected from Holographic Command Center');
    };

    const handleMessage = (message: any) => {
      console.log('📡 Received message:', message.type);
      
      switch (message.type) {
        case 'agent:created':
          loadAgents();
          break;
        case 'agent:updated':
          loadAgents();
          break;
        case 'agent:deleted':
          loadAgents();
          break;
        case 'task:completed':
          loadAgents();
          addLog('info', message.task.agent_id, `Task ${message.task.command} completed`);
          break;
        case 'task:failed':
          addLog('error', message.task.agent_id, `Task ${message.task.command} failed`);
          break;
        case 'revenue:updated':
          setRevenue(message.revenue);
          updateRevenue(message.revenue);
          break;
        case 'workflow:step':
          setWorkflowStep(message.step.id, true);
          setTimeout(() => setWorkflowStep(message.step.id, false), 2000);
          break;
        case 'system:initialized':
          addLog('info', 'system', message.message);
          break;
        case 'hunt:started':
          addLog('info', 'system', 'Money Hunt sequence initiated');
          break;
        case 'hunt:completed':
          addLog('success', 'system', 'Money Hunt sequence completed');
          break;
        case 'pipeline:started':
          addLog('info', 'system', 'Full pipeline execution initiated');
          break;
        case 'pipeline:completed':
          addLog('success', 'system', 'Full pipeline execution completed');
          break;
        default:
          console.log('Unhandled message type:', message.type);
      }
    };

    // Connect to WebSocket
    connect(handleMessage, handleConnect, handleDisconnect);

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, sendCommand, subscribe, updateRevenue, addLog, setWorkflowStep]);

  // Load agents from API
  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/hologram/agents');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data);
        updateAgents(data.data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }, [updateAgents]);

  // Load revenue data
  const loadRevenue = useCallback(async () => {
    try {
      const response = await fetch('/api/hologram/revenue');
      const data = await response.json();
      
      if (data.success) {
        setRevenue(data.data);
        updateRevenue(data.data);
      }
    } catch (error) {
      console.error('Failed to load revenue:', error);
    }
  }, [updateRevenue]);

  // Load system status
  const loadSystemStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/hologram/health');
      const data = await response.json();
      
      if (data.success) {
        setSystemStatus(data.data);
        updateSystemStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  }, [updateSystemStatus]);

  // Command handlers
  const handleStartHunt = async () => {
    try {
      await sendCommand('start_hunt', {});
      addLog('info', 'system', 'Starting Money Hunt sequence...');
    } catch (error) {
      console.error('Failed to start hunt:', error);
    }
  };

  const handleTestAgent = async (agentType: string) => {
    const agent = agents.find(a => a.type === agentType);
    if (!agent) return;

    try {
      const command = getTestCommand(agentType);
      await sendCommand('command', { agentId: agent.id, command, params: {} });
      addLog('info', agent.name, `Testing ${agent.hologram.displayName}...`);
    } catch (error) {
      console.error('Failed to test agent:', error);
    }
  };

  const handleRunFullPipeline = async () => {
    try {
      await sendCommand('run_full_pipeline', {});
      addLog('info', 'system', 'Executing full pipeline...');
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    }
  };

  const getTestCommand = (agentType: string): string => {
    const commands: { [key: string]: string } = {
      'nexus-orchestrator': 'generate_report',
      'sentinel-hunter': 'scan_platforms',
      'validator-qc': 'batch_validate',
      'travel-researcher': 'search_flights',
      'booking-agent': 'process_booking',
      'customer-service': 'customer_support',
      'data-analyst': 'analyze_trends'
    };
    return commands[agentType] || 'test';
  };

  // Calculate system metrics
  const systemMetrics = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTasks: agents.reduce((sum, agent) => sum + (agent.metrics?.tasks || 0), 0),
    averageSuccessRate: agents.length > 0 
      ? agents.reduce((sum, agent) => sum + (agent.metrics?.success || 0), 0) / agents.length 
      : 0
  };

  return (
    <div className="hologram-dashboard">
      <SpaceBackground />
      
      <div className="hologram-container">
        {/* Header */}
        <div className="header">
          <h1>⚡ MONEY HUNTER ⚡</h1>
          <div className="subtitle">HOLOGRAPHIC COMMAND CENTER</div>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-item">
            <div className="status-label">OPPORTUNITIES</div>
            <div className="status-value">{systemStatus.opportunities || 0}</div>
          </div>
          <div className="status-item">
            <div className="status-label">VALIDATED</div>
            <div className="status-value">{systemStatus.validated || 0}</div>
          </div>
          <div className="status-item">
            <div className="status-label">ACTIVE AGENTS</div>
            <div className="status-value">{systemMetrics.activeAgents}</div>
          </div>
          <div className="status-item">
            <div className="status-label">SYSTEM STATUS</div>
            <div className="status-value" style={{ color: '#0f0' }}>
              {systemStatus.health_status || 'ONLINE'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <button className="btn" onClick={handleStartHunt}>
            🚀 START HUNT
          </button>
          <button className="btn" onClick={() => handleTestAgent('nexus-orchestrator')}>
            🧠 TEST NEXUS
          </button>
          <button className="btn" onClick={() => handleTestAgent('sentinel-hunter')}>
            🔍 TEST SENTINEL
          </button>
          <button className="btn" onClick={() => handleTestAgent('validator-qc')}>
            ✅ TEST VALIDATOR
          </button>
          <button className="btn" onClick={handleRunFullPipeline}>
            ⚡ FULL PIPELINE
          </button>
        </div>

        {/* Agents Grid */}
        <div className="agents-grid">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onTest={() => handleTestAgent(agent.type)}
            />
          ))}
        </div>

        {/* Workflow Canvas */}
        <div className="workflow-canvas">
          <div className="workflow-title">🌌 HOLOGRAPHIC WORKFLOW VISUALIZATION 🌌</div>
          <WorkflowCanvas
            steps={workflowSteps}
            connections={[
              { from: 1, to: 2 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 6 }
            ]}
          />
        </div>
      </div>

      {/* Revenue Display */}
      <RevenueDisplay revenue={revenue} />

      {/* System Log */}
      <SystemLog logs={logs} />
    </div>
  );
};

export default HologramDashboard;

