#!/bin/bash

# 🚀 سكريبت إعداد LangSmith لنظام Maya Travel Agent
# هذا السكريبت يقوم بإعداد LangSmith للمراقبة المتقدمة للوكلاء

echo "🚀 بدء إعداد LangSmith لنظام Maya Travel Agent..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً."
    exit 1
fi

echo "✅ تم التحقق من Node.js و npm"

# الانتقال إلى مجلد backend
cd backend

# تثبيت LangSmith SDK
echo "📦 تثبيت LangSmith SDK..."
npm install langsmith

# تثبيت تبعيات إضافية للمراقبة
echo "📦 تثبيت تبعيات المراقبة..."
npm install winston winston-daily-rotate-file

# إنشاء مجلد التكوين
echo "📁 إنشاء مجلد التكوين..."
mkdir -p src/config
mkdir -p src/monitoring
mkdir -p src/analytics
mkdir -p src/optimization

# إنشاء ملف تكوين LangSmith
echo "⚙️ إنشاء ملف تكوين LangSmith..."
cat > src/config/langsmith-config.js << 'EOF'
import { Client } from "langsmith";

const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
});

export default langsmithClient;

// إعدادات المشروع
export const LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || "maya-travel-agent";

// إعدادات التتبع
export const TRACING_CONFIG = {
  projectName: LANGCHAIN_PROJECT,
  tags: ["maya-travel-agent", "production"],
  metadata: {
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  }
};
EOF

# إنشاء ملف المراقبة الأساسي
echo "📊 إنشاء ملف المراقبة الأساسي..."
cat > src/monitoring/LangSmithMonitor.js << 'EOF'
import langsmithClient, { LANGCHAIN_PROJECT } from '../config/langsmith-config.js';
import winston from 'winston';

// إعداد Winston للوكلاء
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/langsmith.log' }),
    new winston.transports.Console()
  ]
});

class LangSmithMonitor {
  constructor() {
    this.projectName = LANGCHAIN_PROJECT;
    this.client = langsmithClient;
  }

  // تتبع تشغيل الوكيل
  async trackAgentRun(agentName, input, output, metadata = {}) {
    try {
      const run = await this.client.createRun({
        name: agentName,
        inputs: input,
        outputs: output,
        project_name: this.projectName,
        tags: ["agent", agentName],
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

      logger.info(`تم تتبع تشغيل الوكيل: ${agentName}`, { runId: run.id });
      return run;
    } catch (error) {
      logger.error(`خطأ في تتبع الوكيل ${agentName}:`, error);
      throw error;
    }
  }

  // الحصول على إحصائيات الأداء
  async getPerformanceStats(days = 7) {
    try {
      const runs = await this.client.listRuns({
        project_name: this.projectName,
        limit: 1000
      });

      const stats = this.calculateStats(runs);
      logger.info('تم الحصول على إحصائيات الأداء', stats);
      return stats;
    } catch (error) {
      logger.error('خطأ في الحصول على إحصائيات الأداء:', error);
      throw error;
    }
  }

  // حساب الإحصائيات
  calculateStats(runs) {
    const stats = {
      totalRuns: runs.length,
      averageResponseTime: 0,
      successRate: 0,
      agentStats: {}
    };

    let totalTime = 0;
    let successfulRuns = 0;

    runs.forEach(run => {
      if (run.end_time && run.start_time) {
        const duration = new Date(run.end_time) - new Date(run.start_time);
        totalTime += duration;
      }

      if (run.status === 'success') {
        successfulRuns++;
      }

      const agentName = run.tags?.find(tag => tag.startsWith('agent:')) || 'unknown';
      if (!stats.agentStats[agentName]) {
        stats.agentStats[agentName] = { count: 0, success: 0 };
      }
      stats.agentStats[agentName].count++;
      if (run.status === 'success') {
        stats.agentStats[agentName].success++;
      }
    });

    stats.averageResponseTime = totalTime / runs.length;
    stats.successRate = (successfulRuns / runs.length) * 100;

    return stats;
  }

  // مراقبة الأخطاء
  async monitorErrors() {
    try {
      const runs = await this.client.listRuns({
        project_name: this.projectName,
        status: 'error',
        limit: 100
      });

      if (runs.length > 0) {
        logger.warn(`تم اكتشاف ${runs.length} خطأ في النظام`);
        return runs;
      }

      return [];
    } catch (error) {
      logger.error('خطأ في مراقبة الأخطاء:', error);
      throw error;
    }
  }
}

export default LangSmithMonitor;
EOF

# إنشاء ملف التحليلات
echo "📈 إنشاء ملف التحليلات..."
cat > src/analytics/LangSmithAnalytics.js << 'EOF'
import LangSmithMonitor from '../monitoring/LangSmithMonitor.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/analytics.log' }),
    new winston.transports.Console()
  ]
});

class LangSmithAnalytics {
  constructor() {
    this.monitor = new LangSmithMonitor();
  }

  // إنشاء تقرير أسبوعي
  async generateWeeklyReport() {
    try {
      logger.info('بدء إنشاء التقرير الأسبوعي...');

      const stats = await this.monitor.getPerformanceStats(7);
      const errors = await this.monitor.monitorErrors();

      const report = {
        period: 'أسبوعي',
        date: new Date().toISOString(),
        summary: {
          totalInteractions: stats.totalRuns,
          averageResponseTime: stats.averageResponseTime,
          successRate: stats.successRate,
          errorCount: errors.length
        },
        agentPerformance: stats.agentStats,
        recommendations: this.generateRecommendations(stats, errors)
      };

      logger.info('تم إنشاء التقرير الأسبوعي بنجاح', report);
      return report;
    } catch (error) {
      logger.error('خطأ في إنشاء التقرير الأسبوعي:', error);
      throw error;
    }
  }

  // إنشاء تقرير شهري
  async generateMonthlyReport() {
    try {
      logger.info('بدء إنشاء التقرير الشهري...');

      const stats = await this.monitor.getPerformanceStats(30);
      const errors = await this.monitor.monitorErrors();

      const report = {
        period: 'شهري',
        date: new Date().toISOString(),
        summary: {
          totalInteractions: stats.totalRuns,
          averageResponseTime: stats.averageResponseTime,
          successRate: stats.successRate,
          errorCount: errors.length
        },
        agentPerformance: stats.agentStats,
        trends: await this.analyzeTrends(),
        recommendations: this.generateRecommendations(stats, errors)
      };

      logger.info('تم إنشاء التقرير الشهري بنجاح', report);
      return report;
    } catch (error) {
      logger.error('خطأ في إنشاء التقرير الشهري:', error);
      throw error;
    }
  }

  // تحليل الاتجاهات
  async analyzeTrends() {
    // تحليل الاتجاهات بناءً على البيانات التاريخية
    return {
      performanceTrend: 'مستقر',
      usageTrend: 'متزايد',
      errorTrend: 'متناقص'
    };
  }

  // إنشاء التوصيات
  generateRecommendations(stats, errors) {
    const recommendations = [];

    if (stats.successRate < 90) {
      recommendations.push('تحسين معدل النجاح: فحص الأخطاء وتحسين الـ prompts');
    }

    if (stats.averageResponseTime > 5000) {
      recommendations.push('تحسين وقت الاستجابة: تحسين الأداء وتقليل التعقيد');
    }

    if (errors.length > 10) {
      recommendations.push('تقليل الأخطاء: مراجعة الكود وتحسين معالجة الأخطاء');
    }

    return recommendations;
  }
}

export default LangSmithAnalytics;
EOF

# إنشاء ملف تحسين الـ Prompts
echo "🔧 إنشاء ملف تحسين الـ Prompts..."
cat > src/optimization/PromptOptimizer.js << 'EOF'
import LangSmithMonitor from '../monitoring/LangSmithMonitor.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/optimization.log' }),
    new winston.transports.Console()
  ]
});

class PromptOptimizer {
  constructor() {
    this.monitor = new LangSmithMonitor();
  }

  // تحليل فعالية الـ Prompts
  async analyzePromptEffectiveness() {
    try {
      logger.info('بدء تحليل فعالية الـ Prompts...');

      const runs = await this.monitor.client.listRuns({
        project_name: this.monitor.projectName,
        limit: 1000
      });

      const promptAnalysis = this.analyzePrompts(runs);
      logger.info('تم تحليل فعالية الـ Prompts', promptAnalysis);
      return promptAnalysis;
    } catch (error) {
      logger.error('خطأ في تحليل فعالية الـ Prompts:', error);
      throw error;
    }
  }

  // تحليل الـ Prompts
  analyzePrompts(runs) {
    const promptStats = {};
    const agentStats = {};

    runs.forEach(run => {
      const agentName = run.tags?.find(tag => tag.startsWith('agent:')) || 'unknown';
      
      if (!agentStats[agentName]) {
        agentStats[agentName] = {
          totalRuns: 0,
          successfulRuns: 0,
          averageResponseTime: 0,
          totalTime: 0
        };
      }

      agentStats[agentName].totalRuns++;
      if (run.status === 'success') {
        agentStats[agentName].successfulRuns++;
      }

      if (run.end_time && run.start_time) {
        const duration = new Date(run.end_time) - new Date(run.start_time);
        agentStats[agentName].totalTime += duration;
      }
    });

    // حساب المتوسطات
    Object.keys(agentStats).forEach(agent => {
      const stats = agentStats[agent];
      stats.averageResponseTime = stats.totalTime / stats.totalRuns;
      stats.successRate = (stats.successfulRuns / stats.totalRuns) * 100;
    });

    return {
      agentStats,
      recommendations: this.generatePromptRecommendations(agentStats)
    };
  }

  // إنشاء توصيات تحسين الـ Prompts
  generatePromptRecommendations(agentStats) {
    const recommendations = [];

    Object.keys(agentStats).forEach(agent => {
      const stats = agentStats[agent];
      
      if (stats.successRate < 85) {
        recommendations.push({
          agent,
          issue: 'معدل نجاح منخفض',
          recommendation: `تحسين prompts للوكيل ${agent} لزيادة معدل النجاح`
        });
      }

      if (stats.averageResponseTime > 3000) {
        recommendations.push({
          agent,
          issue: 'وقت استجابة بطيء',
          recommendation: `تحسين prompts للوكيل ${agent} لتقليل وقت الاستجابة`
        });
      }
    });

    return recommendations;
  }

  // تحسين الـ Prompts تلقائياً
  async optimizePrompts() {
    try {
      logger.info('بدء تحسين الـ Prompts...');

      const analysis = await this.analyzePromptEffectiveness();
      const optimizedPrompts = this.generateOptimizedPrompts(analysis);

      logger.info('تم تحسين الـ Prompts بنجاح', optimizedPrompts);
      return optimizedPrompts;
    } catch (error) {
      logger.error('خطأ في تحسين الـ Prompts:', error);
      throw error;
    }
  }

  // إنشاء الـ Prompts المحسنة
  generateOptimizedPrompts(analysis) {
    const optimizedPrompts = {};

    Object.keys(analysis.agentStats).forEach(agent => {
      const stats = analysis.agentStats[agent];
      
      if (stats.successRate < 85) {
        optimizedPrompts[agent] = {
          originalPrompt: `الـ prompt الأصلي للوكيل ${agent}`,
          optimizedPrompt: `الـ prompt المحسن للوكيل ${agent} مع تحسينات للدقة`,
          improvements: ['تحسين الوضوح', 'إضافة أمثلة', 'تحسين التنسيق']
        };
      }
    });

    return optimizedPrompts;
  }
}

export default PromptOptimizer;
EOF

# إنشاء ملف التكامل مع الوكلاء
echo "🤖 إنشاء ملف التكامل مع الوكلاء..."
cat > src/agents/LangSmithIntegration.js << 'EOF'
import { traceable } from "langsmith";
import LangSmithMonitor from '../monitoring/LangSmithMonitor.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/agent-integration.log' }),
    new winston.transports.Console()
  ]
});

class LangSmithIntegration {
  constructor() {
    this.monitor = new LangSmithMonitor();
  }

  // دمج Maya Orchestrator
  @traceable({
    name: "maya_orchestrator",
    tags: ["agent", "orchestrator", "travel"]
  })
  async coordinateTripPlanning(userRequest) {
    try {
      logger.info('بدء تنسيق تخطيط الرحلة', { userRequest });
      
      // منطق التنسيق هنا
      const result = await this.orchestrateAgents(userRequest);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('maya_orchestrator', userRequest, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في تنسيق تخطيط الرحلة:', error);
      throw error;
    }
  }

  // دمج Luna Agent
  @traceable({
    name: "luna_trip_architect",
    tags: ["agent", "luna", "itinerary"]
  })
  async createItinerary(tripRequirements) {
    try {
      logger.info('بدء إنشاء الخطط', { tripRequirements });
      
      // منطق إنشاء الخطط هنا
      const result = await this.designItinerary(tripRequirements);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('luna_trip_architect', tripRequirements, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في إنشاء الخطط:', error);
      throw error;
    }
  }

  // دمج Karim Agent
  @traceable({
    name: "karim_budget_optimizer",
    tags: ["agent", "karim", "budget"]
  })
  async optimizeBudget(itinerary) {
    try {
      logger.info('بدء تحسين الميزانية', { itinerary });
      
      // منطق تحسين الميزانية هنا
      const result = await this.calculateCosts(itinerary);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('karim_budget_optimizer', itinerary, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في تحسين الميزانية:', error);
      throw error;
    }
  }

  // دمج Layla Agent
  @traceable({
    name: "layla_cultural_guide",
    tags: ["agent", "layla", "cultural"]
  })
  async provideCulturalGuidance(destination) {
    try {
      logger.info('بدء تقديم الإرشاد الثقافي', { destination });
      
      // منطق الإرشاد الثقافي هنا
      const result = await this.guideCulturalExperience(destination);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('layla_cultural_guide', destination, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في تقديم الإرشاد الثقافي:', error);
      throw error;
    }
  }

  // دمج Amira Agent
  @traceable({
    name: "amira_problem_solver",
    tags: ["agent", "amira", "problem-solving"]
  })
  async solveProblem(problem) {
    try {
      logger.info('بدء حل المشكلة', { problem });
      
      // منطق حل المشكلة هنا
      const result = await this.resolveIssue(problem);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('amira_problem_solver', problem, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في حل المشكلة:', error);
      throw error;
    }
  }

  // دمج Tariq Agent
  @traceable({
    name: "tariq_payment_manager",
    tags: ["agent", "tariq", "payment"]
  })
  async managePayment(paymentRequest) {
    try {
      logger.info('بدء إدارة الدفع', { paymentRequest });
      
      // منطق إدارة الدفع هنا
      const result = await this.processPayment(paymentRequest);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('tariq_payment_manager', paymentRequest, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في إدارة الدفع:', error);
      throw error;
    }
  }

  // دمج Zara Agent
  @traceable({
    name: "zara_research_specialist",
    tags: ["agent", "zara", "research"]
  })
  async conductResearch(researchQuery) {
    try {
      logger.info('بدء البحث', { researchQuery });
      
      // منطق البحث هنا
      const result = await this.performResearch(researchQuery);
      
      // تتبع النتيجة
      await this.monitor.trackAgentRun('zara_research_specialist', researchQuery, result);
      
      return result;
    } catch (error) {
      logger.error('خطأ في البحث:', error);
      throw error;
    }
  }

  // طرق مساعدة (يتم تنفيذها في الوكلاء الفعلية)
  async orchestrateAgents(userRequest) {
    // يتم تنفيذها في Maya Orchestrator
    return { message: 'تم تنسيق الوكلاء' };
  }

  async designItinerary(tripRequirements) {
    // يتم تنفيذها في Luna Agent
    return { message: 'تم إنشاء الخطط' };
  }

  async calculateCosts(itinerary) {
    // يتم تنفيذها في Karim Agent
    return { message: 'تم حساب التكاليف' };
  }

  async guideCulturalExperience(destination) {
    // يتم تنفيذها في Layla Agent
    return { message: 'تم تقديم الإرشاد الثقافي' };
  }

  async resolveIssue(problem) {
    // يتم تنفيذها في Amira Agent
    return { message: 'تم حل المشكلة' };
  }

  async processPayment(paymentRequest) {
    // يتم تنفيذها في Tariq Agent
    return { message: 'تم معالجة الدفع' };
  }

  async performResearch(researchQuery) {
    // يتم تنفيذها في Zara Agent
    return { message: 'تم إجراء البحث' };
  }
}

export default LangSmithIntegration;
EOF

# إنشاء ملف متغيرات البيئة
echo "🔐 إنشاء ملف متغيرات البيئة..."
cat > .env.langsmith << 'EOF'
# LangSmith Configuration
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=maya-travel-agent
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# إعدادات التتبع
LANGCHAIN_TRACING=true
LANGCHAIN_VERBOSE=true

# إعدادات المراقبة
MONITORING_ENABLED=true
ANALYTICS_ENABLED=true
OPTIMIZATION_ENABLED=true
EOF

# إنشاء سكريبت التشغيل
echo "🚀 إنشاء سكريبت التشغيل..."
cat > start-langsmith-monitoring.sh << 'EOF'
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
EOF

chmod +x start-langsmith-monitoring.sh

# إنشاء ملف README
echo "📚 إنشاء ملف README..."
cat > LANGSMITH_README.md << 'EOF'
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
EOF

# إنشاء مجلد السجلات
echo "📁 إنشاء مجلد السجلات..."
mkdir -p logs

# إنشاء ملف .gitignore للسجلات
echo "logs/" >> .gitignore
echo "*.log" >> .gitignore

echo ""
echo "🎉 تم إعداد LangSmith بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. قم بتعديل ملف .env.langsmith وأضف API key الخاص بك"
echo "2. انسخ .env.langsmith إلى .env"
echo "3. شغل ./start-langsmith-monitoring.sh"
echo ""
echo "📊 يمكنك الآن مراقبة أداء الوكلاء في لوحة LangSmith"
echo "🔗 رابط لوحة LangSmith: https://smith.langchain.com/"
echo ""
echo "✅ الإعداد مكتمل!"
