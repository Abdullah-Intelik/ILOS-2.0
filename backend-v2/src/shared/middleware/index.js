/**
 * Middleware Index
 * Export all middleware
 */

const { errorHandler, notFoundHandler } = require('./error.middleware');
const { bankMiddleware } = require('./bank.middleware');
const { requestLogger } = require('./logger.middleware');

module.exports = {
  errorHandler,
  notFoundHandler,
  bankMiddleware,
  requestLogger
};

