/**
 * MemoryManager Test Suite
 * Comprehensive tests for the Agent Cortex memory system
 */

const MemoryManager = require('../src/agents/MemoryManager');
const EnhancedCursorManagerAgent = require('../src/agents/EnhancedCursorManagerAgent');
const LunaTripArchitect = require('../src/agents/LunaTripArchitect');
const KarimBudgetOptimizer = require('../src/agents/KarimBudgetOptimizer');
const ZaraResearchSpecialist = require('../src/agents/ZaraResearchSpecialist');

describe('MemoryManager - Agent Cortex', () => {
  let memoryManager;
  let cursorManager;

  beforeEach(async () => {
    // Initialize MemoryManager with test configuration
    memoryManager = new MemoryManager({
      chromaHost: 'localhost',
      chromaPort: 8000,
      collectionName: 'test_amrikyy_knowledge_base',
      maxChunkSize: 500,
      maxResults: 5
    });

    // Initialize Enhanced Cursor Manager with memory enabled
    cursorManager = new EnhancedCursorManagerAgent({
      memoryEnabled: true,
      maxConcurrentTasks: 5,
      taskTimeout: 10000
    });

    await memoryManager.initialize();
    await cursorManager.initialize();
  });

  afterEach(async () => {
    if (memoryManager) {
      await memoryManager.shutdown();
    }
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  describe('MemoryManager Core Functionality', () => {
    test('should initialize successfully', () => {
      expect(memoryManager).toBeDefined();
      expect(memoryManager.status).toBe('active');
      expect(memoryManager.collections).toBeDefined();
    });

    test('should create collections correctly', () => {
      const collections = Object.keys(memoryManager.collections);
      expect(collections).toContain('trips');
      expect(collections).toContain('destinations');
      expect(collections).toContain('userPreferences');
      expect(collections).toContain('researchData');
      expect(collections).toContain('culturalInsights');
      expect(collections).toContain('budgetData');
      expect(collections).toContain('agentInsights');
    });

    test('should add memory successfully', async () => {
      const memoryData = {
        id: 'test_memory_001',
        type: 'trip',
        content: 'Test trip to Tokyo for 7 days with medium budget. Great cultural experience.',
        metadata: {
          agent_source: 'luna_trip_architect',
          destination: 'Tokyo',
          duration: 7,
          budget: 'medium',
          user_id: 'test_user_001',
          trip_id: 'trip_001',
          memory_type: 'trip_overview'
        }
      };

      const result = await memoryManager.addMemory(memoryData);
      
      expect(result.success).toBe(true);
      expect(result.memoryId).toBe('test_memory_001');
      expect(result.chunksAdded).toBe(1);
    });

    test('should query memory successfully', async () => {
      // First add some test memories
      const memories = [
        {
          id: 'test_memory_001',
          type: 'trip',
          content: 'Trip to Tokyo for 7 days with medium budget. Great cultural experience.',
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: 'test_user_001',
            memory_type: 'trip_overview'
          }
        },
        {
          id: 'test_memory_002',
          type: 'destination',
          content: 'Tokyo research: Best seasons are spring and autumn. Must visit Senso-ji Temple.',
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: 'test_user_001',
            memory_type: 'destination_research'
          }
        }
      ];

      for (const memory of memories) {
        await memoryManager.addMemory(memory);
      }

      // Query for Tokyo-related memories
      const queryResult = await memoryManager.queryMemory({
        text: 'Tokyo trip planning',
        type: 'all',
        limit: 5
      });

      expect(queryResult.success).toBe(true);
      expect(queryResult.results.length).toBeGreaterThan(0);
    });

    test('should chunk large memories correctly', async () => {
      const largeContent = 'This is a very long memory content that should be chunked. '.repeat(50);
      const memoryData = {
        id: 'test_large_memory',
        type: 'trip',
        content: largeContent,
        metadata: {
          agent_source: 'luna_trip_architect',
          destination: 'Tokyo',
          user_id: 'test_user_001',
          memory_type: 'trip_overview'
        }
      };

      const result = await memoryManager.addMemory(memoryData);
      
      expect(result.success).toBe(true);
      expect(result.chunksAdded).toBeGreaterThan(1);
    });

    test('should validate memory data correctly', async () => {
      const invalidMemory = {
        id: 'test_memory',
        // Missing type, content, and metadata
      };

      await expect(memoryManager.addMemory(invalidMemory)).rejects.toThrow();
    });

    test('should handle query validation correctly', async () => {
      const invalidQuery = {
        // Missing text
        type: 'all'
      };

      await expect(memoryManager.queryMemory(invalidQuery)).rejects.toThrow();
    });
  });

  describe('Enhanced Cursor Manager Memory Integration', () => {
    test('should initialize with memory manager', () => {
      expect(cursorManager.memoryManager).toBeDefined();
      expect(cursorManager.memoryManager.status).toBe('active');
    });

    test('should memorize trip data successfully', async () => {
      const tripData = {
        id: 'trip_001',
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001',
        summary: 'Amazing cultural trip to Tokyo',
        itinerary: {
          days: [
            {
              day: 1,
              theme: 'Arrival & Orientation',
              activities: [{ name: 'Airport transfer' }, { name: 'Hotel check-in' }],
              meals: [{ name: 'Welcome dinner' }]
            }
          ]
        },
        destinationData: {
          bestSeasons: ['spring', 'autumn'],
          culturalHighlights: ['temples', 'cherry_blossoms'],
          mustVisit: ['Senso-ji Temple', 'Tokyo Skytree']
        },
        culturalInsights: {
          etiquette: ['bow when greeting', 'quiet on trains'],
          foodCulture: ['try local specialties', 'respect dining customs'],
          languageTips: ['learn basic phrases', 'use translation app']
        }
      };

      const result = await cursorManager.memorizeTrip(tripData);
      
      expect(result.success).toBe(true);
      expect(result.memoriesCreated).toBeGreaterThan(0);
    });

    test('should query memory through cursor manager', async () => {
      // First add some memories
      const tripData = {
        id: 'trip_001',
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001',
        summary: 'Amazing cultural trip to Tokyo'
      };

      await cursorManager.memorizeTrip(tripData);

      // Query memory
      const queryResult = await cursorManager.queryMemory('Tokyo cultural trip', {
        type: 'all',
        limit: 5
      });

      expect(queryResult.success).toBe(true);
      expect(queryResult.results.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Memory Integration', () => {
    let luna, karim, zara;

    beforeEach(() => {
      luna = new LunaTripArchitect(cursorManager);
      karim = new KarimBudgetOptimizer(cursorManager);
      zara = new ZaraResearchSpecialist(cursorManager);
    });

    test('Luna should query memory for context', async () => {
      // Add some destination memories first
      await cursorManager.memorizeTrip({
        id: 'trip_001',
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001',
        destinationData: {
          bestSeasons: ['spring', 'autumn'],
          culturalHighlights: ['temples', 'cherry_blossoms'],
          mustVisit: ['Senso-ji Temple', 'Tokyo Skytree']
        }
      });

      const request = {
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001'
      };

      const memoryContext = await luna.queryMemoryForContext(request);
      
      expect(memoryContext.hasMemory).toBe(true);
      expect(memoryContext.memories.length).toBeGreaterThan(0);
      expect(memoryContext.destinationMemories.length).toBeGreaterThan(0);
    });

    test('Karim should query memory for budget context', async () => {
      // Add some budget memories first
      await cursorManager.memorizeTrip({
        id: 'trip_001',
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001',
        budgetAnalysis: {
          estimatedTotal: 1500,
          perDay: 214,
          breakdown: {
            accommodation: 600,
            food: 450,
            activities: 300,
            transportation: 150
          }
        }
      });

      const request = {
        destination: 'Tokyo',
        budgetLevel: 'medium',
        userId: 'test_user_001'
      };

      const memoryContext = await karim.queryMemoryForBudgetContext(request);
      
      expect(memoryContext.hasMemory).toBe(true);
      expect(memoryContext.budgetMemories.length).toBeGreaterThan(0);
    });

    test('Zara should query memory for research context', async () => {
      // Add some research memories first
      await cursorManager.memorizeTrip({
        id: 'trip_001',
        destination: 'Tokyo',
        duration: 7,
        budget: 'medium',
        userId: 'test_user_001',
        researchData: {
          verifiedFacts: ['Senso-ji Temple is free to visit', 'Tokyo Skytree has great views'],
          bookingLinks: ['https://example.com/tokyo-tours'],
          logisticsVerified: true
        }
      });

      const request = {
        itineraryId: 'itinerary_001',
        itinerary: { destination: 'Tokyo' },
        userId: 'test_user_001'
      };

      const memoryContext = await zara.queryMemoryForResearchContext(request);
      
      expect(memoryContext.hasMemory).toBe(true);
      expect(memoryContext.researchMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Memory System Performance', () => {
    test('should handle multiple concurrent memory operations', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const memoryData = {
          id: `concurrent_memory_${i}`,
          type: 'trip',
          content: `Test trip ${i} to Tokyo for 7 days with medium budget.`,
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: `test_user_${i}`,
            memory_type: 'trip_overview'
          }
        };
        
        promises.push(memoryManager.addMemory(memoryData));
      }

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('should maintain performance with large number of memories', async () => {
      const startTime = Date.now();
      
      // Add 100 memories
      for (let i = 0; i < 100; i++) {
        const memoryData = {
          id: `perf_memory_${i}`,
          type: 'trip',
          content: `Performance test memory ${i} for Tokyo trip.`,
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: 'perf_test_user',
            memory_type: 'trip_overview'
          }
        };
        
        await memoryManager.addMemory(memoryData);
      }

      const addTime = Date.now() - startTime;
      
      // Query should still be fast
      const queryStartTime = Date.now();
      const queryResult = await memoryManager.queryMemory({
        text: 'Tokyo trip',
        type: 'all',
        limit: 10
      });
      const queryTime = Date.now() - queryStartTime;

      expect(queryResult.success).toBe(true);
      expect(addTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(queryTime).toBeLessThan(1000); // Query should be under 1 second
    });
  });

  describe('Memory Statistics and Monitoring', () => {
    test('should track memory statistics correctly', async () => {
      const initialStats = memoryManager.getStatus().statistics;
      
      // Add some memories
      const memories = [
        {
          id: 'stats_memory_001',
          type: 'trip',
          content: 'Trip to Tokyo',
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: 'stats_user',
            memory_type: 'trip_overview'
          }
        },
        {
          id: 'stats_memory_002',
          type: 'destination',
          content: 'Tokyo destination research',
          metadata: {
            agent_source: 'luna_trip_architect',
            destination: 'Tokyo',
            user_id: 'stats_user',
            memory_type: 'destination_research'
          }
        }
      ];

      for (const memory of memories) {
        await memoryManager.addMemory(memory);
      }

      const finalStats = memoryManager.getStatus().statistics;
      
      expect(finalStats.totalMemories).toBeGreaterThan(initialStats.totalMemories);
      expect(finalStats.memoriesByType.trip).toBeGreaterThan(0);
      expect(finalStats.memoriesByType.destination).toBeGreaterThan(0);
    });

    test('should provide comprehensive status information', () => {
      const status = memoryManager.getStatus();
      
      expect(status.agentId).toBe('memory-manager');
      expect(status.status).toBe('active');
      expect(status.version).toBe('1.0.0');
      expect(status.collections).toBeGreaterThan(0);
      expect(status.statistics).toBeDefined();
      expect(status.config).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle memory manager not available gracefully', async () => {
      const cursorManagerWithoutMemory = new EnhancedCursorManagerAgent({
        memoryEnabled: false
      });
      
      await cursorManagerWithoutMemory.initialize();
      
      const luna = new LunaTripArchitect(cursorManagerWithoutMemory);
      const memoryContext = await luna.queryMemoryForContext({
        destination: 'Tokyo',
        userId: 'test_user'
      });
      
      expect(memoryContext.hasMemory).toBe(false);
      expect(memoryContext.memories).toEqual([]);
      
      await cursorManagerWithoutMemory.shutdown();
    });

    test('should handle invalid memory data gracefully', async () => {
      const invalidMemories = [
        null,
        undefined,
        {},
        { id: 'test' }, // Missing required fields
        { id: 'test', type: 'trip' }, // Missing content and metadata
        { id: 'test', type: 'trip', content: 'test' } // Missing metadata
      ];

      for (const invalidMemory of invalidMemories) {
        await expect(memoryManager.addMemory(invalidMemory)).rejects.toThrow();
      }
    });

    test('should handle query errors gracefully', async () => {
      const invalidQueries = [
        null,
        undefined,
        {},
        { text: '' }, // Empty text
        { text: null } // Null text
      ];

      for (const invalidQuery of invalidQueries) {
        await expect(memoryManager.queryMemory(invalidQuery)).rejects.toThrow();
      }
    });
  });
});

describe('Memory System Integration Tests', () => {
  let cursorManager;
  let luna, karim, zara;

  beforeEach(async () => {
    cursorManager = new EnhancedCursorManagerAgent({
      memoryEnabled: true,
      maxConcurrentTasks: 5
    });
    
    await cursorManager.initialize();
    
    luna = new LunaTripArchitect(cursorManager);
    karim = new KarimBudgetOptimizer(cursorManager);
    zara = new ZaraResearchSpecialist(cursorManager);
  });

  afterEach(async () => {
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  test('should create end-to-end memory workflow', async () => {
    // Step 1: Create a trip with Luna
    const tripRequest = {
      destination: 'Tokyo',
      duration: 7,
      budget: 'medium',
      interests: ['culture', 'food'],
      travelers: 2,
      userId: 'integration_test_user'
    };

    const tripResult = await luna.designTripItinerary(tripRequest);
    expect(tripResult.success).toBe(true);

    // Step 2: Memorize the trip
    const memorizeResult = await cursorManager.memorizeTrip({
      ...tripResult.itinerary,
      id: 'integration_trip_001',
      userId: 'integration_test_user'
    });
    expect(memorizeResult.success).toBe(true);

    // Step 3: Query memory from different agents
    const lunaMemory = await luna.queryMemoryForContext(tripRequest);
    const karimMemory = await karim.queryMemoryForBudgetContext({
      destination: 'Tokyo',
      budgetLevel: 'medium',
      userId: 'integration_test_user'
    });
    const zaraMemory = await zara.queryMemoryForResearchContext({
      itinerary: { destination: 'Tokyo' },
      userId: 'integration_test_user'
    });

    // All agents should find relevant memories
    expect(lunaMemory.hasMemory).toBe(true);
    expect(karimMemory.hasMemory).toBe(true);
    expect(zaraMemory.hasMemory).toBe(true);
  });

  test('should demonstrate learning and improvement', async () => {
    const userId = 'learning_test_user';
    const destination = 'Paris';

    // First trip - no memory
    const firstTrip = {
      destination,
      duration: 5,
      budget: 'medium',
      userId
    };

    const firstMemoryContext = await luna.queryMemoryForContext(firstTrip);
    expect(firstMemoryContext.hasMemory).toBe(false);

    // Create and memorize first trip
    const firstResult = await luna.designTripItinerary(firstTrip);
    await cursorManager.memorizeTrip({
      ...firstResult.itinerary,
      id: 'learning_trip_001',
      userId
    });

    // Second trip - should have memory
    const secondTrip = {
      destination,
      duration: 7,
      budget: 'high',
      userId
    };

    const secondMemoryContext = await luna.queryMemoryForContext(secondTrip);
    expect(secondMemoryContext.hasMemory).toBe(true);
    expect(secondMemoryContext.destinationMemories.length).toBeGreaterThan(0);
  });
});
