import { Routes, Route, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import LandingPage from '@/pages/LandingPage';
import OSDemo from '@/pages/OSDemo';
import MobileOSDemo from '@/pages/MobileOSDemo';
import ResponsiveTest from '@/pages/ResponsiveTest';
import AmrikyyOSComplete from '@/pages/AmrikyyOSComplete';
import AppLauncher from '@/pages/AppLauncher';
import CodebaseExplorer from '@/pages/CodebaseExplorer';
import SEODashboard from '@/pages/SEODashboard';
import AIUIDashboard from '@/pages/AIUIDashboard';
import VoiceTest from '@/pages/VoiceTest';

/**
 * Amrikyy Travel Agent - Route Configuration
 * 
 * Route Structure:
 * - Public Routes: /, /landing, /os-demo, /mobile-demo
 * - Dashboard Routes: /home, /seo, /codebase
 * - OS Routes: /amrikyy-os, /launcher
 * - Feature Routes: /search, /bookings, /auth (coming soon)
 * - Dev Routes: /responsive-test
 */

function App() {
  return (
    <>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC ROUTES - No Authentication Required */}
        {/* ============================================ */}
        
        {/* Main Entry Point - App Launcher */}
        <Route path="/" element={<AppLauncher />} />
        
        {/* Marketing Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* ============================================ */}
        {/* OS EXPERIENCE ROUTES */}
        {/* ============================================ */}
        
        {/* Complete OS Experience (Primary) */}
        <Route path="/os" element={<AmrikyyOSComplete />} />
        <Route path="/amrikyy-os" element={<AmrikyyOSComplete />} /> {/* Legacy */}
        
        {/* Desktop OS Demo */}
        <Route path="/os-demo" element={<OSDemo />} />
        
        {/* Mobile OS Demo */}
        <Route path="/mobile-demo" element={<MobileOSDemo />} />
        
        {/* App Launcher (Alternative Entry) */}
        <Route path="/launcher" element={<AppLauncher />} />

        {/* ============================================ */}
        {/* DASHBOARD ROUTES */}
        {/* ============================================ */}
        
        {/* Main Dashboard */}
        <Route path="/dashboard" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } />
        <Route path="/home" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } /> {/* Legacy */}
        
        {/* SEO Analytics Dashboard */}
        <Route path="/seo" element={<SEODashboard />} />
        
        {/* Codebase Explorer (Developer Tool) */}
        <Route path="/codebase" element={<CodebaseExplorer />} />
        
        {/* AI UI Dashboard (Kombai-like Tool) */}
        <Route path="/ai-ui" element={<AIUIDashboard />} />
        
        {/* Voice Test Page */}
        <Route path="/voice-test" element={<VoiceTest />} />

        {/* ============================================ */}
        {/* FEATURE ROUTES - Coming Soon */}
        {/* ============================================ */}
        
        {/* Flight Search (Week 2) */}
        <Route path="/search" element={
          <AppLayout>
            <ComingSoon 
              title="Search Flights" 
              week="2"
              description="AI-powered flight search with price prediction and deal discovery"
            />
          </AppLayout>
        } />
        
        {/* Booking Management (Week 3) */}
        <Route path="/bookings" element={
          <AppLayout>
            <ComingSoon 
              title="My Bookings" 
              week="3"
              description="Manage your trips with autonomous booking and 24/7 monitoring"
            />
          </AppLayout>
        } />
        
        {/* Authentication (Week 1) */}
        <Route path="/auth" element={
          <AppLayout>
            <ComingSoon 
              title="Authentication" 
              week="1"
              description="Secure login with Telegram, Google, and email options"
            />
          </AppLayout>
        } />
        
        {/* Autonomous Dashboard (Week 3) */}
        <Route path="/autonomous" element={
          <AppLayout>
            <ComingSoon 
              title="Autonomous Dashboard" 
              week="3"
              description="Real-time monitoring of AI agents, intake analyzer, and automation stats"
            />
          </AppLayout>
        } />

        {/* ============================================ */}
        {/* DEVELOPMENT ROUTES */}
        {/* ============================================ */}
        
        {/* Responsive Testing Tool */}
        <Route path="/responsive-test" element={<ResponsiveTest />} />

        {/* ============================================ */}
        {/* ERROR ROUTES */}
        {/* ============================================ */}
        
        {/* 404 Not Found */}
        <Route path="*" element={
          <AppLayout>
            <NotFound />
          </AppLayout>
        } />
      </Routes>
      
      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}



interface ComingSoonProps {
  title: string;
  week: string;
  description: string;
}

function ComingSoon({ title, week, description }: ComingSoonProps) {
  return (
    <div className="container py-20">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Coming Soon in Week {week}
          </p>
        </div>

        {/* Description */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full animate-pulse"
              style={{ width: `${(parseInt(week) / 12) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Week {week} of 12-week roadmap
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Back to Home
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
              View Dashboard
            </button>
          </Link>
        </div>

        {/* Roadmap Link */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Want to see the full development roadmap?
          </p>
          <a 
            href="https://github.com/Moeabdelaziz007/Amrikyy-Agent/blob/main/docs/COMPLETE_IMPLEMENTATION_PLAN.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View 12-Week Implementation Plan →
          </a>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Page Not Found</p>
        <Link to="/">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default App;
