/**
 * Express App Setup
 * Configure Express application
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { registerV1Routes } = require('./api/v1/routes');
const { errorHandler, notFoundHandler, bankMiddleware, requestLogger } = require('./shared/middleware');
const { getConfigService } = require('./config/config.service');
const { FeatureFlagService } = require('./config/feature-flags.service');

function createApp(db) {
  const app = express();
  const configService = getConfigService();
  const featureFlagService = new FeatureFlagService(db);

  // ===== Basic Middleware =====
  app.use(helmet()); // Security headers
  app.use(compression()); // Response compression
  
  // CORS Configuration - Allow frontend connection
  app.use(cors({
    origin: [
      'http://localhost:3000',      // Next.js frontend
      'http://localhost:3001',      // Alternative port
      'http://127.0.0.1:3000',
      process.env.CORS_ORIGIN || '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===== Custom Middleware =====
  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger); // Log all requests (skip in tests)
  }
  app.use(bankMiddleware); // Inject bank context

  // Feature flags middleware
  app.use(featureFlagService.expressMiddleware());

  // ===== Root Endpoint =====
  app.get('/', (req, res) => {
    const bank = configService.getBank();
    res.json({
      success: true,
      message: 'ILOS V2.0 API',
      version: '2.0.0',
      bank: {
        code: bank.code,
        name: bank.name
      },
      endpoints: {
        health: '/api/v1/health',
        applications: '/api/v1/applications',
        parties: '/api/v1/parties',
        dashboard: '/api/v1/dashboard'
      },
      documentation: '/api/docs',
      timestamp: new Date().toISOString()
    });
  });

  // ===== API Routes =====
  registerV1Routes(app, db);

  // ===== Error Handling =====
  app.use(notFoundHandler); // 404 handler
  app.use(errorHandler); // Global error handler

  return app;
}

module.exports = { createApp };
