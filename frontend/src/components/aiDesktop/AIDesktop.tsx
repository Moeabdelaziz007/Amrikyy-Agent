import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppCard from './AppCard';
import DockBar from './DockBar';
import HologramDisplay from './HologramDisplay';
import ParticleSystem from './ParticleSystem';
import { aiDesktopApps, mockAgents } from '../../data/aiDesktopMockData';
import { AppData, Agent } from '../../types/aiDesktop';
import { CustomerDetailModal } from './CustomerModal';

const AIDesktop: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppData | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAppLaunch = (app: AppData) => {
    setActiveApp(app);
    // Logic to open specific app content
    if (app.name === 'Customer Management') {
      setShowCustomerModal(true);
      setSelectedAgent(mockAgents[0]); // Example: select first agent for modal
    }
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedAgent(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      <ParticleSystem />

      {/* Holographic Display for Agents */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <HologramDisplay agents={mockAgents} />
      </div>

      {/* App Grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-4 gap-8 p-8">
        {aiDesktopApps.map(app => (
          <AppCard key={app.id} app={app} onLaunch={handleAppLaunch} />
        ))}
      </div>

      {/* Dock Bar */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <DockBar
          apps={aiDesktopApps}
          onLaunch={handleAppLaunch}
          currentTime={currentTime}
        />
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={showCustomerModal}
        onClose={handleCloseCustomerModal}
        customer={
          selectedAgent
            ? {
                // Mock customer data from selected agent
                id: selectedAgent.id,
                name: selectedAgent.name,
                email: `${selectedAgent.name.toLowerCase()}@example.com`,
                phone: '123-456-7890',
                address: '123 Hologram St, Cyber City',
                lastInteraction: '2023-10-26',
                totalBookings: 5,
              }
            : null
        }
      />
    </div>
  );
};

export default AIDesktop;
