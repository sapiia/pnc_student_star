const { redisClient, getIsRedisConnected } = require('../config/redis');

// In-memory map to store pending fetch promises
const pendingRequests = new Map();

/**
 * Get data from cache or execute a fetch function to regenerate it
 * This prevents "Cache Stampede" by ensuring only one request fetches from DB 
 * while multiple identical requests wait for the same promise.
 * @param {string} key
 * @param {Function} fetchFn - Function to execute if cache is empty
 * @param {number} ttl - TTL for the cache in seconds
 */
const getOrSetCache = async (key, fetchFn, ttl = 3600) => {
  // 1. Check Redis Cache
  const cachedData = await getCache(key);
  if (cachedData) return cachedData;

  // 2. Check if a request is already fetching this key
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // 3. Start a new fetch and share the promise
  const fetchPromise = (async () => {
    try {
      const freshData = await fetchFn();
      if (freshData !== undefined && freshData !== null) {
        await setCache(key, freshData, ttl);
      }
      return freshData;
    } finally {
      // Always cleanup the promise once done
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, fetchPromise);
  return fetchPromise;
};

/**
 * Get data from cache
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  if (!getIsRedisConnected()) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    // Silently fallback on errors
    return null;
  }
};

/**
 * Set data to cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Time to live in seconds (default 3600 = 1 hour)
 */
const setCache = async (key, value, ttl = 3600) => {
  if (!getIsRedisConnected()) return;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl
    });
  } catch (err) {
    // Ignore cache set errors
  }
};

/**
 * Delete data from cache
 * @param {string|string[]} keys 
 */
const delCache = async (keys) => {
  if (!getIsRedisConnected()) return;
  try {
    await redisClient.del(keys);
  } catch (err) {
    // Ignore cache del errors
  }
};

/**
 * Delete keys matching a pattern
 * @param {string} pattern 
 */
const delCachePattern = async (pattern) => {
  if (!getIsRedisConnected()) return;
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      if (reply.keys.length > 0) {
        await redisClient.del(reply.keys);
      }
    } while (cursor !== 0);
  } catch (err) {
    // Ignore pattern errors
  }
};

module.exports = {
  getOrSetCache,
  getCache,
  setCache,
  delCache,
  delCachePattern
};
