const mysql = require('mysql2');
const config = require('./index');

// បង្កើត Connection Pool
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// បំប្លែងទៅជា Promise ដើម្បីងាយស្រួលប្រើ async/await
module.exports = pool.promise();
