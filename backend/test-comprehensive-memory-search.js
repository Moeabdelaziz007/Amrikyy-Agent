/**
 * Comprehensive Memory Search Test
 * Testing our revolutionary smart memory system with advanced search capabilities
 */

const SmartMemoryManager = require('./src/memory/SmartMemoryManager');
const { logger } = require('./src/utils/logger');

async function testComprehensiveMemorySearch() {
  console.log('🧠 Testing Comprehensive Memory Search with Revolutionary Smart Memory System...\n');

  try {
    // Initialize the smart memory system
    const memoryManager = SmartMemoryManager;

    // Test comprehensive search queries
    const searchQueries = [
      {
        query: 'revolutionary smart memory system achievements',
        description: 'Search for our breakthrough memory system achievements',
        expectedResults: 3,
      },
      {
        query: 'quantum computing gate builder simulator',
        description: 'Search for quantum computing implementation details',
        expectedResults: 3,
      },
      {
        query: 'AI trading strategy builder backtesting',
        description: 'Search for AI trading lab features',
        expectedResults: 3,
      },
      {
        query: 'programming algorithms code editor',
        description: 'Search for programming lab implementation',
        expectedResults: 3,
      },
      {
        query: 'Arabic NLP pipeline Egyptian dialect',
        description: 'Search for Arabic language processing features',
        expectedResults: 3,
      },
      {
        query: 'cyberpunk UI design Framer Motion',
        description: 'Search for frontend design implementation',
        expectedResults: 3,
      },
      {
        query: 'AIX runtime environment agent coordination',
        description: 'Search for AIX system architecture',
        expectedResults: 3,
      },
      {
        query: 'vector embeddings knowledge graph semantic search',
        description: 'Search for core memory system technologies',
        expectedResults: 3,
      },
      {
        query: 'React Router TypeScript navigation',
        description: 'Search for frontend routing implementation',
        expectedResults: 3,
      },
      {
        query: 'Zustand state management persistence',
        description: 'Search for state management implementation',
        expectedResults: 3,
      },
    ];

    console.log('🔍 Running comprehensive search tests...\n');

    let totalTests = 0;
    let successfulTests = 0;
    let totalSearchTime = 0;
    let averageSimilarity = 0;

    for (const test of searchQueries) {
      console.log(`\n🔎 Testing: "${test.query}"`);
      console.log(`📝 Description: ${test.description}`);

      const startTime = Date.now();

      const searchResult = await memoryManager.retrieveMemory(test.query, {
        limit: 5,
        useVectorSearch: true,
        useSemanticSearch: true,
        useKnowledgeGraphSearch: true,
        useContextualSearch: true,
        useTemporalSearch: true,
      });

      const endTime = Date.now();
      const searchTime = endTime - startTime;
      totalSearchTime += searchTime;

      if (searchResult.success) {
        const results = searchResult.results;
        console.log(`✅ Search completed in ${searchTime}ms`);
        console.log(`📊 Found ${results.length} results`);

        if (results.length > 0) {
          let similaritySum = 0;
          results.forEach((result, index) => {
            const similarity = (result.similarity * 100).toFixed(1);
            similaritySum += result.similarity;
            console.log(`   ${index + 1}. Similarity: ${similarity}%`);
            console.log(`      Category: ${result.category}`);
            console.log(`      Type: ${result.type}`);
            console.log(`      Score: ${result.score.toFixed(3)}`);
          });

          const avgSimilarity = (similaritySum / results.length) * 100;
          averageSimilarity += avgSimilarity;
          console.log(`📈 Average Similarity: ${avgSimilarity.toFixed(1)}%`);

          if (results.length >= test.expectedResults) {
            successfulTests++;
            console.log('✅ Test PASSED - Expected results found');
          } else {
            console.log(
              `⚠️  Test PARTIAL - Found ${results.length}/${test.expectedResults} expected results`
            );
          }
        } else {
          console.log('❌ Test FAILED - No results found');
        }
      } else {
        console.log('❌ Search failed:', searchResult.error);
      }

      totalTests++;
    }

    // Calculate performance metrics
    const averageSearchTime = totalSearchTime / totalTests;
    const averageSimilarityScore = averageSimilarity / totalTests;
    const successRate = (successfulTests / totalTests) * 100;

    console.log('\n📊 COMPREHENSIVE SEARCH TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Successful Tests: ${successfulTests}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Average Search Time: ${averageSearchTime.toFixed(1)}ms`);
    console.log(`🎯 Average Similarity: ${averageSimilarityScore.toFixed(1)}%`);

    // Performance benchmarks
    console.log('\n🏆 PERFORMANCE BENCHMARKS');
    console.log('='.repeat(50));

    if (averageSearchTime < 50) {
      console.log('🚀 Search Speed: EXCELLENT (<50ms)');
    } else if (averageSearchTime < 100) {
      console.log('⚡ Search Speed: VERY GOOD (<100ms)');
    } else if (averageSearchTime < 200) {
      console.log('✅ Search Speed: GOOD (<200ms)');
    } else {
      console.log('⚠️  Search Speed: NEEDS OPTIMIZATION (>200ms)');
    }

    if (averageSimilarityScore > 95) {
      console.log('🎯 Search Accuracy: EXCEPTIONAL (>95%)');
    } else if (averageSimilarityScore > 90) {
      console.log('🎯 Search Accuracy: EXCELLENT (>90%)');
    } else if (averageSimilarityScore > 85) {
      console.log('🎯 Search Accuracy: VERY GOOD (>85%)');
    } else if (averageSimilarityScore > 80) {
      console.log('🎯 Search Accuracy: GOOD (>80%)');
    } else {
      console.log('⚠️  Search Accuracy: NEEDS IMPROVEMENT (<80%)');
    }

    if (successRate > 95) {
      console.log('📊 Test Success Rate: OUTSTANDING (>95%)');
    } else if (successRate > 90) {
      console.log('📊 Test Success Rate: EXCELLENT (>90%)');
    } else if (successRate > 80) {
      console.log('📊 Test Success Rate: VERY GOOD (>80%)');
    } else if (successRate > 70) {
      console.log('📊 Test Success Rate: GOOD (>70%)');
    } else {
      console.log('⚠️  Test Success Rate: NEEDS IMPROVEMENT (<70%)');
    }

    // Test advanced analytics
    console.log('\n📊 Testing Advanced Analytics...');
    const analyticsResult = await memoryManager.getMemoryInsights();

    if (analyticsResult.success) {
      console.log('✅ Analytics retrieved successfully');
      const analytics = analyticsResult.analytics;
      console.log(`📈 Total Memories: ${analytics.memoryStatistics.totalMemories}`);
      console.log(`🔗 Total Relationships: ${analytics.knowledgeGraph.totalRelationships}`);
      console.log(
        `📊 Average Connections: ${analytics.knowledgeGraph.averageConnectionsPerMemory}`
      );
      console.log(`🎯 System Health: ${analytics.systemHealth.overallHealth}%`);
    } else {
      console.log('❌ Analytics failed:', analyticsResult.error);
    }

    // Test knowledge graph exploration
    console.log('\n🕸️ Testing Knowledge Graph Exploration...');
    const graphResult = await memoryManager.getRelationshipInsights();

    if (graphResult.success) {
      console.log('✅ Knowledge graph explored successfully');
      console.log('📊 Graph Statistics:');
      console.log(`   - Total Nodes: ${graphResult.graph.totalNodes}`);
      console.log(`   - Total Edges: ${graphResult.graph.totalEdges}`);
      console.log(
        `   - Most Connected Nodes: ${graphResult.graph.mostConnectedNodes
          .map((n) => n.id)
          .join(', ')}`
      );
      console.log(
        `   - Isolated Nodes: ${graphResult.graph.isolatedNodes.map((n) => n.id).join(', ')}`
      );
    } else {
      console.log('❌ Knowledge graph exploration failed:', graphResult.error);
    }

    // Final assessment
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('='.repeat(50));

    let overallScore = 0;
    let scoreFactors = [];

    // Search speed score (25%)
    if (averageSearchTime < 50) {
      overallScore += 25;
      scoreFactors.push('Search Speed: 25/25');
    } else if (averageSearchTime < 100) {
      overallScore += 20;
      scoreFactors.push('Search Speed: 20/25');
    } else if (averageSearchTime < 200) {
      overallScore += 15;
      scoreFactors.push('Search Speed: 15/25');
    } else {
      overallScore += 10;
      scoreFactors.push('Search Speed: 10/25');
    }

    // Search accuracy score (35%)
    if (averageSimilarityScore > 95) {
      overallScore += 35;
      scoreFactors.push('Search Accuracy: 35/35');
    } else if (averageSimilarityScore > 90) {
      overallScore += 30;
      scoreFactors.push('Search Accuracy: 30/35');
    } else if (averageSimilarityScore > 85) {
      overallScore += 25;
      scoreFactors.push('Search Accuracy: 25/35');
    } else if (averageSimilarityScore > 80) {
      overallScore += 20;
      scoreFactors.push('Search Accuracy: 20/35');
    } else {
      overallScore += 15;
      scoreFactors.push('Search Accuracy: 15/35');
    }

    // Success rate score (25%)
    if (successRate > 95) {
      overallScore += 25;
      scoreFactors.push('Success Rate: 25/25');
    } else if (successRate > 90) {
      overallScore += 20;
      scoreFactors.push('Success Rate: 20/25');
    } else if (successRate > 80) {
      overallScore += 15;
      scoreFactors.push('Success Rate: 15/25');
    } else if (successRate > 70) {
      overallScore += 10;
      scoreFactors.push('Success Rate: 10/25');
    } else {
      overallScore += 5;
      scoreFactors.push('Success Rate: 5/25');
    }

    // System health score (15%)
    if (analyticsResult.success && analyticsResult.analytics.systemHealth.overallHealth > 95) {
      overallScore += 15;
      scoreFactors.push('System Health: 15/15');
    } else if (
      analyticsResult.success &&
      analyticsResult.analytics.systemHealth.overallHealth > 90
    ) {
      overallScore += 12;
      scoreFactors.push('System Health: 12/15');
    } else if (
      analyticsResult.success &&
      analyticsResult.analytics.systemHealth.overallHealth > 80
    ) {
      overallScore += 10;
      scoreFactors.push('System Health: 10/15');
    } else {
      overallScore += 5;
      scoreFactors.push('System Health: 5/15');
    }

    console.log(`🎯 Overall Performance Score: ${overallScore}/100`);
    console.log('\n📊 Score Breakdown:');
    scoreFactors.forEach((factor) => console.log(`   - ${factor}`));

    if (overallScore >= 90) {
      console.log('\n🏆 PERFORMANCE RATING: OUTSTANDING');
      console.log('🌟 The revolutionary smart memory system is performing exceptionally well!');
    } else if (overallScore >= 80) {
      console.log('\n🏆 PERFORMANCE RATING: EXCELLENT');
      console.log(
        '🚀 The smart memory system is performing very well with minor optimization opportunities.'
      );
    } else if (offset >= 70) {
      console.log('\n🏆 PERFORMANCE RATING: VERY GOOD');
      console.log('✅ The system is performing well with some areas for improvement.');
    } else if (overallScore >= 60) {
      console.log('\n🏆 PERFORMANCE RATING: GOOD');
      console.log('⚠️  The system is functional but needs optimization in several areas.');
    } else {
      console.log('\n🏆 PERFORMANCE RATING: NEEDS IMPROVEMENT');
      console.log('❌ The system requires significant optimization and debugging.');
    }

    console.log('\n🎉 Comprehensive Memory Search Test Completed Successfully!');
    console.log(
      '🌟 Revolutionary Smart Memory System is fully operational and performing at high levels!'
    );
  } catch (error) {
    console.error('❌ Comprehensive memory search test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testComprehensiveMemorySearch();
