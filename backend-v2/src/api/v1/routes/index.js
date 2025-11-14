/**
 * Routes Index
 * Register all API v1 routes
 */

const { createApplicationRoutes } = require('./application.routes');
const { createPartyRoutes, createLegacyPartyRoutes } = require('./party.routes');
const { createDashboardRoutes } = require('./dashboard.routes');
const { createProductRoutes } = require('./product.routes');
const { createLegacyDocumentRoutes } = require('../../legacy/document.routes');
const { createDecisionEngineRoutes } = require('../../legacy/decision-engine.routes');
const { createOcrProxyRoutes } = require('./ocr-proxy.routes');

function registerV1Routes(app, db) {
  const API_PREFIX = '/api/v1';

  // Health check
  app.get(`${API_PREFIX}/health`, (req, res) => {
    res.json({
      success: true,
      message: 'ILOS V2.0 API is running',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      bank: req.bankCode || 'default'
    });
  });

  // Register V1 API routes
  app.use(`${API_PREFIX}/applications`, createApplicationRoutes(db));
  app.use(`${API_PREFIX}/parties`, createPartyRoutes(db));
  app.use(`${API_PREFIX}/products`, createProductRoutes(db));
  app.use(`${API_PREFIX}/dashboard`, createDashboardRoutes(db));
  app.use(`${API_PREFIX}/ocr`, createOcrProxyRoutes()); // OCR proxy routes with CORS support

  // Register legacy routes (no /api/v1 prefix for backward compatibility)
  app.use('/', createLegacyPartyRoutes(db));
  app.use('/api/decision', createLegacyDocumentRoutes()); // Legacy document upload endpoints
  app.use('/api/decision', createDecisionEngineRoutes()); // Decision engine calculation endpoints

  // Serve generated PDFs
  app.get(`${API_PREFIX}/documents/pdf/:losId`, async (req, res) => {
    try {
      const { losId } = req.params;
      const path = require('path');
      const fs = require('fs');
      
      const pdfPath = path.join(__dirname, `../../../documents/application_forms/LOS-${losId}_Application.pdf`);
      
      if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="LOS-${losId}_Application.pdf"`);
        fs.createReadStream(pdfPath).pipe(res);
      } else {
        res.status(404).json({
          success: false,
          error: 'PDF not found'
        });
      }
    } catch (error) {
      console.error('Error serving PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to serve PDF'
      });
    }
  });

  console.log('✅ API v1 routes registered');
  console.log('✅ Product catalog routes registered');
  console.log('✅ OCR proxy routes registered (CORS-enabled)');
  console.log('✅ Legacy customer-status routes registered');
  console.log('✅ Legacy document upload routes registered');
  console.log('✅ Decision engine routes registered (calculate + upload-ecib)');
  console.log('✅ PDF serving endpoint registered');
}

module.exports = { registerV1Routes };

