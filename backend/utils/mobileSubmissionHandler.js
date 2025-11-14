const db = require('../db1');

/**
 * Handle mobile app submission (NOT Instant Loan)
 * Creates a pending_pb_completion status application
 * Documents and form data are saved for PB to complete
 */
async function handleMobileSubmission(applicationId, productTable, formData, documents) {
  try {
    console.log(`📱 Handling mobile submission for LOS-${applicationId} (${productTable})`);
    
    // Extract CNIC from form data
    const cnic = formData.cnic || formData.id_no;
    
    // Create entry in ilos_applications with pending_pb_completion status
    await db.query(`
      INSERT INTO ilos_applications 
      (los_id, loan_type, cnic, status, submitted_from_mobile, mobile_submission_data, mobile_documents, created_at, updated_at)
      VALUES ($1, $2, $3, 'pending_pb_completion', true, $4, $5, NOW(), NOW())
      ON CONFLICT (los_id) DO UPDATE SET
        status = 'pending_pb_completion',
        submitted_from_mobile = true,
        mobile_submission_data = $4,
        mobile_documents = $5,
        updated_at = NOW()
    `, [
      applicationId,
      productTable,
      cnic,
      JSON.stringify(formData),
      JSON.stringify(documents || {})
    ]);
    
    console.log(`✅ Mobile submission saved with status: pending_pb_completion`);
    
    return {
      success: true,
      status: 'pending_pb_completion',
      message: 'Application submitted successfully. Our team will review and complete your application shortly.',
      requiresPbCompletion: true
    };
    
  } catch (error) {
    console.error(`❌ Error handling mobile submission:`, error);
    throw error;
  }
}

/**
 * Check if this is a mobile app submission
 */
function isMobileAppSubmission(requestBody) {
  return requestBody.source === 'mobile_app' || 
         requestBody.submitted_from === 'mobile' ||
         requestBody.isMobileApp === true;
}

/**
 * Format mobile submission for PB dashboard
 */
function formatMobileSubmissionForDashboard(application) {
  const mobileData = typeof application.mobile_submission_data === 'string' 
    ? JSON.parse(application.mobile_submission_data)
    : application.mobile_submission_data;
  
  const mobileDocuments = typeof application.mobile_documents === 'string'
    ? JSON.parse(application.mobile_documents)
    : application.mobile_documents;
  
  return {
    losId: application.los_id,
    loanType: application.loan_type,
    cnic: application.cnic,
    customerName: `${mobileData.first_name || mobileData.firstName || ''} ${mobileData.last_name || mobileData.lastName || ''}`.trim(),
    amount: mobileData.amount_requested || mobileData.requestedAmount,
    purpose: mobileData.purpose_of_loan || mobileData.loanPurpose,
    submittedAt: application.created_at,
    hasDocuments: !!(mobileDocuments?.cnic || mobileDocuments?.salarySlip),
    mobileData: mobileData,
    documents: mobileDocuments
  };
}

module.exports = {
  handleMobileSubmission,
  isMobileAppSubmission,
  formatMobileSubmissionForDashboard
};

