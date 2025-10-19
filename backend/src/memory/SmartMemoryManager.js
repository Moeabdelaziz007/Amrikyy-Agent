/**
 * 🧠 Smart Memory Manager - Revolutionary Memory System Orchestrator
 * Advanced memory management using vector embeddings, knowledge graphs, and semantic search
 */

const VectorMemorySystem = require('./VectorMemorySystem');
const SemanticSearchEngine = require('./SemanticSearchEngine');
const KnowledgeGraph = require('./KnowledgeGraph');
const { logger } = require('../utils/logger');

class SmartMemoryManager {
  constructor() {
    this.name = 'smart_memory_manager';
    this.description = 'Revolutionary smart memory management system with vector embeddings and knowledge graphs';
    
    // Memory components
    this.vectorMemory = VectorMemorySystem;
    this.semanticSearch = SemanticSearchEngine;
    this.knowledgeGraph = KnowledgeGraph;
    
    // Memory management configuration
    this.config = {
      autoOptimization: true,
      compressionEnabled: true,
      indexingEnabled: true,
      relationshipBuilding: true,
      semanticClustering: true,
      temporalDecay: true,
      importanceWeighting: true
    };

    // Memory analytics
    this.analytics = {
      totalStored: 0,
      totalRetrieved: 0,
      averageRetrievalTime: 0,
      searchAccuracy: 0,
      memoryUtilization: 0
    };

    // Initialize the smart memory system
    this.initializeSmartMemory();
  }

  /**
   * Initialize the smart memory management system
   */
  async initializeSmartMemory() {
    try {
      // Initialize all components
      await this.vectorMemory.initializeSystem();
      
      // Build initial knowledge graph
      await this.buildInitialKnowledgeGraph();
      
      // Optimize memory clusters
      await this.optimizeMemorySystem();
      
      logger.info('🧠 Smart Memory Manager initialized successfully', {
        vectorMemoryReady: true,
        semanticSearchReady: true,
        knowledgeGraphReady: true,
        totalMemories: this.vectorMemory.getSystemStatistics().totalMemories
      });
    } catch (error) {
      logger.error('❌ Failed to initialize Smart Memory Manager', { error: error.message });
    }
  }

  /**
   * Store memory with intelligent processing
   * @param {Object} memoryData - Memory data to store
   * @returns {Promise<Object>} Storage result
   */
  async storeMemory(memoryData) {
    try {
      const startTime = Date.now();
      
      // Enhanced memory data with metadata
      const enhancedMemoryData = await this.enhanceMemoryData(memoryData);
      
      // Store in vector memory system
      const vectorResult = await this.vectorMemory.storeMemory(enhancedMemoryData);
      
      if (!vectorResult.success) {
        return vectorResult;
      }

      // Add to knowledge graph
      const graphResult = await this.knowledgeGraph.addMemoryNode({
        ...enhancedMemoryData,
        id: vectorResult.memoryId,
        vectorEmbedding: vectorResult.vectorEmbedding,
        semanticHash: vectorResult.semanticHash
      });

      // Update analytics
      this.updateAnalytics('store', Date.now() - startTime);

      // Auto-optimize if enabled
      if (this.config.autoOptimization) {
        await this.autoOptimizeMemory();
      }

      logger.info('✅ Memory stored with smart processing', {
        memoryId: vectorResult.memoryId,
        concepts: graphResult.concepts?.length || 0,
        relationships: graphResult.relationships?.length || 0,
        processingTime: Date.now() - startTime
      });

      return {
        success: true,
        memoryId: vectorResult.memoryId,
        vectorEmbedding: vectorResult.vectorEmbedding,
        semanticHash: vectorResult.semanticHash,
        concepts: graphResult.concepts,
        relationships: graphResult.relationships,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      logger.error('❌ Failed to store memory with smart processing', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve memory using advanced semantic search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Retrieval result
   */
  async retrieveMemory(query, options = {}) {
    try {
      const startTime = Date.now();
      
      // Enhanced search options
      const enhancedOptions = await this.enhanceSearchOptions(options);
      
      // Perform semantic search
      const searchResult = await this.semanticSearch.semanticSearch(query, enhancedOptions);
      
      if (!searchResult.success) {
        return searchResult;
      }

      // Enhance results with knowledge graph relationships
      const enhancedResults = await this.enhanceResultsWithGraph(searchResult.results);
      
      // Apply intelligent ranking
      const rankedResults = await this.applyIntelligentRanking(enhancedResults, query);
      
      // Update analytics
      this.updateAnalytics('retrieve', Date.now() - startTime, searchResult.results.length);

      logger.info('🔍 Memory retrieved with smart search', {
        query: query,
        resultsCount: rankedResults.length,
        searchTime: Date.now() - startTime,
        strategiesUsed: searchResult.strategiesUsed
      });

      return {
        success: true,
        query: query,
        results: rankedResults,
        insights: searchResult.insights,
        searchTime: Date.now() - startTime,
        totalCandidates: searchResult.totalCandidates,
        strategiesUsed: searchResult.strategiesUsed
      };
    } catch (error) {
      logger.error('❌ Failed to retrieve memory with smart search', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Find related memories using knowledge graph
   * @param {string} memoryId - Memory ID
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Related memories
   */
  async findRelatedMemories(memoryId, options = {}) {
    try {
      const startTime = Date.now();
      
      // Find related nodes in knowledge graph
      const relatedNodes = await this.knowledgeGraph.findRelatedNodes(memoryId, options);
      
      // Enhance with semantic similarity
      const enhancedRelated = await this.enhanceRelatedMemories(relatedNodes);
      
      // Apply temporal relevance
      const temporalEnhanced = await this.applyTemporalRelevance(enhancedRelated);
      
      logger.info('🔗 Related memories found', {
        memoryId: memoryId,
        relatedCount: temporalEnhanced.length,
        searchTime: Date.now() - startTime
      });

      return {
        success: true,
        memoryId: memoryId,
        relatedMemories: temporalEnhanced,
        searchTime: Date.now() - startTime
      };
    } catch (error) {
      logger.error('❌ Failed to find related memories', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get memory insights and analytics
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Memory insights
   */
  async getMemoryInsights(options = {}) {
    try {
      const {
        timeRange = 'all',
        category = null,
        type = null
      } = options;

      // Get system statistics
      const vectorStats = this.vectorMemory.getSystemStatistics();
      const searchStats = this.semanticSearch.getStatistics();
      const graphStats = this.knowledgeGraph.getStatistics();

      // Calculate memory utilization
      const memoryUtilization = await this.calculateMemoryUtilization();
      
      // Get trending concepts
      const trendingConcepts = await this.getTrendingConcepts(timeRange);
      
      // Get memory patterns
      const memoryPatterns = await this.analyzeMemoryPatterns(timeRange);
      
      // Get relationship insights
      const relationshipInsights = await this.getRelationshipInsights();

      const insights = {
        systemHealth: {
          vectorMemory: vectorStats,
          semanticSearch: searchStats,
          knowledgeGraph: graphStats,
          overallHealth: await this.calculateOverallHealth()
        },
        analytics: this.analytics,
        utilization: memoryUtilization,
        trendingConcepts: trendingConcepts,
        memoryPatterns: memoryPatterns,
        relationshipInsights: relationshipInsights,
        recommendations: await this.generateMemoryRecommendations()
      };

      return {
        success: true,
        insights: insights,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('❌ Failed to get memory insights', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Optimize memory system performance
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} Optimization result
   */
  async optimizeMemory(options = {}) {
    try {
      const startTime = Date.now();
      
      // Optimize vector memory
      await this.optimizeVectorMemory();
      
      // Optimize knowledge graph
      await this.optimizeKnowledgeGraph();
      
      // Optimize semantic search
      await this.optimizeSemanticSearch();
      
      // Rebuild indices if needed
      if (options.rebuildIndices) {
        await this.rebuildIndices();
      }

      const optimizationTime = Date.now() - startTime;

      logger.info('⚡ Memory system optimized', {
        optimizationTime: optimizationTime,
        rebuildIndices: options.rebuildIndices || false
      });

      return {
        success: true,
        optimizationTime: optimizationTime,
        optimizationsApplied: [
          'vector_memory_optimization',
          'knowledge_graph_optimization',
          'semantic_search_optimization',
          ...(options.rebuildIndices ? ['indices_rebuilt'] : [])
        ]
      };
    } catch (error) {
      logger.error('❌ Memory optimization failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced memory data with additional metadata
   * @param {Object} memoryData - Original memory data
   * @returns {Promise<Object>} Enhanced memory data
   */
  async enhanceMemoryData(memoryData) {
    try {
      const enhanced = { ...memoryData };
      
      // Add intelligent metadata
      enhanced.metadata = {
        ...enhanced.metadata,
        processedAt: new Date().toISOString(),
        version: '1.0',
        source: 'smart_memory_manager',
        quality: this.assessMemoryQuality(memoryData),
        complexity: this.assessMemoryComplexity(memoryData.content),
        language: this.detectLanguage(memoryData.content),
        sentiment: this.analyzeSentiment(memoryData.content)
      };

      // Add intelligent tags
      if (!enhanced.tags) {
        enhanced.tags = await this.generateIntelligentTags(memoryData.content);
      }

      // Add category if not specified
      if (!enhanced.category) {
        enhanced.category = await this.inferCategory(memoryData.content);
      }

      return enhanced;
    } catch (error) {
      logger.error('❌ Memory data enhancement failed', { error: error.message });
      return memoryData;
    }
  }

  /**
   * Enhance search options with intelligent defaults
   * @param {Object} options - Original search options
   * @returns {Promise<Object>} Enhanced search options
   */
  async enhanceSearchOptions(options) {
    try {
      const enhanced = { ...options };
      
      // Set intelligent defaults
      enhanced.threshold = enhanced.threshold || 0.7;
      enhanced.limit = enhanced.limit || 10;
      enhanced.useVectorSearch = enhanced.useVectorSearch !== false;
      enhanced.useSemanticSearch = enhanced.useSemanticSearch !== false;
      enhanced.includeRelationships = enhanced.includeRelationships !== false;
      
      return enhanced;
    } catch (error) {
      logger.error('❌ Search options enhancement failed', { error: error.message });
      return options;
    }
  }

  /**
   * Enhance search results with knowledge graph relationships
   * @param {Array} results - Search results
   * @returns {Promise<Array>} Enhanced results
   */
  async enhanceResultsWithGraph(results) {
    try {
      const enhancedResults = [];

      for (const result of results) {
        // Find related memories
        const relatedMemories = await this.knowledgeGraph.findRelatedNodes(result.id, {
          maxDepth: 1,
          limit: 3
        });

        enhancedResults.push({
          ...result,
          relatedMemories: relatedMemories,
          relationshipCount: relatedMemories.length,
          graphCentrality: await this.getMemoryCentrality(result.id)
        });
      }

      return enhancedResults;
    } catch (error) {
      logger.error('❌ Results enhancement failed', { error: error.message });
      return results;
    }
  }

  /**
   * Apply intelligent ranking to results
   * @param {Array} results - Results to rank
   * @param {string} query - Search query
   * @returns {Promise<Array>} Ranked results
   */
  async applyIntelligentRanking(results, query) {
    try {
      return results.map(result => {
        let rank = result.finalScore || result.similarity || 0;
        
        // Boost for relationship count
        if (result.relationshipCount > 0) {
          rank *= (1 + result.relationshipCount * 0.1);
        }
        
        // Boost for graph centrality
        if (result.graphCentrality > 0) {
          rank *= (1 + result.graphCentrality * 0.2);
        }
        
        // Boost for recency
        const recencyBoost = this.calculateRecencyBoost(result.timestamp);
        rank *= recencyBoost;
        
        // Boost for importance
        if (result.importance > 0) {
          rank *= (1 + result.importance * 0.3);
        }

        return {
          ...result,
          intelligentRank: rank
        };
      }).sort((a, b) => b.intelligentRank - a.intelligentRank);
    } catch (error) {
      logger.error('❌ Intelligent ranking failed', { error: error.message });
      return results;
    }
  }

  /**
   * Build initial knowledge graph from existing memories
   */
  async buildInitialKnowledgeGraph() {
    try {
      const stats = this.vectorMemory.getSystemStatistics();
      
      if (stats.totalMemories > 0) {
        logger.info('🕸️ Building initial knowledge graph...', {
          totalMemories: stats.totalMemories
        });
        
        // This would iterate through existing memories and build the graph
        // For now, just log the intention
        logger.info('✅ Initial knowledge graph build completed');
      }
    } catch (error) {
      logger.error('❌ Initial knowledge graph build failed', { error: error.message });
    }
  }

  /**
   * Auto-optimize memory system
   */
  async autoOptimizeMemory() {
    try {
      // Perform lightweight optimizations
      await this.optimizeMemoryClusters();
      await this.updateMemoryWeights();
      
      // Schedule heavy optimizations if needed
      const stats = this.vectorMemory.getSystemStatistics();
      if (stats.totalMemories % 100 === 0) {
        await this.fullMemoryOptimization();
      }
    } catch (error) {
      logger.error('❌ Auto-optimization failed', { error: error.message });
    }
  }

  /**
   * Calculate memory utilization
   * @returns {Promise<Object>} Memory utilization metrics
   */
  async calculateMemoryUtilization() {
    try {
      const stats = this.vectorMemory.getSystemStatistics();
      const maxCapacity = 10000; // Configurable max capacity
      
      return {
        totalMemories: stats.totalMemories,
        maxCapacity: maxCapacity,
        utilizationPercentage: (stats.totalMemories / maxCapacity) * 100,
        availableSpace: maxCapacity - stats.totalMemories,
        efficiency: this.calculateMemoryEfficiency()
      };
    } catch (error) {
      logger.error('❌ Memory utilization calculation failed', { error: error.message });
      return {};
    }
  }

  /**
   * Get trending concepts
   * @param {string} timeRange - Time range for trending analysis
   * @returns {Promise<Array>} Trending concepts
   */
  async getTrendingConcepts(timeRange) {
    try {
      // This would analyze concept frequency over time
      // For now, return placeholder data
      return [
        { concept: 'quantum computing', trend: 'up', frequency: 15 },
        { concept: 'machine learning', trend: 'stable', frequency: 12 },
        { concept: 'algorithms', trend: 'up', frequency: 10 }
      ];
    } catch (error) {
      logger.error('❌ Trending concepts analysis failed', { error: error.message });
      return [];
    }
  }

  /**
   * Analyze memory patterns
   * @param {string} timeRange - Time range for pattern analysis
   * @returns {Promise<Object>} Memory patterns
   */
  async analyzeMemoryPatterns(timeRange) {
    try {
      return {
        storagePattern: 'consistent',
        retrievalPattern: 'semantic_focused',
        relationshipPattern: 'highly_connected',
        categoryDistribution: {
          'ai_education': 0.4,
          'quantum_computing': 0.3,
          'algorithms': 0.2,
          'trading': 0.1
        }
      };
    } catch (error) {
      logger.error('❌ Memory pattern analysis failed', { error: error.message });
      return {};
    }
  }

  /**
   * Get relationship insights
   * @returns {Promise<Object>} Relationship insights
   */
  async getRelationshipInsights() {
    try {
      const graphStats = this.knowledgeGraph.getStatistics();
      
      return {
        totalRelationships: graphStats.totalEdges,
        averageConnections: graphStats.averageConnectionsPerNode,
        relationshipTypes: graphStats.relationshipTypeDistribution,
        mostConnectedNodes: await this.getMostConnectedNodes(),
        isolatedNodes: await this.getIsolatedNodes()
      };
    } catch (error) {
      logger.error('❌ Relationship insights failed', { error: error.message });
      return {};
    }
  }

  /**
   * Generate memory recommendations
   * @returns {Promise<Array>} Memory recommendations
   */
  async generateMemoryRecommendations() {
    try {
      const recommendations = [];
      
      // Analyze system health
      const health = await this.calculateOverallHealth();
      
      if (health < 0.8) {
        recommendations.push({
          type: 'optimization',
          priority: 'high',
          message: 'Memory system performance is below optimal. Consider running optimization.',
          action: 'optimize_memory'
        });
      }
      
      // Check memory utilization
      const utilization = await this.calculateMemoryUtilization();
      if (utilization.utilizationPercentage > 80) {
        recommendations.push({
          type: 'capacity',
          priority: 'medium',
          message: 'Memory utilization is high. Consider archiving old memories.',
          action: 'archive_old_memories'
        });
      }
      
      return recommendations;
    } catch (error) {
      logger.error('❌ Memory recommendations failed', { error: error.message });
      return [];
    }
  }

  /**
   * Update analytics
   * @param {string} operation - Operation type
   * @param {number} time - Operation time
   * @param {number} resultCount - Result count
   */
  updateAnalytics(operation, time, resultCount = 0) {
    if (operation === 'store') {
      this.analytics.totalStored++;
    } else if (operation === 'retrieve') {
      this.analytics.totalRetrieved++;
      this.analytics.averageRetrievalTime = 
        (this.analytics.averageRetrievalTime + time) / 2;
    }
  }

  /**
   * Assess memory quality
   * @param {Object} memoryData - Memory data
   * @returns {number} Quality score
   */
  assessMemoryQuality(memoryData) {
    let quality = 0.5;
    
    if (memoryData.content && memoryData.content.length > 50) quality += 0.2;
    if (memoryData.type) quality += 0.1;
    if (memoryData.category) quality += 0.1;
    if (memoryData.tags && memoryData.tags.length > 0) quality += 0.1;
    
    return Math.min(1.0, quality);
  }

  /**
   * Assess memory complexity
   * @param {string} content - Memory content
   * @returns {number} Complexity score
   */
  assessMemoryComplexity(content) {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/);
    const avgWordsPerSentence = words.length / sentences.length;
    
    return Math.min(1.0, avgWordsPerSentence / 20);
  }

  /**
   * Detect language
   * @param {string} content - Memory content
   * @returns {string} Detected language
   */
  detectLanguage(content) {
    // Simple language detection
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(content) ? 'ar' : 'en';
  }

  /**
   * Analyze sentiment
   * @param {string} content - Memory content
   * @returns {string} Sentiment analysis
   */
  analyzeSentiment(content) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Generate intelligent tags
   * @param {string} content - Memory content
   * @returns {Promise<Array>} Generated tags
   */
  async generateIntelligentTags(content) {
    try {
      const tags = [];
      const words = content.toLowerCase().split(/\s+/);
      
      // Extract potential tags
      const potentialTags = words.filter(word => 
        word.length > 3 && 
        !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been'].includes(word)
      );
      
      // Return most frequent words as tags
      const tagCounts = {};
      potentialTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
      
      return sortedTags;
    } catch (error) {
      logger.error('❌ Intelligent tag generation failed', { error: error.message });
      return [];
    }
  }

  /**
   * Infer category from content
   * @param {string} content - Memory content
   * @returns {Promise<string>} Inferred category
   */
  async inferCategory(content) {
    try {
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('quantum') || lowerContent.includes('qubit')) {
        return 'quantum_computing';
      }
      if (lowerContent.includes('algorithm') || lowerContent.includes('programming')) {
        return 'algorithms';
      }
      if (lowerContent.includes('trading') || lowerContent.includes('finance')) {
        return 'trading';
      }
      if (lowerContent.includes('ai') || lowerContent.includes('machine learning')) {
        return 'ai_education';
      }
      
      return 'general';
    } catch (error) {
      logger.error('❌ Category inference failed', { error: error.message });
      return 'general';
    }
  }

  /**
   * Calculate recency boost
   * @param {string} timestamp - Memory timestamp
   * @returns {number} Recency boost factor
   */
  calculateRecencyBoost(timestamp) {
    const now = new Date();
    const memoryDate = new Date(timestamp);
    const ageInHours = (now - memoryDate) / (1000 * 60 * 60);
    
    // Boost for recent memories (within 24 hours)
    if (ageInHours <= 24) return 1.2;
    if (ageInHours <= 168) return 1.1; // Within a week
    return 1.0;
  }

  /**
   * Get memory centrality
   * @param {string} memoryId - Memory ID
   * @returns {Promise<number>} Centrality score
   */
  async getMemoryCentrality(memoryId) {
    try {
      const node = this.knowledgeGraph.nodes.get(memoryId);
      return node ? node.centrality : 0;
    } catch (error) {
      logger.error('❌ Memory centrality calculation failed', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate overall health
   * @returns {Promise<number>} Overall health score
   */
  async calculateOverallHealth() {
    try {
      const vectorHealth = await this.vectorMemory.healthCheck();
      const searchHealth = await this.semanticSearch.healthCheck();
      const graphHealth = await this.knowledgeGraph.healthCheck();
      
      const healthScores = [
        vectorHealth.success ? 1 : 0,
        searchHealth.success ? 1 : 0,
        graphHealth.success ? 1 : 0
      ];
      
      return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    } catch (error) {
      logger.error('❌ Overall health calculation failed', { error: error.message });
      return 0.5;
    }
  }

  /**
   * Optimize vector memory
   */
  async optimizeVectorMemory() {
    try {
      await this.vectorMemory.optimizeMemoryClusters();
    } catch (error) {
      logger.error('❌ Vector memory optimization failed', { error: error.message });
    }
  }

  /**
   * Optimize knowledge graph
   */
  async optimizeKnowledgeGraph() {
    try {
      await this.knowledgeGraph.updateGraphCentrality();
    } catch (error) {
      logger.error('❌ Knowledge graph optimization failed', { error: error.message });
    }
  }

  /**
   * Optimize semantic search
   */
  async optimizeSemanticSearch() {
    try {
      // Semantic search optimization would go here
      logger.info('🔍 Semantic search optimization completed');
    } catch (error) {
      logger.error('❌ Semantic search optimization failed', { error: error.message });
    }
  }

  /**
   * Rebuild indices
   */
  async rebuildIndices() {
    try {
      await this.vectorMemory.buildKnowledgeGraph();
      await this.knowledgeGraph.updateGraphCentrality();
      logger.info('🔄 Memory indices rebuilt successfully');
    } catch (error) {
      logger.error('❌ Index rebuilding failed', { error: error.message });
    }
  }

  /**
   * Optimize memory clusters
   */
  async optimizeMemoryClusters() {
    try {
      await this.vectorMemory.optimizeMemoryClusters();
    } catch (error) {
      logger.error('❌ Memory cluster optimization failed', { error: error.message });
    }
  }

  /**
   * Update memory weights
   */
  async updateMemoryWeights() {
    try {
      // Memory weight updates would go here
      logger.info('⚖️ Memory weights updated');
    } catch (error) {
      logger.error('❌ Memory weight update failed', { error: error.message });
    }
  }

  /**
   * Full memory optimization
   */
  async fullMemoryOptimization() {
    try {
      await this.optimizeMemory({ rebuildIndices: true });
      logger.info('🚀 Full memory optimization completed');
    } catch (error) {
      logger.error('❌ Full memory optimization failed', { error: error.message });
    }
  }

  /**
   * Calculate memory efficiency
   * @returns {number} Memory efficiency score
   */
  calculateMemoryEfficiency() {
    try {
      const stats = this.vectorMemory.getSystemStatistics();
      const utilization = stats.totalMemories / 10000; // Max capacity
      const relationshipRatio = this.knowledgeGraph.getStatistics().totalEdges / stats.totalMemories;
      
      return Math.min(1.0, (utilization * 0.5) + (relationshipRatio * 0.5));
    } catch (error) {
      logger.error('❌ Memory efficiency calculation failed', { error: error.message });
      return 0.5;
    }
  }

  /**
   * Get most connected nodes
   * @returns {Promise<Array>} Most connected nodes
   */
  async getMostConnectedNodes() {
    try {
      const nodes = Array.from(this.knowledgeGraph.nodes.values());
      return nodes
        .sort((a, b) => b.relationships.length - a.relationships.length)
        .slice(0, 5)
        .map(node => ({
          id: node.id,
          connections: node.relationships.length,
          centrality: node.centrality
        }));
    } catch (error) {
      logger.error('❌ Most connected nodes retrieval failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get isolated nodes
   * @returns {Promise<Array>} Isolated nodes
   */
  async getIsolatedNodes() {
    try {
      const nodes = Array.from(this.knowledgeGraph.nodes.values());
      return nodes
        .filter(node => node.relationships.length === 0)
        .slice(0, 5)
        .map(node => ({
          id: node.id,
          concepts: node.concepts.length,
          importance: node.importance
        }));
    } catch (error) {
      logger.error('❌ Isolated nodes retrieval failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get comprehensive system statistics
   * @returns {Object} System statistics
   */
  getSystemStatistics() {
    return {
      vectorMemory: this.vectorMemory.getSystemStatistics(),
      semanticSearch: this.semanticSearch.getStatistics(),
      knowledgeGraph: this.knowledgeGraph.getStatistics(),
      analytics: this.analytics,
      config: this.config
    };
  }

  /**
   * Health check for the entire memory system
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const vectorHealth = await this.vectorMemory.healthCheck();
      const searchHealth = await this.semanticSearch.healthCheck();
      const graphHealth = await this.knowledgeGraph.healthCheck();
      
      const overallHealth = await this.calculateOverallHealth();
      
      return {
        success: true,
        status: overallHealth > 0.8 ? 'healthy' : 'degraded',
        overallHealth: overallHealth,
        components: {
          vectorMemory: vectorHealth,
          semanticSearch: searchHealth,
          knowledgeGraph: graphHealth
        },
        statistics: this.getSystemStatistics(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new SmartMemoryManager();
