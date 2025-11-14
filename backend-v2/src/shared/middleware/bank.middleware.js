/**
 * Bank Middleware
 * Inject bank code and configuration into request
 */

const { getConfigService } = require('../../config/config.service');

function bankMiddleware(req, res, next) {
  const configService = getConfigService();
  
  // Inject bank information into request
  req.bankCode = configService.getBank().code;
  req.bankName = configService.getBank().name;
  req.config = configService;

  next();
}

module.exports = { bankMiddleware };

