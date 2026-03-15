const { createClient } = require('redis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        return false; // Stop retrying after 10 attempts
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Silently handle ECONNREFUSED during reconnect attempts
  if (err.code === 'ECONNREFUSED') {
    // Suppress logs for connection refusal
  } else {
    console.error('Redis Client Error:', err.message);
  }
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    isRedisConnected = false;
    console.warn('⚠️ Redis not available. Falling back to MySQL for all requests.');
  }
};

module.exports = {
  redisClient,
  connectRedis,
  getIsRedisConnected: () => isRedisConnected
};
