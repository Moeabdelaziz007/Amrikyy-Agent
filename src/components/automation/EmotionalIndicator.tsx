// ===== مؤشر الذكاء العاطفي =====

import { motion } from 'framer-motion';
import { getEmotionalColor, getEmotionalMessage } from '../../services/emotionalDetection';

interface EmotionalIndicatorProps {
  emotion: 'متحمس' | 'متوتر' | 'مرتبك' | 'محايد';
}

export function EmotionalIndicator({ emotion }: EmotionalIndicatorProps) {
  const config = getEmotionalColor(emotion);
  const message = getEmotionalMessage(emotion);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute top-20 right-6 bg-gradient-to-r ${config.gradient} p-4 rounded-2xl shadow-2xl max-w-xs z-10`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl"
        >
          {config.icon}
        </motion.div>
        <div>
          <p className="text-white font-bold text-sm">الذكاء العاطفي نشط</p>
          <p className="text-white/80 text-xs mt-1">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}

