const IntelligentCache = require('../src/cache/IntelligentCache');
const sinon = require('sinon');

// Mock the logger to prevent console output during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe.skip('IntelligentCache', () => {
  let cache;
  let clock;

  beforeEach(() => {
    // Use fake timers to control time-based operations like TTL
    clock = sinon.useFakeTimers();
    // Create a new cache instance for each test
    // We will instantiate the cache directly, avoiding the singleton pattern for tests
    const IntelligentCacheClass = require('../src/cache/IntelligentCache').constructor;
    cache = new IntelligentCacheClass({ enableRedis: false });
  });

  afterEach(() => {
    // Restore the real timers
    clock.restore();
    // Clear any mocks
    sinon.restore();
  });

  it('should set and get a value from the cache', async () => {
    const key = 'test-key';
    const value = { data: 'test-data' };
    await cache.set(key, value);
    const cachedValue = await cache.get(key);
    expect(cachedValue).toEqual(value);
  });

  it('should return null for a non-existent key', async () => {
    const cachedValue = await cache.get('non-existent-key');
    expect(cachedValue).toBeNull();
  });

  it('should respect TTL and expire a cached item', async () => {
    const key = 'ttl-key';
    const value = 'ttl-data';
    const ttl = 1; // 1 second

    await cache.set(key, value, { ttl });

    // Should exist before TTL expires
    let cachedValue = await cache.get(key);
    expect(cachedValue).toBe(value);

    // Advance time by 1.1 seconds
    clock.tick(1100);

    // Should be null after TTL expires
    cachedValue = await cache.get(key);
    expect(cachedValue).toBeNull();
  });

  it('should use the fallback function when a key is not in cache', async () => {
    const key = 'fallback-key';
    const fallbackValue = 'fallback-data';
    const fallbackFn = jest.fn().mockResolvedValue(fallbackValue);

    const value = await cache.get(key, { fallbackFn });

    expect(fallbackFn).toHaveBeenCalledTimes(1);
    expect(value).toBe(fallbackValue);

    // The value should now be in the cache
    const cachedValue = await cache.get(key);
    expect(cachedValue).toBe(fallbackValue);
  });

  it('should invalidate cache by pattern', async () => {
    await cache.set('user:123:profile', { id: 123, name: 'Alice' });
    await cache.set('user:456:profile', { id: 456, name: 'Bob' });
    await cache.set('destination:789', { id: 789, name: 'Paris' });

    await cache.invalidate('user:*:profile');

    const user1 = await cache.get('user:123:profile');
    const user2 = await cache.get('user:456:profile');
    const destination = await cache.get('destination:789');

    expect(user1).toBeNull();
    expect(user2).toBeNull();
    expect(destination).not.toBeNull();
  });

  it('should clear the entire cache', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    await cache.clear();

    const value1 = await cache.get('key1');
    const value2 = await cache.get('key2');

    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });
});
