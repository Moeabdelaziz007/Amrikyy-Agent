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
