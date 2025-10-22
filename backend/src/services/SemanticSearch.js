/**
 * SemanticSearch - Semantic search service with vector similarity
 * 
 * Features:
 * - Natural language queries
 * - Vector similarity search with Gemini embeddings
 * - Ranked results with context
 * - Filters (file type, directory, date)
 * - Caching with Redis
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const redisCache = require('../cache/RedisCache');

class SemanticSearch {
  constructor(indexer) {
    this.indexer = indexer;
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
    });
    this.cachePrefix = 'semantic_search:';
    this.cacheTTL = 1800; // 30 minutes
  }

  /**
   * Search with natural language query
   */
  async search(query, options = {}) {
    const {
      limit = 10,
      threshold = 0.7,
      fileTypes = [],
      directories = [],
      dateFrom = null,
      dateTo = null
    } = options;

    // Check cache
    const cacheKey = `${this.cachePrefix}${query}:${JSON.stringify(options)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log('✅ Returning cached search results');
      return JSON.parse(cached);
    }

    console.log(`🔍 Searching for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(query);
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }

    // Get all indexed entries
    const entries = Array.from(this.indexer.index.values());

    // Apply filters
    let filtered = entries;

    if (fileTypes.length > 0) {
      filtered = filtered.filter(e => fileTypes.includes(e.extension));
    }

    if (directories.length > 0) {
      filtered = filtered.filter(e => 
        directories.some(dir => e.path.startsWith(dir))
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(e => 
        new Date(e.lastModified) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(e => 
        new Date(e.lastModified) <= new Date(dateTo)
      );
    }

    // Calculate similarity scores
    const results = [];
    for (const entry of filtered) {
      if (!entry.embedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding);
      if (similarity >= threshold) {
        results.push({
          path: entry.path,
          extension: entry.extension,
          functions: entry.functions,
          classes: entry.classes,
          components: entry.components,
          lines: entry.lines,
          lastModified: entry.lastModified,
          similarity,
          score: similarity,
          relevance: this.calculateRelevance(entry, query, similarity)
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    const limited = results.slice(0, limit);

    // Cache results
    await redisCache.set(cacheKey, JSON.stringify(limited), this.cacheTTL);

    console.log(`✅ Found ${limited.length} results`);
    return limited;
  }

  /**
   * Generate embedding for search query
   */
  async generateQueryEmbedding(query) {
    try {
      const result = await this.model.embedContent(query);
      return result.embedding.values;
    } catch (error) {
      console.error('❌ Error generating query embedding:', error.message);
      return null;
    }
  }

  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate relevance score (combines similarity with other factors)
   */
  calculateRelevance(entry, query, similarity) {
    let relevance = similarity;

    // Boost if query matches function/class names
    const queryLower = query.toLowerCase();
    const names = [
      ...entry.functions.map(f => f.name.toLowerCase()),
      ...entry.classes.map(c => c.name.toLowerCase()),
      ...entry.components.map(c => c.toLowerCase())
    ];

    if (names.some(name => name.includes(queryLower) || queryLower.includes(name))) {
      relevance += 0.2;
    }

    // Boost recent files slightly
    const daysSinceModified = (Date.now() - new Date(entry.lastModified)) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 7) {
      relevance += 0.05;
    }

    // Normalize to 0-1 range
    return Math.min(relevance, 1.0);
  }

  /**
   * Find similar files to a given file
   */
  async findSimilar(filePath, options = {}) {
    const limit = options.limit || 5;
    const threshold = options.threshold || 0.8;

    const entry = this.indexer.index.get(filePath);
    if (!entry || !entry.embedding) {
      throw new Error(`File not found in index: ${filePath}`);
    }

    const results = [];
    for (const [path, otherEntry] of this.indexer.index.entries()) {
      if (path === filePath || !otherEntry.embedding) continue;

      const similarity = this.cosineSimilarity(entry.embedding, otherEntry.embedding);
      if (similarity >= threshold) {
        results.push({
          path: otherEntry.path,
          similarity,
          score: similarity
        });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(partialQuery, limit = 5) {
    const entries = Array.from(this.indexer.index.values());
    const suggestions = new Set();

    const queryLower = partialQuery.toLowerCase();

    for (const entry of entries) {
      // Suggest function names
      entry.functions.forEach(f => {
        if (f.name.toLowerCase().includes(queryLower)) {
          suggestions.add(f.name);
        }
      });

      // Suggest class names
      entry.classes.forEach(c => {
        if (c.name.toLowerCase().includes(queryLower)) {
          suggestions.add(c.name);
        }
      });

      // Suggest component names
      entry.components.forEach(c => {
        if (c.toLowerCase().includes(queryLower)) {
          suggestions.add(c);
        }
      });

      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Clear search cache
   */
  async clearCache() {
    // Redis doesn't have a built-in way to delete by prefix in our simple implementation
    // This would need to be implemented in RedisCache if needed
    console.log('⚠️  Cache clearing not implemented yet');
  }
}

module.exports = SemanticSearch;
