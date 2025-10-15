/**
 * AIX Registry - سجل الوكلاء
 * Created by Cursor - AIX Integration Team
 * 
 * يدير تسجيل وتتبع الوكلاء في النظام
 */

const { logger } = require('../utils/logger');

// إنشاء logger مخصص للـ Registry
const log = logger.child('AIXRegistry');

/**
 * AIXRegistry - سجل الوكلاء الرئيسي
 */
class AIXRegistry {
  constructor() {
    this.agents = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.performance = new Map();
    
    log.info('AIX Registry initialized');
  }

  /**
   * تسجيل وكيل جديد
   * @param {AIXAgent} agent - الوكيل
   * @param {Object} metadata - بيانات إضافية
   */
  registerAgent(agent, metadata = {}) {
    const agentInfo = {
      agent,
      metadata: {
        registeredAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        ...metadata
      }
    };

    // تسجيل بالمعرف
    this.agents.set(agent.id, agentInfo);

    // تسجيل بالاسم
    this.agents.set(agent.name, agentInfo);

    // تسجيل بالتصنيف
    if (agent.data.meta?.category) {
      this.addToCategory(agent.data.meta.category, agent);
    }

    // تسجيل بالعلامات
    if (agent.data.meta?.tags) {
      for (const tag of agent.data.meta.tags) {
        this.addToTag(tag, agent);
      }
    }

    log.info('Agent registered in registry', {
      agentId: agent.id,
      agentName: agent.name,
      category: agent.data.meta?.category
    });
  }

  /**
   * إضافة وكيل إلى تصنيف
   * @param {string} category - التصنيف
   * @param {AIXAgent} agent - الوكيل
   */
  addToCategory(category, agent) {
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(agent.id);
  }

  /**
   * إضافة وكيل إلى علامة
   * @param {string} tag - العلامة
   * @param {AIXAgent} agent - الوكيل
   */
  addToTag(tag, agent) {
    if (!this.tags.has(tag)) {
      this.tags.set(tag, new Set());
    }
    this.tags.get(tag).add(agent.id);
  }

  /**
   * البحث عن وكيل
   * @param {string} query - استعلام البحث
   * @returns {Array<AIXAgent>} قائمة الوكلاء
   */
  searchAgents(query) {
    const results = [];
    const queryLower = query.toLowerCase();

    for (const [key, agentInfo] of this.agents) {
      const agent = agentInfo.agent;
      
      // البحث في الاسم والوصف
      if (agent.name.toLowerCase().includes(queryLower) ||
          agent.data.meta?.description?.toLowerCase().includes(queryLower)) {
        results.push(agent);
        continue;
      }

      // البحث في المهارات
      if (agent.data.skills) {
        for (const skill of agent.data.skills) {
          if (skill.name.toLowerCase().includes(queryLower) ||
              skill.description.toLowerCase().includes(queryLower)) {
            results.push(agent);
            break;
          }
        }
      }
    }

    return results;
  }

  /**
   * الحصول على وكلاء حسب التصنيف
   * @param {string} category - التصنيف
   * @returns {Array<AIXAgent>} قائمة الوكلاء
   */
  getAgentsByCategory(category) {
    const agentIds = this.categories.get(category) || new Set();
    const agents = [];

    for (const agentId of agentIds) {
      const agentInfo = this.agents.get(agentId);
      if (agentInfo) {
        agents.push(agentInfo.agent);
      }
    }

    return agents;
  }

  /**
   * الحصول على وكلاء حسب العلامة
   * @param {string} tag - العلامة
   * @returns {Array<AIXAgent>} قائمة الوكلاء
   */
  getAgentsByTag(tag) {
    const agentIds = this.tags.get(tag) || new Set();
    const agents = [];

    for (const agentId of agentIds) {
      const agentInfo = this.agents.get(agentId);
      if (agentInfo) {
        agents.push(agentInfo.agent);
      }
    }

    return agents;
  }

  /**
   * تحديث إحصائيات الاستخدام
   * @param {string} agentId - معرف الوكيل
   * @param {Object} metrics - المقاييس
   */
  updateUsage(agentId, metrics = {}) {
    const agentInfo = this.agents.get(agentId);
    if (agentInfo) {
      agentInfo.metadata.lastUsed = new Date().toISOString();
      agentInfo.metadata.usageCount++;
      
      // تحديث مقاييس الأداء
      if (!this.performance.has(agentId)) {
        this.performance.set(agentId, {
          totalCalls: 0,
          averageResponseTime: 0,
          successRate: 0,
          lastError: null
        });
      }

      const perf = this.performance.get(agentId);
      perf.totalCalls++;
      
      if (metrics.responseTime) {
        perf.averageResponseTime = 
          (perf.averageResponseTime * (perf.totalCalls - 1) + metrics.responseTime) / 
          perf.totalCalls;
      }

      if (metrics.success !== undefined) {
        const successCount = perf.successRate * (perf.totalCalls - 1) + (metrics.success ? 1 : 0);
        perf.successRate = successCount / perf.totalCalls;
      }

      if (metrics.error) {
        perf.lastError = {
          message: metrics.error,
          timestamp: new Date().toISOString()
        };
      }

      log.debug('Updated agent usage metrics', {
        agentId,
        usageCount: agentInfo.metadata.usageCount,
        performance: perf
      });
    }
  }

  /**
   * الحصول على إحصائيات الوكيل
   * @param {string} agentId - معرف الوكيل
   * @returns {Object} الإحصائيات
   */
  getAgentStats(agentId) {
    const agentInfo = this.agents.get(agentId);
    const perf = this.performance.get(agentId);

    if (!agentInfo) {
      return null;
    }

    return {
      agent: agentInfo.agent.getInfo(),
      metadata: agentInfo.metadata,
      performance: perf || {
        totalCalls: 0,
        averageResponseTime: 0,
        successRate: 0,
        lastError: null
      }
    };
  }

  /**
   * الحصول على إحصائيات عامة
   * @returns {Object} الإحصائيات العامة
   */
  getOverallStats() {
    const totalAgents = this.agents.size / 2; // مقسوم على 2 لأننا نسجل بالمعرف والاسم
    const categories = this.categories.size;
    const tags = this.tags.size;

    // حساب إحصائيات الأداء
    let totalCalls = 0;
    let totalResponseTime = 0;
    let totalSuccess = 0;

    for (const perf of this.performance.values()) {
      totalCalls += perf.totalCalls;
      totalResponseTime += perf.averageResponseTime * perf.totalCalls;
      totalSuccess += perf.successRate * perf.totalCalls;
    }

    const averageResponseTime = totalCalls > 0 ? totalResponseTime / totalCalls : 0;
    const overallSuccessRate = totalCalls > 0 ? totalSuccess / totalCalls : 0;

    return {
      totalAgents,
      categories,
      tags,
      totalCalls,
      averageResponseTime,
      overallSuccessRate,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * الحصول على الوكلاء الأكثر استخداماً
   * @param {number} limit - الحد الأقصى
   * @returns {Array<Object>} قائمة الوكلاء
   */
  getMostUsedAgents(limit = 10) {
    const agentStats = [];
    
    for (const [agentId, agentInfo] of this.agents) {
      // تجنب التكرار (نفس الوكيل مسجل بالمعرف والاسم)
      if (agentId === agentInfo.agent.id) {
        const perf = this.performance.get(agentId);
        agentStats.push({
          agent: agentInfo.agent.getInfo(),
          usageCount: agentInfo.metadata.usageCount,
          performance: perf
        });
      }
    }

    return agentStats
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * إزالة وكيل من السجل
   * @param {string} agentId - معرف الوكيل
   * @returns {boolean} نجح الحذف
   */
  unregisterAgent(agentId) {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) {
      return false;
    }

    const agent = agentInfo.agent;

    // إزالة من التصنيفات
    if (agent.data.meta?.category) {
      const categorySet = this.categories.get(agent.data.meta.category);
      if (categorySet) {
        categorySet.delete(agentId);
        if (categorySet.size === 0) {
          this.categories.delete(agent.data.meta.category);
        }
      }
    }

    // إزالة من العلامات
    if (agent.data.meta?.tags) {
      for (const tag of agent.data.meta.tags) {
        const tagSet = this.tags.get(tag);
        if (tagSet) {
          tagSet.delete(agentId);
          if (tagSet.size === 0) {
            this.tags.delete(tag);
          }
        }
      }
    }

    // إزالة من السجل الرئيسي
    this.agents.delete(agentId);
    this.agents.delete(agent.name);
    this.performance.delete(agentId);

    log.info('Agent unregistered from registry', {
      agentId,
      agentName: agent.name
    });

    return true;
  }

  /**
   * تنظيف السجل
   * @param {number} maxAge - العمر الأقصى بالدقائق
   */
  cleanup(maxAge = 60) {
    const cutoffTime = new Date(Date.now() - maxAge * 60 * 1000);
    let cleanedCount = 0;

    for (const [key, agentInfo] of this.agents) {
      const lastUsed = new Date(agentInfo.metadata.lastUsed || agentInfo.metadata.registeredAt);
      
      if (lastUsed < cutoffTime) {
        this.unregisterAgent(agentInfo.agent.id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      log.info('Registry cleanup completed', { cleanedCount });
    }
  }

  /**
   * تصدير السجل
   * @returns {Object} بيانات السجل
   */
  export() {
    const agents = [];
    
    for (const [agentId, agentInfo] of this.agents) {
      if (agentId === agentInfo.agent.id) {
        agents.push({
          agent: agentInfo.agent.getInfo(),
          metadata: agentInfo.metadata,
          performance: this.performance.get(agentId)
        });
      }
    }

    return {
      agents,
      categories: Array.from(this.categories.keys()),
      tags: Array.from(this.tags.keys()),
      stats: this.getOverallStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

module.exports = AIXRegistry;