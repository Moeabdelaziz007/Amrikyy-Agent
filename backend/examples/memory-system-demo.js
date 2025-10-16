/**
 * Memory System Demonstration
 * Shows the Agent Cortex in action - learning, remembering, and improving
 */

const EnhancedCursorManagerAgent = require('../src/agents/EnhancedCursorManagerAgent');
const LunaTripArchitect = require('../src/agents/LunaTripArchitect');
const KarimBudgetOptimizer = require('../src/agents/KarimBudgetOptimizer');
const ZaraResearchSpecialist = require('../src/agents/ZaraResearchSpecialist');

async function demonstrateMemorySystem() {
  console.log('🧠 Starting Agent Cortex Memory System Demonstration...\n');

  // Initialize the Enhanced Cursor Manager with memory enabled
  const cursorManager = new EnhancedCursorManagerAgent({
    memoryEnabled: true,
    maxConcurrentTasks: 5,
    taskTimeout: 30000
  });

  try {
    await cursorManager.initialize();
    console.log('✅ Enhanced Cursor Manager initialized with Memory Manager\n');

    // Initialize agents
    const luna = new LunaTripArchitect(cursorManager);
    const karim = new KarimBudgetOptimizer(cursorManager);
    const zara = new ZaraResearchSpecialist(cursorManager);

    console.log('🌙 Luna Trip Architect ready');
    console.log('💰 Karim Budget Optimizer ready');
    console.log('🔍 Zara Research Specialist ready\n');

    // Demo 1: First Trip - No Memory
    console.log('='.repeat(60));
    console.log('DEMO 1: First Trip to Tokyo - Building Initial Memory');
    console.log('='.repeat(60));

    const firstTripRequest = {
      destination: 'Tokyo',
      duration: 7,
      budget: 'medium',
      interests: ['culture', 'food', 'temples'],
      travelers: 2,
      userId: 'demo_user_001'
    };

    console.log('🌙 Luna designing first trip to Tokyo...');
    const firstTripResult = await luna.designTripItinerary(firstTripRequest);
    
    if (firstTripResult.success) {
      console.log('✅ First trip designed successfully');
      console.log(`📅 Duration: ${firstTripResult.itinerary.duration} days`);
      console.log(`💰 Estimated cost: $${firstTripResult.estimatedCost.estimatedTotal}`);
      console.log(`🎯 Cultural tips: ${firstTripResult.culturalTips.etiquette.length} items`);

      // Memorize the trip
      console.log('\n🧠 Memorizing trip data...');
      const memorizeResult = await cursorManager.memorizeTrip({
        ...firstTripResult.itinerary,
        id: 'demo_trip_001',
        userId: 'demo_user_001',
        destinationData: firstTripResult.itinerary.destinationData,
        culturalInsights: firstTripResult.culturalTips,
        budgetAnalysis: firstTripResult.estimatedCost
      });

      console.log(`✅ Memorized ${memorizeResult.memoriesCreated} memory chunks`);
    }

    // Demo 2: Second Trip - With Memory
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 2: Second Trip to Tokyo - Using Memory');
    console.log('='.repeat(60));

    const secondTripRequest = {
      destination: 'Tokyo',
      duration: 5,
      budget: 'high',
      interests: ['luxury', 'fine_dining', 'shopping'],
      travelers: 2,
      userId: 'demo_user_001'
    };

    console.log('🧠 Querying memory for existing knowledge...');
    const memoryContext = await luna.queryMemoryForContext(secondTripRequest);
    
    console.log(`📚 Found ${memoryContext.memories.length} relevant memories`);
    console.log(`🎯 Destination memories: ${memoryContext.destinationMemories.length}`);
    console.log(`👤 User memories: ${memoryContext.userMemories.length}`);
    console.log(`🌍 Cultural memories: ${memoryContext.culturalMemories.length}`);

    if (memoryContext.hasMemory) {
      console.log('\n🧠 Memory-enhanced trip planning...');
      const secondTripResult = await luna.designTripItinerary(secondTripRequest);
      
      if (secondTripResult.success) {
        console.log('✅ Second trip designed with memory enhancement');
        console.log(`📅 Duration: ${secondTripResult.itinerary.duration} days`);
        console.log(`💰 Estimated cost: $${secondTripResult.estimatedCost.estimatedTotal}`);
        console.log(`🧠 Memory enhanced: ${secondTripResult.itinerary.destinationData.memoryEnhanced}`);
      }
    }

    // Demo 3: Budget Analysis with Memory
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 3: Budget Analysis - Using Historical Data');
    console.log('='.repeat(60));

    const budgetRequest = {
      destination: 'Tokyo',
      budget: 2000,
      duration: 7,
      travelers: 2,
      budgetLevel: 'high',
      userId: 'demo_user_001'
    };

    console.log('💰 Karim analyzing budget with memory context...');
    const budgetMemoryContext = await karim.queryMemoryForBudgetContext(budgetRequest);
    
    console.log(`🧠 Found ${budgetMemoryContext.memories.length} budget-related memories`);
    console.log(`💰 Budget memories: ${budgetMemoryContext.budgetMemories.length}`);
    console.log(`💵 Price memories: ${budgetMemoryContext.priceMemories.length}`);

    const budgetResult = await karim.analyzeBudget(budgetRequest);
    
    if (budgetResult.success) {
      console.log('✅ Budget analysis completed');
      console.log(`💰 Total budget: $${budgetResult.budget.total}`);
      console.log(`📊 Daily budget: $${budgetResult.budget.daily}`);
      console.log(`💡 Savings identified: $${budgetResult.optimization.totalSavings}`);
    }

    // Demo 4: Research with Memory
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 4: Research Verification - Using Verified Data');
    console.log('='.repeat(60));

    const researchRequest = {
      itineraryId: 'demo_itinerary_001',
      itinerary: {
        destination: 'Tokyo',
        days: [
          {
            day: 1,
            activities: [
              { name: 'Senso-ji Temple', type: 'cultural' },
              { name: 'Tokyo Skytree', type: 'sightseeing' }
            ]
          }
        ]
      },
      userId: 'demo_user_001'
    };

    console.log('🔍 Zara researching with memory context...');
    const researchMemoryContext = await zara.queryMemoryForResearchContext(researchRequest);
    
    console.log(`🧠 Found ${researchMemoryContext.memories.length} research-related memories`);
    console.log(`✅ Verified facts: ${researchMemoryContext.verifiedFacts.length}`);
    console.log(`📋 Booking memories: ${researchMemoryContext.bookingMemories.length}`);

    const researchResult = await zara.factCheckItinerary(researchRequest);
    
    if (researchResult.success) {
      console.log('✅ Research completed');
      console.log(`✅ Verified items: ${researchResult.verification.verifiedCount}`);
      console.log(`🔗 Booking links found: ${researchResult.bookingResearch.bookingLinks.length}`);
      console.log(`⚠️ Issues identified: ${researchResult.verification.issues.length}`);
    }

    // Demo 5: Memory Statistics
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 5: Memory System Statistics');
    console.log('='.repeat(60));

    const memoryStatus = cursorManager.memoryManager.getStatus();
    console.log('📊 Memory System Statistics:');
    console.log(`🧠 Total memories: ${memoryStatus.statistics.totalMemories}`);
    console.log(`📚 Memories by type:`, memoryStatus.statistics.memoriesByType);
    console.log(`🤖 Memories by agent:`, memoryStatus.statistics.memoriesByAgent);
    console.log(`🌍 Memories by destination:`, memoryStatus.statistics.memoriesByDestination);
    console.log(`🔍 Query count: ${memoryStatus.statistics.queryCount}`);
    console.log(`⏱️ Average query time: ${memoryStatus.statistics.averageQueryTime}ms`);

    // Demo 6: Learning Demonstration
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 6: Learning and Improvement Over Time');
    console.log('='.repeat(60));

    console.log('🎓 Demonstrating learning capabilities...');
    
    // Query for all Tokyo-related memories
    const allTokyoMemories = await cursorManager.queryMemory('Tokyo travel planning', {
      type: 'all',
      limit: 10
    });

    console.log(`📚 Total Tokyo memories: ${allTokyoMemories.results.length}`);
    
    if (allTokyoMemories.results.length > 0) {
      console.log('\n🧠 Sample memories:');
      allTokyoMemories.results.slice(0, 3).forEach((memory, index) => {
        console.log(`${index + 1}. ${memory.content.substring(0, 100)}...`);
        console.log(`   Source: ${memory.metadata.agent_source}`);
        console.log(`   Type: ${memory.metadata.memory_type}`);
      });
    }

    console.log('\n🎉 Memory System Demonstration Complete!');
    console.log('\nKey Benefits Demonstrated:');
    console.log('✅ Agents can remember past trips and research');
    console.log('✅ Memory enhances future trip planning');
    console.log('✅ Budget analysis uses historical pricing data');
    console.log('✅ Research verification builds on previous findings');
    console.log('✅ System learns and improves over time');
    console.log('✅ Reduces redundant API calls and research');

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    // Cleanup
    console.log('\n🛑 Shutting down...');
    await cursorManager.shutdown();
    console.log('✅ Demonstration completed successfully');
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateMemorySystem().catch(console.error);
}

module.exports = { demonstrateMemorySystem };
