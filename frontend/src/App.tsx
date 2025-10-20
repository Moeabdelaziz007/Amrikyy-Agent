import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Lazy load components for better performance
const HomePage = lazy(() => import('./components/HomePage'));
const DemoPage = lazy(() => import('./components/DemoPage'));
const NotFound = lazy(() => import('./components/NotFound'));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
