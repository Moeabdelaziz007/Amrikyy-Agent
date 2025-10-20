import React from 'react';
import { Link } from 'react-router-dom';

export default function DemoPage() {
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
