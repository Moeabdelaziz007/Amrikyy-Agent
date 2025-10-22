import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plane, Search, CreditCard, CheckCircle } from 'lucide-react';
import { AnimatedHero } from '@/components/ui/animated-hero';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export function Home() {
  const heroFeatures = [
    {
      icon: <Search className="h-8 w-8 text-primary mx-auto" />,
      title: "AI-Powered Search",
      description: "Find the perfect flights with our intelligent search algorithm"
    },
    {
      icon: <Plane className="h-8 w-8 text-primary mx-auto" />,
      title: "Best Prices",
      description: "Compare prices across all major airlines in real-time"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary mx-auto" />,
      title: "Secure Booking",
      description: "Safe and secure payment processing with instant confirmation"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Enhanced Hero Section */}
      <AnimatedHero
        title="Your Journey Starts Here"
        subtitle="Book flights with ease. Powered by AI. Built for travelers."
        primaryAction={{
          text: "Search Flights",
          onClick: () => window.location.href = '/search'
        }}
        secondaryAction={{
          text: "Get Started",
          onClick: () => window.location.href = '/auth'
        }}
        features={heroFeatures}
      />

      {/* Enhanced Features Section */}
      <motion.section
        className="py-20 md:py-32"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Book your perfect flight in three simple steps with our streamlined process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8 text-primary" />,
                title: "Search",
                description: "Enter your destination and travel dates to find the best flights",
                step: "01"
              },
              {
                icon: <Plane className="h-8 w-8 text-primary" />,
                title: "Select",
                description: "Choose from a wide range of flights that match your preferences",
                step: "02"
              },
              {
                icon: <CreditCard className="h-8 w-8 text-primary" />,
                title: "Book",
                description: "Complete your booking securely and receive instant confirmation",
                step: "03"
              }
            ].map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card hoverable glassmorphism className="text-center p-8 h-full group">
                  <div className="relative mb-6">
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary/20 to-maya-ocean/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Book Your Next Adventure?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of travelers who trust Amrikyy for their flight bookings
            </p>
            <Link to="/search">
              <Button size="lg">
                Start Searching
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
