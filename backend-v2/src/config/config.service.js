/**
 * Configuration Service
 * Loads and merges configuration from multiple sources:
 * 1. default.json (base configuration)
 * 2. {bank_code}.json (bank-specific overrides)
 * 3. Environment variables (highest priority)
 */

const fs = require('fs');
const path = require('path');

class ConfigService {
  constructor() {
    this.config = null;
    this.bankCode = process.env.BANK_CODE || 'demo';
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  /**
   * Load configuration from files and merge with env vars
   */
  loadConfig() {
    try {
      const configDir = path.join(__dirname, '../../config');

      // 1. Load default configuration
      const defaultConfigPath = path.join(configDir, 'default.json');
      const defaultConfig = this.loadJSON(defaultConfigPath);

      // 2. Load bank-specific configuration
      const bankConfigPath = path.join(configDir, `${this.bankCode}.json`);
      const bankConfig = this.loadJSON(bankConfigPath) || {};

      // 3. Merge configurations (bank config overrides default)
      this.config = this.deepMerge(defaultConfig, bankConfig);

      // 4. Apply environment variable overrides
      this.applyEnvOverrides();

      console.log(`✅ Configuration loaded for bank: ${this.bankCode}`);
    } catch (error) {
      console.error('❌ Error loading configuration:', error.message);
      throw error;
    }
  }

  /**
   * Load JSON file safely
   */
  loadJSON(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading JSON from ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is an object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Apply environment variable overrides
   */
  applyEnvOverrides() {
    // Feature flags from env
    if (process.env.FEATURE_INSTANT_LOAN !== undefined) {
      this.config.features.instantLoan.enabled = process.env.FEATURE_INSTANT_LOAN === 'true';
    }
    if (process.env.FEATURE_MOBILE_APP !== undefined) {
      this.config.features.mobileApp.enabled = process.env.FEATURE_MOBILE_APP === 'true';
    }
    if (process.env.FEATURE_AUTOMATION !== undefined) {
      this.config.features.automation.enabled = process.env.FEATURE_AUTOMATION === 'true';
    }

    // Database overrides (if provided)
    if (process.env.DB_NAME) {
      this.config.database = this.config.database || {};
      this.config.database.name = process.env.DB_NAME;
    }
  }

  /**
   * Get configuration value by path
   * Example: get('features.instantLoan.enabled')
   */
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Get bank information
   */
  getBank() {
    return this.config.bank;
  }

  /**
   * Get branding configuration
   */
  getBranding() {
    return this.config.branding;
  }

  /**
   * Get all products
   */
  getProducts() {
    return this.config.products || [];
  }

  /**
   * Get specific product by code
   */
  getProduct(productCode) {
    const products = this.getProducts();
    return products.find(p => p.code === productCode);
  }

  /**
   * Get active products only
   */
  getActiveProducts() {
    return this.getProducts().filter(p => p.active === true);
  }

  /**
   * Get workflow configuration
   */
  getWorkflow() {
    return this.config.workflow;
  }

  /**
   * Get instant loan workflow
   */
  getInstantLoanWorkflow() {
    return this.config.workflow?.instantLoanWorkflow;
  }

  /**
   * Get limits configuration
   */
  getLimits() {
    return this.config.limits;
  }

  /**
   * Get security configuration
   */
  getSecurity() {
    return this.config.security;
  }

  /**
   * Get compliance configuration
   */
  getCompliance() {
    return this.config.compliance;
  }

  /**
   * Get notification configuration
   */
  getNotifications() {
    return this.config.notifications;
  }

  /**
   * Get complete configuration (use cautiously)
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featurePath) {
    const feature = this.get(`features.${featurePath}`);
    if (typeof feature === 'object' && 'enabled' in feature) {
      return feature.enabled === true;
    }
    return false;
  }

  /**
   * Reload configuration (useful for testing or hot-reload)
   */
  reload() {
    this.loadConfig();
  }
}

// Singleton instance
let instance = null;

/**
 * Get ConfigService instance
 */
function getConfigService() {
  if (!instance) {
    instance = new ConfigService();
  }
  return instance;
}

module.exports = {
  ConfigService,
  getConfigService
};

