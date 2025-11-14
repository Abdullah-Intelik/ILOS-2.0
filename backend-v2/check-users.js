const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkUsers() {
  try {
    console.log('\n🔍 Checking users table...\n');
    
    const result = await pool.query(`
      SELECT user_id, username, email, role, department 
      FROM users 
      ORDER BY user_id
      LIMIT 10
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No users found in database!');
      console.log('\n💡 Creating default EAVMU Officer (Ahmed Hassan - ID: 101)...\n');
      
      await pool.query(`
        INSERT INTO users (user_id, username, full_name, email, password_hash, role, department)
        VALUES (101, 'ahmed.hassan', 'Ahmed Hassan', 'ahmed.hassan@bank.com', '$2b$10$dummyhash', 'eamvu_officer', 'EAVMU')
        ON CONFLICT (user_id) DO NOTHING
      `);
      
      console.log('✅ Created Ahmed Hassan (ID: 101)');
    } else {
      console.log(`✅ Found ${result.rows.length} user(s):\n`);
      result.rows.forEach(u => {
        console.log(`   ID: ${u.user_id} | ${u.username} | ${u.role} | ${u.department || 'N/A'}`);
      });
      
      // Check if user 101 exists
      const user101 = result.rows.find(u => u.user_id === 101);
      if (!user101) {
        console.log('\n⚠️  User ID 101 (Ahmed Hassan) not found!');
        console.log('💡 Creating...\n');
        
        await pool.query(`
          INSERT INTO users (user_id, username, full_name, email, password_hash, role, department)
          VALUES (101, 'ahmed.hassan', 'Ahmed Hassan', 'ahmed.hassan@bank.com', '$2b$10$dummyhash', 'eamvu_officer', 'EAVMU')
          ON CONFLICT (user_id) DO NOTHING
        `);
        
        console.log('✅ Created Ahmed Hassan (ID: 101)');
      } else {
        console.log(`\n✅ User ID 101 exists: ${user101.username} (${user101.role})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();

