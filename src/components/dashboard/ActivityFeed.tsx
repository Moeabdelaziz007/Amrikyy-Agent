import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Mail, FileText, Code, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'success' | 'in_progress' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  success: CheckCircle2,
  in_progress: Clock,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const activityColors = {
  success: {
    icon: 'text-green-400 bg-green-500/20',
    border: 'border-green-500/20',
    text: 'text-green-400',
  },
  in_progress: {
    icon: 'text-blue-400 bg-blue-500/20 animate-pulse',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
  },
  warning: {
    icon: 'text-yellow-400 bg-yellow-500/20',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
  },
  error: {
    icon: 'text-red-400 bg-red-500/20',
    border: 'border-red-500/20',
    text: 'text-red-400',
  },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/80 to-slate-900/95 backdrop-blur-xl" />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-xl border border-cyan-500/20" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Recent Activity</h3>
            <p className="text-sm text-slate-400">Latest system events</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-all"
          >
            View All
          </motion.button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colors = activityColors[activity.type];

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
              >
                {/* Timeline Line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-slate-700/50 to-transparent" />
                )}

                {/* Activity Card */}
                <div className="relative rounded-lg overflow-hidden">
                  {/* Background */}
                  <div className="absolute inset-0 bg-slate-800/20 group-hover:bg-slate-800/40 backdrop-blur-sm transition-colors" />
                  
                  {/* Border */}
                  <div className={`absolute inset-0 rounded-lg border ${colors.border} group-hover:border-opacity-60 transition-all`} />

                  {/* Content */}
                  <div className="relative p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${colors.icon} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium mb-1">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${colors.icon} ${colors.text} font-medium ml-2`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Show More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
            Load more activities...
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityFeed;
