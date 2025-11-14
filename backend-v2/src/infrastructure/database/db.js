/**
 * Database Connection Pool
 * PostgreSQL connection management
 */

const { Pool } = require('pg');
const { getConfigService } = require('../../config/config.service');

class Database {
  constructor() {
    this.pool = null;
    this.cbsPool = null;  // CBS database connection
    this.configService = getConfigService();
  }

  /**
   * Initialize database connection pool
   */
  async connect() {
    try {
      // ILOS Database
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || `ilos_${this.configService.getBank().code}`,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        // ✅ Set Pakistan timezone for all database operations
        options: '-c timezone=Asia/Karachi',
      };

      this.pool = new Pool(dbConfig);

      // CBS Database (Core Banking System)
      // Use connection string approach like old backend
      const cbsConnectionString = process.env.CBS_DATABASE_URL || 
                                  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'faez'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/cbs_db`;
      
      const cbsConfig = {
        connectionString: cbsConnectionString,
        max: parseInt(process.env.CBS_DB_POOL_MAX || '5'),
        min: parseInt(process.env.CBS_DB_POOL_MIN || '1'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: false,
        // ✅ Set Pakistan timezone for CBS database operations
        options: '-c timezone=Asia/Karachi'
      };

      this.cbsPool = new Pool(cbsConfig);

      // Test ILOS connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      console.log(`✅ Connected to database: ${dbConfig.database}`);
      console.log(`   Server time: ${result.rows[0].now}`);

      // Test CBS connection
      try {
        const cbsClient = await this.cbsPool.connect();
        await cbsClient.query('SELECT NOW()');
        cbsClient.release();
        console.log(`✅ Connected to CBS database: ${cbsConfig.database}`);
      } catch (cbsError) {
        console.warn(`⚠️ CBS database connection failed: ${cbsError.message}`);
        console.warn(`   Customer data will not be available`);
      }

      // Setup error handlers
      this.pool.on('error', (err) => {
        console.error('❌ Unexpected database error:', err);
      });

      this.cbsPool.on('error', (err) => {
        console.error('❌ Unexpected CBS database error:', err);
      });

      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Get database pool
   */
  getPool() {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Execute a query on ILOS database
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.DEBUG === 'true') {
        console.log('🔍 Query executed:', {
          text: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: result.rowCount
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute a query on CBS database
   */
  async queryCBS(text, params) {
    if (!this.cbsPool) {
      throw new Error('CBS database not connected');
    }

    const start = Date.now();
    try {
      const result = await this.cbsPool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.DEBUG === 'true') {
        console.log('🔍 CBS Query executed:', {
          text: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: result.rowCount
        });
      }

      return result;
    } catch (error) {
      console.error('❌ CBS database query error:', error.message);
      throw error;
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  async getClient() {
    return await this.pool.connect();
  }

  /**
   * Close all connections
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connections closed');
    }
  }

  /**
   * Execute within a transaction
   */
  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get Database instance
 */
function getDatabase() {
  if (!instance) {
    instance = new Database();
  }
  return instance;
}

module.exports = {
  Database,
  getDatabase
};

