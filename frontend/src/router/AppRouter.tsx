import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
    <Routes>
      {/* Main Homepage */}
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
                  <Link to="/demo">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300"
                    >
                      Start Learning
                    </motion.div>
                  </Link>
                  <Link to="/demo">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-slate-800/50 text-white font-bold rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300"
                    >
                      Explore Courses
                    </motion.div>
                  </Link>
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

      {/* Demo/Coming Soon Route */}
      <Route
        path="/demo"
        element={
          <PageTransition>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                  Coming Soon
                </h1>
                <p className="text-xl text-slate-300 mb-8">
                  AI Learning Platform - Under Development
                </p>
                <Link
                  to="/"
                  className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors inline-block"
                >
                  Back to Home
                </Link>
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
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4 text-red-400">404</h1>
                <p className="text-xl text-slate-300 mb-4">Page Not Found</p>
                <Link
                  to="/"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </PageTransition>
        }
      />
    </Routes>
  );
};

export default AppRouter;
