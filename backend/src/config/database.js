const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL
} = process.env;

const shouldUseSsl = (() => {
  if (typeof DB_SSL !== 'undefined') {
    return String(DB_SSL).toLowerCase() === 'true';
  }
  if (DATABASE_URL && /render\.com/i.test(DATABASE_URL)) {
    return true;
  }
  if (DB_HOST && /render\.com/i.test(DB_HOST)) {
    return true;
  }
  return false;
})();

const pool = new Pool({
  connectionString: DATABASE_URL || undefined,
  host: DATABASE_URL ? undefined : DB_HOST,
  port: DATABASE_URL ? undefined : Number(DB_PORT) || 5432,
  user: DATABASE_URL ? undefined : DB_USER,
  password: DATABASE_URL ? undefined : (DB_PASSWORD || DB_PASS),
  database: DATABASE_URL ? undefined : DB_NAME,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
});

const normalizeShowColumns = (sql) => {
  const match = String(sql || '').trim().match(/^SHOW\s+COLUMNS\s+FROM\s+("?)([a-zA-Z0-9_]+)\1\s*;?$/i);
  if (!match) return null;
  const tableName = match[2];
  return {
    text: `
      SELECT column_name AS "Field"
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = $1
      ORDER BY ordinal_position ASC
    `,
    values: [tableName]
  };
};

const replacePlaceholders = (sql, params = []) => {
  let index = 0;
  const text = String(sql || '').replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
};

const prepareSql = (sql, params = []) => {
  const showColumns = normalizeShowColumns(sql);
  if (showColumns) {
    return showColumns;
  }

  let text = String(sql || '');
  text = text.replace(/`([^`]+)`/g, '"$1"');
  text = text.replace(/CURRENT_TIMESTAMP\(\)/gi, 'CURRENT_TIMESTAMP');

  const isInsert = /^\s*INSERT\s+INTO\s+/i.test(text);
  const hasReturning = /\bRETURNING\b/i.test(text);
  const insertTargetMatch = text.trim().match(/^INSERT\s+INTO\s+("?)([a-zA-Z0-9_]+)\1/i);
  const insertTarget = insertTargetMatch?.[2]?.toLowerCase();
  const noReturningTables = new Set(['students', 'teachers']);

  if (isInsert && !hasReturning && !noReturningTables.has(insertTarget)) {
    text = `${text.trim()} RETURNING id`;
  }

  return replacePlaceholders(text, params);
};

const buildResultMeta = (result) => ({
  affectedRows: Number(result?.rowCount || 0),
  insertId: result?.rows?.[0]?.id ? Number(result.rows[0].id) : 0
});

const runQuery = async (client, sql, params) => {
  const { text, values } = prepareSql(sql, params);
  const result = await client.query(text, values);

  const command = String(result.command || '').toUpperCase();
  if (command === 'SELECT' || command === 'SHOW') {
    return [result.rows];
  }

  return [buildResultMeta(result)];
};

const getConnection = async () => {
  const client = await pool.connect();
  return {
    query: (sql, params) => runQuery(client, sql, params),
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release()
  };
};

module.exports = {
  query: (sql, params) => runQuery(pool, sql, params),
  getConnection
};
