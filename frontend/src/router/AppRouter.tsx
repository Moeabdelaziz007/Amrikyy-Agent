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
              <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-4xl mx-auto">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
                  >
                    AMRIKYY AI
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-300 mb-12"
                  >
                    Your AI-Powered Learning Platform
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <motion.a
                      href="/ai-school"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300"
                    >
                      Start Learning
                    </motion.a>
                    <motion.a
                      href="/quantum-computing"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-slate-800/50 text-white font-bold rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300"
                    >
                      Explore Courses
                    </motion.a>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div className="p-6 bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                      <div className="text-4xl mb-4">🚀</div>
                      <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
                      <p className="text-slate-400">Personalized learning with advanced AI</p>
                    </div>
                    <div className="p-6 bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className="text-xl font-bold text-white mb-2">Interactive</h3>
                      <p className="text-slate-400">Hands-on projects and real-world skills</p>
                    </div>
                    <div className="p-6 bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                      <div className="text-4xl mb-4">🌟</div>
                      <h3 className="text-xl font-bold text-white mb-2">Expert-Led</h3>
                      <p className="text-slate-400">Learn from industry professionals</p>
                    </div>
                  </motion.div>
                </div>
              </div>
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
