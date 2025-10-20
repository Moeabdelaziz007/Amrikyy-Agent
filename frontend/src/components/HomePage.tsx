import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import LazyComponent from './LazyComponent';

// Lazy load heavy components
const FeatureCard = lazy(() => import('./FeatureCard'));

const HomePage = () => (
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
          to="/demo" 
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-xl transition-all"
        >
          Start Learning
        </Link>
        <Link 
          to="/demo" 
          className="px-8 py-4 bg-slate-800 text-white font-bold rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all"
        >
          Explore Courses
        </Link>
      </div>
      <LazyComponent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Suspense fallback={<div className="p-6 bg-slate-800/50 rounded-xl animate-pulse h-32"></div>}>
            <FeatureCard emoji="🚀" title="AI-Powered" description="Personalized learning with advanced AI" />
          </Suspense>
          <Suspense fallback={<div className="p-6 bg-slate-800/50 rounded-xl animate-pulse h-32"></div>}>
            <FeatureCard emoji="🎯" title="Interactive" description="Hands-on projects and real-world skills" />
          </Suspense>
          <Suspense fallback={<div className="p-6 bg-slate-800/50 rounded-xl animate-pulse h-32"></div>}>
            <FeatureCard emoji="🌟" title="Expert-Led" description="Learn from industry professionals" />
          </Suspense>
        </div>
      </LazyComponent>
    </div>
  </div>
);

export default HomePage;