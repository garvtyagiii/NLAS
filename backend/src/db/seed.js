/**
 * DB seed script — inserts demo data.
 * Run: node src/db/seed.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'nlas_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱  Seeding demo data...');
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(sql);
    console.log('✅  Seed complete.');
    console.log('');
    console.log('Demo login credentials:');
    console.log('  Email:    rajesh.sharma@nlas.gov.in');
    console.log('  Password: password123');
    console.log('  Role:     CENTRAL_OFFICER');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
