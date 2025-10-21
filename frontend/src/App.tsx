import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Window } from './components/windows';
import { DashboardMiniApp } from './components/dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
          AMRIKYY AI
        </h1>
        <p className="text-2xl text-slate-300 mb-12">
          Your AI-Powered Learning Platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            to="/dashboard" 
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-xl transition-all"
          >
            AI OS Dashboard 🚀
          </Link>
          <Link 
            to="/demo" 
            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all"
          >
            Explore Courses
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard emoji="🚀" title="AI-Powered" description="Personalized learning with advanced AI" />
          <FeatureCard emoji="🎯" title="Interactive" description="Hands-on projects and real-world skills" />
          <FeatureCard emoji="🌟" title="Expert-Led" description="Learn from industry professionals" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function DemoPage() {
  return (
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
  );
}

function DashboardPage() {
  const [showDashboard, setShowDashboard] = useState(true);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.15),transparent_50%)]" />
      </div>

      {/* Desktop OS Environment */}
      <div className="relative z-10">
        {/* Top Bar */}
        <div className="h-12 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
              AMRIKYY AI OS
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>

        {/* Windows Container */}
        {showDashboard && (
          <Window
            id="dashboard-1"
            title="AI OS Control Center"
            initialPosition={{ x: 50, y: 50 }}
            initialSize={{ width: 1200, height: 800 }}
            onClose={() => setShowDashboard(false)}
            zIndex={100}
          >
            <DashboardMiniApp />
          </Window>
        )}

        {/* Desktop Icons (Future Feature) */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-4">
          <button
            onClick={() => setShowDashboard(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-xs text-slate-300">Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
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
  );
}

export default App;
