const db = require('../db1');

async function updateEAMVUForMobile() {
  try {
    console.log('🔄 Updating EAMVU agents table for mobile app compatibility...\n');
    
    // Add missing columns if they don't exist
    console.log('📝 Adding missing columns...');
    
    const alterQueries = [
      // Add string agent_id_str column for mobile compatibility
      `ALTER TABLE eamvu_agents ADD COLUMN IF NOT EXISTS agent_id_str VARCHAR(50)`,
      
      // Add other useful columns
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
    
    for (const query of alterQueries) {
      try {
        await db.query(query);
      } catch (e) {
        // Column might already exist, ignore
      }
    }
    
    console.log('✅ Columns added/checked\n');
    
    // Insert/Update mobile app compatible agents
    console.log('👥 Adding mobile app agents...');
    
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
          max_concurrent_assignments = EXCLUDED.max_concurrent_assignments
      `, [agent.id, agent.idStr, agent.name, agent.email, agent.phone, agent.location, agent.specialization, agent.max]);
      
      console.log(`  ✓ ${agent.name} (${agent.idStr})`);
    }
    
    console.log('\n✅ Mobile app agents added successfully!');
    
    // Create application_assignments table if it doesn't exist
    console.log('\n📋 Setting up application_assignments table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS application_assignments (
        id SERIAL PRIMARY KEY,
        los_id INTEGER NOT NULL,
        agent_id INTEGER NOT NULL,
        agent_id_str VARCHAR(50),
        application_type VARCHAR(100),
        assigned_by VARCHAR(255),
        assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assignment_status VARCHAR(50) DEFAULT 'active',
        completion_date TIMESTAMP,
        priority VARCHAR(50) DEFAULT 'medium',
        notes TEXT,
        investigation_notes TEXT,
        verification_status VARCHAR(100),
        visit_date TIMESTAMP,
        visit_location TEXT,
        documents_collected JSONB,
        photos_collected JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_app_assign_agent ON application_assignments(agent_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_app_assign_agent_str ON application_assignments(agent_id_str)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_app_assign_los ON application_assignments(los_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_app_assign_status ON application_assignments(assignment_status)`);
    
    console.log('✅ application_assignments table ready');
    
    // Test queries
    console.log('\n🧪 Testing mobile app compatibility...');
    
    // Test 1: Fetch by agent_id_str (mobile app uses this)
    const testAgent = await db.query(`
      SELECT agent_id, agent_id_str, name, location, specialization, status
      FROM eamvu_agents 
      WHERE agent_id_str = 'agent-001'
    `);
    
    if (testAgent.rows.length > 0) {
      console.log(`  ✓ Can fetch by agent_id_str: ${testAgent.rows[0].name}`);
    } else {
      console.log('  ❌ Cannot fetch by agent_id_str');
    }
    
    // Test 2: Fetch all active agents (web app uses this)
    const allAgents = await db.query(`
      SELECT COUNT(*) as count
      FROM eamvu_agents 
      WHERE status = 'active'
    `);
    
    console.log(`  ✓ Total active agents: ${allAgents.rows[0].count}`);
    
    console.log('\n✅ Setup complete! Mobile app can now use:');
    console.log('   - GET /api/agents - Get all agents');
    console.log('   - GET /api/agents/:agentIdStr - Get specific agent');
    console.log('   - POST /api/agents/assign - Assign application');
    console.log('   - POST /api/agents/complete-assignment - Complete assignment');
    console.log('\n🔄 Next: Restart backend server to load new routes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateEAMVUForMobile();

