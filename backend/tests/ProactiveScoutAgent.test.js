/**
 * Proactive Scout Agent Test Suite
 * Comprehensive tests for the intelligent travel scouting system
 */

const ProactiveScoutAgent = require('../src/agents/ProactiveScoutAgent');
const EnhancedCursorManagerAgent = require('../src/agents/EnhancedCursorManagerAgent');

describe('Proactive Scout Agent - Intelligent Travel Scout', () => {
  let scoutAgent;
  let cursorManager;

  beforeEach(async () => {
    // Initialize Enhanced Cursor Manager with scout enabled
    cursorManager = new EnhancedCursorManagerAgent({
      scoutEnabled: true,
      memoryEnabled: true,
      maxConcurrentTasks: 5,
      taskTimeout: 10000
    });

    await cursorManager.initialize();
    scoutAgent = cursorManager.scoutAgent;
  });

  afterEach(async () => {
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  describe('Scout Agent Core Functionality', () => {
    test('should initialize successfully', () => {
      expect(scoutAgent).toBeDefined();
      expect(scoutAgent.status).toBe('active');
      expect(scoutAgent.agentId).toBe('proactive-scout-agent');
      expect(scoutAgent.capabilities).toContain('user_interest_monitoring');
      expect(scoutAgent.capabilities).toContain('proactive_offer_generation');
    });

    test('should have correct configuration', () => {
      expect(scoutAgent.config.monitoringInterval).toBe(5 * 60 * 1000); // 5 minutes
      expect(scoutAgent.config.offerGenerationInterval).toBe(30 * 60 * 1000); // 30 minutes
      expect(scoutAgent.config.maxOffersPerUser).toBe(3);
      expect(scoutAgent.config.priceDropThreshold).toBe(0.15); // 15%
      expect(scoutAgent.config.interestThreshold).toBe(3);
    });

    test('should initialize data structures', () => {
      expect(scoutAgent.userInterests).toBeInstanceOf(Map);
      expect(scoutAgent.activeOffers).toBeInstanceOf(Map);
      expect(scoutAgent.priceHistory).toBeInstanceOf(Map);
      expect(scoutAgent.notificationQueue).toBeInstanceOf(Map);
      expect(scoutAgent.scoutingMetrics).toBeInstanceOf(Map);
    });
  });

  describe('User Interest Tracking', () => {
    test('should track user interests from conversations', async () => {
      const userId = 'test_user_001';
      const conversations = [
        {
          user_id: userId,
          message: 'I want to visit Tokyo and see the cherry blossoms',
          timestamp: new Date(),
          context: { source: 'telegram' }
        },
        {
          user_id: userId,
          message: 'Tokyo seems like a great destination for culture and food',
          timestamp: new Date(),
          context: { source: 'telegram' }
        },
        {
          user_id: userId,
          message: 'I love Japanese culture and want to experience it in Tokyo',
          timestamp: new Date(),
          context: { source: 'telegram' }
        }
      ];

      // Process conversations
      for (const conversation of conversations) {
        await scoutAgent.analyzeConversationForInterests(conversation);
      }

      const interests = scoutAgent.userInterests.get(userId);
      expect(interests).toBeDefined();
      expect(interests.destinations.get('tokyo')).toBeGreaterThanOrEqual(3);
      expect(interests.activities.get('culture')).toBeGreaterThanOrEqual(2);
      expect(interests.conversationCount).toBe(3);
    });

    test('should calculate interest scores correctly', () => {
      const interests = {
        destinations: new Map([['tokyo', 5], ['paris', 2]]),
        activities: new Map([['culture', 3], ['food', 2]]),
        conversationCount: 4
      };

      const score = scoutAgent.calculateInterestScore(interests);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should identify top destinations and activities', async () => {
      const userId = 'test_user_002';
      const conversations = [
        {
          user_id: userId,
          message: 'I want to visit Paris for the art museums and culture',
          timestamp: new Date()
        },
        {
          user_id: userId,
          message: 'Paris has amazing food and shopping opportunities',
          timestamp: new Date()
        },
        {
          user_id: userId,
          message: 'I also want to see Tokyo for the technology and culture',
          timestamp: new Date()
        }
      ];

      for (const conversation of conversations) {
        await scoutAgent.analyzeConversationForInterests(conversation);
      }

      await scoutAgent.updateUserInterestProfiles();
      
      const interests = scoutAgent.userInterests.get(userId);
      expect(interests.topDestinations.length).toBeGreaterThan(0);
      expect(interests.topActivities.length).toBeGreaterThan(0);
      expect(interests.topDestinations[0][0]).toBe('paris'); // Most mentioned
    });
  });

  describe('Price Monitoring and Tracking', () => {
    test('should track price changes for destinations', async () => {
      const destination = 'tokyo';
      const initialPrices = { originalPrice: 2500, currentPrice: 2000 };
      
      // First price check
      const drop1 = scoutAgent.detectPriceDrop(destination, initialPrices);
      expect(drop1).toBe(0); // First time, no drop

      // Price increase
      const higherPrices = { originalPrice: 2500, currentPrice: 2200 };
      const drop2 = scoutAgent.detectPriceDrop(destination, higherPrices);
      expect(drop2).toBeLessThan(0); // Price increased

      // Price decrease
      const lowerPrices = { originalPrice: 2500, currentPrice: 1800 };
      const drop3 = scoutAgent.detectPriceDrop(destination, lowerPrices);
      expect(drop3).toBeGreaterThan(0); // Price dropped
    });

    test('should update price history correctly', () => {
      const destination = 'paris';
      const prices = { originalPrice: 1800, currentPrice: 1500 };
      
      scoutAgent.updatePriceHistory(destination, prices);
      
      const history = scoutAgent.priceHistory.get(destination);
      expect(history).toBeDefined();
      expect(history.length).toBe(1);
      expect(history[0].price).toBe(1500);
      expect(history[0].originalPrice).toBe(1800);
    });

    test('should limit price history to 30 entries', () => {
      const destination = 'dubai';
      
      // Add 35 price entries
      for (let i = 0; i < 35; i++) {
        const prices = { originalPrice: 1200, currentPrice: 1000 + i };
        scoutAgent.updatePriceHistory(destination, prices);
      }
      
      const history = scoutAgent.priceHistory.get(destination);
      expect(history.length).toBe(30); // Should be limited to 30
    });
  });

  describe('Offer Generation', () => {
    test('should generate offers for interested destinations', async () => {
      const userId = 'test_user_003';
      
      // Set up user interests
      const interests = {
        userId,
        destinations: new Map([['tokyo', 5]]),
        activities: new Map([['culture', 3]]),
        budgetPreferences: new Map([['budget', 2]]),
        timingPreferences: new Map(),
        conversationCount: 3,
        lastUpdated: new Date(),
        topDestinations: [['tokyo', 5]],
        topActivities: [['culture', 3]],
        interestScore: 75
      };
      
      scoutAgent.userInterests.set(userId, interests);
      
      // Generate offer
      const offer = await scoutAgent.generateOfferForDestination(userId, 'tokyo', interests);
      
      expect(offer).toBeDefined();
      expect(offer.userId).toBe(userId);
      expect(offer.destination).toBe('tokyo');
      expect(offer.discountPercentage).toBeGreaterThan(0);
      expect(offer.savings).toBeGreaterThan(0);
      expect(offer.personalizationScore).toBeGreaterThan(0);
    });

    test('should not generate offers for destinations with insufficient interest', async () => {
      const userId = 'test_user_004';
      
      const interests = {
        userId,
        destinations: new Map([['tokyo', 1]]), // Below threshold
        activities: new Map(),
        budgetPreferences: new Map(),
        timingPreferences: new Map(),
        conversationCount: 1,
        lastUpdated: new Date(),
        topDestinations: [['tokyo', 1]],
        topActivities: [],
        interestScore: 10
      };
      
      scoutAgent.userInterests.set(userId, interests);
      
      const offer = await scoutAgent.generateOfferForDestination(userId, 'tokyo', interests);
      expect(offer).toBeNull(); // Should not generate offer
    });

    test('should generate personalized offer titles and descriptions', () => {
      const offer = {
        destination: 'tokyo',
        discountPercentage: 20
      };
      
      const title = scoutAgent.generateOfferTitle(offer.destination, 0.2);
      expect(title).toContain('طوكيو');
      expect(title).toContain('20%');
      
      const interests = {
        topActivities: [['culture', 3]]
      };
      
      const description = scoutAgent.generateOfferDescription(offer.destination, interests);
      expect(description).toContain('الثقافة اليابانية');
      expect(description).toContain('culture');
    });
  });

  describe('Notification System', () => {
    test('should format offer notifications correctly', () => {
      const offer = {
        title: 'عرض خاص: طوكيو بخصم 20%',
        description: 'اكتشف الثقافة اليابانية الأصيلة',
        originalPrice: 2500,
        currentPrice: 2000,
        savings: 500,
        discountPercentage: 20,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      
      const message = scoutAgent.formatOfferNotification(offer);
      
      expect(message).toContain(offer.title);
      expect(message).toContain(offer.description);
      expect(message).toContain('$2500');
      expect(message).toContain('$2000');
      expect(message).toContain('$500');
      expect(message).toContain('20%');
    });

    test('should add offers to notification queue', async () => {
      const userId = 'test_user_005';
      const offer = {
        id: 'test_offer_001',
        title: 'Test Offer',
        destination: 'tokyo'
      };
      
      await scoutAgent.addToNotificationQueue(userId, offer);
      
      const notifications = scoutAgent.notificationQueue.get(userId);
      expect(notifications).toBeDefined();
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('new_offer');
      expect(notifications[0].offer).toEqual(offer);
    });

    test('should add offers to user offer list', async () => {
      const userId = 'test_user_006';
      const offer = {
        id: 'test_offer_002',
        title: 'Test Offer',
        destination: 'paris',
        status: 'active'
      };
      
      await scoutAgent.addOfferToUser(userId, offer);
      
      const userOffers = scoutAgent.activeOffers.get(userId);
      expect(userOffers).toBeDefined();
      expect(userOffers.length).toBe(1);
      expect(userOffers[0]).toEqual(offer);
    });
  });

  describe('Integration with Enhanced Cursor Manager', () => {
    test('should be initialized by Enhanced Cursor Manager', () => {
      expect(cursorManager.scoutAgent).toBeDefined();
      expect(cursorManager.scoutAgent).toBe(scoutAgent);
    });

    test('should notify scout of conversations', async () => {
      const userId = 'test_user_007';
      const message = 'I want to visit Dubai for shopping and luxury experiences';
      
      await cursorManager.notifyScoutOfConversation(userId, message, {
        source: 'telegram',
        sessionId: 'session_001'
      });
      
      // Check if conversation was processed
      const interests = scoutAgent.userInterests.get(userId);
      expect(interests).toBeDefined();
      expect(interests.destinations.get('dubai')).toBeGreaterThan(0);
    });

    test('should get user offers through cursor manager', async () => {
      const userId = 'test_user_008';
      const offer = {
        id: 'test_offer_003',
        title: 'Test Offer',
        destination: 'istanbul',
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      };
      
      scoutAgent.activeOffers.set(userId, [offer]);
      
      const result = await cursorManager.getUserOffers(userId);
      
      expect(result.success).toBe(true);
      expect(result.offers.length).toBe(1);
      expect(result.offers[0]).toEqual(offer);
    });

    test('should get scout metrics through cursor manager', () => {
      const result = cursorManager.getScoutMetrics();
      
      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.metrics.usersMonitored).toBeGreaterThanOrEqual(0);
      expect(result.metrics.offersGenerated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Persistence', () => {
    test('should save and load scouting data', async () => {
      const userId = 'test_user_009';
      const interests = {
        userId,
        destinations: new Map([['tokyo', 3]]),
        activities: new Map([['culture', 2]]),
        conversationCount: 2,
        lastUpdated: new Date()
      };
      
      scoutAgent.userInterests.set(userId, interests);
      
      // Save data
      await scoutAgent.saveScoutingData();
      
      // Create new scout agent instance
      const newScoutAgent = new ProactiveScoutAgent(cursorManager);
      await newScoutAgent.loadScoutingData();
      
      const loadedInterests = newScoutAgent.userInterests.get(userId);
      expect(loadedInterests).toBeDefined();
      expect(loadedInterests.destinations.get('tokyo')).toBe(3);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple users efficiently', async () => {
      const userCount = 100;
      const conversationsPerUser = 5;
      
      // Generate test data
      for (let i = 0; i < userCount; i++) {
        const userId = `perf_user_${i}`;
        
        for (let j = 0; j < conversationsPerUser; j++) {
          const conversation = {
            user_id: userId,
            message: `I want to visit tokyo for culture and food experience ${j}`,
            timestamp: new Date()
          };
          
          await scoutAgent.analyzeConversationForInterests(conversation);
        }
      }
      
      expect(scoutAgent.userInterests.size).toBe(userCount);
      expect(scoutAgent.metrics.usersMonitored).toBe(userCount);
    });

    test('should maintain performance with large offer generation', async () => {
      const startTime = Date.now();
      
      // Generate offers for multiple users
      for (let i = 0; i < 50; i++) {
        const userId = `offer_user_${i}`;
        const interests = {
          userId,
          destinations: new Map([['tokyo', 5]]),
          activities: new Map([['culture', 3]]),
          conversationCount: 3,
          lastUpdated: new Date(),
          topDestinations: [['tokyo', 5]],
          topActivities: [['culture', 3]],
          interestScore: 75
        };
        
        scoutAgent.userInterests.set(userId, interests);
        
        const offer = await scoutAgent.generateOfferForDestination(userId, 'tokyo', interests);
        if (offer) {
          await scoutAgent.addOfferToUser(userId, offer);
        }
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(scoutAgent.metrics.offersGenerated).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid conversation data gracefully', async () => {
      const invalidConversations = [
        null,
        undefined,
        {},
        { user_id: null, message: 'test' },
        { user_id: 'test', message: null }
      ];

      for (const conversation of invalidConversations) {
        await expect(scoutAgent.analyzeConversationForInterests(conversation)).resolves.not.toThrow();
      }
    });

    test('should handle offer generation errors gracefully', async () => {
      const userId = 'error_user_001';
      const invalidInterests = null;
      
      const offer = await scoutAgent.generateOfferForDestination(userId, 'tokyo', invalidInterests);
      expect(offer).toBeNull();
    });

    test('should handle notification errors gracefully', async () => {
      const userId = 'error_user_002';
      const invalidNotification = {
        type: 'invalid_type',
        offer: null
      };
      
      await expect(scoutAgent.sendNotification(userId, invalidNotification)).resolves.not.toThrow();
    });
  });

  describe('Scout Agent Status and Metrics', () => {
    test('should provide comprehensive status information', () => {
      const status = scoutAgent.getStatus();
      
      expect(status.agentId).toBe('proactive-scout-agent');
      expect(status.status).toBe('active');
      expect(status.version).toBe('1.0.0');
      expect(status.metrics).toBeDefined();
      expect(status.config).toBeDefined();
      expect(status.lastUpdate).toBeDefined();
    });

    test('should track metrics correctly', () => {
      const initialMetrics = scoutAgent.metrics;
      
      // Simulate some activity
      scoutAgent.metrics.offersGenerated = 5;
      scoutAgent.metrics.notificationsSent = 3;
      scoutAgent.metrics.totalSavingsIdentified = 1500;
      
      const status = scoutAgent.getStatus();
      
      expect(status.metrics.offersGenerated).toBe(5);
      expect(status.metrics.notificationsSent).toBe(3);
      expect(status.metrics.totalSavingsIdentified).toBe(1500);
    });
  });
});

describe('Proactive Scout Agent Integration Tests', () => {
  let cursorManager;

  beforeEach(async () => {
    cursorManager = new EnhancedCursorManagerAgent({
      scoutEnabled: true,
      memoryEnabled: true
    });
    
    await cursorManager.initialize();
  });

  afterEach(async () => {
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  test('should demonstrate end-to-end proactive scouting workflow', async () => {
    const userId = 'integration_test_user';
    
    // Step 1: User has conversations about Tokyo
    const conversations = [
      'I really want to visit Tokyo for the cherry blossoms',
      'Tokyo has amazing culture and food experiences',
      'I love Japanese culture and want to experience it in Tokyo',
      'Tokyo seems perfect for a cultural trip'
    ];
    
    for (const message of conversations) {
      await cursorManager.notifyScoutOfConversation(userId, message, {
        source: 'telegram'
      });
    }
    
    // Step 2: Scout should have tracked interests
    const scoutAgent = cursorManager.scoutAgent;
    const interests = scoutAgent.userInterests.get(userId);
    expect(interests).toBeDefined();
    expect(interests.destinations.get('tokyo')).toBeGreaterThanOrEqual(4);
    
    // Step 3: Generate proactive offer
    const offer = await scoutAgent.generateOfferForDestination(userId, 'tokyo', interests);
    expect(offer).toBeDefined();
    expect(offer.destination).toBe('tokyo');
    expect(offer.personalizationScore).toBeGreaterThan(0);
    
    // Step 4: Offer should be available to user
    const userOffers = await cursorManager.getUserOffers(userId);
    expect(userOffers.success).toBe(true);
    expect(userOffers.offers.length).toBeGreaterThan(0);
  });

  test('should demonstrate learning and improvement over time', async () => {
    const userId = 'learning_test_user';
    
    // First conversation - minimal interest
    await cursorManager.notifyScoutOfConversation(userId, 'I might want to visit Paris', {
      source: 'telegram'
    });
    
    let interests = cursorManager.scoutAgent.userInterests.get(userId);
    expect(interests.destinations.get('paris')).toBe(1);
    
    // Multiple conversations - increased interest
    const parisConversations = [
      'Paris has amazing art museums',
      'I love French culture and cuisine',
      'Paris is perfect for a romantic getaway',
      'I want to see the Eiffel Tower in Paris'
    ];
    
    for (const message of parisConversations) {
      await cursorManager.notifyScoutOfConversation(userId, message, {
        source: 'telegram'
      });
    }
    
    interests = cursorManager.scoutAgent.userInterests.get(userId);
    expect(interests.destinations.get('paris')).toBeGreaterThanOrEqual(5);
    expect(interests.interestScore).toBeGreaterThan(50);
    
    // Should now be eligible for offers
    const offer = await cursorManager.scoutAgent.generateOfferForDestination(userId, 'paris', interests);
    expect(offer).toBeDefined();
  });
});
