const db = require('../db1');

async function checkAssignmentsTable() {
  try {
    console.log('=== Checking agent_assignments table ===\n');
    
    // Check if table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agent_assignments'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Table agent_assignments does not exist');
      process.exit(0);
    }
    
    console.log('✅ Table agent_assignments exists\n');
    
    // Get table structure
    console.log('📋 Table structure:');
    const structure = await db.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'agent_assignments' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      const type = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`  - ${col.column_name}: ${type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Get sample data
    console.log('\n📊 Sample data:');
    const data = await db.query('SELECT * FROM agent_assignments LIMIT 5');
    console.log(`  Found ${data.rows.length} rows\n`);
    
    if (data.rows.length > 0) {
      data.rows.forEach((row, i) => {
        console.log(`  Assignment ${i + 1}:`);
        console.log(`    ID: ${row.id}`);
        console.log(`    LOS ID: ${row.los_id}`);
        console.log(`    Agent ID: ${row.agent_id}`);
        console.log(`    Status: ${row.assignment_status}`);
        console.log(`    Priority: ${row.priority || 'N/A'}`);
        console.log(`    Assigned: ${row.assigned_date}`);
        console.log('');
      });
    }
    
    // Get statistics
    console.log('📈 Statistics:');
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN assignment_status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN assignment_status = 'completed' THEN 1 END) as completed,
        COUNT(DISTINCT agent_id) as unique_agents
      FROM agent_assignments
    `);
    
    console.log(`  Total assignments: ${stats.rows[0].total}`);
    console.log(`  Active: ${stats.rows[0].active}`);
    console.log(`  Completed: ${stats.rows[0].completed}`);
    console.log(`  Unique agents: ${stats.rows[0].unique_agents}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAssignmentsTable();

