import cache, { CACHE_TTL, generateCacheKey } from '../../src/util/cache';

describe('InMemoryCache', () => {
  beforeEach(() => {
    cache.clear();
  });

  afterAll(() => {
    cache.stopCleanup();
  });

  describe('basic operations', () => {
    it('should store and retrieve data', () => {
      cache.set('test-key', { data: 'test-value' }, 60);
      const result = cache.get('test-key');
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete specific keys', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should clear all cache entries', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it('should return correct cache size', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1', 60);
      expect(cache.size()).toBe(1);
      cache.set('key2', 'value2', 60);
      expect(cache.size()).toBe(2);
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      // Set entry with 1 second TTL
      cache.set('short-lived', 'data', 1);

      // Should exist immediately
      expect(cache.get('short-lived')).toBe('data');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be expired
      expect(cache.get('short-lived')).toBeNull();
    });

    it('should not return expired entries even if not cleaned up', () => {
      // Manually set an expired entry
      cache.set('expired-key', 'data', -10); // Already expired

      // Should return null since it's expired
      expect(cache.get('expired-key')).toBeNull();
    });

    it('should handle different TTL values correctly', () => {
      cache.set('short', 'short-data', 5);
      cache.set('long', 'long-data', 3600);

      expect(cache.get('short')).toBe('short-data');
      expect(cache.get('long')).toBe('long-data');
    });
  });

  describe('data types', () => {
    it('should handle string values', () => {
      cache.set('string-key', 'string-value', 60);
      expect(cache.get('string-key')).toBe('string-value');
    });

    it('should handle number values', () => {
      cache.set('number-key', 42, 60);
      expect(cache.get('number-key')).toBe(42);
    });

    it('should handle object values', () => {
      const obj = { name: 'test', value: 123, nested: { data: 'nested' } };
      cache.set('object-key', obj, 60);
      expect(cache.get('object-key')).toEqual(obj);
    });

    it('should handle array values', () => {
      const arr = [1, 2, 3, { item: 'test' }];
      cache.set('array-key', arr, 60);
      expect(cache.get('array-key')).toEqual(arr);
    });

    it('should handle null values', () => {
      cache.set('null-key', null, 60);
      expect(cache.get('null-key')).toBeNull();
    });

    it('should handle boolean values', () => {
      cache.set('bool-key', true, 60);
      expect(cache.get('bool-key')).toBe(true);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple keys independently', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      cache.set('key3', 'value3', 60);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should allow overwriting existing keys', () => {
      cache.set('key', 'original', 60);
      expect(cache.get('key')).toBe('original');

      cache.set('key', 'updated', 60);
      expect(cache.get('key')).toBe('updated');
    });
  });
});

describe('generateCacheKey', () => {
  it('should generate consistent keys for same parameters', () => {
    const key1 = generateCacheKey('endpoint', { a: '1', b: '2' });
    const key2 = generateCacheKey('endpoint', { a: '1', b: '2' });
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different parameters', () => {
    const key1 = generateCacheKey('endpoint', { a: '1', b: '2' });
    const key2 = generateCacheKey('endpoint', { a: '1', b: '3' });
    expect(key1).not.toBe(key2);
  });

  it('should generate different keys for different endpoints', () => {
    const key1 = generateCacheKey('endpoint1', { a: '1' });
    const key2 = generateCacheKey('endpoint2', { a: '1' });
    expect(key1).not.toBe(key2);
  });

  it('should sort parameters for consistency', () => {
    const key1 = generateCacheKey('endpoint', { b: '2', a: '1' });
    const key2 = generateCacheKey('endpoint', { a: '1', b: '2' });
    expect(key1).toBe(key2);
  });

  it('should filter out undefined parameters', () => {
    const key1 = generateCacheKey('endpoint', { a: '1', b: undefined });
    const key2 = generateCacheKey('endpoint', { a: '1' });
    expect(key1).toBe(key2);
  });

  it('should handle empty parameters', () => {
    const key = generateCacheKey('endpoint', {});
    expect(key).toBe('endpoint:');
  });

  it('should handle special characters in values', () => {
    const key = generateCacheKey('endpoint', {
      station: 'WPOW1',
      tideStation: '9447130',
    });
    expect(key).toContain('station=WPOW1');
    expect(key).toContain('tideStation=9447130');
  });
});

describe('CACHE_TTL constants', () => {
  it('should have reasonable TTL values', () => {
    expect(CACHE_TTL.OBSERVATIONS).toBe(300); // 5 minutes
    expect(CACHE_TTL.FORECAST).toBe(1800); // 30 minutes
    expect(CACHE_TTL.TIDE_CURRENT).toBe(300); // 5 minutes
    expect(CACHE_TTL.TIDE_PREDICTIONS).toBe(3600); // 1 hour
    expect(CACHE_TTL.NBDC).toBe(300); // 5 minutes
  });

  it('should have shorter TTL for real-time data', () => {
    expect(CACHE_TTL.OBSERVATIONS).toBeLessThan(CACHE_TTL.FORECAST);
    expect(CACHE_TTL.NBDC).toBeLessThan(CACHE_TTL.FORECAST);
    expect(CACHE_TTL.TIDE_CURRENT).toBeLessThan(CACHE_TTL.TIDE_PREDICTIONS);
  });
});
