/**
 * Feature Flags Service
 * Dynamic feature flag management with database storage
 */

const { getConfigService } = require('./config.service');

class FeatureFlagService {
  constructor(db = null) {
    this.db = db;
    this.configService = getConfigService();
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if a feature is enabled
   * Checks in order: Database > Config File > Default (false)
   */
  async isEnabled(featureName, context = {}) {
    // Check cache first
    const cached = this.getFromCache(featureName);
    if (cached !== null) {
      return cached;
    }

    try {
      // 1. Check database (allows runtime changes)
      if (this.db) {
        const dbValue = await this.getFromDatabase(featureName, context);
        if (dbValue !== null) {
          this.setCache(featureName, dbValue);
          return dbValue;
        }
      }

      // 2. Check config file
      const configValue = this.configService.isFeatureEnabled(featureName);
      this.setCache(featureName, configValue);
      return configValue;

    } catch (error) {
      console.error(`Error checking feature flag ${featureName}:`, error);
      // Fallback to config file
      return this.configService.isFeatureEnabled(featureName);
    }
  }

  /**
   * Get feature flag from database
   */
  async getFromDatabase(featureName, context) {
    if (!this.db) return null;

    try {
      const bankCode = context.bankCode || this.configService.getBank().code;
      
      const result = await this.db.query(
        `SELECT config_value, config_type 
         FROM system_config 
         WHERE config_key = $1 
           AND bank_code IN ($2, 'default')
         ORDER BY bank_code DESC 
         LIMIT 1`,
        [`feature.${featureName}`, bankCode]
      );

      if (result.rows.length > 0) {
        const { config_value, config_type } = result.rows[0];
        return this.parseValue(config_value, config_type);
      }

      return null;
    } catch (error) {
      console.error('Error fetching from database:', error);
      return null;
    }
  }

  /**
   * Set feature flag in database
   */
  async setFeatureFlag(featureName, value, description = '', bankCode = null) {
    if (!this.db) {
      throw new Error('Database connection required');
    }

    const bank = bankCode || this.configService.getBank().code;
    const configType = typeof value;

    try {
      await this.db.query(
        `INSERT INTO system_config (config_key, config_value, config_type, bank_code, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (config_key) 
         DO UPDATE SET 
           config_value = $2,
           config_type = $3,
           updated_at = CURRENT_TIMESTAMP`,
        [`feature.${featureName}`, String(value), configType, bank, description]
      );

      // Clear cache
      this.cache.delete(featureName);

      console.log(`✅ Feature flag "${featureName}" set to ${value} for ${bank}`);
      return true;
    } catch (error) {
      console.error(`Error setting feature flag ${featureName}:`, error);
      throw error;
    }
  }

  /**
   * Get feature configuration (not just boolean)
   */
  async getFeatureConfig(featureName) {
    const feature = this.configService.get(`features.${featureName}`);
    
    if (typeof feature === 'object') {
      // Check if enabled flag exists in database
      if (this.db) {
        const enabledInDB = await this.getFromDatabase(featureName);
        if (enabledInDB !== null) {
          return { ...feature, enabled: enabledInDB };
        }
      }
      return feature;
    }

    return { enabled: false };
  }

  /**
   * Get all feature flags
   */
  getAllFeatures() {
    const features = this.configService.get('features', {});
    const result = {};

    for (const [key, value] of Object.entries(features)) {
      if (typeof value === 'object' && 'enabled' in value) {
        result[key] = value.enabled;
      }
    }

    return result;
  }

  /**
   * Parse config value based on type
   */
  parseValue(value, type) {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === '1' || value === 1;
      case 'number':
        return Number(value);
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.value;
    }
    return null;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Middleware for Express to inject feature flags
   */
  expressMiddleware() {
    return async (req, res, next) => {
      req.features = {
        isEnabled: (featureName) => this.isEnabled(featureName),
        getConfig: (featureName) => this.getFeatureConfig(featureName)
      };
      next();
    };
  }
}

module.exports = { FeatureFlagService };

