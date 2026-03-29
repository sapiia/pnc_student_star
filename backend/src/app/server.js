require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initRealtime } = require('./realtime');
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
initRealtime(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
