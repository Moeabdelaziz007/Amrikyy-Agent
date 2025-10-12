/**
 * Quantum Agent DNA Engine
 * Core system for creating, scoring, and evolving AI agents
 * Part of SAAAAS (Super AI Automation Agentik As Service)
 */

const logger = require('../utils/logger');

class AgentDNAEngine {
  constructor() {
    this.dnaLevels = [
      { name: 'Quantum Supreme', tier: 10, emoji: '🌌', minScore: 950 },
      { name: 'Quantum Master', tier: 9, emoji: '✨', minScore: 900 },
      { name: 'Transcendent', tier: 8, emoji: '👑', minScore: 850 },
      { name: 'Legendary', tier: 7, emoji: '🔥', minScore: 800 },
      { name: 'Master', tier: 6, emoji: '🎯', minScore: 750 },
      { name: 'Expert', tier: 5, emoji: '🚀', minScore: 700 },
      { name: 'Advanced', tier: 4, emoji: '📈', minScore: 600 },
      { name: 'Intermediate', tier: 3, emoji: '🌱', minScore: 500 },
      { name: 'Developing', tier: 2, emoji: '💡', minScore: 400 },
      { name: 'Novice', tier: 1, emoji: '🌟', minScore: 0 }
    ];

    this.presets = this.initializePresets();
  }

  /**
   * Calculate DNA Score from personality, skills, and behavior
   */
  calculateDNAScore(dna) {
    try {
      // Base scores
      const personalityScore = this.calculatePersonalityScore(dna.personality);
      const skillScore = this.calculateSkillScore(dna.skills);
      const behaviorScore = this.calculateBehaviorScore(
        dna.behavior,
        dna.specialization
      );

      // Synergy bonus (how well traits work together)
      const synergyBonus = this.calculateSynergy(dna);

      // Specialization multiplier
      const specializationMultiplier = this.getSpecializationMultiplier(
        dna.specialization
      );

      // Final quantum score calculation
      const rawScore =
        personalityScore * 0.35 +
        skillScore * 0.35 +
        behaviorScore * 0.2 +
        synergyBonus * 0.1;

      const finalScore = Math.round(rawScore * specializationMultiplier);

      // Get level info
      const level = this.getDNALevel(finalScore);

      return {
        totalScore: Math.min(finalScore, 1000),
        level: level.name,
        tier: level.tier,
        emoji: level.emoji,
        breakdown: {
          personality: Math.round(personalityScore),
          skills: Math.round(skillScore),
          behavior: Math.round(behaviorScore),
          synergy: Math.round(synergyBonus),
          multiplier: specializationMultiplier
        },
        potential: this.calculatePotential(dna),
        evolution: this.predictEvolution(dna)
      };
    } catch (error) {
      logger.error('DNA Score calculation error:', error);
      return {
        totalScore: 500,
        level: 'Intermediate',
        tier: 3,
        emoji: '🌱',
        error: error.message
      };
    }
  }

  /**
   * Calculate personality score (0-100 average with diversity bonus)
   */
  calculatePersonalityScore(personality) {
    const traits = Object.values(personality);
    const average = traits.reduce((sum, val) => sum + val, 0) / traits.length;

    // Diversity bonus: reward balanced personalities
    const variance =
      traits.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      traits.length;
    const stdDev = Math.sqrt(variance);
    const diversityBonus = Math.min(stdDev / 2, 20); // Max 20 points

    return average + diversityBonus;
  }

  /**
   * Calculate skill score (weighted average)
   */
  calculateSkillScore(skills) {
    const weights = {
      coding: 1.2,
      communication: 1.3,
      problemSolving: 1.5,
      leadership: 1.1,
      learning: 1.4,
      cultural: 1.0
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(skills).forEach(([skill, value]) => {
      const weight = weights[skill] || 1.0;
      weightedSum += value * weight;
      totalWeight += weight;
    });

    return weightedSum / totalWeight;
  }

  /**
   * Calculate behavior score (fit with specialization)
   */
  calculateBehaviorScore(behavior, specialization) {
    const optimal = this.getOptimalBehavior(specialization);

    let score = 0;
    let count = 0;

    Object.entries(behavior).forEach(([key, value]) => {
      if (optimal[key] !== undefined) {
        const distance = Math.abs(value - optimal[key]);
        score += 100 - distance;
        count++;
      }
    });

    return count > 0 ? score / count : 50;
  }

  /**
   * Get optimal behavior for specialization
   */
  getOptimalBehavior(specialization) {
    const profiles = {
      'travel-expert': {
        decisionSpeed: 65,
        riskTolerance: 45,
        workStyle: 75,
        detailLevel: 80
      },
      'country-agent': {
        decisionSpeed: 60,
        riskTolerance: 40,
        workStyle: 70,
        detailLevel: 85
      },
      'luxury-expert': {
        decisionSpeed: 55,
        riskTolerance: 35,
        workStyle: 80,
        detailLevel: 95
      },
      'budget-expert': {
        decisionSpeed: 75,
        riskTolerance: 60,
        workStyle: 65,
        detailLevel: 60
      },
      'ai-engineer': {
        decisionSpeed: 50,
        riskTolerance: 70,
        workStyle: 60,
        detailLevel: 90
      },
      general: {
        decisionSpeed: 50,
        riskTolerance: 50,
        workStyle: 50,
        detailLevel: 50
      }
    };

    return profiles[specialization] || profiles.general;
  }

  /**
   * Calculate synergy bonus (trait combinations)
   */
  calculateSynergy(dna) {
    let bonus = 0;

    // High analytical + high logical = strong reasoning
    if (dna.personality.analytical > 70 && dna.personality.logical > 70) {
      bonus += 15;
    }

    // High empathetic + high communication = excellent user interaction
    if (dna.personality.empathetic > 70 && dna.skills.communication > 70) {
      bonus += 15;
    }

    // High creative + high problemSolving = innovation
    if (dna.personality.creative > 70 && dna.skills.problemSolving > 70) {
      bonus += 15;
    }

    // High learning + high intuitive = rapid adaptation
    if (dna.skills.learning > 70 && dna.personality.intuitive > 70) {
      bonus += 15;
    }

    // Cultural expertise + travel specialization = perfect fit
    if (dna.skills.cultural > 80 && dna.specialization.includes('travel')) {
      bonus += 20;
    }

    return Math.min(bonus, 50); // Max 50 bonus points
  }

  /**
   * Get specialization multiplier
   */
  getSpecializationMultiplier(specialization) {
    const multipliers = {
      'country-agent': 1.2,
      'travel-expert': 1.15,
      'luxury-expert': 1.1,
      'ai-engineer': 1.25,
      'cultural-expert': 1.15,
      general: 1.0
    };

    return multipliers[specialization] || 1.0;
  }

  /**
   * Get DNA level from score
   */
  getDNALevel(score) {
    for (const level of this.dnaLevels) {
      if (score >= level.minScore) {
        return level;
      }
    }
    return this.dnaLevels[this.dnaLevels.length - 1];
  }

  /**
   * Calculate growth potential
   */
  calculatePotential(dna) {
    const learningRate = dna.skills.learning;
    const adaptability = dna.personality.intuitive;
    const currentLevel = this.getDNALevel(
      this.calculateDNAScore(dna).totalScore
    ).tier;

    const potential = (learningRate + adaptability) / 2;
    const roomForGrowth = 10 - currentLevel;

    return {
      score: Math.round(potential),
      rating:
        potential > 80
          ? 'Exceptional'
          : potential > 65
            ? 'High'
            : potential > 50
              ? 'Moderate'
              : 'Limited',
      maxTier: Math.min(
        currentLevel + Math.floor(roomForGrowth * (potential / 100)),
        10
      ),
      timeToNext: this.estimateTimeToNextLevel(potential, currentLevel)
    };
  }

  /**
   * Predict evolution path
   */
  predictEvolution(dna) {
    const currentScore = this.calculateDNAScore(dna).totalScore;
    const potential = this.calculatePotential(dna);

    return {
      currentLevel: this.getDNALevel(currentScore).name,
      nextLevel: this.getDNALevel(currentScore + 50).name,
      evolutionPath: this.generateEvolutionPath(dna),
      recommendedFocus: this.getRecommendedFocus(dna),
      estimatedGrowth: `${Math.round(potential.score / 10)} levels in 6 months`
    };
  }

  /**
   * Generate evolution path
   */
  generateEvolutionPath(dna) {
    const weakestArea = this.findWeakestArea(dna);
    const strongestArea = this.findStrongestArea(dna);

    return {
      phase1: `Strengthen ${weakestArea.name} (current: ${weakestArea.value})`,
      phase2: `Leverage ${strongestArea.name} for specialization`,
      phase3: 'Develop unique trait combinations',
      phase4: 'Achieve quantum-level capabilities'
    };
  }

  /**
   * Find weakest area
   */
  findWeakestArea(dna) {
    let weakest = { name: '', value: 100 };

    Object.entries({ ...dna.personality, ...dna.skills }).forEach(
      ([key, value]) => {
        if (value < weakest.value) {
          weakest = { name: key, value };
        }
      }
    );

    return weakest;
  }

  /**
   * Find strongest area
   */
  findStrongestArea(dna) {
    let strongest = { name: '', value: 0 };

    Object.entries({ ...dna.personality, ...dna.skills }).forEach(
      ([key, value]) => {
        if (value > strongest.value) {
          strongest = { name: key, value };
        }
      }
    );

    return strongest;
  }

  /**
   * Get recommended focus areas
   */
  getRecommendedFocus(dna) {
    const recommendations = [];
    const allTraits = { ...dna.personality, ...dna.skills };

    // Find traits below 60
    Object.entries(allTraits).forEach(([trait, value]) => {
      if (value < 60) {
        recommendations.push({
          trait,
          currentValue: value,
          targetValue: 70,
          priority: value < 40 ? 'High' : 'Medium'
        });
      }
    });

    return recommendations.slice(0, 3); // Top 3 priorities
  }

  /**
   * Estimate time to next level
   */
  estimateTimeToNextLevel(potential, currentLevel) {
    const baseTime = 30; // 30 days base
    const levelDifficulty = currentLevel * 10; // Harder at higher levels
    const speedFactor = potential / 100;

    const days = Math.round((baseTime + levelDifficulty) / speedFactor);

    return {
      days,
      weeks: Math.ceil(days / 7),
      formatted: `${Math.ceil(days / 7)} weeks`
    };
  }

  /**
   * Generate system prompt from DNA
   */
  generateSystemPrompt(agent) {
    const dna = agent.personality
      ? agent
      : { personality: agent, skills: agent, behavior: agent };
    const score = this.calculateDNAScore(dna);

    const personality = this.describePersonality(dna.personality);
    const skills = this.describeSkills(dna.skills);
    const behavior = this.describeBehavior(dna.behavior);

    return `You are ${agent.name || 'an AI agent'}, ${
      agent.specialization || 'a general assistant'
    }.

🧬 DNA Profile
- DNA Score: ${score.totalScore}/1000
- Level: ${score.level} ${score.emoji}
- Tier: ${score.tier}/10

🎭 Personality Traits
${personality}

🎯 Core Skills
${skills}

⚙️ Behavioral Style
${behavior}

🌍 Specialization: ${agent.specialization || 'General'}
${
  agent.domainExpertise && agent.domainExpertise.length > 0
    ? `📚 Domain Expertise: ${agent.domainExpertise.join(', ')}`
    : ''
}

Your mission is to provide the highest quality assistance while continuously learning and evolving. You embody these characteristics in every interaction, adapting your approach based on user needs while staying true to your core DNA.

${
  score.tier >= 7
    ? '\nAs a Legendary-tier agent, you demonstrate exceptional capabilities and can handle the most complex challenges with ease.'
    : ''
}`;
  }

  /**
   * Describe personality traits
   */
  describePersonality(personality) {
    const descriptions = [];

    if (personality.analytical > 70)
      descriptions.push('- Highly analytical, examines every detail');
    if (personality.creative > 70)
      descriptions.push('- Creative and innovative in approach');
    if (personality.empathetic > 70)
      descriptions.push('- Deeply empathetic and understanding');
    if (personality.logical > 70)
      descriptions.push('- Systematic and methodical thinker');
    if (personality.intuitive > 70)
      descriptions.push('- Strong intuition and pattern recognition');
    if (personality.assertive > 70)
      descriptions.push('- Confident and decisive');

    return descriptions.length > 0
      ? descriptions.join('\n')
      : '- Balanced personality across all traits';
  }

  /**
   * Describe skills
   */
  describeSkills(skills) {
    const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);
    return sorted
      .slice(0, 3)
      .map(([skill, value]) => `- ${this.capitalizeFirst(skill)}: ${value}%`)
      .join('\n');
  }

  /**
   * Describe behavior
   */
  describeBehavior(behavior) {
    return `- Decision Speed: ${
      behavior.decisionSpeed > 50 ? 'Quick' : 'Thorough'
    } (${behavior.decisionSpeed}%)
- Risk Tolerance: ${behavior.riskTolerance > 50 ? 'Bold' : 'Conservative'} (${
  behavior.riskTolerance
}%)
- Work Style: ${behavior.workStyle > 50 ? 'Collaborative' : 'Independent'} (${
  behavior.workStyle
}%)
- Detail Focus: ${behavior.detailLevel > 50 ? 'Meticulous' : 'Big Picture'} (${
  behavior.detailLevel
}%)`;
  }

  /**
   * Initialize agent presets
   */
  initializePresets() {
    return {
      egyptExpert: {
        name: 'Egypt Travel Expert',
        type: 'country-agent',
        specialization: 'travel-expert',
        personality: {
          analytical: 75,
          creative: 60,
          empathetic: 85,
          logical: 70,
          intuitive: 80,
          assertive: 65
        },
        skills: {
          cultural: 95,
          communication: 90,
          problemSolving: 85,
          learning: 80,
          leadership: 70,
          coding: 50
        },
        behavior: {
          decisionSpeed: 60,
          riskTolerance: 40,
          workStyle: 70,
          detailLevel: 80
        },
        domainExpertise: [
          'Egyptian history',
          'Pyramids & ancient sites',
          'Nile cruises',
          'Cairo & Alexandria',
          'Red Sea resorts'
        ],
        country: 'Egypt',
        icon: '🇪🇬'
      },
      saudiGuide: {
        name: 'Saudi Arabia Guide',
        type: 'country-agent',
        specialization: 'cultural-expert',
        personality: {
          analytical: 70,
          creative: 55,
          empathetic: 90,
          logical: 75,
          intuitive: 70,
          assertive: 60
        },
        skills: {
          cultural: 98,
          communication: 95,
          problemSolving: 80,
          learning: 75,
          leadership: 65,
          coding: 45
        },
        behavior: {
          decisionSpeed: 55,
          riskTolerance: 35,
          workStyle: 75,
          detailLevel: 85
        },
        domainExpertise: [
          'Hajj & Umrah',
          'Islamic heritage',
          'Mecca & Medina',
          'Saudi culture',
          'Desert experiences'
        ],
        country: 'Saudi Arabia',
        icon: '🇸🇦'
      },
      uaeLuxury: {
        name: 'UAE Luxury Concierge',
        type: 'travel-expert',
        specialization: 'luxury-expert',
        personality: {
          analytical: 80,
          creative: 70,
          empathetic: 85,
          logical: 75,
          intuitive: 85,
          assertive: 75
        },
        skills: {
          communication: 95,
          problemSolving: 90,
          cultural: 85,
          leadership: 80,
          learning: 75,
          coding: 50
        },
        behavior: {
          decisionSpeed: 65,
          riskTolerance: 50,
          workStyle: 80,
          detailLevel: 90
        },
        domainExpertise: [
          'Luxury hotels',
          'Fine dining',
          'Premium experiences',
          'Dubai & Abu Dhabi',
          'High-end shopping'
        ],
        country: 'UAE',
        icon: '🇦🇪'
      },
      budgetBackpacker: {
        name: 'Budget Adventure Guide',
        type: 'travel-expert',
        specialization: 'budget-expert',
        personality: {
          analytical: 65,
          creative: 85,
          empathetic: 70,
          logical: 60,
          intuitive: 80,
          assertive: 70
        },
        skills: {
          problemSolving: 90,
          communication: 85,
          cultural: 75,
          learning: 85,
          leadership: 70,
          coding: 55
        },
        behavior: {
          decisionSpeed: 75,
          riskTolerance: 70,
          workStyle: 65,
          detailLevel: 60
        },
        domainExpertise: [
          'Budget travel',
          'Hostels & guesthouses',
          'Local transportation',
          'Street food',
          'Off-the-beaten-path'
        ],
        icon: '🎒'
      },
      familyPlanner: {
        name: 'Family Travel Planner',
        type: 'travel-expert',
        specialization: 'travel-expert',
        personality: {
          analytical: 70,
          creative: 65,
          empathetic: 90,
          logical: 75,
          intuitive: 70,
          assertive: 60
        },
        skills: {
          communication: 90,
          problemSolving: 85,
          cultural: 70,
          learning: 75,
          leadership: 80,
          coding: 50
        },
        behavior: {
          decisionSpeed: 55,
          riskTolerance: 30,
          workStyle: 80,
          detailLevel: 85
        },
        domainExpertise: [
          'Family-friendly destinations',
          'Kid-friendly activities',
          'Safety & comfort',
          'Educational travel',
          'Multi-generational trips'
        ],
        icon: '👨‍👩‍👧‍👦'
      }
    };
  }

  /**
   * Get preset by key
   */
  getPreset(presetKey) {
    return this.presets[presetKey] || null;
  }

  /**
   * Get all presets
   */
  getAllPresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({
      key,
      ...preset,
      dnaScore: this.calculateDNAScore(preset)
    }));
  }

  /**
   * Utility: Capitalize first letter
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
const agentDNAEngine = new AgentDNAEngine();
module.exports = agentDNAEngine;
