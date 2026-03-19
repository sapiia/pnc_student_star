const { createClient } = require("redis");

// create client
const redisClient = createClient({
  socket: {
    host: "localhost", // use localhost because Node runs on your machine
    port: 6379
  }
});

// handle error
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

// connect
(async () => {
  await redisClient.connect();
  console.log("✅ Redis connected");
})();

module.exports = redisClient;