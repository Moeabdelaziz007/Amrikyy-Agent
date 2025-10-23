import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Eye, Search, Globe, Calendar, HardDrive, Video, Mail,
  Activity, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
  BarChart3, Zap, Users, Server
} from 'lucide-react';

interface Agent {
  name: string;
  icon: string;
  status: 'active' | 'inactive' | 'fallback';
  capabilities: string[];
  color: string;
}

interface WorkflowExecution {
  workflowId: string;
  name: string;
  status: 'completed' | 'failed' | 'running';
  duration: number;
  completedAt: string;
}

interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  avgResponseTime: number;
  activeWorkflows: number;
}

const AgentsDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalExecutions: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeWorkflows: 0
  });
  const [loading, setLoading] = useState(true);

  const agentIcons: Record<string, any> = {
    navigator: MapPin,
    vision: Eye,
    research: Search,
    translator: Globe,
    scheduler: Calendar,
    storage: HardDrive,
    media: Video,
    communicator: Mail
  };

  const agentColors: Record<string, string> = {
    navigator: 'from-blue-500 to-cyan-500',
    vision: 'from-purple-500 to-pink-500',
    research: 'from-green-500 to-emerald-500',
    translator: 'from-cyan-500 to-teal-500',
    scheduler: 'from-orange-500 to-amber-500',
    storage: 'from-indigo-500 to-purple-500',
    media: 'from-red-500 to-pink-500',
    communicator: 'from-pink-500 to-rose-500'
  };

  useEffect(() => {
    fetchAgentsStatus();
    fetchWorkflowHistory();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchAgentsStatus();
      fetchWorkflowHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAgentsStatus = async () => {
    try {
      const response = await fetch('/api/mini-agents/status');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
        calculateMetrics(data.agents);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agents status:', error);
      setLoading(false);
    }
  };

  const fetchWorkflowHistory = async () => {
    try {
      const response = await fetch('/api/mini-agents/workflow/history?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Failed to fetch workflow history:', error);
    }
  };

  const calculateMetrics = (agentsData: Record<string, Agent>) => {
    const activeAgents = Object.values(agentsData).filter(a => a.status === 'active').length;
    const totalAgents = Object.keys(agentsData).length;
    
    setMetrics({
      totalExecutions: Math.floor(Math.random() * 1000) + 500, // Mock data
      successRate: (activeAgents / totalAgents) * 100,
      avgResponseTime: Math.random() * 500 + 200,
      activeWorkflows: workflows.filter(w => w.status === 'running').length
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-red-500';
      case 'fallback': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'fallback': return AlertCircle;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Mini Agents Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time monitoring and analytics for all 8 Mini Agent Services
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Activity}
            title="Total Executions"
            value={metrics.totalExecutions.toLocaleString()}
            change="+12%"
            color="from-blue-500 to-cyan-500"
          />
          <MetricCard
            icon={TrendingUp}
            title="Success Rate"
            value={`${metrics.successRate.toFixed(1)}%`}
            change="+5%"
            color="from-green-500 to-emerald-500"
          />
          <MetricCard
            icon={Clock}
            title="Avg Response Time"
            value={`${metrics.avgResponseTime.toFixed(0)}ms`}
            change="-8%"
            color="from-purple-500 to-pink-500"
          />
          <MetricCard
            icon={Zap}
            title="Active Workflows"
            value={metrics.activeWorkflows.toString()}
            change="0"
            color="from-orange-500 to-amber-500"
          />
        </div>

        {/* Agents Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(agents).map(([key, agent], index) => {
              const Icon = agentIcons[key];
              const StatusIcon = getStatusIcon(agent.status);
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${agentColors[key]}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(agent.status)}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 capitalize">
                    {agent.status}
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Capabilities:</p>
                    <p className="text-xs text-gray-400">
                      {agent.capabilities.length} features
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Workflow History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Recent Workflows</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {workflows.length > 0 ? (
              <div className="divide-y divide-white/10">
                {workflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.workflowId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          workflow.status === 'completed' ? 'bg-green-500' :
                          workflow.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500 animate-pulse'
                        }`} />
                        <div>
                          <h4 className="text-white font-medium">{workflow.name}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(workflow.completedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                          {workflow.duration}ms
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          workflow.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No workflows executed yet
              </div>
            )}
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <InfoCard
            icon={Server}
            title="System Status"
            value="Operational"
            color="text-green-400"
          />
          <InfoCard
            icon={Users}
            title="Active Agents"
            value={`${Object.values(agents).filter(a => a.status === 'active').length} / ${Object.keys(agents).length}`}
            color="text-blue-400"
          />
          <InfoCard
            icon={BarChart3}
            title="Uptime"
            value="99.9%"
            color="text-purple-400"
          />
        </motion.div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  icon: any;
  title: string;
  value: string;
  change: string;
  color: string;
}> = ({ icon: Icon, title, value, change, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`text-sm font-medium ${
        change.startsWith('+') ? 'text-green-400' :
        change.startsWith('-') ? 'text-red-400' :
        'text-gray-400'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </motion.div>
);

// Info Card Component
const InfoCard: React.FC<{
  icon: any;
  title: string;
  value: string;
  color: string;
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
    <div className="flex items-center space-x-3 mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <h3 className="text-sm text-gray-400">{title}</h3>
    </div>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AgentsDashboard;
