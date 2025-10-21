import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface PerformanceChartProps {
  data: Array<{ time: string; responseTime: number }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const avgResponseTime = Math.round(
    data.reduce((sum, item) => sum + item.responseTime, 0) / data.length
  );

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
            <h3 className="text-lg font-bold text-white mb-1">Performance Metrics</h3>
            <p className="text-sm text-slate-400">Response time over 24 hours</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              {avgResponseTime}ms avg
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#64748b' }}
                label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(12px)',
                }}
                labelStyle={{ color: '#22d3ee' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#colorResponseTime)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600" />
            <span className="text-slate-400">Response Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
            <span className="text-slate-400">Target: 150ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
