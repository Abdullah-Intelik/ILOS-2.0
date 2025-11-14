/**
 * Product Service
 * Business logic for product operations
 */

const { ProductRepository } = require('../../infrastructure/repositories');

class ProductService {
  constructor(db) {
    this.repo = new ProductRepository(db);
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(filters = {}) {
    return this.repo.findAll(filters);
  }

  /**
   * Get product by code
   */
  async getByCode(productCode) {
    const product = await this.repo.findByCode(productCode);
    
    if (!product) {
      throw new Error(`Product not found: ${productCode}`);
    }

    if (!product.is_active) {
      throw new Error(`Product is not active: ${productCode}`);
    }

    return product;
  }

  /**
   * Get product by ID
   */
  async getById(productId) {
    const product = await this.repo.findById(productId);
    
    if (!product) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    return product;
  }

  /**
   * Get products available for a customer type (NTB/ETB)
   */
  async getProductsForCustomer(customerType, productType = null) {
    return this.repo.findForCustomerType(customerType, productType);
  }

  /**
   * Validate product eligibility for application
   */
  async validateProductEligibility(productCode, amount, customerType) {
    const product = await this.getByCode(productCode);

    const errors = [];

    // Check customer type eligibility
    if (!product.allowed_customer_types.includes(customerType)) {
      errors.push(`Product ${productCode} is not available for ${customerType} customers`);
    }

    // Check amount limits
    if (product.min_amount && amount < product.min_amount) {
      errors.push(`Amount ${amount} is below minimum (${product.min_amount})`);
    }

    if (product.max_amount && amount > product.max_amount) {
      errors.push(`Amount ${amount} exceeds maximum (${product.max_amount})`);
    }

    // Check if ETB-only for instant loan
    const isInstantLoan = product.product_config?.etb_only === true;
    if (isInstantLoan && customerType === 'NTB') {
      errors.push('Instant loans are only available for existing customers (ETB)');
    }

    return {
      isValid: errors.length === 0,
      product,
      errors
    };
  }
}

module.exports = { ProductService };

