import { useState } from 'react';
import { motion } from 'framer-motion';
import AppCard from '../components/aiDesktop/AppCard';
import HologramDisplay from '../components/aiDesktop/HologramDisplay';
import DockBar from '../components/aiDesktop/DockBar';
import ParticleSystem from '../components/aiDesktop/ParticleSystem';
import CustomerModal from '../components/aiDesktop/CustomerModal/CustomerModal';
import { mockApps, mockParticles } from '../data/aiDesktopMockData';
import type { CustomerFormData } from '../types/aiDesktop';
import '../styles/aiDesktop.css';

/**
 * AIDesktopPage - Main AI OS Desktop Interface
 * 
 * Features:
 * - Dark glassmorphism design
 * - Animated grid background
 * - Floating particle system
 * - App launcher grid
 * - Central hologram display
 * - macOS-style dock
 * - Customer management modal
 */
const AIDesktopPage = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeApps, setActiveApps] = useState<string[]>(['dashboard']);

  const handleAppLaunch = (appId: string) => {
    console.log('Launching app:', appId);
    
    // Special handling for customer modal
    if (appId === 'dashboard') {
      setShowCustomerModal(true);
    }
    
    // Toggle active state
    setActiveApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleCustomerSave = (data: CustomerFormData) => {
    console.log('Customer data saved:', data);
    setShowCustomerModal(false);
  };

  return (
    <div className="fixed inset-0 desktop-background overflow-hidden">
      {/* Particle System */}
      <ParticleSystem particles={mockParticles} />

      {/* Branding Watermark */}
      <motion.div
        className="absolute top-8 left-8 z-20 text-white/60 text-sm font-medium"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="glass-card px-4 py-2 rounded-lg">
          <div className="text-xs text-cyan-400">Super AI Automation Agency</div>
          <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            AMRIKYY
          </div>
          <div className="text-xs text-white/50">Powered By Gemini ✨</div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col p-8 pt-32">
        {/* App Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {mockApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <AppCard
                app={{
                  ...app,
                  isActive: activeApps.includes(app.id)
                }}
                onLaunch={() => handleAppLaunch(app.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Central Hologram Display */}
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <motion.div
            className="w-full max-w-4xl h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <HologramDisplay />
          </motion.div>
        </div>
      </div>

      {/* Dock Bar */}
      <DockBar onAppLaunch={handleAppLaunch} />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleCustomerSave}
      />
    </div>
  );
};

export default AIDesktopPage;