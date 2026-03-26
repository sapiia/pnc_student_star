const mysql = require('mysql2');
const path = require('path');

if (!process.env.DB_HOST && !process.env.DB_USER && !process.env.DB_NAME) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return value === undefined || value === null || value.toString().trim() === '';
});

const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '';
const invalidPlaceholderPasswords = new Set([
  'yourpassword',
  'your_password',
  'password',
  'changeme'
]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Database configuration is missing required environment variables: ${missingEnvVars.join(', ')}. `
    + 'Update backend/.env with DB_HOST, DB_USER, DB_NAME, and optionally DB_PASSWORD or DB_PASS.'
  );
}

if (dbPassword && invalidPlaceholderPasswords.has(dbPassword.trim().toLowerCase())) {
  throw new Error(
    'Database password in backend/.env still looks like a placeholder. '
    + 'Set DB_PASSWORD or DB_PASS to your real MySQL password, or leave it blank only if your MySQL user has no password.'
  );
}

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: process.env.DB_USER,
  // Support either DB_PASSWORD or legacy DB_PASS
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

promisePool.assertDatabaseConnection = async () => {
  try {
    await promisePool.query('SELECT 1');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Could not connect to MySQL at ${dbHost}:${dbPort}. `
        + 'No database server is accepting connections there. '
        + 'Start MySQL/MariaDB, or update DB_HOST/DB_PORT in backend/.env to match your running database.'
      );
    }

    if (error.code === 'ENOTFOUND') {
      throw new Error(
        `Could not resolve the MySQL host "${dbHost}". `
        + 'Check DB_HOST in backend/.env.'
      );
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(
        `MySQL rejected the login for ${process.env.DB_USER}@${dbHost}. `
        + 'Check DB_USER and DB_PASSWORD/DB_PASS in backend/.env.'
      );
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error(
        `MySQL database "${process.env.DB_NAME}" does not exist. `
        + 'Create it first, then import your schema.'
      );
    }

    throw error;
  }
};

module.exports = promisePool;

