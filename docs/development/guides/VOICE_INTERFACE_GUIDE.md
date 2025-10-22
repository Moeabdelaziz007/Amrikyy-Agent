# 🎤 دليل الواجهة الصوتية - Amrikyy Travel Agent

**التاريخ:** 16 أكتوبر 2025  
**الحالة:** ✅ المرحلة الأولى مكتملة (Web Speech API)  
**المرحلة التالية:** ⏳ الترقية إلى Google Cloud Speech API

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المعمارية](#المعمارية)
3. [المكونات](#المكونات)
4. [الاستخدام](#الاستخدام)
5. [الميزات](#الميزات)
6. [التوافق](#التوافق)
7. [خطة المرحلتين](#خطة-المرحلتين)

---

## نظرة عامة

### ما تم بناؤه

نظام واجهة صوتية كامل يتيح للمستخدمين:
- 🎤 **التحدث** مع Amrikyy بشكل طبيعي
- 🔊 **الاستماع** إلى ردود Amrikyy الصوتية
- 🌍 **دعم اللغة العربية** (مصري وسعودي) والإنجليزية
- ⚙️ **تخصيص الصوت** (السرعة، النبرة، مستوى الصوت)
- 💾 **حفظ التفضيلات** تلقائياً

### التقنيات المستخدمة

**المرحلة الأولى (الحالية):**
- Web Speech API (مدمجة في المتصفح)
- React + TypeScript
- Custom Hooks
- LocalStorage للتفضيلات

**المرحلة الثانية (المستقبل):**
- Google Cloud Speech-to-Text API
- Google Cloud Text-to-Speech API
- WebSocket للتواصل الفوري
- دعم تطبيقات الموبايل

---

## المعمارية

### تدفق البيانات

```
المستخدم يتحدث
       ↓
Web Speech API (Speech Recognition)
       ↓
تحويل الصوت إلى نص
       ↓
إرسال إلى Backend (/api/ai/chat)
       ↓
AIX Manager يعالج الطلب
       ↓
الرد من AI
       ↓
Web Speech API (Speech Synthesis)
       ↓
تشغيل الرد صوتياً
```

### البنية المعمارية

```
frontend/src/
├── components/
│   ├── VoiceControl.tsx       # المكون الرئيسي
│   ├── VoiceSettings.tsx      # إعدادات الصوت
│   └── VoiceControl.css       # التنسيقات
├── hooks/
│   └── useVoiceControl.ts     # Hook مخصص
└── types/
    └── voice.d.ts             # تعريفات TypeScript
```

---

## المكونات

### 1. VoiceControl Component

**الملف:** `frontend/src/components/VoiceControl.tsx`

**المسؤوليات:**
- إدارة التعرف على الصوت (Speech-to-Text)
- إدارة تشغيل الصوت (Text-to-Speech)
- التواصل مع Backend
- عرض الواجهة الصوتية

**الخصائص (Props):**
```typescript
interface VoiceControlProps {
  onTranscript?: (text: string) => void;    // عند تحويل الصوت لنص
  onResponse?: (text: string) => void;      // عند استلام رد AI
  language?: 'ar-EG' | 'ar-SA' | 'en-US';  // اللغة
  autoSpeak?: boolean;                      // تشغيل تلقائي
  className?: string;                       // CSS classes
}
```

**الاستخدام:**
```tsx
import VoiceControl from './components/VoiceControl';

function App() {
  return (
    <VoiceControl
      language="ar-EG"
      autoSpeak={true}
      onTranscript={(text) => console.log('User said:', text)}
      onResponse={(text) => console.log('AI replied:', text)}
    />
  );
}
```

---

### 2. VoiceSettings Component

**الملف:** `frontend/src/components/VoiceSettings.tsx`

**المسؤوليات:**
- إعدادات اللغة
- اختيار الصوت
- التحكم في السرعة والنبرة
- حفظ التفضيلات

**الخصائص (Props):**
```typescript
interface VoiceSettingsProps {
  preferences: VoicePreferences;
  onChange: (prefs: VoicePreferences) => void;
  className?: string;
}

interface VoicePreferences {
  language: 'ar-EG' | 'ar-SA' | 'en-US';
  voiceName?: string;
  rate: number;      // 0.5 - 2.0
  pitch: number;     // 0.5 - 2.0
  volume: number;    // 0.0 - 1.0
  autoSpeak: boolean;
}
```

**الاستخدام:**
```tsx
import VoiceSettings from './components/VoiceSettings';

function App() {
  const [prefs, setPrefs] = useState<VoicePreferences>({
    language: 'ar-EG',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoSpeak: true
  });

  return (
    <VoiceSettings
      preferences={prefs}
      onChange={setPrefs}
    />
  );
}
```

---

### 3. useVoiceControl Hook

**الملف:** `frontend/src/hooks/useVoiceControl.ts`

**المسؤوليات:**
- إدارة حالة الصوت
- التواصل مع APIs
- حفظ التفضيلات في LocalStorage
- معالجة الأخطاء

**الاستخدام:**
```tsx
import { useVoiceControl } from './hooks/useVoiceControl';

function MyComponent() {
  const {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    preferences,
    updatePreferences
  } = useVoiceControl({
    initialPreferences: { language: 'ar-EG' },
    onTranscript: (text) => console.log(text),
    onResponse: (text) => console.log(text)
  });

  return (
    <div>
      <button onClick={startListening}>
        {isListening ? 'جاري الاستماع...' : 'ابدأ التحدث'}
      </button>
      {transcript && <p>أنت: {transcript}</p>}
      {error && <p>خطأ: {error}</p>}
    </div>
  );
}
```

---

## الاستخدام

### التكامل الأساسي

**الخطوة 1: استيراد المكونات**
```tsx
import VoiceControl from './components/VoiceControl';
import './components/VoiceControl.css';
```

**الخطوة 2: إضافة المكون**
```tsx
function App() {
  return (
    <div className="app">
      <VoiceControl
        language="ar-EG"
        autoSpeak={true}
      />
    </div>
  );
}
```

**الخطوة 3: تشغيل التطبيق**
```bash
cd frontend
npm start
```

---

### التكامل المتقدم

**مع إدارة الحالة:**
```tsx
import { useState } from 'react';
import { useVoiceControl } from './hooks/useVoiceControl';
import VoiceSettings from './components/VoiceSettings';

function AdvancedVoiceApp() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'ai';
    text: string;
  }>>([]);

  const {
    isListening,
    isSpeaking,
    transcript,
    preferences,
    updatePreferences,
    startListening,
    speak
  } = useVoiceControl({
    onTranscript: (text) => {
      setMessages(prev => [...prev, { role: 'user', text }]);
    },
    onResponse: (text) => {
      setMessages(prev => [...prev, { role: 'ai', text }]);
    }
  });

  return (
    <div>
      {/* إعدادات الصوت */}
      <VoiceSettings
        preferences={preferences}
        onChange={updatePreferences}
      />

      {/* سجل المحادثات */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* أزرار التحكم */}
      <button onClick={startListening} disabled={isListening}>
        {isListening ? '🎤 جاري الاستماع...' : '🎤 ابدأ التحدث'}
      </button>
    </div>
  );
}
```

---

## الميزات

### ✅ المميزات المتوفرة

#### 1. التعرف على الصوت (Speech-to-Text)
- ✅ تحويل الكلام إلى نص فوري
- ✅ دعم النتائج المؤقتة (Interim Results)
- ✅ دقة جيدة للغة العربية
- ✅ معالجة الأخطاء الشاملة

#### 2. تشغيل الصوت (Text-to-Speech)
- ✅ تحويل النص إلى كلام طبيعي
- ✅ اختيار الصوت (ذكر/أنثى)
- ✅ التحكم في السرعة (0.5x - 2x)
- ✅ التحكم في النبرة (0.5 - 2.0)
- ✅ التحكم في مستوى الصوت (0% - 100%)

#### 3. دعم اللغات
- ✅ العربية (مصر) - ar-EG
- ✅ العربية (السعودية) - ar-SA
- ✅ الإنجليزية (أمريكا) - en-US

#### 4. التخصيص
- ✅ حفظ التفضيلات في LocalStorage
- ✅ اختبار الصوت قبل الاستخدام
- ✅ إعادة تعيين الإعدادات
- ✅ تشغيل تلقائي للردود

#### 5. تجربة المستخدم
- ✅ واجهة سهلة الاستخدام
- ✅ مؤشرات بصرية (جاري الاستماع/التشغيل)
- ✅ رسائل خطأ واضحة بالعربية
- ✅ دعم الوضع الداكن
- ✅ تصميم متجاوب (Responsive)

---

## التوافق

### المتصفحات المدعومة

| المتصفح | Speech-to-Text | Text-to-Speech | الحالة |
|---------|----------------|----------------|--------|
| **Chrome** | ✅ ممتاز | ✅ ممتاز | ✅ موصى به |
| **Edge** | ✅ ممتاز | ✅ ممتاز | ✅ موصى به |
| **Safari** | ⚠️ محدود | ✅ جيد | ⚠️ جزئي |
| **Firefox** | ❌ غير مدعوم | ✅ جيد | ❌ غير مدعوم |
| **Opera** | ✅ جيد | ✅ جيد | ✅ مدعوم |

### المنصات المدعومة

| المنصة | الحالة | ملاحظات |
|--------|--------|---------|
| **Windows** | ✅ مدعوم | Chrome/Edge موصى به |
| **macOS** | ✅ مدعوم | Safari محدود |
| **Linux** | ✅ مدعوم | Chrome موصى به |
| **Android** | ✅ مدعوم | Chrome موصى به |
| **iOS** | ⚠️ محدود | Safari فقط |

### متطلبات النظام

- ✅ متصفح حديث (Chrome 25+, Edge 79+)
- ✅ ميكروفون متصل
- ✅ إذن الوصول للميكروفون
- ✅ اتصال إنترنت (للتعرف على الصوت)

---

## خطة المرحلتين

### 📍 المرحلة الأولى: Web Speech API (الحالية)

**الحالة:** ✅ مكتملة

**المميزات:**
- ✅ مجانية 100%
- ✅ لا تحتاج إعدادات خلفية
- ✅ سريعة التنفيذ
- ✅ جيدة للنموذج الأولي (MVP)

**القيود:**
- ⚠️ تعمل فقط في المتصفح
- ⚠️ دقة متوسطة للعربية
- ⚠️ محدودة في بعض المتصفحات
- ⚠️ تعتمد على اتصال الإنترنت

**الملفات المنشأة:**
```
✅ frontend/src/components/VoiceControl.tsx
✅ frontend/src/components/VoiceSettings.tsx
✅ frontend/src/components/VoiceControl.css
✅ frontend/src/hooks/useVoiceControl.ts
✅ VOICE_INTERFACE_GUIDE.md
```

---

### 🚀 المرحلة الثانية: Google Cloud Speech API (المستقبل)

**الحالة:** ⏳ مخطط لها

**المميزات:**
- 🎯 دقة عالية جداً (95%+)
- 🎯 دعم واسع للهجات العربية
- 🎯 يعمل في أي مكان (ويب، موبايل، خادم)
- 🎯 ميزات متقدمة (علامات ترقيم، تحديد متحدثين)

**التكلفة:**
- 💰 الطبقة المجانية: 60 دقيقة/شهر
- 💰 بعدها: $0.006 لكل 15 ثانية

**خطة التنفيذ:**

**الخطوة 1: إعداد Google Cloud**
```bash
# 1. إنشاء مشروع في Google Cloud Console
# 2. تفعيل Speech-to-Text API
# 3. تفعيل Text-to-Speech API
# 4. إنشاء Service Account
# 5. تنزيل مفتاح JSON
```

**الخطوة 2: Backend Integration**
```javascript
// backend/services/GoogleSpeechService.js
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');

class GoogleSpeechService {
  constructor() {
    this.speechClient = new speech.SpeechClient();
    this.ttsClient = new textToSpeech.TextToSpeechClient();
  }

  async transcribeAudio(audioBuffer) {
    const audio = {
      content: audioBuffer.toString('base64')
    };

    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'ar-EG'
    };

    const [response] = await this.speechClient.recognize({
      audio,
      config
    });

    return response.results[0].alternatives[0].transcript;
  }

  async synthesizeSpeech(text, languageCode = 'ar-EG') {
    const request = {
      input: { text },
      voice: {
        languageCode,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };

    const [response] = await this.ttsClient.synthesizeSpeech(request);
    return response.audioContent;
  }
}
```

**الخطوة 3: Frontend Update**
```typescript
// استبدال Web Speech API بـ Google Cloud
const sendAudioToBackend = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await axios.post('/api/speech/transcribe', formData);
  return response.data.transcript;
};
```

**الخطوة 4: WebSocket للتواصل الفوري**
```typescript
// Real-time streaming
const ws = new WebSocket('ws://localhost:5000/speech');

ws.onopen = () => {
  // إرسال الصوت بشكل مباشر
  mediaRecorder.ondataavailable = (event) => {
    ws.send(event.data);
  };
};

ws.onmessage = (event) => {
  const { transcript, isFinal } = JSON.parse(event.data);
  // عرض النتائج الفورية
};
```

---

## الاختبار

### اختبار يدوي

**1. اختبار التعرف على الصوت:**
```
✅ افتح التطبيق في Chrome
✅ اضغط على زر الميكروفون
✅ امنح إذن الوصول للميكروفون
✅ قل: "أريد السفر إلى باريس"
✅ تحقق من ظهور النص
```

**2. اختبار تشغيل الصوت:**
```
✅ افتح إعدادات الصوت
✅ اضغط على "اختبار الصوت"
✅ تحقق من سماع الصوت
✅ جرب تغيير السرعة والنبرة
```

**3. اختبار اللغات:**
```
✅ غير اللغة إلى "العربية (مصر)"
✅ تحدث بالعربية المصرية
✅ غير إلى "العربية (السعودية)"
✅ تحدث بالعربية السعودية
✅ غير إلى "English"
✅ تحدث بالإنجليزية
```

---

## استكشاف الأخطاء

### المشكلة: "المتصفح لا يدعم التعرف على الصوت"

**الحل:**
1. استخدم Chrome أو Edge
2. تأكد من تحديث المتصفح
3. تحقق من دعم Web Speech API

### المشكلة: "تم رفض إذن الميكروفون"

**الحل:**
1. افتح إعدادات المتصفح
2. ابحث عن "الأذونات" أو "Permissions"
3. امنح إذن الميكروفون للموقع
4. أعد تحميل الصفحة

### المشكلة: "لا يتم اكتشاف الصوت"

**الحل:**
1. تحقق من توصيل الميكروفون
2. اختبر الميكروفون في تطبيق آخر
3. تحقق من مستوى الصوت
4. تأكد من عدم كتم الميكروفون

### المشكلة: "الصوت لا يعمل"

**الحل:**
1. تحقق من مستوى صوت النظام
2. تحقق من مستوى الصوت في الإعدادات
3. جرب صوتاً مختلفاً
4. أعد تشغيل المتصفح

---

## الخطوات التالية

### قريباً (هذا الأسبوع)
- [ ] اختبار شامل للواجهة الصوتية
- [ ] إضافة المكون إلى الصفحة الرئيسية
- [ ] اختبار مع مستخدمين حقيقيين
- [ ] جمع الملاحظات

### قريباً (الأسبوعين القادمين)
- [ ] تحسين دقة التعرف على اللهجات
- [ ] إضافة المزيد من الأصوات
- [ ] تحسين معالجة الأخطاء
- [ ] إضافة analytics للاستخدام

### المستقبل (الشهر القادم)
- [ ] الترقية إلى Google Cloud Speech API
- [ ] دعم تطبيقات الموبايل
- [ ] WebSocket للتواصل الفوري
- [ ] دعم المحادثات الطويلة

---

## الموارد

### التوثيق
- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)

### أمثلة
- [VoiceControl Component](frontend/src/components/VoiceControl.tsx)
- [useVoiceControl Hook](frontend/src/hooks/useVoiceControl.ts)
- [VoiceSettings Component](frontend/src/components/VoiceSettings.tsx)

---

**تم البناء بـ ❤️ من فريق Amrikyy**

**التاريخ:** 16 أكتوبر 2025  
**الإصدار:** 1.0.0 (المرحلة الأولى)  
**الحالة:** ✅ جاهز للاستخدام
