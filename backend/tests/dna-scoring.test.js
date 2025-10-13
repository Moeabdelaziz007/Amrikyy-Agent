/**
 * DNA Scoring System Tests
 * 
 * Tests for the revolutionary DNA scoring system
 * Created by Cursor - Team Lead
 */

const DNAscoringSystem = require('../src/aix/DNAscoringSystem');

describe('DNA Scoring System', () => {
  let dnaSystem;
  
  beforeEach(() => {
    dnaSystem = new DNAscoringSystem();
  });

  describe('DNA Potential Calculation', () => {
    test('should calculate DNA potential for basic agent', () => {
      const agentConfig = {
        identity: {
          traits: ['empathetic', 'knowledgeable', 'helpful']
        },
        interaction: {
          personality_traits: {
            formality: 0.6,
            verbosity: 0.5,
            enthusiasm: 0.8,
            humor: 0.4
          }
        },
        intelligence: {
          cognition: {
            model: 'claude-3-5-sonnet-20241022',
            provider: 'anthropic',
            parameters: {
              temperature: 0.7,
              analytical_strength: 85
            }
          },
          plasticity: {
            learning_rate: 0.8,
            self_improvement: true,
            adaptation_speed: 'fast',
            exploration_rate: 0.2
          }
        },
        apis: [
          {
            id: 'test-api',
            auth: { type: 'bearer' },
            rate_limit: { requests_per_second: 100 }
          }
        ]
      };

      const dnaPotential = dnaSystem.calculateDNAPotential(agentConfig);
      
      expect(dnaPotential).toBeGreaterThan(0);
      expect(dnaPotential).toBeLessThanOrEqual(100);
      expect(typeof dnaPotential).toBe('number');
    });

    test('should handle missing configuration gracefully', () => {
      const agentConfig = {};
      
      const dnaPotential = dnaSystem.calculateDNAPotential(agentConfig);
      
      expect(dnaPotential).toBe(0);
    });

    test('should calculate personality strength correctly', () => {
      const agentConfig = {
        identity: {
          traits: ['empathetic', 'knowledgeable', 'helpful', 'creative', 'analytical']
        },
        interaction: {
          personality_traits: {
            formality: 0.8,
            verbosity: 0.6,
            enthusiasm: 0.9,
            humor: 0.3
          }
        }
      };

      const personalityStrength = dnaSystem.calculatePersonalityStrength(agentConfig);
      
      expect(personalityStrength).toBeGreaterThan(0);
      expect(personalityStrength).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Score Calculation', () => {
    test('should calculate performance score correctly', () => {
      const performanceData = {
        taskCompletionRate: 0.95,
        responseAccuracy: 0.92,
        userSatisfaction: 4.5,
        efficiencyScore: 0.88
      };

      const performanceScore = dnaSystem.calculatePerformanceScore(performanceData);
      
      expect(performanceScore).toBeGreaterThan(0);
      expect(performanceScore).toBeLessThanOrEqual(100);
      expect(typeof performanceScore).toBe('number');
    });

    test('should handle missing performance data', () => {
      const performanceScore = dnaSystem.calculatePerformanceScore(null);
      
      expect(performanceScore).toBe(0);
    });
  });

  describe('Total DNA Score Calculation', () => {
    test('should calculate complete DNA score', () => {
      const agentConfig = {
        identity: {
          traits: ['empathetic', 'knowledgeable'],
          name: 'Test Agent'
        },
        interaction: {
          personality_traits: {
            formality: 0.7,
            verbosity: 0.6,
            enthusiasm: 0.8,
            humor: 0.4
          }
        },
        intelligence: {
          cognition: {
            model: 'claude-3-5-sonnet-20241022',
            provider: 'anthropic',
            parameters: {
              temperature: 0.7,
              analytical_strength: 90
            }
          },
          plasticity: {
            learning_rate: 0.8,
            self_improvement: true,
            adaptation_speed: 'fast'
          }
        }
      };

      const performanceData = {
        taskCompletionRate: 0.9,
        responseAccuracy: 0.85,
        userSatisfaction: 4.2,
        efficiencyScore: 0.8
      };

      const dnaScore = dnaSystem.calculateTotalDNAScore(agentConfig, performanceData);
      
      expect(dnaScore).toHaveProperty('dna_potential');
      expect(dnaScore).toHaveProperty('performance');
      expect(dnaScore).toHaveProperty('total');
      expect(dnaScore).toHaveProperty('level');
      expect(dnaScore).toHaveProperty('breakdown');
      expect(dnaScore).toHaveProperty('timestamp');
      
      expect(dnaScore.dna_potential).toBeGreaterThan(0);
      expect(dnaScore.performance).toBeGreaterThan(0);
      expect(dnaScore.total).toBeGreaterThan(0);
      expect(typeof dnaScore.level).toBe('string');
    });

    test('should use potential as performance when no performance data', () => {
      const agentConfig = {
        identity: { traits: ['empathetic'] },
        intelligence: {
          cognition: { model: 'claude-3-5-sonnet-20241022' },
          plasticity: { learning_rate: 0.8 }
        }
      };

      const dnaScore = dnaSystem.calculateTotalDNAScore(agentConfig);
      
      expect(dnaScore.performance).toBe(dnaScore.dna_potential);
    });
  });

  describe('Level Classification', () => {
    test('should classify NOVICE level correctly', () => {
      const level = dnaSystem.determineLevel(15);
      expect(level).toBe('NOVICE');
    });

    test('should classify APPRENTICE level correctly', () => {
      const level = dnaSystem.determineLevel(30);
      expect(level).toBe('APPRENTICE');
    });

    test('should classify COMPETENT level correctly', () => {
      const level = dnaSystem.determineLevel(50);
      expect(level).toBe('COMPETENT');
    });

    test('should classify EXPERT level correctly', () => {
      const level = dnaSystem.determineLevel(75);
      expect(level).toBe('EXPERT');
    });

    test('should classify MASTER level correctly', () => {
      const level = dnaSystem.determineLevel(95);
      expect(level).toBe('MASTER');
    });
  });

  describe('Level Information', () => {
    test('should return level information', () => {
      const levelInfo = dnaSystem.getLevelInfo('EXPERT');
      
      expect(levelInfo).toHaveProperty('min');
      expect(levelInfo).toHaveProperty('max');
      expect(levelInfo).toHaveProperty('description');
      expect(levelInfo.min).toBe(61);
      expect(levelInfo.max).toBe(80);
    });

    test('should return all levels', () => {
      const allLevels = dnaSystem.getAllLevels();
      
      expect(allLevels).toHaveProperty('NOVICE');
      expect(allLevels).toHaveProperty('APPRENTICE');
      expect(allLevels).toHaveProperty('COMPETENT');
      expect(allLevels).toHaveProperty('EXPERT');
      expect(allLevels).toHaveProperty('MASTER');
    });
  });

  describe('DNA Score Validation', () => {
    test('should validate correct DNA score', () => {
      const validScore = {
        dna_potential: 85,
        performance: 90,
        total: 87.5,
        level: 'EXPERT'
      };

      const isValid = dnaSystem.validateDNAScore(validScore);
      expect(isValid).toBe(true);
    });

    test('should reject invalid DNA score', () => {
      const invalidScore = {
        dna_potential: 150, // Invalid range
        performance: 90,
        total: 87.5,
        level: 'EXPERT'
      };

      const isValid = dnaSystem.validateDNAScore(invalidScore);
      expect(isValid).toBe(false);
    });

    test('should reject DNA score with missing fields', () => {
      const incompleteScore = {
        dna_potential: 85,
        performance: 90
        // Missing total and level
      };

      const isValid = dnaSystem.validateDNAScore(incompleteScore);
      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty agent configuration', () => {
      const agentConfig = {};
      const dnaPotential = dnaSystem.calculateDNAPotential(agentConfig);
      expect(dnaPotential).toBe(0);
    });

    test('should handle null values gracefully', () => {
      const agentConfig = {
        identity: null,
        intelligence: null
      };
      
      const dnaPotential = dnaSystem.calculateDNAPotential(agentConfig);
      expect(dnaPotential).toBe(0);
    });

    test('should handle undefined values gracefully', () => {
      const agentConfig = {
        identity: undefined,
        intelligence: undefined
      };
      
      const dnaPotential = dnaSystem.calculateDNAPotential(agentConfig);
      expect(dnaPotential).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    test('should work with real agent configurations', () => {
      // Cursor Agent Configuration
      const cursorConfig = {
        identity: {
          traits: ['strategic', 'coordinating', 'leadership'],
          name: 'Cursor'
        },
        interaction: {
          personality_traits: {
            formality: 0.8,
            verbosity: 0.6,
            enthusiasm: 0.7,
            humor: 0.3
          }
        },
        intelligence: {
          cognition: {
            model: 'claude-3-5-sonnet-20241022',
            provider: 'anthropic',
            parameters: {
              temperature: 0.7,
              analytical_strength: 95,
              leadership_strength: 90
            }
          },
          plasticity: {
            learning_rate: 0.9,
            self_improvement: true,
            adaptation_speed: 'fast',
            exploration_rate: 0.2
          }
        },
        apis: [
          {
            id: 'team-api',
            auth: { type: 'bearer' },
            rate_limit: { requests_per_second: 100 }
          }
        ]
      };

      const performanceData = {
        taskCompletionRate: 0.95,
        responseAccuracy: 0.92,
        userSatisfaction: 4.7,
        efficiencyScore: 0.9
      };

      const dnaScore = dnaSystem.calculateTotalDNAScore(cursorConfig, performanceData);
      
      expect(dnaScore.total).toBeGreaterThan(80); // Should be EXPERT or MASTER
      expect(dnaScore.level).toMatch(/EXPERT|MASTER/);
      expect(dnaScore.breakdown.personality_strength).toBeGreaterThan(0);
      expect(dnaScore.breakdown.skill_proficiency).toBeGreaterThan(0);
      expect(dnaScore.breakdown.domain_expertise).toBeGreaterThan(0);
      expect(dnaScore.breakdown.adaptability).toBeGreaterThan(0);
    });
  });
});