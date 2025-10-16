/**
 * AgentLoader - AIX File Parser and Agent Definition Loader
 * Parses AIX (Artificial Intelligence eXchange) files and creates agent definitions
 * Based on AIX Format Specification by Mohamed H Abdelaziz / AMRIKYY AI Solutions
 * https://github.com/amrikyy/aix-format
 */

const EventEmitter = require('events');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const yaml = require('js-yaml');
const crypto = require('crypto');

class AgentLoader extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.loaderId = 'aix-agent-loader';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      aixDirectory: config.aixDirectory || path.join('backend', 'agents', 'aix'),
      validateSchema: config.validateSchema !== false,
      verifyChecksums: config.verifyChecksums !== false,
      cacheParsedAgents: config.cacheParsedAgents !== false,
      ...config
    };

    // Initialize logger
    this.setupLogger();
    
    // Agent registry
    this.loadedAgents = new Map(); // agentId -> parsed agent definition
    this.agentCapabilities = new Map(); // capability -> [agentIds]
    this.agentTools = new Map(); // toolName -> [agentIds]
    
    // AIX schema for validation
    this.aixSchema = this.loadAIXSchema();
    
    // Performance metrics
    this.metrics = {
      agentsLoaded: 0,
      agentsValidated: 0,
      checksumsVerified: 0,
      parseErrors: 0,
      cacheHits: 0
    };

    this.logger.info('🤖 AgentLoader initialized', { 
      version: this.version,
      config: this.config 
    });
  }

  /**
   * Setup Winston logger
   */
  setupLogger() {
    const LOG_DIR = path.join('backend', 'logs');
    if (!fsSync.existsSync(LOG_DIR)) {
      fsSync.mkdirSync(LOG_DIR, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: path.join(LOG_DIR, 'agent-loader.log') 
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Load AIX schema for validation
   */
  loadAIXSchema() {
    return {
      type: 'object',
      required: ['meta', 'persona'],
      properties: {
        meta: {
          type: 'object',
          required: ['version', 'id', 'name', 'created', 'author'],
          properties: {
            version: { type: 'string', pattern: '^\\d+\\.\\d+$' },
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 1, maxLength: 100 },
            created: { type: 'string', format: 'date-time' },
            author: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        persona: {
          type: 'object',
          required: ['role', 'tone', 'instructions'],
          properties: {
            role: { type: 'string', minLength: 1, maxLength: 100 },
            tone: { type: 'string', minLength: 1, maxLength: 100 },
            instructions: { type: 'string', minLength: 1, maxLength: 2000 },
            personality: { type: 'object' },
            communication_style: { type: 'object' }
          }
        },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100 },
              description: { type: 'string', minLength: 1, maxLength: 500 },
              enabled: { type: 'boolean', default: true },
              parameters: { type: 'object' }
            }
          }
        },
        tools: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100 },
              type: { type: 'string', enum: ['api', 'function', 'mcp', 'custom'] },
              endpoint: { type: 'string' },
              parameters: { type: 'object' },
              authentication: { type: 'object' }
            }
          }
        },
        memory: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['episodic', 'semantic', 'procedural', 'vector'] },
            capacity: { type: 'number', minimum: 1 },
            retention: { type: 'string' },
            integration: { type: 'object' }
          }
        },
        security: {
          type: 'object',
          properties: {
            checksum: {
              type: 'object',
              properties: {
                algorithm: { type: 'string', enum: ['sha256', 'sha512'] },
                value: { type: 'string' },
                scope: { type: 'string', enum: ['content', 'full'] }
              }
            },
            capabilities: {
              type: 'object',
              properties: {
                allowed_operations: { type: 'array', items: { type: 'string' } },
                restricted_domains: { type: 'array', items: { type: 'string' } },
                max_api_calls_per_minute: { type: 'number', minimum: 1 }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Initialize the AgentLoader
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing AgentLoader...');
      this.status = 'initializing';

      // Create AIX directory if it doesn't exist
      await fs.mkdir(this.config.aixDirectory, { recursive: true });
      
      // Load all AIX agents
      await this.loadAllAgents();

      this.status = 'active';
      this.logger.info('✅ AgentLoader initialized successfully');
      
      this.emit('agent_loader_ready', {
        loaderId: this.loaderId,
        agentsLoaded: this.loadedAgents.size,
        capabilities: this.agentCapabilities.size
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize AgentLoader:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load all AIX agents from directory
   */
  async loadAllAgents() {
    try {
      const files = await fs.readdir(this.config.aixDirectory);
      const aixFiles = files.filter(file => file.endsWith('.aix'));
      
      this.logger.info(`📁 Found ${aixFiles.length} AIX files to load`);
      
      for (const file of aixFiles) {
        const filePath = path.join(this.config.aixDirectory, file);
        await this.loadAgent(filePath);
      }
      
      this.logger.info(`✅ Loaded ${this.loadedAgents.size} AIX agents`);
    } catch (error) {
      this.logger.error('❌ Failed to load AIX agents:', error);
      throw error;
    }
  }

  /**
   * Load single AIX agent file
   */
  async loadAgent(filePath) {
    try {
      this.logger.debug(`📖 Loading AIX agent: ${filePath}`);
      
      const content = await fs.readFile(filePath, 'utf8');
      const aixData = yaml.load(content);
      
      // Validate AIX format
      if (this.config.validateSchema) {
        this.validateAIXFormat(aixData);
      }
      
      // Verify checksum if present
      if (this.config.verifyChecksums && aixData.security?.checksum) {
        this.verifyChecksum(aixData, content);
      }
      
      // Parse agent definition
      const agentDefinition = this.parseAgentDefinition(aixData);
      
      // Register agent
      const agentId = agentDefinition.meta.id;
      this.loadedAgents.set(agentId, agentDefinition);
      
      // Index capabilities and tools
      this.indexAgentCapabilities(agentId, agentDefinition);
      this.indexAgentTools(agentId, agentDefinition);
      
      this.metrics.agentsLoaded++;
      this.logger.info(`✅ Loaded AIX agent: ${agentDefinition.meta.name} (${agentId})`);
      
      return agentDefinition;
      
    } catch (error) {
      this.logger.error(`❌ Failed to load AIX agent ${filePath}:`, error);
      this.metrics.parseErrors++;
      throw error;
    }
  }

  /**
   * Validate AIX format against schema
   */
  validateAIXFormat(aixData) {
    // Basic validation
    if (!aixData.meta) {
      throw new Error('AIX file missing required meta section');
    }
    
    if (!aixData.meta.id || !aixData.meta.name) {
      throw new Error('AIX file missing required meta fields');
    }
    
    if (!aixData.persona) {
      throw new Error('AIX file missing required persona section');
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(aixData.meta.id)) {
      throw new Error('AIX meta.id must be a valid UUID');
    }
    
    this.metrics.agentsValidated++;
  }

  /**
   * Verify checksum
   */
  verifyChecksum(aixData, content) {
    const checksum = aixData.security.checksum;
    if (!checksum || !checksum.value) {
      return; // No checksum to verify
    }
    
    const algorithm = checksum.algorithm || 'sha256';
    const hash = crypto.createHash(algorithm);
    
    // Calculate checksum based on scope
    let contentToHash = content;
    if (checksum.scope === 'content') {
      // Remove security section for content-only checksum
      const contentData = { ...aixData };
      delete contentData.security;
      contentToHash = yaml.dump(contentData);
    }
    
    hash.update(contentToHash);
    const calculatedChecksum = hash.digest('hex');
    
    if (calculatedChecksum !== checksum.value) {
      throw new Error(`Checksum verification failed for agent ${aixData.meta.name}`);
    }
    
    this.metrics.checksumsVerified++;
  }

  /**
   * Parse AIX data into standardized agent definition
   */
  parseAgentDefinition(aixData) {
    const agentDefinition = {
      // Meta information
      meta: {
        id: aixData.meta.id,
        name: aixData.meta.name,
        version: aixData.meta.version,
        created: aixData.meta.created,
        author: aixData.meta.author,
        description: aixData.meta.description || '',
        tags: aixData.meta.tags || []
      },
      
      // Persona and behavior
      persona: {
        role: aixData.persona.role,
        tone: aixData.persona.tone,
        instructions: aixData.persona.instructions,
        personality: aixData.persona.personality || {},
        communicationStyle: aixData.persona.communication_style || {}
      },
      
      // Capabilities and skills
      capabilities: aixData.skills ? aixData.skills.map(skill => ({
        name: skill.name,
        description: skill.description,
        enabled: skill.enabled !== false,
        parameters: skill.parameters || {}
      })) : [],
      
      // Tools and integrations
      tools: aixData.tools ? aixData.tools.map(tool => ({
        name: tool.name,
        type: tool.type,
        endpoint: tool.endpoint || '',
        parameters: tool.parameters || {},
        authentication: tool.authentication || {}
      })) : [],
      
      // Memory configuration
      memory: aixData.memory ? {
        type: aixData.memory.type || 'vector',
        capacity: aixData.memory.capacity || 10000,
        retention: aixData.memory.retention || '90d',
        integration: aixData.memory.integration || {}
      } : {
        type: 'vector',
        capacity: 10000,
        retention: '90d',
        integration: {}
      },
      
      // Security and permissions
      security: aixData.security ? {
        allowedOperations: aixData.security.capabilities?.allowed_operations || [],
        restrictedDomains: aixData.security.capabilities?.restricted_domains || [],
        maxApiCallsPerMinute: aixData.security.capabilities?.max_api_calls_per_minute || 100
      } : {
        allowedOperations: [],
        restrictedDomains: [],
        maxApiCallsPerMinute: 100
      },
      
      // Runtime configuration
      runtime: {
        status: 'available',
        lastUsed: null,
        usageCount: 0,
        performanceMetrics: {
          averageResponseTime: 0,
          successRate: 0,
          userSatisfactionScore: 0
        }
      }
    };
    
    return agentDefinition;
  }

  /**
   * Index agent capabilities
   */
  indexAgentCapabilities(agentId, agentDefinition) {
    for (const capability of agentDefinition.capabilities) {
      if (capability.enabled) {
        if (!this.agentCapabilities.has(capability.name)) {
          this.agentCapabilities.set(capability.name, []);
        }
        this.agentCapabilities.get(capability.name).push(agentId);
      }
    }
  }

  /**
   * Index agent tools
   */
  indexAgentTools(agentId, agentDefinition) {
    for (const tool of agentDefinition.tools) {
      if (!this.agentTools.has(tool.name)) {
        this.agentTools.set(tool.name, []);
      }
      this.agentTools.get(tool.name).push(agentId);
    }
  }

  /**
   * Get agent definition by ID
   */
  getAgent(agentId) {
    return this.loadedAgents.get(agentId) || null;
  }

  /**
   * Get agents by capability
   */
  getAgentsByCapability(capability) {
    const agentIds = this.agentCapabilities.get(capability) || [];
    const agents = [];
    
    for (const agentId of agentIds) {
      const agent = this.loadedAgents.get(agentId);
      if (agent) {
        agents.push({
          id: agentId,
          name: agent.meta.name,
          description: agent.meta.description,
          capabilities: agent.capabilities.map(c => c.name),
          tools: agent.tools.map(t => t.name)
        });
      }
    }
    
    return agents;
  }

  /**
   * Get agents by tool
   */
  getAgentsByTool(toolName) {
    const agentIds = this.agentTools.get(toolName) || [];
    const agents = [];
    
    for (const agentId of agentIds) {
      const agent = this.loadedAgents.get(agentId);
      if (agent) {
        agents.push({
          id: agentId,
          name: agent.meta.name,
          description: agent.meta.description,
          capabilities: agent.capabilities.map(c => c.name),
          tools: agent.tools.map(t => t.name)
        });
      }
    }
    
    return agents;
  }

  /**
   * List all loaded agents
   */
  listAgents() {
    const agents = [];
    
    for (const [agentId, agentDefinition] of this.loadedAgents) {
      agents.push({
        id: agentId,
        name: agentDefinition.meta.name,
        version: agentDefinition.meta.version,
        author: agentDefinition.meta.author,
        description: agentDefinition.meta.description,
        tags: agentDefinition.meta.tags,
        capabilities: agentDefinition.capabilities.map(c => c.name),
        tools: agentDefinition.tools.map(t => t.name),
        status: agentDefinition.runtime.status,
        lastUsed: agentDefinition.runtime.lastUsed,
        usageCount: agentDefinition.runtime.usageCount
      });
    }
    
    return agents;
  }

  /**
   * Get agent capabilities registry
   */
  getCapabilitiesRegistry() {
    const registry = {};
    
    for (const [capability, agentIds] of this.agentCapabilities) {
      registry[capability] = agentIds.map(agentId => {
        const agent = this.loadedAgents.get(agentId);
        return {
          agentId,
          agentName: agent?.meta.name || 'Unknown',
          capability: capability
        };
      });
    }
    
    return registry;
  }

  /**
   * Get agent tools registry
   */
  getToolsRegistry() {
    const registry = {};
    
    for (const [toolName, agentIds] of this.agentTools) {
      registry[toolName] = agentIds.map(agentId => {
        const agent = this.loadedAgents.get(agentId);
        return {
          agentId,
          agentName: agent?.meta.name || 'Unknown',
          tool: toolName
        };
      });
    }
    
    return registry;
  }

  /**
   * Update agent runtime metrics
   */
  updateAgentMetrics(agentId, metrics) {
    const agent = this.loadedAgents.get(agentId);
    if (agent) {
      agent.runtime.lastUsed = new Date();
      agent.runtime.usageCount++;
      
      if (metrics) {
        agent.runtime.performanceMetrics = {
          ...agent.runtime.performanceMetrics,
          ...metrics
        };
      }
    }
  }

  /**
   * Get loader status
   */
  getStatus() {
    return {
      loaderId: this.loaderId,
      status: this.status,
      version: this.version,
      metrics: {
        agentsLoaded: this.metrics.agentsLoaded,
        agentsValidated: this.metrics.agentsValidated,
        checksumsVerified: this.metrics.checksumsVerified,
        parseErrors: this.metrics.parseErrors,
        cacheHits: this.metrics.cacheHits
      },
      agents: {
        total: this.loadedAgents.size,
        capabilities: this.agentCapabilities.size,
        tools: this.agentTools.size
      },
      config: this.config
    };
  }

  /**
   * Shutdown loader
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down AgentLoader...');
    this.status = 'shutting_down';
    
    try {
      this.status = 'stopped';
      this.logger.info('✅ AgentLoader shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = AgentLoader;
