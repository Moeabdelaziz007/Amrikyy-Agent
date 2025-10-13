import { Link } from 'react-router-dom';
import { Plane, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Amrikyy
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI-powered travel companion for unforgettable journeys across Egypt, Saudi Arabia, and the UAE.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/plan" className="hover:text-primary transition-colors">Plan Trip</Link></li>
              <li><Link to="/results" className="hover:text-primary transition-colors">Explore</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-semibold mb-4">Destinations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Egypt</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Saudi Arabia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">United Arab Emirates</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">All Destinations</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Amrikyy AI Travel Agent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
