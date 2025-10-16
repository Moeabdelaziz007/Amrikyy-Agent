// ═══════════════════════════════════════════════════════════════
// 🔗 REWARD ENGINE INTEGRATION
// Integration layer for Quantum Reward Engine with Amrikyy system
// ═══════════════════════════════════════════════════════════════

const { QuantumRewardEngine } = require('./QuantumRewardEngine');

class RewardIntegration {
  constructor(supabase) {
    this.rewardEngine = new QuantumRewardEngine(supabase);
    this.initialized = false;
  }

  /**
   * Initialize the reward engine
   */
  async initialize() {
    try {
      // Load existing agent states from database
      await this.rewardEngine.loadAgentStates();
      this.initialized = true;
      console.log('✅ Quantum Reward Engine initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Reward Engine:', error);
      return false;
    }
  }

  /**
   * Process AIX agent interaction
   */
  async processAIXInteraction(agentId, action, result, context = {}) {
    if (!this.initialized) {
      console.warn('⚠️ Reward Engine not initialized, skipping reward processing');
      return null;
    }

    try {
      const rewardResult = await this.rewardEngine.processInteraction({
        agentId,
        action,
        result,
        context,
        collaboratingAgents: context.collaboratingAgents || []
      });

      console.log(`🎯 Reward processed for ${agentId}: +${rewardResult.reward} points`);
      return rewardResult;
    } catch (error) {
      console.error('❌ Error processing reward:', error);
      return null;
    }
  }

  /**
   * Process Telegram bot interaction
   */
  async processTelegramInteraction(message, response, agentId = 'luna') {
    if (!this.initialized) return null;

    const action = {
      type: 'TELEGRAM_RESPONSE',
      message: message.text,
      chatId: message.chat.id
    };

    const result = {
      accuracy: response.success ? 0.9 : 0.3,
      responseTime: Date.now() - message.date * 1000,
      userRating: response.quality || 4,
      tokensUsed: response.tokensUsed || 0
    };

    const context = {
      platform: 'telegram',
      userId: message.from.id,
      chatId: message.chat.id,
      language: message.language_code || 'en'
    };

    return await this.processAIXInteraction(agentId, action, result, context);
  }

  /**
   * Process voice interaction
   */
  async processVoiceInteraction(transcript, response, agentId = 'luna') {
    if (!this.initialized) return null;

    const action = {
      type: 'VOICE_RESPONSE',
      transcript: transcript,
      language: response.language || 'ar-EG'
    };

    const result = {
      accuracy: response.accuracy || 0.85,
      responseTime: response.responseTime || 1500,
      userRating: response.satisfaction || 4,
      tokensUsed: response.tokensUsed || 0
    };

    const context = {
      platform: 'voice',
      modality: 'speech',
      language: response.language || 'ar-EG'
    };

    return await this.processAIXInteraction(agentId, action, result, context);
  }

  /**
   * Process multi-agent collaboration
   */
  async processCollaboration(primaryAgent, collaboratingAgents, task, result) {
    if (!this.initialized) return null;

    const action = {
      type: 'COLLABORATION',
      task: task,
      primaryAgent: primaryAgent,
      collaborators: collaboratingAgents
    };

    const rewardResult = {
      coordinationSuccess: result.success || false,
      conflictsResolved: result.conflictsResolved || 0,
      knowledgeShared: result.knowledgeShared || false,
      leaderAgent: primaryAgent
    };

    const context = {
      collaborationType: 'multi_agent',
      taskComplexity: task.complexity || 'medium'
    };

    return await this.rewardEngine.processInteraction({
      agentId: primaryAgent,
      action,
      result: rewardResult,
      context,
      collaboratingAgents
    });
  }

  /**
   * Get system health and metrics
   */
  getSystemMetrics() {
    if (!this.initialized) {
      return { error: 'Reward Engine not initialized' };
    }
    return this.rewardEngine.getSystemMetrics();
  }

  /**
   * Get agent recommendations for a task
   */
  getAgentRecommendations(taskType, taskContext) {
    if (!this.initialized) return [];
    return this.rewardEngine.recommendAgentsForTask(taskType, taskContext);
  }

  /**
   * Get specific agent state
   */
  getAgentState(agentId) {
    if (!this.initialized) return null;
    return this.rewardEngine.agents[agentId] || null;
  }

  /**
   * Force update agent state (for testing/debugging)
   */
  async forceUpdateAgent(agentId, updates) {
    if (!this.initialized) return false;
    
    const agent = this.rewardEngine.agents[agentId];
    if (!agent) return false;

    Object.assign(agent, updates);
    await this.rewardEngine.storeAgentState(agentId, agent);
    return true;
  }

  /**
   * Reset all agent states (for testing)
   */
  async resetAllAgents() {
    if (!this.initialized) return false;

    const agentIds = Object.keys(this.rewardEngine.agents);
    for (const agentId of agentIds) {
      const agent = this.rewardEngine.agents[agentId];
      agent.energy = 100;
      agent.rewards = 0;
      agent.coherence = 85 + Math.random() * 15; // Random between 85-100
      agent.entanglements = [];
      await this.rewardEngine.storeAgentState(agentId, agent);
    }

    this.rewardEngine.updateQuantumState();
    return true;
  }
}

module.exports = { RewardIntegration };
