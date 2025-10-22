const db = require('../db1');

async function updateTablesForMobile() {
  try {
    console.log('🔄 Updating tables for mobile app compatibility...\n');
    
    // =============================================
    // Update eamvu_agents table
    // =============================================
    console.log('📝 Updating eamvu_agents table...');
    
    const agentAlterQueries = [
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS agent_id_str VARCHAR(50)`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS cnic VARCHAR(15)`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS specialization VARCHAR(255)`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS current_assignments INTEGER DEFAULT 0`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS total_completed INTEGER DEFAULT 0`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS avg_completion_days DECIMAL(5,2) DEFAULT 0`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS performance_rating DECIMAL(3,2) DEFAULT 0`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS last_assignment_date TIMESTAMP`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS notes TEXT`,
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    ];
    
    for (const query of agentAlterQueries) {
      try {
        await db.query(query);
      } catch (e) {
        // Column might already exist, ignore
      }
    }
    
    console.log('✅ eamvu_agents columns updated\n');
    
    // Add unique index on agent_id_str
    try {
      await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_eamvu_agents_id_str ON eamvu_agents(agent_id_str)`);
    } catch (e) {
      // Index might exist
    }
    
    // =============================================
    // Update agent_assignments table
    // =============================================
    console.log('📝 Updating agent_assignments table...');
    
    const assignmentAlterQueries = [
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS agent_id_str VARCHAR(50)`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS application_type VARCHAR(100)`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS assignment_status VARCHAR(50) DEFAULT 'active'`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium'`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS investigation_notes TEXT`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS verification_status VARCHAR(100)`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS visit_date TIMESTAMP`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS visit_location TEXT`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS documents_collected JSONB`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS photos_collected JSONB`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE agent_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    ];
    
    for (const query of assignmentAlterQueries) {
      try {
        await db.query(query);
      } catch (e) {
        // Column might already exist, ignore
      }
    }
    
    // Rename existing columns if they use different names
    try {
      await db.query(`ALTER TABLE agent_assignments RENAME COLUMN assigned_at TO assigned_date`);
    } catch (e) {
      // Column might already be named assigned_date
    }
    
    console.log('✅ agent_assignments columns updated\n');
    
    // Create indexes
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_agent_assign_agent_str ON agent_assignments(agent_id_str)`,
      `CREATE INDEX IF NOT EXISTS idx_agent_assign_los ON agent_assignments(los_id)`,
      `CREATE INDEX IF NOT EXISTS idx_agent_assign_status ON agent_assignments(assignment_status)`
    ];
    
    for (const query of indexQueries) {
      try {
        await db.query(query);
      } catch (e) {
        // Index might exist
      }
    }
    
    // =============================================
    // Insert/Update mobile app agents
    // =============================================
    console.log('👥 Adding/updating mobile app agents...\n');
    
    const mobileAgents = [
      { id: 101, idStr: 'agent-001', name: 'Ahmad Hassan', email: 'ahmad.hassan@ilos.com', phone: '+92-300-1234567', location: 'Lahore - Model Town', specialization: 'Commercial Loans', max: 15 },
      { id: 102, idStr: 'agent-002', name: 'Fatima Ali', email: 'fatima.ali@ilos.com', phone: '+92-301-2345678', location: 'Karachi - Clifton', specialization: 'Personal Loans', max: 12 },
      { id: 103, idStr: 'agent-003', name: 'Muhammad Khan', email: 'muhammad.khan@ilos.com', phone: '+92-302-3456789', location: 'Islamabad - F-7', specialization: 'Vehicle Financing', max: 10 },
      { id: 104, idStr: 'agent-004', name: 'Aisha Sheikh', email: 'aisha.sheikh@ilos.com', phone: '+92-303-4567890', location: 'Lahore - DHA', specialization: 'Property Verification', max: 12 },
      { id: 105, idStr: 'agent-005', name: 'Sara Ahmed', email: 'sara.ahmed@ilos.com', phone: '+92-304-5678901', location: 'Karachi - Gulshan', specialization: 'Credit Card Verification', max: 10 }
    ];
    
    for (const agent of mobileAgents) {
      await db.query(`
        INSERT INTO eamvu_agents (
          agent_id, agent_id_str, name, email, phone, location, 
          status, specialization, max_concurrent_assignments, 
          current_assignments, total_completed
        ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, 0, 0)
        ON CONFLICT (agent_id) DO UPDATE SET
          agent_id_str = EXCLUDED.agent_id_str,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          specialization = EXCLUDED.specialization,
          max_concurrent_assignments = EXCLUDED.max_concurrent_assignments,
          status = 'active'
      `, [agent.id, agent.idStr, agent.name, agent.email, agent.phone, agent.location, agent.specialization, agent.max]);
      
      console.log(`  ✓ ${agent.name} (${agent.idStr})`);
    }
    
    // =============================================
    // Update existing assignments with agent_id_str
    // =============================================
    console.log('\n📊 Syncing agent_id_str in assignments...');
    
    await db.query(`
      UPDATE agent_assignments aa
      SET agent_id_str = ea.agent_id_str
      FROM eamvu_agents ea
      WHERE aa.agent_id = ea.agent_id
        AND aa.agent_id_str IS NULL
    `);
    
    const syncResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM agent_assignments 
      WHERE agent_id_str IS NOT NULL
    `);
    
    console.log(`  ✓ Synced ${syncResult.rows[0].count} assignments with agent_id_str\n`);
    
    // =============================================
    // Test mobile app compatibility
    // =============================================
    console.log('🧪 Testing mobile app compatibility...\n');
    
    // Test 1: Fetch by agent_id_str (mobile app uses this)
    const testAgent = await db.query(`
      SELECT agent_id, agent_id_str, name, location, specialization, status
      FROM eamvu_agents 
      WHERE agent_id_str = 'agent-001'
    `);
    
    if (testAgent.rows.length > 0) {
      console.log(`  ✓ Agent lookup by string ID: ${testAgent.rows[0].name}`);
    } else {
      console.log('  ❌ Cannot fetch agent by string ID');
    }
    
    // Test 2: Get agent assignments
    const testAssignments = await db.query(`
      SELECT COUNT(*) as count
      FROM agent_assignments aa
      JOIN eamvu_agents ea ON aa.agent_id = ea.agent_id
      WHERE ea.agent_id_str = 'agent-001'
    `);
    
    console.log(`  ✓ Agent assignments query works: ${testAssignments.rows[0].count} assignments`);
    
    // Test 3: Get all active agents
    const allAgents = await db.query(`
      SELECT COUNT(*) as count
      FROM eamvu_agents 
      WHERE status = 'active' AND agent_id_str IS NOT NULL
    `);
    
    console.log(`  ✓ Mobile-compatible agents: ${allAgents.rows[0].count}`);
    
    console.log('\n✅ Setup complete!');
    console.log('\n📱 Mobile app can now:');
    console.log('   - Login with: Ahmad Hassan / 001');
    console.log('   - Fetch agents: GET /api/agents');
    console.log('   - Get assignments: GET /api/agents/:agentIdStr/assignments');
    console.log('   - Create assignments: POST /api/agents/assign');
    console.log('   - Complete tasks: POST /api/agents/complete-assignment');
    console.log('\n🔄 Next: Restart backend server');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateTablesForMobile();

