import React from 'react';

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ emoji, title, description }) => (
  <div className="p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl">
    <div className="text-4xl mb-4">{emoji}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

export default FeatureCard;