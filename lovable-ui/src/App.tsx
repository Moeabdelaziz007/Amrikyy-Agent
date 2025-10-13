import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { PageTransition } from "./components/PageTransition";
import Landing from "./pages/Landing";
import Plan from "./pages/Plan";
import Results from "./pages/Results";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
              <Route path="/plan" element={<PageTransition><Plan /></PageTransition>} />
              <Route path="/results" element={<PageTransition><Results /></PageTransition>} />
              <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
