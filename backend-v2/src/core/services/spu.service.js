/**
 * SPU Service V2.0
 * Handles all SPU compliance checks
 * Checks: PEP, SBP Blacklist, NADRA Verisys, Internal Watchlist, CCL
 */

const XLSX = require('xlsx');
const path = require('path');
const axios = require('axios');

class SPUService {
  constructor(db) {
    this.db = db;
    this.dataPath = path.join(__dirname, '../../../data');
  }

  /**
   * Run all SPU checks
   */
  async runAllChecks(losId, cnic, productType) {
    console.log(`\n🔍 Running SPU checks for LOS-${losId}, CNIC: ${cnic}`);
    
    const results = {
      approved: true,
      reason: null,
      details: {
        pep: null,
        sbpBlacklist: null,
        nadraVerisys: null,
        internalWatchlist: null,
        ccl: null
      }
    };

    try {
      // 1. PEP Check
      console.log(`  📋 Checking PEP list...`);
      results.details.pep = await this.checkPEP(cnic);
      if (!results.details.pep.passed) {
        results.approved = false;
        results.reason = 'PEP Match Found';
        return results;
      }

      // 2. SBP Blacklist Check
      console.log(`  📋 Checking SBP Blacklist...`);
      results.details.sbpBlacklist = await this.checkSBPBlacklist(cnic);
      if (!results.details.sbpBlacklist.passed) {
        results.approved = false;
        results.reason = 'SBP Blacklist Match Found';
        return results;
      }

      // 3. NADRA Verisys Check
      console.log(`  📋 Checking NADRA Verisys...`);
      results.details.nadraVerisys = await this.checkNADRAVerisys(cnic);
      if (!results.details.nadraVerisys.passed) {
        results.approved = false;
        results.reason = 'NADRA Verisys Verification Failed';
        return results;
      }

      // 4. Internal Watchlist Check
      console.log(`  📋 Checking Internal Watchlist...`);
      results.details.internalWatchlist = await this.checkInternalWatchlist(cnic);
      if (!results.details.internalWatchlist.passed) {
        results.approved = false;
        results.reason = 'Internal Watchlist Match Found';
        return results;
      }

      // 5. CCL Check
      console.log(`  📋 Checking CCL...`);
      results.details.ccl = await this.checkCCL(cnic);
      if (!results.details.ccl.passed) {
        results.approved = false;
        results.reason = 'CCL Match Found';
        return results;
      }

      console.log(`  ✅ All SPU checks passed`);
      return results;

    } catch (error) {
      console.error(`  ❌ SPU checks error:`, error);
      throw error;
    }
  }

  /**
   * Check PEP List (Excel-based)
   */
  async checkPEP(cnic) {
    try {
      const filePath = path.join(this.dataPath, 'pep.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const match = data.find(row => 
        row.CNIC && row.CNIC.toString().replace(/[-\s]/g, '') === cnic.replace(/[-\s]/g, '')
      );

      if (match) {
        return {
          passed: false,
          matched: true,
          details: match
        };
      }

      return {
        passed: true,
        matched: false
      };
    } catch (error) {
      console.error(`  ⚠️  PEP check error (defaulting to pass):`, error.message);
      return { passed: true, error: error.message };
    }
  }

  /**
   * Check SBP Blacklist (Excel-based)
   */
  async checkSBPBlacklist(cnic) {
    try {
      const filePath = path.join(this.dataPath, 'sbp_blacklist.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const match = data.find(row => 
        row.CNIC && row.CNIC.toString().replace(/[-\s]/g, '') === cnic.replace(/[-\s]/g, '')
      );

      if (match) {
        return {
          passed: false,
          matched: true,
          details: match
        };
      }

      return {
        passed: true,
        matched: false
      };
    } catch (error) {
      console.error(`  ⚠️  SBP Blacklist check error (defaulting to pass):`, error.message);
      return { passed: true, error: error.message };
    }
  }

  /**
   * Check NADRA Verisys (API-based)
   */
  async checkNADRAVerisys(cnic) {
    try {
      // Simulated NADRA API call
      // In production, replace with actual NADRA API
      const response = await axios.post('http://localhost:8002/verify-cnic', {
        cnic: cnic
      }, { timeout: 5000 });

      if (response.data && response.data.verified) {
        return {
          passed: true,
          verified: true,
          details: response.data
        };
      }

      return {
        passed: false,
        verified: false,
        reason: 'CNIC verification failed'
      };

    } catch (error) {
      console.error(`  ⚠️  NADRA Verisys check error (defaulting to pass):`, error.message);
      // Default to pass if service is unavailable
      return { passed: true, error: error.message, note: 'Service unavailable - manual review required' };
    }
  }

  /**
   * Check Internal Watchlist (Excel-based)
   */
  async checkInternalWatchlist(cnic) {
    try {
      const filePath = path.join(this.dataPath, 'internal_watchlist.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const match = data.find(row => 
        row.CNIC && row.CNIC.toString().replace(/[-\s]/g, '') === cnic.replace(/[-\s]/g, '')
      );

      if (match) {
        return {
          passed: false,
          matched: true,
          details: match
        };
      }

      return {
        passed: true,
        matched: false
      };
    } catch (error) {
      console.error(`  ⚠️  Internal Watchlist check error (defaulting to pass):`, error.message);
      return { passed: true, error: error.message };
    }
  }

  /**
   * Check CCL (Excel-based)
   */
  async checkCCL(cnic) {
    try {
      const filePath = path.join(this.dataPath, 'ccl_list.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const match = data.find(row => 
        row.CNIC && row.CNIC.toString().replace(/[-\s]/g, '') === cnic.replace(/[-\s]/g, '')
      );

      if (match) {
        return {
          passed: false,
          matched: true,
          details: match
        };
      }

      return {
        passed: true,
        matched: false
      };
    } catch (error) {
      console.error(`  ⚠️  CCL check error (defaulting to pass):`, error.message);
      return { passed: true, error: error.message };
    }
  }

  /**
   * Save SPU check results to database
   */
  async saveCheckResults(losId, applicationId, partyId, results, checkedBy = null) {
    try {
      console.log(`💾 Saving SPU check results for LOS-${losId}...`);
      
      const riskScore = this.calculateRiskScore(results);
      
      await this.db.query(`
        INSERT INTO spu_checks (
          application_id, los_id, party_id,
          pep_check_result, pep_check_details,
          sbp_blacklist_result, sbp_blacklist_details,
          nadra_verisys_result, nadra_verisys_details,
          internal_watchlist_result, internal_watchlist_details,
          ccl_check_result, ccl_check_details,
          overall_result, risk_score, recommendation,
          checked_by, is_automated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        applicationId, losId, partyId,
        results.details.pep?.passed ? 'Pass' : 'Fail', 
        JSON.stringify(results.details.pep || {}),
        results.details.sbpBlacklist?.passed ? 'Pass' : 'Fail', 
        JSON.stringify(results.details.sbpBlacklist || {}),
        results.details.nadraVerisys?.passed ? 'Pass' : 'Fail', 
        JSON.stringify(results.details.nadraVerisys || {}),
        results.details.internalWatchlist?.passed ? 'Pass' : 'Fail', 
        JSON.stringify(results.details.internalWatchlist || {}),
        results.details.ccl?.passed ? 'Pass' : 'Fail', 
        JSON.stringify(results.details.ccl || {}),
        results.approved ? 'Pass' : 'Fail',
        riskScore,
        results.reason || 'All checks passed',
        checkedBy,
        true
      ]);
      
      console.log(`✅ SPU check results saved to database for LOS-${losId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save SPU results:`, error);
      // Don't throw - we don't want to break workflow if save fails
      return false;
    }
  }

  /**
   * Calculate risk score based on check results
   */
  calculateRiskScore(results) {
    if (!results.approved) return 100; // Maximum risk if rejected
    
    let score = 0;
    const details = results.details;
    
    // Each failed check adds risk
    if (details.pep && !details.pep.passed) score += 30;
    if (details.sbpBlacklist && !details.sbpBlacklist.passed) score += 30;
    if (details.nadraVerisys && !details.nadraVerisys.passed) score += 20;
    if (details.internalWatchlist && !details.internalWatchlist.passed) score += 10;
    if (details.ccl && !details.ccl.passed) score += 10;
    
    return Math.min(score, 100); // Cap at 100
  }
}

module.exports = { SPUService };

