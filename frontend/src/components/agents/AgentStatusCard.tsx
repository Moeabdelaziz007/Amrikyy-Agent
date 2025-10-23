import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Activity, Zap, Clock, TrendingUp
} from 'lucide-react';

interface AgentStatusCardProps {
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'fallback';
  capabilities: string[];
  color: string;
  stats?: {
    executions: number;
    successRate: number;
    avgTime: number;
    lastExecution?: string;
  };
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({
  name,
  icon,
  status,
  capabilities,
  color,
  stats
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/20',
          label: 'Active'
        };
      case 'inactive':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/20',
          label: 'Inactive'
        };
      case 'fallback':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/20',
          label: 'Fallback Mode'
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-500',
          bg: 'bg-gray-500/20',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
            {icon}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`${statusConfig.bg} px-3 py-1 rounded-full flex items-center space-x-2`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {capabilities.length} capabilities available
        </p>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Executions</span>
              </div>
              <p className="text-lg font-bold text-white">{stats.executions}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Success</span>
              </div>
              <p className="text-lg font-bold text-white">{stats.successRate}%</p>
            </div>
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <span className="text-sm">
            {isExpanded ? 'Show Less' : 'Show Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 space-y-4">
              {/* Capabilities List */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">
                  Capabilities
                </h4>
                <div className="space-y-2">
                  {capabilities.map((capability, index) => (
                    <motion.div
                      key={capability}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-2 text-sm text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{capability.replace(/_/g, ' ')}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              {stats && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Avg Response Time</span>
                      </div>
                      <span className="text-white font-medium">{stats.avgTime}ms</span>
                    </div>
                    {stats.lastExecution && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Zap className="w-4 h-4" />
                          <span>Last Execution</span>
                        </div>
                        <span className="text-white font-medium">
                          {new Date(stats.lastExecution).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 py-2 px-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors">
                  Test Agent
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-medium transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AgentStatusCard;
