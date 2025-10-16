// ═══════════════════════════════════════════════════════════════
// 🤖 AIX REWARD INTEGRATION
// Integration between AIX agents and Quantum Reward Engine
// ═══════════════════════════════════════════════════════════════

class AIXRewardIntegration {
  constructor(rewardIntegration) {
    this.rewardIntegration = rewardIntegration;
  }

  /**
   * Process AIX agent task completion
   */
  async processAgentTaskCompletion(agentId, task, result) {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      console.warn('⚠️ Reward Engine not available, skipping reward processing');
      return null;
    }

    try {
      const action = {
        type: 'AIX_TASK_COMPLETION',
        task: task,
        agentId: agentId,
        timestamp: Date.now()
      };

      const rewardResult = {
        accuracy: result.success ? 0.9 : 0.3,
        responseTime: result.executionTime || 1000,
        userRating: result.quality || 4,
        tokensUsed: result.tokensUsed || 0,
        taskCompleted: result.success || false
      };

      const context = {
        platform: 'aix',
        taskType: task.type || 'general',
        complexity: task.complexity || 'medium'
      };

      const reward = await this.rewardIntegration.processAIXInteraction(
        agentId, action, rewardResult, context
      );

      console.log(`🎯 AIX Agent ${agentId} earned ${reward?.reward || 0} points for task: ${task.type}`);
      return reward;
    } catch (error) {
      console.error(`❌ Error processing AIX reward for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Process AIX agent collaboration
   */
  async processAgentCollaboration(primaryAgent, collaborators, task, result) {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      return null;
    }

    try {
      const reward = await this.rewardIntegration.processCollaboration(
        primaryAgent, collaborators, task, result
      );

      console.log(`🤝 AIX Collaboration reward processed for ${primaryAgent} and ${collaborators.join(', ')}`);
      return reward;
    } catch (error) {
      console.error('❌ Error processing AIX collaboration reward:', error);
      return null;
    }
  }

  /**
   * Process AIX agent learning improvement
   */
  async processAgentLearning(agentId, performanceMetrics) {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      return null;
    }

    try {
      const action = {
        type: 'AIX_LEARNING_IMPROVEMENT',
        metrics: performanceMetrics,
        timestamp: Date.now()
      };

      const result = {
        accuracy: performanceMetrics.accuracy || 0.8,
        performanceImprovement: performanceMetrics.improvement || 0.1,
        consistencyScore: performanceMetrics.consistency || 0.85,
        novelSolution: performanceMetrics.innovation || false
      };

      const context = {
        platform: 'aix',
        learningType: 'performance_improvement'
      };

      const reward = await this.rewardIntegration.processAIXInteraction(
        agentId, action, result, context
      );

      console.log(`🧠 AIX Agent ${agentId} learning reward: ${reward?.reward || 0} points`);
      return reward;
    } catch (error) {
      console.error(`❌ Error processing AIX learning reward for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Get recommended agents for AIX task
   */
  getRecommendedAgents(taskType, taskContext) {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      return [];
    }

    return this.rewardIntegration.getAgentRecommendations(taskType, taskContext);
  }

  /**
   * Get AIX system health
   */
  getSystemHealth() {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      return { error: 'Reward Engine not initialized' };
    }

    return this.rewardIntegration.getSystemMetrics();
  }

  /**
   * Get specific AIX agent state
   */
  getAgentState(agentId) {
    if (!this.rewardIntegration || !this.rewardIntegration.initialized) {
      return null;
    }

    return this.rewardIntegration.getAgentState(agentId);
  }
}

module.exports = { AIXRewardIntegration };
