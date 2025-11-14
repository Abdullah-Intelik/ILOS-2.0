const { autoSpuChecks } = require('../middleware/autoSpuChecks');
const { autoAssignToAvailableOfficer, processQueuedApplications } = require('./autoAssignEavmu');
const { autoFinalize } = require('./autoDisbursement');
const db = require('../db1');

/**
 * Automated Workflow Orchestrator
 * Manages the end-to-end automated workflow for ILOS applications
 */

/**
 * Process new application through automated workflow
 * Flow: PB Submit → Auto SPU Checks → Auto Assign to EAVMU Officer
 */
async function processNewApplication(losId, applicationData) {
  try {
    const isInstantLoan = applicationData.applicationType === 'instant_loan';
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 AUTOMATED WORKFLOW STARTED ${isInstantLoan ? '⚡ INSTANT LOAN' : ''}`);
    console.log(`   LOS ID: ${losId}`);
    console.log(`   Product: ${applicationData.applicationType}`);
    console.log(`   CNIC: ${applicationData.cnic}`);
    if (isInstantLoan) {
      console.log(`   ⚡ INSTANT MODE: Auto-approve + Auto-disburse after SPU checks`);
    }
    console.log(`${'='.repeat(60)}\n`);
    
    const workflowLog = {
      losId,
      startTime: new Date().toISOString(),
      steps: [],
      isInstantLoan: isInstantLoan
    };
    
    // STEP 1: Auto-run SPU checks
    console.log(`📋 STEP 1: Running automated SPU checks...`);
    workflowLog.steps.push({ step: 'SPU_CHECKS', status: 'started', timestamp: new Date().toISOString() });
    
    let spuResult;
    try {
      spuResult = await autoSpuChecks(losId, applicationData.cnic, applicationData.applicationType);
      
      if (!spuResult.approved) {
        console.log(`❌ Application auto-rejected by SPU checks`);
        workflowLog.steps.push({ 
          step: 'SPU_CHECKS', 
          status: 'rejected', 
          reason: spuResult.reason,
          timestamp: new Date().toISOString() 
        });
        
        return { 
          success: false, 
          stage: 'SPU', 
          reason: spuResult.reason,
          details: spuResult.details,
          workflowLog 
        };
      }
      
      console.log(`✅ SPU checks passed`);
      workflowLog.steps.push({ 
        step: 'SPU_CHECKS', 
        status: 'approved', 
        timestamp: new Date().toISOString() 
      });
      
    } catch (error) {
      console.error(`❌ SPU checks failed with error:`, error.message);
      workflowLog.steps.push({ 
        step: 'SPU_CHECKS', 
        status: 'error', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      
      // Keep application in manual review state
      return {
        success: false,
        stage: 'SPU',
        reason: 'SPU checks encountered an error - requires manual review',
        error: error.message,
        workflowLog
      };
    }
    
    // ⚡ INSTANT LOAN PATH: Auto-approve + Auto-disburse immediately
    if (isInstantLoan) {
      console.log(`\n⚡ INSTANT LOAN DETECTED - Initiating instant approval and disbursement...`);
      
      // STEP 2: Auto-approve (bypass EAVMU, COPS, CIU)
      console.log(`✅ STEP 2: Auto-approving application...`);
      workflowLog.steps.push({ 
        step: 'AUTO_APPROVAL', 
        status: 'approved', 
        timestamp: new Date().toISOString(),
        bypassed: ['EAVMU_OFFICER', 'EAVMU_HEAD', 'COPS', 'CIU']
      });
      
      await db.query(`
        UPDATE ilos_applications
        SET 
          status = 'application_completed',
          auto_processed = true,
          eavmu_submitted = true,
          cops_submitted = true,
          instant_approval = true,
          instant_approval_at = NOW(),
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      // STEP 3: Auto-disburse
      console.log(`💰 STEP 3: Auto-disbursing loan...`);
      workflowLog.steps.push({ 
        step: 'AUTO_DISBURSEMENT', 
        status: 'started', 
        timestamp: new Date().toISOString() 
      });
      
      try {
        const finalizeResult = await autoFinalize(losId, 'instant_loan');
        
        workflowLog.steps.push({ 
          step: 'AUTO_DISBURSEMENT', 
          status: 'completed', 
          timestamp: new Date().toISOString(),
          reference: finalizeResult.reference
        });
        
        // Save workflow log
        workflowLog.endTime = new Date().toISOString();
        workflowLog.totalDuration = new Date(workflowLog.endTime) - new Date(workflowLog.startTime);
        
        await db.query(`
          UPDATE ilos_applications
          SET 
            automation_workflow_log = $1,
            updated_at = NOW()
          WHERE los_id = $2
        `, [JSON.stringify(workflowLog), losId]);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`⚡ INSTANT LOAN - FULLY AUTOMATED COMPLETION`);
        console.log(`   - SPU checks: PASSED`);
        console.log(`   - Auto-approved: YES (bypassed EAVMU, COPS, CIU)`);
        console.log(`   - Auto-disbursed: YES`);
        console.log(`   - Status: ${finalizeResult.status}`);
        console.log(`   - Reference: ${finalizeResult.reference}`);
        console.log(`   - Duration: ${workflowLog.totalDuration}ms`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
          success: true,
          instantLoan: true,
          stage: 'COMPLETED',
          status: finalizeResult.status,
          reference: finalizeResult.reference,
          message: 'Instant Loan approved and disbursed automatically',
          bypassed: ['EAVMU_OFFICER', 'EAVMU_HEAD', 'COPS', 'CIU'],
          workflowLog
        };
        
      } catch (disbursementError) {
        console.error(`❌ Auto-disbursement failed:`, disbursementError.message);
        workflowLog.steps.push({ 
          step: 'AUTO_DISBURSEMENT', 
          status: 'error', 
          error: disbursementError.message,
          timestamp: new Date().toISOString() 
        });
        
        // Keep application in completed state for manual disbursement
        await db.query(`
          UPDATE ilos_applications
          SET 
            status = 'application_completed',
            finalization_error = $1,
            updated_at = NOW()
          WHERE los_id = $2
        `, [disbursementError.message, losId]);
        
        return {
          success: false,
          instantLoan: true,
          stage: 'COMPLETED',
          error: disbursementError.message,
          message: 'Instant Loan approved but auto-disbursement failed - requires manual intervention',
          workflowLog
        };
      }
    }
    
    // STEP 2: Auto-assign to EAVMU Officer (skip COPS and EAVMU Head)
    console.log(`\n👤 STEP 2: Auto-assigning to available EAVMU Officer...`);
    workflowLog.steps.push({ 
      step: 'AUTO_ASSIGNMENT', 
      status: 'started', 
      timestamp: new Date().toISOString() 
    });
    
    let assignmentResult;
    try {
      assignmentResult = await autoAssignToAvailableOfficer(losId);
      
      if (!assignmentResult.assigned) {
        console.log(`⏳ Application queued - no officers available`);
        workflowLog.steps.push({ 
          step: 'AUTO_ASSIGNMENT', 
          status: 'queued', 
          timestamp: new Date().toISOString() 
        });
        
        return { 
          success: true, 
          stage: 'QUEUED', 
          queued: true,
          reason: 'No officers available - added to assignment queue',
          workflowLog 
        };
      }
      
      console.log(`✅ Assigned to ${assignmentResult.officer}`);
      workflowLog.steps.push({ 
        step: 'AUTO_ASSIGNMENT', 
        status: 'assigned', 
        officer: assignmentResult.officer,
        agentId: assignmentResult.agentId,
        timestamp: new Date().toISOString() 
      });
      
    } catch (error) {
      console.error(`❌ Auto-assignment failed:`, error.message);
      workflowLog.steps.push({ 
        step: 'AUTO_ASSIGNMENT', 
        status: 'error', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      
      // Queue the application for retry
      await db.query(`
        UPDATE ilos_applications 
        SET assignment_queued = true, queued_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      return {
        success: true,
        stage: 'QUEUED',
        queued: true,
        reason: 'Assignment failed - added to queue for retry',
        error: error.message,
        workflowLog
      };
    }
    
    // Workflow completed successfully
    workflowLog.endTime = new Date().toISOString();
    workflowLog.totalDuration = new Date(workflowLog.endTime) - new Date(workflowLog.startTime);
    
    // Save workflow log to database
    await db.query(`
      UPDATE ilos_applications
      SET 
        automation_workflow_log = $1,
        updated_at = NOW()
      WHERE los_id = $2
    `, [JSON.stringify(workflowLog), losId]);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ AUTOMATED WORKFLOW COMPLETED SUCCESSFULLY`);
    console.log(`   - SPU checks: PASSED`);
    console.log(`   - Assigned to: ${assignmentResult.officer} (${assignmentResult.agentId})`);
    console.log(`   - Officer load: ${assignmentResult.currentLoad}/${assignmentResult.maxCapacity}`);
    console.log(`   - Next step: EAVMU Officer investigation`);
    console.log(`   - Duration: ${workflowLog.totalDuration}ms`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      success: true,
      stage: 'EAVMU_OFFICER',
      officer: assignmentResult.officer,
      agentId: assignmentResult.agentId,
      officerLoad: {
        current: assignmentResult.currentLoad,
        max: assignmentResult.maxCapacity
      },
      message: 'Application automatically processed and assigned to EAVMU officer',
      workflowLog
    };
    
  } catch (error) {
    console.error(`❌ Automated workflow failed for LOS-${losId}:`, error);
    
    // Log the failure
    await db.query(`
      UPDATE ilos_applications
      SET 
        automation_error = $1,
        updated_at = NOW()
      WHERE los_id = $2
    `, [error.message, losId]);
    
    throw error;
  }
}

/**
 * Handle EAVMU Officer completion and auto-forward to CIU
 * This bypasses EAVMU Head and COPS approvals
 */
async function handleOfficerCompletion(losId, officerData) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 OFFICER COMPLETION - AUTO-FORWARDING TO CIU`);
    console.log(`   LOS ID: ${losId}`);
    console.log(`   Agent: ${officerData.agentId}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // When officer completes work, auto-forward to CIU (bypass EAVMU Head and COPS)
    await db.query(`
      UPDATE ilos_applications
      SET 
        status = 'submitted_to_ciu',
        eavmu_submitted = true,
        cops_submitted = true,
        auto_forwarded_to_ciu = true,
        auto_forwarded_at = NOW(),
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId]);
    
    console.log(`✅ Application auto-forwarded to CIU`);
    console.log(`   Bypassed: EAVMU Head approval, COPS approval`);
    console.log(`   Next step: CIU approval\n`);
    
    return {
      success: true,
      status: 'submitted_to_ciu',
      message: 'Application completed by officer and auto-forwarded to CIU',
      bypassed: ['EAVMU_HEAD', 'COPS']
    };
  } catch (error) {
    console.error(`❌ Failed to auto-forward to CIU:`, error.message);
    throw error;
  }
}

/**
 * Handle CIU approval and auto-finalize (disburse/issue card)
 * This bypasses COPS disbursement step
 */
async function handleCiuApproval(losId) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 CIU APPROVED - AUTO-FINALIZING`);
    console.log(`   LOS ID: ${losId}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Get application details
    const appResult = await db.query(`
      SELECT application_type, product_type, desired_financing
      FROM ilos_applications
      WHERE los_id = $1
    `, [losId]);
    
    if (appResult.rows.length === 0) {
      throw new Error(`Application LOS-${losId} not found`);
    }
    
    const app = appResult.rows[0];
    const productType = app.product_type || app.application_type;
    
    console.log(`📦 Product Type: ${productType}`);
    
    // Auto-finalize based on product type
    const finalizeResult = await autoFinalize(losId, productType);
    
    console.log(`\n✅ AUTO-FINALIZATION COMPLETED`);
    console.log(`   Status: ${finalizeResult.status}`);
    console.log(`   Reference: ${finalizeResult.reference}`);
    console.log(`   Bypassed: COPS finalization step`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      success: true,
      ...finalizeResult,
      bypassed: ['COPS_FINALIZATION']
    };
  } catch (error) {
    console.error(`❌ Auto-finalization failed:`, error.message);
    
    // Keep application in completed state for manual finalization
    await db.query(`
      UPDATE ilos_applications
      SET 
        status = 'application_completed',
        finalization_error = $1,
        updated_at = NOW()
      WHERE los_id = $2
    `, [error.message, losId]);
    
    return {
      success: false,
      error: error.message,
      message: 'Application approved by CIU but auto-finalization failed - requires manual intervention'
    };
  }
}

/**
 * Get automation statistics
 */
async function getAutomationStats(dateFrom, dateTo) {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE auto_processed = true) as auto_processed,
        COUNT(*) FILTER (WHERE spu_checks_completed = true) as spu_checks_completed,
        COUNT(*) FILTER (WHERE assignment_queued = true) as currently_queued,
        COUNT(*) FILTER (WHERE auto_disbursement_triggered = true) as auto_disbursed,
        COUNT(*) FILTER (WHERE status = 'rejected_by_spu') as spu_rejections,
        COUNT(*) FILTER (WHERE status = 'loan_disbursed' OR status = 'card_issued' OR status = 'offer_letter_issued') as completed,
        AVG(EXTRACT(EPOCH FROM (auto_disbursement_completed_at - created_at))) as avg_completion_time_seconds
      FROM ilos_applications
      WHERE created_at >= $1 AND created_at <= $2
    `, [dateFrom || '2024-01-01', dateTo || new Date().toISOString()]);
    
    return stats.rows[0];
  } catch (error) {
    console.error(`❌ Failed to get automation stats:`, error.message);
    throw error;
  }
}

/**
 * Schedule periodic queue processing (call this from a cron job or scheduler)
 */
async function scheduleQueueProcessing() {
  console.log(`⏰ Scheduled queue processing triggered at ${new Date().toISOString()}`);
  try {
    const result = await processQueuedApplications();
    console.log(`✅ Queue processing completed: ${result.processed} assigned, ${result.remaining} remaining`);
    return result;
  } catch (error) {
    console.error(`❌ Scheduled queue processing failed:`, error.message);
    throw error;
  }
}

module.exports = {
  processNewApplication,
  handleOfficerCompletion,
  handleCiuApproval,
  getAutomationStats,
  scheduleQueueProcessing
};

