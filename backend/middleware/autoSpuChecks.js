const axios = require('axios');
const db = require('../db1');

/**
 * Automated SPU Checks Middleware
 * Automatically runs all compliance checks when an application is submitted
 */

async function autoSpuChecks(losId, cnic, applicationType) {
  try {
    console.log(`🔍 Starting automated SPU checks for LOS-${losId}`);
    
    if (!cnic) {
      throw new Error('CNIC is required for SPU checks');
    }

    // Run all SPU checks automatically via combine-checks API
    const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
    const checkResult = await axios.post(`${baseURL}/api/check-all`, { cnic });
    
    console.log(`📊 SPU Check Results for LOS-${losId}:`, {
      anyHit: checkResult.data.anyHit,
      summary: checkResult.data.summary
    });
    
    // Save results to database
    await db.query(`
      UPDATE ilos_applications 
      SET 
        spu_checks_result = $1,
        spu_checks_completed = true,
        spu_checks_completed_at = NOW(),
        auto_processed = true
      WHERE los_id = $2
    `, [JSON.stringify(checkResult.data), losId]);
    
    // Determine if application should be auto-approved or auto-rejected
    if (checkResult.data.anyHit) {
      // Found in blacklist/watchlist - auto-reject
      console.log(`❌ Auto-rejecting LOS-${losId}: Found in watchlist/blacklist`);
      
      await db.query(`
        UPDATE ilos_applications 
        SET 
          status = 'rejected_by_spu',
          rejection_reason = $1,
          rejection_details = $2,
          updated_at = NOW()
        WHERE los_id = $3
      `, [
        'Automated SPU checks failed - Found in compliance watchlist',
        JSON.stringify(checkResult.data.summary),
        losId
      ]);
      
      return { 
        approved: false, 
        reason: 'Found in watchlist/blacklist',
        details: checkResult.data.summary
      };
    } else {
      // All clear - auto-approve and move forward
      console.log(`✅ Auto-approving LOS-${losId}: All SPU checks passed`);
      
      await db.query(`
        UPDATE ilos_applications 
        SET 
          status = 'submitted_by_spu',
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      return { 
        approved: true,
        checkResults: checkResult.data
      };
    }
  } catch (error) {
    console.error(`❌ Auto SPU checks failed for LOS-${losId}:`, error.message);
    
    // On error, keep application in pending state for manual review
    await db.query(`
      UPDATE ilos_applications 
      SET 
        spu_checks_completed = false,
        spu_checks_error = $1,
        status = 'submitted_by_pb',
        updated_at = NOW()
      WHERE los_id = $2
    `, [error.message, losId]);
    
    throw new Error(`SPU checks failed: ${error.message}`);
  }
}

/**
 * Manually trigger SPU checks (fallback/override option)
 */
async function manualSpuCheck(losId, cnic, userId) {
  console.log(`👤 Manual SPU check triggered by user ${userId} for LOS-${losId}`);
  return await autoSpuChecks(losId, cnic, null);
}

module.exports = { 
  autoSpuChecks,
  manualSpuCheck
};

