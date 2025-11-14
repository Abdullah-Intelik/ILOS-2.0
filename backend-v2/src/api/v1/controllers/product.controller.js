/**
 * Product Controller
 * Handles HTTP requests for product catalog operations
 */

const { ProductService } = require('../../../core/services');

class ProductController {
  constructor(db) {
    this.service = new ProductService(db);
  }

  /**
   * GET /api/v1/products
   * Get all active products with optional filters
   */
  async getAllProducts(req, res, next) {
    try {
      const { 
        is_active, 
        product_type, 
        is_instant_eligible,
        customer_type 
      } = req.query;

      let products;

      if (customer_type) {
        // Get products filtered by customer type eligibility
        products = await this.service.getProductsForCustomer(
          customer_type,
          product_type
        );
      } else {
        // Get all products with basic filters
        products = await this.service.getAllProducts({
          is_active: is_active === 'true',
          product_type,
          is_instant_eligible: is_instant_eligible === 'true'
        });
      }

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/products/:productCode
   * Get product details by code
   */
  async getProductByCode(req, res, next) {
    try {
      const { productCode } = req.params;
      const product = await this.service.getByCode(productCode);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not active')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/products/validate
   * Validate product eligibility for an application
   */
  async validateEligibility(req, res, next) {
    try {
      const { product_code, amount, customer_type } = req.body;

      if (!product_code || !amount || !customer_type) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: product_code, amount, customer_type'
        });
      }

      const validation = await this.service.validateProductEligibility(
        product_code,
        parseFloat(amount),
        customer_type
      );

      res.json({
        success: validation.isValid,
        data: {
          product: validation.product,
          isValid: validation.isValid,
          errors: validation.errors
        }
      });
    } catch (error) {
      console.error('Error validating product eligibility:', error);
      next(error);
    }
  }
}

module.exports = { ProductController };

