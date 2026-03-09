require('dotenv').config();
const app = require('./app');
const http = require('http');
const { initRealtime } = require('./realtime');
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
initRealtime(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
