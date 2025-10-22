/**
 * Decision Engine Controller
 * Handles requests for credit decision calculations
 * Integrates with decision engine services
 */

const dbrService = require('../decision-engine/services/dbrService');
const db = require('../db1'); // Import ILOS database connection (application tables are in db1)
const { normalizeApplicationData, getFinancialData } = require('../decision-engine/utils/fieldMapper');

/**
 * Calculate DBR for an application
 * POST /api/decision-engine/dbr
 * 
 * Request Body:
 * {
 *   losId: string - LOS ID (can include 'LOS-' prefix)
 *   loanType: string - Loan type
 *   applicationData: object (optional) - Override application data
 *   dbrData: object (optional) - External DBR data
 * }
 */
async function calculateDBR(req, res) {
  try {
    console.log('🔵 DBR Calculation Request Received');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { losId, loanType, applicationData: providedAppData, dbrData: providedDbrData } = req.body;

    if (!losId) {
      return res.status(400).json({
        success: false,
        error: 'LOS ID is required'
      });
    }

    // Extract numeric LOS ID (remove 'LOS-' prefix if present)
    const numericLosId = losId.toString().replace('LOS-', '').replace(/\D/g, '');
    
    console.log(`📋 Processing DBR for LOS ID: ${numericLosId}, Loan Type: ${loanType}`);

    // Fetch application data from database if not provided
    let applicationData = providedAppData;
    
    if (!applicationData) {
      console.log('📥 Fetching application data from database...');
      
      try {
        // Determine the table name based on loan type
        const tableMap = {
          'CashPlus Loan': 'cashplus_applications',
          'Auto Loan': 'autoloan_applications',
          'AmeenDrive Loan': 'ameendrive_applications',
          'SME Loan': 'smeasaan_applications',
          'Commercial Vehicle Loan': 'commercialvehicle_applications',
          'Platinum Credit Card': 'platinum_card_applications',
          'Classic Credit Card': 'creditcard_applications',
          'credit_card': 'creditcard_applications'
        };

        const tableName = tableMap[loanType] || 'ilos_applications';
        
        // Individual application tables use 'id' column, ilos_applications uses 'los_id'
        const idColumn = (tableName === 'ilos_applications') ? 'los_id' : 'id';
        
        console.log(`🔍 Querying table: ${tableName} for ${idColumn}: ${numericLosId}`);
        
        const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = $1 LIMIT 1`;
        const result = await db.query(query, [parseInt(numericLosId)]);
        
        if (result.rows.length === 0) {
          console.log(`❌ Application not found in ${tableName}`);
          return res.status(404).json({
            success: false,
            error: 'Application not found',
            losId: losId,
            searchedTable: tableName,
            hint: 'Make sure the application exists in ilos_applications table'
          });
        }
        
        applicationData = result.rows[0];
        console.log('✅ Application data fetched successfully');
        console.log('Application Fields:', Object.keys(applicationData).slice(0, 10).join(', ') + '...');
        
        // Normalize data based on loan type to handle different field names
        applicationData = normalizeApplicationData(applicationData, loanType);
        console.log('✅ Application data normalized for loan type:', loanType);
        
      } catch (dbError) {
        console.error('❌ Database Error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database error while fetching application',
          details: dbError.message
        });
      }
    }

    // Prepare DBR calculation input
    const dbrInput = {
      applicationData,
      dbrData: providedDbrData
    };

    // Calculate DBR using service
    console.log('🧮 Calculating DBR...');
    const dbrResult = dbrService.calculateDBR(dbrInput);

    if (!dbrResult.success) {
      console.log('❌ DBR Calculation Failed:', dbrResult.error);
      return res.status(400).json(dbrResult);
    }

    console.log('✅ DBR Calculation Successful');
    console.log('DBR Result:', {
      score: dbrResult.score,
      dbrPercentage: dbrResult.dbrPercentage,
      decisionBand: dbrResult.details.decisionBand
    });

    // Prepare response
    const response = {
      success: true,
      losId: losId,
      loanType: loanType || 'Unknown',
      dbr: dbrResult.dbrPercentage,
      status: dbrResult.details.decisionBand.toLowerCase(),
      threshold: dbrResult.dbrThreshold,
      dbrDetails: {
        netIncome: dbrResult.netIncome,
        totalObligations: dbrResult.totalObligations,
        dbrPercentage: dbrResult.dbrPercentage
      },
      decisionBand: dbrResult.details.decisionBand,
      riskCategory: dbrResult.details.riskCategory,
      score: dbrResult.score,
      notes: dbrResult.notes,
      flags: dbrResult.flags,
      details: dbrResult.details
    };

    res.json(response);
    
  } catch (error) {
    console.error('❌ Error in calculateDBR controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Calculate comprehensive credit decision
 * POST /api/decision-engine/comprehensive
 * 
 * Request Body:
 * {
 *   losId: string - LOS ID
 *   applicationType: string - Application type
 *   includeModules: array - Modules to include (optional)
 *   fetchFromDatabase: boolean - Fetch data from database (default: true)
 * }
 */
async function calculateComprehensive(req, res) {
  try {
    console.log('🔵 Comprehensive Decision Request Received');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { losId, applicationType, includeModules, fetchFromDatabase = true } = req.body;

    if (!losId) {
      return res.status(400).json({
        success: false,
        error: 'LOS ID is required'
      });
    }

    // Extract numeric LOS ID
    const numericLosId = losId.toString().replace('LOS-', '').replace(/\D/g, '');
    
    console.log(`📋 Processing Comprehensive Decision for LOS ID: ${numericLosId}`);

    // For now, start with DBR calculation
    // In future, this will orchestrate all modules
    const dbrInput = { losId: numericLosId, loanType: applicationType };
    
    // Call DBR calculation
    const dbrResult = await new Promise((resolve, reject) => {
      calculateDBR({ body: dbrInput }, {
        json: (data) => resolve(data),
        status: () => ({ json: (data) => reject(data) })
      });
    });

    // Prepare comprehensive response
    const response = {
      success: true,
      losId,
      applicationType,
      finalScore: dbrResult.score * 0.55, // DBR weight
      decision: dbrResult.decisionBand,
      riskLevel: dbrResult.riskCategory,
      actionRequired: dbrResult.decisionBand === 'PASS' ? 'Basic conditions' : 
                     dbrResult.decisionBand === 'CONDITIONAL' ? 'Additional review required' : 
                     'Application declined',
      moduleScores: {
        dbr: {
          score: dbrResult.score,
          weight: 0.55,
          weightedScore: dbrResult.score * 0.55,
          dbrPercentage: dbrResult.dbrPercentage,
          threshold: dbrResult.threshold,
          status: dbrResult.status,
          notes: dbrResult.notes
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
    
  } catch (error) {
    console.error('❌ Error in calculateComprehensive controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get application decision (retrieve existing)
 * GET /api/decision-engine/application/:losId
 */
async function getApplicationDecision(req, res) {
  try {
    const { losId } = req.params;
    
    console.log(`🔍 Retrieving decision for LOS ID: ${losId}`);

    // TODO: Implement retrieval from decision_engine_results table
    // For now, return not implemented
    res.status(501).json({
      success: false,
      error: 'Feature not yet implemented',
      message: 'Decision retrieval will be available in future updates'
    });
    
  } catch (error) {
    console.error('❌ Error in getApplicationDecision controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get module information
 * GET /api/decision-engine/modules
 */
function getModulesInfo(req, res) {
  try {
    const modules = {
      dbr: dbrService.getModuleInfo()
    };

    res.json({
      success: true,
      modules,
      totalModules: Object.keys(modules).length
    });
    
  } catch (error) {
    console.error('❌ Error in getModulesInfo controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  calculateDBR,
  calculateComprehensive,
  getApplicationDecision,
  getModulesInfo
};

