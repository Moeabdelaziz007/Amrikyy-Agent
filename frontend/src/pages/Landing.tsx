import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Sparkles, Clock, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { countries } from '@/lib/mockApi';
import { useTripStore } from '@/store/tripStore';

export default function Landing() {
  const navigate = useNavigate();
  const { setTripData } = useTripStore();

  const handleCountrySelect = (country: string) => {
    setTripData({ destination: country });
    navigate('/plan');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Smart recommendations tailored to your preferences and budget',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and encrypted transactions with instant confirmation',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your peace of mind',
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-card rounded-full border border-primary/20 animate-float">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Travel Planning</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="block mb-2">Your Journey Starts</span>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                With Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of travel with AI-powered recommendations for Egypt, Saudi Arabia, and the UAE. 
              Plan smarter, travel better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/plan')}
                size="lg"
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8"
              >
                Start Planning
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Amrikyy?</h2>
          <p className="text-muted-foreground text-lg">Powered by cutting-edge AI technology</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-fade-in-up hover:shadow-elegant transition-all duration-300 bg-gradient-card border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-gradient-primary rounded-2xl mb-4">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Explore Our Destinations</h2>
            <p className="text-muted-foreground text-lg">Choose your next adventure</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <Card
                key={index}
                className="group cursor-pointer overflow-hidden animate-fade-in-up hover:shadow-elegant transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCountrySelect(country.name)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{country.name}</h3>
                    <p className="text-sm opacity-90 mb-4">{country.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {country.highlights.slice(0, 2).map((highlight, i) => (
                        <span key={i} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Button
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCountrySelect(country.name);
                    }}
                  >
                    Plan Your Trip
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by Travelers</h2>
          <p className="text-muted-foreground text-lg">See what our customers say</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="animate-fade-in-up bg-gradient-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our AI travel agents create your perfect itinerary in minutes
          </p>
          <Button
            onClick={() => navigate('/plan')}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
