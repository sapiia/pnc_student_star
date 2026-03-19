const { createClient } = require('redis');
const config = require('./index');

let redisOptions = {};

if (config.redis) {
  const redisConfig = config.redis;
  redisOptions = {
    socket: {
      host: redisConfig.host || '127.0.0.1',
      port: redisConfig.port || 6379,
      reconnectStrategy: (retries) => {
        if (retries >= 10) return false;
        return Math.min(retries * 100, 3000);
      }
    },
    password: redisConfig.password || undefined,
    database: redisConfig.database || 0
  };
} else {
  console.warn('⚠️ config.redis not found. Using defaults.');
  redisOptions = {
    socket: {
      host: '127.0.0.1',
      port: 6379,
      reconnectStrategy: (retries) => {
        if (retries >= 10) return false;
        return Math.min(retries * 100, 3000);
      }
    }
  };
}

const redisClient = createClient(redisOptions);

let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Silently handle ECONNREFUSED and "Socket closed unexpectedly"
  if (err.code === 'ECONNREFUSED' || err.message === 'Socket closed unexpectedly') {
    // Suppress logs for connection refusal and unexpected closure
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
