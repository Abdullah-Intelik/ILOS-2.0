/**
 * Assign All Pending Applications to Ahmed Hassan (agent-001)
 */

const db = require('./db1');

async function assignAllToAhmed() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ASSIGNING ALL PENDING APPLICATIONS TO AHMED HASSAN (Agent ID: 101)');
    console.log('='.repeat(60) + '\n');

    // Get all applications that need assignment
    const pendingApps = await db.query(`
      SELECT los_id, status, loan_type, cnic
      FROM ilos_applications
      WHERE status IN (
        'submitted_by_pb',
        'PB_SUBMITTED', 
        'submitted_by_spu',
        'pending_eavmu_assignment'
      )
      AND los_id NOT IN (
        SELECT los_id FROM agent_assignments WHERE status = 'active'
      )
      ORDER BY los_id DESC
    `);

    if (pendingApps.rows.length === 0) {
      console.log('✅ No pending applications found to assign');
      process.exit(0);
    }

    console.log(`📋 Found ${pendingApps.rows.length} pending applications:\n`);
    
    let successCount = 0;
    let failCount = 0;

    for (const app of pendingApps.rows) {
      try {
        console.log(`📌 Processing LOS-${app.los_id}...`);

        // Check if already assigned
        const existingAssignment = await db.query(`
          SELECT * FROM agent_assignments 
          WHERE los_id = $1 AND status = 'active'
        `, [app.los_id]);

        if (existingAssignment.rows.length > 0) {
          console.log(`   ⚠️  Already assigned to agent ${existingAssignment.rows[0].agent_id}`);
          continue;
        }

        // Create assignment to Ahmed Hassan (agent-001 or agent_id = 101)
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
          app.los_id,
          101, // agent_id = 101 (Ahmed Hassan)
          'ADMIN',
          'Bulk assigned to Ahmed Hassan by admin',
          'active'
        ]);

        // Update application status
        await db.query(`
          UPDATE ilos_applications
          SET 
            status = 'assigned_to_eavmu_officer',
            assigned_agent_id = $2,
            updated_at = NOW()
          WHERE los_id = $1
        `, [app.los_id, 101]);

        console.log(`   ✅ Assigned LOS-${app.los_id} to Ahmed Hassan`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Failed to assign LOS-${app.los_id}:`, error.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully assigned: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📋 Total processed: ${pendingApps.rows.length}`);
    console.log('\n✨ All applications assigned to Ahmed Hassan (Agent ID: 101)');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

assignAllToAhmed();

