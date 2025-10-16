const MemoryCache = require('../MemoryCache');

describe('MemoryCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    MemoryCache.flushAll();
  });

  afterAll(() => {
    // Clean up after all tests
    MemoryCache.flushAll();
  });

  describe('Basic Operations', () => {
    test('should set and get a value', async () => {
      await MemoryCache.set('test-key', { data: 'test-value' }, 60);
      const value = await MemoryCache.get('test-key');
      
      expect(value).toEqual({ data: 'test-value' });
    });

    test('should return null for non-existent key', async () => {
      const value = await MemoryCache.get('non-existent-key');
      expect(value).toBeNull();
    });

    test('should delete a key', async () => {
      await MemoryCache.set('test-key', 'test-value', 60);
      const deleted = await MemoryCache.del('test-key');
      const value = await MemoryCache.get('test-key');
      
      expect(deleted).toBe(1);
      expect(value).toBeNull();
    });

    test('should return 0 when deleting non-existent key', async () => {
      const deleted = await MemoryCache.del('non-existent-key');
      expect(deleted).toBe(0);
    });
  });

  describe('TTL (Time To Live)', () => {
    test('should expire after TTL', async () => {
      await MemoryCache.set('test-key', 'test-value', 1); // 1 second TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const value = await MemoryCache.get('test-key');
      expect(value).toBeNull();
    });

    test('should get TTL for a key', async () => {
      await MemoryCache.set('test-key', 'test-value', 60);
      const ttl = await MemoryCache.ttl('test-key');
      
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    test('should return -1 for non-existent key TTL', async () => {
      const ttl = await MemoryCache.ttl('non-existent-key');
      expect(ttl).toBe(-1);
    });
  });

  describe('Pattern Operations', () => {
    test('should get keys by pattern', async () => {
      await MemoryCache.set('user:1', 'data1', 60);
      await MemoryCache.set('user:2', 'data2', 60);
      await MemoryCache.set('post:1', 'data3', 60);
      
      const keys = await MemoryCache.keys('user:*');
      
      expect(keys).toHaveLength(2);
      expect(keys).toContain('user:1');
      expect(keys).toContain('user:2');
    });

    test('should delete keys by pattern', async () => {
      await MemoryCache.set('user:1', 'data1', 60);
      await MemoryCache.set('user:2', 'data2', 60);
      await MemoryCache.set('post:1', 'data3', 60);
      
      const deleted = await MemoryCache.delPattern('user:*');
      
      expect(deleted).toBe(2);
      
      const user1 = await MemoryCache.get('user:1');
      const user2 = await MemoryCache.get('user:2');
      const post1 = await MemoryCache.get('post:1');
      
      expect(user1).toBeNull();
      expect(user2).toBeNull();
      expect(post1).toBe('data3');
    });
  });

  describe('Statistics', () => {
    test('should track cache hits and misses', async () => {
      await MemoryCache.set('test-key', 'test-value', 60);
      
      // Hit
      await MemoryCache.get('test-key');
      
      // Miss
      await MemoryCache.get('non-existent-key');
      
      const stats = MemoryCache.getStats();
      
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.connected).toBe(true);
    });

    test('should calculate hit rate', async () => {
      await MemoryCache.set('key1', 'value1', 60);
      await MemoryCache.set('key2', 'value2', 60);
      
      // 2 hits
      await MemoryCache.get('key1');
      await MemoryCache.get('key2');
      
      // 1 miss
      await MemoryCache.get('non-existent');
      
      const stats = MemoryCache.getStats();
      
      expect(stats.hitRate).toBeDefined();
      expect(parseFloat(stats.hitRate)).toBeGreaterThan(0);
    });
  });

  describe('Flush Operations', () => {
    test('should flush all cache', async () => {
      await MemoryCache.set('key1', 'value1', 60);
      await MemoryCache.set('key2', 'value2', 60);
      
      await MemoryCache.flushAll();
      
      const key1 = await MemoryCache.get('key1');
      const key2 = await MemoryCache.get('key2');
      
      expect(key1).toBeNull();
      expect(key2).toBeNull();
    });
  });

  describe('Memory Usage', () => {
    test('should report memory usage', () => {
      const stats = MemoryCache.getStats();
      
      expect(stats.memory).toBeDefined();
      expect(typeof stats.memory).toBe('string');
    });
  });

  describe('Cache Enabled', () => {
    test('should report cache as enabled', () => {
      const isEnabled = MemoryCache.isEnabled();
      expect(isEnabled).toBe(true);
    });
  });
});
