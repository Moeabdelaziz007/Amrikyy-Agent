/**
 * DNA Scoring System for AI Agents
 * 
 * Novel innovation by Mohamed Abdelaziz
 * First published: October 12, 2024
 * 
 * This system provides quantitative measurement of AI agent capabilities
 * through multi-dimensional scoring that combines:
 * - DNA Potential Score: Inherent capabilities based on configuration
 * - Performance Score: Actual runtime results
 * - Total Score: Combined capability assessment
 * - Level Classification: Novice → Master progression
 */

const { logger } = require('../utils/logger');

// Create logger for DNA Scoring System
const log = logger.child('DNAscoringSystem');

/**
 * DNA Scoring System Class
 * Implements the revolutionary DNA scoring algorithm for AI agents
 */
class DNAscoringSystem {
  constructor() {
    this.levels = {
      NOVICE: { min: 0, max: 20, description: 'Basic capabilities, limited autonomy' },
      APPRENTICE: { min: 21, max: 40, description: 'Growing skills, supervised operation' },
      COMPETENT: { min: 41, max: 60, description: 'Reliable performance, moderate autonomy' },
      EXPERT: { min: 61, max: 80, description: 'Advanced capabilities, high autonomy' },
      MASTER: { min: 81, max: 100, description: 'Exceptional performance, full autonomy' }
    };
    
    log.info('DNA Scoring System initialized');
  }

  /**
   * Calculate DNA Potential Score
   * @param {Object} agentConfig - Agent configuration object
   * @returns {number} DNA Potential Score (0-100)
   */
  calculateDNAPotential(agentConfig) {
    try {
      // Check if agentConfig is valid
      if (!agentConfig || typeof agentConfig !== 'object') {
        return 0;
      }
      
      // Personality Strength (25% weight)
      const personalityStrength = this.calculatePersonalityStrength(agentConfig);
      
      // Skill Proficiency (35% weight)
      const skillProficiency = this.calculateSkillProficiency(agentConfig);
      
      // Domain Expertise (25% weight)
      const domainExpertise = this.calculateDomainExpertise(agentConfig);
      
      // Adaptability (15% weight)
      const adaptability = this.calculateAdaptability(agentConfig);
      
      // Calculate weighted DNA Potential
      const dnaPotential = (
        personalityStrength * 0.25 +
        skillProficiency * 0.35 +
        domainExpertise * 0.25 +
        adaptability * 0.15
      ) * 100;
      
      log.debug('DNA Potential calculated', {
        personalityStrength,
        skillProficiency,
        domainExpertise,
        adaptability,
        dnaPotential
      });
      
      return Math.round(dnaPotential * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      log.error('Error calculating DNA Potential', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate Personality Strength
   * @param {Object} agentConfig - Agent configuration
   * @returns {number} Personality strength (0-1)
   */
  calculatePersonalityStrength(agentConfig) {
    const traits = agentConfig.identity?.traits || [];
    const personalityTraits = agentConfig.interaction?.personality_traits || {};
    
    // Base score from traits
    let traitScore = 0;
    if (traits.length > 0) {
      traitScore = Math.min(traits.length / 5, 1); // Max 1 for 5+ traits
    }
    
    // Personality traits scoring
    const personalityScore = this.scorePersonalityTraits(personalityTraits);
    
    // If no traits and no personality traits, return 0
    if (traits.length === 0 && Object.keys(personalityTraits).length === 0) {
      return 0;
    }
    
    // Combine trait and personality scores
    const personalityStrength = (traitScore + personalityScore) / 2;
    
    return Math.min(Math.max(personalityStrength, 0), 1);
  }

  /**
   * Score personality traits
   * @param {Object} personalityTraits - Personality traits object
   * @returns {number} Personality score (0-1)
   */
  scorePersonalityTraits(personalityTraits) {
    const traits = [
      'formality',
      'verbosity', 
      'enthusiasm',
      'humor'
    ];
    
    let totalScore = 0;
    let validTraits = 0;
    
    traits.forEach(trait => {
      if (personalityTraits[trait] !== undefined) {
        totalScore += personalityTraits[trait];
        validTraits++;
      }
    });
    
    return validTraits > 0 ? totalScore / validTraits : 0.5;
  }

  /**
   * Calculate Skill Proficiency
   * @param {Object} agentConfig - Agent configuration
   * @returns {number} Skill proficiency (0-1)
   */
  calculateSkillProficiency(agentConfig) {
    const cognition = agentConfig.intelligence?.cognition || {};
    const plasticity = agentConfig.intelligence?.plasticity || {};
    
    // If no intelligence configuration, return 0
    if (!agentConfig.intelligence || (Object.keys(cognition).length === 0 && Object.keys(plasticity).length === 0)) {
      return 0;
    }
    
    // Reasoning capability (40% weight)
    const reasoningCapability = this.calculateReasoningCapability(cognition);
    
    // Learning capability (30% weight)
    const learningCapability = this.calculateLearningCapability(plasticity);
    
    // Adaptation capability (30% weight)
    const adaptationCapability = this.calculateAdaptationCapability(plasticity);
    
    const skillProficiency = (
      reasoningCapability * 0.4 +
      learningCapability * 0.3 +
      adaptationCapability * 0.3
    );
    
    return Math.min(Math.max(skillProficiency, 0), 1);
  }

  /**
   * Calculate reasoning capability
   * @param {Object} cognition - Cognition configuration
   * @returns {number} Reasoning capability (0-1)
   */
  calculateReasoningCapability(cognition) {
    const parameters = cognition.parameters || {};
    const analyticalStrength = parameters.analytical_strength || 50;
    const temperature = parameters.temperature || 0.7;
    
    // Higher analytical strength and moderate temperature = better reasoning
    const analyticalScore = analyticalStrength / 100;
    const temperatureScore = 1 - Math.abs(temperature - 0.7) / 0.7; // Optimal around 0.7
    
    return (analyticalScore + temperatureScore) / 2;
  }

  /**
   * Calculate learning capability
   * @param {Object} plasticity - Plasticity configuration
   * @returns {number} Learning capability (0-1)
   */
  calculateLearningCapability(plasticity) {
    const learningRate = plasticity.learning_rate || 0.5;
    const selfImprovement = plasticity.self_improvement ? 1 : 0;
    const adaptationSpeed = plasticity.adaptation_speed || 'medium';
    
    const speedScore = {
      'slow': 0.3,
      'medium': 0.6,
      'fast': 1.0
    }[adaptationSpeed] || 0.6;
    
    return (learningRate + selfImprovement + speedScore) / 3;
  }

  /**
   * Calculate adaptation capability
   * @param {Object} plasticity - Plasticity configuration
   * @returns {number} Adaptation capability (0-1)
   */
  calculateAdaptationCapability(plasticity) {
    const learningRate = plasticity.learning_rate || 0.5;
    const explorationRate = plasticity.exploration_rate || 0.2;
    const adaptationSpeed = plasticity.adaptation_speed || 'medium';
    
    const speedScore = {
      'slow': 0.3,
      'medium': 0.6,
      'fast': 1.0
    }[adaptationSpeed] || 0.6;
    
    // Balance between learning rate and exploration
    const explorationScore = Math.min(explorationRate * 2, 1); // Cap at 1
    
    return (learningRate + explorationScore + speedScore) / 3;
  }

  /**
   * Calculate Domain Expertise
   * @param {Object} agentConfig - Agent configuration
   * @returns {number} Domain expertise (0-1)
   */
  calculateDomainExpertise(agentConfig) {
    const cognition = agentConfig.intelligence?.cognition || {};
    const memory = agentConfig.intelligence?.memory || {};
    const apis = agentConfig.apis || [];
    
    // If no intelligence configuration and no APIs, return 0
    if (!agentConfig.intelligence && apis.length === 0) {
      return 0;
    }
    
    // Model capability score
    const modelScore = this.calculateModelCapability(cognition);
    
    // Memory system score
    const memoryScore = this.calculateMemorySystemScore(memory);
    
    // API integration score
    const apiScore = this.calculateAPIIntegrationScore(apis);
    
    const domainExpertise = (modelScore + memoryScore + apiScore) / 3;
    
    return Math.min(Math.max(domainExpertise, 0), 1);
  }

  /**
   * Calculate model capability score
   * @param {Object} cognition - Cognition configuration
   * @returns {number} Model capability (0-1)
   */
  calculateModelCapability(cognition) {
    const model = cognition.model || '';
    const provider = cognition.provider || '';
    
    // Score based on model quality
    const modelScores = {
      'claude-3-5-sonnet-20241022': 1.0,
      'gpt-4-turbo': 0.9,
      'gpt-4': 0.8,
      'claude-3-opus': 0.8,
      'gpt-3.5-turbo': 0.6
    };
    
    const modelScore = modelScores[model] || 0.5;
    
    // Provider bonus
    const providerBonus = {
      'anthropic': 0.1,
      'openai': 0.1,
      'google': 0.05
    };
    
    const bonus = providerBonus[provider] || 0;
    
    return Math.min(modelScore + bonus, 1);
  }

  /**
   * Calculate memory system score
   * @param {Object} memory - Memory configuration
   * @returns {number} Memory system score (0-1)
   */
  calculateMemorySystemScore(memory) {
    const episodic = memory.episodic || {};
    const semantic = memory.semantic || {};
    const procedural = memory.procedural || {};
    
    let score = 0;
    let systems = 0;
    
    // Episodic memory
    if (episodic.type) {
      score += episodic.type === 'vector' ? 0.4 : 0.2;
      systems++;
    }
    
    // Semantic memory
    if (semantic.type) {
      score += semantic.type === 'knowledge-graph' ? 0.3 : 0.1;
      systems++;
    }
    
    // Procedural memory
    if (procedural.type) {
      score += procedural.type === 'skill-tree' ? 0.3 : 0.1;
      systems++;
    }
    
    return systems > 0 ? score / systems : 0.1;
  }

  /**
   * Calculate API integration score
   * @param {Array} apis - API configurations
   * @returns {number} API integration score (0-1)
   */
  calculateAPIIntegrationScore(apis) {
    if (!apis || apis.length === 0) return 0.1;
    
    let score = 0;
    apis.forEach(api => {
      // Score based on API complexity and authentication
      let apiScore = 0.2; // Base score
      
      if (api.auth) apiScore += 0.2;
      if (api.rate_limit) apiScore += 0.1;
      if (api.endpoints && api.endpoints.length > 0) apiScore += 0.2;
      
      score += Math.min(apiScore, 0.5); // Cap individual API score
    });
    
    return Math.min(score / apis.length, 1);
  }

  /**
   * Calculate Adaptability
   * @param {Object} agentConfig - Agent configuration
   * @returns {number} Adaptability (0-1)
   */
  calculateAdaptability(agentConfig) {
    const plasticity = agentConfig.intelligence?.plasticity || {};
    
    // If no plasticity configuration, return 0
    if (!agentConfig.intelligence || Object.keys(plasticity).length === 0) {
      return 0;
    }
    
    const learningRate = plasticity.learning_rate || 0.5;
    const adaptationSpeed = plasticity.adaptation_speed || 'medium';
    
    const speedMultiplier = {
      'slow': 0.5,
      'medium': 0.7,
      'fast': 1.0
    }[adaptationSpeed] || 0.7;
    
    const adaptability = learningRate * speedMultiplier;
    
    return Math.min(Math.max(adaptability, 0), 1);
  }

  /**
   * Calculate Performance Score
   * @param {Object} performanceData - Runtime performance data
   * @returns {number} Performance score (0-100)
   */
  calculatePerformanceScore(performanceData) {
    try {
      const {
        taskCompletionRate = 0.8,
        responseAccuracy = 0.8,
        userSatisfaction = 4.0,
        efficiencyScore = 0.8
      } = performanceData;
      
      // Convert user satisfaction from 1-5 scale to 0-1
      const satisfactionScore = (userSatisfaction - 1) / 4;
      
      const performanceScore = (
        taskCompletionRate * 0.4 +
        responseAccuracy * 0.3 +
        satisfactionScore * 0.2 +
        efficiencyScore * 0.1
      ) * 100;
      
      log.debug('Performance score calculated', {
        taskCompletionRate,
        responseAccuracy,
        userSatisfaction,
        efficiencyScore,
        performanceScore
      });
      
      return Math.round(performanceScore * 100) / 100;
    } catch (error) {
      log.error('Error calculating Performance Score', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate Total DNA Score
   * @param {Object} agentConfig - Agent configuration
   * @param {Object} performanceData - Performance data (optional)
   * @returns {Object} Complete DNA score object
   */
  calculateTotalDNAScore(agentConfig, performanceData = null) {
    try {
      const dnaPotential = this.calculateDNAPotential(agentConfig);
      const performance = performanceData ? 
        this.calculatePerformanceScore(performanceData) : 
        dnaPotential; // Use potential as performance if no data
      
      const total = (dnaPotential + performance) / 2;
      const level = this.determineLevel(total);
      
      const score = {
        dna_potential: dnaPotential,
        performance: performance,
        total: total,
        level: level,
        breakdown: {
          personality_strength: this.calculatePersonalityStrength(agentConfig) * 100,
          skill_proficiency: this.calculateSkillProficiency(agentConfig) * 100,
          domain_expertise: this.calculateDomainExpertise(agentConfig) * 100,
          adaptability: this.calculateAdaptability(agentConfig) * 100
        },
        timestamp: new Date().toISOString()
      };
      
      log.info('Total DNA score calculated', {
        agent: agentConfig.identity?.name || 'Unknown',
        total: total,
        level: level
      });
      
      return score;
    } catch (error) {
      log.error('Error calculating Total DNA Score', { error: error.message });
      return {
        dna_potential: 0,
        performance: 0,
        total: 0,
        level: 'NOVICE',
        breakdown: {
          personality_strength: 0,
          skill_proficiency: 0,
          domain_expertise: 0,
          adaptability: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Determine agent level based on total score
   * @param {number} totalScore - Total DNA score
   * @returns {string} Agent level
   */
  determineLevel(totalScore) {
    for (const [level, range] of Object.entries(this.levels)) {
      if (totalScore >= range.min && totalScore <= range.max) {
        return level;
      }
    }
    return 'NOVICE';
  }

  /**
   * Get level information
   * @param {string} level - Agent level
   * @returns {Object} Level information
   */
  getLevelInfo(level) {
    return this.levels[level] || this.levels.NOVICE;
  }

  /**
   * Get all levels
   * @returns {Object} All level information
   */
  getAllLevels() {
    return this.levels;
  }

  /**
   * Validate DNA score
   * @param {Object} score - DNA score object
   * @returns {boolean} Is valid
   */
  validateDNAScore(score) {
    const requiredFields = ['dna_potential', 'performance', 'total', 'level'];
    
    for (const field of requiredFields) {
      if (!(field in score)) {
        log.error('Missing required field in DNA score', { field });
        return false;
      }
    }
    
    // Validate ranges
    if (score.dna_potential < 0 || score.dna_potential > 100) return false;
    if (score.performance < 0 || score.performance > 100) return false;
    if (score.total < 0 || score.total > 100) return false;
    if (!this.levels[score.level]) return false;
    
    return true;
  }
}

module.exports = DNAscoringSystem;