/**
 * Agent Card Component
 * 3D holographic card for displaying agent information
 */

import React from 'react';
import './AgentCard.css';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'processing' | 'idle';
  hologram: {
    displayName: string;
    icon: string;
    color: string;
    category: string;
    description: string;
  };
  metrics?: {
    load: number;
    tasks: number;
    success: number;
  };
}

interface AgentCardProps {
  agent: Agent;
  onTest?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onTest }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#0f0';
      case 'processing':
        return '#ff0';
      case 'idle':
        return '#666';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'processing':
        return 'PROCESSING';
      case 'idle':
        return 'IDLE';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="agent-card" data-agent-type={agent.type}>
      <div className="agent-card-inner">
        {/* Scan line effect */}
        <div className="scan-line"></div>
        
        {/* Header */}
        <div className="agent-header">
          <div className="agent-info">
            <div className="agent-icon" style={{ color: agent.hologram.color }}>
              {agent.hologram.icon}
            </div>
            <div className="agent-name">{agent.hologram.displayName}</div>
            <div className="agent-type">{agent.hologram.description}</div>
          </div>
          <div 
            className="agent-status" 
            style={{ 
              backgroundColor: getStatusColor(agent.status),
              boxShadow: `0 0 10px ${getStatusColor(agent.status)}`
            }}
            title={getStatusText(agent.status)}
          >
            <span className="status-indicator"></span>
          </div>
        </div>

        {/* Metrics */}
        <div className="agent-metrics">
          {agent.metrics && (
            <>
              <div className="metric-bar">
                <div className="metric-label">
                  LOAD: {agent.metrics.load}%
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${agent.metrics.load}%`,
                      background: `linear-gradient(90deg, ${agent.hologram.color}, #0ff)`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-bar">
                <div className="metric-label">
                  SUCCESS RATE: {agent.metrics.success}%
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${agent.metrics.success}%`,
                      background: `linear-gradient(90deg, ${agent.hologram.color}, #0ff)`
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-summary">
                <div className="metric-item">
                  <span className="metric-value">{agent.metrics.tasks}</span>
                  <span className="metric-label-small">TASKS</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{agent.metrics.load}%</span>
                  <span className="metric-label-small">LOAD</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{agent.metrics.success}%</span>
                  <span className="metric-label-small">SUCCESS</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        {onTest && (
          <div className="agent-actions">
            <button 
              className="test-btn"
              onClick={onTest}
              style={{ borderColor: agent.hologram.color }}
            >
              TEST {agent.hologram.displayName}
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="category-badge">
          {agent.hologram.category.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;

