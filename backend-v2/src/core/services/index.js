/**
 * Services Index
 * Export all services
 */

const { ApplicationService } = require('./application.service');
const { PartyService } = require('./party.service');
const { ProductService } = require('./product.service');

module.exports = {
  ApplicationService,
  PartyService,
  ProductService
};

