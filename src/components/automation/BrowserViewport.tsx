// ===== عرض المتصفح =====

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MousePointer, Sparkles } from 'lucide-react';

interface BrowserViewportProps {
  screenshot?: string;
  status: 'idle' | 'running' | 'complete' | 'error';
}

export function BrowserViewport({ screenshot, status }: BrowserViewportProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl">
      {/* شريط المتصفح */}
      <div className="bg-gray-800/90 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 bg-gray-900/50 rounded-lg px-4 py-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300 font-mono">
            booking.com/search/cairo...
          </span>
        </div>
      </div>

      {/* محتوى الشاشة */}
      <div className="relative h-[500px] bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {screenshot ? (
            <motion.img
              key={screenshot}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={`data:image/png;base64,${screenshot}`}
              alt="Browser view"
              className="w-full h-full object-contain"
            />
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-16 h-16 text-blue-500 mx-auto" />
              </motion.div>
              <p className="text-gray-400 text-lg">
                {status === 'running' ? 'AI يحلل خياراتك...' : 'جاري التحضير...'}
              </p>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-blue-500"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* مؤشر الماوس المتحرك */}
        {status === 'running' && (
          <motion.div
            animate={{
              x: [100, 200, 300, 200],
              y: [100, 150, 100, 50]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute pointer-events-none"
          >
            <MousePointer className="w-6 h-6 text-blue-400 drop-shadow-lg" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -inset-2 rounded-full bg-blue-400"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

