/**
 * Hologram Store
 * Zustand store for managing holographic command center state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  agent: string;
  message: string;
}

interface RevenueData {
  travel: number;
  freelance: number;
  combined: number;
  projected: number;
  growth_rate: number;
}

interface WorkflowStep {
  id: number;
  name: string;
  x: number;
  y: number;
  agent: string;
  active?: boolean;
}

interface HologramState {
  // State
  agents: Agent[];
  revenue: RevenueData;
  systemStatus: any;
  logs: LogEntry[];
  workflowSteps: WorkflowStep[];
  isConnected: boolean;
  lastUpdate: string;

  // Actions
  updateAgents: (agents: Agent[]) => void;
  updateRevenue: (revenue: RevenueData) => void;
  updateSystemStatus: (status: any) => void;
  addLog: (level: LogEntry['level'], agent: string, message: string) => void;
  setWorkflowStep: (stepId: number, active: boolean) => void;
  setConnectionStatus: (connected: boolean) => void;
  clearLogs: () => void;
  reset: () => void;
}

const initialState = {
  agents: [],
  revenue: {
    travel: 0,
    freelance: 0,
    combined: 0,
    projected: 0,
    growth_rate: 0
  },
  systemStatus: {},
  logs: [],
  workflowSteps: [
    { id: 1, name: 'SCAN', x: 50, y: 50, agent: 'sentinel-hunter' },
    { id: 2, name: 'DETECT', x: 250, y: 50, agent: 'sentinel-hunter' },
    { id: 3, name: 'VALIDATE', x: 450, y: 50, agent: 'validator-qc' },
    { id: 4, name: 'SCORE', x: 650, y: 50, agent: 'validator-qc' },
    { id: 5, name: 'DECIDE', x: 350, y: 200, agent: 'nexus-orchestrator' },
    { id: 6, name: 'EXECUTE', x: 350, y: 350, agent: 'nexus-orchestrator' }
  ],
  isConnected: false,
  lastUpdate: new Date().toISOString()
};

export const useHologramStore = create<HologramState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        updateAgents: (agents: Agent[]) => {
          set((state) => ({
            agents,
            lastUpdate: new Date().toISOString()
          }));
        },

        updateRevenue: (revenue: RevenueData) => {
          set((state) => ({
            revenue,
            lastUpdate: new Date().toISOString()
          }));
        },

        updateSystemStatus: (systemStatus: any) => {
          set((state) => ({
            systemStatus,
            lastUpdate: new Date().toISOString()
          }));
        },

        addLog: (level: LogEntry['level'], agent: string, message: string) => {
          const logEntry: LogEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            level,
            agent,
            message
          };

          set((state) => ({
            logs: [...state.logs, logEntry].slice(-100), // Keep only last 100 logs
            lastUpdate: new Date().toISOString()
          }));
        },

        setWorkflowStep: (stepId: number, active: boolean) => {
          set((state) => ({
            workflowSteps: state.workflowSteps.map(step =>
              step.id === stepId ? { ...step, active } : step
            ),
            lastUpdate: new Date().toISOString()
          }));
        },

        setConnectionStatus: (connected: boolean) => {
          set((state) => ({
            isConnected: connected,
            lastUpdate: new Date().toISOString()
          }));
        },

        clearLogs: () => {
          set((state) => ({
            logs: [],
            lastUpdate: new Date().toISOString()
          }));
        },

        reset: () => {
          set(initialState);
        }
      }),
      {
        name: 'hologram-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          agents: state.agents,
          revenue: state.revenue,
          systemStatus: state.systemStatus
        })
      }
    ),
    {
      name: 'hologram-store'
    }
  )
);

// Selectors for optimized re-renders
export const useAgents = () => useHologramStore((state) => state.agents);
export const useRevenue = () => useHologramStore((state) => state.revenue);
export const useSystemStatus = () => useHologramStore((state) => state.systemStatus);
export const useLogs = () => useHologramStore((state) => state.logs);
export const useWorkflowSteps = () => useHologramStore((state) => state.workflowSteps);
export const useConnectionStatus = () => useHologramStore((state) => state.isConnected);

// Action selectors
export const useHologramActions = () => useHologramStore((state) => ({
  updateAgents: state.updateAgents,
  updateRevenue: state.updateRevenue,
  updateSystemStatus: state.updateSystemStatus,
  addLog: state.addLog,
  setWorkflowStep: state.setWorkflowStep,
  setConnectionStatus: state.setConnectionStatus,
  clearLogs: state.clearLogs,
  reset: state.reset
}));

// Computed selectors
export const useSystemMetrics = () => useHologramStore((state) => {
  const agents = state.agents;
  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTasks: agents.reduce((sum, agent) => sum + (agent.metrics?.tasks || 0), 0),
    averageSuccessRate: agents.length > 0 
      ? agents.reduce((sum, agent) => sum + (agent.metrics?.success || 0), 0) / agents.length 
      : 0
  };
});

export const useAgentBreakdown = () => useHologramStore((state) => {
  const breakdown: { [key: string]: number } = {};
  state.agents.forEach(agent => {
    const category = agent.hologram.category;
    breakdown[category] = (breakdown[category] || 0) + 1;
  });
  return breakdown;
});

export const useRecentLogs = (count: number = 10) => useHologramStore((state) => 
  state.logs.slice(-count)
);

export const useActiveWorkflowSteps = () => useHologramStore((state) => 
  state.workflowSteps.filter(step => step.active)
);

export default useHologramStore;

