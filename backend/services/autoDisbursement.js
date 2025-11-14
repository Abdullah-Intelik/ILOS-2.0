const db = require('../db1');
const axios = require('axios');

/**
 * Automated Disbursement Service
 * Automatically disburses loans or issues cards when CIU approves
 */

/**
 * Auto-disburse loan based on product type
 * @param {number} losId - The LOS ID
 * @param {string} productType - The product type
 * @returns {Object} Disbursement result
 */
async function autoDisburseLoan(losId, productType) {
  try {
    console.log(`💰 Auto-disbursing loan for LOS-${losId} (${productType})`);
    
    // First get the loan_type from ilos_applications
    const loanTypeResult = await db.query(`
      SELECT loan_type, cnic FROM ilos_applications WHERE los_id = $1
    `, [losId]);
    
    if (loanTypeResult.rows.length === 0) {
      throw new Error(`Application LOS-${losId} not found in ilos_applications`);
    }
    
    const { loan_type, cnic } = loanTypeResult.rows[0];
    
    // Map loan_type to table name
    const tableMap = {
      'cashplus_applications': 'cashplus_applications',
      'autoloan_applications': 'autoloan_applications',
      'smeasaan_applications': 'smeasaan_applications',
      'commercial_vehicle_applications': 'commercial_vehicle_applications',
      'ameendrive_applications': 'ameendrive_applications',
      'instantloan_applications': 'instantloan_applications'
    };
    
    const tableName = tableMap[loan_type];
    if (!tableName) {
      throw new Error(`Unknown loan type: ${loan_type}`);
    }
    
    // Query the specific product table
    const appResult = await db.query(`
      SELECT 
        COALESCE(CONCAT(first_name, ' ', last_name), CONCAT(first_name, ' ', middle_name, ' ', last_name)) as applicant_name,
        amount_requested as amount,
        cnic
      FROM ${tableName}
      WHERE id = $1
    `, [losId]);
    
    if (appResult.rows.length === 0) {
      throw new Error(`Application LOS-${losId} not found in ${tableName}`);
    }
    
    const application = appResult.rows[0];
    
    // Prepare disbursement payload
    const disbursementPayload = {
      losId: losId,
      applicantName: application.applicant_name,
      cnic: application.cnic,
      amount: application.amount,
      productType: productType,
      currency: application.currency || 'PKR',
      disbursementDate: new Date().toISOString(),
      disbursementMethod: 'AUTO_SYSTEM'
    };
    
    console.log(`📤 Disbursement payload:`, disbursementPayload);
    
    // TODO: Integrate with actual CBS/Core Banking System API
    // const cbsResponse = await axios.post(`${process.env.CBS_API_URL}/disburse`, disbursementPayload);
    
    // For now, simulate successful disbursement
    const disbursementReference = `DISB-${losId}-${Date.now()}`;
    
    // Update application status
    await db.query(`
      UPDATE ilos_applications
      SET 
        status = 'loan_disbursed',
        auto_disbursement_triggered = true,
        auto_disbursement_completed_at = NOW(),
        disbursement_reference = $2,
        disbursement_details = $3,
        updated_at = NOW()
      WHERE los_id = $1
    `, [
      losId, 
      disbursementReference,
      JSON.stringify(disbursementPayload)
    ]);
    
    console.log(`✅ Loan disbursed successfully: ${disbursementReference}`);
    
    return {
      success: true,
      status: 'loan_disbursed',
      reference: disbursementReference,
      amount: application.amount,
      message: 'Loan automatically disbursed'
    };
  } catch (error) {
    console.error(`❌ Auto disbursement failed for LOS-${losId}:`, error.message);
    
    // Log error but don't change status
    await db.query(`
      UPDATE ilos_applications
      SET 
        disbursement_error = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, error.message]);
    
    throw error;
  }
}

/**
 * Auto-issue credit card
 */
async function autoIssueCard(losId, productType) {
  try {
    console.log(`💳 Auto-issuing card for LOS-${losId} (${productType})`);
    
    // Get application details
    const appResult = await db.query(`
      SELECT 
        ia.*,
        COALESCE(pc.full_name, cc.full_name) as applicant_name,
        COALESCE(pc.name_on_card, cc.name_on_card) as name_on_card
      FROM ilos_applications ia
      LEFT JOIN platinum_card_applications pc ON ia.los_id = pc.los_id
      LEFT JOIN creditcard_applications cc ON ia.los_id = cc.los_id
      WHERE ia.los_id = $1
    `, [losId]);
    
    if (appResult.rows.length === 0) {
      throw new Error(`Application LOS-${losId} not found`);
    }
    
    const application = appResult.rows[0];
    
    // Prepare card issuance payload
    const cardPayload = {
      losId: losId,
      applicantName: application.applicant_name,
      nameOnCard: application.name_on_card || application.applicant_name,
      cnic: application.id_no,
      cardType: productType,
      creditLimit: application.desired_financing,
      issuanceDate: new Date().toISOString(),
      issuanceMethod: 'AUTO_SYSTEM'
    };
    
    console.log(`📤 Card issuance payload:`, cardPayload);
    
    // TODO: Integrate with actual Card Management System API
    // const cardResponse = await axios.post(`${process.env.CARD_MANAGEMENT_API_URL}/issue`, cardPayload);
    
    // Simulate card number
    const cardNumber = `XXXX-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`;
    const cardReference = `CARD-${losId}-${Date.now()}`;
    
    // Update application status
    await db.query(`
      UPDATE ilos_applications
      SET 
        status = 'card_issued',
        auto_disbursement_triggered = true,
        auto_disbursement_completed_at = NOW(),
        card_reference = $2,
        card_details = $3,
        updated_at = NOW()
      WHERE los_id = $1
    `, [
      losId,
      cardReference,
      JSON.stringify({ ...cardPayload, cardNumber })
    ]);
    
    console.log(`✅ Card issued successfully: ${cardReference}`);
    
    return {
      success: true,
      status: 'card_issued',
      reference: cardReference,
      cardNumber: cardNumber,
      message: 'Card automatically issued'
    };
  } catch (error) {
    console.error(`❌ Auto card issuance failed for LOS-${losId}:`, error.message);
    
    await db.query(`
      UPDATE ilos_applications
      SET 
        disbursement_error = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, error.message]);
    
    throw error;
  }
}

/**
 * Auto-generate and send offer letter
 */
async function autoGenerateOfferLetter(losId, productType) {
  try {
    console.log(`📄 Auto-generating offer letter for LOS-${losId} (${productType})`);
    
    // Get application details
    const appResult = await db.query(`
      SELECT ia.*, 
        COALESCE(
          ca.full_name, al.full_name, sm.full_name, 
          cv.full_name, ad.full_name, pc.full_name, cc.full_name
        ) as applicant_name
      FROM ilos_applications ia
      LEFT JOIN cashplus_applications ca ON ia.los_id = ca.los_id
      LEFT JOIN autoloan_applications al ON ia.los_id = al.los_id
      LEFT JOIN smeasaan_applications sm ON ia.los_id = sm.los_id
      LEFT JOIN commercial_vehicle_applications cv ON ia.los_id = cv.los_id
      LEFT JOIN ameendrive_applications ad ON ia.los_id = ad.los_id
      LEFT JOIN platinum_card_applications pc ON ia.los_id = pc.los_id
      LEFT JOIN creditcard_applications cc ON ia.los_id = cc.los_id
      WHERE ia.los_id = $1
    `, [losId]);
    
    if (appResult.rows.length === 0) {
      throw new Error(`Application LOS-${losId} not found`);
    }
    
    const application = appResult.rows[0];
    const offerReference = `OFFER-${losId}-${Date.now()}`;
    
    // TODO: Generate actual PDF offer letter
    // const pdfUrl = await generateOfferLetterPDF(application);
    
    // Update application status
    await db.query(`
      UPDATE ilos_applications
      SET 
        status = 'offer_letter_issued',
        auto_disbursement_triggered = true,
        auto_disbursement_completed_at = NOW(),
        offer_reference = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, offerReference]);
    
    console.log(`✅ Offer letter issued successfully: ${offerReference}`);
    
    return {
      success: true,
      status: 'offer_letter_issued',
      reference: offerReference,
      message: 'Offer letter automatically generated and issued'
    };
  } catch (error) {
    console.error(`❌ Auto offer letter generation failed for LOS-${losId}:`, error.message);
    
    await db.query(`
      UPDATE ilos_applications
      SET 
        disbursement_error = $2,
        updated_at = NOW()
      WHERE los_id = $1
    `, [losId, error.message]);
    
    throw error;
  }
}

/**
 * Main auto-finalization function (called after CIU approval)
 */
async function autoFinalize(losId, productType) {
  console.log(`🎯 Auto-finalizing LOS-${losId} (${productType})`);
  
  try {
    let result;
    
    // Determine action based on product type
    if (productType === 'PlatinumCreditCard' || productType === 'ClassicCreditCard') {
      result = await autoIssueCard(losId, productType);
    } else if (productType === 'CashPlus' || productType === 'AutoLoan' || 
               productType === 'SMEASAAN' || productType === 'CommercialVehicle' || 
               productType === 'AmeenDrive' || productType === 'instant_loan') {
      result = await autoDisburseLoan(losId, productType);
    } else {
      result = await autoGenerateOfferLetter(losId, productType);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Auto-finalization failed for LOS-${losId}:`, error.message);
    throw error;
  }
}

module.exports = {
  autoDisburseLoan,
  autoIssueCard,
  autoGenerateOfferLetter,
  autoFinalize
};

