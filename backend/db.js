const { Pool } = require('pg');
require('dotenv').config();

// Allow SSL to be disabled for local Postgres
const rawUrl = (process.env.DATABASE_URL || '').trim();
const wantsSsl = (process.env.PG_SSL || '').toLowerCase() === 'true' || /sslmode=require/i.test(rawUrl);

const pool = new Pool({
  connectionString: rawUrl,
  max: parseInt(process.env.PG_POOL_MAX || '10', 10),
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '5000', 10),
  ssl: wantsSsl ? { rejectUnauthorized: false } : false
});

// Test connection and force Asia/Karachi timezone for this session
pool.on('connect', async (client) => {
  try {
    await client.query("SET TIME ZONE 'Asia/Karachi'");
    await client.query("SET application_name TO 'ILOS-backend-db'");
    await client.query("SET statement_timeout TO '10s'");
    await client.query("SET idle_in_transaction_session_timeout TO '5s'");
    console.log('✅ Connected to PostgreSQL database(CBS) with tuned session settings');
  } catch (e) {
    console.log('⚠️ Connected to PostgreSQL database(CBS) but failed to set session settings:', e.message);
  }
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;
