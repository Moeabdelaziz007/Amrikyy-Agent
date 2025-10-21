import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: 'cyan' | 'purple' | 'green' | 'blue';
  showChart?: boolean;
  sparklineData?: Array<{ time: string; responseTime: number }>;
}

const colorClasses = {
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    icon: 'bg-cyan-500/20 text-cyan-400',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    icon: 'bg-purple-500/20 text-purple-400',
  },
  green: {
    bg: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/20',
    text: 'text-green-400',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
    icon: 'bg-green-500/20 text-green-400',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    icon: 'bg-blue-500/20 text-blue-400',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  color,
  showChart = false,
  sparklineData,
}) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl overflow-hidden ${colors.glow}`}
    >
      {/* Glassmorphism Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} backdrop-blur-xl`} />
      
      {/* Border */}
      <div className={`absolute inset-0 rounded-xl border ${colors.border}`} />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.icon}`}>
            {icon}
          </div>
          
          {sparklineData && (
            <div className="w-24 h-12 -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke={color === 'cyan' ? '#22d3ee' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : '#3b82f6'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          <p className="text-xs text-slate-500">{trend}</p>
        </div>

        {showChart && !sparklineData && (
          <div className="mt-4 flex items-center gap-1">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: Math.random() * 30 + 10 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`flex-1 ${colors.bg} rounded-sm`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
