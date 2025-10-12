# 🚀 دليل إعداد نظام الأتمتة

## 📋 المتطلبات الأساسية

### 1. **Node.js & npm**

```bash
node --version  # يجب أن يكون v18+ أو أحدث
npm --version   # يجب أن يكون v9+ أو أحدث
```

### 2. **المكتبات المطلوبة**

```bash
# في مجلد Frontend
cd /Users/Shared/maya-travel-agent
npm install framer-motion lucide-react

# في مجلد Backend
cd backend
npm install @google/generative-ai playwright dotenv
npx playwright install chromium
```

---

## 🔑 متغيرات البيئة

### Frontend (`.env`)

```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENABLE_EMOTIONAL_DETECTION=true
VITE_ENABLE_ANALYTICS=true
VITE_GA_MEASUREMENT_ID=your_google_analytics_id
```

### Backend (`backend/.env`)

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
Z_AI_API_KEY=your_zai_api_key
AUTOMATION_SCREENSHOT_QUALITY=80
AUTOMATION_TIMEOUT=60000
AUTOMATION_HEADLESS=true
REQUIRE_USER_CONFIRMATION=true
MAX_AUTOMATION_DURATION=300000
```

---

## 📁 هيكل الملفات

```
maya-travel-agent/
├── src/
│   ├── components/
│   │   └── automation/
│   │       ├── AutomationTheater.tsx    # المكون الرئيسي
│   │       ├── EmotionalIndicator.tsx   # مؤشر العاطفة
│   │       ├── BrowserViewport.tsx      # عرض المتصفح
│   │       ├── ActionTimeline.tsx       # الجدول الزمني
│   │       ├── NarrationCard.tsx        # بطاقة الشرح
│   │       ├── HotelDiscoveryCards.tsx  # بطاقات الفنادق
│   │       ├── ErrorDisplay.tsx         # عرض الأخطاء
│   │       ├── automation.css           # الأنماط المخصصة
│   │       ├── index.ts                 # ملف التصدير
│   │       ├── Example.tsx              # أمثلة الاستخدام
│   │       └── README.md                # التوثيق
│   ├── hooks/
│   │   └── useAutomationSSE.ts          # Hook للربط مع Backend
│   ├── services/
│   │   ├── automationApi.ts             # خدمة API
│   │   └── emotionalDetection.ts        # خدمة الكشف العاطفي
│   ├── utils/
│   │   └── analytics.ts                 # خدمة التحليلات
│   └── types/
│       └── automation.ts                # أنواع TypeScript
├── backend/
│   ├── src/
│   │   └── ai/
│   │       ├── geminiComputerUse.js     # عميل Gemini
│   │       ├── browserManager.js        # إدارة المتصفح
│   │       └── automationOrchestrator.js # المنسق الرئيسي
│   └── routes/
│       └── automation.js                # مسارات API
└── AUTOMATION_SETUP.md                  # هذا الملف
```

---

## 🎯 خطوات الإعداد

### الخطوة 1: الحصول على Gemini API Key

1. اذهب إلى: https://ai.google.dev
2. سجل دخول بحساب Google
3. اذهب إلى "Get API Key"
4. انسخ المفتاح وضعه في `backend/.env`:

```bash
GOOGLE_API_KEY=AIzaSy...your_key_here
```

### الخطوة 2: تهيئة قاعدة البيانات

```sql
-- قم بتشغيل هذا على Supabase

-- جدول الحالات العاطفية
CREATE TABLE IF NOT EXISTS emotional_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  emotion TEXT NOT NULL,
  confidence DECIMAL(3,2),
  detected_at TIMESTAMP DEFAULT NOW()
);

-- جدول سجلات الأتمتة
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  trip_data JSONB,
  status TEXT,
  duration INTEGER,
  hotels_found INTEGER,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX idx_emotional_user ON emotional_states(user_id);
CREATE INDEX idx_automation_user ON automation_logs(user_id);
CREATE INDEX idx_automation_status ON automation_logs(status);
```

### الخطوة 3: تشغيل Backend

```bash
cd backend
npm install
npm run dev
```

يجب أن ترى:

```
✅ Backend running on http://localhost:5000
✅ Gemini Computer Use initialized
✅ Database connected
```

### الخطوة 4: تشغيل Frontend

```bash
cd /Users/Shared/maya-travel-agent
npm install
npm run dev
```

يجب أن ترى:

```
➜ Local:   http://localhost:3000/
➜ Network: http://192.168.x.x:3000/
```

### الخطوة 5: اختبار الأتمتة

1. افتح المتصفح على `http://localhost:3000`
2. اذهب إلى صفحة الأتمتة
3. اضغط "ابدأ البحث الذكي"
4. شاهد السحر يحدث! ✨

---

## 🧪 الاختبار

### اختبار Backend فقط

```bash
cd backend
node tests/automation.test.js
```

### اختبار الاتصال بـ SSE

```bash
curl -N http://localhost:5000/api/automation/search-hotels?destination=Cairo&checkIn=2025-12-20&checkOut=2025-12-27&travelers=2
```

### اختبار الكشف العاطفي

```bash
curl -X POST http://localhost:5000/api/ai/detect-emotion \
  -H "Content-Type: application/json" \
  -d '{"messages": ["رائع جداً!", "متحمس لهذه الرحلة!"]}'
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: "Cannot connect to Backend"

**الحل:**

```bash
# تأكد من تشغيل Backend
cd backend && npm run dev

# تأكد من أن المنفذ 5000 غير مستخدم
lsof -i :5000
```

### المشكلة 2: "Gemini API Error"

**الحل:**

```bash
# تحقق من صحة API Key
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY

# تأكد من تفعيل Gemini API في Google Cloud Console
```

### المشكلة 3: "Browser fails to launch"

**الحل:**

```bash
# إعادة تثبيت Playwright
cd backend
npx playwright install --force chromium

# على macOS: قد تحتاج لمنح أذونات
xattr -cr node_modules/playwright
```

### المشكلة 4: "TypeScript errors"

**الحل:**

```bash
# تحديث الأنواع
npm install --save-dev @types/react @types/node

# إعادة تشغيل TypeScript server في VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### المشكلة 5: "SSE connection drops"

**الحل:**

```bash
# زيادة timeout في Backend
# في automation.js:
res.setTimeout(600000); // 10 دقائق
```

---

## 📊 المراقبة والتحليلات

### تفعيل Google Analytics

1. أنشئ حساب GA4
2. احصل على Measurement ID
3. أضفه إلى `.env`:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### تفعيل Sentry (للأخطاء)

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// في src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your_sentry_dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## 🚀 النشر إلى الإنتاج

### Frontend (Vercel)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر
cd /Users/Shared/maya-travel-agent
vercel --prod
```

### Backend (Railway)

```bash
# إنشاء railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}

# رفع على Railway
railway login
railway init
railway up
```

### متغيرات البيئة على الإنتاج

**Vercel:**

- Settings → Environment Variables
- أضف جميع المتغيرات من `.env`

**Railway:**

- Variables tab
- أضف `GOOGLE_API_KEY` و `PORT=5000`

---

## 📈 تحسينات الأداء

### 1. Caching الاستجابات

```typescript
// في automationApi.ts
const cache = new Map();

export async function getCachedHotels(destination: string) {
  const key = `hotels_${destination}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  // ... fetch data
  cache.set(key, data);
  return data;
}
```

### 2. Lazy Loading للمكونات

```typescript
// في App.tsx
const AutomationTheater = lazy(
  () => import('./components/automation/AutomationTheater')
);

<Suspense fallback={<Loading />}>
  <AutomationTheater />
</Suspense>;
```

### 3. تحسين الصور

```typescript
// ضغط screenshots قبل الإرسال
import imageCompression from 'browser-image-compression';

const compressedImage = await imageCompression(file, {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
});
```

---

## 🔐 الأمان

### 1. التحقق من المستخدم

```typescript
// في Backend
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify JWT
  next();
};

router.post('/search-hotels', verifyUser, handler);
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const automationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 طلبات كحد أقصى
});

router.post('/search-hotels', automationLimiter, handler);
```

### 3. إخفاء API Keys

**لا تقم أبداً بـ:**

- كتابة API keys في الكود
- رفع .env إلى Git
- عرض keys في Frontend

---

## 📞 الدعم

- **GitHub Issues**: لإبلاغ الأخطاء
- **Documentation**: راجع `/src/components/automation/README.md`
- **Examples**: انظر `/src/components/automation/Example.tsx`

---

## 🎉 تم!

الآن لديك نظام أتمتة كامل يعمل! 🚀

**الخطوات التالية:**

1. ✅ جرب البحث عن فندق
2. ✅ راقب Analytics Dashboard
3. ✅ خصص التصميم حسب علامتك التجارية
4. ✅ أضف المزيد من الميزات

**Happy Coding! 💻✨**
