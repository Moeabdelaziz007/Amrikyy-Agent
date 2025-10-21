import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { AgentStatusList } from './AgentStatusList';
import { ActivityFeed } from './ActivityFeed';
import { PerformanceChart } from './PerformanceChart';

export const DashboardMiniApp: React.FC = () => {
  // Mock data - will be replaced with real-time hooks
  const stats = {
    activeAgents: 8,
    tasksCompleted: 1247,
    successRate: 94.2,
    avgResponseTime: 142, // ms
  };

  const agents = [
    { id: '1', name: 'Email Agent', role: 'Communication', status: 'active' as const },
    { id: '2', name: 'Data Analyzer', role: 'Analytics', status: 'active' as const },
    { id: '3', name: 'Content Creator', role: 'Creative', status: 'active' as const },
    { id: '4', name: 'Task Manager', role: 'Workflow', status: 'idle' as const },
    { id: '5', name: 'Code Assistant', role: 'Development', status: 'active' as const },
    { id: '6', name: 'Research Agent', role: 'Knowledge', status: 'idle' as const },
    { id: '7', name: 'Security Monitor', role: 'Security', status: 'active' as const },
    { id: '8', name: 'Performance Optimizer', role: 'Optimization', status: 'active' as const },
  ];

  const activities = [
    {
      id: '1',
      type: 'success' as const,
      message: 'Email Agent processed 45 emails',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      type: 'success' as const,
      message: 'Data Analyzer completed quarterly analysis',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
    },
    {
      id: '3',
      type: 'in_progress' as const,
      message: 'Content Creator generating blog post',
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
    },
    {
      id: '4',
      type: 'success' as const,
      message: 'Code Assistant refactored 3 modules',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: '5',
      type: 'warning' as const,
      message: 'Security Monitor detected unusual activity',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
    },
  ];

  const performanceData = [
    { time: '00:00', responseTime: 120 },
    { time: '04:00', responseTime: 135 },
    { time: '08:00', responseTime: 180 },
    { time: '12:00', responseTime: 165 },
    { time: '16:00', responseTime: 142 },
    { time: '20:00', responseTime: 125 },
  ];

  return (
    <div className="w-full h-full min-h-screen bg-transparent">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-2">
          AI OS Control Center
        </h1>
        <p className="text-slate-400 text-lg">
          Multi-Agent System Dashboard
        </p>
      </motion.div>

      {/* Top Stats Grid - 4 Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        <StatsCard
          icon={<Zap className="w-6 h-6" />}
          label="Active Agents"
          value={stats.activeAgents.toString()}
          trend="+2 today"
          color="cyan"
        />
        <StatsCard
          icon={<Activity className="w-6 h-6" />}
          label="Tasks Completed"
          value={stats.tasksCompleted.toLocaleString()}
          trend="+187 today"
          color="purple"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Success Rate"
          value={`${stats.successRate}%`}
          trend="+2.3% from yesterday"
          color="green"
          showChart={true}
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          label="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          trend="-18ms improvement"
          color="blue"
          sparklineData={performanceData}
        />
      </motion.div>

      {/* Main Content Grid - Sidebar + Main Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Agent Status Sidebar - 30% */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-4"
        >
          <AgentStatusList agents={agents} />
        </motion.div>

        {/* Main Content Area - 70% */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="xl:col-span-8 space-y-6"
        >
          {/* Performance Chart */}
          <PerformanceChart data={performanceData} />
          
          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardMiniApp;
