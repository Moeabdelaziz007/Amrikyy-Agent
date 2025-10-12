// ===== بطاقة الشرح والتقدم =====

import { motion } from 'framer-motion';
import { Loader2, Clock } from 'lucide-react';

interface NarrationCardProps {
  currentAction: string;
  progress: number;
  estimatedTime?: number; // بالثواني
}

export function NarrationCard({
  currentAction,
  progress,
  estimatedTime = 45,
}: NarrationCardProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* أيقونة متحركة */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </motion.div>

          {/* النص الرئيسي */}
          <div className="flex-1">
            <p className="text-white font-bold text-xl">
              {currentAction || 'جاري التحضير...'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              أنا أعمل على إيجاد أفضل الخيارات لك
            </p>
          </div>

          {/* مؤشر الوقت */}
          <div className="text-right">
            <Clock className="w-5 h-5 text-gray-400 mb-1 mx-auto" />
            <p className="text-xs text-gray-400">~ {estimatedTime} ثانية</p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-6 space-y-2">
          <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              {Math.round(progress)}% مكتمل
            </p>
            {progress >= 95 && progress < 100 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-green-400"
              >
                ✨ تقريباً انتهينا!
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
