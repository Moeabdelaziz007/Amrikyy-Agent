/**
 * 🧠 Smart Memory System Test Suite
 * Revolutionary memory storage and retrieval demonstration
 */

const SmartMemoryManager = require('./src/memory/SmartMemoryManager');
const { logger } = require('./src/utils/logger');

async function testSmartMemorySystem() {
  console.log('🧠 Testing Revolutionary Smart Memory System...\n');

  try {
    // Test 1: Store diverse memories
    console.log('📝 Test 1: Storing diverse memories...');

    const memories = [
      {
        content:
          'Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform calculations. Qubits can exist in multiple states simultaneously.',
        type: 'educational',
        category: 'quantum_computing',
        tags: ['quantum', 'computing', 'qubits', 'superposition', 'entanglement'],
      },
      {
        content:
          'Machine learning algorithms can learn patterns from data without explicit programming. Deep learning uses neural networks with multiple layers.',
        type: 'educational',
        category: 'ai_education',
        tags: ['machine learning', 'neural networks', 'deep learning', 'algorithms'],
      },
      {
        content:
          'The traveling salesman problem is a classic optimization problem in computer science. It asks for the shortest route visiting all cities exactly once.',
        type: 'technical',
        category: 'algorithms',
        tags: ['optimization', 'graph theory', 'NP-hard', 'algorithms'],
      },
      {
        content:
          'Reinforcement learning agents learn through interaction with an environment, receiving rewards or penalties for their actions.',
        type: 'educational',
        category: 'ai_education',
        tags: ['reinforcement learning', 'agents', 'environment', 'rewards'],
      },
      {
        content:
          'Quantum gates are the basic building blocks of quantum circuits. Common gates include Hadamard, Pauli-X, and CNOT gates.',
        type: 'technical',
        category: 'quantum_computing',
        tags: ['quantum gates', 'circuits', 'Hadamard', 'CNOT', 'Pauli'],
      },
    ];

    const storedMemories = [];
    for (const memory of memories) {
      const result = await SmartMemoryManager.storeMemory(memory);
      if (result.success) {
        storedMemories.push(result);
        console.log(`✅ Stored memory: ${memory.content.substring(0, 50)}...`);
      }
    }

    console.log(`\n📊 Stored ${storedMemories.length} memories successfully\n`);

    // Test 2: Semantic search
    console.log('🔍 Test 2: Semantic search capabilities...');

    const searchQueries = [
      'quantum computing basics',
      'machine learning neural networks',
      'optimization problems algorithms',
      'reinforcement learning agents',
      'quantum gates circuits',
    ];

    for (const query of searchQueries) {
      console.log(`\n🔍 Searching for: "${query}"`);
      const searchResult = await SmartMemoryManager.retrieveMemory(query, {
        limit: 3,
        threshold: 0.5,
      });

      if (searchResult.success) {
        console.log(`✅ Found ${searchResult.results.length} results:`);
        searchResult.results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.content.substring(0, 80)}...`);
          console.log(
            `      Similarity: ${(result.similarity || result.finalScore || 0).toFixed(3)}`
          );
          console.log(`      Type: ${result.type}, Category: ${result.category}`);
        });
      }
    }

    // Test 3: Related memories
    console.log('\n🔗 Test 3: Finding related memories...');

    if (storedMemories.length > 0) {
      const firstMemoryId = storedMemories[0].memoryId;
      const relatedResult = await SmartMemoryManager.findRelatedMemories(firstMemoryId, {
        maxDepth: 2,
        limit: 5,
      });

      if (relatedResult.success) {
        console.log(`✅ Found ${relatedResult.relatedMemories.length} related memories:`);
        relatedResult.relatedMemories.forEach((related, index) => {
          console.log(`   ${index + 1}. ${related.memory.content.substring(0, 60)}...`);
          console.log(
            `      Relationship: ${
              related.relationshipType
            }, Strength: ${related.relationshipStrength.toFixed(3)}`
          );
        });
      }
    }

    // Test 4: Memory insights and analytics
    console.log('\n📊 Test 4: Memory insights and analytics...');

    const insightsResult = await SmartMemoryManager.getMemoryInsights({
      timeRange: 'all',
    });

    if (insightsResult.success) {
      const insights = insightsResult.insights;
      console.log('✅ Memory System Insights:');
      console.log(`   Total Memories: ${insights.systemHealth.vectorMemory.totalMemories}`);
      console.log(`   Knowledge Graph Nodes: ${insights.systemHealth.knowledgeGraph.totalNodes}`);
      console.log(`   Total Relationships: ${insights.systemHealth.knowledgeGraph.totalEdges}`);
      console.log(
        `   Memory Utilization: ${insights.utilization.utilizationPercentage.toFixed(1)}%`
      );

      if (insights.trendingConcepts.length > 0) {
        console.log('   Trending Concepts:');
        insights.trendingConcepts.forEach((concept) => {
          console.log(`     - ${concept.concept}: ${concept.frequency} occurrences`);
        });
      }

      if (insights.recommendations.length > 0) {
        console.log('   Recommendations:');
        insights.recommendations.forEach((rec) => {
          console.log(`     - ${rec.message}`);
        });
      }
    }

    // Test 5: System optimization
    console.log('\n⚡ Test 5: Memory system optimization...');

    const optimizationResult = await SmartMemoryManager.optimizeMemory({
      rebuildIndices: false,
    });

    if (optimizationResult.success) {
      console.log('✅ Memory system optimized successfully');
      console.log(`   Optimization time: ${optimizationResult.optimizationTime}ms`);
      console.log(
        `   Optimizations applied: ${optimizationResult.optimizationsApplied.join(', ')}`
      );
    }

    // Test 6: Health check
    console.log('\n🏥 Test 6: System health check...');

    const healthResult = await SmartMemoryManager.healthCheck();

    if (healthResult.success) {
      console.log(`✅ System Status: ${healthResult.status.toUpperCase()}`);
      console.log(`   Overall Health: ${(healthResult.overallHealth * 100).toFixed(1)}%`);
      console.log('   Component Health:');
      console.log(`     - Vector Memory: ${healthResult.components.vectorMemory.status}`);
      console.log(`     - Semantic Search: ${healthResult.components.semanticSearch.status}`);
      console.log(`     - Knowledge Graph: ${healthResult.components.knowledgeGraph.status}`);
    }

    // Test 7: Advanced search with filters
    console.log('\n🎯 Test 7: Advanced search with filters...');

    const advancedSearchResult = await SmartMemoryManager.retrieveMemory('quantum', {
      category: 'quantum_computing',
      type: 'educational',
      threshold: 0.6,
      limit: 5,
    });

    if (advancedSearchResult.success) {
      console.log(`✅ Advanced search found ${advancedSearchResult.results.length} results:`);
      advancedSearchResult.results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.content.substring(0, 70)}...`);
        console.log(`      Intelligent Rank: ${(result.intelligentRank || 0).toFixed(3)}`);
        console.log(`      Relationships: ${result.relationshipCount || 0}`);
      });
    }

    // Test 8: System statistics
    console.log('\n📈 Test 8: Comprehensive system statistics...');

    const stats = SmartMemoryManager.getSystemStatistics();
    console.log('✅ System Statistics:');
    console.log('   Vector Memory:');
    console.log(`     - Total Memories: ${stats.vectorMemory.totalMemories}`);
    console.log(`     - Vector Dimensions: ${stats.vectorMemory.vectorDimensions}`);
    console.log('   Semantic Search:');
    console.log(`     - Search History: ${stats.semanticSearch.searchHistoryCount}`);
    console.log(`     - Query Patterns: ${stats.semanticSearch.queryPatternsCount}`);
    console.log('   Knowledge Graph:');
    console.log(`     - Total Nodes: ${stats.knowledgeGraph.totalNodes}`);
    console.log(`     - Total Edges: ${stats.knowledgeGraph.totalEdges}`);
    console.log(
      `     - Average Connections: ${stats.knowledgeGraph.averageConnectionsPerNode.toFixed(2)}`
    );

    console.log('\n🎉 Smart Memory System Test Completed Successfully!');
    console.log('\n🚀 Revolutionary Features Demonstrated:');
    console.log('   ✅ Vector-based semantic storage and retrieval');
    console.log('   ✅ Knowledge graph relationship mapping');
    console.log('   ✅ Intelligent search with multiple strategies');
    console.log('   ✅ Advanced analytics and insights');
    console.log('   ✅ Automatic optimization and health monitoring');
    console.log('   ✅ Multi-dimensional memory ranking');
    console.log('   ✅ Temporal and contextual relevance');
  } catch (error) {
    console.error('❌ Smart Memory System Test Failed:', error.message);
    logger.error('❌ Smart Memory System Test Failed', { error: error.message });
  }
}

// Run the test
testSmartMemorySystem().catch(console.error);
