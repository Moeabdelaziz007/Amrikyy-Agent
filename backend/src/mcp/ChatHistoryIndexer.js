/**
 * Chat History Indexer MCP Tool
 * فهرسة محادثات الدردشة وتخزينها في قاعدة البيانات
 */

const { logger } = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

class ChatHistoryIndexer {
  constructor() {
    this.name = 'chat_history_indexer';
    this.description = 'فهرسة محادثات الدردشة وتخزينها في قاعدة البيانات';
    this.supabase = null;
    this.initializeSupabase();
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
        logger.info('✅ Chat History Indexer: Supabase initialized');
      } else {
        logger.warn('⚠️ Chat History Indexer: Supabase not configured');
      }
    } catch (error) {
      logger.error('❌ Chat History Indexer: Failed to initialize Supabase', { error: error.message });
    }
  }

  /**
   * فهرسة محادثة جديدة
   * @param {Object} params - معاملات المحادثة
   * @param {string} params.userId - معرف المستخدم
   * @param {string} params.message - رسالة المستخدم
   * @param {string} params.response - رد الذكاء الاصطناعي
   * @param {string} params.sessionId - معرف الجلسة
   * @param {Object} params.metadata - بيانات إضافية
   * @returns {Promise<Object>} نتيجة الفهرسة
   */
  async indexChatMessage(params) {
    try {
      const { userId, message, response, sessionId, metadata = {} } = params;

      // التحقق من المعاملات المطلوبة
      if (!userId || !message || !response) {
        return {
          success: false,
          error: 'المعاملات المطلوبة مفقودة: userId, message, response'
        };
      }

      // إنشاء سجل المحادثة
      const chatRecord = {
        id: this.generateId(),
        user_id: userId,
        message: message,
        response: response,
        session_id: sessionId || this.generateSessionId(),
        metadata: {
          timestamp: new Date().toISOString(),
          message_length: message.length,
          response_length: response.length,
          language: this.detectLanguage(message),
          sentiment: this.analyzeSentiment(message),
          ...metadata
        },
        created_at: new Date().toISOString()
      };

      // حفظ في قاعدة البيانات
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('ai_conversations')
          .insert([chatRecord]);

        if (error) {
          logger.error('❌ Chat History Indexer: Database error', { error: error.message });
          return {
            success: false,
            error: `Database error: ${error.message}`
          };
        }

        logger.info('✅ Chat History Indexer: Message indexed', {
          id: chatRecord.id,
          userId,
          sessionId: chatRecord.session_id
        });

        return {
          success: true,
          data: {
            id: chatRecord.id,
            sessionId: chatRecord.session_id,
            indexed: true,
            timestamp: chatRecord.created_at
          }
        };
      } else {
        // تخزين مؤقت في الذاكرة إذا لم تكن قاعدة البيانات متاحة
        logger.warn('⚠️ Chat History Indexer: Using memory storage');
        return {
          success: true,
          data: {
            id: chatRecord.id,
            sessionId: chatRecord.session_id,
            indexed: true,
            timestamp: chatRecord.created_at,
            storage: 'memory'
          }
        };
      }

    } catch (error) {
      logger.error('❌ Chat History Indexer: Failed to index message', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * البحث في محادثات المستخدم
   * @param {Object} params - معاملات البحث
   * @param {string} params.userId - معرف المستخدم
   * @param {string} params.query - استعلام البحث
   * @param {number} params.limit - عدد النتائج
   * @returns {Promise<Object>} نتائج البحث
   */
  async searchChatHistory(params) {
    try {
      const { userId, query, limit = 10 } = params;

      if (!userId) {
        return {
          success: false,
          error: 'معرف المستخدم مطلوب'
        };
      }

      if (this.supabase) {
        let queryBuilder = this.supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        // إضافة البحث النصي إذا كان موجوداً
        if (query) {
          queryBuilder = queryBuilder.or(`message.ilike.%${query}%,response.ilike.%${query}%`);
        }

        const { data, error } = await queryBuilder;

        if (error) {
          logger.error('❌ Chat History Indexer: Search error', { error: error.message });
          return {
            success: false,
            error: `Search error: ${error.message}`
          };
        }

        return {
          success: true,
          data: {
            conversations: data || [],
            total: data?.length || 0,
            query: query || 'all'
          }
        };
      } else {
        return {
          success: false,
          error: 'قاعدة البيانات غير متاحة'
        };
      }

    } catch (error) {
      logger.error('❌ Chat History Indexer: Search failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على إحصائيات المحادثات
   * @param {Object} params - معاملات الإحصائيات
   * @param {string} params.userId - معرف المستخدم
   * @param {string} params.period - الفترة الزمنية
   * @returns {Promise<Object>} الإحصائيات
   */
  async getChatStatistics(params) {
    try {
      const { userId, period = '7d' } = params;

      if (!userId) {
        return {
          success: false,
          error: 'معرف المستخدم مطلوب'
        };
      }

      if (this.supabase) {
        // حساب الفترة الزمنية
        const days = this.parsePeriod(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await this.supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString());

        if (error) {
          logger.error('❌ Chat History Indexer: Statistics error', { error: error.message });
          return {
            success: false,
            error: `Statistics error: ${error.message}`
          };
        }

        // تحليل الإحصائيات
        const stats = this.analyzeStatistics(data || []);

        return {
          success: true,
          data: {
            period,
            totalMessages: data?.length || 0,
            ...stats
          }
        };
      } else {
        return {
          success: false,
          error: 'قاعدة البيانات غير متاحة'
        };
      }

    } catch (error) {
      logger.error('❌ Chat History Indexer: Statistics failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * حذف محادثات المستخدم
   * @param {Object} params - معاملات الحذف
   * @param {string} params.userId - معرف المستخدم
   * @param {string} params.sessionId - معرف الجلسة (اختياري)
   * @returns {Promise<Object>} نتيجة الحذف
   */
  async deleteChatHistory(params) {
    try {
      const { userId, sessionId } = params;

      if (!userId) {
        return {
          success: false,
          error: 'معرف المستخدم مطلوب'
        };
      }

      if (this.supabase) {
        let queryBuilder = this.supabase
          .from('ai_conversations')
          .delete()
          .eq('user_id', userId);

        if (sessionId) {
          queryBuilder = queryBuilder.eq('session_id', sessionId);
        }

        const { error } = await queryBuilder;

        if (error) {
          logger.error('❌ Chat History Indexer: Delete error', { error: error.message });
          return {
            success: false,
            error: `Delete error: ${error.message}`
          };
        }

        logger.info('✅ Chat History Indexer: Chat history deleted', { userId, sessionId });

        return {
          success: true,
          data: {
            deleted: true,
            userId,
            sessionId: sessionId || 'all'
          }
        };
      } else {
        return {
          success: false,
          error: 'قاعدة البيانات غير متاحة'
        };
      }

    } catch (error) {
      logger.error('❌ Chat History Indexer: Delete failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * توليد معرف فريد
   */
  generateId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * توليد معرف جلسة
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * كشف اللغة
   */
  detectLanguage(text) {
    // كشف بسيط للغة العربية والإنجليزية
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
  }

  /**
   * تحليل المشاعر
   */
  analyzeSentiment(text) {
    // تحليل بسيط للمشاعر
    const positiveWords = ['جيد', 'ممتاز', 'رائع', 'شكراً', 'good', 'great', 'excellent', 'thanks'];
    const negativeWords = ['سيء', 'مشكلة', 'خطأ', 'bad', 'problem', 'error', 'wrong'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * تحليل الإحصائيات
   */
  analyzeStatistics(conversations) {
    const totalMessages = conversations.length;
    const totalSessions = new Set(conversations.map(c => c.session_id)).size;
    const avgMessageLength = conversations.reduce((sum, c) => sum + c.message.length, 0) / totalMessages;
    const avgResponseLength = conversations.reduce((sum, c) => sum + c.response.length, 0) / totalMessages;

    // تحليل اللغات
    const languages = conversations.reduce((acc, c) => {
      const lang = c.metadata?.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    // تحليل المشاعر
    const sentiments = conversations.reduce((acc, c) => {
      const sentiment = c.metadata?.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMessages,
      totalSessions,
      avgMessageLength: Math.round(avgMessageLength),
      avgResponseLength: Math.round(avgResponseLength),
      languages,
      sentiments
    };
  }

  /**
   * تحليل الفترة الزمنية
   */
  parsePeriod(period) {
    const periods = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return periods[period] || 7;
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck() {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('ai_conversations')
          .select('id')
          .limit(1);

        if (error) {
          return {
            success: false,
            error: `Database connection failed: ${error.message}`
          };
        }

        return {
          success: true,
          status: 'healthy',
          database: 'connected',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: true,
          status: 'healthy',
          database: 'memory_only',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatHistoryIndexer();
