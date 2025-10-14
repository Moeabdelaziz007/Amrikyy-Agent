import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon | React.ReactNode;
  color: string;
  badge?: string;
  features?: string[];
  price?: string;
  onClick?: () => void;
  gradient?: string;
}

/**
 * FeatureCard - Reusable card for agents, kits, features
 * 
 * Features:
 * - Glassmorphism design
 * - Hover effects (lift + glow)
 * - Agent-specific colors
 * - Responsive
 * - Accessible
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  color,
  badge,
  features,
  price,
  onClick,
  gradient = 'from-blue-500 to-purple-500'
}) => {
  const IconComponent = typeof icon === 'function' ? icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={`glass-card p-6 rounded-2xl group relative ${onClick ? 'cursor-pointer' : ''}`}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${title} - ${description}`}
    >
      {/* Hover Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${color}66`,
        }}
      />

      {/* Badge */}
      {badge && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
        {IconComponent ? (
          <IconComponent className="w-8 h-8" />
        ) : (
          <span className="text-3xl">{icon}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>

      {/* Features List */}
      {features && features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map((feature, idx) => (
            <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Price & CTA */}
      {price && (
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <span className="text-2xl font-bold text-white">{price}</span>
          <button
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle CTA click
            }}
          >
            Learn More
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default FeatureCard;

