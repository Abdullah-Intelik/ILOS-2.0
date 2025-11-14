/**
 * Repository Index
 * Export all repositories
 */

const { BaseRepository } = require('./base.repository');
const { ApplicationRepository } = require('./application.repository');
const { PartyRepository } = require('./party.repository');
const { ProductRepository } = require('./product.repository');

module.exports = {
  BaseRepository,
  ApplicationRepository,
  PartyRepository,
  ProductRepository
};

