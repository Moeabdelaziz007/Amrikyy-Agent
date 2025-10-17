// ═══════════════════════════════════════════════════════════════
// 🌌 AMRIKYY QUANTUM REWARD ENGINE
// Advanced Multi-Agent Reinforcement Learning System
// ═══════════════════════════════════════════════════════════════

/**
 * INSTALLATION:
 * 1. Create file: backend/src/reward/QuantumRewardEngine.js
 * 2. Install dependencies: npm install
 * 3. Import in backend/index.js
 * 4. Initialize with Supabase client
 */

// ═══════════════════════════════════════════════════════════════
// 📦 CORE QUANTUM REWARD ENGINE
// ═══════════════════════════════════════════════════════════════

class QuantumRewardEngine {
  constructor(supabase) {
    this.supabase = supabase;

    // Agent definitions matching your Amrikyy system
    this.agents = {
      luna: {
        id: 'luna',
        name: 'Luna - Trip Architect',
        role: 'TRIP_PLANNING',
        capabilities: ['itinerary_creation', 'destination_research', 'route_optimization'],
        energy: 100,
        rewards: 0,
        coherence: 85,
        entanglements: [],
      },
      karim: {
        id: 'karim',
        name: 'Karim - Budget Optimizer',
        role: 'BUDGET_ANALYSIS',
        capabilities: ['cost_calculation', 'savings_finder', 'budget_optimization'],
        energy: 100,
        rewards: 0,
        coherence: 90,
        entanglements: [],
      },
      layla: {
        id: 'layla',
        name: 'Layla - Cultural Guide',
        role: 'CULTURAL_INSIGHTS',
        capabilities: ['cultural_advice', 'local_recommendations', 'language_assistance'],
        energy: 100,
        rewards: 0,
        coherence: 88,
        entanglements: [],
      },
      amir: {
        id: 'amir',
        name: 'Amir - Safety Advisor',
        role: 'SAFETY_SECURITY',
        capabilities: ['safety_checks', 'travel_warnings', 'health_advice'],
        energy: 100,
        rewards: 0,
        coherence: 92,
        entanglements: [],
      },
      sara: {
        id: 'sara',
        name: 'Sara - Experience Curator',
        role: 'EXPERIENCE_DESIGN',
        capabilities: ['activity_recommendations', 'booking_assistance', 'personalization'],
        energy: 100,
        rewards: 0,
        coherence: 87,
        entanglements: [],
      },
      kody: {
        id: 'kody',
        name: 'Kody - Marketing Automation',
        role: 'MARKETING_ANALYSIS',
        capabilities: ['market_research', 'content_analysis', 'trend_detection', 'automation'],
        energy: 100,
        rewards: 0,
        coherence: 89,
        entanglements: [],
      },
    };

    // Quantum state parameters
    this.quantumState = {
      globalCoherence: 88,
      entanglementStrength: 0.75,
      waveFunction: 1.0,
      superpositionActive: true,
    };

    // Reward parameters
    this.rewardConfig = {
      // Immediate rewards
      ACCURATE_RESPONSE: 15,
      FAST_RESPONSE: 10,
      USER_SATISFACTION: 25,
      RESOURCE_EFFICIENCY: 8,

      // Long-term rewards
      TASK_COMPLETION: 50,
      LEARNING_IMPROVEMENT: 20,
      INNOVATION_BONUS: 30,
      CONSISTENCY_BONUS: 25,

      // Collaborative rewards
      SUCCESSFUL_COORDINATION: 40,
      CONFLICT_RESOLUTION: 30,
      KNOWLEDGE_SHARING: 25,
      LEADERSHIP: 35,

      // Marketing-specific rewards
      MARKETING_INSIGHT: 20,
      CAMPAIGN_SUCCESS: 45,
      DATA_ANALYSIS: 15,
      AUTOMATION_EFFICIENCY: 25,
    };

    // Learning parameters
    this.learningConfig = {
      learningRate: 0.1,
      explorationRate: 0.2,
      discountFactor: 0.9,
      batchSize: 32,
      memorySize: 10000,
    };

    // Memory buffer for experiences
    this.experienceBuffer = [];
    this.maxBufferSize = 10000;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 CORE REWARD CALCULATION METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculate immediate reward for agent action
   */
  calculateImmediateReward(agentId, action, result, context) {
    const agent = this.agents[agentId];
    if (!agent) return 0;
    let reward = 0;

    // Accuracy reward
    if (result.accuracy && result.accuracy > 0.8) {
      reward += this.rewardConfig.ACCURATE_RESPONSE;
    }

    // Speed reward
    if (result.responseTime && result.responseTime < 2000) {
      reward += this.rewardConfig.FAST_RESPONSE;
    }

    // User satisfaction reward
    if (result.userRating && result.userRating >= 4) {
      reward += this.rewardConfig.USER_SATISFACTION;
    }

    // Resource efficiency reward
    if (result.tokensUsed && result.tokensUsed < 1000) {
      reward += this.rewardConfig.RESOURCE_EFFICIENCY;
    }

    // Marketing-specific rewards
    if (agentId === 'kody') {
      if (result.marketingInsights) {
        reward += this.rewardConfig.MARKETING_INSIGHT;
      }
      if (result.campaignSuccess) {
        reward += this.rewardConfig.CAMPAIGN_SUCCESS;
      }
      if (result.dataAnalysis) {
        reward += this.rewardConfig.DATA_ANALYSIS;
      }
      if (result.automationEfficiency) {
        reward += this.rewardConfig.AUTOMATION_EFFICIENCY;
      }
    }

    return reward;
  }

  /**
   * Calculate long-term reward based on trajectory
   */
  calculateLongTermReward(agentId, trajectory) {
    const agent = this.agents[agentId];
    if (!agent) return 0;
    let reward = 0;

    // Task completion reward
    if (trajectory.taskCompleted) {
      reward += this.rewardConfig.TASK_COMPLETION;
    }

    // Learning improvement reward
    if (trajectory.performanceImprovement > 0.1) {
      reward += this.rewardConfig.LEARNING_IMPROVEMENT;
    }

    // Innovation reward
    if (trajectory.novelSolution) {
      reward += this.rewardConfig.INNOVATION_BONUS;
    }

    // Consistency reward
    if (trajectory.consistencyScore > 0.85) {
      reward += this.rewardConfig.CONSISTENCY_BONUS;
    }

    return reward * this.learningConfig.discountFactor;
  }

  /**
   * Calculate collaborative reward for multi-agent interactions
   */
  calculateCollaborativeReward(agentIds, collectiveResult) {
    let reward = 0;

    // Successful coordination reward
    if (collectiveResult.coordinationSuccess) {
      reward += this.rewardConfig.SUCCESSFUL_COORDINATION;
    }

    // Conflict resolution reward
    if (collectiveResult.conflictsResolved > 0) {
      reward += this.rewardConfig.CONFLICT_RESOLUTION * collectiveResult.conflictsResolved;
    }

    // Knowledge sharing reward
    if (collectiveResult.knowledgeShared) {
      reward += this.rewardConfig.KNOWLEDGE_SHARING;
    }

    // Leadership reward
    if (collectiveResult.leaderAgent) {
      const leaderBonus = this.rewardConfig.LEADERSHIP;
      return { [collectiveResult.leaderAgent]: reward + leaderBonus };
    }

    // Distribute reward equally among agents
    const rewardPerAgent = reward / agentIds.length;
    return agentIds.reduce((acc, id) => {
      acc[id] = rewardPerAgent;
      return acc;
    }, {});
  }

  /**
   * Calculate quantum entanglement strength between agents
   */
  calculateQuantumEntanglement(agent1Id, agent2Id, interaction) {
    const agent1 = this.agents[agent1Id];
    const agent2 = this.agents[agent2Id];
    if (!agent1 || !agent2) return 0;

    // Calculate entanglement based on interaction quality
    const baseStrength = 0.5;
    const interactionQuality = interaction.quality || 0.5;
    const coherenceFactor = (agent1.coherence + agent2.coherence) / 200;
    const entanglementStrength =
      baseStrength * interactionQuality * coherenceFactor * this.quantumState.entanglementStrength;

    return Math.min(1.0, entanglementStrength);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 STATE UPDATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update agent state after action
   */
  async updateAgentState(agentId, action, reward) {
    const agent = this.agents[agentId];
    if (!agent) return;

    // Update rewards
    agent.rewards += reward;

    // Update energy (quantum wave function collapse)
    const energyDelta = reward > 0 ? 5 : -3;
    agent.energy = Math.max(0, Math.min(100, agent.energy + energyDelta));

    // Update coherence
    const coherenceDelta = reward > 20 ? 2 : -1;
    agent.coherence = Math.max(0, Math.min(100, agent.coherence + coherenceDelta));

    // Store in database
    await this.storeAgentState(agentId, agent);
    return agent;
  }

  /**
   * Update quantum entanglements between agents
   */
  updateQuantumEntanglements(agent1Id, agent2Id, strength) {
    const agent1 = this.agents[agent1Id];
    const agent2 = this.agents[agent2Id];
    if (!agent1 || !agent2) return;

    // Add or update entanglement
    const entanglement = {
      targetAgent: agent2Id,
      strength: strength,
      lastUpdate: Date.now(),
    };

    const existingIndex = agent1.entanglements.findIndex((e) => e.targetAgent === agent2Id);
    if (existingIndex >= 0) {
      agent1.entanglements[existingIndex] = entanglement;
    } else {
      agent1.entanglements.push(entanglement);
    }

    // Reciprocal entanglement
    const reciprocalEntanglement = {
      targetAgent: agent1Id,
      strength: strength,
      lastUpdate: Date.now(),
    };

    const reciprocalIndex = agent2.entanglements.findIndex((e) => e.targetAgent === agent1Id);
    if (reciprocalIndex >= 0) {
      agent2.entanglements[reciprocalIndex] = reciprocalEntanglement;
    } else {
      agent2.entanglements.push(reciprocalEntanglement);
    }
  }

  /**
   * Update global quantum state
   */
  updateQuantumState() {
    // Calculate average coherence across all agents
    const agentList = Object.values(this.agents);
    const avgCoherence = agentList.reduce((sum, a) => sum + a.coherence, 0) / agentList.length;

    this.quantumState.globalCoherence = avgCoherence;

    // Calculate average entanglement strength
    let totalEntanglements = 0;
    let entanglementCount = 0;
    agentList.forEach((agent) => {
      agent.entanglements.forEach((e) => {
        totalEntanglements += e.strength;
        entanglementCount++;
      });
    });

    if (entanglementCount > 0) {
      this.quantumState.entanglementStrength = totalEntanglements / entanglementCount;
    }

    // Update wave function (stability measure)
    const energyVariance = this.calculateEnergyVariance();
    this.quantumState.waveFunction = Math.exp(-energyVariance / 100);

    // Check superposition state
    this.quantumState.superpositionActive =
      this.quantumState.globalCoherence > 70 && this.quantumState.entanglementStrength > 0.5;
  }

  /**
   * Calculate energy variance across agents
   */
  calculateEnergyVariance() {
    const agentList = Object.values(this.agents);
    const avgEnergy = agentList.reduce((sum, a) => sum + a.energy, 0) / agentList.length;

    const variance =
      agentList.reduce((sum, a) => {
        return sum + Math.pow(a.energy - avgEnergy, 2);
      }, 0) / agentList.length;

    return variance;
  }

  // ═══════════════════════════════════════════════════════════════
  // 💾 DATABASE INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Store agent state in Supabase
   */
  async storeAgentState(agentId, agentData) {
    try {
      const { data, error } = await this.supabase.from('agent_states').upsert(
        {
          agent_id: agentId,
          name: agentData.name,
          role: agentData.role,
          energy: agentData.energy,
          rewards: agentData.rewards,
          coherence: agentData.coherence,
          entanglements: agentData.entanglements,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'agent_id',
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing agent state:', error);
      return null;
    }
  }

  /**
   * Store experience in buffer and database
   */
  async storeExperience(experience) {
    // Add to memory buffer
    this.experienceBuffer.push({
      ...experience,
      timestamp: Date.now(),
    });

    // Maintain buffer size
    if (this.experienceBuffer.length > this.maxBufferSize) {
      this.experienceBuffer.shift();
    }

    // Store in database
    try {
      const { data, error } = await this.supabase.from('agent_experiences').insert({
        agent_id: experience.agentId,
        action: experience.action,
        reward: experience.reward,
        state_before: experience.stateBefore,
        state_after: experience.stateAfter,
        context: experience.context,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing experience:', error);
      return null;
    }
  }

  /**
   * Load agent states from database
   */
  async loadAgentStates() {
    try {
      const { data, error } = await this.supabase.from('agent_states').select('*');
      if (error) throw error;

      // Update in-memory agents
      data.forEach((agentState) => {
        if (this.agents[agentState.agent_id]) {
          this.agents[agentState.agent_id] = {
            ...this.agents[agentState.agent_id],
            ...agentState,
          };
        }
      });

      return data;
    } catch (error) {
      console.error('Error loading agent states:', error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧠 ADAPTIVE LEARNING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Optimize learning parameters based on performance
   */
  optimizeLearningParameters(agentId, performanceMetrics) {
    const agent = this.agents[agentId];
    if (!agent) return;

    const avgReward = performanceMetrics.avgReward || 0;
    const successRate = performanceMetrics.successRate || 0;

    // Adjust learning rate
    if (successRate > 0.8) {
      this.learningConfig.learningRate *= 0.95; // Decrease (exploit)
      this.learningConfig.explorationRate *= 0.9; // Decrease exploration
    } else if (successRate < 0.5) {
      this.learningConfig.learningRate *= 1.05; // Increase (learn faster)
      this.learningConfig.explorationRate *= 1.1; // Increase exploration
    }

    // Keep within bounds
    this.learningConfig.learningRate = Math.max(
      0.01,
      Math.min(0.5, this.learningConfig.learningRate)
    );
    this.learningConfig.explorationRate = Math.max(
      0.05,
      Math.min(0.5, this.learningConfig.explorationRate)
    );
  }

  /**
   * Sample experiences for batch learning
   */
  sampleExperiences(batchSize) {
    if (this.experienceBuffer.length < batchSize) {
      return this.experienceBuffer;
    }

    // Random sampling
    const sampled = [];
    const indices = new Set();
    while (sampled.length < batchSize) {
      const idx = Math.floor(Math.random() * this.experienceBuffer.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        sampled.push(this.experienceBuffer[idx]);
      }
    }

    return sampled;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎮 HIGH-LEVEL API FOR AMRIKYY INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Process user interaction and distribute rewards
   */
  async processInteraction(interaction) {
    const { agentId, action, result, context, collaboratingAgents = [] } = interaction;

    // Calculate immediate reward
    const immediateReward = this.calculateImmediateReward(agentId, action, result, context);

    // Update primary agent
    await this.updateAgentState(agentId, action, immediateReward);

    // Handle collaborative rewards
    if (collaboratingAgents.length > 0) {
      const collaborativeRewards = this.calculateCollaborativeReward(
        [agentId, ...collaboratingAgents],
        result
      );

      for (const [collabAgentId, reward] of Object.entries(collaborativeRewards)) {
        await this.updateAgentState(collabAgentId, action, reward);
      }

      // Update entanglements
      collaboratingAgents.forEach((collabAgentId) => {
        const strength = this.calculateQuantumEntanglement(agentId, collabAgentId, {
          quality: result.accuracy || 0.7,
        });
        this.updateQuantumEntanglements(agentId, collabAgentId, strength);
      });
    }

    // Store experience
    await this.storeExperience({
      agentId,
      action,
      reward: immediateReward,
      stateBefore: { ...this.agents[agentId] },
      stateAfter: { ...this.agents[agentId] },
      context,
    });

    // Update quantum state
    this.updateQuantumState();

    return {
      agentId,
      reward: immediateReward,
      agentState: this.agents[agentId],
      quantumState: this.quantumState,
    };
  }

  /**
   * Get agent recommendations for task
   */
  recommendAgentsForTask(taskType, taskContext) {
    const agentList = Object.values(this.agents);

    // Score agents based on capabilities and energy
    const scoredAgents = agentList.map((agent) => {
      let score = 0;

      // Capability match
      const capabilityMatch = agent.capabilities.some((cap) =>
        taskContext.requiredCapabilities?.includes(cap)
      );
      if (capabilityMatch) score += 50;

      // Energy level
      score += agent.energy * 0.3;

      // Coherence
      score += agent.coherence * 0.2;

      return { agent, score };
    });

    // Sort by score
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents.slice(0, 3).map((sa) => sa.agent);
  }

  /**
   * Get system health metrics
   */
  getSystemMetrics() {
    const agentList = Object.values(this.agents);

    return {
      agents: agentList.map((agent) => ({
        id: agent.id,
        name: agent.name,
        energy: agent.energy,
        rewards: agent.rewards,
        coherence: agent.coherence,
        entanglementCount: agent.entanglements.length,
      })),
      quantum: {
        globalCoherence: this.quantumState.globalCoherence,
        entanglementStrength: this.quantumState.entanglementStrength,
        waveFunction: this.quantumState.waveFunction,
        superpositionActive: this.quantumState.superpositionActive,
      },
      learning: {
        learningRate: this.learningConfig.learningRate,
        explorationRate: this.learningConfig.explorationRate,
        experienceBufferSize: this.experienceBuffer.length,
      },
      totalRewards: agentList.reduce((sum, a) => sum + a.rewards, 0),
      avgEnergy: agentList.reduce((sum, a) => sum + a.energy, 0) / agentList.length,
      avgCoherence: agentList.reduce((sum, a) => sum + a.coherence, 0) / agentList.length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🚀 EXPRESS MIDDLEWARE & ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize reward engine middleware
 * Add to backend/index.js:
 *
 * const QuantumRewardEngine = require('./src/reward/QuantumRewardEngine');
 * const rewardEngine = new QuantumRewardEngine(supabase);
 * app.use((req, res, next) => {
 *   req.rewardEngine = rewardEngine;
 *   next();
 * });
 */

/**
 * Example Express Routes
 */
const createRewardRoutes = (app, rewardEngine) => {
  // Get system metrics
  app.get('/api/rewards/metrics', async (req, res) => {
    try {
      const metrics = rewardEngine.getSystemMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Process interaction and award rewards
  app.post('/api/rewards/process', async (req, res) => {
    try {
      const { agentId, action, result, context, collaboratingAgents } = req.body;

      const rewardResult = await rewardEngine.processInteraction({
        agentId,
        action,
        result,
        context,
        collaboratingAgents,
      });

      res.json({ success: true, data: rewardResult });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent recommendations
  app.post('/api/rewards/recommend', async (req, res) => {
    try {
      const { taskType, taskContext } = req.body;

      const recommendations = rewardEngine.recommendAgentsForTask(taskType, taskContext);

      res.json({ success: true, data: recommendations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get specific agent state
  app.get('/api/rewards/agent/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = rewardEngine.agents[agentId];

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
        });
      }

      res.json({ success: true, data: agent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
};

module.exports = { QuantumRewardEngine, createRewardRoutes };
