const db = require('../db1');

/**
 * Automated EAVMU Officer Assignment Service
 * Automatically assigns applications to available EAVMU officers
 * Uses round-robin and load-balancing algorithm
 */

/**
 * Auto-assign application to available EAVMU officer
 * @param {number} losId - The LOS ID of the application
 * @returns {Object} Assignment result
 */
async function autoAssignToAvailableOfficer(losId) {
  try {
    console.log(`👤 Auto-assigning LOS-${losId} to Ahmed Hassan (Agent ID: 101)...`);
    
    // 🎯 ALWAYS ASSIGN TO AHMED HASSAN (Agent ID: 101)
    const availableOfficers = await db.query(`
      SELECT 
        ea.agent_id, 
        ea.name, 
        ea.status,
        ea.max_concurrent_assignments,
        COALESCE(COUNT(aa.id) FILTER (WHERE aa.status = 'active'), 0) as current_assignments,
        ea.created_at
      FROM eamvu_agents ea
      LEFT JOIN agent_assignments aa ON ea.agent_id = aa.agent_id AND aa.status = 'active'
      WHERE ea.status = 'active' AND ea.agent_id = 101
      GROUP BY ea.agent_id, ea.name, ea.status, ea.max_concurrent_assignments, ea.created_at
      LIMIT 1
    `);
    
    if (availableOfficers.rows.length === 0) {
      // Ahmed Hassan not available or doesn't exist - put in queue
      console.log(`⏳ Ahmed Hassan (Agent ID: 101) not available - queuing LOS-${losId}`);
      
      await db.query(`
        UPDATE ilos_applications 
        SET 
          status = 'pending_eavmu_assignment', 
          assignment_queued = true,
          queued_at = NOW(),
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      return { 
        assigned: false, 
        queued: true,
        reason: 'No officers available - added to queue'
      };
    }
    
    const officer = availableOfficers.rows[0];
    
    console.log(`✅ Assigning to Ahmed Hassan (Agent ID: 1)`);
    console.log(`   Current assignments: ${officer.current_assignments}/${officer.max_concurrent_assignments}`);
    
    // Check if already assigned (race condition protection)
    const existingAssignment = await db.query(`
      SELECT agent_id, status 
      FROM agent_assignments 
      WHERE los_id = $1 AND status = 'active'
    `, [losId]);
    
    if (existingAssignment.rows.length > 0) {
      console.log(`⚠️ LOS-${losId} already assigned to agent ${existingAssignment.rows[0].agent_id}`);
      return { 
        assigned: true, 
        alreadyAssigned: true,
        officer: existingAssignment.rows[0].agent_id
      };
    }
    
        // Create assignment
        await db.query(`
          INSERT INTO agent_assignments (
            los_id, 
            agent_id, 
            assigned_by, 
            assignment_notes,
            status
          )
          VALUES ($1, $2, $3, $4, $5)
        `, [
          losId, 
          officer.agent_id, 
          'AUTO_SYSTEM', 
          `Automatically assigned by system on ${new Date().toISOString()}`,
          'active'
        ]);
    
    // Update application status
    await db.query(`
      UPDATE ilos_applications 
      SET 
        status = 'assigned_to_eavmu_officer',
        assignment_queued = false,
        assigned_agent_id = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, officer.agent_id]);
    
    console.log(`✅ Successfully assigned LOS-${losId} to Ahmed Hassan`);
    
    return { 
      assigned: true, 
      officer: 'Ahmed Hassan', 
      agentId: 101,
      currentLoad: officer.current_assignments + 1,
      maxCapacity: officer.max_concurrent_assignments
    };
  } catch (error) {
    console.error(`❌ Auto assignment failed for LOS-${losId}:`, error.message);
    throw error;
  }
}

/**
 * Process queued applications when officers become available
 */
async function processQueuedApplications() {
  try {
    console.log(`🔄 Processing queued applications...`);
    
    // Get queued applications
    const queuedApps = await db.query(`
      SELECT 
        los_id, 
        loan_type,
        cnic
      FROM ilos_applications
      WHERE assignment_queued = true 
        AND status = 'pending_eavmu_assignment'
      ORDER BY queued_at ASC
      LIMIT 10
    `);
    
    if (queuedApps.rows.length === 0) {
      console.log(`✅ No queued applications to process`);
      return { processed: 0 };
    }
    
    console.log(`📋 Found ${queuedApps.rows.length} queued applications`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const app of queuedApps.rows) {
      try {
        const result = await autoAssignToAvailableOfficer(app.los_id);
        if (result.assigned) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to assign queued app LOS-${app.los_id}:`, error.message);
        failCount++;
      }
    }
    
    console.log(`✅ Queue processing complete: ${successCount} assigned, ${failCount} still queued`);
    
    return {
      processed: successCount,
      remaining: failCount
    };
  } catch (error) {
    console.error(`❌ Error processing queued applications:`, error.message);
    throw error;
  }
}

/**
 * Manual assignment override (for special cases)
 */
async function manualAssignment(losId, agentId, assignedBy, notes) {
  try {
    console.log(`👤 Manual assignment: LOS-${losId} → Agent ${agentId} by ${assignedBy}`);
    
    // Check agent availability
    const agentCheck = await db.query(`
      SELECT 
        agent_id, 
        name, 
        status,
        max_concurrent_assignments,
        (SELECT COUNT(*) FROM agent_assignments WHERE agent_id = ea.agent_id AND status = 'active') as current_assignments
      FROM eamvu_agents ea 
      WHERE agent_id = $1
    `, [agentId]);
    
    if (agentCheck.rows.length === 0) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    const agent = agentCheck.rows[0];
    
    if (agent.status !== 'active') {
      throw new Error(`Agent ${agent.name} is not active`);
    }
    
    if (agent.current_assignments >= agent.max_concurrent_assignments) {
      console.warn(`⚠️ Agent ${agent.name} is at capacity but allowing manual override`);
    }
    
    // Create assignment
    await db.query(`
      INSERT INTO agent_assignments (
        los_id, 
        agent_id, 
        assigned_by, 
        assignment_notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
    `, [losId, agentId, assignedBy, notes || 'Manual assignment', 'active']);
    
    // Update status
    await db.query(`
      UPDATE ilos_applications 
      SET 
        status = 'assigned_to_eavmu_officer',
        assignment_queued = false,
        assigned_agent_id = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, agentId]);
    
    console.log(`✅ Manual assignment successful`);
    
    return {
      success: true,
      officer: agent.name,
      agentId: agent.agent_id
    };
  } catch (error) {
    console.error(`❌ Manual assignment failed:`, error.message);
    throw error;
  }
}

module.exports = { 
  autoAssignToAvailableOfficer,
  processQueuedApplications,
  manualAssignment
};

