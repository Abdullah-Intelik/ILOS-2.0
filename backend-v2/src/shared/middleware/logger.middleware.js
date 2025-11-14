/**
 * Logger Middleware
 * Log all HTTP requests
 */

function requestLogger(req, res, next) {
  const start = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    };

    // Color code by status
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red
                       res.statusCode >= 400 ? '\x1b[33m' : // Yellow
                       res.statusCode >= 300 ? '\x1b[36m' : // Cyan
                       '\x1b[32m'; // Green

    console.log(
      `${statusColor}[${log.method}]\x1b[0m ${log.path} - ${log.status} (${log.duration})`
    );
  });

  next();
}

module.exports = { requestLogger };

