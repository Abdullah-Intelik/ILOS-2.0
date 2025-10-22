/**
 * Data Service Module
 * Handles API calls and data fetching
 */

class DataService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000';
        this.dataEngineUrl = 'http://localhost:5000'; // Now using same port
    }

    /**
     * Normalize null values to false
     * @param {any} data - Data to normalize
     * @returns {any} Normalized data
     */
    normalizeApiData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        const normalized = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null) {
                normalized[key] = false;
            } else if (typeof value === 'object' && value !== null) {
                normalized[key] = this.normalizeApiData(value);
            } else {
                normalized[key] = value;
            }
        }
        return normalized;
    }

    /**
     * Fetch application data from API
     * @param {number} applicationId - Application ID
     * @returns {Promise<Object>} Application data
     */
    async fetchApplicationData(applicationId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/applications/${applicationId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let applicationData = await response.json();
            
            // Normalize null values to false
            applicationData = this.normalizeApiData(applicationData);
            
            return applicationData;
        } catch (error) {
            console.error('Error fetching application data:', error);
            throw error;
        }
    }

    /**
     * Fetch DBR data from data engine
     * @param {number} losId - LOS ID
     * @param {string} loanType - Loan type
     * @returns {Promise<Object|null>} DBR data or null if failed
     */
    async fetchDBRFromDataEngine(losId, loanType) {
        try {
            const response = await fetch(`${this.dataEngineUrl}/api/dbr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    losId: losId,
                    loan_type: loanType
                })
            });
            
            if (response.ok) {
                const dbrData = await response.json();
                return dbrData;
            } else {
                console.warn('Failed to fetch DBR from data engine, using fallback calculation');
                return null;
            }
        } catch (error) {
            console.warn('Error fetching DBR from data engine:', error);
            return null;
        }
    }

    /**
     * Process application with full data pipeline
     * @param {number} applicationId - Application ID
     * @returns {Promise<Object>} Complete application data with DBR
     */
    async processApplication(applicationId) {
        try {
            // Fetch application data
            const applicationData = await this.fetchApplicationData(applicationId);
            
            // Fetch DBR from data engine
            const dbrData = await this.fetchDBRFromDataEngine(applicationId, applicationData.loan_type);
            
            // Add DBR data to application data
            if (dbrData) {
                applicationData.dbrData = dbrData;
            }
            
            return applicationData;
        } catch (error) {
            console.error('Error processing application:', error);
            throw error;
        }
    }
}

// Export for use in other modules
export default DataService;
