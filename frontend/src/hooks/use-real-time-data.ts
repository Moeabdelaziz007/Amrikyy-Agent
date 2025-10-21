/**
 * Real-time Data Hook - Mock implementation
 * @author Ona AI
 */

import { useState, useEffect } from 'react';

export function useRealTimeData() {
  const [data, setData] = useState({
    activeAgents: 4,
    totalTasks: 156,
    successRate: 98.5,
    responseTime: 1.2
  });

  useEffect(() => {
    // Mock real-time updates
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        totalTasks: prev.totalTasks + Math.floor(Math.random() * 3),
        successRate: 98 + Math.random() * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
