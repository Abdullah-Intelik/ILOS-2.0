/**
 * Error Handler Middleware
 * Centralized error handling
 */

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Default error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err
    } : undefined
  };

  // Determine status code
  let statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.message = 'Validation error';
    errorResponse.details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorResponse.message = 'Authentication required';
  } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
    statusCode = 404;
  } else if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    errorResponse.message = 'Duplicate entry';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    errorResponse.message = 'Invalid reference';
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

