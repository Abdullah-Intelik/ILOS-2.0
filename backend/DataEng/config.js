// Configuration file for Data Engine Server
const config = {
    // API Base URLs
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    
    // Timeout settings (in milliseconds)
    fetchTimeout: parseInt(process.env.FETCH_TIMEOUT) || 10000,
    
    // Fallback settings
    enableFallback: process.env.ENABLE_FALLBACK !== 'false',
    
    // Default values for fallback
    defaults: {
        cnic: '3520111112221',
        annualRate: 14.6,
        maxRetries: 3
    }
};

module.exports = config; 