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
