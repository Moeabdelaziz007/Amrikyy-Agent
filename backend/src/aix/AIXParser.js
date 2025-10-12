/**
 * AIX Parser - Universal AI Agent Format Parser
 * Converts .aix files to QuantumBuilder agent configurations
 */

const YAML = require('yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const logger = require('../utils/logger');
const aixSchema = require('./aix-schema.json');

class AIXParser {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.validator = this.ajv.compile(aixSchema);
  }

  /**
   * Parse AIX content and convert to QuantumBuilder format
   * @param {string} aixContent - YAML or JSON string
   * @returns {Promise<Object>} Parsed agent configuration
   */
  async parse(aixContent) {
    try {
      logger.info('📄 Parsing AIX file...');

      // Step 1: Parse YAML/JSON
      const aix = this.parseContent(aixContent);
      logger.info(`✅ Parsed AIX: ${aix.meta?.name || 'Unnamed Agent'}`);

      // Step 2: Validate schema
      const valid = this.validate(aix);
      if (!valid) {
        const errors = this.validator.errors
          .map((e) => `${e.instancePath} ${e.message}`)
          .join('; ');
        throw new Error(`Invalid AIX schema: ${errors}`);
      }
      logger.info('✅ AIX schema validated');

      // Step 3: Convert to QuantumBuilder format
      const config = await this.convertToQuantumConfig(aix);
      logger.info('✅ Converted to QuantumBuilder format');

      // Step 4: Extract metadata
      const metadata = this.extractMetadata(aix);
      logger.info(`✅ Agent DNA Score: ${metadata.dna_score.total}`);

      return {
        config,
        metadata,
        raw: aix
      };
    } catch (error) {
      logger.error(`❌ AIX parsing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse YAML or JSON content
   */
  parseContent(content) {
    try {
      // Try YAML first (AIX default)
      return YAML.parse(content);
    } catch (yamlError) {
      try {
        // Fallback to JSON
        return JSON.parse(content);
      } catch (jsonError) {
        throw new Error('Invalid AIX format: Must be valid YAML or JSON');
      }
    }
  }

  /**
   * Validate AIX against schema
   */
  validate(aix) {
    return this.validator(aix);
  }

  /**
   * Convert AIX to QuantumBuilder agent configuration
   */
  async convertToQuantumConfig(aix) {
    return {
      // Basic Info
      id: aix.meta?.id || this.generateId(),
      name: aix.identity.phenotype?.name || aix.meta?.name || 'Unnamed Agent',
      role: aix.identity.phenotype?.role || aix.meta?.description || 'AI Agent',
      specialization:
        aix.identity.phenotype?.specialization || aix.identity.species,

      // DNA Configuration
      dna: {
        personality: this.extractPersonality(
          aix.intelligence.cognition?.parameters || {}
        ),
        skills: this.extractSkills(aix.intelligence),
        domainExpertise: this.extractDomainExpertise(
          aix.intelligence.cognition?.parameters || {}
        ),
        aiModel: {
          provider: aix.intelligence.cognition?.provider || 'anthropic',
          model:
            aix.intelligence.cognition?.model || 'claude-3-5-sonnet-20241022',
          temperature:
            aix.intelligence.cognition?.parameters?.temperature || 0.7,
          maxTokens: aix.intelligence.cognition?.parameters?.max_tokens || 4096
        },
        capabilities: this.extractCapabilities(aix.intelligence),
        autonomyLevel:
          aix.security?.permissions?.autonomy_level || 'supervised'
      },

      // Memory Configuration
      memory: {
        type: aix.intelligence.memory?.episodic?.type || 'vector',
        connectionString: this.resolveNodeRef(
          aix.intelligence.memory?.episodic?.store
        ),
        embeddingModel:
          aix.intelligence.memory?.episodic?.embedding_model ||
          'text-embedding-3-small'
      },

      // Workflow
      workflow: this.parseWorkflow(aix.workflow),

      // APIs
      apis: this.parseAPIs(aix.apis || []),

      // Scoring
      scoring: {
        dna: aix.dna_scoring?.current_score?.dna_potential || 0,
        performance: aix.dna_scoring?.current_score?.performance || 0,
        total: aix.dna_scoring?.current_score?.total || 0,
        level: aix.dna_scoring?.current_score?.level || 'Novice'
      },

      // Quantum Configuration
      quantum: {
        enabled: aix.deployment?.config?.quantum_resilience !== false,
        replicas: aix.deployment?.config?.replicas || 1,
        scaling: aix.deployment?.config?.scaling || 'manual',
        selfHealing: aix.deployment?.config?.self_healing !== false,
        grpcEnabled: aix.deployment?.config?.gRPC_enabled !== false
      },

      // Monitoring
      monitoring: {
        enabled: aix.monitoring?.telemetry?.enabled !== false,
        provider: aix.monitoring?.telemetry?.provider || 'opentelemetry',
        metrics: aix.monitoring?.metrics || []
      },

      // Security
      security: {
        vault: aix.security?.vault || { provider: 'aix-cloud', mode: 'hybrid' },
        permissions: aix.security?.permissions || {}
      },

      // Metadata
      created: aix.meta?.created || new Date().toISOString(),
      author: aix.meta?.author || 'Unknown',
      version: aix.meta?.version || '1.0.0',
      tags: aix.meta?.tags || []
    };
  }

  /**
   * Extract personality traits from parameters
   */
  extractPersonality(params) {
    const personality = {};
    const traits = [
      'analytical',
      'creative',
      'empathetic',
      'logical',
      'intuitive',
      'assertive',
      'collaborative',
      'detail_oriented'
    ];

    traits.forEach((trait) => {
      const key = `${trait}_strength`;
      if (params[key] !== undefined) {
        personality[trait] = params[key];
      }
    });

    return Object.keys(personality).length > 0
      ? personality
      : { analytical: 70, empathetic: 70 };
  }

  /**
   * Extract skills from intelligence config
   */
  extractSkills(intelligence) {
    return {
      reasoning:
        intelligence.cognition?.parameters?.reasoning_depth === 'deep'
          ? 90
          : 70,
      learning: intelligence.plasticity?.learning_rate
        ? Math.round(intelligence.plasticity.learning_rate * 100)
        : 50,
      adaptation: intelligence.plasticity?.self_improvement ? 80 : 50,
      communication: 75
    };
  }

  /**
   * Extract domain expertise
   */
  extractDomainExpertise(params) {
    const expertise = {};
    const domains = [
      'coding',
      'problemSolving',
      'communication',
      'leadership',
      'learning',
      'creativity',
      'technical',
      'business'
    ];

    domains.forEach((domain) => {
      const key = `${domain}_expertise`;
      if (params[key] !== undefined) {
        expertise[domain] = params[key];
      }
    });

    return expertise;
  }

  /**
   * Extract capabilities
   */
  extractCapabilities(intelligence) {
    return {
      problemSolving: 75,
      learning: intelligence.plasticity?.learning_rate
        ? Math.round(intelligence.plasticity.learning_rate * 100)
        : 50,
      communication: 75,
      leadership: 50,
      creativity: 70
    };
  }

  /**
   * Parse workflow configuration
   */
  parseWorkflow(workflow) {
    if (!workflow) return null;

    return {
      triggers: workflow.triggers || [],
      actions: workflow.actions || []
    };
  }

  /**
   * Parse API configurations
   */
  parseAPIs(apis) {
    return apis.map((api) => ({
      id: api.id,
      name: api.name || api.id,
      baseURL: api.base_url,
      auth: {
        type: api.auth?.type || 'bearer',
        keyRef: api.auth?.key_ref
      },
      rateLimit: api.rate_limit
    }));
  }

  /**
   * Resolve node:// references
   */
  resolveNodeRef(ref) {
    if (!ref) return null;

    if (ref.startsWith('node://config/')) {
      const configKey = ref
        .replace('node://config/', '')
        .toUpperCase()
        .replace('/', '_');
      return process.env[configKey] || ref;
    }

    return ref;
  }

  /**
   * Extract metadata for display
   */
  extractMetadata(aix) {
    return {
      name: aix.meta?.name || aix.identity.phenotype?.name,
      description: aix.meta?.description || aix.identity.phenotype?.role,
      species: aix.identity.species,
      traits: aix.identity.traits || [],
      voice: aix.identity.phenotype?.voice,
      dna_score: {
        dna: aix.dna_scoring?.current_score?.dna_potential || 0,
        performance: aix.dna_scoring?.current_score?.performance || 0,
        total: aix.dna_scoring?.current_score?.total || 0,
        level: aix.dna_scoring?.current_score?.level || 'Novice'
      },
      model: {
        provider: aix.intelligence.cognition?.provider,
        model: aix.intelligence.cognition?.model
      },
      created: aix.meta?.created,
      author: aix.meta?.author,
      tags: aix.meta?.tags || []
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export agent config to AIX format
   */
  async exportToAIX(agentConfig) {
    // Convert QuantumBuilder format back to AIX
    const aix = {
      $schema: 'https://aix-spec.org/v0.1/schema.json',
      version: '0.1',
      genome: 'aixv1',

      meta: {
        id: agentConfig.id,
        name: agentConfig.name,
        version: agentConfig.version || '1.0.0',
        author: agentConfig.author || 'QuantumBuilder',
        description: agentConfig.role,
        created: agentConfig.created || new Date().toISOString(),
        tags: agentConfig.tags || []
      },

      identity: {
        uuid: agentConfig.id,
        species: `${agentConfig.specialization}-agent`,
        generation: 1,
        lineage: 'quantumbuilder',
        traits: Object.keys(agentConfig.dna?.personality || {}),
        phenotype: {
          name: agentConfig.name,
          role: agentConfig.role,
          specialization: agentConfig.specialization
        }
      },

      intelligence: {
        cognition: {
          model: agentConfig.dna?.aiModel?.model,
          provider: agentConfig.dna?.aiModel?.provider,
          parameters: {
            temperature: agentConfig.dna?.aiModel?.temperature,
            ...agentConfig.dna?.personality
          }
        },
        memory: agentConfig.memory,
        plasticity: {
          learning_rate: (agentConfig.dna?.capabilities?.learning || 50) / 100,
          self_improvement:
            agentConfig.dna?.autonomyLevel === 'fully-autonomous'
        }
      },

      workflow: agentConfig.workflow,
      apis: agentConfig.apis,
      security: agentConfig.security,
      monitoring: agentConfig.monitoring,

      dna_scoring: {
        current_score: {
          dna_potential: agentConfig.scoring?.dna || 0,
          performance: agentConfig.scoring?.performance || 0,
          total: agentConfig.scoring?.total || 0,
          level: agentConfig.scoring?.level || 'Novice'
        }
      },

      deployment: {
        target: 'quantumbuilder',
        config: {
          ...agentConfig.quantum,
          quantum_resilience: agentConfig.quantum?.enabled,
          gRPC_enabled: agentConfig.quantum?.grpcEnabled
        }
      }
    };

    return YAML.stringify(aix);
  }
}

module.exports = AIXParser;
