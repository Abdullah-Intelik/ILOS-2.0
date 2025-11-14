/**
 * Automation Service V2.0
 * Manages automated workflow for ILOS applications
 * Flow: PB Submit → Auto SPU Checks → Auto Assign to EAVMU Officer → CIU → Auto Disburse
 */

const { SPUService } = require('./spu.service');
const { getPakistanTimestamp } = require('../../utils/timezone');

class AutomationService {
  constructor(db) {
    this.db = db;
    this.spuService = new SPUService(db);
  }

  /**
   * Process new application through automated workflow
   */
  async processNewApplication(losId, applicationData) {
    try {
      // ✅ Instant loans ONLY from mobile app submissions
      const INSTANT_LOAN_MAX_AMOUNT = 750000; // 7.5 Lac
      const isMobileSubmission = applicationData.source === 'mobile' || applicationData.source === 'mobile_app';
      const isInstantLoan = isMobileSubmission && 
                            applicationData.requested_amount <= INSTANT_LOAN_MAX_AMOUNT && 
                            applicationData.customer_type === 'ETB';
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 AUTOMATED WORKFLOW STARTED`);
      console.log(`   LOS ID: ${losId}`);
      console.log(`   Source: ${applicationData.source || 'web'}`);
      console.log(`   Product: ${applicationData.product_type}`);
      console.log(`   Amount: PKR ${applicationData.requested_amount}`);
      console.log(`   Customer Type: ${applicationData.customer_type}`);
      console.log(`   Instant Loan: ${isInstantLoan ? 'YES ⚡ (Mobile only)' : 'NO'}`);
      console.log(`   CNIC: ${applicationData.cnic}`);
      console.log(`${'='.repeat(60)}\n`);
      
      const workflowLog = {
        losId,
        startTime: getPakistanTimestamp(),
        steps: []
      };
      
      // STEP 1: Auto-run SPU checks
      console.log(`📋 STEP 1: Running automated SPU checks...`);
      workflowLog.steps.push({ step: 'SPU_CHECKS', status: 'started', timestamp: getPakistanTimestamp() });
      
      let spuResult;
      try {
        spuResult = await this.spuService.runAllChecks(losId, applicationData.cnic, applicationData.product_type);
        
        // NEW: Save SPU check results to database
        await this.spuService.saveCheckResults(
          losId, 
          applicationData.application_id, 
          applicationData.party_id, 
          spuResult, 
          null // System user
        );
        
        if (!spuResult.approved) {
          console.log(`❌ Application auto-rejected by SPU checks`);
          workflowLog.steps.push({ 
            step: 'SPU_CHECKS', 
            status: 'rejected', 
            reason: spuResult.reason,
            timestamp: getPakistanTimestamp() 
          });
          
          // Update application status to rejected
          await this.updateApplicationStatus(losId, 'spu_rejected', null, spuResult.reason);
          
          return { 
            success: false, 
            stage: 'SPU', 
            status: 'spu_rejected',
            reason: spuResult.reason,
            details: spuResult.details,
            workflowLog 
          };
        }
        
        console.log(`✅ SPU checks passed`);
        workflowLog.steps.push({ 
          step: 'SPU_CHECKS', 
          status: 'approved', 
          timestamp: getPakistanTimestamp() 
        });
        
        // Update application status to SPU approved
        await this.updateApplicationStatus(losId, 'spu_approved', null, null);
        
      } catch (error) {
        console.error(`❌ SPU checks failed with error:`, error.message);
        workflowLog.steps.push({ 
          step: 'SPU_CHECKS', 
          status: 'error', 
          error: error.message,
          timestamp: getPakistanTimestamp() 
        });
        
        // Keep application in manual review state
        return {
          success: false,
          stage: 'SPU',
          status: 'submitted',
          reason: 'SPU checks encountered an error - requires manual review',
          error: error.message,
          workflowLog
        };
      }
      
      // STEP 2: Auto-assign to EAVMU Officer (Ahmed Hassan, Agent ID: 101)
      console.log(`\n👤 STEP 2: Auto-assigning to EAVMU Officer (Ahmed Hassan)...`);
      workflowLog.steps.push({ 
        step: 'AUTO_ASSIGNMENT', 
        status: 'started', 
        timestamp: getPakistanTimestamp() 
      });
      
      try {
        // Always assign to Ahmed Hassan (Agent ID: 101)
        const assignedOfficerId = 101;
        
        await this.db.query(`
          UPDATE applications 
          SET 
            current_stage = 'EAVMU_OFFICER',
            status = 'eavmu_assigned',
            assigned_to = $1,
            updated_at = NOW()
          WHERE los_id = $2
        `, [assignedOfficerId, losId]);
        
        console.log(`✅ Application assigned to Officer ID: ${assignedOfficerId}`);
        workflowLog.steps.push({ 
          step: 'AUTO_ASSIGNMENT', 
          status: 'assigned', 
          officer_id: assignedOfficerId,
          timestamp: getPakistanTimestamp() 
        });
        
      } catch (error) {
        console.error(`❌ Auto-assignment failed:`, error.message);
        workflowLog.steps.push({ 
          step: 'AUTO_ASSIGNMENT', 
          status: 'error', 
          error: error.message,
          timestamp: getPakistanTimestamp() 
        });
        
        return {
          success: false,
          stage: 'EAVMU_OFFICER',
          status: 'spu_approved',
          reason: 'Auto-assignment failed - requires manual assignment',
          error: error.message,
          workflowLog
        };
      }
      
      // ✅ For Instant Loans (MOBILE ONLY): Skip EAVMU & CIU, direct disburse
      if (isInstantLoan) {
        console.log(`\n⚡ INSTANT LOAN FROM MOBILE - Skipping EAVMU & CIU, direct disbursement...`);
        
        // Direct disburse (no EAVMU, no CIU)
        console.log(`\n💰 STEP 3: Direct auto-disbursement...`);
        await this.db.query(`
          UPDATE applications 
          SET 
            current_stage = 'COPS',
            status = 'approved',
            approved_amount = requested_amount,
            approved_at = NOW(),
            updated_at = NOW()
          WHERE los_id = $1
        `, [losId]);
        
        const disburseResult = await this.autoDisburseLoan(losId);
        workflowLog.steps.push({ 
          step: 'INSTANT_LOAN_DIRECT_DISBURSE', 
          status: disburseResult.success ? 'disbursed' : 'failed', 
          timestamp: getPakistanTimestamp() 
        });
        
        console.log(`\n✅ INSTANT LOAN DISBURSED (NO EAVMU, NO CIU)!`);
        console.log(`   Final Status: disbursed`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
          success: true,
          stage: 'COPS',
          status: 'disbursed',
          isInstantLoan: true,
          workflowLog
        };
        
      } else {
        // ✅ For Web & Regular Mobile Loans: Assign to EAVMU Officer (manual review)
        console.log(`\n✅ ${isMobileSubmission ? 'REGULAR MOBILE LOAN' : 'WEB LOAN'} - Assigning to EAVMU Officer`);
        console.log(`   Final Status: eavmu_assigned`);
        console.log(`   Final Stage: EAVMU_OFFICER`);
        console.log(`   Note: EAVMU → CIU (manual), then auto-disbursement`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
          success: true,
          stage: 'EAVMU_OFFICER',
          status: 'eavmu_assigned',
          assigned_to: 101,
          isInstantLoan: false,
          workflowLog
        };
      }
      
    } catch (error) {
      console.error(`❌ Automated workflow failed:`, error);
      return {
        success: false,
        error: error.message,
        stage: 'PB',
        status: 'submitted'
      };
    }
  }

  /**
   * Auto-approve and progress application (EAVMU Officer → CIU)
   */
  async autoApproveEavmu(losId) {
    try {
      console.log(`✅ EAVMU Officer auto-approving application LOS-${losId}...`);
      
      await this.db.query(`
        UPDATE applications 
        SET 
          current_stage = 'CIU',
          status = 'eavmu_approved',
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      console.log(`✅ Application progressed to CIU`);
      return { success: true, stage: 'CIU', status: 'eavmu_approved' };
      
    } catch (error) {
      console.error(`❌ EAVMU auto-approval failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-approve CIU and disburse
   */
  async autoApproveCiu(losId) {
    try {
      console.log(`✅ CIU auto-approving application LOS-${losId}...`);
      
      await this.db.query(`
        UPDATE applications 
        SET 
          current_stage = 'COPS',
          status = 'approved',
          approved_amount = requested_amount,
          approved_at = NOW(),
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      console.log(`✅ Application approved, moving to COPS for disbursement`);
      
      // Auto-disburse
      return await this.autoDisburseLoan(losId);
      
    } catch (error) {
      console.error(`❌ CIU auto-approval failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-disburse loan (COPS stage)
   */
  async autoDisburseLoan(losId) {
    try {
      console.log(`💰 Auto-disbursing loan for LOS-${losId}...`);
      
      await this.db.query(`
        UPDATE applications 
        SET 
          status = 'disbursed',
          disbursed_at = NOW(),
          updated_at = NOW()
        WHERE los_id = $1
      `, [losId]);
      
      console.log(`✅ Loan disbursed successfully`);
      return { success: true, status: 'disbursed' };
      
    } catch (error) {
      console.error(`❌ Auto-disbursement failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(losId, status, stage = null, rejectionReason = null) {
    const updates = ['status = $1', 'updated_at = NOW()'];
    const params = [status];
    let paramCount = 1;
    
    if (stage) {
      paramCount++;
      updates.push(`current_stage = $${paramCount}`);
      params.push(stage);
    }
    
    if (rejectionReason) {
      // Store rejection reason in product-specific table or separate table
      // For now, just update status
    }
    
    paramCount++;
    params.push(losId);
    
    await this.db.query(`
      UPDATE applications 
      SET ${updates.join(', ')}
      WHERE los_id = $${paramCount}
    `, params);
  }
}

module.exports = { AutomationService };

