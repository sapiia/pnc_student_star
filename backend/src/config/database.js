const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// បង្កើត Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  // Support either DB_PASSWORD or legacy DB_PASS
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// បំប្លែងទៅជា Promise ដើម្បីងាយស្រួលប្រើ async/await
module.exports = pool.promise();

