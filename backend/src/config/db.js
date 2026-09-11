/**
 * PostgreSQL connection pool
 * Uses the 'pg' library — never connects to PostGIS directly from frontend.
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'nlas_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,                  // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection failed:', err.message);
  } else {
    console.log('✅  PostgreSQL connected');
    release();
  }
});

/**
 * Convenience query helper.
 * Usage: const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
 */
const db = {
  query: (text, params) => pool.query(text, params),
  pool,
};

module.exports = db;
