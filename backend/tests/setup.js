/**
 * Global test setup and configuration
 * This file runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.KELO_API_KEY = 'test-kelo-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.PAYPAL_CLIENT_ID = 'test-paypal-id';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-secret';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output (optional)
global.testLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock external dependencies
jest.mock('../database/supabase', () => {
  return jest.fn().mockImplementation(() => ({
    getTravelOffers: jest.fn().mockResolvedValue([
      { id: 1, title: 'Test Trip', price: 100 },
      { id: 2, title: 'Another Trip', price: 200 },
    ]),
    createUser: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
    getUserProfile: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      preferences: {},
    }),
  }));
});

// Mock AI services
jest.mock('../src/ai/zaiClient', () => {
  return jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    chat: jest.fn().mockResolvedValue({
      success: true,
      message: 'Test AI response',
    }),
    analyzeIntent: jest.fn().mockReturnValue({
      intent: 'travel_info',
      confidence: 0.9,
      entities: {},
    }),
  }));
});

// Setup global test utilities
global.testUtils = {
  // Helper to create mock request/response objects
  createMockReq: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    headers: {},
    get: jest.fn(),
  }),

  createMockRes: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  },

  // Helper to wait for async operations
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to generate test user data
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      language: 'ar',
      currency: 'USD',
      ...overrides.preferences,
    },
    ...overrides,
  }),

  // Helper to generate test trip data
  createTestTrip: (overrides = {}) => ({
    id: 'test-trip-id',
    title: 'Test Trip',
    destination: 'Test Destination',
    price: 100,
    currency: 'USD',
    duration: 7,
    ...overrides,
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities for database operations
global.testDB = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const defaultUser = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      phone: '+1234567890',
      location: 'Test City',
      bio: 'Test bio for testing',
      ...userData
    };

    const { data, error } = await global.testSupabase
      .from('users')
      .insert([defaultUser])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create test destination
  createTestDestination: async (destinationData = {}) => {
    const defaultDestination = {
      name: 'Test Destination',
      description: 'A test destination for testing',
      country: 'Test Country',
      region: 'Test Region',
      rating: 4.0,
      review_count: 100,
      price_range: '$$',
      category: ['city'],
      images: ['https://example.com/test.jpg'],
      best_time_to_visit: 'Spring',
      estimated_cost: { low: 500, high: 1000, currency: 'USD' },
      attractions: ['Test Attraction'],
      activities: ['Test Activity'],
      popular_with: ['Test Group'],
      tags: ['test'],
      ...destinationData
    };

    const { data, error } = await global.testSupabase
      .from('destinations')
      .insert([defaultDestination])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create test notification
  createTestNotification: async (userId, notificationData = {}) => {
    const defaultNotification = {
      user_id: userId,
      title: 'Test Notification',
      message: 'Test notification message',
      type: 'info',
      read: false,
      ...notificationData
    };

    const { data, error } = await global.testSupabase
      .from('notifications')
      .insert([defaultNotification])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Clean up test data
  cleanupUser: async (userId) => {
    await global.testSupabase
      .from('users')
      .delete()
      .eq('id', userId);
  },

  cleanupDestination: async (destinationId) => {
    await global.testSupabase
      .from('destinations')
      .delete()
      .eq('id', destinationId);
  },

  cleanupNotification: async (notificationId) => {
    await global.testSupabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
  }
};

// Global error handler for unhandled promises in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
