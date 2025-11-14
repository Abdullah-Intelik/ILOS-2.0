/**
 * Controllers Index
 * Export all controllers
 */

const { ApplicationController } = require('./application.controller');
const { PartyController } = require('./party.controller');
const { DashboardController } = require('./dashboard.controller');
const { ProductController } = require('./product.controller');

module.exports = {
  ApplicationController,
  PartyController,
  DashboardController,
  ProductController
};

