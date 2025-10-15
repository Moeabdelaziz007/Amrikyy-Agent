import React from 'react';
import './RorkBadge.css';

interface RorkBadgeProps {
  variant?: 'default' | 'minimal' | 'detailed';
  showLogo?: boolean;
}

export const RorkBadge: React.FC<RorkBadgeProps> = ({ 
  variant = 'default',
  showLogo = true 
}) => {
  const rorkProfileUrl = 'https://rork.com/p/be15ei0flq1ln8v3yawa7';

  return (
    <a 
      href={rorkProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`rork-badge rork-badge-${variant}`}
      title="Built with Rork Topology - Professional Mobile App Development"
    >
      {showLogo && variant !== 'minimal' && (
        <div className="rork-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              fill="currentColor" 
              opacity="0.8"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      
      {variant === 'minimal' ? (
        <span className="rork-text-minimal">Rork</span>
      ) : variant === 'detailed' ? (
        <div className="rork-content-detailed">
          <span className="rork-title">Built with Rork Topology</span>
          <span className="rork-subtitle">Professional Architecture</span>
        </div>
      ) : (
        <span className="rork-text">Built with Rork</span>
      )}
      
      <div className="rork-arrow">→</div>
    </a>
  );
};

export default RorkBadge;
