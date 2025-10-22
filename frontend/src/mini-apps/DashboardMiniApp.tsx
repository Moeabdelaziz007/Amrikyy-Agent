/**
 * Dashboard Mini-App - Main Application Dashboard
 * For AMRIKYY AI OS - Desktop Experience
 *
 * Features:
 * - Glassmorphism design
 * - 4 top stats cards
 * - Agent status feed
 * - Recent activity timeline
 * - Charts & analytics
 * - Framer Motion animations
 *
 * @component
 * @author CURSERO AI - Creative Autonomous Engineer
 * @created 2025-10-21
 * @v0-style Yes (Generated without V0)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Zap,
  TrendingUp,
  Brain,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Cpu,
  Database,
  Globe,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Bell
} from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

interface DashboardStats {
  activeAgents: number;
  totalTasks: number;
  successRate: number;
  responseTime: number;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy';
  uptime: string;
  tasksCompleted: number;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  type: 'success' | 'info' | 'warning';
  agent: string;
  action: string;
  timestamp: string;
  icon: React.ReactNode;
}

// ============================================
// MOCK DATA (Replace with real API later)
// ============================================

const MOCK_STATS: DashboardStats = {
  activeAgents: 4,
  totalTasks: 156,
  successRate: 98.5,
  responseTime: 1.2
};

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Luna',
    role: 'Data Analyzer',
    status: 'active',
    uptime: '24h 15m',
    tasksCompleted: 45,
    icon: <Database size={20} />,
    color: 'cyan'
  },
  {
    id: 'agent-2',
    name: 'Karim',
    role: 'Creative Agent',
    status: 'active',
    uptime: '18h 32m',
    tasksCompleted: 32,
    icon: <Brain size={20} />,
    color: 'purple'
  },
  {
    id: 'agent-3',
    name: 'Scout',
    role: 'Content Creator',
    status: 'busy',
    uptime: '12h 08m',
    tasksCompleted: 28,
    icon: <MessageSquare size={20} />,
    color: 'blue'
  },
  {
    id: 'agent-4',
    name: 'Maya',
    role: 'Customer Support',
    status: 'idle',
    uptime: '6h 45m',
    tasksCompleted: 51,
    icon: <Users size={20} />,
    color: 'green'
  }
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: 'success',
    agent: 'Luna',
    action: 'Completed data analysis for Q4 report',
    timestamp: '2 minutes ago',
    icon: <CheckCircle size={16} />
  },
  {
    id: 'act-2',
    type: 'info',
    agent: 'Karim',
    action: 'Generated creative brief for campaign',
    timestamp: '5 minutes ago',
    icon: <Brain size={16} />
  },
  {
    id: 'act-3',
    type: 'success',
    agent: 'Scout',
    action: 'Published 3 new articles',
    timestamp: '12 minutes ago',
    icon: <CheckCircle size={16} />
  },
  {
    id: 'act-4',
    type: 'warning',
    agent: 'Maya',
    action: 'Waiting for user response',
    timestamp: '15 minutes ago',
    icon: <AlertCircle size={16} />
  },
  {
    id: 'act-5',
    type: 'success',
    agent: 'Luna',
    action: 'Database optimization completed',
    timestamp: '23 minutes ago',
    icon: <Database size={16} />
  }
];

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function DashboardMiniApp() {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/dashboard/stats`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStats({
              activeAgents: result.data.activeAgents,
              totalTasks: result.data.totalTasks,
              successRate: result.data.successRate,
              responseTime: result.data.responseTime
            });

            if (result.data.agents) {
              setAgents(result.data.agents.map((agent: any) => ({
                ...agent,
                icon: getAgentIcon(agent.id),
                color: getAgentColor(agent.id)
              })));
            }

            if (result.data.recentActivity) {
              setActivities(result.data.recentActivity.map((activity: any) => ({
                ...activity,
                icon: getActivityIcon(activity.type)
              })));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep using mock data on error
      }
    };

    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions for icons and colors
  const getAgentIcon = (agentId: string) => {
    const icons: Record<string, React.ReactNode> = {
      luna: <Database size={20} />,
      karim: <Brain size={20} />,
      scout: <Globe size={20} />,
      maya: <MessageSquare size={20} />
    };
    return icons[agentId] || <Cpu size={20} />;
  };

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      luna: 'cyan',
      karim: 'purple',
      scout: 'green',
      maya: 'yellow'
    };
    return colors[agentId] || 'blue';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle size={16} />,
      info: <AlertCircle size={16} />,
      warning: <AlertCircle size={16} />
    };
    return icons[type] || <Activity size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <DashboardHeader currentTime={currentTime} />

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Active Agents"
          value={stats.activeAgents}
          subtitle="Currently running"
          icon={<Cpu className="text-cyan-400" size={24} />}
          trend="+2 from yesterday"
          color="cyan"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle="Completed today"
          icon={<Activity className="text-purple-400" size={24} />}
          trend="+12% increase"
          color="purple"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle="Last 24 hours"
          icon={<TrendingUp className="text-green-400" size={24} />}
          trend="Above average"
          color="green"
        />
        <StatsCard
          title="Response Time"
          value={`${stats.responseTime}s`}
          subtitle="Average latency"
          icon={<Zap className="text-yellow-400" size={24} />}
          trend="-0.3s improved"
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Feed (Left - 2 cols) */}
        <div className="lg:col-span-2">
          <AgentStatusPanel agents={agents} />
        </div>

        {/* Activity & Charts (Right - 1 col) */}
        <div className="space-y-6">
          <ActivityFeed activities={activities} />
          <AnalyticsChart />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Dashboard Header with time
 */
interface DashboardHeaderProps {
  currentTime: Date;
}

function DashboardHeader({ currentTime }: DashboardHeaderProps) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome back! Here's what's happening with your AI agents.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-semibold text-white">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-slate-400">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Stats Card Component with Glassmorphism
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend: string;
  color: 'cyan' | 'purple' | 'green' | 'yellow';
}

function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20'
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colorClasses[color]}
        backdrop-blur-md
        border border-white/10
        rounded-xl
        p-6
        shadow-sm
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="mb-4">
          {icon}
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-white mb-1">
          {value}
        </div>

        {/* Title */}
        <div className="text-sm font-medium text-slate-300 mb-2">
          {title}
        </div>

        {/* Subtitle */}
        <div className="text-xs text-slate-400">
          {subtitle}
        </div>

        {/* Trend */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-slate-400">
            {trend}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Agent Status Panel
 */
interface AgentStatusPanelProps {
  agents: Agent[];
}

function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
  return (
    <motion.div
      className="
        bg-slate-800/40
        backdrop-blur-md
        border border-white/10
        rounded-xl
        p-6
        shadow-sm
      "
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          AI Agents Status
        </h2>
        <span className="text-sm text-slate-400">
          {agents.filter(a => a.status === 'active').length} / {agents.length} active
        </span>
      </div>

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <AgentStatusCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Individual Agent Status Card
 */
interface AgentStatusCardProps {
  agent: Agent;
  index: number;
}

function AgentStatusCard({ agent, index }: AgentStatusCardProps) {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    busy: 'bg-blue-500'
  };

  const statusText = {
    active: 'Active',
    idle: 'Idle',
    busy: 'Busy'
  };

  return (
    <motion.div
      className="
        bg-slate-900/50
        backdrop-blur-sm
        border border-white/10
        rounded-lg
        p-4
        hover:border-white/20
        transition-all
        shadow-sm
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Agent Info */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`
            p-3 rounded-lg
            bg-${agent.color}-500/10
            border border-${agent.color}-500/20
          `}>
            {agent.icon}
          </div>

          {/* Name & Role */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">
                {agent.name}
              </h3>
              <span className={`
                inline-flex items-center gap-1
                px-2 py-0.5
                text-xs font-medium
                rounded-full
                ${statusColors[agent.status]}
                text-white
              `}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {statusText[agent.status]}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {agent.role}
            </p>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="text-right">
          <div className="text-sm text-slate-400 mb-1">
            Uptime
          </div>
          <div className="text-white font-semibold">
            {agent.uptime}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {agent.tasksCompleted} tasks
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Activity Feed
 */
interface ActivityFeedProps {
  activities: Activity[];
}

function ActivityFeed({ activities }: ActivityFeedProps) {
  const typeColors = {
    success: 'text-green-400 bg-green-500/10 border-green-500/20',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <motion.div
      className="
        bg-slate-800/40
        backdrop-blur-md
        border border-white/10
        rounded-xl
        p-6
        shadow-sm
      "
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Recent Activity
        </h2>
        <Bell size={20} className="text-slate-400" />
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className={`
              p-3 rounded-lg
              border
              ${typeColors[activity.type]}
              transition-all
              hover:border-opacity-40
            `}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white mb-1">
                  {activity.agent}
                </div>
                <div className="text-xs text-slate-300">
                  {activity.action}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button className="
          text-sm text-cyan-400 hover:text-cyan-300
          transition-colors
          font-medium
        ">
          View all activity →
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Analytics Chart Placeholder
 */
function AnalyticsChart() {
  return (
    <motion.div
      className="
        bg-slate-800/40
        backdrop-blur-md
        border border-white/10
        rounded-xl
        p-6
        shadow-sm
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Performance
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <LineChart size={18} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <BarChart3 size={18} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <PieChart size={18} />
          </button>
        </div>
      </div>

      {/* Chart Placeholder - Replace with real chart library */}
      <div className="h-48 flex items-center justify-center bg-slate-900/50 rounded-lg border border-white/10">
        <div className="text-center">
          <LineChart size={48} className="text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            Chart placeholder
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Integrate recharts or chart.js
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            98%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Uptime
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">
            1.2s
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg Time
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            156
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Tasks
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// DISPLAY NAME
// ============================================

DashboardMiniApp.displayName = 'DashboardMiniApp';

export default DashboardMiniApp;
