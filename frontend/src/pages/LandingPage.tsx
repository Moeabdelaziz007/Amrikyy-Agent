/**
 * Landing Page - Amrikyy Travel Platform
 * Eye-catching modern design with animations and 3D effects
 * 
 * @features
 * - Animated gradient background
 * - 3D card effects
 * - Glassmorphism
 * - Floating particles
 * - Interactive hover states
 * - Smooth scroll animations
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Search,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Heart,
  ChevronDown
} from 'lucide-react';
import VoiceAI from '@/components/VoiceAI';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            x: mousePosition.x * 50,
            y: mousePosition.y * 50,
          }}
          transition={{ type: "spring", stiffness: 50 }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 30,
            y: -mousePosition.y * 30,
          }}
          transition={{ type: "spring", stiffness: 50 }}
          className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-l from-purple-500/15 via-pink-500/15 to-blue-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePosition.x * 40,
            y: -mousePosition.y * 40,
          }}
          transition={{ type: "spring", stiffness: 50 }}
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20 relative">
          {/* Big Hero Image Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2400&auto=format&fit=crop"
                alt="Travel Adventure"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
            </motion.div>
          </div>

          <motion.div
            style={{ opacity, scale }}
            className="text-center max-w-7xl mx-auto relative z-10"
          >
            {/* Main Heading with Glow Effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-block mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-75" />
                    <Plane className="relative w-16 h-16 md:w-20 md:h-20 text-cyan-400" />
                  </motion.div>
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight">
                    <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text animate-gradient-x">
                      AMRIKYY
                    </span>
                  </h1>
                </div>
              </motion.div>

              {/* Subheading */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-bold text-slate-200 mb-6 leading-tight"
              >
                Your Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Simplified</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Plan, book, and manage your perfect trip with AI-powered travel intelligence. 
                From flights to hotels, we've got you covered.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(6, 182, 212, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/search')}
                  className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl font-bold text-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-3">
                    <Search className="w-6 h-6" />
                    Start Exploring
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/demo')}
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Watch Demo
                  </span>
                </motion.button>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="cursor-pointer"
                >
                  <ChevronDown className="w-8 h-8 text-cyan-400" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Why Choose Amrikyy?
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Experience the future of travel planning with our cutting-edge features
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap />}
                title="Instant Booking"
                description="Book flights and hotels in seconds with our lightning-fast platform"
                gradient="from-yellow-500 to-orange-500"
                delay={0.1}
              />
              <FeatureCard
                icon={<DollarSign />}
                title="Best Prices"
                description="AI-powered price tracking ensures you always get the best deals"
                gradient="from-green-500 to-emerald-500"
                delay={0.2}
              />
              <FeatureCard
                icon={<Shield />}
                title="Secure & Safe"
                description="Bank-level encryption and secure payment processing"
                gradient="from-blue-500 to-cyan-500"
                delay={0.3}
              />
              <FeatureCard
                icon={<Globe />}
                title="Worldwide Coverage"
                description="Access to millions of flights and hotels globally"
                gradient="from-purple-500 to-pink-500"
                delay={0.4}
              />
              <FeatureCard
                icon={<Users />}
                title="24/7 Support"
                description="Expert travel assistance available around the clock"
                gradient="from-cyan-500 to-blue-500"
                delay={0.5}
              />
              <FeatureCard
                icon={<Heart />}
                title="Personalized"
                description="Tailored recommendations based on your preferences"
                gradient="from-pink-500 to-rose-500"
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard
                number="1M+"
                label="Happy Travelers"
                icon={<Users />}
                delay={0.1}
              />
              <StatCard
                number="50K+"
                label="Destinations"
                icon={<MapPin />}
                delay={0.2}
              />
              <StatCard
                number="4.9/5"
                label="User Rating"
                icon={<Star />}
                delay={0.3}
              />
              <StatCard
                number="99%"
                label="Satisfaction"
                icon={<CheckCircle />}
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-slate-400">
                Get started in 3 simple steps
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <StepCard
                step="1"
                title="Search"
                description="Enter your destination, dates, and preferences"
                icon={<Search />}
                delay={0.1}
              />
              <StepCard
                step="2"
                title="Compare"
                description="Browse AI-curated options with best prices"
                icon={<TrendingUp />}
                delay={0.2}
              />
              <StepCard
                step="3"
                title="Book"
                description="Secure your booking in just a few clicks"
                icon={<CheckCircle />}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                Ready to Start Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Adventure?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join millions of travelers who trust Amrikyy for their journeys
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="px-12 py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl font-bold text-xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  Get Started Free
                  <ArrowRight className="w-6 h-6" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center text-slate-400">
            <p className="mb-4">© 2025 Amrikyy Travel Platform. All rights reserved.</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`} />
      
      <div className="relative h-full p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/30 transition-all duration-500">
        {/* Icon */}
        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <div className="w-8 h-8 text-white">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
          {title}
        </h3>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ number, label, icon, delay }: {
  number: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-center group-hover:border-white/30 transition-all duration-300">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
            <div className="w-6 h-6 text-white">
              {icon}
            </div>
          </div>
        </div>
        <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-2">
          {number}
        </div>
        <div className="text-slate-300 font-semibold">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// Step Card Component
function StepCard({ step, title, description, icon, delay }: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="flex flex-col items-center text-center">
        {/* Step Number */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50" />
          <div className="relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-black">
            {step}
          </div>
        </motion.div>

        {/* Icon */}
        <div className="mb-6 text-cyan-400">
          <div className="w-12 h-12">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">
          {title}
        </h3>
        <p className="text-slate-400 leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Add Voice AI to the page
export { VoiceAI };
