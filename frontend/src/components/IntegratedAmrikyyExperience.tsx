import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Users,
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  MessageCircle,
  Share2,
  ThumbsUp,
} from 'lucide-react';

// ===== Types =====
interface Prediction {
  id: number;
  destination: string;
  checkIn: string;
  checkOut: string;
  budgetRange: [number, number];
  confidence: number;
  reasoning: string[];
  aiScore: number;
  status: 'active' | 'accepted' | 'dismissed';
}

interface Persona {
  type: string;
  confidence: number;
  traits: string[];
}

type ViewType = 'home' | 'predictions' | 'automation' | 'results';
type EmotionalState = 'متحمس' | 'متوتر' | 'مرتبك' | 'محايد';

// ===== التطبيق الرئيسي المتكامل =====
export default function IntegratedAmrikyyExperience() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('محايد');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [userPersona, setUserPersona] = useState<Persona | null>(null);

  // محاكاة تحميل بيانات المستخدم
  useEffect(() => {
    // في التطبيق الحقيقي، جلب من API
    setTimeout(() => {
      setUserPersona({
        type: 'رحال_رقمي',
        confidence: 0.92,
        traits: ['يحب العمل عن بعد', 'يفضل الأماكن الهادئة', 'ميزانية متوسطة'],
      });

      setPredictions([
        {
          id: 1,
          destination: 'اسطنبول',
          checkIn: '2025-11-15',
          checkOut: '2025-11-22',
          budgetRange: [100, 150],
          confidence: 0.87,
          reasoning: [
            'زرت مدن مشابهة في الخريف',
            'تفضل الأماكن الثقافية والتاريخية',
            'أسعار الطيران منخفضة الآن بنسبة 35%',
          ],
          aiScore: 94,
          status: 'active',
        },
        {
          id: 2,
          destination: 'لشبونة',
          checkIn: '2025-12-01',
          checkOut: '2025-12-08',
          budgetRange: [90, 130],
          confidence: 0.79,
          reasoning: [
            'مناسبة للرحالة الرقميين',
            'طقس معتدل في ديسمبر',
            'مجتمع رحالة نشط',
          ],
          aiScore: 88,
          status: 'active',
        },
      ]);
    }, 1000);
  }, []);

  // ===== مكونات فرعية =====
  // الصفحة الرئيسية
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      {/* الهيدر */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-12 h-12 text-blue-500" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">أمريكي</h1>
              <p className="text-gray-400 text-sm">مساعد السفر الذكي</p>
            </div>
          </div>

          {/* شريط الحالة */}
          <div className="flex items-center gap-4">
            <EmotionalIndicatorBadge state={emotionalState} />
            <PersonaBadge persona={userPersona} />
          </div>
        </div>

        {/* بطاقة المميزات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="الذكاء التنبؤي"
            description="أتوقع رحلتك القادمة قبل أن تفكر بها"
            color="from-blue-500 to-cyan-500"
            onClick={() => setCurrentView('predictions')}
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="الذكاء العاطفي"
            description="أتكيف مع مزاجك واحتياجاتك"
            color="from-pink-500 to-rose-500"
            active={emotionalState !== 'محايد'}
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="الإثبات الاجتماعي"
            description="توصيات من مسافرين مثلك"
            color="from-purple-500 to-indigo-500"
          />
        </div>

        {/* قسم التنبؤات */}
        {predictions.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                رحلات مقترحة لك
              </h2>
              <button
                onClick={() => setCurrentView('predictions')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                عرض الكل →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.slice(0, 2).map((pred, index) => (
                <PredictionCard
                  key={pred.id}
                  prediction={pred}
                  delay={index * 0.2}
                  onAccept={() => setCurrentView('automation')}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* زر البحث اليدوي */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => setCurrentView('automation')}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xl font-bold rounded-2xl shadow-2xl transition-all"
          >
            🔍 بحث يدوي عن فنادق
          </button>
        </motion.div>
      </motion.div>
    </div>
  );

  // صفحة التنبؤات الكاملة
  const PredictionsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentView('home')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← العودة للرئيسية
        </button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            رحلاتك المقترحة
          </h1>
          <p className="text-gray-400">بناءً على تحليل أنماطك وتفضيلاتك</p>
        </div>

        {/* إحصائيات التنبؤ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="دقة التنبؤات"
            value="87%"
            color="text-green-400"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="وفورات محتملة"
            value="$342"
            color="text-blue-400"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="تنبؤات نشطة"
            value={predictions.length}
            color="text-purple-400"
          />
        </div>

        {/* قائمة التنبؤات */}
        <div className="space-y-6">
          {predictions.map((pred, index) => (
            <PredictionCard
              key={pred.id}
              prediction={pred}
              delay={index * 0.1}
              expanded
              onAccept={() => setCurrentView('automation')}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ===== المكونات المساعدة =====
  const EmotionalIndicatorBadge = ({ state }: { state: EmotionalState }) => {
    const config: Record<
      EmotionalState,
      { emoji: string; color: string; text: string }
    > = {
      متحمس: {
        emoji: '🎉',
        color: 'from-yellow-500 to-orange-500',
        text: 'متحمس',
      },
      متوتر: { emoji: '😌', color: 'from-blue-500 to-cyan-500', text: 'متوتر' },
      مرتبك: {
        emoji: '🤝',
        color: 'from-purple-500 to-pink-500',
        text: 'مرتبك',
      },
      محايد: { emoji: '🤖', color: 'from-gray-500 to-gray-600', text: 'محايد' },
    };

    const current = config[state] || config['محايد'];

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`bg-gradient-to-r ${current.color} px-4 py-2 rounded-full flex items-center gap-2`}
      >
        <span className="text-2xl">{current.emoji}</span>
        <span className="text-white text-sm font-medium">{current.text}</span>
      </motion.div>
    );
  };

  const PersonaBadge = ({ persona }: { persona: Persona | null }) => {
    if (!persona) return null;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-full flex items-center gap-2"
      >
        <Users className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">{persona.type}</span>
        <span className="text-xs text-white/70">
          ({Math.round(persona.confidence * 100)}%)
        </span>
      </motion.div>
    );
  };

  const FeatureCard = ({
    icon,
    title,
    description,
    color,
    active,
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${color} p-6 rounded-3xl cursor-pointer relative overflow-hidden ${
        active ? 'ring-4 ring-white/50' : ''
      }`}
    >
      {active && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white"
        />
      )}

      <div className="text-white mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </motion.div>
  );

  const PredictionCard = ({
    prediction,
    delay,
    expanded,
    onAccept,
  }: {
    prediction: Prediction;
    delay: number;
    expanded?: boolean;
    onAccept: () => void;
  }) => (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-2 border-gray-700 hover:border-blue-500 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">
              {prediction.destination}
            </h3>
            {prediction.aiScore >= 90 && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                🔥 توصية قوية
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(prediction.checkIn).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(prediction.checkOut).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>
                ${prediction.budgetRange[0]}-${prediction.budgetRange[1]}/ليلة
              </span>
            </div>
          </div>
        </div>

        {/* AI Score */}
        <div className="text-center">
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90" width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#374151"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${
                  2 * Math.PI * 35 * (1 - prediction.aiScore / 100)
                }`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {prediction.aiScore}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">نقاط AI</p>
        </div>
      </div>

      {/* الأسباب */}
      <div className="bg-black/30 rounded-2xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          لماذا هذا الاقتراح مثالي لك؟
        </h4>
        <ul className="space-y-2">
          {prediction.reasoning.map((reason, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-400 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* شريط الثقة */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">مستوى الثقة</span>
          <span className="text-xs font-bold text-blue-400">
            {Math.round(prediction.confidence * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence * 100}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-4"
        >
          {/* إحصائيات من مسافرين مثلك */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              ماذا يقول مسافرون مثلك؟
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">94%</p>
                <p className="text-xs text-gray-400">معدل الرضا</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">127</p>
                <p className="text-xs text-gray-400">حجوزات مشابهة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.6</p>
                <p className="text-xs text-gray-400">تقييم متوسط</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* الأزرار */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAccept}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          ابحث الآن
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all"
        >
          📝 عدّل
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-all flex items-center justify-center"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={color}>{icon}</div>
      </div>
    </motion.div>
  );

  // ===== التنقل بين الصفحات =====
  return (
    <AnimatePresence mode="wait">
      {currentView === 'home' && <HomePage key="home" />}
      {currentView === 'predictions' && <PredictionsPage key="predictions" />}
      {currentView === 'automation' && (
        <div
          key="automation"
          className="min-h-screen bg-black flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Brain className="w-24 h-24 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-2">
              جاري تشغيل الأتمتة...
            </h2>
            <p className="text-gray-400">سأبدأ البحث عن أفضل الفنادق لك</p>
            <button
              onClick={() => setCurrentView('home')}
              className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              إلغاء
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
