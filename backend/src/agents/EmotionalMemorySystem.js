/**
 * @fileoverview Emotional Intelligence Memory System for SAAAAS Platform
 * @description Advanced memory system with emotional intelligence, pattern recognition, and continuous learning
 * @author AMRIKYY AI Solutions
 * @version 2.0-emotional
 */

const EventEmitter = require('events');
const winston = require('winston');
const { ChromaDB } = require('../database/ChromaDB');
const { EmotionalAnalyzer } = require('./EmotionalAnalyzer');

class EmotionalMemorySystem extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      maxMemories: config.maxMemories || 10000,
      memoryDecay: config.memoryDecay || 0.95,
      emotionalThreshold: config.emotionalThreshold || 0.7,
      patternRecognitionEnabled: config.patternRecognitionEnabled !== false,
      skillStorageEnabled: config.skillStorageEnabled !== false,
      ...config,
    };

    this.agentId = 'emotional-memory-system';
    this.status = 'initializing';

    // Initialize components
    this.chromaDB = new ChromaDB();
    this.emotionalAnalyzer = new EmotionalAnalyzer();
    this.memoryPatterns = new Map();
    this.skillDatabase = new Map();
    this.emotionalContext = new Map();

    // Setup logger
    this.setupLogger();

    // Initialize system
    this.initialize();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'emotional-memory-system',
        agentId: this.agentId,
      },
      transports: [
        new winston.transports.File({ filename: 'logs/emotional-memory.log' }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  async initialize() {
    try {
      this.logger.info('Initializing Emotional Memory System...');

      // Initialize ChromaDB
      await this.chromaDB.initialize();

      // Initialize emotional analyzer
      await this.emotionalAnalyzer.initialize();

      // Load existing memories
      await this.loadExistingMemories();

      // Initialize memory patterns
      await this.initializeMemoryPatterns();

      this.status = 'ready';
      this.logger.info('Emotional Memory System initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Emotional Memory System', { error: error.message });
      this.status = 'error';
      this.emit('error', error);
    }
  }

  /**
   * Store memory with emotional context
   * @param {Object} memoryData - Memory data with emotional context
   * @param {string} memoryData.content - Memory content
   * @param {Object} memoryData.emotionalContext - Emotional context
   * @param {string} memoryData.type - Memory type (skill, pattern, preference, etc.)
   * @param {Object} memoryData.metadata - Additional metadata
   * @returns {Promise<string>} Memory ID
   */
  async storeMemory(memoryData) {
    try {
      const { content, emotionalContext, type, metadata = {} } = memoryData;

      // Analyze emotional context
      const emotionalAnalysis = await this.emotionalAnalyzer.analyze(content, emotionalContext);

      // Create memory object
      const memory = {
        id: this.generateMemoryId(),
        content,
        type,
        emotionalContext: emotionalAnalysis,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          agentId: this.agentId,
          emotionalScore: emotionalAnalysis.score,
          emotionalState: emotionalAnalysis.state,
        },
        quality: this.calculateMemoryQuality(content, emotionalAnalysis),
        relevance: 1.0,
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
      };

      // Store in ChromaDB
      await this.chromaDB.storeMemory(memory);

      // Update pattern recognition
      if (this.config.patternRecognitionEnabled) {
        await this.updateMemoryPatterns(memory);
      }

      // Store high-quality skills separately
      if (this.config.skillStorageEnabled && memory.quality > 0.8) {
        await this.storeHighQualitySkill(memory);
      }

      this.logger.info('Memory stored successfully', {
        memoryId: memory.id,
        type: memory.type,
        quality: memory.quality,
        emotionalScore: memory.emotionalContext.score,
      });

      this.emit('memoryStored', memory);
      return memory.id;
    } catch (error) {
      this.logger.error('Failed to store memory', { error: error.message });
      throw error;
    }
  }

  /**
   * Retrieve memories with emotional context matching
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {Object} options.emotionalContext - Emotional context for matching
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.type - Memory type filter
   * @returns {Promise<Array>} Matching memories
   */
  async retrieveMemories(query, options = {}) {
    try {
      const { emotionalContext, limit = 10, type } = options;

      // Analyze query emotional context
      const queryEmotionalAnalysis = emotionalContext
        ? await this.emotionalAnalyzer.analyze(query, emotionalContext)
        : null;

      // Search ChromaDB
      const memories = await this.chromaDB.searchMemories(query, {
        limit,
        type,
        emotionalContext: queryEmotionalAnalysis,
      });

      // Rank memories by emotional relevance
      const rankedMemories = await this.rankMemoriesByEmotionalRelevance(
        memories,
        queryEmotionalAnalysis
      );

      // Update access patterns
      await this.updateAccessPatterns(rankedMemories);

      this.logger.info('Memories retrieved', {
        query,
        count: rankedMemories.length,
        emotionalContext: queryEmotionalAnalysis?.state,
      });

      return rankedMemories;
    } catch (error) {
      this.logger.error('Failed to retrieve memories', { error: error.message });
      throw error;
    }
  }

  /**
   * Evolve memory patterns based on interactions
   * @param {Object} interactionData - Interaction data
   * @param {string} interactionData.userId - User ID
   * @param {string} interactionData.sessionId - Session ID
   * @param {Object} interactionData.emotionalContext - Emotional context
   * @param {Array} interactionData.successfulMemories - Successfully used memories
   * @param {Array} interactionData.failedMemories - Failed memories
   */
  async evolveMemoryPatterns(interactionData) {
    try {
      const { userId, sessionId, emotionalContext, successfulMemories, failedMemories } =
        interactionData;

      // Update successful memory patterns
      for (const memory of successfulMemories) {
        await this.updateMemoryRelevance(memory.id, 0.1); // Increase relevance
        await this.updateMemoryQuality(memory.id, 0.05); // Slight quality boost
      }

      // Update failed memory patterns
      for (const memory of failedMemories) {
        await this.updateMemoryRelevance(memory.id, -0.05); // Decrease relevance
      }

      // Learn emotional patterns
      await this.learnEmotionalPatterns(userId, emotionalContext, successfulMemories);

      // Update user preferences
      await this.updateUserPreferences(userId, emotionalContext, successfulMemories);

      this.logger.info('Memory patterns evolved', {
        userId,
        sessionId,
        successfulCount: successfulMemories.length,
        failedCount: failedMemories.length,
      });

      this.emit('patternsEvolved', interactionData);
    } catch (error) {
      this.logger.error('Failed to evolve memory patterns', { error: error.message });
      throw error;
    }
  }

  /**
   * Store high-quality skill
   * @param {Object} memory - Memory object
   */
  async storeHighQualitySkill(memory) {
    try {
      const skill = {
        id: memory.id,
        content: memory.content,
        type: memory.type,
        quality: memory.quality,
        emotionalContext: memory.emotionalContext,
        metadata: memory.metadata,
        patterns: this.extractPatterns(memory.content),
        applications: [],
        successRate: 1.0,
        lastUsed: new Date().toISOString(),
        usageCount: 0,
      };

      this.skillDatabase.set(memory.id, skill);

      // Store in ChromaDB skills collection
      await this.chromaDB.storeSkill(skill);

      this.logger.info('High-quality skill stored', {
        skillId: skill.id,
        quality: skill.quality,
        patterns: skill.patterns.length,
      });

      this.emit('skillStored', skill);
    } catch (error) {
      this.logger.error('Failed to store high-quality skill', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate memory quality based on content and emotional context
   * @param {string} content - Memory content
   * @param {Object} emotionalAnalysis - Emotional analysis
   * @returns {number} Quality score (0-1)
   */
  calculateMemoryQuality(content, emotionalAnalysis) {
    let quality = 0.5; // Base quality

    // Content length factor
    if (content.length > 100) {
      quality += 0.1;
    }
    if (content.length > 500) {
      quality += 0.1;
    }

    // Emotional context factor
    if (emotionalAnalysis.confidence > 0.8) {
      quality += 0.1;
    }
    if (emotionalAnalysis.score > 0.7) {
      quality += 0.1;
    }

    // Pattern richness factor
    const patterns = this.extractPatterns(content);
    if (patterns.length > 3) {
      quality += 0.1;
    }
    if (patterns.length > 5) {
      quality += 0.1;
    }

    return Math.min(quality, 1.0);
  }

  /**
   * Extract patterns from content
   * @param {string} content - Content to analyze
   * @returns {Array} Extracted patterns
   */
  extractPatterns(content) {
    const patterns = [];

    // Code patterns
    if (content.includes('function') || content.includes('class')) {
      patterns.push('code_structure');
    }

    // Error handling patterns
    if (content.includes('try') || content.includes('catch') || content.includes('error')) {
      patterns.push('error_handling');
    }

    // API patterns
    if (content.includes('api') || content.includes('endpoint') || content.includes('route')) {
      patterns.push('api_pattern');
    }

    // Database patterns
    if (content.includes('database') || content.includes('query') || content.includes('sql')) {
      patterns.push('database_pattern');
    }

    // Security patterns
    if (content.includes('security') || content.includes('auth') || content.includes('encrypt')) {
      patterns.push('security_pattern');
    }

    return patterns;
  }

  /**
   * Rank memories by emotional relevance
   * @param {Array} memories - Memories to rank
   * @param {Object} queryEmotionalAnalysis - Query emotional analysis
   * @returns {Promise<Array>} Ranked memories
   */
  async rankMemoriesByEmotionalRelevance(memories, queryEmotionalAnalysis) {
    if (!queryEmotionalAnalysis) {
      return memories;
    }

    return memories
      .map((memory) => {
        const emotionalRelevance = this.calculateEmotionalRelevance(
          memory.emotionalContext,
          queryEmotionalAnalysis
        );

        return {
          ...memory,
          emotionalRelevance,
          totalScore: memory.relevance * 0.7 + emotionalRelevance * 0.3,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Calculate emotional relevance between two emotional contexts
   * @param {Object} memoryEmotionalContext - Memory emotional context
   * @param {Object} queryEmotionalContext - Query emotional context
   * @returns {number} Emotional relevance score (0-1)
   */
  calculateEmotionalRelevance(memoryEmotionalContext, queryEmotionalContext) {
    if (!memoryEmotionalContext || !queryEmotionalContext) {
      return 0.5;
    }

    // Calculate similarity between emotional states
    const stateSimilarity = this.calculateStateSimilarity(
      memoryEmotionalContext.state,
      queryEmotionalContext.state
    );

    // Calculate confidence similarity
    const confidenceSimilarity =
      1 - Math.abs(memoryEmotionalContext.confidence - queryEmotionalContext.confidence);

    return stateSimilarity * 0.7 + confidenceSimilarity * 0.3;
  }

  /**
   * Calculate similarity between emotional states
   * @param {string} state1 - First emotional state
   * @param {string} state2 - Second emotional state
   * @returns {number} Similarity score (0-1)
   */
  calculateStateSimilarity(state1, state2) {
    if (state1 === state2) {
      return 1.0;
    }

    // Define emotional state relationships
    const emotionalRelationships = {
      happy: ['excited', 'content', 'satisfied'],
      sad: ['frustrated', 'disappointed', 'worried'],
      angry: ['frustrated', 'annoyed', 'irritated'],
      excited: ['happy', 'enthusiastic', 'motivated'],
      calm: ['peaceful', 'relaxed', 'content'],
      stressed: ['worried', 'anxious', 'overwhelmed'],
    };

    const relatedStates = emotionalRelationships[state1] || [];
    if (relatedStates.includes(state2)) {
      return 0.7;
    }

    return 0.3; // Base similarity for unrelated states
  }

  /**
   * Generate unique memory ID
   * @returns {string} Memory ID
   */
  generateMemoryId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load existing memories from storage
   */
  async loadExistingMemories() {
    try {
      const memories = await this.chromaDB.getAllMemories();
      this.logger.info(`Loaded ${memories.length} existing memories`);
    } catch (error) {
      this.logger.error('Failed to load existing memories', { error: error.message });
    }
  }

  /**
   * Initialize memory patterns
   */
  async initializeMemoryPatterns() {
    // Initialize default patterns
    this.memoryPatterns.set('coding_style_preference', {
      type: 'user_preference',
      storage: 'persistent',
      evolution: true,
    });

    this.memoryPatterns.set('emotional_response_patterns', {
      type: 'behavioral',
      storage: 'persistent',
      evolution: true,
    });

    this.memoryPatterns.set('high_quality_solutions', {
      type: 'skill',
      storage: 'persistent',
      evolution: true,
    });

    this.memoryPatterns.set('user_interaction_history', {
      type: 'contextual',
      storage: 'temporal',
      evolution: true,
    });
  }

  /**
   * Update memory patterns based on new memory
   * @param {Object} memory - Memory object
   */
  async updateMemoryPatterns(memory) {
    // Update pattern recognition based on memory type and content
    const patterns = this.extractPatterns(memory.content);

    for (const pattern of patterns) {
      if (!this.memoryPatterns.has(pattern)) {
        this.memoryPatterns.set(pattern, {
          type: 'extracted',
          storage: 'persistent',
          evolution: true,
          count: 1,
        });
      } else {
        const existingPattern = this.memoryPatterns.get(pattern);
        existingPattern.count = (existingPattern.count || 0) + 1;
        this.memoryPatterns.set(pattern, existingPattern);
      }
    }
  }

  /**
   * Update access patterns for memories
   * @param {Array} memories - Accessed memories
   */
  async updateAccessPatterns(memories) {
    for (const memory of memories) {
      memory.accessCount = (memory.accessCount || 0) + 1;
      memory.lastAccessed = new Date().toISOString();

      // Update in ChromaDB
      await this.chromaDB.updateMemoryAccess(memory.id, {
        accessCount: memory.accessCount,
        lastAccessed: memory.lastAccessed,
      });
    }
  }

  /**
   * Update memory relevance
   * @param {string} memoryId - Memory ID
   * @param {number} delta - Relevance change
   */
  async updateMemoryRelevance(memoryId, delta) {
    await this.chromaDB.updateMemoryRelevance(memoryId, delta);
  }

  /**
   * Update memory quality
   * @param {string} memoryId - Memory ID
   * @param {number} delta - Quality change
   */
  async updateMemoryQuality(memoryId, delta) {
    await this.chromaDB.updateMemoryQuality(memoryId, delta);
  }

  /**
   * Learn emotional patterns from interactions
   * @param {string} userId - User ID
   * @param {Object} emotionalContext - Emotional context
   * @param {Array} successfulMemories - Successful memories
   */
  async learnEmotionalPatterns(userId, emotionalContext, successfulMemories) {
    // Store emotional patterns for future reference
    const emotionalPattern = {
      userId,
      emotionalState: emotionalContext.state,
      successfulMemoryTypes: successfulMemories.map((m) => m.type),
      timestamp: new Date().toISOString(),
    };

    await this.chromaDB.storeEmotionalPattern(emotionalPattern);
  }

  /**
   * Update user preferences based on interactions
   * @param {string} userId - User ID
   * @param {Object} emotionalContext - Emotional context
   * @param {Array} successfulMemories - Successful memories
   */
  async updateUserPreferences(userId, emotionalContext, successfulMemories) {
    // Extract preferences from successful interactions
    const preferences = {
      userId,
      preferredCommunicationStyle: emotionalContext.preferredStyle,
      successfulPatterns: successfulMemories.map((m) => m.patterns).flat(),
      emotionalPreferences: emotionalContext.preferences,
      lastUpdated: new Date().toISOString(),
    };

    await this.chromaDB.updateUserPreferences(userId, preferences);
  }

  /**
   * Get system status
   * @returns {Object} System status
   */
  getStatus() {
    return {
      status: this.status,
      agentId: this.agentId,
      memoryCount: this.chromaDB.getMemoryCount(),
      skillCount: this.skillDatabase.size,
      patternCount: this.memoryPatterns.size,
      config: this.config,
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down Emotional Memory System...');

      // Save current state
      await this.chromaDB.saveState();

      this.status = 'shutdown';
      this.logger.info('Emotional Memory System shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown', { error: error.message });
    }
  }
}

module.exports = EmotionalMemorySystem;
