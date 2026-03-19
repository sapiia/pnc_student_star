const config = require('./config/index');
const app = require('./app');
const http = require('http');
const { initRealtime } = require('./realtime');
const { connectRedis } = require('./config/redis');
const PORT = config.server.port || 3001;

const server = http.createServer(app);
initRealtime(server);

// Initialize Redis
connectRedis();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
