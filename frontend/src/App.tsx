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

function App() {
  return (
    <>
      <Routes>
      {/* Main Route - App Launcher */}
      <Route path="/" element={<AppLauncher />} />

      {/* Legacy Home Page (moved to /home) */}
      <Route path="/home" element={
        <AppLayout>
          <Home />
        </AppLayout>
      } />

      {/* Legacy Landing Page */}
      <Route path="/landing" element={<LandingPage />} />

      {/* AI OS Demo */}
      <Route path="/os-demo" element={<OSDemo />} />

      {/* Mobile OS Demo */}
      <Route path="/mobile-demo" element={<MobileOSDemo />} />

      {/* Responsive Test */}
      <Route path="/responsive-test" element={<ResponsiveTest />} />

      {/* Complete OS (Claude 4.5) */}
      <Route path="/amrikyy-os" element={<AmrikyyOSComplete />} />

      {/* App Launcher (legacy route for backwards compatibility) */}
      <Route path="/launcher" element={<AppLauncher />} />

      {/* Codebase Explorer (Ona AI) */}
      <Route path="/codebase" element={<CodebaseExplorer />} />

      {/* SEO Dashboard */}
      <Route path="/seo" element={<SEODashboard />} />

      {/* Placeholder Routes */}
      <Route path="/search" element={
        <AppLayout>
          <ComingSoon title="Search Flights" />
        </AppLayout>
      } />
      <Route path="/bookings" element={
        <AppLayout>
          <ComingSoon title="My Bookings" />
        </AppLayout>
      } />
      <Route path="/auth" element={
        <AppLayout>
          <ComingSoon title="Authentication" />
        </AppLayout>
      } />

      {/* 404 */}
      <Route path="*" element={
        <AppLayout>
          <NotFound />
        </AppLayout>
      } />
    </Routes>
    <Analytics />
    </>
  );
}



function ComingSoon({ title }: { title: string }) {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-xl text-muted-foreground">
          This feature is coming soon in Week {title.includes('Search') ? '2' : title.includes('Booking') ? '3' : '1'} of development.
        </p>
        <Link to="/">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Back to Home
          </button>
        </Link>
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
