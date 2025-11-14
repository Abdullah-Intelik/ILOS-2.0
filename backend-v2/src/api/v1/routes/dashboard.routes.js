/**
 * Dashboard Routes
 * API endpoints for dashboard metrics
 */

const express = require('express');
const { DashboardController } = require('../controllers');

function createDashboardRoutes(db) {
  const router = express.Router();
  const controller = new DashboardController(db);

  // Bind controller methods to router
  router.get('/metrics', controller.getMetrics.bind(controller));
  router.get('/workflow-funnel', controller.getWorkflowFunnel.bind(controller));

  return router;
}

module.exports = { createDashboardRoutes };
