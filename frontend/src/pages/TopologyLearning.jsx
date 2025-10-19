import React from 'react';
import { motion } from 'framer-motion';
import TopologyHologram from '../components/TopologyHologram';
import '../styles/topology-hologram.css';

const TopologyLearning = () => {
  return (
    <div className="relative">
      {/* Matrix-style background */}
      <div className="matrix-bg"></div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <TopologyHologram />

      {/* Additional learning resources section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-black/80 border border-neonGreen rounded-lg p-4 shadow-neonGreen"
        >
          <h4 className="text-neonGreen text-sm font-semibold mb-2">
            Quick Links
          </h4>
          <div className="space-y-1 text-xs">
            <a
              href="https://www.youtube.com/c/3blue1brown"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-neonGreen transition-colors"
            >
              🎥 3Blue1Brown
            </a>
            <a
              href="https://www.youtube.com/user/numberphile"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-neonGreen transition-colors"
            >
              🔢 Numberphile
            </a>
            <a
              href="https://ocw.mit.edu/courses/mathematics/18-901-introduction-to-topology-fall-2004/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-neonGreen transition-colors"
            >
              🎓 MIT OCW
            </a>
            <a
              href="https://topologywithouttears.net"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-neonGreen transition-colors"
            >
              📚 Topology Without Tears
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress tracker */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 6 }}
        className="fixed top-4 left-4 z-50"
      >
        <div className="bg-black/80 border border-neonGreen rounded-lg p-4 shadow-neonGreen">
          <h4 className="text-neonGreen text-sm font-semibold mb-2">
            Learning Progress
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Foundation', progress: 25, color: 'bg-green-500' },
              {
                label: 'Visual Learning',
                progress: 15,
                color: 'bg-yellow-500',
              },
              { label: 'Textbook Study', progress: 10, color: 'bg-blue-500' },
              { label: 'MIT Courses', progress: 5, color: 'bg-purple-500' },
            ].map((item, index) => (
              <div key={index} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-neonGreen">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Study timer */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 7 }}
        className="fixed bottom-4 left-4 z-50"
      >
        <div className="bg-black/80 border border-neonGreen rounded-lg p-4 shadow-neonGreen">
          <h4 className="text-neonGreen text-sm font-semibold mb-2">
            Study Timer
          </h4>
          <div className="text-center">
            <div className="text-2xl font-mono text-neonGreen mb-2">25:00</div>
            <div className="flex space-x-2">
              <button className="bg-neonGreen text-black px-3 py-1 rounded text-xs font-semibold hover:bg-green-400 transition-colors">
                Start
              </button>
              <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-gray-500 transition-colors">
                Pause
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-500 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TopologyLearning;
