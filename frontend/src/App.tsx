import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Compass, 
  Bot,
  Settings,
  User,
  Search,
  Home,
  Users,
  BarChart3,
  Network
} from 'lucide-react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import TripPlanner from './components/TripPlanner';
import Destinations from './components/Destinations';
import BudgetTracker from './components/BudgetTracker';
import TripHistory from './components/TripHistory';
import AIAssistant from './components/AIAssistant';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailsPage from './pages/TripDetailsPage';
import NetworkVisualizationPage from './pages/NetworkVisualizationPage';
import ErrorBoundary from './components/ErrorBoundary';
import AuthCallback from './pages/AuthCallback';
import AmrikyyMainPage from './pages/AmrikyyMainPage';
import AgentGallery from './pages/AgentGallery';
import HologramDemo from './pages/HologramDemo';
import Analytics from './pages/Analytics';
import { initTelegramWebApp, isTelegramWebApp } from './telegram-webapp';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'ongoing' | 'completed';
  image: string;
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'agents' | 'hologram' | 'analytics' | 'chat' | 'network' | 'trip-details' | 'profile' | 'notifications'>('landing');
  const [activeTab, setActiveTab] = useState('planner');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Check if we're on an auth callback page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    if (urlParams.get('access_token') || urlParams.get('error') || 
        hashParams.get('access_token') || hashParams.get('error')) {
      return;
    }
  }, []);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp();
    }
  }, []);

  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Tokyo, Japan',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      budget: 2500,
      status: 'planned',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400'
    },
    {
      id: '2',
      destination: 'Paris, France',
      startDate: '2024-04-10',
      endDate: '2024-04-17',
      budget: 1800,
      status: 'planned',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'
    }
  ]);

  const dashboardTabs = [
    { id: 'planner', label: 'Trip Planner', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'ai', label: 'Amrikyy AI', icon: Bot }
  ];

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'planner':
        return <TripPlanner trips={trips} setTrips={setTrips} />;
      case 'destinations':
        return <Destinations />;
      case 'budget':
        return <BudgetTracker trips={trips} />;
      case 'history':
        return <TripHistory trips={trips} />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <TripPlanner trips={trips} setTrips={setTrips} />;
    }
  };

  // Check auth callback
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  if (urlParams.get('access_token') || urlParams.get('error') || 
      hashParams.get('access_token') || hashParams.get('error')) {
    return <AuthCallback />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold amrikyy-text">Amrikyy</h1>
          <p className="text-gray-400 mt-2">Loading your AI travel companion...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (!user) {
    return <AmrikyyMainPage />;
  }

  // Logged in - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-effect p-6 shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage('landing')}
          >
            <div className="p-3 amrikyy-gradient rounded-xl">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold amrikyy-text">Amrikyy</h1>
              <p className="text-gray-400 text-sm">AI Travel Platform</p>
            </div>
          </motion.div>
          
          {/* Top Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'landing' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('chat')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'chat' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Bot className="w-4 h-4 inline mr-1" />
              Chat
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Compass className="w-4 h-4 inline mr-1" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('network')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'network' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Network className="w-4 h-4 inline mr-1" />
              Network
            </button>
            <button
              onClick={() => setCurrentPage('agents')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'agents' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Agents
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                currentPage === 'analytics' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Analytics
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <User className="w-5 h-5 text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div>
        {currentPage === 'landing' && <AmrikyyMainPage />}
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'network' && <NetworkVisualizationPage />}
        {currentPage === 'trip-details' && <TripDetailsPage />}
        {currentPage === 'agents' && <AgentGallery />}
        {currentPage === 'hologram' && <HologramDemo />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'profile' && <ProfileSettingsPage />}
        {currentPage === 'notifications' && <NotificationsPage />}
        
        {currentPage === 'planner' && (
          <>
            {/* Dashboard Navigation Tabs */}
            <motion.nav 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-7xl mx-auto px-6 py-4"
            >
              <div className="flex space-x-1 glass-effect rounded-2xl p-2">
                {dashboardTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.nav>

            {/* Dashboard Content */}
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-7xl mx-auto px-6 pb-8"
            >
              {renderDashboardContent()}
            </motion.main>
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
