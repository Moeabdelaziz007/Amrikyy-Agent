# 🚀 LangSmith Integration for Maya Travel Agent

## نظرة عامة

تم دمج LangSmith في نظام Maya Travel Agent لتوفير مراقبة وتصحيح أخطاء متقدم للوكلاء.

## الميزات

- تتبع مرئي لتدفق العمليات
- تحليل الـ prompts والاستجابات
- مراقبة الأداء والتكاليف
- تصحيح الأخطاء المتقدم

## الإعداد

### 1. تثبيت التبعيات

```bash
npm install langsmith
```

### 2. إعداد متغيرات البيئة

```bash
cp .env.langsmith .env
# قم بتعديل .env وأضف API key الخاص بك
```

### 3. تشغيل المراقبة

```bash
./start-langsmith-monitoring.sh
```

## الاستخدام

### تتبع الوكيل

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

## الملفات

- `src/config/langsmith-config.js`: تكوين LangSmith
- `src/monitoring/LangSmithMonitor.js`: مراقب الأداء
- `src/analytics/LangSmithAnalytics.js`: تحليلات البيانات
- `src/optimization/PromptOptimizer.js`: تحسين الـ Prompts
- `src/agents/LangSmithIntegration.js`: تكامل الوكلاء

## الدعم

للحصول على الدعم، يرجى مراجعة:

- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangChain Documentation](https://js.langchain.com/docs/)
