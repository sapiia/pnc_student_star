require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initRealtime } = require('./realtime');
const db = require('../config/database');
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
initRealtime(server);

const startServer = async () => {
  await db.assertDatabaseConnection();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

