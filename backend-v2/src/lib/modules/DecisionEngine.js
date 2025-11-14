/**
 * Main Decision Engine
 * Orchestrates all modules and calculates final decision
 */

class DecisionEngine {
    constructor() {
        // Module weights as per specification
        this.moduleWeights = {
            dbr: 0.55,      // DBR 55%
            spu: 0.10,      // SPU 10%
            eamvu: 0.10,    // EAMVU 10%
            income: 0.15,   // Income 15%
            city: 0.05,     // City 5%
            age: 0.05       // Age 5%
        };

        // Initialize modules
        this.modules = {
            spu: new SPUModule(),
            eamvu: new EAMVUModule(),
            city: new CityModule(),
            age: new AgeModule(),
            dbr: new DBRModule(),
            income: new IncomeModule()
        };
    }

    /**
     * Calculate decision for an application
     * @param {Object} applicationData - Application data
     * @returns {Object} Decision result with scores and final decision
     */
    calculateDecision(applicationData) {
        // Calculate all module scores
        const dbrResult = this.modules.dbr.calculate(applicationData, applicationData.dbrData);
        const spuResult = this.modules.spu.calculate(applicationData);
        const eamvuResult = this.modules.eamvu.calculate(applicationData);
        const ageResult = this.modules.age.calculate(applicationData);
        const cityResult = this.modules.city.calculate(applicationData);
        const incomeResult = this.modules.income.calculate(applicationData);

        // Check critical conditions first - AUTOMATIC FAIL
        let decision, actionRequired, riskLevel;

        // 1. Age Hard Stop
        if (ageResult.hardStop) {
            decision = 'FAIL';
            actionRequired = ageResult.hardStop;
            riskLevel = 'VERY_HIGH';
        }
        // 2. DBR exceeds threshold = FAIL
        else if (!dbrResult.isWithinThreshold) {
            decision = 'FAIL';
            actionRequired = `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}% - AUTOMATIC FAIL`;
            riskLevel = 'VERY_HIGH';
        }
        // 3. SPU Critical Hit = FAIL
        else if (spuResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'SPU critical hit detected - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // 4. City Annexure A / Unapproved = FAIL
        else if (cityResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'Unapproved city/Annexure A area - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // If no critical failures, calculate weighted score
        else {
            const finalScore = Math.round(
                (dbrResult.raw * this.moduleWeights.dbr) +
                (spuResult.raw * this.moduleWeights.spu) +
                (eamvuResult.raw * this.moduleWeights.eamvu) +
                (ageResult.raw * this.moduleWeights.age) +
                (cityResult.raw * this.moduleWeights.city) +
                (incomeResult.raw * this.moduleWeights.income)
            );

            if (finalScore >= 90) {
                decision = 'PASS';
                actionRequired = 'None';
                riskLevel = 'VERY_LOW';
            } else if (finalScore >= 80) {
                decision = 'PASS';
                actionRequired = 'Basic conditions';
                riskLevel = 'LOW';
            } else if (finalScore >= 70) {
                decision = 'CONDITIONAL PASS';
                actionRequired = 'Additional conditions';
                riskLevel = 'MEDIUM';
            } else if (finalScore >= 60) {
                decision = 'CONDITIONAL PASS';
                actionRequired = 'Manual review';
                riskLevel = 'HIGH';
            } else {
                decision = 'FAIL';
                actionRequired = 'Low score - Decline application';
                riskLevel = 'VERY_HIGH';
            }
        }

        // Calculate final score (even for failed cases, for reporting)
        const finalScore = Math.round(
            (dbrResult.raw * this.moduleWeights.dbr) +
            (spuResult.raw * this.moduleWeights.spu) +
            (eamvuResult.raw * this.moduleWeights.eamvu) +
            (ageResult.raw * this.moduleWeights.age) +
            (cityResult.raw * this.moduleWeights.city) +
            (incomeResult.raw * this.moduleWeights.income)
        );

        return {
            applicationId: applicationData.los_id || applicationData.id,
            customerName: applicationData.full_name || `${applicationData.first_name} ${applicationData.last_name}`,
            cnic: applicationData.cnic,
            finalScore,
            decision,
            actionRequired,
            riskLevel,
            dbrPercentage: dbrResult.dbrPercentage,
            applicationData: applicationData,
            moduleScores: {
                dbr: { score: dbrResult.raw, weight: this.moduleWeights.dbr, weightedScore: dbrResult.raw * this.moduleWeights.dbr, notes: dbrResult.notes },
                spu: { score: spuResult.raw, weight: this.moduleWeights.spu, weightedScore: spuResult.raw * this.moduleWeights.spu, notes: spuResult.notes },
                eamvu: { score: eamvuResult.raw, weight: this.moduleWeights.eamvu, weightedScore: eamvuResult.raw * this.moduleWeights.eamvu, notes: eamvuResult.notes },
                age: { score: ageResult.raw, weight: this.moduleWeights.age, weightedScore: ageResult.raw * this.moduleWeights.age, notes: ageResult.notes },
                city: { score: cityResult.raw, weight: this.moduleWeights.city, weightedScore: cityResult.raw * this.moduleWeights.city, notes: cityResult.notes },
                income: { score: incomeResult.raw, weight: this.moduleWeights.income, weightedScore: incomeResult.raw * this.moduleWeights.income, notes: incomeResult.notes }
            }
        };
    }
}

// Export for use in other modules
export default DecisionEngine;
