/**
 * AIX Integration Tests
 * Tests for AIX Loader, Mini-Aladdin integration, and route configuration
 */

const AIXLoader = require('../src/utils/aix-loader');
const MiniAladdin = require('../src/agents/mini-aladdin');

describe('AIX Integration Tests', () => {
  
  describe('AIX Loader', () => {
    let aixDef;

    test('should load AIX file successfully', () => {
      aixDef = AIXLoader.load('agents/mini-aladdin.aix');
      
      expect(aixDef).toBeDefined();
      expect(aixDef.meta).toBeDefined();
      expect(aixDef.meta.id).toBe('d70d54ea-95d8-492a-b353-706417506a75');
      expect(aixDef.meta.name).toBe('Mini-Aladdin Money Hunter');
      expect(aixDef.meta.version).toBe('1.0');
    });

    test('should validate AIX structure', () => {
      const validation = AIXLoader.validate(aixDef);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should get skill by name', () => {
      const huntSkill = AIXLoader.getSkill(aixDef, 'hunt_opportunities');
      
      expect(huntSkill).toBeDefined();
      expect(huntSkill.name).toBe('hunt_opportunities');
      expect(huntSkill.description).toContain('money-making opportunities');
    });

    test('should check operation permissions', () => {
      const huntAllowed = AIXLoader.isOperationAllowed(aixDef, 'hunt');
      const tradeAllowed = AIXLoader.isOperationAllowed(aixDef, 'trade');
      const readAllowed = AIXLoader.isOperationAllowed(aixDef, 'read');
      
      expect(huntAllowed).toBe(false); // Not in allowed_operations
      expect(tradeAllowed).toBe(false); // Not in allowed_operations
      expect(readAllowed).toBe(true); // In allowed_operations
    });

    test('should get rate limits', () => {
      const huntLimit = AIXLoader.getRateLimit(aixDef, 'hunt_endpoint');
      const analyzeLimit = AIXLoader.getRateLimit(aixDef, 'analyze_endpoint');
      const generalLimit = AIXLoader.getRateLimit(aixDef, 'general_endpoint');
      
      expect(huntLimit).toBe(10);
      expect(analyzeLimit).toBe(50);
      expect(generalLimit).toBe(100);
    });

    test('should handle missing AIX file gracefully', () => {
      expect(() => {
        AIXLoader.load('nonexistent.aix');
      }).toThrow('AIX file not found');
    });
  });

  describe('Mini-Aladdin AIX Integration', () => {
    let agent;

    beforeEach(() => {
      agent = new MiniAladdin({ 
        aixFile: 'agents/mini-aladdin.aix',
        initialCapital: 5000 
      });
    });

    test('should initialize with AIX configuration', () => {
      expect(agent.aixDef).toBeDefined();
      expect(agent.aixDef.meta.name).toBe('Mini-Aladdin Money Hunter');
    });

    test('should load AIX persona', () => {
      expect(agent.persona).toBeDefined();
      expect(agent.persona.role).toBe('money hunting specialist and opportunity finder');
      expect(agent.persona.tone).toBe('analytical, opportunistic, and data-driven');
    });

    test('should load AIX security settings', () => {
      expect(agent.security).toBeDefined();
      expect(agent.security.capabilities).toBeDefined();
      expect(agent.security.rate_limiting).toBeDefined();
    });

    test('should get AIX config', () => {
      const config = agent.getAIXConfig();
      
      expect(config).toBeDefined();
      expect(config.meta.id).toBe('d70d54ea-95d8-492a-b353-706417506a75');
    });

    test('should check operation permissions', () => {
      const readAllowed = agent.isOperationAllowed('read');
      const writeAllowed = agent.isOperationAllowed('write');
      
      expect(readAllowed).toBe(true);
      expect(writeAllowed).toBe(true);
    });

    test('should get rate limits', () => {
      const huntLimit = agent.getRateLimit('hunt_endpoint');
      const analyzeLimit = agent.getRateLimit('analyze_endpoint');
      
      expect(huntLimit).toBe(10);
      expect(analyzeLimit).toBe(50);
    });

    test('should work without AIX file', () => {
      const agentNoAIX = new MiniAladdin({ initialCapital: 5000 });
      
      expect(agentNoAIX.aixDef).toBeNull();
      expect(agentNoAIX.isOperationAllowed('anything')).toBe(true); // No restrictions
      expect(agentNoAIX.getRateLimit('anything')).toBeNull();
    });
  });

  describe('AIX Skills Integration', () => {
    let aixDef;

    beforeAll(() => {
      aixDef = AIXLoader.load('agents/mini-aladdin.aix');
    });

    test('should have all required skills', () => {
      const requiredSkills = [
        'hunt_opportunities',
        'analyze_arbitrage',
        'detect_patterns',
        'assess_risk',
        'calculate_roi',
        'find_affiliates',
        'execute_trades',
        'generate_reports'
      ];

      requiredSkills.forEach(skillName => {
        const skill = AIXLoader.getSkill(aixDef, skillName);
        expect(skill).toBeDefined();
        expect(skill.name).toBe(skillName);
      });
    });

    test('should have skill parameters defined', () => {
      const huntSkill = AIXLoader.getSkill(aixDef, 'hunt_opportunities');
      
      expect(huntSkill.parameters).toBeDefined();
      expect(huntSkill.parameters.strategies).toBeDefined();
      expect(huntSkill.parameters.strategies.type).toBe('array');
    });

    test('should have skill returns defined', () => {
      const huntSkill = AIXLoader.getSkill(aixDef, 'hunt_opportunities');
      
      expect(huntSkill.returns).toBeDefined();
      expect(huntSkill.returns.opportunities).toBeDefined();
      expect(huntSkill.returns.opportunities.type).toBe('array');
    });
  });

  describe('AIX Memory Configuration', () => {
    let aixDef;

    beforeAll(() => {
      aixDef = AIXLoader.load('agents/mini-aladdin.aix');
    });

    test('should have memory configuration', () => {
      expect(aixDef.memory).toBeDefined();
      expect(aixDef.memory.enabled).toBe(true);
    });

    test('should have memory types defined', () => {
      expect(aixDef.memory.types).toBeDefined();
      expect(aixDef.memory.types).toContain('opportunities');
      expect(aixDef.memory.types).toContain('trades');
      expect(aixDef.memory.types).toContain('patterns');
    });

    test('should have retention policy', () => {
      expect(aixDef.memory.retention).toBeDefined();
      expect(aixDef.memory.retention.opportunities).toBe('7 days');
      expect(aixDef.memory.retention.trades).toBe('30 days');
    });
  });

  describe('AIX Security Configuration', () => {
    let aixDef;

    beforeAll(() => {
      aixDef = AIXLoader.load('agents/mini-aladdin.aix');
    });

    test('should have security capabilities', () => {
      expect(aixDef.security.capabilities).toBeDefined();
      expect(aixDef.security.capabilities.allowed_operations).toBeDefined();
      expect(aixDef.security.capabilities.restricted_operations).toBeDefined();
    });

    test('should have rate limiting configured', () => {
      expect(aixDef.security.rate_limiting).toBeDefined();
      expect(aixDef.security.rate_limiting.hunt_endpoint).toBe(10);
      expect(aixDef.security.rate_limiting.analyze_endpoint).toBe(50);
      expect(aixDef.security.rate_limiting.general_endpoint).toBe(100);
    });

    test('should have data access controls', () => {
      expect(aixDef.security.data_access).toBeDefined();
      expect(aixDef.security.data_access.can_read).toBeDefined();
      expect(aixDef.security.data_access.can_write).toBeDefined();
    });
  });

  describe('AIX Tools Configuration', () => {
    let aixDef;

    beforeAll(() => {
      aixDef = AIXLoader.load('agents/mini-aladdin.aix');
    });

    test('should have tools defined', () => {
      expect(aixDef.tools).toBeDefined();
      expect(Array.isArray(aixDef.tools)).toBe(true);
      expect(aixDef.tools.length).toBeGreaterThan(0);
    });

    test('should have MCP tools', () => {
      const mcpTools = aixDef.tools.filter(t => t.type === 'mcp');
      expect(mcpTools.length).toBeGreaterThan(0);
    });

    test('should have API tools', () => {
      const apiTools = aixDef.tools.filter(t => t.type === 'api');
      expect(apiTools.length).toBeGreaterThan(0);
    });
  });
});
