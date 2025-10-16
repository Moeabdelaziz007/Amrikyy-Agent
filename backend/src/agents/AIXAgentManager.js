/**
 * AIX Agent Manager - AIX Format Integration for Agent Portability
 * Implements AIX (Artificial Intelligence eXchange) format for standardized agent definitions
 * Based on the AIX Format Specification by Mohamed H Abdelaziz / AMRIKYY AI Solutions
 * https://github.com/amrikyy/aix-format
 */

const EventEmitter = require('events');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');
const yaml = require('js-yaml');

class AIXAgentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.managerId = 'aix-agent-manager';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      aixDirectory: config.aixDirectory || path.join('backend', 'agents', 'aix'),
      validateOnLoad: config.validateOnLoad !== false,
      generateChecksums: config.generateChecksums !== false,
      securityLevel: config.securityLevel || 'standard', // 'basic', 'standard', 'high'
      ...config
    };

    // Initialize logger
    this.setupLogger();
    
    // AIX agent registry
    this.aixAgents = new Map(); // agentId -> AIX definition
    this.loadedAgents = new Map(); // agentId -> loaded agent instance
    this.agentCapabilities = new Map(); // capability -> [agentIds]
    
    // AIX format validation
    this.aixSchema = this.loadAIXSchema();
    
    // Performance metrics
    this.metrics = {
      agentsLoaded: 0,
      agentsValidated: 0,
      checksumsVerified: 0,
      formatConversions: 0,
      loadErrors: 0
    };

    this.logger.info('🤖 AIX Agent Manager initialized', { 
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
          filename: path.join(LOG_DIR, 'aix-agent-manager.log') 
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
    // AIX v1.0 schema definition
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
            signature: {
              type: 'object',
              properties: {
                algorithm: { type: 'string' },
                value: { type: 'string' },
                public_key: { type: 'string' },
                signer: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' }
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
   * Initialize the AIX Agent Manager
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing AIX Agent Manager...');
      this.status = 'initializing';

      // Create AIX directory if it doesn't exist
      await fs.mkdir(this.config.aixDirectory, { recursive: true });
      
      // Load existing AIX agents
      await this.loadAIXAgents();
      
      // Validate loaded agents
      if (this.config.validateOnLoad) {
        await this.validateAllAgents();
      }

      this.status = 'active';
      this.logger.info('✅ AIX Agent Manager initialized successfully');
      
      this.emit('aix_manager_ready', {
        managerId: this.managerId,
        agentsLoaded: this.aixAgents.size,
        capabilities: this.agentCapabilities.size
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize AIX Agent Manager:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load AIX agents from directory
   */
  async loadAIXAgents() {
    try {
      const files = await fs.readdir(this.config.aixDirectory);
      const aixFiles = files.filter(file => file.endsWith('.aix'));
      
      this.logger.info(`📁 Found ${aixFiles.length} AIX files to load`);
      
      for (const file of aixFiles) {
        const filePath = path.join(this.config.aixDirectory, file);
        await this.loadAIXFile(filePath);
      }
      
      this.logger.info(`✅ Loaded ${this.aixAgents.size} AIX agents`);
    } catch (error) {
      this.logger.error('❌ Failed to load AIX agents:', error);
      throw error;
    }
  }

  /**
   * Load single AIX file
   */
  async loadAIXFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const aixData = yaml.load(content);
      
      // Validate AIX format
      if (this.config.validateOnLoad) {
        this.validateAIXFormat(aixData);
      }
      
      // Verify checksum if present
      if (this.config.generateChecksums && aixData.security?.checksum) {
        this.verifyChecksum(aixData, content);
      }
      
      // Register agent
      const agentId = aixData.meta.id;
      this.aixAgents.set(agentId, {
        ...aixData,
        filePath,
        loadedAt: new Date()
      });
      
      // Index capabilities
      this.indexAgentCapabilities(agentId, aixData);
      
      this.metrics.agentsLoaded++;
      this.logger.info(`✅ Loaded AIX agent: ${aixData.meta.name} (${agentId})`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to load AIX file ${filePath}:`, error);
      this.metrics.loadErrors++;
      throw error;
    }
  }

  /**
   * Validate AIX format
   */
  validateAIXFormat(aixData) {
    // Basic validation against schema
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
   * Index agent capabilities
   */
  indexAgentCapabilities(agentId, aixData) {
    if (aixData.skills) {
      for (const skill of aixData.skills) {
        if (skill.enabled !== false) {
          if (!this.agentCapabilities.has(skill.name)) {
            this.agentCapabilities.set(skill.name, []);
          }
          this.agentCapabilities.get(skill.name).push(agentId);
        }
      }
    }
  }

  /**
   * Create AIX file for existing agent
   */
  async createAIXForAgent(agent, agentInstance) {
    try {
      const aixData = {
        meta: {
          version: '1.0',
          id: this.generateUUID(),
          name: agent.name || agent.agentId,
          created: new Date().toISOString(),
          author: 'Amrikyy AI Solutions',
          description: `AIX definition for ${agent.agentId}`,
          tags: ['travel', 'ai-agent', 'amrikyy']
        },
        persona: {
          role: agent.role || 'ai_assistant',
          tone: 'professional and helpful',
          instructions: this.generateInstructions(agent, agentInstance),
          personality: {
            traits: this.extractPersonalityTraits(agent, agentInstance),
            communication_style: 'clear and concise'
          }
        },
        skills: this.extractSkills(agent, agentInstance),
        tools: this.extractTools(agent, agentInstance),
        memory: this.extractMemoryConfig(agent, agentInstance),
        security: {
          checksum: {
            algorithm: 'sha256',
            value: '', // Will be calculated
            scope: 'content'
          }
        }
      };
      
      // Generate checksum
      if (this.config.generateChecksums) {
        aixData.security.checksum.value = this.calculateChecksum(aixData);
      }
      
      return aixData;
      
    } catch (error) {
      this.logger.error('❌ Failed to create AIX for agent:', error);
      throw error;
    }
  }

  /**
   * Generate instructions for agent
   */
  generateInstructions(agent, agentInstance) {
    const baseInstructions = `You are ${agent.name || agent.agentId}, a specialized AI agent in the Amrikyy Travel Agent system.`;
    
    const roleInstructions = {
      'luna-trip-architect': 'Your role is to design creative and culturally rich travel itineraries. Focus on creating memorable experiences that blend local culture, authentic activities, and optimal timing.',
      'karim-budget-optimizer': 'Your role is to analyze and optimize travel budgets. Find the best value for money while ensuring quality experiences within budget constraints.',
      'zara-research-specialist': 'Your role is to verify information and conduct thorough research. Ensure all travel recommendations are accurate, up-to-date, and from reliable sources.',
      'proactive-scout-agent': 'Your role is to monitor user interests and proactively generate personalized travel offers. Anticipate user needs and provide timely, relevant opportunities.'
    };
    
    const specificInstructions = roleInstructions[agent.agentId] || 'Provide specialized assistance in your domain of expertise.';
    
    return `${baseInstructions} ${specificInstructions} Always maintain a helpful, professional tone and provide accurate, actionable information.`;
  }

  /**
   * Extract personality traits
   */
  extractPersonalityTraits(agent, agentInstance) {
    const traits = {
      'luna-trip-architect': ['creative', 'culturally-aware', 'detail-oriented', 'imaginative'],
      'karim-budget-optimizer': ['analytical', 'practical', 'efficient', 'value-focused'],
      'zara-research-specialist': ['thorough', 'accurate', 'reliable', 'investigative'],
      'proactive-scout-agent': ['proactive', 'observant', 'personalized', 'opportunistic']
    };
    
    return traits[agent.agentId] || ['helpful', 'professional', 'knowledgeable'];
  }

  /**
   * Extract skills from agent
   */
  extractSkills(agent, agentInstance) {
    const skills = [];
    
    if (agent.capabilities) {
      for (const capability of agent.capabilities) {
        skills.push({
          name: capability,
          description: this.generateSkillDescription(capability),
          enabled: true,
          parameters: {}
        });
      }
    }
    
    return skills;
  }

  /**
   * Generate skill description
   */
  generateSkillDescription(capability) {
    const descriptions = {
      'itinerary_design': 'Design comprehensive travel itineraries with optimal timing and activities',
      'budget_analysis': 'Analyze and optimize travel budgets for maximum value',
      'fact_checking': 'Verify information accuracy and reliability',
      'user_interest_monitoring': 'Monitor and analyze user interests for personalization',
      'proactive_offer_generation': 'Generate personalized travel offers based on user preferences',
      'cultural_insights': 'Provide cultural context and local insights',
      'price_tracking': 'Monitor and track price changes for destinations',
      'research_analysis': 'Conduct thorough research and data analysis'
    };
    
    return descriptions[capability] || `Perform ${capability} operations`;
  }

  /**
   * Extract tools from agent
   */
  extractTools(agent, agentInstance) {
    const tools = [];
    
    // Add MCP tools if available
    if (agentInstance && agentInstance.mcpTools) {
      tools.push({
        name: 'mcp_tools',
        type: 'mcp',
        endpoint: 'mcp://localhost',
        parameters: {},
        authentication: {}
      });
    }
    
    // Add API tools if available
    if (agentInstance && agentInstance.apiClient) {
      tools.push({
        name: 'api_client',
        type: 'api',
        endpoint: 'https://api.amrikyy.ai',
        parameters: {},
        authentication: {
          type: 'bearer',
          token: '${API_TOKEN}'
        }
      });
    }
    
    return tools;
  }

  /**
   * Extract memory configuration
   */
  extractMemoryConfig(agent, agentInstance) {
    return {
      type: 'vector',
      capacity: 10000,
      retention: '90d',
      integration: {
        chromadb: {
          host: 'localhost',
          port: 8000,
          collection: 'amrikyy_knowledge_base'
        }
      }
    };
  }

  /**
   * Calculate checksum for AIX data
   */
  calculateChecksum(aixData) {
    const contentData = { ...aixData };
    delete contentData.security; // Remove security section for content checksum
    
    const content = yaml.dump(contentData);
    const hash = crypto.createHash('sha256');
    hash.update(content);
    
    return hash.digest('hex');
  }

  /**
   * Generate UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Save AIX file
   */
  async saveAIXFile(agentId, aixData) {
    try {
      const fileName = `${agentId}.aix`;
      const filePath = path.join(this.config.aixDirectory, fileName);
      
      // Generate checksum if enabled
      if (this.config.generateChecksums) {
        aixData.security = aixData.security || {};
        aixData.security.checksum = {
          algorithm: 'sha256',
          value: this.calculateChecksum(aixData),
          scope: 'content'
        };
      }
      
      // Convert to YAML and save
      const yamlContent = yaml.dump(aixData, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });
      
      await fs.writeFile(filePath, yamlContent, 'utf8');
      
      // Register the saved agent
      this.aixAgents.set(agentId, {
        ...aixData,
        filePath,
        loadedAt: new Date()
      });
      
      this.logger.info(`💾 Saved AIX file: ${fileName}`);
      
      return {
        success: true,
        filePath,
        agentId,
        checksum: aixData.security?.checksum?.value
      };
      
    } catch (error) {
      this.logger.error('❌ Failed to save AIX file:', error);
      throw error;
    }
  }

  /**
   * Convert AIX between formats
   */
  async convertAIXFormat(inputPath, outputPath, targetFormat) {
    try {
      // Load input file
      const inputContent = await fs.readFile(inputPath, 'utf8');
      let aixData;
      
      // Detect input format
      if (inputPath.endsWith('.aix') || inputPath.endsWith('.yaml') || inputPath.endsWith('.yml')) {
        aixData = yaml.load(inputContent);
      } else if (inputPath.endsWith('.json')) {
        aixData = JSON.parse(inputContent);
      } else {
        throw new Error('Unsupported input format');
      }
      
      // Convert to target format
      let outputContent;
      if (targetFormat === 'yaml' || targetFormat === 'aix') {
        outputContent = yaml.dump(aixData, { indent: 2, lineWidth: 120 });
      } else if (targetFormat === 'json') {
        outputContent = JSON.stringify(aixData, null, 2);
      } else {
        throw new Error('Unsupported target format');
      }
      
      // Save output file
      await fs.writeFile(outputPath, outputContent, 'utf8');
      
      this.metrics.formatConversions++;
      this.logger.info(`🔄 Converted AIX format: ${inputPath} -> ${outputPath}`);
      
      return {
        success: true,
        inputPath,
        outputPath,
        targetFormat
      };
      
    } catch (error) {
      this.logger.error('❌ Failed to convert AIX format:', error);
      throw error;
    }
  }

  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability) {
    const agentIds = this.agentCapabilities.get(capability) || [];
    const agents = [];
    
    for (const agentId of agentIds) {
      const aixData = this.aixAgents.get(agentId);
      if (aixData) {
        agents.push({
          id: agentId,
          name: aixData.meta.name,
          description: aixData.meta.description,
          capabilities: aixData.skills?.map(s => s.name) || []
        });
      }
    }
    
    return agents;
  }

  /**
   * Get AIX agent definition
   */
  getAIXAgent(agentId) {
    return this.aixAgents.get(agentId) || null;
  }

  /**
   * List all AIX agents
   */
  listAIXAgents() {
    const agents = [];
    
    for (const [agentId, aixData] of this.aixAgents) {
      agents.push({
        id: agentId,
        name: aixData.meta.name,
        version: aixData.meta.version,
        author: aixData.meta.author,
        created: aixData.meta.created,
        description: aixData.meta.description,
        tags: aixData.meta.tags || [],
        skills: aixData.skills?.map(s => s.name) || [],
        filePath: aixData.filePath,
        loadedAt: aixData.loadedAt
      });
    }
    
    return agents;
  }

  /**
   * Validate all loaded agents
   */
  async validateAllAgents() {
    this.logger.info('🔍 Validating all loaded AIX agents...');
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const [agentId, aixData] of this.aixAgents) {
      try {
        this.validateAIXFormat(aixData);
        validCount++;
      } catch (error) {
        this.logger.error(`❌ Invalid AIX agent ${agentId}:`, error.message);
        invalidCount++;
      }
    }
    
    this.logger.info(`✅ Validation complete: ${validCount} valid, ${invalidCount} invalid`);
    
    return {
      valid: validCount,
      invalid: invalidCount,
      total: this.aixAgents.size
    };
  }

  /**
   * Get manager status
   */
  getStatus() {
    return {
      managerId: this.managerId,
      status: this.status,
      version: this.version,
      metrics: {
        agentsLoaded: this.metrics.agentsLoaded,
        agentsValidated: this.metrics.agentsValidated,
        checksumsVerified: this.metrics.checksumsVerified,
        formatConversions: this.metrics.formatConversions,
        loadErrors: this.metrics.loadErrors
      },
      agents: {
        total: this.aixAgents.size,
        capabilities: this.agentCapabilities.size
      },
      config: this.config
    };
  }

  /**
   * Shutdown manager
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down AIX Agent Manager...');
    this.status = 'shutting_down';
    
    try {
      this.status = 'stopped';
      this.logger.info('✅ AIX Agent Manager shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = AIXAgentManager;
