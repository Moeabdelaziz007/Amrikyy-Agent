import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-effect-enhanced p-6 rounded-2xl relative overflow-hidden group shine-effect"
    >
      {/* Gradient Overlay on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}, transparent)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          
          {/* Animated Icon Background */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
        </div>
        
        {/* Animated Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-2"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
        </motion.div>
        
        {trend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}
          >
            <span className="font-semibold">{trend.isPositive ? '↑' : '↓'}</span>
            <span className="font-semibold">{Math.abs(trend.value)}%</span>
            <span className="text-gray-500">vs last month</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;