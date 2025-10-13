import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const FloatingActionBar = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Show bar after scrolling 300px
  const opacity = useTransform(scrollY, [300, 400], [0, 1]);
  const y = useTransform(scrollY, [300, 400], [100, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-3 px-6 py-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full shadow-elegant"
      >
        {/* Quick Action Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={() => navigate('/plan')}
            className="bg-gradient-primary hover:shadow-glow rounded-full px-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Planning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Secondary Actions */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full hover:bg-accent/10 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </motion.button>

        {/* Pulse Animation */}
        <motion.div
          className="absolute -inset-1 bg-gradient-primary rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
};
