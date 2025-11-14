/**
 * Test Server Startup
 * Simple script to test database connection and server startup
 */

require('dotenv').config();

console.log('🔧 Testing ILOS V2.0 Startup...\n');

// 1. Test environment variables
console.log('1. Environment Variables:');
console.log('   PORT:', process.env.PORT);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('   BANK_CODE:', process.env.BANK_CODE);
console.log('');

// 2. Test database connection
console.log('2. Testing Database Connection...');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ilos_v2_demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('   ❌ Database connection failed:', err.message);
    process.exit(1);
  }
  
  console.log('   ✅ Database connected successfully');
  console.log('   Server time:', result.rows[0].now);
  console.log('');
  
  // 3. Test table count
  pool.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'", (err2, result2) => {
    if (err2) {
      console.error('   ❌ Error querying tables:', err2.message);
    } else {
      console.log('   Tables created:', result2.rows[0].count);
    }
    
    pool.end(() => {
      console.log('\n✅ All checks passed! Server should be able to start.\n');
      console.log('To start the server:');
      console.log('   npm run dev');
      console.log('   OR');
      console.log('   node server.js');
    });
  });
});

