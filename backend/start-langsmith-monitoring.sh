#!/bin/bash

echo "🚀 بدء مراقبة LangSmith..."

# التحقق من متغيرات البيئة
if [ -z "$LANGCHAIN_API_KEY" ]; then
    echo "❌ يرجى تعيين LANGCHAIN_API_KEY في ملف .env"
    exit 1
fi

# تشغيل مراقب LangSmith
node src/monitoring/LangSmithMonitor.js &

# تشغيل محلل التحليلات
node src/analytics/LangSmithAnalytics.js &

# تشغيل محسن الـ Prompts
node src/optimization/PromptOptimizer.js &

echo "✅ تم تشغيل جميع خدمات LangSmith بنجاح!"
echo "📊 يمكنك الآن مراقبة الأداء في لوحة LangSmith"
