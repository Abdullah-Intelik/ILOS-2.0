/**
 * Credit Card Decision Engine - Main Entry Point
 * Orchestrates all modules and provides the main interface
 */

class CreditCardDecisionEngine {
    constructor() {
        // Initialize core components
        this.decisionEngine = new DecisionEngine();
        this.dataService = new DataService();
    }

    /**
     * Calculate decision for an application
     * @param {Object} applicationData - Application data
     * @returns {Object} Decision result
     */
    async calculateDecision(applicationData) {
        return await this.decisionEngine.calculateDecision(applicationData);
    }

    /**
     * Process application with full data pipeline
     * @param {number} applicationId - Application ID
     * @returns {Promise<Object>} Decision result
     */
    async processApplication(applicationId) {
        try {
            // Fetch and process application data
            const applicationData = await this.dataService.processApplication(applicationId);
            
            // Calculate decision
            const decision = await this.calculateDecision(applicationData);
            
            return decision;
        } catch (error) {
            console.error('Error processing application:', error);
            throw error;
        }
    }

    /**
     * Get module weights for reference
     * @returns {Object} Module weights
     */
    getModuleWeights() {
        return this.decisionEngine.moduleWeights;
    }

    /**
     * Get individual module instances for direct access
     * @returns {Object} Module instances
     */
    getModules() {
        return this.decisionEngine.modules;
    }
}

// Make class globally available for browser
if (typeof window !== "undefined") {
    window.CreditCardDecisionEngine = CreditCardDecisionEngine;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreditCardDecisionEngine;
}
