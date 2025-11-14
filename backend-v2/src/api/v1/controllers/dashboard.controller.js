/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard metrics
 */

class DashboardController {
  constructor(db) {
    this.db = db;
  }

  /**
   * GET /api/v1/dashboard/metrics
   * Get dashboard metrics
   */
  async getMetrics(req, res, next) {
    try {
      console.log('📊 Fetching dashboard metrics');

      // Get metrics from view
      const result = await this.db.query('SELECT * FROM v_dashboard_metrics');
      const metrics = result.rows[0] || {};

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/dashboard/workflow-funnel
   * Get workflow funnel data
   */
  async getWorkflowFunnel(req, res, next) {
    try {
      const { productType } = req.query;
      console.log('📊 Fetching workflow funnel', productType ? `for ${productType}` : '');

      let query = 'SELECT * FROM v_workflow_funnel';
      const params = [];

      if (productType) {
        query += ' WHERE product_type = $1';
        params.push(productType);
      }

      const result = await this.db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('❌ Error fetching workflow funnel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch workflow funnel',
        message: error.message
      });
    }
  }
}

module.exports = { DashboardController };

