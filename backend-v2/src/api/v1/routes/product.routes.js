/**
 * Product Routes
 * API endpoints for product catalog
 */

const express = require('express');
const { ProductController } = require('../controllers');

function createProductRoutes(db) {
  const router = express.Router();
  const controller = new ProductController(db);

  // GET /api/v1/products - Get all products
  router.get('/', controller.getAllProducts.bind(controller));

  // POST /api/v1/products/validate - Validate product eligibility
  router.post('/validate', controller.validateEligibility.bind(controller));

  // GET /api/v1/products/:productCode - Get product by code
  router.get('/:productCode', controller.getProductByCode.bind(controller));

  return router;
}

module.exports = { createProductRoutes };

