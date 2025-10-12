// ===== عرض الأخطاء =====

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ErrorDisplay({ error, onRetry, onGoHome }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-gradient-to-br from-red-900/50 to-gray-900 rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl">
        {/* أيقونة الخطأ */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        </motion.div>

        {/* عنوان */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          عذراً، حدث خطأ
        </h2>

        {/* رسالة الخطأ */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-center text-sm">{error}</p>
        </div>

        {/* الأزرار */}
        <div className="space-y-3">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              إعادة المحاولة
            </motion.button>
          )}

          {onGoHome && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              العودة للبداية
            </motion.button>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني
          </p>
        </div>
      </div>
    </motion.div>
  );
}
