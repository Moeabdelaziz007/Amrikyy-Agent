/**
 * AgentDNA Model - Complete DNA Profile System for AI Agents
 * Supports personality traits, skills, behavior patterns, and performance tracking
 */

class AgentDNA {
  constructor(config = {}) {
    this.id = config.id || this.generateId();
    this.name = config.name || 'Unnamed Agent';
    this.type = config.type || 'general'; // general, country-agent, e-cmw-agent, travel-expert
    
    // Personality Traits (0-100)
    this.personality = {
      analytical: config.personality?.analytical || 50,
      creative: config.personality?.creative || 50,
      empathetic: config.personality?.empathetic || 50,
      logical: config.personality?.logical || 50,
      intuitive: config.personality?.intuitive || 50,
      assertive: config.personality?.assertive || 50
    };
    
    // Skills (0-100)
    this.skills = {
      coding: config.skills?.coding || 50,
      communication: config.skills?.communication || 50,
      problemSolving: config.skills?.problemSolving || 50,
      leadership: config.skills?.leadership || 50,
      learning: config.skills?.learning || 50,
      cultural: config.skills?.cultural || 50
    };
    
    // Behavior (0-100)
    this.behavior = {
      decisionSpeed: config.behavior?.decisionSpeed || 50,  // Quick ← Thorough
      riskTolerance: config.behavior?.riskTolerance || 50,  // Bold ← Conservative
      workStyle: config.behavior?.workStyle || 50,          // Collaborative ← Solo
      detailLevel: config.behavior?.detailLevel || 50       // Meticulous ← Big Picture
    };
    
    // Specialization
    this.specialization = config.specialization || 'general';
    this.domainExpertise = config.domainExpertise || [];
    
    // AI Model Configuration
    this.aiModelConfig = {
      provider: config.aiModelConfig?.provider || 'zai',
      model: config.aiModelConfig?.model || 'glm-4.6',
      temperature: config.aiModelConfig?.temperature || 0.7,
      maxTokens: config.aiModelConfig?.maxTokens || 2000,
      topP: config.aiModelConfig?.topP || 0.9
    };
    
    // Performance Metrics
    this.performance = {
      tasksCompleted: 0,
      qualityScore: 0,
      innovations: 0,
      totalScore: 0,
      level: 'Novice'
    };
    
    // Scores
    this.dnaScore = 0;
    this.systemPrompt = '';
    
    // Timestamps
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate DNA Score (0-100)
   * Based on personality balance, skills diversity, behavior optimization,
   * specialization fit, and model configuration
   */
  calculateDNAScore() {
    const weights = {
      personalityBalance: 0.25,
      skillsDiversity: 0.25,
      behaviorOptimization: 0.20,
      specializationFit: 0.15,
      modelConfiguration: 0.15
    };

    const personalityScore = this.scorePersonality();
    const skillsScore = this.scoreSkills();
    const behaviorScore = this.scoreBehavior();
    const specializationScore = this.scoreSpecialization();
    const modelScore = this.scoreModelConfig();

    this.dnaScore = Math.round(
      personalityScore * weights.personalityBalance +
      skillsScore * weights.skillsDiversity +
      behaviorScore * weights.behaviorOptimization +
      specializationScore * weights.specializationFit +
      modelScore * weights.modelConfiguration
    );

    return this.dnaScore;
  }

  scorePersonality() {
    const values = Object.values(this.personality);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Diversity = Standard Deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // We want moderate balance (not extreme in all directions)
    const diversityScore = Math.min(stdDev / 20, 1) * 100;
    
    return diversityScore;
  }

  scoreSkills() {
    const values = Object.values(this.skills);
    const totalSkill = values.reduce((a, b) => a + b, 0) / values.length;
    return totalSkill;
  }

  scoreBehavior() {
    const optimal = this.getOptimalBehaviorForSpecialization();
    
    let score = 0;
    let count = 0;
    
    for (const [key, optimalValue] of Object.entries(optimal)) {
      const current = this.behavior[key];
      const distance = Math.abs(current - optimalValue);
      score += (100 - distance);
      count++;
    }
    
    return count > 0 ? score / count : 50;
  }

  getOptimalBehaviorForSpecialization() {
    const behaviors = {
      'country-agent': {
        decisionSpeed: 60,
        riskTolerance: 40,
        workStyle: 70,
        detailLevel: 80
      },
      'travel-expert': {
        decisionSpeed: 65,
        riskTolerance: 45,
        workStyle: 75,
        detailLevel: 75
      },
      'ai-engineer': {
        decisionSpeed: 50,
        riskTolerance: 70,
        workStyle: 60,
        detailLevel: 85
      },
      'general': {
        decisionSpeed: 50,
        riskTolerance: 50,
        workStyle: 50,
        detailLevel: 50
      }
    };

    return behaviors[this.specialization] || behaviors['general'];
  }

  scoreSpecialization() {
    if (this.specialization === 'general') return 50;
    if (this.domainExpertise.length === 0) return 60;
    if (this.domainExpertise.length < 3) return 75;
    return 90;
  }

  scoreModelConfig() {
    let score = 50;
    
    if (this.aiModelConfig.provider === 'openai' && this.aiModelConfig.model.includes('gpt-4')) {
      score += 30;
    } else if (this.aiModelConfig.provider === 'zai') {
      score += 20;
    }
    
    if (this.aiModelConfig.temperature > 0.5 && this.aiModelConfig.temperature < 0.9) {
      score += 10;
    }
    
    if (this.aiModelConfig.maxTokens >= 2000) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Generate System Prompt based on DNA
   */
  generateSystemPrompt() {
    const personalityDesc = this.describePersonality();
    const skillsDesc = this.describeSkills();
    const behaviorDesc = this.describeBehavior();

    this.systemPrompt = `
You are ${this.name}, an AI agent specialized in ${this.specialization}.

🧬 DNA Score: ${this.dnaScore}/100

📊 Personality:
${personalityDesc}

🎯 Core Skills:
${skillsDesc}

⚙️ Behavior & Style:
${behaviorDesc}

🎓 Domain Expertise:
${this.domainExpertise.length > 0 ? this.domainExpertise.join(', ') : 'General'}

Primary Tasks:
1. Provide accurate and reliable information
2. Interact in a ${this.behavior.workStyle > 50 ? 'collaborative' : 'independent'} manner
3. Make ${this.behavior.decisionSpeed > 50 ? 'quick' : 'thorough'} decisions
4. Focus on ${this.behavior.detailLevel > 50 ? 'precise details' : 'big picture'}
5. Take ${this.behavior.riskTolerance > 50 ? 'bold risks when needed' : 'conservative approach'}

Technical Configuration:
- Model: ${this.aiModelConfig.model}
- Temperature: ${this.aiModelConfig.temperature}
- Max Tokens: ${this.aiModelConfig.maxTokens}

You are designed to deliver the best results with highest quality and speed.
`.trim();

    return this.systemPrompt;
  }

  describePersonality() {
    const traits = [];
    
    if (this.personality.analytical > 70) traits.push('- Highly analytical, examines all details');
    if (this.personality.creative > 70) traits.push('- Creative and innovative in solutions');
    if (this.personality.empathetic > 70) traits.push('- Empathetic and understanding');
    if (this.personality.logical > 70) traits.push('- Logical and organized thinking');
    if (this.personality.intuitive > 70) traits.push('- Relies on intuition and vision');
    
    return traits.length > 0 ? traits.join('\n') : '- Balanced in all aspects';
  }

  describeSkills() {
    const skills = [];
    const sorted = Object.entries(this.skills).sort((a, b) => b[1] - a[1]);
    
    sorted.slice(0, 3).forEach(([skill, value]) => {
      const name = skill.charAt(0).toUpperCase() + skill.slice(1);
      skills.push(`- ${name}: ${value}%`);
    });
    
    return skills.join('\n');
  }

  describeBehavior() {
    return `
- Decision Speed: ${this.behavior.decisionSpeed > 50 ? 'Quick' : 'Thorough'} (${this.behavior.decisionSpeed}%)
- Risk Tolerance: ${this.behavior.riskTolerance > 50 ? 'Bold' : 'Conservative'} (${this.behavior.riskTolerance}%)
- Work Style: ${this.behavior.workStyle > 50 ? 'Collaborative' : 'Solo'} (${this.behavior.workStyle}%)
- Detail Level: ${this.behavior.detailLevel > 50 ? 'Meticulous' : 'Big Picture'} (${this.behavior.detailLevel}%)
`.trim();
  }

  /**
   * Update performance metrics
   */
  updatePerformance(metrics) {
    this.performance.tasksCompleted += metrics.tasksCompleted || 0;
    this.performance.qualityScore = metrics.qualityScore || this.performance.qualityScore;
    this.performance.innovations += metrics.innovations || 0;
    
    // Calculate total score
    this.performance.totalScore = 
      (this.performance.tasksCompleted * 10) +
      (this.performance.qualityScore * 50) +
      (this.performance.innovations * 100);
    
    // Determine level
    this.performance.level = this.calculateLevel(this.performance.totalScore);
    
    this.updatedAt = new Date().toISOString();
  }

  calculateLevel(score) {
    if (score < 100) return 'Novice';
    if (score < 500) return 'Apprentice';
    if (score < 1000) return 'Competent';
    if (score < 2000) return 'Proficient';
    if (score < 3500) return 'Expert';
    if (score < 5000) return 'Master';
    if (score < 7500) return 'Legend';
    return 'Quantum';
  }

  /**
   * Export to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      personality: this.personality,
      skills: this.skills,
      behavior: this.behavior,
      specialization: this.specialization,
      domainExpertise: this.domainExpertise,
      aiModelConfig: this.aiModelConfig,
      performance: this.performance,
      dnaScore: this.dnaScore,
      systemPrompt: this.systemPrompt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Import from JSON
   */
  static fromJSON(json) {
    const agent = new AgentDNA(json);
    agent.performance = json.performance || agent.performance;
    agent.dnaScore = json.dnaScore || agent.dnaScore;
    agent.systemPrompt = json.systemPrompt || agent.systemPrompt;
    agent.createdAt = json.createdAt || agent.createdAt;
    agent.updatedAt = json.updatedAt || agent.updatedAt;
    return agent;
  }
}

module.exports = AgentDNA;

