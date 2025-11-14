const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkRole() {
  try {
    const result = await pool.query(`
      SELECT 
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
        AND contype = 'c'
    `);
    
    console.log('\n✅ Users table constraints:\n');
    result.rows.forEach(r => {
      console.log(`${r.constraint_name}:`);
      console.log(`  ${r.constraint_definition}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRole();

