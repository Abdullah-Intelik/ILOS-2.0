/**
 * DBR (Debt-to-Income Ratio) Service
 * Comprehensive DBR calculation with dynamic thresholds and SBP R-3 compliance
 * 
 * Converted from TypeScript DBRModule for Node.js backend integration
 * Team: Credit Risk & Debt Analysis
 */

/**
 * Calculate income score for dynamic threshold
 * @param {number} netIncome - Net monthly income
 * @returns {number} Income score (10-50)
 */
function calculateIncomeScore(netIncome) {
  if (netIncome >= 100000) return 50;
  if (netIncome >= 75000) return 40;
  if (netIncome >= 50000) return 30;
  if (netIncome >= 30000) return 20;
  return 10;
}

/**
 * Calculate obligations score for dynamic threshold
 * @param {number} totalObligations - Total monthly obligations
 * @returns {number} Obligations score (10-50)
 */
function calculateObligationsScore(totalObligations) {
  if (totalObligations <= 10000) return 50;
  if (totalObligations <= 25000) return 40;
  if (totalObligations <= 50000) return 30;
  if (totalObligations <= 75000) return 20;
  return 10;
}

/**
 * Calculate dynamic DBR threshold based on income and obligations
 * @param {number} incomeScore - Income score
 * @param {number} obligationsScore - Obligations score
 * @returns {number} Dynamic threshold percentage
 */
function calculateDynamicThreshold(incomeScore, obligationsScore) {
  const combinedScore = incomeScore + obligationsScore;
  
  if (combinedScore >= 90) return 45; // Best case: more strict threshold
  if (combinedScore >= 70) return 40; // Good case: standard threshold
  if (combinedScore >= 50) return 35; // Fair case: lenient threshold
  return 30; // Worst case: more lenient threshold
}

/**
 * Calculate DBR score based on percentage
 * @param {number} dbrPercentage - DBR percentage
 * @returns {number} DBR score (0-100)
 */
function calculateDBRScore(dbrPercentage) {
  if (dbrPercentage <= 20) return 100;
  if (dbrPercentage <= 35) return 75;
  if (dbrPercentage <= 50) return 50;
  if (dbrPercentage <= 60) return 25;
  return 0;
}

/**
 * Get risk category based on DBR percentage
 * @param {number} dbrPercentage - DBR percentage
 * @param {number} threshold - Threshold percentage
 * @returns {string} Risk category
 */
function getRiskCategory(dbrPercentage, threshold) {
  if (dbrPercentage > threshold) return 'CRITICAL';
  if (dbrPercentage > threshold * 0.8) return 'HIGH';
  if (dbrPercentage > threshold * 0.6) return 'MEDIUM';
  return 'LOW';
}

/**
 * Main DBR calculation function
 * @param {Object} input - DBR calculation input
 * @param {Object} input.applicationData - Application data from database
 * @param {Object} input.dbrData - Optional DBR data from external engine
 * @returns {Object} DBR calculation result
 */
function calculateDBR(input) {
  console.log('='.repeat(80));
  console.log('💳 DBR SERVICE CALCULATION');
  console.log('='.repeat(80));
  console.log('📥 INPUTS:');
  console.log('  • Application Data:', input.applicationData ? 'Available' : 'Not Available');
  console.log('  • DBR Data:', input.dbrData ? 'Available' : 'Not Available');

  const app = input.applicationData || {};
  const externalDBR = input.dbrData;

  let dbrPercentage = 0;
  let notes = [];
  let netIncome = 0;
  let totalObligations = 0;
  
  // SBP R-3 decision bands (adjusted for credit cards): PASS ≤40, CONDITIONAL ≤50, FAIL >50
  const PASS_THRESHOLD = 40;
  const CONDITIONAL_THRESHOLD = 50;
  let threshold = CONDITIONAL_THRESHOLD;
  let isWithinThreshold = false;
  let calculationMethod = 'FALLBACK';
  let incomeSource = 'APPLICATION';
  let obligationsSource = 'ESTIMATED';

  // Check if we have DBR data from external engine
  if (externalDBR && externalDBR.dbr !== undefined && externalDBR.dbr !== null) {
    console.log('🔍 PROCESSING DBR DATA FROM EXTERNAL ENGINE:');
    console.log('  • DBR Value:', externalDBR.dbr);
    console.log('  • DBR Details:', JSON.stringify(externalDBR.dbr_details));
    
    dbrPercentage = parseFloat(externalDBR.dbr);
    netIncome = externalDBR.dbr_details?.net_income || 0;
    totalObligations = externalDBR.dbr_details?.total_obligations || 0;
    threshold = externalDBR.threshold || CONDITIONAL_THRESHOLD;
    isWithinThreshold = externalDBR.status === 'pass';
    calculationMethod = 'DATA_ENGINE';
    incomeSource = 'DATA_ENGINE';
    obligationsSource = 'DATA_ENGINE';
    
    console.log('  • DBR Percentage:', dbrPercentage + '%');
    console.log('  • Net Income:', netIncome);
    console.log('  • Total Obligations:', totalObligations);
    console.log('  • Threshold:', threshold + '%');
    console.log('  • Status:', externalDBR.status);
    
    notes.push(`DBR from data engine: ${dbrPercentage.toFixed(2)}%`);
    notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
    notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
    notes.push(`DBR Threshold: ${threshold}% (Dynamic)`);
    notes.push(`Status: ${externalDBR.status?.toUpperCase()}`);
    
    // If status is fail, return 0 score
    if (externalDBR.status === 'fail') {
      console.log('❌ DBR STATUS: FAIL');
      notes.push(`DBR status is FAIL - Score 0`);
      
      return {
        success: true,
        score: 0,
        raw: 0,
        dbrPercentage,
        dbrThreshold: threshold,
        isWithinThreshold: false,
        netIncome,
        totalObligations,
        notes,
        flags: ["DBR_FAIL"],
        details: {
          calculationMethod,
          incomeSource,
          obligationsSource,
          thresholdType: 'DYNAMIC',
          riskCategory: 'CRITICAL',
          statusReason: 'DATA_ENGINE_FAIL',
          decisionBand: 'FAIL'
        }
      };
    }
  } else {
    // Fallback: Calculate DBR directly from application data
    console.log('⚠️ FALLBACK: No external DBR data, calculating from application data...');
    
    // Extract income data
    const grossIncome = parseFloat(app.gross_monthly_income || app.grossMonthlySalary || 0);
    const netIncomeValue = parseFloat(app.total_income || app.net_monthly_income || app.netMonthlyIncome || 0);
    const loanAmount = parseFloat(app.proposed_loan_amount || app.amount_requested || app.loan_amount || app.amountRequested || 0);
    const monthlyInstallment = parseFloat(app.monthly_installment || 0);
    const existingObligations = parseFloat(app.existing_monthly_obligations || 0);
    const ccLimit = parseFloat(app.credit_card_limit || 0);
    const odAnnualInterest = parseFloat(app.overdraft_annual_interest || 0);
    
    const ccComponent = ccLimit > 0 ? ccLimit * 0.05 : 0; // 5% of CC limit
    const odMonthly = odAnnualInterest > 0 ? odAnnualInterest / 12 : 0; // OD monthly interest
    
    console.log('  • Gross Income:', grossIncome);
    console.log('  • Net Income:', netIncomeValue);
    console.log('  • Existing Obligations:', existingObligations);
    console.log('  • CC Limit:', ccLimit);
    console.log('  • OD Annual Interest:', odAnnualInterest);
    
    // Calculate DBR
    if (netIncomeValue > 0) {
      // For credit cards, we only consider existing obligations
      let proposedEmi = 0;
      
      if (!isNaN(monthlyInstallment) && monthlyInstallment > 0) {
        proposedEmi = monthlyInstallment;
        notes.push('Using provided monthly_installment');
      } else {
        proposedEmi = 0;
        notes.push('Credit card application: requested limit does not create monthly obligation');
      }

      const totalMonthlyObligations = (existingObligations || 0) + ccComponent + odMonthly + (proposedEmi || 0);
      
      // SBP DBR: Total Monthly Obligations / Net Disposable Monthly Income
      dbrPercentage = (totalMonthlyObligations / netIncomeValue) * 100;
      netIncome = netIncomeValue;
      totalObligations = totalMonthlyObligations;
      calculationMethod = 'APPLICATION_DATA';
      
      // SBP thresholds
      threshold = dbrPercentage <= PASS_THRESHOLD ? PASS_THRESHOLD : CONDITIONAL_THRESHOLD;
      isWithinThreshold = dbrPercentage <= CONDITIONAL_THRESHOLD;
      
      notes.push(`DBR calculated from application data: ${dbrPercentage.toFixed(2)}%`);
      notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
      notes.push(`Components → Existing: PKR ${(existingObligations||0).toLocaleString()}, CC(5%): PKR ${ccComponent.toLocaleString()}, OD/12: PKR ${odMonthly.toLocaleString()}, Proposed EMI: PKR ${(proposedEmi||0).toLocaleString()}`);
      notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
      notes.push(`Threshold Bands: PASS ≤ ${PASS_THRESHOLD}%, CONDITIONAL ≤ ${CONDITIONAL_THRESHOLD}%`);
      notes.push(`Status: ${dbrPercentage <= PASS_THRESHOLD ? 'PASS' : (dbrPercentage <= CONDITIONAL_THRESHOLD ? 'CONDITIONAL' : 'FAIL')}`);
    } else {
      console.log('❌ Cannot calculate DBR: Net income is 0 or missing');
      notes.push("No DBR data available and net income is 0");
      
      return {
        success: false,
        error: 'No DBR data and insufficient application data',
        score: 0,
        raw: 0,
        dbrPercentage: 0,
        dbrThreshold: threshold,
        isWithinThreshold: false,
        netIncome: 0,
        totalObligations: 0,
        notes,
        flags: ["NO_DBR_DATA"],
        details: {
          calculationMethod: 'FAILED',
          incomeSource: 'NONE',
          obligationsSource: 'NONE',
          thresholdType: 'DEFAULT',
          riskCategory: 'CRITICAL',
          statusReason: 'NO_DATA',
          decisionBand: 'FAIL'
        }
      };
    }
  }

  // Calculate score based on DBR percentage
  const dbrScore = calculateDBRScore(dbrPercentage);
  const riskCategory = getRiskCategory(dbrPercentage, threshold);
  const decisionBand = dbrPercentage <= PASS_THRESHOLD ? 'PASS' : (dbrPercentage <= CONDITIONAL_THRESHOLD ? 'CONDITIONAL' : 'FAIL');
  
  console.log('🔍 DBR SCORING:');
  console.log('  • DBR Percentage:', dbrPercentage.toFixed(2) + '%');
  console.log('  • Score:', dbrScore + '/100');
  console.log('  • Risk Category:', riskCategory);
  console.log('  • Decision Band:', decisionBand);
  
  console.log('📤 OUTPUTS:');
  console.log('  • Final Score:', dbrScore + '/100');
  console.log('  • DBR Percentage:', dbrPercentage.toFixed(2) + '%');
  console.log('  • Threshold:', threshold + '%');
  console.log('  • Within Threshold:', isWithinThreshold);
  console.log('='.repeat(80));

  return {
    success: true,
    score: dbrScore,
    raw: dbrScore,
    dbrPercentage,
    dbrThreshold: threshold,
    isWithinThreshold,
    netIncome,
    totalObligations,
    notes,
    flags: isWithinThreshold ? [] : ["DBR_EXCEED_THRESHOLD"],
    details: {
      calculationMethod,
      incomeSource,
      obligationsSource,
      thresholdType: calculationMethod === 'DATA_ENGINE' ? 'DYNAMIC' : 'CALCULATED',
      riskCategory,
      statusReason: isWithinThreshold ? 'WITHIN_THRESHOLD' : 'EXCEEDS_THRESHOLD',
      decisionBand
    }
  };
}

/**
 * Check if DBR result is a critical failure
 * @param {Object} result - DBR calculation result
 * @returns {boolean} True if critical failure
 */
function isCriticalFailure(result) {
  return !result.isWithinThreshold || result.details.decisionBand === 'FAIL';
}

/**
 * Get module weight in final calculation
 * @returns {number} Weight (0.55 = 55%)
 */
function getWeight() {
  return 0.55; // 55% - Primary risk indicator
}

/**
 * Get module information
 * @returns {Object} Module information
 */
function getModuleInfo() {
  return {
    name: 'DBR (Debt-to-Income Ratio)',
    description: 'Handles debt-to-income ratio calculation with dynamic thresholds',
    weight: getWeight(),
    team: 'Credit Risk & Debt Analysis',
    criticalFailure: true
  };
}

/**
 * Get DBR scoring bands
 * @returns {Array} Scoring bands with ranges and descriptions
 */
function getScoringBands() {
  return [
    { range: '0-20%', score: 100, description: 'Excellent - Very low debt burden' },
    { range: '20-35%', score: 75, description: 'Good - Manageable debt level' },
    { range: '35-50%', score: 50, description: 'Fair - Moderate debt burden' },
    { range: '50-60%', score: 25, description: 'Poor - High debt burden' },
    { range: '60%+', score: 0, description: 'Very Poor - Excessive debt burden' }
  ];
}

module.exports = {
  calculateDBR,
  isCriticalFailure,
  getWeight,
  getModuleInfo,
  getScoringBands
};

