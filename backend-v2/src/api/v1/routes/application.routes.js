/**
 * Application Routes
 * API endpoints for applications
 */

const express = require('express');
const { ApplicationController } = require('../controllers');

function createApplicationRoutes(db) {
  const router = express.Router();
  const controller = new ApplicationController(db);

  // Bind controller methods to router
  router.get('/mobile-submissions', controller.getMobileSubmissions.bind(controller)); // Mobile app submissions for PB
  router.get('/department/:department/paginated', controller.getByDepartment.bind(controller));
  router.get('/form/:losId', controller.getApplicationForm.bind(controller)); // Legacy endpoint
  router.get('/:losId', controller.getApplication.bind(controller));
  router.get('/:losId/summary', controller.getApplicationSummary.bind(controller));
  router.get('/:losId/references', controller.getReferences.bind(controller)); // Get application references
  router.post('/', controller.createApplication.bind(controller));
  router.post('/:losId/submit', controller.submitApplication.bind(controller));
  router.patch('/:losId/status', controller.updateStatus.bind(controller));
  router.get('/party/:partyId', controller.getByParty.bind(controller));
  router.get('/status/:status', controller.getByStatus.bind(controller));
  router.get('/assigned', controller.getAssignedApplications.bind(controller));
  
  // SPU, Comments, and EAVMU endpoints
  router.get('/spu-checklist/:losId', controller.getSPUChecklist.bind(controller));
  router.get('/:losId/comments', controller.getComments.bind(controller));
  router.post('/:losId/comments', controller.addComment.bind(controller));
  router.get('/:losId/eavmu-verification', controller.getEAVMUVerification.bind(controller));
  router.post('/:losId/eavmu-verification', controller.updateEAVMUVerification.bind(controller));

  return router;
}

module.exports = { createApplicationRoutes };

