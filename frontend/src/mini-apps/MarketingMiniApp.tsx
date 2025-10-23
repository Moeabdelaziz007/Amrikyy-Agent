import React from 'react';
import MarketingAgentUI from '../components/agents/MarketingAgentUI';
import { TaskHistoryEntry } from '../types';

interface MarketingMiniAppProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const MarketingMiniApp: React.FC<MarketingMiniAppProps> = ({ onTaskComplete }) => {
  return (
    <div className="h-full w-full overflow-auto">
      <MarketingAgentUI onTaskComplete={onTaskComplete} />
    </div>
  );
};

export default MarketingMiniApp;
