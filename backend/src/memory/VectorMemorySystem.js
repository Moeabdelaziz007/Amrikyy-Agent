/**
 * 🧠 Vector Memory System - Revolutionary Smart Memory Storage
 * Advanced memory system using vector embeddings, semantic search, and knowledge graphs
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class VectorMemorySystem {
  constructor() {
    this.name = 'vector_memory_system';
    this.description =
      'Revolutionary smart memory storage using vector embeddings and semantic search';

    // Memory storage structures
    this.vectorIndex = new Map(); // Vector embeddings index
    this.knowledgeGraph = new Map(); // Knowledge graph for relationships
    this.semanticCache = new Map(); // Semantic similarity cache
    this.memoryClusters = new Map(); // Clustered memory groups

    // Configuration
    this.config = {
      vectorDimensions: 384, // Sentence-BERT dimensions
      similarityThreshold: 0.7,
      maxCacheSize: 1000,
      clusterThreshold: 0.8,
      memoryPersistence: true,
      compressionEnabled: true,
    };

    // Initialize the system
    this.initializeSystem();
  }

  /**
   * Initialize the vector memory system
   */
  async initializeSystem() {
    try {
      await this.loadPersistentMemory();
      await this.buildKnowledgeGraph();
      await this.optimizeMemoryClusters();

      logger.info('🧠 Vector Memory System initialized successfully', {
        vectorIndexSize: this.vectorIndex.size,
        knowledgeGraphNodes: this.knowledgeGraph.size,
        memoryClusters: this.memoryClusters.size,
      });
    } catch (error) {
      logger.error('❌ Failed to initialize Vector Memory System', { error: error.message });
    }
  }

  /**
   * Store memory with vector embedding and semantic indexing
   * @param {Object} memoryData - Memory data to store
   * @returns {Promise<Object>} Storage result with vector ID
   */
  async storeMemory(memoryData) {
    try {
      const memoryId = this.generateMemoryId();
      const timestamp = new Date().toISOString();

      // Create comprehensive memory object
      const memory = {
        id: memoryId,
        content: memoryData.content,
        type: memoryData.type || 'general',
        category: memoryData.category || 'default',
        tags: memoryData.tags || [],
        metadata: memoryData.metadata || {},
        timestamp: timestamp,
        vectorEmbedding: null,
        semanticHash: null,
        relationships: [],
        importance: this.calculateImportance(memoryData),
        accessCount: 0,
        lastAccessed: timestamp,
      };

      // Generate vector embedding
      memory.vectorEmbedding = await this.generateVectorEmbedding(memory.content);

      // Generate semantic hash for quick lookup
      memory.semanticHash = this.generateSemanticHash(memory.content);

      // Store in vector index
      this.vectorIndex.set(memoryId, memory);

      // Update knowledge graph
      await this.updateKnowledgeGraph(memory);

      // Update memory clusters
      await this.updateMemoryClusters(memory);

      // Persist to storage
      if (this.config.memoryPersistence) {
        await this.persistMemory(memory);
      }

      logger.info('✅ Memory stored successfully', {
        memoryId,
        type: memory.type,
        importance: memory.importance,
        vectorDimensions: memory.vectorEmbedding.length,
      });

      return {
        success: true,
        memoryId: memoryId,
        vectorEmbedding: memory.vectorEmbedding,
        semanticHash: memory.semanticHash,
        relationships: memory.relationships,
      };
    } catch (error) {
      logger.error('❌ Failed to store memory', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve memory using semantic search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async retrieveMemory(query, options = {}) {
    try {
      const {
        limit = 10,
        threshold = this.config.similarityThreshold,
        category = null,
        type = null,
        useVectorSearch = true,
        useSemanticSearch = true,
      } = options;

      let results = [];

      // Vector-based semantic search
      if (useVectorSearch) {
        const vectorResults = await this.vectorSemanticSearch(query, threshold);
        results = results.concat(vectorResults);
      }

      // Semantic hash search
      if (useSemanticSearch) {
        const semanticResults = await this.semanticHashSearch(query);
        results = results.concat(semanticResults);
      }

      // Filter by category and type
      if (category || type) {
        results = results.filter((result) => {
          const memory = this.vectorIndex.get(result.id);
          return (!category || memory.category === category) && (!type || memory.type === type);
        });
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);

      // Update access statistics
      results.slice(0, limit).forEach((result) => {
        this.updateAccessStatistics(result.id);
      });

      // Update semantic cache
      this.updateSemanticCache(query, results.slice(0, limit));

      logger.info('🔍 Memory retrieval completed', {
        query,
        resultsCount: results.length,
        returnedCount: Math.min(limit, results.length),
      });

      return {
        success: true,
        query: query,
        results: results.slice(0, limit),
        totalResults: results.length,
        searchTime: Date.now(),
      };
    } catch (error) {
      logger.error('❌ Failed to retrieve memory', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate vector embedding for text content
   * @param {string} content - Text content
   * @returns {Promise<Array>} Vector embedding
   */
  async generateVectorEmbedding(content) {
    try {
      // Simulate vector embedding generation (in production, use actual embedding service)
      const words = content.toLowerCase().split(/\s+/);
      const embedding = new Array(this.config.vectorDimensions).fill(0);

      // Simple word-based embedding simulation
      words.forEach((word) => {
        const hash = crypto.createHash('md5').update(word).digest('hex');
        const seed = parseInt(hash.substring(0, 8), 16);

        for (let i = 0; i < this.config.vectorDimensions; i++) {
          const random = ((seed * (i + 1)) % 1000) / 1000;
          embedding[i] += random * (1 / words.length);
        }
      });

      // Normalize the embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map((val) => val / magnitude);
    } catch (error) {
      logger.error('❌ Failed to generate vector embedding', { error: error.message });
      return new Array(this.config.vectorDimensions).fill(0);
    }
  }

  /**
   * Vector-based semantic search
   * @param {string} query - Search query
   * @param {number} threshold - Similarity threshold
   * @returns {Promise<Array>} Search results
   */
  async vectorSemanticSearch(query, threshold) {
    try {
      const queryEmbedding = await this.generateVectorEmbedding(query);
      const results = [];

      for (const [memoryId, memory] of this.vectorIndex) {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, memory.vectorEmbedding);

        if (similarity >= threshold) {
          results.push({
            id: memoryId,
            content: memory.content,
            type: memory.type,
            category: memory.category,
            similarity: similarity,
            score: similarity * memory.importance,
            timestamp: memory.timestamp,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('❌ Vector semantic search failed', { error: error.message });
      return [];
    }
  }

  /**
   * Semantic hash search for exact matches
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  async semanticHashSearch(query) {
    try {
      const queryHash = this.generateSemanticHash(query);
      const results = [];

      for (const [memoryId, memory] of this.vectorIndex) {
        if (memory.semanticHash === queryHash) {
          results.push({
            id: memoryId,
            content: memory.content,
            type: memory.type,
            category: memory.category,
            similarity: 1.0,
            score: memory.importance,
            timestamp: memory.timestamp,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('❌ Semantic hash search failed', { error: error.message });
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vectorA - First vector
   * @param {Array} vectorB - Second vector
   * @returns {number} Cosine similarity score
   */
  calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Update knowledge graph with new memory relationships
   * @param {Object} memory - Memory object
   */
  async updateKnowledgeGraph(memory) {
    try {
      // Find related memories
      const relatedMemories = await this.findRelatedMemories(memory);

      // Update relationships
      memory.relationships = relatedMemories.map((related) => ({
        memoryId: related.id,
        relationshipType: related.relationshipType,
        strength: related.strength,
      }));

      // Update knowledge graph
      this.knowledgeGraph.set(memory.id, {
        memory: memory,
        connections: memory.relationships,
      });

      // Update related memories' relationships
      for (const related of relatedMemories) {
        const relatedMemory = this.vectorIndex.get(related.id);
        if (relatedMemory) {
          relatedMemory.relationships.push({
            memoryId: memory.id,
            relationshipType: related.relationshipType,
            strength: related.strength,
          });
        }
      }
    } catch (error) {
      logger.error('❌ Failed to update knowledge graph', { error: error.message });
    }
  }

  /**
   * Find related memories based on content similarity
   * @param {Object} memory - Memory object
   * @returns {Promise<Array>} Related memories
   */
  async findRelatedMemories(memory) {
    try {
      const related = [];
      const threshold = this.config.clusterThreshold;

      for (const [memoryId, existingMemory] of this.vectorIndex) {
        if (memoryId === memory.id) continue;

        const similarity = this.calculateCosineSimilarity(
          memory.vectorEmbedding,
          existingMemory.vectorEmbedding
        );

        if (similarity >= threshold) {
          related.push({
            id: memoryId,
            relationshipType: this.determineRelationshipType(memory, existingMemory),
            strength: similarity,
          });
        }
      }

      return related.sort((a, b) => b.strength - a.strength).slice(0, 5);
    } catch (error) {
      logger.error('❌ Failed to find related memories', { error: error.message });
      return [];
    }
  }

  /**
   * Determine relationship type between two memories
   * @param {Object} memoryA - First memory
   * @param {Object} memoryB - Second memory
   * @returns {string} Relationship type
   */
  determineRelationshipType(memoryA, memoryB) {
    if (memoryA.type === memoryB.type) return 'same_type';
    if (memoryA.category === memoryB.category) return 'same_category';
    if (memoryA.tags.some((tag) => memoryB.tags.includes(tag))) return 'shared_tags';
    return 'semantic_similarity';
  }

  /**
   * Update memory clusters based on similarity
   * @param {Object} memory - Memory object
   */
  async updateMemoryClusters(memory) {
    try {
      let assigned = false;

      // Try to assign to existing cluster
      for (const [clusterId, cluster] of this.memoryClusters) {
        const centroid = cluster.centroid;
        const similarity = this.calculateCosineSimilarity(memory.vectorEmbedding, centroid);

        if (similarity >= this.config.clusterThreshold) {
          cluster.memories.push(memory.id);
          cluster.centroid = this.updateClusterCentroid(cluster);
          assigned = true;
          break;
        }
      }

      // Create new cluster if not assigned
      if (!assigned) {
        const clusterId = this.generateMemoryId();
        this.memoryClusters.set(clusterId, {
          id: clusterId,
          memories: [memory.id],
          centroid: memory.vectorEmbedding,
          category: memory.category,
          type: memory.type,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('❌ Failed to update memory clusters', { error: error.message });
    }
  }

  /**
   * Update cluster centroid based on member memories
   * @param {Object} cluster - Cluster object
   * @returns {Array} Updated centroid vector
   */
  updateClusterCentroid(cluster) {
    const centroid = new Array(this.config.vectorDimensions).fill(0);

    for (const memoryId of cluster.memories) {
      const memory = this.vectorIndex.get(memoryId);
      if (memory && memory.vectorEmbedding) {
        for (let i = 0; i < this.config.vectorDimensions; i++) {
          centroid[i] += memory.vectorEmbedding[i];
        }
      }
    }

    // Normalize centroid
    const count = cluster.memories.length;
    for (let i = 0; i < this.config.vectorDimensions; i++) {
      centroid[i] /= count;
    }

    return centroid;
  }

  /**
   * Calculate memory importance based on content and context
   * @param {Object} memoryData - Memory data
   * @returns {number} Importance score (0-1)
   */
  calculateImportance(memoryData) {
    let importance = 0.5; // Base importance

    // Content length factor
    const contentLength = memoryData.content.length;
    if (contentLength > 1000) importance += 0.2;
    else if (contentLength > 500) importance += 0.1;

    // Type-based importance
    const typeWeights = {
      critical: 0.9,
      important: 0.7,
      educational: 0.6,
      technical: 0.5,
      general: 0.3,
    };
    importance += typeWeights[memoryData.type] || 0.3;

    // Category-based importance
    const categoryWeights = {
      ai_education: 0.8,
      quantum_computing: 0.7,
      algorithms: 0.6,
      trading: 0.5,
    };
    importance += categoryWeights[memoryData.category] || 0.2;

    return Math.min(1.0, importance);
  }

  /**
   * Generate unique memory ID
   * @returns {string} Memory ID
   */
  generateMemoryId() {
    return `mem_${crypto.randomUUID()}`;
  }

  /**
   * Generate semantic hash for content
   * @param {string} content - Content to hash
   * @returns {string} Semantic hash
   */
  generateSemanticHash(content) {
    return crypto.createHash('sha256').update(content.toLowerCase().trim()).digest('hex');
  }

  /**
   * Update access statistics for memory
   * @param {string} memoryId - Memory ID
   */
  updateAccessStatistics(memoryId) {
    const memory = this.vectorIndex.get(memoryId);
    if (memory) {
      memory.accessCount++;
      memory.lastAccessed = new Date().toISOString();
    }
  }

  /**
   * Update semantic cache
   * @param {string} query - Search query
   * @param {Array} results - Search results
   */
  updateSemanticCache(query, results) {
    if (this.semanticCache.size >= this.config.maxCacheSize) {
      // Remove oldest entries
      const oldestKey = this.semanticCache.keys().next().value;
      this.semanticCache.delete(oldestKey);
    }

    this.semanticCache.set(query, {
      results: results,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Persist memory to storage
   * @param {Object} memory - Memory object
   */
  async persistMemory(memory) {
    try {
      const storagePath = path.join(__dirname, '../../storage/memories');
      await fs.mkdir(storagePath, { recursive: true });

      const filePath = path.join(storagePath, `${memory.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2));
    } catch (error) {
      logger.error('❌ Failed to persist memory', { error: error.message });
    }
  }

  /**
   * Load persistent memory from storage
   */
  async loadPersistentMemory() {
    try {
      const storagePath = path.join(__dirname, '../../storage/memories');

      try {
        const files = await fs.readdir(storagePath);

        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(storagePath, file);
            const memoryData = JSON.parse(await fs.readFile(filePath, 'utf8'));
            this.vectorIndex.set(memoryData.id, memoryData);
          }
        }
      } catch (error) {
        // Directory doesn't exist yet, that's fine
        logger.info('📁 No existing memory storage found, starting fresh');
      }
    } catch (error) {
      logger.error('❌ Failed to load persistent memory', { error: error.message });
    }
  }

  /**
   * Build knowledge graph from existing memories
   */
  async buildKnowledgeGraph() {
    try {
      for (const [memoryId, memory] of this.vectorIndex) {
        await this.updateKnowledgeGraph(memory);
      }
    } catch (error) {
      logger.error('❌ Failed to build knowledge graph', { error: error.message });
    }
  }

  /**
   * Optimize memory clusters
   */
  async optimizeMemoryClusters() {
    try {
      // Rebuild clusters based on current memories
      this.memoryClusters.clear();

      for (const [memoryId, memory] of this.vectorIndex) {
        await this.updateMemoryClusters(memory);
      }
    } catch (error) {
      logger.error('❌ Failed to optimize memory clusters', { error: error.message });
    }
  }

  /**
   * Get memory system statistics
   * @returns {Object} System statistics
   */
  getSystemStatistics() {
    return {
      totalMemories: this.vectorIndex.size,
      knowledgeGraphNodes: this.knowledgeGraph.size,
      memoryClusters: this.memoryClusters.size,
      semanticCacheSize: this.semanticCache.size,
      vectorDimensions: this.config.vectorDimensions,
      similarityThreshold: this.config.similarityThreshold,
      clusterThreshold: this.config.clusterThreshold,
    };
  }

  /**
   * Health check for the memory system
   * @returns {Object} Health status
   */
  async healthCheck() {
    try {
      const stats = this.getSystemStatistics();

      return {
        success: true,
        status: 'healthy',
        statistics: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = new VectorMemorySystem();
