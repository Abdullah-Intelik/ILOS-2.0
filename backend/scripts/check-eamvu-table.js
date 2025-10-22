const db = require('../db1');

async function checkTable() {
  try {
    console.log('=== Checking existing eamvu_agents table ===\n');
    
    // Check if table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'eamvu_agents'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Table eamvu_agents does not exist');
      process.exit(0);
    }
    
    console.log('✅ Table eamvu_agents exists\n');
    
    // Get table structure
    console.log('📋 Table structure:');
    const structure = await db.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'eamvu_agents' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      const type = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`  - ${col.column_name}: ${type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Get sample data
    console.log('\n👥 Sample data:');
    const data = await db.query('SELECT * FROM eamvu_agents LIMIT 3');
    console.log(`  Found ${data.rows.length} rows`);
    data.rows.forEach((row, i) => {
      console.log(`\n  Row ${i + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value !== null) {
          console.log(`    ${key}: ${value}`);
        }
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTable();

