import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
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

export default NotFound;