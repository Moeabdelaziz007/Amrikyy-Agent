/**
 * 🕸️ Knowledge Graph System - Interconnected Memory Storage
 * Advanced knowledge graph for semantic relationships and intelligent connections
 */

const VectorMemorySystem = require('./VectorMemorySystem');
const { logger } = require('../utils/logger');

class KnowledgeGraph {
  constructor() {
    this.name = 'knowledge_graph';
    this.description = 'Interconnected knowledge graph for semantic memory relationships';
    
    // Graph structures
    this.nodes = new Map(); // Memory nodes
    this.edges = new Map(); // Relationships between memories
    this.conceptIndex = new Map(); // Concept-based indexing
    this.relationshipTypes = new Map(); // Relationship type definitions
    
    // Graph configuration
    this.config = {
      maxConnectionsPerNode: 10,
      relationshipThreshold: 0.6,
      conceptSimilarityThreshold: 0.7,
      temporalDecayFactor: 0.9,
      importanceWeight: 1.2
    };

    // Initialize relationship types
    this.initializeRelationshipTypes();
  }

  /**
   * Initialize relationship types and their properties
   */
  initializeRelationshipTypes() {
    this.relationshipTypes.set('similar', {
      weight: 0.8,
      bidirectional: true,
      decayRate: 0.1,
      description: 'Semantically similar content'
    });

    this.relationshipTypes.set('related', {
      weight: 0.6,
      bidirectional: true,
      decayRate: 0.15,
      description: 'Conceptually related content'
    });

    this.relationshipTypes.set('prerequisite', {
      weight: 0.9,
      bidirectional: false,
      decayRate: 0.05,
      description: 'Prerequisite knowledge relationship'
    });

    this.relationshipTypes.set('follows', {
      weight: 0.7,
      bidirectional: false,
      decayRate: 0.1,
      description: 'Sequential learning relationship'
    });

    this.relationshipTypes.set('contradicts', {
      weight: 0.5,
      bidirectional: true,
      decayRate: 0.2,
      description: 'Contradictory information'
    });

    this.relationshipTypes.set('elaborates', {
      weight: 0.8,
      bidirectional: false,
      decayRate: 0.1,
      description: 'Detailed explanation of concept'
    });

    this.relationshipTypes.set('examples', {
      weight: 0.7,
      bidirectional: false,
      decayRate: 0.12,
      description: 'Example of concept or principle'
    });
  }

  /**
   * Add memory node to knowledge graph
   * @param {Object} memory - Memory object
   * @returns {Promise<Object>} Node addition result
   */
  async addMemoryNode(memory) {
    try {
      const nodeId = memory.id;
      
      // Create knowledge graph node
      const node = {
        id: nodeId,
        memory: memory,
        concepts: await this.extractConcepts(memory.content),
        relationships: [],
        centrality: 0,
        importance: memory.importance || 0.5,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Store node
      this.nodes.set(nodeId, node);

      // Update concept index
      await this.updateConceptIndex(node);

      // Find and create relationships
      await this.findAndCreateRelationships(node);

      // Update graph centrality
      await this.updateGraphCentrality();

      logger.info('✅ Memory node added to knowledge graph', {
        nodeId,
        concepts: node.concepts.length,
        relationships: node.relationships.length
      });

      return {
        success: true,
        nodeId: nodeId,
        concepts: node.concepts,
        relationships: node.relationships
      };
    } catch (error) {
      logger.error('❌ Failed to add memory node', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract concepts from memory content
   * @param {string} content - Memory content
   * @returns {Promise<Array>} Extracted concepts
   */
  async extractConcepts(content) {
    try {
      // Advanced concept extraction
      const concepts = [];
      
      // Extract technical terms
      const technicalTerms = this.extractTechnicalTerms(content);
      concepts.push(...technicalTerms);

      // Extract entities
      const entities = this.extractEntities(content);
      concepts.push(...entities);

      // Extract key phrases
      const keyPhrases = this.extractKeyPhrases(content);
      concepts.push(...keyPhrases);

      // Deduplicate and normalize
      const uniqueConcepts = [...new Set(concepts.map(c => c.toLowerCase().trim()))];
      
      return uniqueConcepts.map(concept => ({
        term: concept,
        frequency: this.calculateConceptFrequency(concept, content),
        importance: this.calculateConceptImportance(concept, content),
        type: this.classifyConceptType(concept)
      }));
    } catch (error) {
      logger.error('❌ Failed to extract concepts', { error: error.message });
      return [];
    }
  }

  /**
   * Extract technical terms from content
   * @param {string} content - Content to analyze
   * @returns {Array} Technical terms
   */
  extractTechnicalTerms(content) {
    // Technical term patterns
    const patterns = [
      /\b[A-Z][a-z]*(?:[A-Z][a-z]*)*\b/g, // CamelCase
      /\b\w+\.(?:js|py|java|cpp|ts|jsx|tsx)\b/g, // File extensions
      /\b(?:API|HTTP|HTTPS|JSON|XML|SQL|NoSQL|AI|ML|DL|NLP|CV)\b/g, // Acronyms
      /\b(?:function|class|method|variable|constant|interface|type)\b/g, // Programming terms
      /\b(?:algorithm|data structure|complexity|optimization)\b/g, // CS terms
      /\b(?:quantum|superposition|entanglement|qubit|gate)\b/g, // Quantum terms
      /\b(?:neural network|deep learning|backpropagation|gradient)\b/g // ML terms
    ];

    const terms = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        terms.push(...matches);
      }
    });

    return [...new Set(terms)];
  }

  /**
   * Extract entities from content
   * @param {string} content - Content to analyze
   * @returns {Array} Entities
   */
  extractEntities(content) {
    // Entity patterns
    const patterns = [
      /\b(?:MIT|Stanford|Princeton|Harvard|Berkeley)\b/g, // Universities
      /\b(?:Google|Microsoft|IBM|Amazon|Facebook|Apple)\b/g, // Companies
      /\b(?:React|Vue|Angular|Node\.js|Python|JavaScript|TypeScript)\b/g, // Technologies
      /\b(?:Qiskit|TensorFlow|PyTorch|Scikit-learn|Pandas|NumPy)\b/g, // Libraries
      /\b(?:GitHub|GitLab|Docker|Kubernetes|AWS|Azure|GCP)\b/g // Tools/Platforms
    ];

    const entities = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)];
  }

  /**
   * Extract key phrases from content
   * @param {string} content - Content to analyze
   * @returns {Array} Key phrases
   */
  extractKeyPhrases(content) {
    // Simple key phrase extraction
    const sentences = content.split(/[.!?]+/);
    const phrases = [];

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 5) {
        phrases.push(words.join(' '));
      }
    });

    return phrases;
  }

  /**
   * Calculate concept frequency in content
   * @param {string} concept - Concept to count
   * @param {string} content - Content to analyze
   * @returns {number} Frequency score
   */
  calculateConceptFrequency(concept, content) {
    const regex = new RegExp(`\\b${concept}\\b`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate concept importance
   * @param {string} concept - Concept to analyze
   * @param {string} content - Content to analyze
   * @returns {number} Importance score
   */
  calculateConceptImportance(concept, content) {
    const frequency = this.calculateConceptFrequency(concept, content);
    const contentLength = content.split(/\s+/).length;
    const tf = frequency / contentLength;

    // Simple importance calculation
    let importance = tf;
    
    // Boost for technical terms
    if (this.isTechnicalTerm(concept)) {
      importance *= 1.5;
    }
    
    // Boost for capitalized terms
    if (concept[0] === concept[0].toUpperCase()) {
      importance *= 1.3;
    }

    return Math.min(1.0, importance);
  }

  /**
   * Check if term is technical
   * @param {string} term - Term to check
   * @returns {boolean} Is technical term
   */
  isTechnicalTerm(term) {
    const technicalTerms = [
      'algorithm', 'function', 'class', 'method', 'variable', 'API', 'HTTP',
      'JSON', 'SQL', 'database', 'server', 'client', 'framework', 'library',
      'quantum', 'superposition', 'entanglement', 'qubit', 'neural', 'network',
      'machine', 'learning', 'artificial', 'intelligence', 'deep', 'learning'
    ];

    return technicalTerms.some(tech => 
      term.toLowerCase().includes(tech) || tech.includes(term.toLowerCase())
    );
  }

  /**
   * Classify concept type
   * @param {string} concept - Concept to classify
   * @returns {string} Concept type
   */
  classifyConceptType(concept) {
    if (this.isTechnicalTerm(concept)) return 'technical';
    if (/^[A-Z]/.test(concept)) return 'proper_noun';
    if (concept.includes('.')) return 'file';
    if (concept.length > 10) return 'phrase';
    return 'general';
  }

  /**
   * Update concept index
   * @param {Object} node - Knowledge graph node
   */
  async updateConceptIndex(node) {
    try {
      node.concepts.forEach(concept => {
        const conceptKey = concept.term.toLowerCase();
        
        if (!this.conceptIndex.has(conceptKey)) {
          this.conceptIndex.set(conceptKey, []);
        }
        
        this.conceptIndex.get(conceptKey).push({
          nodeId: node.id,
          importance: concept.importance,
          frequency: concept.frequency,
          type: concept.type
        });
      });
    } catch (error) {
      logger.error('❌ Failed to update concept index', { error: error.message });
    }
  }

  /**
   * Find and create relationships for a node
   * @param {Object} node - Knowledge graph node
   */
  async findAndCreateRelationships(node) {
    try {
      const relationships = [];

      // Find concept-based relationships
      const conceptRelationships = await this.findConceptRelationships(node);
      relationships.push(...conceptRelationships);

      // Find semantic relationships
      const semanticRelationships = await this.findSemanticRelationships(node);
      relationships.push(...semanticRelationships);

      // Find temporal relationships
      const temporalRelationships = await this.findTemporalRelationships(node);
      relationships.push(...temporalRelationships);

      // Create edges for relationships
      for (const relationship of relationships) {
        await this.createRelationship(node.id, relationship);
      }

      node.relationships = relationships;
    } catch (error) {
      logger.error('❌ Failed to find relationships', { error: error.message });
    }
  }

  /**
   * Find concept-based relationships
   * @param {Object} node - Knowledge graph node
   * @returns {Promise<Array>} Concept relationships
   */
  async findConceptRelationships(node) {
    try {
      const relationships = [];

      for (const concept of node.concepts) {
        const relatedNodes = this.conceptIndex.get(concept.term.toLowerCase()) || [];
        
        for (const relatedNode of relatedNodes) {
          if (relatedNode.nodeId !== node.id) {
            const similarity = this.calculateConceptSimilarity(concept, relatedNode);
            
            if (similarity >= this.config.relationshipThreshold) {
              relationships.push({
                targetNodeId: relatedNode.nodeId,
                relationshipType: 'similar',
                strength: similarity,
                concept: concept.term,
                bidirectional: true
              });
            }
          }
        }
      }

      return relationships;
    } catch (error) {
      logger.error('❌ Failed to find concept relationships', { error: error.message });
      return [];
    }
  }

  /**
   * Find semantic relationships
   * @param {Object} node - Knowledge graph node
   * @returns {Promise<Array>} Semantic relationships
   */
  async findSemanticRelationships(node) {
    try {
      const relationships = [];

      for (const [otherNodeId, otherNode] of this.nodes) {
        if (otherNodeId === node.id) continue;

        const semanticSimilarity = await this.calculateSemanticSimilarity(node, otherNode);
        
        if (semanticSimilarity >= this.config.relationshipThreshold) {
          relationships.push({
            targetNodeId: otherNodeId,
            relationshipType: 'related',
            strength: semanticSimilarity,
            bidirectional: true
          });
        }
      }

      return relationships;
    } catch (error) {
      logger.error('❌ Failed to find semantic relationships', { error: error.message });
      return [];
    }
  }

  /**
   * Find temporal relationships
   * @param {Object} node - Knowledge graph node
   * @returns {Promise<Array>} Temporal relationships
   */
  async findTemporalRelationships(node) {
    try {
      const relationships = [];
      const nodeTime = new Date(node.memory.timestamp);

      for (const [otherNodeId, otherNode] of this.nodes) {
        if (otherNodeId === node.id) continue;

        const otherTime = new Date(otherNode.memory.timestamp);
        const timeDiff = Math.abs(nodeTime - otherTime);
        const timeDiffHours = timeDiff / (1000 * 60 * 60);

        // Temporal proximity relationship
        if (timeDiffHours <= 24) { // Within 24 hours
          relationships.push({
            targetNodeId: otherNodeId,
            relationshipType: 'temporal_proximity',
            strength: Math.max(0.1, 1 - (timeDiffHours / 24)),
            bidirectional: true
          });
        }

        // Sequential relationship (if one follows the other)
        if (timeDiffHours > 0 && timeDiffHours <= 168) { // Within a week
          const isSequential = nodeTime > otherTime;
          if (isSequential) {
            relationships.push({
              targetNodeId: otherNodeId,
              relationshipType: 'follows',
              strength: Math.max(0.1, 1 - (timeDiffHours / 168)),
              bidirectional: false
            });
          }
        }
      }

      return relationships;
    } catch (error) {
      logger.error('❌ Failed to find temporal relationships', { error: error.message });
      return [];
    }
  }

  /**
   * Calculate concept similarity
   * @param {Object} concept1 - First concept
   * @param {Object} concept2 - Second concept
   * @returns {number} Similarity score
   */
  calculateConceptSimilarity(concept1, concept2) {
    // Simple concept similarity based on term matching
    if (concept1.term === concept2.term) return 1.0;
    
    // Check for partial matches
    if (concept1.term.includes(concept2.term) || concept2.term.includes(concept1.term)) {
      return 0.7;
    }
    
    // Check for semantic similarity (simplified)
    const similarity = this.calculateStringSimilarity(concept1.term, concept2.term);
    return similarity;
  }

  /**
   * Calculate semantic similarity between nodes
   * @param {Object} node1 - First node
   * @param {Object} node2 - Second node
   * @returns {Promise<number>} Semantic similarity
   */
  async calculateSemanticSimilarity(node1, node2) {
    try {
      // Use vector embeddings if available
      if (node1.memory.vectorEmbedding && node2.memory.vectorEmbedding) {
        return this.calculateCosineSimilarity(
          node1.memory.vectorEmbedding,
          node2.memory.vectorEmbedding
        );
      }

      // Fallback to concept-based similarity
      const conceptSimilarity = this.calculateNodeConceptSimilarity(node1, node2);
      return conceptSimilarity;
    } catch (error) {
      logger.error('❌ Semantic similarity calculation failed', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate node concept similarity
   * @param {Object} node1 - First node
   * @param {Object} node2 - Second node
   * @returns {number} Concept similarity
   */
  calculateNodeConceptSimilarity(node1, node2) {
    const concepts1 = node1.concepts.map(c => c.term);
    const concepts2 = node2.concepts.map(c => c.term);
    
    const intersection = concepts1.filter(c => concepts2.includes(c));
    const union = [...new Set([...concepts1, ...concepts2])];
    
    return intersection.length / union.length;
  }

  /**
   * Calculate cosine similarity
   * @param {Array} vectorA - First vector
   * @param {Array} vectorB - Second vector
   * @returns {number} Cosine similarity
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
   * Calculate string similarity
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} String similarity
   */
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  calculateEditDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Create relationship between nodes
   * @param {string} sourceNodeId - Source node ID
   * @param {Object} relationship - Relationship object
   */
  async createRelationship(sourceNodeId, relationship) {
    try {
      const edgeId = `${sourceNodeId}_${relationship.targetNodeId}`;
      
      const edge = {
        id: edgeId,
        sourceNodeId: sourceNodeId,
        targetNodeId: relationship.targetNodeId,
        relationshipType: relationship.relationshipType,
        strength: relationship.strength,
        concept: relationship.concept,
        bidirectional: relationship.bidirectional,
        createdAt: new Date().toISOString()
      };

      this.edges.set(edgeId, edge);

      // Update node relationships
      const sourceNode = this.nodes.get(sourceNodeId);
      if (sourceNode) {
        sourceNode.relationships.push(relationship);
      }

      // Create bidirectional edge if needed
      if (relationship.bidirectional) {
        const reverseEdgeId = `${relationship.targetNodeId}_${sourceNodeId}`;
        const reverseEdge = {
          ...edge,
          id: reverseEdgeId,
          sourceNodeId: relationship.targetNodeId,
          targetNodeId: sourceNodeId
        };
        this.edges.set(reverseEdgeId, reverseEdge);

        const targetNode = this.nodes.get(relationship.targetNodeId);
        if (targetNode) {
          targetNode.relationships.push({
            ...relationship,
            targetNodeId: sourceNodeId
          });
        }
      }
    } catch (error) {
      logger.error('❌ Failed to create relationship', { error: error.message });
    }
  }

  /**
   * Update graph centrality measures
   */
  async updateGraphCentrality() {
    try {
      // Calculate degree centrality for each node
      for (const [nodeId, node] of this.nodes) {
        const degree = node.relationships.length;
        const maxPossibleDegree = this.nodes.size - 1;
        node.centrality = maxPossibleDegree > 0 ? degree / maxPossibleDegree : 0;
      }
    } catch (error) {
      logger.error('❌ Failed to update graph centrality', { error: error.message });
    }
  }

  /**
   * Find related nodes through knowledge graph
   * @param {string} nodeId - Source node ID
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Related nodes
   */
  async findRelatedNodes(nodeId, options = {}) {
    try {
      const {
        maxDepth = 2,
        relationshipTypes = null,
        minStrength = 0.5,
        limit = 10
      } = options;

      const relatedNodes = [];
      const visited = new Set();
      const queue = [{ nodeId: nodeId, depth: 0 }];

      while (queue.length > 0 && relatedNodes.length < limit) {
        const { nodeId: currentNodeId, depth } = queue.shift();

        if (visited.has(currentNodeId) || depth > maxDepth) continue;
        visited.add(currentNodeId);

        const node = this.nodes.get(currentNodeId);
        if (!node) continue;

        for (const relationship of node.relationships) {
          if (relationship.strength >= minStrength) {
            if (!relationshipTypes || relationshipTypes.includes(relationship.relationshipType)) {
              const relatedNode = this.nodes.get(relationship.targetNodeId);
              if (relatedNode && !visited.has(relationship.targetNodeId)) {
                relatedNodes.push({
                  ...relatedNode,
                  relationshipStrength: relationship.strength,
                  relationshipType: relationship.relationshipType,
                  distance: depth + 1
                });

                if (depth < maxDepth) {
                  queue.push({ nodeId: relationship.targetNodeId, depth: depth + 1 });
                }
              }
            }
          }
        }
      }

      // Sort by relationship strength and distance
      return relatedNodes.sort((a, b) => {
        const scoreA = a.relationshipStrength / (a.distance + 1);
        const scoreB = b.relationshipStrength / (b.distance + 1);
        return scoreB - scoreA;
      });
    } catch (error) {
      logger.error('❌ Failed to find related nodes', { error: error.message });
      return [];
    }
  }

  /**
   * Get knowledge graph statistics
   * @returns {Object} Graph statistics
   */
  getStatistics() {
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      totalConcepts: this.conceptIndex.size,
      averageConnectionsPerNode: this.nodes.size > 0 ? this.edges.size / this.nodes.size : 0,
      relationshipTypeDistribution: this.getRelationshipTypeDistribution(),
      conceptDistribution: this.getConceptDistribution()
    };
  }

  /**
   * Get relationship type distribution
   * @returns {Object} Relationship type distribution
   */
  getRelationshipTypeDistribution() {
    const distribution = {};
    
    for (const edge of this.edges.values()) {
      distribution[edge.relationshipType] = (distribution[edge.relationshipType] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Get concept distribution
   * @returns {Object} Concept distribution
   */
  getConceptDistribution() {
    const distribution = {};
    
    for (const [concept, nodes] of this.conceptIndex) {
      distribution[concept] = nodes.length;
    }

    return distribution;
  }

  /**
   * Health check for knowledge graph
   * @returns {Object} Health status
   */
  async healthCheck() {
    try {
      const stats = this.getStatistics();
      
      return {
        success: true,
        status: 'healthy',
        statistics: stats,
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

module.exports = new KnowledgeGraph();
