import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { 
  ArrowRight, Shield, Sparkles, Clock, Star, CheckCircle2, 
  Globe, MapPin, ChevronDown, Play 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { countries } from '@/lib/mockApi';
import { useTripStore } from '@/store/tripStore';
import { CursorTrail } from '@/components/CursorTrail';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { LiquidText } from '@/components/LiquidText';
import { ParallaxLayer, ParallaxSection } from '@/components/ParallaxLayer';

export default function Landing() {
  const navigate = useNavigate();
  const { setTripData } = useTripStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCountrySelect = (country: string) => {
    setTripData({ destination: country });
    navigate('/plan');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Smart recommendations tailored to your preferences and budget',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and encrypted transactions with instant confirmation',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your peace of mind',
      color: 'from-emerald-500 to-green-500',
    },
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      location: 'Cairo, Egypt',
      rating: 5,
      text: 'Amazing experience! The AI agent helped me plan the perfect family vacation.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    },
    {
      name: 'Sarah Al-Mansoori',
      location: 'Dubai, UAE',
      rating: 5,
      text: 'Best travel platform I\'ve used. Seamless booking and great recommendations.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      name: 'Mohammed Al-Otaibi',
      location: 'Riyadh, Saudi Arabia',
      rating: 5,
      text: 'The personalized itinerary was spot-on. Saved me hours of research!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Trips Planned' },
    { number: '3', label: 'Countries' },
    { number: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <CursorTrail />
      <FloatingActionBar />
      {/* Cinematic Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover opacity-20 will-change-transform"
          >
            <source 
              src="https://cdn.coverr.co/videos/coverr-aerial-view-of-a-tropical-beach-3192/1080p.mp4" 
              type="video/mp4" 
            />
          </video>
          
          {/* Gradient Overlay with Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"
          />
          
          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-accent/20 animate-gradient-y" />
          </div>

          {/* Floating Particles - Optimized */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full will-change-transform"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Mouse Follow Effect */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
            animate={{
              x: mousePosition.x * 0.02,
              y: mousePosition.y * 0.02,
            }}
            transition={{ type: "spring", damping: 30 }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 min-h-screen flex flex-col justify-center">
          <div className="text-center space-y-8">
            
            {/* Floating Badge */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card/50 backdrop-blur-xl border border-border/50 animate-float"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold">AI-Powered Travel Planning</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl lg:text-8xl font-black leading-tight"
            >
              <span className="block mb-2">Your Journey Starts</span>
              <LiquidText
                text="With Intelligence"
                className="chromatic-hover block bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x will-change-transform"
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            >
              Experience the future of travel with AI-powered recommendations for Egypt, Saudi Arabia, and the UAE. 
              Plan smarter, travel better.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/plan')}
                  size="lg"
                  className="relative group overflow-hidden bg-gradient-primary hover:shadow-glow text-lg px-8"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-secondary to-accent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Planning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 border-2 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 md:gap-8 mt-20 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="p-6 bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                    className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2"
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <ParallaxSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <ParallaxLayer speed={-2}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-black mb-4">Why Choose Amrikyy?</h2>
                <p className="text-xl text-muted-foreground">Powered by cutting-edge AI technology</p>
              </motion.div>
            </ParallaxLayer>

            <ParallaxLayer speed={-1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                }}
              >
                <Card className="holographic-card relative p-8 overflow-hidden bg-gradient-card border-border/50 h-full">
                  <div className="holographic-shimmer" />
                  {/* Animated Background Gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <CardContent className="relative p-0">
                    {/* Icon with Rotation Animation */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg`}>
                        <feature.icon className="w-full h-full text-white" />
                      </div>
                      
                      {/* Orbiting Particles - Simplified */}
                      <div className="absolute inset-0 animate-spin-slow">
                        {[0, 120, 240].map((angle, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-primary rounded-full animate-pulse-glow"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: `rotate(${angle}deg) translateX(40px)`,
                              animationDelay: `${i * 0.3}s`,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* Hover Arrow */}
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      className="mt-4 flex items-center gap-2 text-primary font-semibold"
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </CardContent>

                  {/* Corner Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            ))}
          </div>
        </ParallaxLayer>
        </div>
      </section>
      </ParallaxSection>

      {/* Enhanced Country Cards Section */}
      <ParallaxSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <ParallaxLayer speed={-1.5}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-black mb-4">Explore Our Destinations</h2>
                <p className="text-xl text-muted-foreground">Choose your next adventure</p>
              </motion.div>
            </ParallaxLayer>

            <ParallaxLayer speed={-0.5}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative cursor-pointer"
                onClick={() => handleCountrySelect(country.name)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                }}
              >
                {/* Card Container */}
                <motion.div
                  className="holographic-card relative h-[500px] rounded-3xl overflow-hidden"
                  whileHover={{ 
                    scale: 1.03,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="holographic-shimmer" />
                  {/* Background Image with Parallax */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      scale: hoveredCard === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <img
                      src={country.image}
                      alt={country.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Gradient Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                    animate={{
                      opacity: hoveredCard === index ? 0.95 : 0.7,
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    {/* Country Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Country Name */}
                    <motion.h3
                      className="text-4xl font-black text-white mb-2"
                      animate={{
                        y: hoveredCard === index ? -5 : 0,
                      }}
                    >
                      {country.name}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      className="text-gray-200 mb-4"
                      animate={{
                        opacity: hoveredCard === index ? 1 : 0.8,
                      }}
                    >
                      {country.description}
                    </motion.p>

                    {/* Highlights */}
                    <motion.div
                      className="space-y-2 mb-6"
                      initial="hidden"
                      animate={hoveredCard === index ? "show" : "hidden"}
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                    >
                      {country.highlights.slice(0, 3).map((highlight, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            hidden: { x: -20, opacity: 0 },
                            show: { x: 0, opacity: 1 },
                          }}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <MapPin className="w-4 h-4 text-accent" />
                          {highlight}
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-primary rounded-2xl font-bold text-white flex items-center justify-center gap-2 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCountrySelect(country.name);
                      }}
                    >
                      Explore {country.name}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      opacity: hoveredCard === index ? 1 : 0,
                    }}
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3), transparent 70%)',
                    }}
                  />
                </motion.div>

                {/* 3D Shadow */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-3xl blur-2xl"
                  animate={{
                    opacity: hoveredCard === index ? 0.5 : 0,
                    scale: hoveredCard === index ? 1.05 : 1,
                  }}
                  style={{
                    background: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))',
                  }}
                />
              </motion.div>
            ))}
          </div>
        </ParallaxLayer>
        </div>
      </section>
      </ParallaxSection>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4">Trusted by Travelers</h2>
            <p className="text-xl text-muted-foreground">See what our customers say</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gradient-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{testimonial.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{
            background: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))',
            backgroundSize: '200% 200%',
          }}
        />
        
        <div className="relative max-w-4xl mx-auto text-center text-primary-foreground">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black mb-6"
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 opacity-90"
          >
            Let our AI travel agents create your perfect itinerary in minutes
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/plan')}
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
