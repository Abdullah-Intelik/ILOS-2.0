/**
 * Product Repository
 * Data access layer for products
 */

class ProductRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all products with optional filters
   */
  async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE is_deleted = false';
    const params = [];

    if (filters.is_active !== undefined) {
      params.push(filters.is_active);
      query += ` AND is_active = $${params.length}`;
    }

    if (filters.product_type) {
      params.push(filters.product_type);
      query += ` AND product_type = $${params.length}`;
    }

    if (filters.is_instant_eligible !== undefined) {
      params.push(filters.is_instant_eligible);
      query += ` AND is_instant_eligible = $${params.length}`;
    }

    if (filters.bank_code) {
      params.push(filters.bank_code);
      query += ` AND bank_code = $${params.length}`;
    }

    query += ' ORDER BY product_name';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Find product by code
   */
  async findByCode(productCode) {
    const result = await this.db.query(
      'SELECT * FROM products WHERE product_code = $1 AND is_deleted = false',
      [productCode]
    );
    return result.rows[0];
  }

  /**
   * Find product by ID
   */
  async findById(productId) {
    const result = await this.db.query(
      'SELECT * FROM products WHERE product_id = $1 AND is_deleted = false',
      [productId]
    );
    return result.rows[0];
  }

  /**
   * Find active products for a specific customer type
   */
  async findForCustomerType(customerType, productType = null) {
    let query = `
      SELECT * FROM products 
      WHERE is_active = true 
      AND is_deleted = false
      AND $1 = ANY(allowed_customer_types)
    `;
    const params = [customerType];

    if (productType) {
      params.push(productType);
      query += ` AND product_type = $${params.length}`;
    }

    query += ' ORDER BY product_name';

    const result = await this.db.query(query, params);
    return result.rows;
  }
}

module.exports = { ProductRepository };

