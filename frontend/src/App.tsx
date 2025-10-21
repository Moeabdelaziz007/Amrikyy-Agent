import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import { DesktopOS } from '@/components/desktop-os';
import LandingPage from '@/pages/LandingPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route 
          path="/desktop" 
          element={
            <WindowManagerProvider>
              <DesktopOS />
            </WindowManagerProvider>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
