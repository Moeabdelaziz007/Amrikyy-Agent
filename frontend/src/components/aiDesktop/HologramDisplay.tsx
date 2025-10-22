import { motion } from 'framer-motion';

/**
 * HologramDisplay - Central rotating gradient card with orbital effects
 * Features:
 * - Large rotating gradient card (green to pink)
 * - Orbital rings
 * - Floating colored particles
 * - Brand text overlay with Gemini branding
 */
const HologramDisplay = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Orbital Rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-cyan-500/20"
          style={{
            width: `${ring * 200}px`,
            height: `${ring * 200}px`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + ring * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Central Gradient Card */}
      <motion.div
        className="relative w-80 h-80 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #22D3EE 50%, #EC4899 100%)',
          boxShadow: '0 0 60px rgba(34, 211, 238, 0.5)',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <motion.div
            className="text-white font-bold text-center"
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            }}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="text-xl mb-2">Super AI Automation Agency</div>
            <div className="text-3xl mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              AMRIKYY
            </div>
            <div className="text-sm opacity-90">Powered By Gemini ✨</div>
          </motion.div>
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Orbiting Particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: ['#22D3EE', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#60A5FA'][i],
            boxShadow: `0 0 10px ${['#22D3EE', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#60A5FA'][i]}`,
          }}
          animate={{
            x: [
              Math.cos((i * 60) * Math.PI / 180) * 250,
              Math.cos((i * 60 + 360) * Math.PI / 180) * 250,
            ],
            y: [
              Math.sin((i * 60) * Math.PI / 180) * 250,
              Math.sin((i * 60 + 360) * Math.PI / 180) * 250,
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default HologramDisplay;