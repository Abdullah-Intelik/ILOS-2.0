/**
 * PB (Product Booking) Routes
 * Handles mobile app submissions requiring PB completion
 */

const express = require('express');
const router = express.Router();
const db = require('../db1');
const fs = require('fs');
const path = require('path');

// Helper function to move documents from los-pending to actual los-{id}
async function migrateDocuments(losId, loanType, mobileDocuments) {
  try {
    if (!mobileDocuments || (!mobileDocuments.cnic && !mobileDocuments.salarySlip)) {
      console.log(`⚠️ No documents to migrate for LOS-${losId}`);
      return null;
    }

    // Get the document root (same as FileZilla server)
    const DOCUMENTS_ROOT = process.env.DOCUMENTS_ROOT || path.join(__dirname, '..', 'ilos_loan_application_documents');
    
    // Map loan_type to folder name
    const loanTypeMap = {
      'cashplus_applications': 'cashplus',
      'autoloan_applications': 'autoloan',
      'smeasaan_applications': 'smeasaan',
      'ameendrive_applications': 'ameendrive',
      'commercial_vehicle_applications': 'commercialvehicle',
      'platinum_card_applications': 'creditcard',
      'creditcard_applications': 'creditcard',
      'instantloan_applications': 'instantloan'
    };
    
    const folderName = loanTypeMap[loanType] || 'temp';
    
    // Source directory (where mobile app uploaded them)
    const sourceDir = path.join(DOCUMENTS_ROOT, folderName, 'los-pending');
    
    // Destination directory (where they should be)
    const destDir = path.join(DOCUMENTS_ROOT, folderName, `los-${losId}`);
    
    // Create destination directory if it doesn't exist
    fs.mkdirSync(destDir, { recursive: true });
    
    const updatedDocuments = {};
    
    // Move CNIC document
    if (mobileDocuments.cnic && mobileDocuments.cnic.serverPath) {
      const cnicFileName = path.basename(mobileDocuments.cnic.serverPath);
      const sourcePath = path.join(sourceDir, cnicFileName);
      const destPath = path.join(destDir, cnicFileName);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied CNIC: ${sourcePath} → ${destPath}`);
        
        updatedDocuments.cnic = {
          ...mobileDocuments.cnic,
          serverPath: destPath,
          serverUrl: `/explorer/${folderName}/los-${losId}/${cnicFileName}`
        };
        
        // Delete old file
        try { fs.unlinkSync(sourcePath); } catch (e) { console.warn('Could not delete old CNIC file:', e.message); }
      } else {
        console.warn(`⚠️ CNIC file not found at: ${sourcePath}`);
        updatedDocuments.cnic = mobileDocuments.cnic;
      }
    }
    
    // Move Salary Slip document
    if (mobileDocuments.salarySlip && mobileDocuments.salarySlip.serverPath) {
      const salaryFileName = path.basename(mobileDocuments.salarySlip.serverPath);
      const sourcePath = path.join(sourceDir, salaryFileName);
      const destPath = path.join(destDir, salaryFileName);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied Salary Slip: ${sourcePath} → ${destPath}`);
        
        updatedDocuments.salarySlip = {
          ...mobileDocuments.salarySlip,
          serverPath: destPath,
          serverUrl: `/explorer/${folderName}/los-${losId}/${salaryFileName}`
        };
        
        // Delete old file
        try { fs.unlinkSync(sourcePath); } catch (e) { console.warn('Could not delete old salary slip file:', e.message); }
      } else {
        console.warn(`⚠️ Salary Slip file not found at: ${sourcePath}`);
        updatedDocuments.salarySlip = mobileDocuments.salarySlip;
      }
    }
    
    // Update mobile_documents in database
    await db.query(`
      UPDATE ilos_applications
      SET mobile_documents = $2,
          updated_at = NOW()
      WHERE los_id = $1
    `, [losId, JSON.stringify(updatedDocuments)]);
    
    console.log(`✅ Documents migrated for LOS-${losId} from los-pending to los-${losId}`);
    return updatedDocuments;
    
  } catch (error) {
    console.error(`❌ Error migrating documents for LOS-${losId}:`, error.message);
    throw error;
  }
}

/**
 * GET /api/pb/mobile-submissions
 * Fetch all mobile app submissions awaiting PB completion
 */
router.get('/mobile-submissions', async (req, res) => {
  try {
    console.log('📱 Fetching mobile submissions for PB dashboard...');
    
    const result = await db.query(`
      SELECT 
        ia.los_id,
        ia.loan_type,
        ia.cnic,
        ia.created_at,
        ia.mobile_submission_data,
        ia.mobile_documents,
        ia.updated_at
      FROM ilos_applications ia
      WHERE ia.status = 'pending_pb_completion'
        AND ia.submitted_from_mobile = true
      ORDER BY ia.created_at DESC
    `);
    
    // Format data for dashboard
    const formattedApplications = result.rows.map(app => {
      const mobileData = typeof app.mobile_submission_data === 'string' 
        ? JSON.parse(app.mobile_submission_data)
        : app.mobile_submission_data;
      
      const mobileDocuments = typeof app.mobile_documents === 'string'
        ? JSON.parse(app.mobile_documents)
        : app.mobile_documents;
      
      // Extract customer name based on product type
      let customerName = 'N/A';
      if (mobileData.first_name || mobileData.firstName) {
        customerName = `${mobileData.title || ''} ${mobileData.first_name || mobileData.firstName || ''} ${mobileData.middle_name || mobileData.middleName || ''} ${mobileData.last_name || mobileData.lastName || ''}`.trim();
      }
      
      return {
        losId: app.los_id,
        loanType: app.loan_type,
        cnic: app.cnic,
        customerName,
        amount: mobileData.amount_requested || mobileData.requestedAmount || mobileData.desired_loan_amount,
        purpose: mobileData.purpose_of_loan || mobileData.loanPurpose,
        submittedAt: app.created_at,
        hasDocuments: !!(mobileDocuments?.cnic || mobileDocuments?.salarySlip),
        productType: app.loan_type.replace('_applications', '').replace('_', ' ').toUpperCase()
      };
    });
    
    console.log(`✅ Found ${formattedApplications.length} mobile submissions awaiting PB completion`);
    
    res.json({ 
      success: true, 
      applications: formattedApplications,
      count: formattedApplications.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching mobile submissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch mobile submissions',
      details: error.message 
    });
  }
});

/**
 * GET /api/pb/mobile-submission/:losId
 * Fetch detailed mobile submission data for PB to complete
 */
router.get('/mobile-submission/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    console.log(`📱 Fetching mobile submission details for LOS-${losId}...`);
    
    // Fetch from ilos_applications
    const ilosResult = await db.query(`
      SELECT 
        ia.*
      FROM ilos_applications ia
      WHERE ia.los_id = $1
        AND ia.status = 'pending_pb_completion'
        AND ia.submitted_from_mobile = true
    `, [losId]);
    
    if (ilosResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mobile submission not found or already completed' 
      });
    }
    
    const ilosApp = ilosResult.rows[0];
    
    // Parse mobile data and documents
    const mobileData = typeof ilosApp.mobile_submission_data === 'string' 
      ? JSON.parse(ilosApp.mobile_submission_data)
      : ilosApp.mobile_submission_data;
    
    const mobileDocuments = typeof ilosApp.mobile_documents === 'string'
      ? JSON.parse(ilosApp.mobile_documents)
      : ilosApp.mobile_documents;
    
    // Fetch from product-specific table
    const productTable = ilosApp.loan_type;
    let productData = null;
    
    try {
      const productResult = await db.query(`
        SELECT * FROM ${productTable} WHERE id = $1
      `, [losId]);
      
      if (productResult.rows.length > 0) {
        productData = productResult.rows[0];
      }
    } catch (err) {
      console.warn(`⚠️ Could not fetch product data from ${productTable}:`, err.message);
    }
    
    console.log(`✅ Fetched mobile submission LOS-${losId} for PB completion`);
    
    res.json({
      success: true,
      application: {
        losId: ilosApp.los_id,
        loanType: ilosApp.loan_type,
        cnic: ilosApp.cnic,
        status: ilosApp.status,
        submittedAt: ilosApp.created_at,
        mobileData,
        mobileDocuments,
        productData
      }
    });
    
  } catch (error) {
    console.error(`❌ Error fetching mobile submission ${req.params.losId}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch mobile submission details',
      details: error.message 
    });
  }
});

/**
 * POST /api/pb/complete-mobile-submission/:losId
 * Complete a mobile submission and trigger automation
 */
router.post('/complete-mobile-submission/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    const completedData = req.body;
    
    console.log(`📱 PB completing mobile submission LOS-${losId}...`);
    
    // Fetch the application to get loan_type and documents
    const ilosResult = await db.query(`
      SELECT loan_type, cnic, mobile_submission_data, mobile_documents 
      FROM ilos_applications 
      WHERE los_id = $1 AND status = 'pending_pb_completion'
    `, [losId]);
    
    if (ilosResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mobile submission not found or already completed' 
      });
    }
    
    const { loan_type, cnic, mobile_documents } = ilosResult.rows[0];
    
    // Parse mobile documents
    const mobileDocuments = typeof mobile_documents === 'string' 
      ? JSON.parse(mobile_documents)
      : mobile_documents;
    
    // Migrate documents from los-pending to los-{losId}
    console.log(`📁 Migrating documents for LOS-${losId}...`);
    try {
      await migrateDocuments(losId, loan_type, mobileDocuments);
    } catch (docError) {
      console.error(`⚠️ Document migration failed for LOS-${losId}:`, docError.message);
      // Continue anyway - don't block the completion
    }
    const productTable = loan_type;
    
    // Update the product table with completed data
    // Build UPDATE query dynamically based on completedData keys
    const updateFields = Object.keys(completedData)
      .filter(key => key !== 'losId' && key !== 'id')
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(', ');
    
    const updateValues = Object.keys(completedData)
      .filter(key => key !== 'losId' && key !== 'id')
      .map(key => completedData[key]);
    
    if (updateFields) {
      await db.query(`
        UPDATE ${productTable}
        SET ${updateFields}, updated_at = NOW()
        WHERE id = $1
      `, [losId, ...updateValues]);
      
      console.log(`✅ Updated ${productTable} with PB-completed data`);
    }
    
    // Update ilos_applications status to PB_SUBMITTED
    await db.query(`
      UPDATE ilos_applications
      SET status = 'PB_SUBMITTED',
          pb_completed_by = $2,
          pb_completed_at = NOW(),
          updated_at = NOW()
      WHERE los_id = $1
    `, [losId, req.body.pb_employee_no || 'PB_USER']);
    
    console.log(`✅ Status updated to PB_SUBMITTED for LOS-${losId}`);
    
    // NOW trigger automation
    const { processNewApplication } = require('../services/automatedWorkflow');
    console.log(`🤖 Triggering automation for PB-completed mobile submission LOS-${losId}`);
    
    // Determine product type for automation
    const productTypeMap = {
      'cashplus_applications': 'CashPlus',
      'autoloan_applications': 'AutoLoan',
      'smeasaan_applications': 'SMEASAAN',
      'ameendrive_applications': 'AmeenDrive',
      'commercial_vehicle_applications': 'CommercialVehicle',
      'platinum_card_applications': 'CreditCard',
      'creditcard_applications': 'CreditCard'
    };
    
    const productType = productTypeMap[productTable] || 'Unknown';
    
    setImmediate(async () => {
      try {
        const workflowResult = await processNewApplication(losId, {
          cnic: cnic,
          applicationType: productType
        });
        console.log(`✅ Automation completed for PB-completed LOS-${losId}:`, workflowResult);
      } catch (error) {
        console.error(`❌ Automation failed for PB-completed LOS-${losId}:`, error.message);
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Mobile submission completed and forwarded to automation',
      losId,
      status: 'PB_SUBMITTED'
    });
    
  } catch (error) {
    console.error(`❌ Error completing mobile submission ${req.params.losId}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete mobile submission',
      details: error.message 
    });
  }
});

module.exports = router;

