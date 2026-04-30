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

/**
 * Jalankan callback dalam satu transaction.
 * Callback menerima `client` (pg.PoolClient) untuk semua query-nya.
 * Auto ROLLBACK jika callback throw, AUTO COMMIT jika sukses.
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  checkDatabaseConnection,
  withTransaction,
};
