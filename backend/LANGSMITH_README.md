# 🚀 LangSmith Integration for Maya Travel Agent

## نظرة عامة

تم دمج LangSmith في نظام Maya Travel Agent لتوفير مراقبة وتصحيح أخطاء متقدم للوكلاء.

## الميزات

- تتبع مرئي لتدفق العمليات
- تحليل الـ prompts والاستجابات
- مراقبة الأداء والتكاليف
- تصحيح الأخطاء المتقدم
- **جديد**: تخفيض حجم التتبع بنسبة تصل إلى 90% عبر Event Sampling
- **جديد**: تجميع البيانات (Aggregation) للأحداث عالية التكرار
- **جديد**: حماية البيانات الحساسة عبر PII Redaction

## الإعداد

### 1. تثبيت التبعيات

```bash
npm install langsmith
```

### 2. إعداد متغيرات البيئة

```bash
# LangSmith API Key
LANGSMITH_API_KEY=your_api_key_here

# Sampling Configuration (اختياري)
LANGSMITH_SAMPLING_ENABLED=true
LANGSMITH_CHUNK_SAMPLE_RATE=10
LANGSMITH_TOKEN_SAMPLE_RATE=10
LANGSMITH_PROGRESS_SAMPLE_RATE=5

# PII Redaction (اختياري)
LANGSMITH_REDACT_PII=true
```

### 3. تشغيل المراقبة

```bash
./start-langsmith-monitoring.sh
```

## الاستخدام

### استخدام AgentLangSmith مع Sampling

```javascript
const AgentLangSmith = require('./utils/AgentLangSmith');

const langsmith = new AgentLangSmith('MyAgent');

// إنشاء span للتتبع
const span = langsmith.startSpan({
  name: 'api.stream',
  operation: 'stream',
  model: 'gemini-2.0-flash-exp',
  params: { prompt: 'Your prompt' },
});

// إضافة أحداث (سيتم sampling تلقائياً للأحداث عالية التكرار)
for (let i = 0; i < 100; i++) {
  span.addEvent('chunk', {
    chunkIndex: i,
    tokenCount: 25,
  });
}

// الحصول على البيانات المجمعة
const aggregatedData = span.getAggregatedData();
console.log('Chunks:', aggregatedData.chunk); // { totalCount: 100, sampledCount: 10, ... }

// إنهاء span
span.finish({
  usage: {
    promptTokens: 100,
    completionTokens: 2500,
    totalTokens: 2600,
  },
});
```

### استخدام streamService للبث مع تتبع شامل

```javascript
const streamService = require('./services/streamService');

// البث مع تتبع LangSmith التلقائي
await streamService.streamWithSSE({
  req,
  res,
  prompt: userPrompt,
  model: geminiModel,
  agentName: 'TravelAgent',
  meta: { userId: req.user?.id },
});

// يتم تلقائياً:
// - إنشاء span في LangSmith
// - sampling للـ chunk events
// - تجميع عدد الـ tokens
// - تحديث الـ metrics
// - معالجة انقطاع الاتصال
```

### حماية البيانات الحساسة (PII Redaction)

```javascript
// إضافة حدث مع حذف البيانات الحساسة
span.addRedactedEvent('user_input', {
  text: 'My email is john@example.com and phone is 555-123-4567',
  userId: '12345',
});

// سيتم تسجيل:
// { text: 'My email is [EMAIL_REDACTED] and phone is [PHONE_REDACTED]', userId: '12345' }
```

### تتبع الوكيل (الطريقة القديمة - لا تزال مدعومة)

```javascript
import { traceable } from "langsmith";

@traceable({
  name: "agent_name",
  tags: ["agent", "category"]
})
async function agentFunction(input) {
  // منطق الوكيل
  return result;
}
```

### مراقبة الأداء

```javascript
import LangSmithMonitor from './src/monitoring/LangSmithMonitor.js';

const monitor = new LangSmithMonitor();
const stats = await monitor.getPerformanceStats();
```

### الحصول على إحصائيات Sampling

```javascript
const stats = langsmith.getStats();

console.log('Sampling Statistics:');
console.log('  Total Events:', stats.sampling.totalEvents);
console.log('  Sampled Events:', stats.sampling.sampledEvents);
console.log('  Efficiency:', stats.sampling.efficiency); // نسبة الأحداث التي تم تجميعها
```

## الفوائد الرئيسية

### تخفيض التكاليف
- **بدون sampling**: 1000 chunk = 1000 event في LangSmith
- **مع sampling (rate=10)**: 1000 chunk = 100 event فقط (توفير 90%)
- **البيانات المجمعة**: لا تزال تتتبع جميع الـ 1000 chunk

### الحفاظ على الرؤية
- يتم حفظ البيانات الحرجة (إجمالي tokens، عدد chunks، معلومات الأخطاء)
- يتم تجميع البيانات في metadata الـ span

### الأمان
- حذف تلقائي للبيانات الحساسة (emails، أرقام هواتف، بطاقات ائتمان، إلخ)
- تقليل مخاطر الامتثال

## الملفات

### الملفات الرئيسية
- `src/utils/AgentLangSmith.js`: **تم تحديثه** - الآن مع Sampling & Aggregation
- `src/services/streamService.js`: **جديد** - خدمة البث مع تكامل LangSmith
- `src/controllers/streamController.js`: **تم تحديثه** - يستخدم streamService
- `docs/LANGSMITH_SAMPLING_GUIDE.md`: **جديد** - دليل شامل للاستخدام

### الملفات الموجودة
- `src/config/langsmith-config.js`: تكوين LangSmith
- `src/monitoring/LangSmithMonitor.js`: مراقب الأداء
- `src/analytics/LangSmithAnalytics.js`: تحليلات البيانات
- `src/optimization/PromptOptimizer.js`: تحسين الـ Prompts
- `src/agents/LangSmithIntegration.js`: تكامل الوكلاء

## الاختبارات

### اختبار التطبيق

```bash
# اختبار Sampling & Aggregation
node tests/test-langsmith-sampling.js
```

النتيجة المتوقعة:
```
✓ All tests passed successfully!

Summary:
  - Created 2 spans
  - Logged 203 events
  - Sampled 25 events (saved 178 events)
  - Sampling efficiency: 87.68%
```

## التكوين المتقدم

### تعطيل Sampling لعملية محددة

```javascript
// تعطيل sampling مؤقتاً
langsmith.config.sampling.enabled = false;

const span = langsmith.startSpan({ name: 'critical_operation' });
// سيتم تسجيل جميع الأحداث

span.finish();

// إعادة تفعيل sampling
langsmith.config.sampling.enabled = true;
```

### تخصيص معدلات Sampling

```javascript
// تغيير معدلات sampling لوكيل معين
langsmith.config.sampling.chunkSampleRate = 20; // sample كل 20 chunk
langsmith.config.sampling.tokenSampleRate = 15;
langsmith.config.sampling.progressSampleRate = 10;
```

## استكشاف الأخطاء

### الأحداث لا يتم sampling
تحقق من أن sampling مفعل:
```javascript
console.log(langsmith.config.sampling.enabled); // يجب أن يكون true
```

### ارتفاع استخدام الذاكرة
- أنهِ spans بسرعة بعد اكتمال العمليات
- قلل قيمة `maxTraces`
- زد معدلات sampling

## الدعم والتوثيق

للحصول على الدعم، يرجى مراجعة:

- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [دليل Sampling الشامل](./docs/LANGSMITH_SAMPLING_GUIDE.md)
- [Issue #107 - Refactor AgentLangSmith](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues/107)

## التحديثات الأخيرة (Issue #107)

### ✨ الميزات الجديدة
- ✅ Event Sampling للأحداث عالية التكرار (chunk, token, progress)
- ✅ Event Aggregation لتتبع إجمالي tokens بدون logging كل حدث
- ✅ PII Redaction لحماية البيانات الحساسة
- ✅ streamService للبث مع تكامل شامل
- ✅ دعم client disconnect cleanup
- ✅ تكامل مع metricsService

### 📊 الأداء
- تخفيض حجم events بنسبة 87-90%
- الحفاظ على دقة تتبع 100%
- تخفيض تكاليف LangSmith API
- تحسين الأداء للتطبيقات ذات الحمل العالي

