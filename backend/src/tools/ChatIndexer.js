/**
 * Chat Indexer Tool
 * فهرسة المحادثات وتحليل السياق
 */

const { logger } = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

// Optional nodemailer import
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  logger.warn('⚠️ Nodemailer not available - email functionality disabled');
}

class ChatIndexer {
  constructor() {
    this.name = 'chat_indexer';
    this.description = 'فهرسة المحادثات وتحليل السياق والرؤى';
    this.supabase = null;
    this.initializeSupabase();
    this.chatHistory = [];
    this.insights = new Map();
    this.skillReports = new Map();
    this.codeQualityMetrics = new Map();
    this.learnedPatterns = new Map();
    this.emailTransporter = null;
    this.initializeEmail();
  }

  /**
   * تهيئة Supabase
   */
  initializeSupabase() {
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        logger.info('✅ Chat Indexer: Supabase initialized');
      } else {
        logger.warn('⚠️ Chat Indexer: Supabase not configured');
      }
    } catch (error) {
      logger.error('❌ Chat Indexer: Failed to initialize Supabase', { error: error.message });
    }
  }

  /**
   * تهيئة إرسال البريد الإلكتروني
   */
  initializeEmail() {
    try {
      if (
        nodemailer &&
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        logger.info('✅ Chat Indexer: Email transporter initialized');
      } else {
        logger.warn('⚠️ Chat Indexer: Email not configured or nodemailer not available');
      }
    } catch (error) {
      logger.error('❌ Chat Indexer: Failed to initialize email', { error: error.message });
    }
  }

  /**
   * فهرسة محادثة جديدة مع السياق
   * @param {Object} params - معاملات المحادثة
   * @param {string} params.message - الرسالة
   * @param {string} params.response - الرد
   * @param {string} params.context - السياق
   * @param {string} params.topic - الموضوع
   * @returns {Promise<Object>} نتيجة الفهرسة
   */
  async indexChatMessage(params) {
    try {
      const { message, response, context = '', topic = '', metadata = {} } = params;

      if (!message || !response) {
        return {
          success: false,
          error: 'الرسالة والرد مطلوبان',
        };
      }

      // تحليل المحادثة
      const analysis = await this.analyzeConversation(message, response, context);

      // إنشاء سجل المحادثة
      const chatRecord = {
        id: this.generateId(),
        message: message,
        response: response,
        context: context,
        topic: topic,
        analysis: analysis,
        metadata: {
          timestamp: new Date().toISOString(),
          messageLength: message.length,
          responseLength: response.length,
          language: this.detectLanguage(message),
          sentiment: this.analyzeSentiment(message),
          complexity: this.analyzeComplexity(message),
          intent: this.detectIntent(message),
          ...metadata,
        },
        created_at: new Date().toISOString(),
      };

      // حفظ في قاعدة البيانات
      if (this.supabase) {
        const { data, error } = await this.supabase.from('chat_history').insert([chatRecord]);

        if (error) {
          logger.error('❌ Chat Indexer: Database error', { error: error.message });
          return {
            success: false,
            error: `Database error: ${error.message}`,
          };
        }
      }

      // إضافة للذاكرة المحلية
      this.chatHistory.push(chatRecord);
      await this.extractInsights(chatRecord);

      logger.info('✅ Chat Indexer: Message indexed', {
        id: chatRecord.id,
        topic: topic,
        intent: chatRecord.metadata.intent,
      });

      // تحليل المهارات وجودة الكود
      await this.analyzeSkills(chatRecord);
      await this.analyzeCodeQuality(chatRecord);
      await this.extractLearnedPatterns(chatRecord);

      // إرسال تقرير بالبريد الإلكتروني إذا كانت المحادثة مهمة
      if (this.shouldSendEmailReport(chatRecord)) {
        await this.sendEmailReport(chatRecord);
      }

      return {
        success: true,
        data: {
          id: chatRecord.id,
          analysis: analysis,
          insights: await this.getInsights(topic),
          skillReport: await this.generateSkillReport(topic),
          codeQuality: await this.getCodeQualityMetrics(topic),
          learnedPatterns: await this.getLearnedPatterns(topic),
        },
      };
    } catch (error) {
      logger.error('❌ Chat Indexer: Failed to index message', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * تحليل المحادثة
   * @param {string} message - الرسالة
   * @param {string} response - الرد
   * @param {string} context - السياق
   * @returns {Object} التحليل
   */
  async analyzeConversation(message, response, context) {
    return {
      // تحليل الموضوع
      topic: this.extractTopic(message),

      // تحليل النوايا
      intent: this.detectIntent(message),

      // تحليل المشاعر
      sentiment: this.analyzeSentiment(message),

      // تحليل التعقيد
      complexity: this.analyzeComplexity(message),

      // تحليل الجودة
      quality: this.analyzeQuality(response),

      // تحليل السياق
      contextRelevance: this.analyzeContextRelevance(message, context),

      // اقتراحات التحسين
      improvements: this.suggestImprovements(message, response),

      // الأنماط المكتشفة
      patterns: this.detectPatterns(message, response),
    };
  }

  /**
   * استخراج الرؤى من المحادثة
   * @param {Object} chatRecord - سجل المحادثة
   */
  async extractInsights(chatRecord) {
    const topic = chatRecord.topic || 'general';

    if (!this.insights.has(topic)) {
      this.insights.set(topic, {
        totalMessages: 0,
        commonIntents: new Map(),
        sentimentTrend: [],
        complexityTrend: [],
        qualityTrend: [],
        patterns: new Map(),
        improvements: new Map(),
      });
    }

    const insight = this.insights.get(topic);
    insight.totalMessages++;

    // تحديث النوايا الشائعة
    const intent = chatRecord.metadata.intent;
    insight.commonIntents.set(intent, (insight.commonIntents.get(intent) || 0) + 1);

    // تحديث اتجاه المشاعر
    insight.sentimentTrend.push({
      timestamp: chatRecord.metadata.timestamp,
      sentiment: chatRecord.metadata.sentiment,
    });

    // تحديث اتجاه التعقيد
    insight.complexityTrend.push({
      timestamp: chatRecord.metadata.timestamp,
      complexity: chatRecord.metadata.complexity,
    });

    // تحديث اتجاه الجودة
    insight.qualityTrend.push({
      timestamp: chatRecord.metadata.timestamp,
      quality: chatRecord.analysis.quality,
    });

    // تحديث الأنماط
    if (chatRecord.analysis.patterns) {
      chatRecord.analysis.patterns.forEach((pattern) => {
        insight.patterns.set(pattern.type, (insight.patterns.get(pattern.type) || 0) + 1);
      });
    }
  }

  /**
   * الحصول على الرؤى
   * @param {string} topic - الموضوع
   * @returns {Object} الرؤى
   */
  async getInsights(topic = 'general') {
    const insight = this.insights.get(topic);
    if (!insight) {
      return {
        totalMessages: 0,
        insights: [],
      };
    }

    return {
      totalMessages: insight.totalMessages,
      topIntents: Array.from(insight.commonIntents.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      sentimentTrend: insight.sentimentTrend.slice(-10),
      complexityTrend: insight.complexityTrend.slice(-10),
      qualityTrend: insight.qualityTrend.slice(-10),
      commonPatterns: Array.from(insight.patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      insights: this.generateInsights(insight),
    };
  }

  /**
   * توليد الرؤى
   * @param {Object} insight - بيانات الرؤى
   * @returns {Array} الرؤى المولدة
   */
  generateInsights(insight) {
    const insights = [];

    // تحليل اتجاه المشاعر
    if (insight.sentimentTrend.length > 1) {
      const recentSentiment = insight.sentimentTrend.slice(-3);
      const avgSentiment =
        recentSentiment.reduce((sum, s) => sum + s.sentiment, 0) / recentSentiment.length;

      if (avgSentiment > 0.7) {
        insights.push({
          type: 'positive_trend',
          message: 'اتجاه إيجابي في المحادثات الأخيرة',
          confidence: avgSentiment,
        });
      } else if (avgSentiment < 0.3) {
        insights.push({
          type: 'negative_trend',
          message: 'اتجاه سلبي في المحادثات الأخيرة',
          confidence: 1 - avgSentiment,
        });
      }
    }

    // تحليل اتجاه التعقيد
    if (insight.complexityTrend.length > 1) {
      const recentComplexity = insight.complexityTrend.slice(-3);
      const avgComplexity =
        recentComplexity.reduce((sum, c) => sum + c.complexity, 0) / recentComplexity.length;

      if (avgComplexity > 0.8) {
        insights.push({
          type: 'high_complexity',
          message: 'زيادة في تعقيد المحادثات',
          confidence: avgComplexity,
        });
      }
    }

    // تحليل اتجاه الجودة
    if (insight.qualityTrend.length > 1) {
      const recentQuality = insight.qualityTrend.slice(-3);
      const avgQuality =
        recentQuality.reduce((sum, q) => sum + q.quality, 0) / recentQuality.length;

      if (avgQuality > 0.8) {
        insights.push({
          type: 'high_quality',
          message: 'جودة عالية في الردود',
          confidence: avgQuality,
        });
      }
    }

    return insights;
  }

  /**
   * البحث في المحادثات
   * @param {Object} params - معاملات البحث
   * @param {string} params.query - استعلام البحث
   * @param {string} params.topic - الموضوع
   * @param {number} params.limit - عدد النتائج
   * @returns {Promise<Object>} نتائج البحث
   */
  async searchChatHistory(params) {
    try {
      const { query, topic, limit = 10 } = params;

      let results = this.chatHistory;

      // تصفية حسب الموضوع
      if (topic) {
        results = results.filter((chat) => chat.topic === topic);
      }

      // البحث النصي
      if (query) {
        results = results.filter(
          (chat) =>
            chat.message.toLowerCase().includes(query.toLowerCase()) ||
            chat.response.toLowerCase().includes(query.toLowerCase())
        );
      }

      // ترتيب حسب التاريخ
      results = results
        .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))
        .slice(0, limit);

      return {
        success: true,
        data: {
          results: results,
          total: results.length,
          query: query,
          topic: topic,
        },
      };
    } catch (error) {
      logger.error('❌ Chat Indexer: Search failed', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== Helper Methods ====================

  generateId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  detectLanguage(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
  }

  analyzeSentiment(text) {
    const positiveWords = ['جيد', 'ممتاز', 'رائع', 'شكراً', 'good', 'great', 'excellent', 'thanks'];
    const negativeWords = ['سيء', 'مشكلة', 'خطأ', 'bad', 'problem', 'error', 'wrong'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) {
      return 0.8;
    }
    if (negativeCount > positiveCount) {
      return 0.2;
    }
    return 0.5;
  }

  analyzeComplexity(text) {
    const words = text.split(' ').length;
    const sentences = text.split(/[.!?]/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence > 20) {
      return 0.9;
    }
    if (avgWordsPerSentence > 15) {
      return 0.7;
    }
    if (avgWordsPerSentence > 10) {
      return 0.5;
    }
    return 0.3;
  }

  detectIntent(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('help') || lowerText.includes('مساعدة')) {
      return 'help';
    }
    if (lowerText.includes('bug') || lowerText.includes('error') || lowerText.includes('مشكلة')) {
      return 'bug_report';
    }
    if (lowerText.includes('feature') || lowerText.includes('ميزة')) {
      return 'feature_request';
    }
    if (lowerText.includes('question') || lowerText.includes('سؤال')) {
      return 'question';
    }
    if (lowerText.includes('improve') || lowerText.includes('تحسين')) {
      return 'improvement';
    }

    return 'general';
  }

  extractTopic(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('travel') || lowerText.includes('سفر')) {
      return 'travel';
    }
    if (lowerText.includes('code') || lowerText.includes('برمجة')) {
      return 'coding';
    }
    if (lowerText.includes('ai') || lowerText.includes('ذكاء')) {
      return 'ai';
    }
    if (lowerText.includes('security') || lowerText.includes('أمان')) {
      return 'security';
    }
    if (lowerText.includes('performance') || lowerText.includes('أداء')) {
      return 'performance';
    }

    return 'general';
  }

  analyzeQuality(response) {
    const length = response.length;
    const hasCode = /```[\s\S]*?```/.test(response);
    const hasExamples = /example|مثال|example/i.test(response);
    const hasStructure = /##|###|\*\*/.test(response);

    let quality = 0.5;

    if (length > 500) {
      quality += 0.2;
    }
    if (hasCode) {
      quality += 0.2;
    }
    if (hasExamples) {
      quality += 0.1;
    }
    if (hasStructure) {
      quality += 0.1;
    }

    return Math.min(quality, 1.0);
  }

  analyzeContextRelevance(message, context) {
    if (!context) {
      return 0.5;
    }

    const messageWords = message.toLowerCase().split(' ');
    const contextWords = context.toLowerCase().split(' ');
    const commonWords = messageWords.filter((word) => contextWords.includes(word));

    return commonWords.length / messageWords.length;
  }

  suggestImprovements(message, response) {
    const improvements = [];

    if (response.length < 100) {
      improvements.push('Consider providing more detailed explanation');
    }

    if (!/```[\s\S]*?```/.test(response) && /code|برمجة|function|class/.test(message)) {
      improvements.push('Include code examples for better clarity');
    }

    if (!/##|###|\*\*/.test(response) && response.length > 200) {
      improvements.push('Use markdown formatting for better structure');
    }

    return improvements;
  }

  detectPatterns(message, response) {
    const patterns = [];

    if (message.includes('?') && response.includes('?')) {
      patterns.push({ type: 'question_pattern', confidence: 0.8 });
    }

    if (/error|خطأ|مشكلة/.test(message) && /solution|حل|fix/.test(response)) {
      patterns.push({ type: 'problem_solution', confidence: 0.9 });
    }

    if (/how to|كيفية|طريقة/.test(message) && /step|خطوة|مرحلة/.test(response)) {
      patterns.push({ type: 'tutorial_pattern', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck() {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase.from('chat_history').select('id').limit(1);

        if (error) {
          return {
            success: false,
            error: `Database connection failed: ${error.message}`,
          };
        }

        return {
          success: true,
          status: 'healthy',
          database: 'connected',
          memoryRecords: this.chatHistory.length,
          insightsTopics: this.insights.size,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: true,
          status: 'healthy',
          database: 'memory_only',
          memoryRecords: this.chatHistory.length,
          insightsTopics: this.insights.size,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== Skill Analysis Methods ====================

  /**
   * تحليل المهارات من المحادثة
   * @param {Object} chatRecord - سجل المحادثة
   */
  async analyzeSkills(chatRecord) {
    const topic = chatRecord.topic || 'general';

    if (!this.skillReports.has(topic)) {
      this.skillReports.set(topic, {
        technicalSkills: new Map(),
        problemSolvingSkills: new Map(),
        communicationSkills: new Map(),
        learningProgress: [],
        skillLevels: new Map(),
      });
    }

    const skillReport = this.skillReports.get(topic);

    // تحليل المهارات التقنية
    const technicalSkills = this.extractTechnicalSkills(chatRecord.message, chatRecord.response);
    technicalSkills.forEach((skill) => {
      skillReport.technicalSkills.set(skill, (skillReport.technicalSkills.get(skill) || 0) + 1);
    });

    // تحليل مهارات حل المشاكل
    const problemSolvingSkills = this.extractProblemSolvingSkills(chatRecord);
    problemSolvingSkills.forEach((skill) => {
      skillReport.problemSolvingSkills.set(
        skill,
        (skillReport.problemSolvingSkills.get(skill) || 0) + 1
      );
    });

    // تحليل مهارات التواصل
    const communicationSkills = this.extractCommunicationSkills(chatRecord);
    communicationSkills.forEach((skill) => {
      skillReport.communicationSkills.set(
        skill,
        (skillReport.communicationSkills.get(skill) || 0) + 1
      );
    });

    // تحديث تقدم التعلم
    skillReport.learningProgress.push({
      timestamp: chatRecord.metadata.timestamp,
      skills: technicalSkills,
      complexity: chatRecord.metadata.complexity,
      quality: chatRecord.analysis.quality,
    });

    // تحديث مستويات المهارات
    await this.updateSkillLevels(skillReport, chatRecord);
  }

  /**
   * استخراج المهارات التقنية
   * @param {string} message - الرسالة
   * @param {string} response - الرد
   * @returns {Array} المهارات التقنية
   */
  extractTechnicalSkills(message, response) {
    const skills = [];
    const combined = (message + ' ' + response).toLowerCase();

    // مهارات البرمجة
    if (/javascript|js|typescript|ts/.test(combined)) {
      skills.push('JavaScript/TypeScript');
    }
    if (/react|vue|angular/.test(combined)) {
      skills.push('Frontend Frameworks');
    }
    if (/node|express|server/.test(combined)) {
      skills.push('Backend Development');
    }
    if (/database|sql|mongodb|postgresql/.test(combined)) {
      skills.push('Database Management');
    }
    if (/api|rest|graphql/.test(combined)) {
      skills.push('API Development');
    }
    if (/docker|kubernetes|deployment/.test(combined)) {
      skills.push('DevOps');
    }
    if (/testing|jest|mocha/.test(combined)) {
      skills.push('Testing');
    }
    if (/security|auth|encryption/.test(combined)) {
      skills.push('Security');
    }
    if (/ai|machine learning|ml/.test(combined)) {
      skills.push('AI/ML');
    }
    if (/mobile|ios|android/.test(combined)) {
      skills.push('Mobile Development');
    }

    // مهارات الأدوات
    if (/git|github|version control/.test(combined)) {
      skills.push('Version Control');
    }
    if (/docker|containerization/.test(combined)) {
      skills.push('Containerization');
    }
    if (/aws|azure|cloud/.test(combined)) {
      skills.push('Cloud Computing');
    }
    if (/ci\/cd|pipeline/.test(combined)) {
      skills.push('CI/CD');
    }

    return skills;
  }

  /**
   * استخراج مهارات حل المشاكل
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} مهارات حل المشاكل
   */
  extractProblemSolvingSkills(chatRecord) {
    const skills = [];
    const message = chatRecord.message.toLowerCase();
    const response = chatRecord.response.toLowerCase();

    if (/debug|fix|solve|problem/.test(message)) {
      if (/step|approach|method/.test(response)) {
        skills.push('Systematic Problem Solving');
      }
      if (/root cause|analyze|investigate/.test(response)) {
        skills.push('Root Cause Analysis');
      }
      if (/test|verify|validate/.test(response)) {
        skills.push('Testing & Validation');
      }
    }

    if (/optimize|improve|performance/.test(message)) {
      skills.push('Performance Optimization');
    }

    if (/architecture|design|structure/.test(message)) {
      skills.push('System Design');
    }

    if (/refactor|clean|maintain/.test(message)) {
      skills.push('Code Refactoring');
    }

    return skills;
  }

  /**
   * استخراج مهارات التواصل
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} مهارات التواصل
   */
  extractCommunicationSkills(chatRecord) {
    const skills = [];
    const response = chatRecord.response.toLowerCase();

    if (/explanation|explain|clarify/.test(response)) {
      skills.push('Technical Communication');
    }

    if (/example|demonstrate|show/.test(response)) {
      skills.push('Teaching & Mentoring');
    }

    if (/documentation|document|guide/.test(response)) {
      skills.push('Documentation');
    }

    if (/arabic|عربي/.test(chatRecord.message) || /arabic|عربي/.test(chatRecord.response)) {
      skills.push('Multilingual Communication');
    }

    return skills;
  }

  /**
   * تحديث مستويات المهارات
   * @param {Object} skillReport - تقرير المهارات
   * @param {Object} chatRecord - سجل المحادثة
   */
  async updateSkillLevels(skillReport, chatRecord) {
    const complexity = chatRecord.metadata.complexity;
    const quality = chatRecord.analysis.quality;

    // حساب مستوى المهارة بناءً على التعقيد والجودة
    const skillLevel = (complexity + quality) / 2;

    // تحديث مستويات المهارات المختلفة
    const allSkills = [
      ...Array.from(skillReport.technicalSkills.keys()),
      ...Array.from(skillReport.problemSolvingSkills.keys()),
      ...Array.from(skillReport.communicationSkills.keys()),
    ];

    allSkills.forEach((skill) => {
      const currentLevel = skillReport.skillLevels.get(skill) || 0;
      const newLevel = (currentLevel + skillLevel) / 2; // متوسط متحرك
      skillReport.skillLevels.set(skill, newLevel);
    });
  }

  /**
   * توليد تقرير المهارات
   * @param {string} topic - الموضوع
   * @returns {Object} تقرير المهارات
   */
  async generateSkillReport(topic = 'general') {
    const skillReport = this.skillReports.get(topic);
    if (!skillReport) {
      return {
        topic: topic,
        totalSkills: 0,
        skills: [],
      };
    }

    // ترتيب المهارات حسب المستوى
    const sortedSkills = Array.from(skillReport.skillLevels.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill, level]) => ({
        skill: skill,
        level: Math.round(level * 100) / 100,
        proficiency: this.getProficiencyLevel(level),
      }));

    return {
      topic: topic,
      totalSkills: sortedSkills.length,
      topSkills: sortedSkills.slice(0, 10),
      technicalSkills: Array.from(skillReport.technicalSkills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      problemSolvingSkills: Array.from(skillReport.problemSolvingSkills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      communicationSkills: Array.from(skillReport.communicationSkills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      learningProgress: skillReport.learningProgress.slice(-10),
      recommendations: this.generateSkillRecommendations(skillReport),
    };
  }

  /**
   * الحصول على مستوى الكفاءة
   * @param {number} level - مستوى المهارة
   * @returns {string} مستوى الكفاءة
   */
  getProficiencyLevel(level) {
    if (level >= 0.8) {
      return 'Expert';
    }
    if (level >= 0.6) {
      return 'Advanced';
    }
    if (level >= 0.4) {
      return 'Intermediate';
    }
    if (level >= 0.2) {
      return 'Beginner';
    }
    return 'Novice';
  }

  /**
   * توليد توصيات المهارات
   * @param {Object} skillReport - تقرير المهارات
   * @returns {Array} التوصيات
   */
  generateSkillRecommendations(skillReport) {
    const recommendations = [];

    // البحث عن المهارات الضعيفة
    const weakSkills = Array.from(skillReport.skillLevels.entries())
      .filter(([skill, level]) => level < 0.3)
      .map(([skill]) => skill);

    if (weakSkills.length > 0) {
      recommendations.push({
        type: 'improvement',
        message: `Focus on improving these skills: ${weakSkills.join(', ')}`,
        priority: 'high',
      });
    }

    // البحث عن المهارات القوية
    const strongSkills = Array.from(skillReport.skillLevels.entries())
      .filter(([skill, level]) => level >= 0.7)
      .map(([skill]) => skill);

    if (strongSkills.length > 0) {
      recommendations.push({
        type: 'strength',
        message: `Leverage your expertise in: ${strongSkills.join(', ')}`,
        priority: 'medium',
      });
    }

    return recommendations;
  }

  // ==================== Code Quality Analysis Methods ====================

  /**
   * تحليل جودة الكود
   * @param {Object} chatRecord - سجل المحادثة
   */
  async analyzeCodeQuality(chatRecord) {
    const topic = chatRecord.topic || 'general';

    if (!this.codeQualityMetrics.has(topic)) {
      this.codeQualityMetrics.set(topic, {
        readability: [],
        maintainability: [],
        performance: [],
        security: [],
        bestPractices: [],
        codeSnippets: [],
      });
    }

    const qualityMetrics = this.codeQualityMetrics.get(topic);

    // استخراج الكود من الرد
    const codeSnippets = this.extractCodeSnippets(chatRecord.response);

    if (codeSnippets.length > 0) {
      codeSnippets.forEach((snippet) => {
        const quality = this.analyzeCodeSnippet(snippet);
        qualityMetrics.codeSnippets.push({
          timestamp: chatRecord.metadata.timestamp,
          language: snippet.language,
          quality: quality,
          snippet: snippet.code.substring(0, 200) + '...', // أول 200 حرف
        });
      });
    }

    // تحليل جودة الرد العام
    const responseQuality = this.analyzeResponseQuality(chatRecord);
    qualityMetrics.readability.push({
      timestamp: chatRecord.metadata.timestamp,
      score: responseQuality.readability,
    });
    qualityMetrics.maintainability.push({
      timestamp: chatRecord.metadata.timestamp,
      score: responseQuality.maintainability,
    });
    qualityMetrics.performance.push({
      timestamp: chatRecord.metadata.timestamp,
      score: responseQuality.performance,
    });
    qualityMetrics.security.push({
      timestamp: chatRecord.metadata.timestamp,
      score: responseQuality.security,
    });
    qualityMetrics.bestPractices.push({
      timestamp: chatRecord.metadata.timestamp,
      score: responseQuality.bestPractices,
    });
  }

  /**
   * استخراج أجزاء الكود من النص
   * @param {string} text - النص
   * @returns {Array} أجزاء الكود
   */
  extractCodeSnippets(text) {
    const codeBlocks = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || 'unknown',
        code: match[2].trim(),
      });
    }

    return codeBlocks;
  }

  /**
   * تحليل جزء من الكود
   * @param {Object} snippet - جزء الكود
   * @returns {Object} تحليل الجودة
   */
  analyzeCodeSnippet(snippet) {
    const code = snippet.code;
    const language = snippet.language;

    return {
      readability: this.analyzeReadability(code),
      maintainability: this.analyzeMaintainability(code),
      performance: this.analyzePerformance(code),
      security: this.analyzeSecurity(code),
      bestPractices: this.analyzeBestPractices(code, language),
      complexity: this.analyzeCodeComplexity(code),
      documentation: this.analyzeDocumentation(code),
    };
  }

  /**
   * تحليل قابلية القراءة
   * @param {string} code - الكود
   * @returns {number} درجة قابلية القراءة
   */
  analyzeReadability(code) {
    const lines = code.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    const commentRatio = (code.match(/\/\/|\/\*|\*\/|\#/g) || []).length / lines.length;
    const variableNaming = this.analyzeVariableNaming(code);

    let score = 0.5;
    if (avgLineLength < 80) {
      score += 0.2;
    }
    if (commentRatio > 0.1) {
      score += 0.2;
    }
    if (variableNaming > 0.7) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * تحليل قابلية الصيانة
   * @param {string} code - الكود
   * @returns {number} درجة قابلية الصيانة
   */
  analyzeMaintainability(code) {
    const functions = (code.match(/function|def|class|const\s+\w+\s*=/g) || []).length;
    const lines = code.split('\n').length;
    const functionLength = lines / functions || 1;
    const complexity = this.analyzeCodeComplexity(code);

    let score = 0.5;
    if (functionLength < 20) {
      score += 0.3;
    } // دوال قصيرة
    if (complexity < 0.7) {
      score += 0.2;
    } // تعقيد منخفض

    return Math.min(score, 1.0);
  }

  /**
   * تحليل الأداء
   * @param {string} code - الكود
   * @returns {number} درجة الأداء
   */
  analyzePerformance(code) {
    const performanceIssues = [
      /for\s*\(\s*.*\s*in\s*.*\)/g, // for...in loops
      /\.forEach\s*\(/g, // forEach loops
      /eval\s*\(/g, // eval usage
      /innerHTML/g, // innerHTML usage
      /document\.write/g, // document.write
    ];

    const issues = performanceIssues.reduce((count, pattern) => {
      return count + (code.match(pattern) || []).length;
    }, 0);

    return Math.max(0, 1 - issues * 0.2);
  }

  /**
   * تحليل الأمان
   * @param {string} code - الكود
   * @returns {number} درجة الأمان
   */
  analyzeSecurity(code) {
    const securityIssues = [
      /innerHTML\s*=/g, // XSS vulnerability
      /eval\s*\(/g, // Code injection
      /password\s*=\s*['"][^'"]*['"]/g, // Hardcoded passwords
      /\.query\s*\([^)]*\+/g, // SQL injection
      /document\.cookie/g, // Cookie manipulation
    ];

    const issues = securityIssues.reduce((count, pattern) => {
      return count + (code.match(pattern) || []).length;
    }, 0);

    return Math.max(0, 1 - issues * 0.3);
  }

  /**
   * تحليل أفضل الممارسات
   * @param {string} code - الكود
   * @param {string} language - اللغة
   * @returns {number} درجة أفضل الممارسات
   */
  analyzeBestPractices(code, language) {
    let score = 0.5;

    // تحقق من استخدام const/let بدلاً من var
    if (language === 'javascript' || language === 'js') {
      const varUsage = (code.match(/\bvar\b/g) || []).length;
      const constLetUsage = (code.match(/\b(const|let)\b/g) || []).length;

      if (constLetUsage > varUsage) {
        score += 0.3;
      }
    }

    // تحقق من التعليقات
    if (code.includes('//') || code.includes('/*')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * تحليل تعقيد الكود
   * @param {string} code - الكود
   * @returns {number} درجة التعقيد
   */
  analyzeCodeComplexity(code) {
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*if/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /try\s*{/g,
      /catch\s*\(/g,
    ];

    const complexity = complexityIndicators.reduce((count, pattern) => {
      return count + (code.match(pattern) || []).length;
    }, 0);

    const lines = code.split('\n').length;
    return Math.min(complexity / lines, 1.0);
  }

  /**
   * تحليل التوثيق
   * @param {string} code - الكود
   * @returns {number} درجة التوثيق
   */
  analyzeDocumentation(code) {
    const comments = (code.match(/\/\/|\/\*|\*\/|\#/g) || []).length;
    const lines = code.split('\n').length;
    const commentRatio = comments / lines;

    if (commentRatio > 0.2) {
      return 1.0;
    }
    if (commentRatio > 0.1) {
      return 0.7;
    }
    if (commentRatio > 0.05) {
      return 0.5;
    }
    return 0.2;
  }

  /**
   * تحليل تسمية المتغيرات
   * @param {string} code - الكود
   * @returns {number} جودة تسمية المتغيرات
   */
  analyzeVariableNaming(code) {
    const variables = code.match(/\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    const goodNaming = variables.filter((variable) => {
      const name = variable.split(/\s+/)[1];
      return name.length > 2 && /[a-zA-Z]/.test(name);
    }).length;

    return variables.length > 0 ? goodNaming / variables.length : 0.5;
  }

  /**
   * تحليل جودة الرد
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Object} تحليل جودة الرد
   */
  analyzeResponseQuality(chatRecord) {
    const response = chatRecord.response;

    return {
      readability: this.analyzeReadability(response),
      maintainability: this.analyzeMaintainability(response),
      performance: this.analyzePerformance(response),
      security: this.analyzeSecurity(response),
      bestPractices: this.analyzeBestPractices(response, 'text'),
    };
  }

  /**
   * الحصول على مقاييس جودة الكود
   * @param {string} topic - الموضوع
   * @returns {Object} مقاييس جودة الكود
   */
  async getCodeQualityMetrics(topic = 'general') {
    const qualityMetrics = this.codeQualityMetrics.get(topic);
    if (!qualityMetrics) {
      return {
        topic: topic,
        overallScore: 0,
        metrics: {},
      };
    }

    // حساب النقاط الإجمالية
    const allMetrics = [
      ...qualityMetrics.readability,
      ...qualityMetrics.maintainability,
      ...qualityMetrics.performance,
      ...qualityMetrics.security,
      ...qualityMetrics.bestPractices,
    ];

    const overallScore =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, metric) => sum + metric.score, 0) / allMetrics.length
        : 0;

    return {
      topic: topic,
      overallScore: Math.round(overallScore * 100) / 100,
      metrics: {
        readability: this.getAverageScore(qualityMetrics.readability),
        maintainability: this.getAverageScore(qualityMetrics.maintainability),
        performance: this.getAverageScore(qualityMetrics.performance),
        security: this.getAverageScore(qualityMetrics.security),
        bestPractices: this.getAverageScore(qualityMetrics.bestPractices),
      },
      codeSnippets: qualityMetrics.codeSnippets.slice(-5), // آخر 5 أجزاء كود
      trends: {
        readability: qualityMetrics.readability.slice(-10),
        maintainability: qualityMetrics.maintainability.slice(-10),
        performance: qualityMetrics.performance.slice(-10),
        security: qualityMetrics.security.slice(-10),
        bestPractices: qualityMetrics.bestPractices.slice(-10),
      },
      recommendations: this.generateQualityRecommendations(qualityMetrics),
    };
  }

  /**
   * الحصول على النقاط المتوسطة
   * @param {Array} metrics - المقاييس
   * @returns {number} النقاط المتوسطة
   */
  getAverageScore(metrics) {
    if (metrics.length === 0) {
      return 0;
    }
    return (
      Math.round((metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length) * 100) /
      100
    );
  }

  /**
   * توليد توصيات الجودة
   * @param {Object} qualityMetrics - مقاييس الجودة
   * @returns {Array} التوصيات
   */
  generateQualityRecommendations(qualityMetrics) {
    const recommendations = [];

    const avgReadability = this.getAverageScore(qualityMetrics.readability);
    const avgMaintainability = this.getAverageScore(qualityMetrics.maintainability);
    const avgPerformance = this.getAverageScore(qualityMetrics.performance);
    const avgSecurity = this.getAverageScore(qualityMetrics.security);
    const avgBestPractices = this.getAverageScore(qualityMetrics.bestPractices);

    if (avgReadability < 0.6) {
      recommendations.push({
        type: 'readability',
        message: 'Improve code readability by adding comments and using clear variable names',
        priority: 'high',
      });
    }

    if (avgMaintainability < 0.6) {
      recommendations.push({
        type: 'maintainability',
        message: 'Break down complex functions into smaller, more manageable pieces',
        priority: 'high',
      });
    }

    if (avgPerformance < 0.6) {
      recommendations.push({
        type: 'performance',
        message: 'Optimize code performance by avoiding inefficient loops and operations',
        priority: 'medium',
      });
    }

    if (avgSecurity < 0.7) {
      recommendations.push({
        type: 'security',
        message: 'Address security vulnerabilities in your code',
        priority: 'high',
      });
    }

    if (avgBestPractices < 0.6) {
      recommendations.push({
        type: 'best_practices',
        message: 'Follow language-specific best practices and coding standards',
        priority: 'medium',
      });
    }

    return recommendations;
  }

  // ==================== Learned Patterns Methods ====================

  /**
   * استخراج الأنماط المكتسبة
   * @param {Object} chatRecord - سجل المحادثة
   */
  async extractLearnedPatterns(chatRecord) {
    const topic = chatRecord.topic || 'general';

    if (!this.learnedPatterns.has(topic)) {
      this.learnedPatterns.set(topic, {
        codePatterns: new Map(),
        problemPatterns: new Map(),
        solutionPatterns: new Map(),
        architecturalPatterns: new Map(),
        communicationPatterns: new Map(),
      });
    }

    const patterns = this.learnedPatterns.get(topic);

    // استخراج أنماط الكود
    const codePatterns = this.extractCodePatterns(chatRecord);
    codePatterns.forEach((pattern) => {
      patterns.codePatterns.set(pattern.type, (patterns.codePatterns.get(pattern.type) || 0) + 1);
    });

    // استخراج أنماط المشاكل
    const problemPatterns = this.extractProblemPatterns(chatRecord);
    problemPatterns.forEach((pattern) => {
      patterns.problemPatterns.set(
        pattern.type,
        (patterns.problemPatterns.get(pattern.type) || 0) + 1
      );
    });

    // استخراج أنماط الحلول
    const solutionPatterns = this.extractSolutionPatterns(chatRecord);
    solutionPatterns.forEach((pattern) => {
      patterns.solutionPatterns.set(
        pattern.type,
        (patterns.solutionPatterns.get(pattern.type) || 0) + 1
      );
    });

    // استخراج الأنماط المعمارية
    const architecturalPatterns = this.extractArchitecturalPatterns(chatRecord);
    architecturalPatterns.forEach((pattern) => {
      patterns.architecturalPatterns.set(
        pattern.type,
        (patterns.architecturalPatterns.get(pattern.type) || 0) + 1
      );
    });

    // استخراج أنماط التواصل
    const communicationPatterns = this.extractCommunicationPatterns(chatRecord);
    communicationPatterns.forEach((pattern) => {
      patterns.communicationPatterns.set(
        pattern.type,
        (patterns.communicationPatterns.get(pattern.type) || 0) + 1
      );
    });
  }

  /**
   * استخراج أنماط الكود
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} أنماط الكود
   */
  extractCodePatterns(chatRecord) {
    const patterns = [];
    const combined = (chatRecord.message + ' ' + chatRecord.response).toLowerCase();

    if (/async\s+await|promise|\.then/.test(combined)) {
      patterns.push({ type: 'async_programming', confidence: 0.9 });
    }

    if (/function|arrow\s+function|=>/.test(combined)) {
      patterns.push({ type: 'functional_programming', confidence: 0.8 });
    }

    if (/class|constructor|extends|inheritance/.test(combined)) {
      patterns.push({ type: 'object_oriented', confidence: 0.9 });
    }

    if (/map|filter|reduce|foreach/.test(combined)) {
      patterns.push({ type: 'array_methods', confidence: 0.8 });
    }

    if (/try|catch|throw|error/.test(combined)) {
      patterns.push({ type: 'error_handling', confidence: 0.9 });
    }

    return patterns;
  }

  /**
   * استخراج أنماط المشاكل
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} أنماط المشاكل
   */
  extractProblemPatterns(chatRecord) {
    const patterns = [];
    const message = chatRecord.message.toLowerCase();

    if (/bug|error|crash|exception/.test(message)) {
      patterns.push({ type: 'runtime_errors', confidence: 0.9 });
    }

    if (/slow|performance|optimize/.test(message)) {
      patterns.push({ type: 'performance_issues', confidence: 0.8 });
    }

    if (/security|vulnerability|attack/.test(message)) {
      patterns.push({ type: 'security_concerns', confidence: 0.9 });
    }

    if (/maintenance|refactor|clean/.test(message)) {
      patterns.push({ type: 'code_maintenance', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * استخراج أنماط الحلول
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} أنماط الحلول
   */
  extractSolutionPatterns(chatRecord) {
    const patterns = [];
    const response = chatRecord.response.toLowerCase();

    if (/step|process|approach|method/.test(response)) {
      patterns.push({ type: 'systematic_approach', confidence: 0.8 });
    }

    if (/example|demo|sample|code/.test(response)) {
      patterns.push({ type: 'example_driven', confidence: 0.9 });
    }

    if (/test|verify|validate|check/.test(response)) {
      patterns.push({ type: 'test_driven', confidence: 0.8 });
    }

    if (/documentation|comment|explain/.test(response)) {
      patterns.push({ type: 'documentation_focused', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * استخراج الأنماط المعمارية
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} الأنماط المعمارية
   */
  extractArchitecturalPatterns(chatRecord) {
    const patterns = [];
    const combined = (chatRecord.message + ' ' + chatRecord.response).toLowerCase();

    if (/mvc|model|view|controller/.test(combined)) {
      patterns.push({ type: 'mvc_pattern', confidence: 0.9 });
    }

    if (/microservice|service|api/.test(combined)) {
      patterns.push({ type: 'microservices', confidence: 0.8 });
    }

    if (/event|emitter|listener|observer/.test(combined)) {
      patterns.push({ type: 'event_driven', confidence: 0.9 });
    }

    if (/singleton|factory|builder/.test(combined)) {
      patterns.push({ type: 'design_patterns', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * استخراج أنماط التواصل
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Array} أنماط التواصل
   */
  extractCommunicationPatterns(chatRecord) {
    const patterns = [];
    const response = chatRecord.response.toLowerCase();

    if (/arabic|عربي/.test(response) || /arabic|عربي/.test(chatRecord.message)) {
      patterns.push({ type: 'multilingual', confidence: 1.0 });
    }

    if (/diagram|chart|visual/.test(response)) {
      patterns.push({ type: 'visual_communication', confidence: 0.8 });
    }

    if (/question|clarify|understand/.test(response)) {
      patterns.push({ type: 'interactive', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * الحصول على الأنماط المكتسبة
   * @param {string} topic - الموضوع
   * @returns {Object} الأنماط المكتسبة
   */
  async getLearnedPatterns(topic = 'general') {
    const patterns = this.learnedPatterns.get(topic);
    if (!patterns) {
      return {
        topic: topic,
        totalPatterns: 0,
        patterns: {},
      };
    }

    return {
      topic: topic,
      totalPatterns: Array.from(patterns.codePatterns.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
      patterns: {
        codePatterns: Array.from(patterns.codePatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        problemPatterns: Array.from(patterns.problemPatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        solutionPatterns: Array.from(patterns.solutionPatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        architecturalPatterns: Array.from(patterns.architecturalPatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        communicationPatterns: Array.from(patterns.communicationPatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
      },
      insights: this.generatePatternInsights(patterns),
    };
  }

  /**
   * توليد رؤى الأنماط
   * @param {Object} patterns - الأنماط
   * @returns {Array} الرؤى
   */
  generatePatternInsights(patterns) {
    const insights = [];

    // أكثر الأنماط استخداماً
    const allPatterns = [
      ...Array.from(patterns.codePatterns.entries()),
      ...Array.from(patterns.problemPatterns.entries()),
      ...Array.from(patterns.solutionPatterns.entries()),
    ];

    if (allPatterns.length > 0) {
      const mostUsed = allPatterns.sort((a, b) => b[1] - a[1])[0];
      insights.push({
        type: 'most_used_pattern',
        pattern: mostUsed[0],
        count: mostUsed[1],
        message: `Most frequently used pattern: ${mostUsed[0]}`,
      });
    }

    return insights;
  }

  // ==================== Email Notification Methods ====================

  /**
   * تحديد ما إذا كان يجب إرسال تقرير بالبريد الإلكتروني
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {boolean} هل يجب إرسال التقرير
   */
  shouldSendEmailReport(chatRecord) {
    // إرسال التقرير إذا كانت المحادثة مهمة أو معقدة
    const isImportant = chatRecord.metadata.complexity > 0.7;
    const isHighQuality = chatRecord.analysis.quality > 0.8;
    const isBugReport = chatRecord.metadata.intent === 'bug_report';
    const isFeatureRequest = chatRecord.metadata.intent === 'feature_request';

    return isImportant || isHighQuality || isBugReport || isFeatureRequest;
  }

  /**
   * إرسال تقرير بالبريد الإلكتروني
   * @param {Object} chatRecord - سجل المحادثة
   */
  async sendEmailReport(chatRecord) {
    if (!this.emailTransporter || !process.env.EMAIL_TO) {
      logger.warn('⚠️ Chat Indexer: Email not configured, skipping report');
      return;
    }

    try {
      const report = await this.generateEmailReport(chatRecord);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Chat Analysis Report - ${
          chatRecord.topic || 'General'
        } - ${new Date().toLocaleDateString()}`,
        html: report.html,
        text: report.text,
      };

      await this.emailTransporter.sendMail(mailOptions);
      logger.info('✅ Chat Indexer: Email report sent successfully');
    } catch (error) {
      logger.error('❌ Chat Indexer: Failed to send email report', { error: error.message });
    }
  }

  /**
   * توليد تقرير البريد الإلكتروني
   * @param {Object} chatRecord - سجل المحادثة
   * @returns {Object} التقرير
   */
  async generateEmailReport(chatRecord) {
    const topic = chatRecord.topic || 'general';
    const skillReport = await this.generateSkillReport(topic);
    const codeQuality = await this.getCodeQualityMetrics(topic);
    const learnedPatterns = await this.getLearnedPatterns(topic);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير تحليل المحادثة</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #34495e; border-right: 4px solid #3498db; padding-right: 10px; }
          .metric { display: inline-block; margin: 10px; padding: 10px; background: #ecf0f1; border-radius: 5px; }
          .score { font-weight: bold; color: #27ae60; }
          .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .pattern { background: #e8f5e8; border: 1px solid #c3e6c3; padding: 8px; border-radius: 5px; margin: 5px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 تقرير تحليل المحادثة</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
            <p>الموضوع: ${chatRecord.topic || 'عام'}</p>
          </div>

          <div class="section">
            <h2>🎯 ملخص المحادثة</h2>
            <p><strong>الرسالة:</strong> ${chatRecord.message.substring(0, 200)}...</p>
            <p><strong>التعقيد:</strong> <span class="score">${Math.round(
              chatRecord.metadata.complexity * 100
            )}%</span></p>
            <p><strong>الجودة:</strong> <span class="score">${Math.round(
              chatRecord.analysis.quality * 100
            )}%</span></p>
            <p><strong>المشاعر:</strong> ${
              chatRecord.metadata.sentiment > 0.6
                ? 'إيجابية'
                : chatRecord.metadata.sentiment < 0.4
                ? 'سلبية'
                : 'محايدة'
            }</p>
          </div>

          <div class="section">
            <h2>💡 تقرير المهارات</h2>
            <p><strong>إجمالي المهارات:</strong> ${skillReport.totalSkills}</p>
            <h3>أفضل المهارات:</h3>
            ${skillReport.topSkills
              .slice(0, 5)
              .map(
                (skill) =>
                  `<div class="metric">${skill.skill}: <span class="score">${skill.proficiency}</span></div>`
              )
              .join('')}
          </div>

          <div class="section">
            <h2>🔍 جودة الكود</h2>
            <p><strong>النقاط الإجمالية:</strong> <span class="score">${
              codeQuality.overallScore
            }/1.0</span></p>
            <div class="metric">قابلية القراءة: <span class="score">${
              codeQuality.metrics.readability
            }</span></div>
            <div class="metric">قابلية الصيانة: <span class="score">${
              codeQuality.metrics.maintainability
            }</span></div>
            <div class="metric">الأداء: <span class="score">${
              codeQuality.metrics.performance
            }</span></div>
            <div class="metric">الأمان: <span class="score">${
              codeQuality.metrics.security
            }</span></div>
            <div class="metric">أفضل الممارسات: <span class="score">${
              codeQuality.metrics.bestPractices
            }</span></div>
          </div>

          <div class="section">
            <h2>🧠 الأنماط المكتسبة</h2>
            <p><strong>إجمالي الأنماط:</strong> ${learnedPatterns.totalPatterns}</p>
            <h3>أنماط الكود:</h3>
            ${learnedPatterns.patterns.codePatterns
              .slice(0, 3)
              .map((pattern) => `<div class="pattern">${pattern[0]}: ${pattern[1]} مرة</div>`)
              .join('')}
          </div>

          <div class="section">
            <h2>📈 التوصيات</h2>
            ${[...skillReport.recommendations, ...codeQuality.recommendations]
              .map(
                (rec) =>
                  `<div class="recommendation">
                <strong>${rec.type}:</strong> ${rec.message}
                <br><small>الأولوية: ${rec.priority}</small>
              </div>`
              )
              .join('')}
          </div>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام فهرسة المحادثات</p>
            <p>للاستفسارات: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
تقرير تحليل المحادثة
====================

تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
الموضوع: ${chatRecord.topic || 'عام'}

ملخص المحادثة:
- التعقيد: ${Math.round(chatRecord.metadata.complexity * 100)}%
- الجودة: ${Math.round(chatRecord.analysis.quality * 100)}%
- المشاعر: ${
      chatRecord.metadata.sentiment > 0.6
        ? 'إيجابية'
        : chatRecord.metadata.sentiment < 0.4
        ? 'سلبية'
        : 'محايدة'
    }

تقرير المهارات:
- إجمالي المهارات: ${skillReport.totalSkills}
- أفضل المهارات: ${skillReport.topSkills
      .slice(0, 3)
      .map((s) => `${s.skill} (${s.proficiency})`)
      .join(', ')}

جودة الكود:
- النقاط الإجمالية: ${codeQuality.overallScore}/1.0
- قابلية القراءة: ${codeQuality.metrics.readability}
- قابلية الصيانة: ${codeQuality.metrics.maintainability}
- الأداء: ${codeQuality.metrics.performance}
- الأمان: ${codeQuality.metrics.security}

الأنماط المكتسبة:
- إجمالي الأنماط: ${learnedPatterns.totalPatterns}

التوصيات:
${[...skillReport.recommendations, ...codeQuality.recommendations]
  .map((rec) => `- ${rec.message}`)
  .join('\n')}

تم إنشاء هذا التقرير تلقائياً بواسطة نظام فهرسة المحادثات
    `;

    return { html, text };
  }
}

module.exports = new ChatIndexer();
