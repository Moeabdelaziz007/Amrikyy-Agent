import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pause,
  Play,
  Brain,
  Heart,
  Users,
  Sparkles,
  MousePointer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ===== المكون الرئيسي: مسرح الأتمتة =====
export default function AutomationTheater() {
  const [phase, setPhase] = useState('intro'); // intro, running, results
  const [emotionalState, setEmotionalState] = useState('محايد');
  const [currentAction, setCurrentAction] = useState('');
  const [progress, setProgress] = useState(0);
  const [screenshot, setScreenshot] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [actions, setActions] = useState<
    Array<{
      id: number;
      description: string;
      timestamp: string;
      status: string;
    }>
  >([]);
  const [discoveredHotels, setDiscoveredHotels] = useState<
    Array<{
      id: number;
      name: string;
      rating: number;
      price: number;
      aiScore: number;
    }>
  >([]);

  // محاكاة بيانات الرحلة
  const tripData = {
    destination: 'القاهرة',
    checkIn: '20 ديسمبر',
    checkOut: '27 ديسمبر',
    budget: 150,
    travelers: 2,
  };

  // كشف العاطفة من رسائل المستخدم (محاكاة)
  useEffect(() => {
    const emotions = ['متحمس', 'متوتر', 'مرتبك', 'محايد'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setEmotionalState(randomEmotion);
  }, []);

  // محاكاة تقدم الأتمتة
  useEffect(() => {
    if (phase === 'running' && !isPaused) {
      const automationSteps = [
        { action: 'فتح Booking.com...', duration: 2000 },
        { action: 'إدخال الوجهة: القاهرة', duration: 1500 },
        { action: 'تحديد التواريخ: 20-27 ديسمبر', duration: 1500 },
        { action: 'البحث عن الفنادق المتاحة...', duration: 3000 },
        { action: 'وجدت 234 فندق! جاري التصفية...', duration: 2000 },
        { action: 'تطبيق حد الميزانية: 150$ لليلة', duration: 2000 },
        { action: 'تحليل التقييمات والمراجعات...', duration: 4000 },
        { action: 'مقارنة وسائل الراحة...', duration: 3000 },
        { action: 'اكتشفت 3 فنادق رائعة! 🎉', duration: 2000 },
      ];

      let currentStep = 0;
      let currentProgress = 0;

      const runAutomation = () => {
        if (currentStep < automationSteps.length) {
          const step = automationSteps[currentStep];
          setCurrentAction(step.action);

          // إضافة للجدول الزمني
          setActions((prev) => [
            ...prev,
            {
              id: Date.now(),
              description: step.action,
              timestamp: new Date().toISOString(),
              status: 'completed',
            },
          ]);

          currentProgress += 100 / automationSteps.length;
          setProgress(Math.min(currentProgress, 100));

          // محاكاة اكتشاف فنادق
          if (currentStep >= 6 && discoveredHotels.length < 3) {
            setTimeout(() => {
              setDiscoveredHotels((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  name: `فندق رائع ${prev.length + 1}`,
                  rating: 4.5 + Math.random() * 0.5,
                  price: 120 + Math.random() * 60,
                  aiScore: 80 + Math.random() * 20,
                },
              ]);
            }, 1000);
          }

          currentStep++;

          if (currentStep >= automationSteps.length) {
            setTimeout(() => setPhase('results'), 1000);
          } else {
            setTimeout(runAutomation, step.duration);
          }
        }
      };

      runAutomation();
    }
  }, [phase, isPaused, discoveredHotels.length]);

  // مكون: المؤشر العاطفي
  const EmotionalIndicator = () => {
    const emotionConfig: Record<
      string,
      { icon: string; color: string; message: string }
    > = {
      متحمس: {
        icon: '🎉',
        color: 'from-yellow-500 to-orange-500',
        message: 'أشعر بحماسك! دعني أجد لك أفضل الأماكن!',
      },
      متوتر: {
        icon: '😌',
        color: 'from-blue-500 to-cyan-500',
        message: 'لا تقلق، سأتعامل مع كل شيء بسرعة',
      },
      مرتبك: {
        icon: '🤝',
        color: 'from-purple-500 to-pink-500',
        message: 'دعني أرشدك خطوة بخطوة',
      },
      محايد: {
        icon: '🤖',
        color: 'from-gray-500 to-gray-600',
        message: 'جاهز لمساعدتك',
      },
    };

    const config = emotionConfig[emotionalState] || emotionConfig['محايد'];

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`absolute top-20 right-6 bg-gradient-to-r ${config.color} p-4 rounded-2xl shadow-2xl max-w-xs`}
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
            <p className="text-white/80 text-xs mt-1">{config.message}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // مكون: عرض المتصفح
  const BrowserViewport = () => (
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
        {screenshot ? (
          <motion.img
            key={screenshot}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={screenshot}
            className="w-full h-full object-contain"
            alt="Browser screenshot"
          />
        ) : (
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-16 h-16 text-blue-500 mx-auto" />
            </motion.div>
            <p className="text-gray-400 text-lg">AI يحلل خياراتك...</p>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-blue-500"
                />
              ))}
            </div>
          </div>
        )}

        {/* مؤشر الماوس المتحرك */}
        <motion.div
          animate={{
            x: [100, 200, 300, 200],
            y: [100, 150, 100, 50],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute pointer-events-none"
        >
          <MousePointer className="w-6 h-6 text-blue-400 drop-shadow-lg" />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -inset-2 rounded-full bg-blue-400"
          />
        </motion.div>
      </div>
    </div>
  );

  // مكون: بطاقة الشرح
  const NarrationCard = () => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-auto max-w-3xl"
    >
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </motion.div>
          <div className="flex-1">
            <p className="text-white font-bold text-xl">
              {currentAction || 'جاري التحضير...'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              أنا أعمل على إيجاد أفضل الخيارات لك
            </p>
          </div>
          <div className="text-right">
            <Clock className="w-5 h-5 text-gray-400 mb-1" />
            <p className="text-xs text-gray-400">~ 45 ثانية</p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {Math.round(progress)}% مكتمل
        </p>
      </div>
    </motion.div>
  );

  // مكون: الجدول الزمني
  const ActionTimeline = () => (
    <div className="w-96 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border-2 border-gray-800 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">الجدول الزمني</h3>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence>
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-4 border-l-2 border-blue-500/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900"
              />
              <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                <p className="text-sm text-white font-medium">
                  {action.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(action.timestamp).toLocaleTimeString('ar-EG')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  // مكون: بطاقات اكتشاف الفنادق
  const HotelDiscoveryCards = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute bottom-32 left-6 right-6"
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <AnimatePresence>
          {discoveredHotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.3, type: 'spring' }}
              className="min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold">{hotel.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-300">
                      {hotel.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full ${
                    hotel.aiScore > 90
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  <p className="text-xs font-bold">
                    AI: {Math.round(hotel.aiScore)}
                  </p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 mb-3">
                <p className="text-2xl font-bold text-white">
                  ${Math.round(hotel.price)}
                </p>
                <p className="text-xs text-gray-400">لكل ليلة</p>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 rounded-lg font-medium transition-all">
                عرض التفاصيل
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // واجهة البداية
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 mx-auto mb-8"
          >
            <Brain className="w-full h-full text-blue-500" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">وكيل أمريكي AI</h1>
          <p className="text-xl text-gray-400 mb-8">
            دعني أجد لك أفضل الفنادق في {tripData.destination}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('running')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-2xl"
          >
            ابدأ البحث الذكي ✨
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // واجهة الأتمتة
  if (phase === 'running') {
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
            <h2 className="text-2xl font-bold text-white">وكيل أمريكي AI</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* المؤشر العاطفي */}
        <EmotionalIndicator />

        {/* المحتوى الرئيسي */}
        <div className="h-[calc(100vh-200px)] flex gap-6 p-6">
          <BrowserViewport />
          <ActionTimeline />
        </div>

        {/* بطاقات الاكتشاف */}
        {discoveredHotels.length > 0 && <HotelDiscoveryCards />}

        {/* بطاقة الشرح */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <NarrationCard />
        </div>
      </motion.div>
    );
  }

  // واجهة النتائج
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center mb-12"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">
            🎉 وجدت إقامتك المثالية!
          </h1>
          <p className="text-xl text-gray-400">
            حللت 234 فندق في 47 ثانية ووجدت هذه الجواهر
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {discoveredHotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-2 border-gray-700 hover:border-blue-500 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-300">
                    {hotel.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 mb-4">
                <p className="text-4xl font-bold text-white">
                  ${Math.round(hotel.price)}
                </p>
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
      </div>
    </motion.div>
  );
}
