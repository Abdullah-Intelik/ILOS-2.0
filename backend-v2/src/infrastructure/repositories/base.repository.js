/**
 * Base Repository
 * Generic CRUD operations for all repositories
 */

class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Find by ID
   */
  async findById(id, idColumn = 'id') {
    try {
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} WHERE ${idColumn} = $1 LIMIT 1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Find all
   */
  async findAll(options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', orderDir = 'DESC' } = options;
      
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} 
         ORDER BY ${orderBy} ${orderDir} 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find with conditions
   */
  async find(conditions = {}, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'created_at', orderDir = 'DESC' } = options;
      
      // Build WHERE clause
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(conditions)) {
        whereClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const query = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy} ${orderDir}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      values.push(limit, offset);
      
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error(`Error finding ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find one with conditions
   */
  async findOne(conditions = {}) {
    try {
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(conditions)) {
        whereClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} ${whereClause} LIMIT 1`,
        values
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding one ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create new record
   */
  async create(data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`);

      const query = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update record
   */
  async update(id, data, idColumn = 'id') {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE ${idColumn} = $${columns.length + 1}
        RETURNING *
      `;

      values.push(id);
      const result = await this.db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete record (soft delete if is_deleted column exists)
   */
  async delete(id, idColumn = 'id', soft = true) {
    try {
      if (soft) {
        // Try soft delete first
        const result = await this.db.query(
          `UPDATE ${this.tableName}
           SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
           WHERE ${idColumn} = $1
           RETURNING *`,
          [id]
        );
        
        if (result.rows.length > 0) {
          return result.rows[0];
        }
      }

      // Hard delete
      const result = await this.db.query(
        `DELETE FROM ${this.tableName} WHERE ${idColumn} = $1 RETURNING *`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(conditions = {}) {
    try {
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(conditions)) {
        whereClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const result = await this.db.query(
        `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`,
        values
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Check if exists
   */
  async exists(conditions = {}) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute raw query
   */
  async query(text, params) {
    return await this.db.query(text, params);
  }
}

module.exports = { BaseRepository };

