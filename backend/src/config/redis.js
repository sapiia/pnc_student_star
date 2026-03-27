const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log(`Redis connected to ${redisHost}:${redisPort}`);
    }
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }
})();

module.exports = redisClient;
