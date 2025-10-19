import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import all our enhanced components
import AILearningPlatform_Ultimate from '../components/AILearningPlatform_Ultimate';
import CyberpunkAISchoolLayout from '../components/CyberpunkAISchoolLayout';
import AISchoolPage from '../pages/AISchoolPage';
import AILearningPlatformPage from '../pages/AILearningPlatformPage';
import QuantumComputingDemo from '../pages/QuantumComputingDemo';
import ProgrammingAlgorithmsDemo from '../pages/ProgrammingAlgorithmsDemo';
import AITradingDemo from '../pages/AITradingDemo';

// Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main AI Learning Platform Routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <AILearningPlatform_Ultimate />
            </PageTransition>
          }
        />

        <Route
          path="/learning-platform"
          element={
            <PageTransition>
              <AILearningPlatformPage />
            </PageTransition>
          }
        />

        {/* AI School Routes */}
        <Route
          path="/ai-school"
          element={
            <PageTransition>
              <AISchoolPage />
            </PageTransition>
          }
        />

        <Route
          path="/cyberpunk-school"
          element={
            <PageTransition>
              <CyberpunkAISchoolLayout />
            </PageTransition>
          }
        />

        {/* Learning Track Routes */}
        <Route
          path="/quantum-computing"
          element={
            <PageTransition>
              <QuantumComputingDemo />
            </PageTransition>
          }
        />

        <Route
          path="/programming-algorithms"
          element={
            <PageTransition>
              <ProgrammingAlgorithmsDemo />
            </PageTransition>
          }
        />

        <Route
          path="/ai-trading"
          element={
            <PageTransition>
              <AITradingDemo />
            </PageTransition>
          }
        />

        <Route
          path="/personalization"
          element={
            <PageTransition>
              <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                    Personalization & Analytics
                  </h1>
                  <p className="text-xl text-slate-300">
                    Coming Soon - Personalized Learning Experience
                  </p>
                </div>
              </div>
            </PageTransition>
          }
        />

        {/* Demo Routes */}
        <Route
          path="/demo"
          element={
            <PageTransition>
              <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                    Interactive Demos
                  </h1>
                  <p className="text-xl text-slate-300">
                    Coming Soon - Hands-on Learning Experiences
                  </p>
                </div>
              </div>
            </PageTransition>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <PageTransition>
              <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#16213E] flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-6xl font-bold mb-4 text-red-400">404</h1>
                  <p className="text-xl text-slate-300">Page Not Found</p>
                  <a
                    href="/"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Return to Home
                  </a>
                </div>
              </div>
            </PageTransition>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
