# 🤖 نظام الأتمتة الذكية - مكونات واجهة المستخدم

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع مكونات React لواجهة الأتمتة الذكية مع Gemini 2.5 Pro Computer Use.

## 🎯 المكونات الرئيسية

### 1. **AutomationTheater** (المكون الرئيسي)

المسرح الكامل للأتمتة - يدير جميع الحالات والتفاعلات.

```tsx
import { AutomationTheater } from './components/automation';

<AutomationTheater
  tripData={{
    destination: 'القاهرة',
    checkIn: '2025-12-20',
    checkOut: '2025-12-27',
    travelers: 2,
    budget: 150,
  }}
  userId="user123"
  onClose={() => console.log('مغلق')}
/>;
```

**الميزات:**

- ✅ 3 واجهات: مقدمة، أتمتة جارية، نتائج
- ✅ الربط مع Backend عبر SSE
- ✅ كشف عاطفي تلقائي
- ✅ تتبع تحليلي كامل
- ✅ معالجة الأخطاء

---

### 2. **EmotionalIndicator**

مؤشر الذكاء العاطفي الذي يتكيف مع مزاج المستخدم.

```tsx
<EmotionalIndicator emotion="متحمس" />
```

**العواطف المدعومة:**

- `متحمس` - 🎉 (أصفر-برتقالي)
- `متوتر` - 😌 (أزرق-سماوي)
- `مرتبك` - 🤝 (بنفسجي-وردي)
- `محايد` - 🤖 (رمادي)

---

### 3. **BrowserViewport**

عرض المتصفح مع لقطات الشاشة الحية.

```tsx
<BrowserViewport screenshot="base64..." status="running" />
```

**الحالات:**

- `idle` - في الانتظار
- `running` - يعمل (مع مؤشر ماوس متحرك)
- `complete` - اكتمل
- `error` - خطأ

---

### 4. **ActionTimeline**

الجدول الزمني للإجراءات مع تحديثات حية.

```tsx
<ActionTimeline
  actions={[
    {
      id: 1,
      description: 'فتح Booking.com',
      timestamp: '2025-10-12T10:30:00Z',
      status: 'completed',
    },
  ]}
/>
```

---

### 5. **NarrationCard**

بطاقة الشرح مع شريط التقدم.

```tsx
<NarrationCard
  currentAction="جاري البحث عن الفنادق..."
  progress={60}
  estimatedTime={45}
/>
```

---

### 6. **HotelDiscoveryCards**

بطاقات الفنادق المكتشفة تظهر تدريجياً.

```tsx
<HotelDiscoveryCards
  hotels={discoveredHotels}
  onHotelClick={(hotel) => console.log(hotel)}
/>
```

---

### 7. **ErrorDisplay**

عرض الأخطاء بشكل جميل.

```tsx
<ErrorDisplay
  error="فقدنا الاتصال بالخادم"
  onRetry={() => retry()}
  onGoHome={() => goHome()}
/>
```

---

## 🎨 الأنماط والتصميم

### الألوان الرئيسية

```css
--bg-primary: من-أسود عبر-رمادي-900 إلى-أسود
--blue-gradient: من-أزرق-600 إلى-بنفسجي-600
--success: أخضر-500
--error: أحمر-500
```

### الرسوم المتحركة

- **Framer Motion** لجميع التحريكات
- مدة الانتقال: 0.3-0.5 ثانية
- نوع Spring للتأثيرات المرنة

---

## 🔌 الخدمات والـ Hooks

### useAutomationSSE

Hook للربط مع Backend عبر Server-Sent Events.

```tsx
const {
  phase,
  currentAction,
  progress,
  screenshot,
  actions,
  discoveredHotels,
  error,
  stop,
  reset,
} = useAutomationSSE(tripData, shouldStart);
```

### AutomationAPI

خدمة للاتصال بـ API.

```tsx
import { AutomationAPI } from '../../services/automationApi';

// التحقق من الحالة
const status = await AutomationAPI.checkStatus();

// بدء البحث
const eventSource = AutomationAPI.startHotelSearch(
  tripData,
  onProgress,
  onError
);
```

### Emotional Detection

خدمة الكشف العاطفي.

```tsx
import {
  detectUserEmotion,
  getEmotionalMessage,
  getEmotionalColor,
} from '../../services/emotionalDetection';

const emotion = await detectUserEmotion(messages);
const message = getEmotionalMessage(emotion.emotion);
const colors = getEmotionalColor(emotion.emotion);
```

---

## 📊 التحليلات (Analytics)

جميع الأحداث الرئيسية يتم تتبعها تلقائياً:

```tsx
import {
  trackAutomationStart,
  trackAutomationComplete,
  trackHotelClick,
} from '../../utils/analytics';

// يتم تتبعها تلقائياً:
// - بدء الأتمتة
// - إكمال الأتمتة
// - اكتشاف فندق
// - النقر على فندق
// - مشاركة النتائج
// - كشف العاطفة
```

---

## 🚀 الاستخدام السريع

### مثال كامل:

```tsx
import { AutomationTheater } from './components/automation';

function App() {
  return (
    <AutomationTheater
      tripData={{
        destination: 'دبي',
        checkIn: '2025-11-01',
        checkOut: '2025-11-07',
        travelers: 2,
        budget: 200,
      }}
      userId="user_123"
      onClose={() => {
        console.log('تم الإغلاق');
      }}
    />
  );
}
```

---

## 🔧 التخصيص

### تغيير الألوان

```tsx
// في tailwind.config.js
theme: {
  extend: {
    colors: {
      'amrikyy-blue': '#3b82f6',
      'amrikyy-purple': '#8b5cf6'
    }
  }
}
```

### تخصيص الرسوم المتحركة

```tsx
// في المكون
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
```

---

## 🐛 معالجة الأخطاء

جميع المكونات لديها معالجة أخطاء مدمجة:

```tsx
try {
  // كود الأتمتة
} catch (error) {
  // يتم عرض ErrorDisplay تلقائياً
  console.error(error);
}
```

---

## 📱 الاستجابة للجوال

جميع المكونات متجاوبة:

- **Desktop:** عرض كامل مع شريط جانبي
- **Tablet:** تخطيط مكثف
- **Mobile:** عرض عمودي مع بطاقات قابلة للتمرير

---

## 🎯 أفضل الممارسات

1. **استخدم TypeScript** - جميع المكونات مكتوبة بالكامل
2. **تتبع الأحداث** - استخدم دوال analytics
3. **معالجة الأخطاء** - دائماً لديك fallback
4. **الأداء** - استخدم React.memo للمكونات الثقيلة
5. **Accessibility** - أضف aria-labels للعناصر التفاعلية

---

## 🔮 التطويرات المستقبلية

- [ ] دعم الصوت (Text-to-Speech)
- [ ] وضع الظلام/النور
- [ ] مشاركة النتائج على وسائل التواصل
- [ ] حفظ البحث وإعادة استخدامه
- [ ] مقارنة متقدمة بين الفنادق
- [ ] دمج مع Telegram Mini App

---

## 📞 الدعم

للمساعدة أو الأسئلة:

- GitHub Issues
- Email: support@amrikyy.com

---

**تم إنشاؤه بـ ❤️ باستخدام React + TypeScript + Framer Motion**
