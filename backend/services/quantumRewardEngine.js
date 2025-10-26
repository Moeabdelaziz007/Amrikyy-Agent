// ═══════════════════════════════════════════════════════════════
// 🌌 AMRIKYY QUANTUM REWARD ENGINE
// Advanced Multi-Agent Reinforcement Learning System
// ═══════════════════════════════════════════════════════════════

/**
 * @fileoverview Quantum Reward Engine
 * @module services/quantumRewardEngine
 * @description An advanced multi-agent reinforcement learning system that uses concepts
 * from quantum mechanics to model and reward agent behavior.
 */

// ═══════════════════════════════════════════════════════════════
// 📦 CORE QUANTUM REWARD ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * @class QuantumRewardEngine
 * @description Manages the state, rewards, and learning for a team of AI agents.
 */
class QuantumRewardEngine {
  /**
   * @constructor
   * @param {object} supabase - An instance of the Supabase client.
   */
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
        entanglements: []
      },
      karim: {
        id: 'karim',
        name: 'Karim - Budget Optimizer',
        role: 'BUDGET_ANALYSIS',
        capabilities: ['cost_calculation', 'savings_finder', 'budget_optimization'],
        energy: 100,
        rewards: 0,
        coherence: 90,
        entanglements: []
      },
      layla: {
        id: 'layla',
        name: 'Layla - Cultural Guide',
        role: 'CULTURAL_INSIGHTS',
        capabilities: ['cultural_advice', 'local_recommendations', 'language_assistance'],
        energy: 100,
        rewards: 0,
        coherence: 88,
        entanglements: []
      },
      amira: {
        id: 'amira',
        name: 'Amira - Problem Solver',
        role: 'SAFETY_SECURITY',
        capabilities: ['safety_checks', 'travel_warnings', 'health_advice'],
        energy: 100,
        rewards: 0,
        coherence: 92,
        entanglements: []
      },
      tariq: {
        id: 'tariq',
        name: 'Tariq - Payment Manager',
        role: 'PAYMENT_MANAGEMENT',
        capabilities: ['payment_processing', 'security_checks', 'transaction_optimization'],
        energy: 100,
        rewards: 0,
        coherence: 95,
        entanglements: []
      },
      zara: {
        id: 'zara',
        name: 'Zara - Research Specialist',
        role: 'RESEARCH_ANALYSIS',
        capabilities: ['fact_checking', 'data_analysis', 'information_verification'],
        energy: 100,
        rewards: 0,
        coherence: 93,
        entanglements: []
      },
      kody: {
        id: 'kody',
        name: 'Kody - Code Interpreter',
        role: 'DATA_PROCESSING',
        capabilities: ['code_execution', 'data_visualization', 'statistical_analysis'],
        energy: 100,
        rewards: 0,
        coherence: 89,
        entanglements: []
      },
      scout: {
        id: 'scout',
        name: 'Scout - Proactive Monitor',
        role: 'MONITORING_ALERTS',
        capabilities: ['price_monitoring', 'trend_analysis', 'proactive_alerts'],
        energy: 100,
        rewards: 0,
        coherence: 87,
        entanglements: []
      }
    };

    // Quantum state parameters
    this.quantumState = {
      globalCoherence: 88,
      entanglementStrength: 0.75,
      waveFunction: 1.0,
      superpositionActive: true
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
      LEADERSHIP: 35
    };

    // Learning parameters
    this.learningConfig = {
      learningRate: 0.1,
      explorationRate: 0.2,
      discountFactor: 0.9,
      batchSize: 32,
      memorySize: 10000
    };

    // Memory buffer for experiences
    this.experienceBuffer = [];
    this.maxBufferSize = 10000;

    // Initialize the system
    this.initializeSystem();
  }

  /**
   * Initializes the quantum reward system.
   * @async
   * @method initializeSystem
   */
  async initializeSystem() {
    try {
      console.log('🌌 Initializing Amrikyy Quantum Reward Engine...');
      
      // Load existing agent states from database
      await this.loadAgentStates();
      
      // Update quantum state
      this.updateQuantumState();
      
      console.log('✅ Quantum Reward Engine initialized successfully');
      console.log(`📊 Loaded ${Object.keys(this.agents).length} agents`);
      console.log(`🧠 Global coherence: ${this.quantumState.globalCoherence.toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Error initializing Quantum Reward Engine:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 CORE REWARD CALCULATION METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculates the immediate reward for an agent's action.
   * @param {string} agentId - The ID of the agent.
   * @param {string} action - The action performed by the agent.
   * @param {object} result - The result of the action.
   * @param {object} context - The context in which the action was performed.
   * @returns {number} The calculated immediate reward.
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

    return reward;
  }

  /**
   * Calculates the long-term reward based on a trajectory of actions.
   * @param {string} agentId - The ID of the agent.
   * @param {object} trajectory - The trajectory of actions.
   * @returns {number} The calculated long-term reward.
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
   * Calculates the collaborative reward for multi-agent interactions.
   * @param {string[]} agentIds - An array of agent IDs.
   * @param {object} collectiveResult - The result of the collaborative action.
   * @returns {object} An object mapping agent IDs to their rewards.
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
   * Calculates the quantum entanglement strength between two agents.
   * @param {string} agent1Id - The ID of the first agent.
   * @param {string} agent2Id - The ID of the second agent.
   * @param {object} interaction - The interaction between the agents.
   * @returns {number} The entanglement strength.
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
      baseStrength * interactionQuality * coherenceFactor * 
      this.quantumState.entanglementStrength;

    return Math.min(1.0, entanglementStrength);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 STATE UPDATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Updates the state of an agent after an action.
   * @async
   * @method updateAgentState
   * @param {string} agentId - The ID of the agent.
   * @param {string} action - The action performed.
   * @param {number} reward - The reward received.
   * @returns {Promise<object>} The updated agent state.
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
   * Updates the quantum entanglements between two agents.
   * @param {string} agent1Id - The ID of the first agent.
   * @param {string} agent2Id - The ID of the second agent.
   * @param {number} strength - The entanglement strength.
   */
  updateQuantumEntanglements(agent1Id, agent2Id, strength) {
    const agent1 = this.agents[agent1Id];
    const agent2 = this.agents[agent2Id];

    if (!agent1 || !agent2) return;

    // Add or update entanglement
    const entanglement = {
      targetAgent: agent2Id,
      strength: strength,
      lastUpdate: Date.now()
    };

    const existingIndex = agent1.entanglements.findIndex(
      e => e.targetAgent === agent2Id
    );

    if (existingIndex >= 0) {
      agent1.entanglements[existingIndex] = entanglement;
    } else {
      agent1.entanglements.push(entanglement);
    }

    // Reciprocal entanglement
    const reciprocalEntanglement = {
      targetAgent: agent1Id,
      strength: strength,
      lastUpdate: Date.now()
    };

    const reciprocalIndex = agent2.entanglements.findIndex(
      e => e.targetAgent === agent1Id
    );

    if (reciprocalIndex >= 0) {
      agent2.entanglements[reciprocalIndex] = reciprocalEntanglement;
    } else {
      agent2.entanglements.push(reciprocalEntanglement);
    }
  }

  /**
   * Updates the global quantum state of the system.
   * @method updateQuantumState
   */
  updateQuantumState() {
    // Calculate average coherence across all agents
    const agentList = Object.values(this.agents);
    const avgCoherence = agentList.reduce((sum, a) => sum + a.coherence, 0) / agentList.length;
    
    this.quantumState.globalCoherence = avgCoherence;

    // Calculate average entanglement strength
    let totalEntanglements = 0;
    let entanglementCount = 0;

    agentList.forEach(agent => {
      agent.entanglements.forEach(e => {
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
      this.quantumState.globalCoherence > 70 && 
      this.quantumState.entanglementStrength > 0.5;
  }

  /**
   * Calculates the energy variance across all agents.
   * @method calculateEnergyVariance
   * @returns {number} The energy variance.
   */
  calculateEnergyVariance() {
    const agentList = Object.values(this.agents);
    const avgEnergy = agentList.reduce((sum, a) => sum + a.energy, 0) / agentList.length;
    
    const variance = agentList.reduce((sum, a) => {
      return sum + Math.pow(a.energy - avgEnergy, 2);
    }, 0) / agentList.length;

    return variance;
  }

  // ═══════════════════════════════════════════════════════════════
  // 💾 DATABASE INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Stores the state of an agent in Supabase.
   * @async
   * @method storeAgentState
   * @param {string} agentId - The ID of the agent.
   * @param {object} agentData - The state data of the agent.
   * @returns {Promise<object|null>} The stored data or null on error.
   */
  async storeAgentState(agentId, agentData) {
    try {
      if (!this.supabase) {
        console.log('⚠️ Supabase not available, storing in memory only');
        return null;
      }

      const { data, error } = await this.supabase
        .from('agent_states')
        .upsert({
          agent_id: agentId,
          name: agentData.name,
          role: agentData.role,
          energy: agentData.energy,
          rewards: agentData.rewards,
          coherence: agentData.coherence,
          entanglements: agentData.entanglements,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'agent_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing agent state:', error);
      return null;
    }
  }

  /**
   * Stores an agent's experience in the buffer and database.
   * @async
   * @method storeExperience
   * @param {object} experience - The experience to store.
   * @returns {Promise<object|null>} The stored data or null on error.
   */
  async storeExperience(experience) {
    // Add to memory buffer
    this.experienceBuffer.push({
      ...experience,
      timestamp: Date.now()
    });

    // Maintain buffer size
    if (this.experienceBuffer.length > this.maxBufferSize) {
      this.experienceBuffer.shift();
    }

    // Store in database if Supabase is available
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agent_experiences')
          .insert({
            agent_id: experience.agentId,
            action: experience.action,
            reward: experience.reward,
            state_before: experience.stateBefore,
            state_after: experience.stateAfter,
            context: experience.context,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error storing experience:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Loads agent states from the database.
   * @async
   * @method loadAgentStates
   * @returns {Promise<object[]|null>} The loaded agent states or null on error.
   */
  async loadAgentStates() {
    try {
      if (!this.supabase) {
        console.log('⚠️ Supabase not available, using default agent states');
        return null;
      }

      const { data, error } = await this.supabase
        .from('agent_states')
        .select('*');

      if (error) throw error;

      // Update in-memory agents
      if (data && data.length > 0) {
        data.forEach(agentState => {
          if (this.agents[agentState.agent_id]) {
            this.agents[agentState.agent_id] = {
              ...this.agents[agentState.agent_id],
              ...agentState
            };
          }
        });
        console.log(`📥 Loaded ${data.length} agent states from database`);
      }

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
   * Optimizes the learning parameters for an agent based on performance.
   * @param {string} agentId - The ID of the agent.
   * @param {object} performanceMetrics - The performance metrics of the agent.
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
    this.learningConfig.learningRate = Math.max(0.01, Math.min(0.5, this.learningConfig.learningRate));
    this.learningConfig.explorationRate = Math.max(0.05, Math.min(0.5, this.learningConfig.explorationRate));
  }

  /**
   * Samples experiences from the buffer for batch learning.
   * @param {number} batchSize - The size of the batch to sample.
   * @returns {object[]} An array of sampled experiences.
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
   * Processes a user interaction and distributes rewards to the agents.
   * @async
   * @method processInteraction
   * @param {object} interaction - The user interaction data.
   * @returns {Promise<object>} The result of the interaction processing.
   */
  async processInteraction(interaction) {
    const {
      agentId,
      action,
      result,
      context,
      collaboratingAgents = []
    } = interaction;

    try {
      // Calculate immediate reward
      const immediateReward = this.calculateImmediateReward(
        agentId,
        action,
        result,
        context
      );

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
        collaboratingAgents.forEach(collabAgentId => {
          const strength = this.calculateQuantumEntanglement(
            agentId,
            collabAgentId,
            { quality: result.accuracy || 0.7 }
          );
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
        context
      });

      // Update quantum state
      this.updateQuantumState();

      console.log(`🎯 Processed interaction for ${agentId}: ${immediateReward} points`);

      return {
        agentId,
        reward: immediateReward,
        agentState: this.agents[agentId],
        quantumState: this.quantumState
      };

    } catch (error) {
      console.error('Error processing interaction:', error);
      return {
        agentId,
        reward: 0,
        error: error.message
      };
    }
  }

  /**
   * Recommends agents for a given task.
   * @param {string} taskType - The type of the task.
   * @param {object} taskContext - The context of the task.
   * @returns {object[]} An array of recommended agents.
   */
  recommendAgentsForTask(taskType, taskContext) {
    const agentList = Object.values(this.agents);

    // Score agents based on capabilities and energy
    const scoredAgents = agentList.map(agent => {
      let score = 0;

      // Capability match
      const capabilityMatch = agent.capabilities.some(cap => 
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

    return scoredAgents.slice(0, 3).map(sa => sa.agent);
  }

  /**
   * Gets the health metrics of the system.
   * @returns {object} The system health metrics.
   */
  getSystemMetrics() {
    const agentList = Object.values(this.agents);

    return {
      agents: agentList.map(agent => ({
        id: agent.id,
        name: agent.name,
        energy: agent.energy,
        rewards: agent.rewards,
        coherence: agent.coherence,
        entanglementCount: agent.entanglements.length
      })),
      quantum: {
        globalCoherence: this.quantumState.globalCoherence,
        entanglementStrength: this.quantumState.entanglementStrength,
        waveFunction: this.quantumState.waveFunction,
        superpositionActive: this.quantumState.superpositionActive
      },
      learning: {
        learningRate: this.learningConfig.learningRate,
        explorationRate: this.learningConfig.explorationRate,
        experienceBufferSize: this.experienceBuffer.length
      },
      totalRewards: agentList.reduce((sum, a) => sum + a.rewards, 0),
      avgEnergy: agentList.reduce((sum, a) => sum + a.energy, 0) / agentList.length,
      avgCoherence: agentList.reduce((sum, a) => sum + a.coherence, 0) / agentList.length
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🚀 EXPRESS MIDDLEWARE & ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * Creates Express routes for the reward engine.
 * @param {object} app - The Express app instance.
 * @param {QuantumRewardEngine} rewardEngine - The instance of the QuantumRewardEngine.
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
        collaboratingAgents
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
      
      const recommendations = rewardEngine.recommendAgentsForTask(
        taskType,
        taskContext
      );

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
          error: 'Agent not found' 
        });
      }

      res.json({ success: true, data: agent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get system health
  app.get('/api/rewards/health', async (req, res) => {
    try {
      const metrics = rewardEngine.getSystemMetrics();
      const health = {
        status: 'healthy',
        quantumCoherence: metrics.quantum.globalCoherence,
        entanglementStrength: metrics.quantum.entanglementStrength,
        totalAgents: metrics.agents.length,
        totalRewards: metrics.totalRewards,
        avgEnergy: metrics.avgEnergy,
        avgCoherence: metrics.avgCoherence,
        timestamp: new Date().toISOString()
      };

      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
};

module.exports = { QuantumRewardEngine, createRewardRoutes };
