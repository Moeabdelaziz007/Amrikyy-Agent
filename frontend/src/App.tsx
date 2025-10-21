import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DemoDesktop from '@/pages/DemoDesktop';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/desktop" element={<DemoDesktop />} />
        <Route path="/demo" element={<DemoPage />} />
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
          AMRIKYY AI OS
        </h1>
        <p className="text-2xl text-slate-300 mb-12">
          Desktop OS Experience • SaaS Platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            to="/desktop" 
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-xl transition-all"
          >
            🖥️ Launch Desktop OS
          </Link>
          <Link 
            to="/demo" 
            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all"
          >
            Explore Features
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard emoji="🪟" title="Window Manager" description="Drag, resize, maximize - full desktop experience" />
          <FeatureCard emoji="✨" title="Glassmorphism" description="Beautiful glass-like UI with smooth animations" />
          <FeatureCard emoji="🚀" title="Performance" description="Built with React + TypeScript + Framer Motion" />
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
          More features under development
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
