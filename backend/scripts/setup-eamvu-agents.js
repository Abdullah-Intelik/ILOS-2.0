const fs = require('fs');
const path = require('path');
const db = require('../db1');

async function setupEAMVUAgents() {
  try {
    console.log('🔄 Setting up EAMVU agents tables...\n');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../database/eamvu_agents_setup.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 Executing SQL script...');
    
    // Execute the SQL
    await db.query(sqlContent);
    
    console.log('✅ EAMVU agents tables created successfully!\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...');
    
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('eamvu_agents', 'application_assignments')
      ORDER BY table_name
    `);
    
    console.log(`   Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Test: Fetch agents
    console.log('\n👥 Fetching test agents...');
    const agentsResult = await db.query(`
      SELECT agent_id, name, location, status, specialization, current_assignments, max_assignments
      FROM eamvu_agents 
      WHERE status = 'active'
      ORDER BY name
    `);
    
    console.log(`   Found ${agentsResult.rows.length} active agents:\n`);
    agentsResult.rows.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} (${agent.agent_id})`);
      console.log(`      Location: ${agent.location}`);
      console.log(`      Specialization: ${agent.specialization}`);
      console.log(`      Capacity: ${agent.current_assignments}/${agent.max_assignments}`);
      console.log('');
    });
    
    // Test: Check application_assignments table
    console.log('📋 Checking application_assignments table...');
    const assignmentsResult = await db.query(`
      SELECT COUNT(*) as count
      FROM application_assignments
    `);
    
    console.log(`   Total assignments: ${assignmentsResult.rows[0].count}`);
    
    // Test: Check agent_statistics view
    console.log('\n📊 Testing agent_statistics view...');
    const statsResult = await db.query(`
      SELECT agent_id, name, active_count, completed_count, actual_avg_days
      FROM agent_statistics
      LIMIT 3
    `);
    
    console.log(`   Statistics for ${statsResult.rows.length} agents:`);
    statsResult.rows.forEach(stat => {
      console.log(`   - ${stat.name}: ${stat.active_count} active, ${stat.completed_count} completed`);
    });
    
    console.log('\n✅ Setup complete! All tests passed.\n');
    console.log('🎯 Next steps:');
    console.log('   1. Add agents route to server.js:');
    console.log('      app.use(\'/api/agents\', require(\'./routes/agents\'));');
    console.log('   2. Restart the backend server');
    console.log('   3. Test the API: http://localhost:5000/api/agents');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up EAMVU agents:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupEAMVUAgents();

