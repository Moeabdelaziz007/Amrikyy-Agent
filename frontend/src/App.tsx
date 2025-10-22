import { Routes, Route, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import LandingPage from '@/pages/LandingPage';
import TestBooking from '@/pages/TestBooking';
import VoiceAI from '@/components/VoiceAI';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { FlightSearch } from '@/pages/FlightSearch';
import { SearchResults } from '@/pages/SearchResults';
import { MyBookings } from '@/pages/MyBookings';

function App() {
  return (
    <LanguageProvider>
      {/* Language Toggle Button */}
      <LanguageToggle />
      
      {/* Global Voice AI Assistant */}
      <VoiceAI position="fixed" />
      
      <Routes>
      {/* New Stunning Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Old Home (moved to /home) */}
      <Route path="/home" element={
        <AppLayout>
          <Home />
        </AppLayout>
      } />
      
      {/* Test Booking */}
      <Route path="/test-booking" element={<TestBooking />} />
      
      {/* Search & Bookings */}
      <Route path="/search" element={<FlightSearch />} />
      <Route path="/search/results" element={<SearchResults />} />
      <Route path="/bookings" element={<MyBookings />} />
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
    </LanguageProvider>
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
