/**
 * AgentDNA Service - Manages AI Agent DNA Profiles
 * Handles creation, retrieval, updates, and analytics
 */

const AgentDNA = require('./AgentDNAModel');
const redisService = require('../services/redis-service');
const logger = require('../utils/logger');

class AgentDNAService {
  constructor() {
    this.cachePrefix = 'agent-dna:';
    this.agentRegistry = new Map();
  }

  /**
   * Create a new agent with DNA profile
   */
  async createAgent(config) {
    try {
      const agent = new AgentDNA(config);
      
      // Calculate DNA Score
      agent.calculateDNAScore();
      
      // Generate System Prompt
      agent.generateSystemPrompt();
      
      // Store in memory
      this.agentRegistry.set(agent.id, agent);
      
      // Cache in Redis (24 hours)
      if (redisService.isConnected) {
        await redisService.set(
          `${this.cachePrefix}${agent.id}`,
          agent.toJSON(),
          86400
        );
      }
      
      logger.info(`✅ Created agent: ${agent.name} (DNA Score: ${agent.dnaScore})`);
      
      return agent;
    } catch (error) {
      logger.error('Failed to create agent:', error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId) {
    // Try memory first
    if (this.agentRegistry.has(agentId)) {
      return this.agentRegistry.get(agentId);
    }
    
    // Try Redis
    if (redisService.isConnected) {
      const cached = await redisService.get(`${this.cachePrefix}${agentId}`);
      if (cached) {
        const agent = AgentDNA.fromJSON(cached);
        this.agentRegistry.set(agentId, agent);
        return agent;
      }
    }
    
    return null;
  }

  /**
   * Update agent DNA
   */
  async updateAgent(agentId, updates) {
    const agent = await this.getAgent(agentId);
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Apply updates
    if (updates.name) agent.name = updates.name;
    if (updates.type) agent.type = updates.type;
    if (updates.specialization) agent.specialization = updates.specialization;
    if (updates.domainExpertise) agent.domainExpertise = updates.domainExpertise;
    
    if (updates.personality) Object.assign(agent.personality, updates.personality);
    if (updates.skills) Object.assign(agent.skills, updates.skills);
    if (updates.behavior) Object.assign(agent.behavior, updates.behavior);
    if (updates.aiModelConfig) Object.assign(agent.aiModelConfig, updates.aiModelConfig);
    
    // Recalculate DNA
    agent.calculateDNAScore();
    agent.generateSystemPrompt();
    agent.updatedAt = new Date().toISOString();
    
    // Save
    if (redisService.isConnected) {
      await redisService.set(
        `${this.cachePrefix}${agent.id}`,
        agent.toJSON(),
        86400
      );
    }
    
    logger.info(`🔄 Updated agent: ${agent.name} (DNA Score: ${agent.dnaScore})`);
    
    return agent;
  }

  /**
   * Get all agents
   */
  async getAllAgents() {
    return Array.from(this.agentRegistry.values());
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId) {
    this.agentRegistry.delete(agentId);
    
    if (redisService.isConnected) {
      await redisService.del(`${this.cachePrefix}${agentId}`);
    }
    
    logger.info(`🗑️ Deleted agent: ${agentId}`);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboard() {
    const agents = await this.getAllAgents();
    
    const stats = {
      totalAgents: agents.length,
      averageDNAScore: 0,
      specializations: {},
      performanceLevels: {},
      topPerformers: []
    };
    
    if (agents.length === 0) {
      return stats;
    }
    
    // Calculate average DNA score
    stats.averageDNAScore = Math.round(
      agents.reduce((sum, a) => sum + a.dnaScore, 0) / agents.length
    );
    
    // Count specializations
    agents.forEach(agent => {
      stats.specializations[agent.specialization] = 
        (stats.specializations[agent.specialization] || 0) + 1;
      
      stats.performanceLevels[agent.performance.level] =
        (stats.performanceLevels[agent.performance.level] || 0) + 1;
    });
    
    // Top performers
    stats.topPerformers = agents
      .sort((a, b) => b.performance.totalScore - a.performance.totalScore)
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        name: a.name,
        dnaScore: a.dnaScore,
        performanceScore: a.performance.totalScore,
        level: a.performance.level
      }));
    
    return stats;
  }

  /**
   * Update agent performance
   */
  async updatePerformance(agentId, metrics) {
    const agent = await this.getAgent(agentId);
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    agent.updatePerformance(metrics);
    
    // Save
    if (redisService.isConnected) {
      await redisService.set(
        `${this.cachePrefix}${agent.id}`,
        agent.toJSON(),
        86400
      );
    }
    
    logger.info(`📊 Updated performance for ${agent.name}: Level ${agent.performance.level}`);
    
    return agent;
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(type) {
    const agents = await this.getAllAgents();
    return agents.filter(a => a.type === type);
  }

  /**
   * Get agents by specialization
   */
  async getAgentsBySpecialization(specialization) {
    const agents = await this.getAllAgents();
    return agents.filter(a => a.specialization === specialization);
  }
}

// Singleton instance
const agentDNAService = new AgentDNAService();

module.exports = agentDNAService;

