import NodeCache from 'node-cache';

// Create cache instance with 60-second TTL by default
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || '60'),
  checkperiod: 120,
  useClones: false,
});

/**
 * Cache service for storing API responses
 */
class CacheService {
  /**
   * Get cached data by key
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null
   */
  get(key) {
    const value = cache.get(key);
    if (value) {
      console.log(`📦 Cache HIT: ${key}`);
      return value;
    }
    console.log(`📭 Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl) {
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
    console.log(`💾 Cache SET: ${key}`);
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  delete(key) {
    cache.del(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
  }

  /**
   * Clear all cache
   */
  flush() {
    cache.flushAll();
    console.log('🧹 Cache FLUSHED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return cache.getStats();
  }

  /**
   * Get or set pattern - fetch data if not cached
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch data if not cached
   * @param {number} ttl - Optional TTL override
   */
  async getOrSet(key, fetchFn, ttl) {
    let data = this.get(key);
    
    if (data === null) {
      data = await fetchFn();
      this.set(key, data, ttl);
    }
    
    return data;
  }
}

export default new CacheService();
