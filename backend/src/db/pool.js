const { Pool } = require('pg');
const { env } = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgssl ? { rejectUnauthorized: false } : false,
});

async function checkDatabaseConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW() AS now');
    return result.rows[0];
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  checkDatabaseConnection,
};
