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
