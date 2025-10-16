/**
 * MemoryManager - The Agent Cortex
 * Central service for managing long-term memory using ChromaDB
 * Enables agents to learn, remember, and build upon past experiences
 */

const EventEmitter = require('events');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class MemoryManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.agentId = 'memory-manager';
    this.role = 'memory_cortex';
    this.status = 'initializing';
    this.version = '1.0.0';
    
    // Configuration
    this.config = {
      chromaHost: config.chromaHost || 'localhost',
      chromaPort: config.chromaPort || 8000,
      collectionName: config.collectionName || 'amrikyy_knowledge_base',
      embeddingModel: config.embeddingModel || 'all-MiniLM-L6-v2',
      maxChunkSize: config.maxChunkSize || 1000,
      maxResults: config.maxResults || 10,
      memoryRetentionDays: config.memoryRetentionDays || 365,
      ...config
    };

    // Initialize logger
    this.setupLogger();
    
    // Memory collections
    this.collections = {
      trips: null,
      destinations: null,
      userPreferences: null,
      researchData: null,
      culturalInsights: null,
      budgetData: null,
      agentInsights: null
    };

    // Memory statistics
    this.stats = {
      totalMemories: 0,
      memoriesByType: new Map(),
      memoriesByAgent: new Map(),
      memoriesByDestination: new Map(),
      lastCleanup: null,
      averageQueryTime: 0,
      queryCount: 0
    };

    // Initialize ChromaDB client
    this.client = null;
    this.embeddingFunction = null;

    this.logger.info('🧠 MemoryManager initialized', { 
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
          filename: path.join(LOG_DIR, 'memory-manager.log') 
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
   * Initialize ChromaDB connection and collections
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing MemoryManager...');
      this.status = 'initializing';

      // Initialize ChromaDB client
      await this.initializeChromaClient();
      
      // Create collections
      await this.createCollections();
      
      // Load existing statistics
      await this.loadStatistics();
      
      // Start cleanup scheduler
      this.startCleanupScheduler();

      this.status = 'active';
      this.logger.info('✅ MemoryManager initialized successfully');
      
      this.emit('memory_manager_ready', {
        agentId: this.agentId,
        collections: Object.keys(this.collections).length,
        totalMemories: this.stats.totalMemories
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize MemoryManager:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Initialize ChromaDB client
   */
  async initializeChromaClient() {
    try {
      // For now, we'll use a mock client since ChromaDB MCP server is available
      // In production, this would connect to the actual ChromaDB instance
      this.client = {
        // Mock client for development
        collections: new Map(),
        async createCollection({ name, metadata }) {
          const collection = {
            name,
            metadata,
            documents: [],
            metadatas: [],
            ids: []
          };
          this.collections.set(name, collection);
          return collection;
        },
        async getOrCreateCollection({ name }) {
          if (!this.collections.has(name)) {
            return await this.createCollection({ name });
          }
          return this.collections.get(name);
        },
        async listCollections() {
          return Array.from(this.collections.keys());
        }
      };

      this.logger.info('✅ ChromaDB client initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize ChromaDB client:', error);
      throw error;
    }
  }

  /**
   * Create memory collections
   */
  async createCollections() {
    const collectionConfigs = {
      trips: {
        name: `${this.config.collectionName}_trips`,
        metadata: { 
          type: 'trips',
          description: 'Trip itineraries and planning data',
          created: new Date().toISOString()
        }
      },
      destinations: {
        name: `${this.config.collectionName}_destinations`,
        metadata: { 
          type: 'destinations',
          description: 'Destination research and insights',
          created: new Date().toISOString()
        }
      },
      userPreferences: {
        name: `${this.config.collectionName}_user_preferences`,
        metadata: { 
          type: 'user_preferences',
          description: 'User preferences and personalization data',
          created: new Date().toISOString()
        }
      },
      researchData: {
        name: `${this.config.collectionName}_research`,
        metadata: { 
          type: 'research',
          description: 'Research data from Zara and other agents',
          created: new Date().toISOString()
        }
      },
      culturalInsights: {
        name: `${this.config.collectionName}_cultural`,
        metadata: { 
          type: 'cultural',
          description: 'Cultural insights and local knowledge',
          created: new Date().toISOString()
        }
      },
      budgetData: {
        name: `${this.config.collectionName}_budget`,
        metadata: { 
          type: 'budget',
          description: 'Budget analysis and pricing data',
          created: new Date().toISOString()
        }
      },
      agentInsights: {
        name: `${this.config.collectionName}_agent_insights`,
        metadata: { 
          type: 'agent_insights',
          description: 'Agent-generated insights and learnings',
          created: new Date().toISOString()
        }
      }
    };

    for (const [key, config] of Object.entries(collectionConfigs)) {
      try {
        this.collections[key] = await this.client.getOrCreateCollection(config);
        this.logger.info(`✅ Collection created: ${config.name}`);
      } catch (error) {
        this.logger.error(`❌ Failed to create collection ${config.name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Add memory to the cortex
   */
  async addMemory(memoryData) {
    const startTime = Date.now();
    
    try {
      // Validate memory data
      const validatedMemory = this.validateMemoryData(memoryData);
      
      // Determine collection based on memory type
      const collection = this.getCollectionForType(validatedMemory.type);
      
      // Chunk large memories if needed
      const chunks = this.chunkMemory(validatedMemory);
      
      // Add each chunk to the collection
      const results = [];
      for (const chunk of chunks) {
        const result = await this.addChunkToCollection(collection, chunk);
        results.push(result);
      }

      // Update statistics
      this.updateMemoryStats(validatedMemory, chunks.length);

      const processingTime = Date.now() - startTime;
      this.logger.info('💾 Memory added successfully', {
        type: validatedMemory.type,
        chunks: chunks.length,
        processingTime,
        memoryId: validatedMemory.id
      });

      this.emit('memory_added', {
        memoryId: validatedMemory.id,
        type: validatedMemory.type,
        chunks: chunks.length,
        processingTime
      });

      return {
        success: true,
        memoryId: validatedMemory.id,
        chunksAdded: chunks.length,
        processingTime
      };

    } catch (error) {
      this.logger.error('❌ Failed to add memory:', error);
      throw error;
    }
  }

  /**
   * Query memory from the cortex
   */
  async queryMemory(queryData) {
    const startTime = Date.now();
    
    try {
      // Validate query data
      const validatedQuery = this.validateQueryData(queryData);
      
      // Determine which collections to search
      const collections = this.getCollectionsForQuery(validatedQuery);
      
      // Search each relevant collection
      const results = [];
      for (const collection of collections) {
        const collectionResults = await this.searchCollection(collection, validatedQuery);
        results.push(...collectionResults);
      }

      // Rank and filter results
      const rankedResults = this.rankResults(results, validatedQuery);
      
      // Update query statistics
      const queryTime = Date.now() - startTime;
      this.updateQueryStats(queryTime);

      this.logger.info('🔍 Memory query completed', {
        query: validatedQuery.text.substring(0, 100),
        results: rankedResults.length,
        queryTime,
        collections: collections.length
      });

      return {
        success: true,
        results: rankedResults,
        queryTime,
        totalResults: results.length
      };

    } catch (error) {
      this.logger.error('❌ Failed to query memory:', error);
      throw error;
    }
  }

  /**
   * Validate memory data before storage
   */
  validateMemoryData(memoryData) {
    const required = ['id', 'type', 'content', 'metadata'];
    const missing = required.filter(field => !memoryData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Ensure metadata has required fields
    const requiredMetadata = ['agent_source', 'timestamp'];
    const missingMetadata = requiredMetadata.filter(field => !memoryData.metadata[field]);
    
    if (missingMetadata.length > 0) {
      throw new Error(`Missing required metadata: ${missingMetadata.join(', ')}`);
    }

    return {
      ...memoryData,
      timestamp: new Date().toISOString(),
      metadata: {
        ...memoryData.metadata,
        timestamp: new Date().toISOString(),
        version: this.version
      }
    };
  }

  /**
   * Validate query data
   */
  validateQueryData(queryData) {
    if (!queryData.text || typeof queryData.text !== 'string') {
      throw new Error('Query text is required and must be a string');
    }

    return {
      text: queryData.text,
      type: queryData.type || 'all',
      limit: queryData.limit || this.config.maxResults,
      filters: queryData.filters || {},
      agent_source: queryData.agent_source,
      destination: queryData.destination,
      user_id: queryData.user_id
    };
  }

  /**
   * Get collection for memory type
   */
  getCollectionForType(type) {
    const typeMapping = {
      'trip': 'trips',
      'itinerary': 'trips',
      'destination': 'destinations',
      'user_preference': 'userPreferences',
      'research': 'researchData',
      'cultural': 'culturalInsights',
      'budget': 'budgetData',
      'agent_insight': 'agentInsights'
    };

    const collectionKey = typeMapping[type] || 'agentInsights';
    return this.collections[collectionKey];
  }

  /**
   * Get collections for query
   */
  getCollectionsForQuery(query) {
    if (query.type === 'all') {
      return Object.values(this.collections).filter(c => c !== null);
    }

    const collection = this.getCollectionForType(query.type);
    return collection ? [collection] : [];
  }

  /**
   * Chunk large memories for better storage and retrieval
   */
  chunkMemory(memoryData) {
    const content = memoryData.content;
    
    if (typeof content !== 'string') {
      return [memoryData];
    }

    if (content.length <= this.config.maxChunkSize) {
      return [memoryData];
    }

    // Split content into chunks
    const chunks = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > this.config.maxChunkSize) {
        if (currentChunk.trim()) {
          chunks.push({
            ...memoryData,
            id: `${memoryData.id}_chunk_${chunkIndex}`,
            content: currentChunk.trim(),
            metadata: {
              ...memoryData.metadata,
              chunk_index: chunkIndex,
              total_chunks: 0 // Will be set after all chunks are created
            }
          });
          chunkIndex++;
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push({
        ...memoryData,
        id: `${memoryData.id}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          ...memoryData.metadata,
          chunk_index: chunkIndex,
          total_chunks: chunkIndex + 1
        }
      });
    }

    // Update total_chunks for all chunks
    chunks.forEach(chunk => {
      chunk.metadata.total_chunks = chunks.length;
    });

    return chunks;
  }

  /**
   * Add chunk to collection
   */
  async addChunkToCollection(collection, chunk) {
    try {
      // Mock implementation - in production this would use ChromaDB MCP
      if (collection.documents) {
        collection.documents.push(chunk.content);
        collection.metadatas.push(chunk.metadata);
        collection.ids.push(chunk.id);
      }

      return {
        id: chunk.id,
        collection: collection.name,
        success: true
      };
    } catch (error) {
      this.logger.error('❌ Failed to add chunk to collection:', error);
      throw error;
    }
  }

  /**
   * Search collection for relevant memories
   */
  async searchCollection(collection, query) {
    try {
      // Mock implementation - in production this would use ChromaDB MCP
      const results = [];
      
      if (collection.documents) {
        for (let i = 0; i < collection.documents.length; i++) {
          const document = collection.documents[i];
          const metadata = collection.metadatas[i];
          const id = collection.ids[i];

          // Simple text matching for now
          if (document.toLowerCase().includes(query.text.toLowerCase())) {
            results.push({
              id,
              content: document,
              metadata,
              score: this.calculateRelevanceScore(document, query.text)
            });
          }
        }
      }

      return results;
    } catch (error) {
      this.logger.error('❌ Failed to search collection:', error);
      throw error;
    }
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevanceScore(document, query) {
    const docWords = document.toLowerCase().split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    let score = 0;
    for (const queryWord of queryWords) {
      if (docWords.includes(queryWord)) {
        score += 1;
      }
    }
    
    return score / queryWords.length;
  }

  /**
   * Rank search results by relevance
   */
  rankResults(results, query) {
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit);
  }

  /**
   * Update memory statistics
   */
  updateMemoryStats(memory, chunkCount) {
    this.stats.totalMemories += chunkCount;
    
    // Update type statistics
    const typeCount = this.stats.memoriesByType.get(memory.type) || 0;
    this.stats.memoriesByType.set(memory.type, typeCount + chunkCount);
    
    // Update agent statistics
    const agentSource = memory.metadata.agent_source;
    const agentCount = this.stats.memoriesByAgent.get(agentSource) || 0;
    this.stats.memoriesByAgent.set(agentSource, agentCount + chunkCount);
    
    // Update destination statistics
    if (memory.metadata.destination) {
      const destCount = this.stats.memoriesByDestination.get(memory.metadata.destination) || 0;
      this.stats.memoriesByDestination.set(memory.metadata.destination, destCount + chunkCount);
    }
  }

  /**
   * Update query statistics
   */
  updateQueryStats(queryTime) {
    this.stats.queryCount++;
    this.stats.averageQueryTime = 
      ((this.stats.averageQueryTime * (this.stats.queryCount - 1)) + queryTime) 
      / this.stats.queryCount;
  }

  /**
   * Load statistics from storage
   */
  async loadStatistics() {
    try {
      const statsFile = path.join('backend', 'data', 'memory_stats.json');
      if (fsSync.existsSync(statsFile)) {
        const statsData = await fs.readFile(statsFile, 'utf8');
        const savedStats = JSON.parse(statsData);
        
        // Restore Map objects
        this.stats.memoriesByType = new Map(savedStats.memoriesByType || []);
        this.stats.memoriesByAgent = new Map(savedStats.memoriesByAgent || []);
        this.stats.memoriesByDestination = new Map(savedStats.memoriesByDestination || []);
        
        this.logger.info('📊 Memory statistics loaded');
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to load memory statistics:', error.message);
    }
  }

  /**
   * Save statistics to storage
   */
  async saveStatistics() {
    try {
      const dataDir = path.join('backend', 'data');
      await fs.mkdir(dataDir, { recursive: true });
      
      const statsFile = path.join(dataDir, 'memory_stats.json');
      const statsData = {
        ...this.stats,
        memoriesByType: Array.from(this.stats.memoriesByType.entries()),
        memoriesByAgent: Array.from(this.stats.memoriesByAgent.entries()),
        memoriesByDestination: Array.from(this.stats.memoriesByDestination.entries())
      };
      
      await fs.writeFile(statsFile, JSON.stringify(statsData, null, 2));
      this.logger.info('💾 Memory statistics saved');
    } catch (error) {
      this.logger.error('❌ Failed to save memory statistics:', error);
    }
  }

  /**
   * Start cleanup scheduler
   */
  startCleanupScheduler() {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.performCleanup();
    }, 24 * 60 * 60 * 1000);
    
    this.logger.info('🧹 Cleanup scheduler started');
  }

  /**
   * Perform memory cleanup
   */
  async performCleanup() {
    try {
      this.logger.info('🧹 Starting memory cleanup...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.memoryRetentionDays);
      
      // In production, this would clean up old memories from ChromaDB
      // For now, we'll just update the last cleanup time
      
      this.stats.lastCleanup = new Date().toISOString();
      await this.saveStatistics();
      
      this.logger.info('✅ Memory cleanup completed');
    } catch (error) {
      this.logger.error('❌ Memory cleanup failed:', error);
    }
  }

  /**
   * Get memory manager status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      status: this.status,
      version: this.version,
      collections: Object.keys(this.collections).length,
      statistics: {
        totalMemories: this.stats.totalMemories,
        memoriesByType: Object.fromEntries(this.stats.memoriesByType),
        memoriesByAgent: Object.fromEntries(this.stats.memoriesByAgent),
        memoriesByDestination: Object.fromEntries(this.stats.memoriesByDestination),
        queryCount: this.stats.queryCount,
        averageQueryTime: Math.round(this.stats.averageQueryTime),
        lastCleanup: this.stats.lastCleanup
      },
      config: this.config
    };
  }

  /**
   * Shutdown memory manager
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down MemoryManager...');
    this.status = 'shutting_down';
    
    try {
      await this.saveStatistics();
      this.status = 'stopped';
      this.logger.info('✅ MemoryManager shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = MemoryManager;
