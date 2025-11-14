/**
 * SPU (Security & Pre-Underwriting) Controller
 * Handles SPU checks and compliance verification
 */

class SPUController {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get pending applications for SPU review
   * GET /api/v1/spu/pending
   */
  async getPendingApplications(req, res, next) {
    try {
      console.log('\n📋 Fetching pending SPU applications');

      const result = await this.db.query(`
        SELECT 
          a.application_id,
          a.los_id,
          a.product_type,
          a.requested_amount,
          a.requested_tenure_months,
          a.current_stage,
          a.application_status,
          a.submitted_at,
          a.created_at,
          p.cnic as applicant_cnic,
          p.first_name,
          p.last_name,
          p.mobile as customer_mobile,
          p.email,
          p.city as permanent_city,
          pd.monthly_income,
          pd.employer_name,
          -- Check if SPU checks already exist
          spu.overall_result as existing_spu_result,
          spu.checked_at as last_checked_at
        FROM applications a
        LEFT JOIN parties p ON a.party_id = p.party_id
        LEFT JOIN party_details pd ON p.party_id = pd.party_id
        LEFT JOIN LATERAL (
          SELECT * FROM spu_checks 
          WHERE spu_checks.application_id = a.application_id 
          ORDER BY checked_at DESC 
          LIMIT 1
        ) spu ON true
        WHERE a.current_stage IN ('SPU', 'spu_review', 'compliance_check')
          AND a.application_status NOT IN ('rejected', 'withdrawn', 'cancelled')
        ORDER BY a.submitted_at DESC
      `);

      console.log(`✅ Found ${result.rows.length} pending SPU applications`);

      res.json({
        success: true,
        applications: result.rows
      });
    } catch (error) {
      console.error('❌ Error fetching pending SPU applications:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Save SPU check results
   * POST /api/v1/spu/checks
   */
  async saveSPUChecks(req, res, next) {
    try {
      const {
        application_id,
        los_id,
        party_id,
        pep_check_result,
        pep_check_notes,
        sbp_blacklist_result,
        sbp_blacklist_notes,
        nadra_verisys_result,
        nadra_verisys_notes,
        internal_watchlist_result,
        internal_watchlist_notes,
        ccl_check_result,
        ccl_check_notes,
        overall_result,
        recommendation,
        checked_by
      } = req.body;

      console.log(`\n✅ Saving SPU checks for LOS-${los_id}`);
      console.log(`   Overall Result: ${overall_result}`);

      // Validate required fields
      if (!application_id || !los_id || !overall_result) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: application_id, los_id, overall_result'
        });
      }

      // Insert SPU check results
      const result = await this.db.query(`
        INSERT INTO spu_checks (
          application_id,
          los_id,
          party_id,
          pep_check_result,
          pep_check_notes,
          sbp_blacklist_result,
          sbp_blacklist_notes,
          nadra_verisys_result,
          nadra_verisys_notes,
          internal_watchlist_result,
          internal_watchlist_notes,
          ccl_check_result,
          ccl_check_notes,
          overall_result,
          recommendation,
          checked_by,
          checked_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        )
        RETURNING check_id, checked_at
      `, [
        application_id, los_id, party_id,
        pep_check_result || 'Not Checked', pep_check_notes,
        sbp_blacklist_result || 'Not Checked', sbp_blacklist_notes,
        nadra_verisys_result || 'Not Checked', nadra_verisys_notes,
        internal_watchlist_result || 'Not Checked', internal_watchlist_notes,
        ccl_check_result || 'Not Checked', ccl_check_notes,
        overall_result, recommendation, checked_by
      ]);

      const checkId = result.rows[0].check_id;

      // Update application stage if SPU passed
      if (overall_result === 'Pass') {
        await this.db.query(`
          UPDATE applications
          SET 
            current_stage = 'EAVMU',
            application_status = 'spu_cleared',
            updated_at = NOW()
          WHERE application_id = $1
        `, [application_id]);

        console.log(`✅ Application LOS-${los_id} moved to EAVMU stage`);
      } else if (overall_result === 'Fail') {
        await this.db.query(`
          UPDATE applications
          SET 
            application_status = 'spu_rejected',
            updated_at = NOW()
          WHERE application_id = $1
        `, [application_id]);

        console.log(`❌ Application LOS-${los_id} rejected by SPU`);
      }

      // Log workflow change
      await this.db.query(`
        INSERT INTO application_workflow (
          application_id, los_id, stage, action,
          performed_by, status_to, comments
        ) VALUES ($1, $2, 'SPU', 'spu_check_completed', $3, $4, $5)
      `, [
        application_id, los_id, checked_by,
        overall_result === 'Pass' ? 'spu_cleared' : 'spu_rejected',
        recommendation
      ]);

      console.log(`✅ SPU checks saved with ID: ${checkId}`);

      res.json({
        success: true,
        check_id: checkId,
        overall_result: overall_result,
        message: `SPU checks saved successfully. Application ${overall_result === 'Pass' ? 'moved to EAVMU' : 'rejected'}.`
      });

    } catch (error) {
      console.error('❌ Error saving SPU checks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get SPU check history for an application
   * GET /api/v1/spu/checks/:losId
   */
  async getSPUCheckHistory(req, res, next) {
    try {
      const losId = parseInt(req.params.losId);

      console.log(`\n📋 Fetching SPU check history for LOS-${losId}`);

      const result = await this.db.query(`
        SELECT 
          sc.*,
          u.full_name as checked_by_name
        FROM spu_checks sc
        LEFT JOIN users u ON sc.checked_by = u.user_id
        WHERE sc.los_id = $1
        ORDER BY sc.checked_at DESC
      `, [losId]);

      console.log(`✅ Found ${result.rows.length} SPU check(s) for LOS-${losId}`);

      res.json({
        success: true,
        checks: result.rows
      });

    } catch (error) {
      console.error('❌ Error fetching SPU check history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get SPU statistics
   * GET /api/v1/spu/statistics
   */
  async getSPUStatistics(req, res, next) {
    try {
      console.log('\n📊 Fetching SPU statistics');

      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN overall_result = 'Pass' THEN 1 ELSE 0 END) as passed_checks,
          SUM(CASE WHEN overall_result = 'Fail' THEN 1 ELSE 0 END) as failed_checks,
          SUM(CASE WHEN pep_check_result = 'Fail' THEN 1 ELSE 0 END) as pep_flags,
          SUM(CASE WHEN sbp_blacklist_result = 'Fail' THEN 1 ELSE 0 END) as blacklist_flags,
          SUM(CASE WHEN ccl_check_result = 'Fail' THEN 1 ELSE 0 END) as ccl_flags
        FROM spu_checks
        WHERE checked_at >= NOW() - INTERVAL '30 days'
      `);

      const stats = result.rows[0];

      console.log(`✅ SPU Statistics: ${stats.total_checks} checks in last 30 days`);

      res.json({
        success: true,
        statistics: stats
      });

    } catch (error) {
      console.error('❌ Error fetching SPU statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = SPUController;

