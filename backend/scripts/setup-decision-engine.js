require('dotenv').config();
const db = require('../db1');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('🎯 Setting up Decision Engine database table...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../database/decision_engine_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await db.query(sql);
    
    console.log('✅ Decision Engine table created successfully!');
    console.log('📋 Table: decision_engine_results');
    console.log('📊 Indexes created');
    console.log('⚙️  Triggers configured\n');
    
    // Verify table exists
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'decision_engine_results'
      ORDER BY ordinal_position
    `);
    
    console.log(`✅ Verified ${result.rows.length} columns created:\n`);
    result.rows.forEach(col => {
      console.log(`   • ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up decision engine:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
})();

