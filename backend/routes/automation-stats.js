const express = require('express');
const router = express.Router();
const db = require('../db1');
const { getAutomationStats, scheduleQueueProcessing } = require('../services/automatedWorkflow');
const { processQueuedApplications } = require('../services/autoAssignEavmu');

/**
 * Automation Statistics and Monitoring API
 * Provides endpoints for monitoring the automated workflow system
 */

// Get automation statistics for a date range
router.get('/stats', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const stats = await getAutomationStats(
      dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: last 30 days
      dateTo || new Date().toISOString()
    );
    
    res.json({
      success: true,
      stats,
      period: {
        from: dateFrom || '30 days ago',
        to: dateTo || 'now'
      }
    });
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get daily automation statistics view
router.get('/stats/daily', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await db.query(`
      SELECT * FROM v_automation_stats
      WHERE date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ORDER BY date DESC
    `);
    
    res.json({
      success: true,
      dailyStats: result.rows,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get queued applications
router.get('/queue', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM v_queued_applications
      ORDER BY queued_at ASC
    `);
    
    res.json({
      success: true,
      queuedApplications: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching queued applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manually trigger queue processing
router.post('/queue/process', async (req, res) => {
  try {
    console.log('📋 Manual queue processing triggered');
    
    const result = await processQueuedApplications();
    
    res.json({
      success: true,
      message: 'Queue processing completed',
      processed: result.processed,
      remaining: result.remaining
    });
  } catch (error) {
    console.error('Error processing queue:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get automation health status
router.get('/health', async (req, res) => {
  try {
    // Check various automation components
    const checks = {
      database: false,
      spuChecks: false,
      queueProcessing: false,
      disbursement: false
    };
    
    // Database check
    try {
      await db.query('SELECT 1');
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
    
    // SPU checks (check if combine-checks endpoint is available)
    try {
      const recentChecks = await db.query(`
        SELECT COUNT(*) as count
        FROM ilos_applications
        WHERE spu_checks_completed = true
          AND spu_checks_completed_at >= NOW() - INTERVAL '1 hour'
      `);
      checks.spuChecks = parseInt(recentChecks.rows[0].count) >= 0;
    } catch (error) {
      console.error('SPU checks health check failed:', error);
    }
    
    // Queue processing check
    try {
      const queueStatus = await db.query(`
        SELECT 
          COUNT(*) as queued_count,
          MAX(EXTRACT(EPOCH FROM (NOW() - queued_at))/60) as max_wait_minutes
        FROM ilos_applications
        WHERE assignment_queued = true
      `);
      
      const queuedCount = parseInt(queueStatus.rows[0].queued_count);
      const maxWait = parseFloat(queueStatus.rows[0].max_wait_minutes);
      
      // Queue is healthy if there are less than 10 queued or max wait is less than 60 minutes
      checks.queueProcessing = queuedCount < 10 || maxWait < 60;
    } catch (error) {
      console.error('Queue processing health check failed:', error);
    }
    
    // Disbursement check
    try {
      const disbursementStatus = await db.query(`
        SELECT COUNT(*) as count
        FROM ilos_applications
        WHERE auto_disbursement_triggered = true
          AND auto_disbursement_completed_at >= NOW() - INTERVAL '1 hour'
      `);
      checks.disbursement = parseInt(disbursementStatus.rows[0].count) >= 0;
    } catch (error) {
      console.error('Disbursement health check failed:', error);
    }
    
    const allHealthy = Object.values(checks).every(check => check === true);
    
    res.json({
      success: true,
      healthy: allHealthy,
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking automation health:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get automation metrics summary
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await db.query(`
      WITH today_stats AS (
        SELECT 
          COUNT(*) as total_today,
          COUNT(*) FILTER (WHERE auto_processed = true) as auto_processed_today,
          COUNT(*) FILTER (WHERE status = 'rejected_by_spu') as auto_rejected_today,
          COUNT(*) FILTER (WHERE auto_disbursement_triggered = true) as auto_disbursed_today,
          AVG(EXTRACT(EPOCH FROM (auto_disbursement_completed_at - created_at))/3600) as avg_completion_hours_today
        FROM ilos_applications
        WHERE DATE(created_at) = CURRENT_DATE
      ),
      week_stats AS (
        SELECT 
          COUNT(*) as total_week,
          COUNT(*) FILTER (WHERE auto_processed = true) as auto_processed_week,
          COUNT(*) FILTER (WHERE status = 'rejected_by_spu') as auto_rejected_week,
          COUNT(*) FILTER (WHERE auto_disbursement_triggered = true) as auto_disbursed_week,
          AVG(EXTRACT(EPOCH FROM (auto_disbursement_completed_at - created_at))/3600) as avg_completion_hours_week
        FROM ilos_applications
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ),
      queue_stats AS (
        SELECT 
          COUNT(*) as queued_count,
          AVG(EXTRACT(EPOCH FROM (NOW() - queued_at))/60) as avg_queue_time_minutes,
          MAX(EXTRACT(EPOCH FROM (NOW() - queued_at))/60) as max_queue_time_minutes
        FROM ilos_applications
        WHERE assignment_queued = true
      ),
      agent_stats AS (
        SELECT 
          COUNT(*) as total_agents,
          COUNT(*) FILTER (WHERE status = 'active') as active_agents,
          SUM(max_concurrent_assignments) as total_capacity,
          (SELECT COUNT(*) FROM agent_assignments WHERE status = 'active') as current_load
        FROM eamvu_agents
      )
      SELECT 
        json_build_object(
          'today', to_jsonb(today_stats.*),
          'week', to_jsonb(week_stats.*),
          'queue', to_jsonb(queue_stats.*),
          'agents', to_jsonb(agent_stats.*)
        ) as metrics
      FROM today_stats, week_stats, queue_stats, agent_stats
    `);
    
    res.json({
      success: true,
      metrics: metrics.rows[0].metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching automation metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow logs for a specific application
router.get('/workflow/:losId', async (req, res) => {
  try {
    const { losId } = req.params;
    
    const result = await db.query(`
      SELECT 
        los_id,
        status,
        auto_processed,
        spu_checks_completed,
        spu_checks_result,
        assignment_queued,
        auto_forwarded_to_ciu,
        auto_disbursement_triggered,
        automation_workflow_log,
        created_at,
        updated_at
      FROM ilos_applications
      WHERE los_id = $1
    `, [parseInt(losId)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching workflow log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get automation errors
router.get('/errors', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await db.query(`
      SELECT 
        los_id,
        status,
        automation_error,
        spu_checks_error,
        disbursement_error,
        finalization_error,
        created_at,
        updated_at
      FROM ilos_applications
      WHERE automation_error IS NOT NULL 
         OR spu_checks_error IS NOT NULL
         OR disbursement_error IS NOT NULL
         OR finalization_error IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT $1
    `, [parseInt(limit)]);
    
    res.json({
      success: true,
      errors: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching automation errors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

