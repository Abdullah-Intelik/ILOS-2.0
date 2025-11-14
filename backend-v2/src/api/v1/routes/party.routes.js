/**
 * Party Routes
 * API endpoints for parties (customers)
 */

const express = require('express');
const { PartyController } = require('../controllers');

function createPartyRoutes(db) {
  const router = express.Router();
  const controller = new PartyController(db);

  // Bind controller methods to router
  router.get('/cnic/:cnic', controller.getByCnic.bind(controller));
  router.get('/:cnic/latest-application', controller.getLatestApplication.bind(controller)); // Smart pre-fill endpoint
  router.post('/', controller.createParty.bind(controller));
  router.patch('/:partyId', controller.updateParty.bind(controller));

  return router;
}

// Legacy endpoints (for frontend compatibility)
function createLegacyPartyRoutes(db) {
  const express = require('express');
  const router = express.Router();
  const controller = new PartyController(db);

  // Legacy customer status endpoints
  router.get('/customer-status/:cnic', controller.getCustomerStatus.bind(controller));
  router.get('/api/getNTB_ETB/:cnic', controller.getNTB_ETB.bind(controller));
  router.get('/cif/:customerId', controller.getCifDetails.bind(controller)); // CIF details endpoint

  return router;
}

module.exports = { createPartyRoutes, createLegacyPartyRoutes };
