# 🔧 AutomationTheater.tsx - Critical Fixes & Optimizations

## 🔴 Priority 1: Critical Fixes (MUST DO)

### Task 1.1: Fix Memory Leak in useEffect

**Location:** Line ~50-90 (useEffect for automation steps)

**Current Code (Memory Leak):**
```typescript
useEffect(() => {
  if (phase === 'running' && !isPaused) {
    const automationSteps = [...];
    
    let currentStep = 0;
    let currentProgress = 0;

    const runAutomation = () => {
      if (currentStep < automationSteps.length) {
        // ... logic
        setTimeout(runAutomation, step.duration); // ❌ No cleanup!
      }
    };

    runAutomation();
  }
}, [phase, isPaused]); // ❌ Missing dependencies
```

**Fixed Code:**
```typescript
useEffect(() => {
  if (phase !== 'running' || isPaused) return;

  let mounted = true;
  const timeouts: NodeJS.Timeout[] = [];
  let currentStep = 0;
  let currentProgress = 0;

  const automationSteps = [
    { action: 'فتح Booking.com...', duration: 2000 },
    { action: 'إدخال الوجهة: القاهرة', duration: 1500 },
    { action: 'تحديد التواريخ: 20-27 ديسمبر', duration: 1500 },
    { action: 'البحث عن الفنادق المتاحة...', duration: 3000 },
    { action: 'وجدت 234 فندق! جاري التصفية...', duration: 2000 },
    { action: 'تطبيق حد الميزانية: 150$ لليلة', duration: 2000 },
    { action: 'تحليل التقييمات والمراجعات...', duration: 4000 },
    { action: 'مقارنة وسائل الراحة...', duration: 3000 },
    { action: 'اكتشفت 3 فنادق رائعة! 🎉', duration: 2000 }
  ];

  const runAutomation = () => {
    if (!mounted || currentStep >= automationSteps.length) return;

    const step = automationSteps[currentStep];
    
    setCurrentAction(step.action);
    
    setActions(prev => [...prev, {
      id: Date.now() + currentStep,
      description: step.action,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }]);

    currentProgress += 100 / automationSteps.length;
    setProgress(Math.min(currentProgress, 100));

    // Simulate hotel discovery
    if (currentStep >= 6 && currentStep <= 8) {
      const hotelTimeout = setTimeout(() => {
        if (!mounted) return;
        
        setDiscoveredHotels(prev => {
          if (prev.length >= 3) return prev;
          
          return [...prev, {
            id: prev.length + 1,
            name: `فندق رائع ${prev.length + 1}`,
            rating: 4.5 + Math.random() * 0.5,
            price: 120 + Math.random() * 60,
            aiScore: 80 + Math.random() * 20
          }];
        });
      }, 1000);
      
      timeouts.push(hotelTimeout);
    }

    currentStep++;
    
    if (currentStep >= automationSteps.length) {
      const finalTimeout = setTimeout(() => {
        if (mounted) setPhase('results');
      }, 1000);
      timeouts.push(finalTimeout);
    } else {
      const nextTimeout = setTimeout(runAutomation, step.duration);
      timeouts.push(nextTimeout);
    }
  };

  runAutomation();

  // ✅ Cleanup function
  return () => {
    mounted = false;
    timeouts.forEach(clearTimeout);
  };
}, [phase, isPaused]); // ✅ Correct dependencies
```

**Action:** Replace the entire useEffect

---

### Task 1.2: Memoize Heavy Components

**Current Code (Re-renders on every state change):**
```typescript
const EmotionalIndicator = () => { ... }
const BrowserViewport = () => { ... }
const NarrationCard = () => { ... }
const ActionTimeline = () => { ... }
const HotelDiscoveryCards = () => { ... }
```

**Fixed Code:**
```typescript
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';

// ✅ Memoize EmotionalIndicator
const EmotionalIndicator = memo(({ emotionalState }: { emotionalState: string }) => {
  const emotionConfig = useMemo(() => ({
    'متحمس': { icon: '🎉', color: 'from-yellow-500 to-orange-500', message: 'أشعر بحماسك! دعني أجد لك أفضل الأماكن!' },
    'متوتر': { icon: '😌', color: 'from-blue-500 to-cyan-500', message: 'لا تقلق، سأتعامل مع كل شيء بسرعة' },
    'مرتبك': { icon: '🤝', color: 'from-purple-500 to-pink-500', message: 'دعني أرشدك خطوة بخطوة' },
    'محايد': { icon: '🤖', color: 'from-gray-500 to-gray-600', message: 'جاهز لمساعدتك' }
  }), []);

  const config = emotionConfig[emotionalState as keyof typeof emotionConfig] || emotionConfig['محايد'];

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
});

EmotionalIndicator.displayName = 'EmotionalIndicator';

// ✅ Memoize BrowserViewport
const BrowserViewport = memo(({ screenshot }: { screenshot: string }) => (
  <div className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl">
    {/* Browser bar */}
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

    {/* Content */}
    <div className="relative h-[500px] bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
      {screenshot ? (
        <motion.img
          key={screenshot}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={screenshot}
          alt="Browser screenshot"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-16 h-16 text-blue-500 mx-auto" />
          </motion.div>
          <p className="text-gray-400 text-lg">AI يحلل خياراتك...</p>
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
        </div>
      )}

      {/* Animated cursor */}
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
    </div>
  </div>
));

BrowserViewport.displayName = 'BrowserViewport';

// ✅ Memoize NarrationCard
const NarrationCard = memo(({ currentAction, progress }: { currentAction: string; progress: number }) => (
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

      {/* Progress bar */}
      <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">{Math.round(progress)}% مكتمل</p>
    </div>
  </motion.div>
));

NarrationCard.displayName = 'NarrationCard';

// ✅ Memoize ActionTimeline
const ActionTimeline = memo(({ actions }: { actions: Array<{ id: number; description: string; timestamp: string; status: string }> }) => (
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
));

ActionTimeline.displayName = 'ActionTimeline';

// ✅ Memoize HotelDiscoveryCards
const HotelDiscoveryCards = memo(({ hotels }: { hotels: Array<{ id: number; name: string; rating: number; price: number; aiScore: number }> }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute bottom-32 left-6 right-6"
  >
    <div className="flex gap-4 overflow-x-auto pb-4">
      <AnimatePresence>
        {hotels.map((hotel, index) => (
          <motion.div
            key={hotel.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.3, type: "spring" }}
            className="min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-bold">{hotel.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-300">{hotel.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full ${hotel.aiScore > 90 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <p className="text-xs font-bold">AI: {Math.round(hotel.aiScore)}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3 mb-3">
              <p className="text-2xl font-bold text-white">${Math.round(hotel.price)}</p>
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
));

HotelDiscoveryCards.displayName = 'HotelDiscoveryCards';
```

**Action:** Wrap all sub-components with `memo()` and add proper props

---

### Task 1.3: Add Error Boundary

**Create new file:** `frontend/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-gray-400 mb-6">
              نعتذر عن الإزعاج. يرجى تحديث الصفحة والمحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all"
            >
              تحديث الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/50 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Update AutomationTheater.tsx:**

```typescript
import ErrorBoundary from './ErrorBoundary';

// Wrap the entire component
export default function AutomationTheaterWrapper() {
  return (
    <ErrorBoundary>
      <AutomationTheater />
    </ErrorBoundary>
  );
}
```

**Action:** Create ErrorBoundary and wrap component

---

### Task 1.4: Add Accessibility (ARIA labels)

**Current Code (No accessibility):**
```typescript
<button onClick={() => setPhase('running')}>
  ابدأ البحث الذكي ✨
</button>

<button onClick={() => setIsPaused(!isPaused)}>
  {isPaused ? <Play /> : <Pause />}
</button>
```

**Fixed Code:**
```typescript
<button
  onClick={() => setPhase('running')}
  aria-label="ابدأ البحث الذكي عن الفنادق"
  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-2xl"
>
  ابدأ البحث الذكي ✨
</button>

<button
  onClick={() => setIsPaused(!isPaused)}
  aria-label={isPaused ? "استئناف العرض" : "إيقاف العرض مؤقتاً"}
  aria-pressed={isPaused}
  className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
>
  {isPaused ? <Play className="w-5 h-5" aria-hidden="true" /> : <Pause className="w-5 h-5" aria-hidden="true" />}
</button>

{/* Add screen reader announcements */}
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {currentAction}
</div>

<div className="sr-only" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  التقدم: {Math.round(progress)}%
</div>
```

**Action:** Add ARIA labels to all interactive elements

---

## 🟡 Priority 2: Performance Optimizations

### Task 2.1: Optimize Animation Performance

**Current Code (Heavy animations):**
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
>
  <Brain className="w-16 h-16 text-blue-500 mx-auto" />
</motion.div>
```

**Optimized Code:**
```typescript
// Use CSS animations for simple rotations
<div className="animate-spin-slow">
  <Brain className="w-16 h-16 text-blue-500 mx-auto" />
</div>

// Add to tailwind.config.js:
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      }
    }
  }
}

// For complex animations, use will-change
<motion.div
  style={{ willChange: 'transform' }}
  animate={{ x: [100, 200, 300, 200], y: [100, 150, 100, 50] }}
  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
>
  <MousePointer />
</motion.div>
```

**Action:** Replace heavy Framer Motion animations with CSS where possible

---

### Task 2.2: Add Loading States

**Add new state:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Add loading UI:**
```typescript
if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-white text-xl">جاري التحميل...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setPhase('intro');
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
```

**Action:** Add loading and error states

---

## 📝 Summary for Cursor:

**Fixes to Apply:**

1. ✅ **Memory Leak** - Fix useEffect cleanup
2. ✅ **Performance** - Memoize all sub-components
3. ✅ **Error Handling** - Add ErrorBoundary
4. ✅ **Accessibility** - Add ARIA labels
5. ✅ **Animations** - Optimize with CSS
6. ✅ **Loading States** - Add loading/error UI

**Files to Create/Modify:**

1. `frontend/src/components/ErrorBoundary.tsx` (new)
2. `frontend/src/components/AutomationTheater.tsx` (modify)
3. `tailwind.config.js` (add animations)

**Expected Results:**
- ✅ No memory leaks
- ✅ 60fps smooth animations
- ✅ Graceful error handling
- ✅ Screen reader compatible
- ✅ Better UX with loading states

**Testing Checklist:**
- [ ] Run for 5 minutes - check memory usage
- [ ] Test on slow device - check FPS
- [ ] Throw error intentionally - check ErrorBoundary
- [ ] Test with screen reader - check ARIA
- [ ] Test loading states

---

**Ready for Cursor to implement?** ✅
