// ===== المكون الرئيسي: مسرح الأتمتة =====

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, Brain, CheckCircle2 } from 'lucide-react';

// Hooks & Services
import { useAutomationSSE } from '../../hooks/useAutomationSSE';
import { detectUserEmotion, getCachedEmotionalState, cacheEmotionalState } from '../../services/emotionalDetection';
import { trackAutomationStart, trackAutomationComplete, trackAutomationError } from '../../utils/analytics';

// Components
import { EmotionalIndicator } from './EmotionalIndicator';
import { BrowserViewport } from './BrowserViewport';
import { ActionTimeline } from './ActionTimeline';
import { NarrationCard } from './NarrationCard';
import { HotelDiscoveryCards } from './HotelDiscoveryCards';
import { ErrorDisplay } from './ErrorDisplay';

// Types
import type { TripSearchData, HotelDiscovery } from '../../types/automation';

interface AutomationTheaterProps {
  tripData?: TripSearchData;
  onClose?: () => void;
  userId?: string;
}

export default function AutomationTheater({ 
  tripData: initialTripData, 
  onClose,
  userId 
}: AutomationTheaterProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [startAutomation, setStartAutomation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [emotionalState, setEmotionalState] = useState<'متحمس' | 'متوتر' | 'مرتبك' | 'محايد'>('محايد');

  // بيانات الرحلة الافتراضية (يمكن استبدالها بـ props)
  const tripData: TripSearchData = initialTripData || {
    destination: 'القاهرة',
    checkIn: '2025-12-20',
    checkOut: '2025-12-27',
    budget: 150,
    travelers: 2
  };

  // استخدام Hook الحقيقي للأتمتة
  const {
    phase,
    currentAction,
    progress,
    screenshot,
    actions,
    discoveredHotels,
    error,
    startTime,
    stop,
    reset
  } = useAutomationSSE(tripData, startAutomation);

  // كشف العاطفة عند التحميل
  useEffect(() => {
    const detectEmotion = async () => {
      if (!userId) return;

      // محاولة الحصول على الحالة من الذاكرة المؤقتة
      const cached = getCachedEmotionalState(userId);
      if (cached) {
        setEmotionalState(cached.emotion);
        return;
      }

      // كشف جديد
      try {
        // TODO: الحصول على محادثات المستخدم من قاعدة البيانات
        const conversationHistory: string[] = [];
        const detected = await detectUserEmotion(conversationHistory);
        setEmotionalState(detected.emotion);
        cacheEmotionalState(userId, detected);
      } catch (err) {
        console.error('فشل الكشف العاطفي:', err);
      }
    };

    detectEmotion();
  }, [userId]);

  // تتبع بدء الأتمتة
  useEffect(() => {
    if (startAutomation && phase === 'running') {
      trackAutomationStart(tripData, userId);
    }
  }, [startAutomation, phase]);

  // تتبع النتائج
  useEffect(() => {
    if (phase === 'complete' && startTime) {
      const duration = Date.now() - startTime;
      trackAutomationComplete({
        destination: tripData.destination,
        hotelsFound: discoveredHotels.length,
        duration,
        actions: actions.length
      }, userId);
    }
  }, [phase]);

  // تتبع الأخطاء
  useEffect(() => {
    if (phase === 'error' && error && startTime) {
      const duration = Date.now() - startTime;
      trackAutomationError({
        error,
        phase: 'automation',
        duration
      }, userId);
    }
  }, [phase, error]);

  // معالج بدء الأتمتة
  const handleStart = () => {
    setShowIntro(false);
    setStartAutomation(true);
  };

  // معالج الإيقاف المؤقت
  const handlePause = () => {
    setIsPaused(!isPaused);
    // TODO: تطبيق الإيقاف الفعلي في Backend
  };

  // معالج الإيقاف
  const handleStop = () => {
    stop();
    if (onClose) {
      onClose();
    } else {
      reset();
      setShowIntro(true);
      setStartAutomation(false);
    }
  };

  // معالج إعادة المحاولة
  const handleRetry = () => {
    reset();
    setStartAutomation(true);
  };

  // معالج النقر على فندق
  const handleHotelClick = (hotel: HotelDiscovery) => {
    console.log('تم النقر على فندق:', hotel);
    // TODO: فتح modal بتفاصيل الفندق
  };

  // ===== واجهة المقدمة =====
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto mb-8"
          >
            <Brain className="w-full h-full text-blue-500" />
          </motion.div>

          <h1 className="text-5xl font-bold text-white mb-4">
            وكيل أمريكي AI
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            دعني أجد لك أفضل الفنادق في {tripData.destination}
          </p>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <p className="text-gray-400 text-sm">الوجهة</p>
                <p className="text-white font-bold">{tripData.destination}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">عدد المسافرين</p>
                <p className="text-white font-bold">{tripData.travelers}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">تسجيل الوصول</p>
                <p className="text-white font-bold">{tripData.checkIn}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">تسجيل المغادرة</p>
                <p className="text-white font-bold">{tripData.checkOut}</p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-2xl"
          >
            ابدأ البحث الذكي ✨
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ===== عرض الأخطاء =====
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={handleRetry}
        onGoHome={handleStop}
      />
    );
  }

  // ===== واجهة الأتمتة الجارية =====
  if (phase === 'running' || phase === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-black"
      >
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
            />
            <h2 className="text-2xl font-bold text-white">
              وكيل أمريكي AI
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePause}
              disabled={phase !== 'running'}
              className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            <button
              onClick={handleStop}
              className="p-3 rounded-xl bg-red-600/50 hover:bg-red-600/70 text-white transition-all"
              title="إيقاف"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* المؤشر العاطفي */}
        <AnimatePresence>
          {emotionalState !== 'محايد' && (
            <EmotionalIndicator emotion={emotionalState} />
          )}
        </AnimatePresence>

        {/* المحتوى الرئيسي */}
        <div className="h-[calc(100vh-200px)] flex gap-6 p-6">
          <BrowserViewport 
            screenshot={screenshot} 
            status={phase}
          />
          <ActionTimeline actions={actions} />
        </div>

        {/* بطاقات الاكتشاف */}
        <AnimatePresence>
          {discoveredHotels.length > 0 && (
            <HotelDiscoveryCards 
              hotels={discoveredHotels}
              onHotelClick={handleHotelClick}
            />
          )}
        </AnimatePresence>

        {/* بطاقة الشرح */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <NarrationCard 
            currentAction={currentAction}
            progress={progress}
          />
        </div>
      </motion.div>
    );
  }

  // ===== واجهة النتائج =====
  if (phase === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8"
      >
        <div className="max-w-6xl mx-auto">
          {/* رأس النتائج */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center mb-12"
          >
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-4">
              🎉 وجدت إقامتك المثالية!
            </h1>
            <p className="text-xl text-gray-400">
              حللت {actions.length} إجراء في {startTime ? Math.round((Date.now() - startTime) / 1000) : 0} ثانية ووجدت هذه الجواهر
            </p>
          </motion.div>

          {/* شبكة الفنادق */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {discoveredHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{hotel.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="text-gray-300">{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="bg-black/30 rounded-2xl p-4 mb-4">
                  <p className="text-4xl font-bold text-white">${Math.round(hotel.price)}</p>
                  <p className="text-gray-400">لكل ليلة</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">نقاط AI</span>
                    <span className="text-sm font-bold text-green-400">
                      {Math.round(hotel.aiScore)}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                      style={{ width: `${hotel.aiScore}%` }}
                    />
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold transition-all">
                  احجز الآن
                </button>
              </motion.div>
            ))}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
            >
              بحث جديد
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

