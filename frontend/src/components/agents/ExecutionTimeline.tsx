import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, AlertTriangle,
  MapPin, Eye, Search, Globe, Calendar, HardDrive, Video, Mail
} from 'lucide-react';

interface Execution {
  id: string;
  agentName: string;
  taskType: string;
  status: 'success' | 'failed' | 'running';
  duration: number;
  timestamp: string;
  result?: any;
  error?: string;
}

interface ExecutionTimelineProps {
  executions: Execution[];
  maxItems?: number;
}

const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  executions,
  maxItems = 20
}) => {
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/20',
          border: 'border-green-500/50'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/20',
          border: 'border-red-500/50'
        };
      case 'running':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50'
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const displayExecutions = executions.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Execution History</h3>
        <span className="text-sm text-gray-400">
          {executions.length} total executions
        </span>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />

        {/* Executions */}
        <div className="space-y-4">
          {displayExecutions.map((execution, index) => {
            const AgentIcon = agentIcons[execution.agentName] || Search;
            const statusConfig = getStatusConfig(execution.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-16"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-4 w-4 h-4 rounded-full ${statusConfig.bg} ${statusConfig.border} border-2 flex items-center justify-center`}>
                  {execution.status === 'running' && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>

                {/* Agent Icon */}
                <div className={`absolute left-0 top-2 w-8 h-8 rounded-lg bg-gradient-to-br ${agentColors[execution.agentName]} flex items-center justify-center`}>
                  <AgentIcon className="w-4 h-4 text-white" />
                </div>

                {/* Execution Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium capitalize">
                          {execution.agentName}
                        </h4>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">
                          {execution.taskType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(execution.timestamp)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-400">
                        {execution.duration}ms
                      </span>
                      <div className={`${statusConfig.bg} px-2 py-1 rounded-full flex items-center space-x-1`}>
                        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                        <span className={`text-xs font-medium ${statusConfig.color} capitalize`}>
                          {execution.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Result or Error */}
                  {execution.status === 'success' && execution.result && (
                    <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                      <p className="text-xs text-green-400">
                        ✓ Task completed successfully
                      </p>
                    </div>
                  )}

                  {execution.status === 'failed' && execution.error && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                      <p className="text-xs text-red-400">
                        ✗ {execution.error}
                      </p>
                    </div>
                  )}

                  {execution.status === 'running' && (
                    <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 flex items-center space-x-2">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Executing...</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Load More */}
        {executions.length > maxItems && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Load More ({executions.length - maxItems} more)
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ExecutionTimeline;
