/**
 * Personal Loan Decision Engine
 * Orchestrates all modules for personal loan decisions with tenure-based logic
 */

import SPUModule from './SPU';
import EAMVUModule from './EAMVU';
import CityModule from './City';
import AgeModule from './Age';
import DBRModule from './DBR';
import IncomeModule from './Income';
import LoanAffordabilityModule from './LoanAffordability';
import TenureModule from './Tenure';

export default class PersonalLoanDecisionEngine {
    public moduleWeights: { [key: string]: number };
    public modules: {
        spu: SPUModule;
        eamvu: EAMVUModule;
        city: CityModule;
        age: AgeModule;
        dbr: DBRModule;
        income: IncomeModule;
        loanAffordability: LoanAffordabilityModule;
        tenure: TenureModule;
    };

    constructor() {
        // Personal Loan specific module weights
        this.moduleWeights = {
            dbr: 0.40,              // DBR 40% (reduced from 55%)
            income: 0.20,           // Income 20% (increased from 15%)
            loanAffordability: 0.15, // Loan Affordability 15% (NEW)
            spu: 0.10,              // SPU 10% (same)
            eamvu: 0.10,            // EAMVU 10% (same)
            tenure: 0.03,            // Tenure 3% (NEW)
            city: 0.02,             // City 2% (reduced from 5%)
            age: 0.00               // Age 0% (reduced from 5% - handled by tenure)
        };

        // Initialize modules
        this.modules = {
            spu: new SPUModule(),
            eamvu: new EAMVUModule(),
            city: new CityModule(),
            age: new AgeModule(),
            dbr: new DBRModule(),
            income: new IncomeModule(),
            loanAffordability: new LoanAffordabilityModule(),
            tenure: new TenureModule()
        };
    }

    /**
     * Calculate decision for a personal loan application
     * @param {Object} applicationData - Application data
     * @returns {Object} Decision result with scores and final decision
     */
    calculateDecision(applicationData: any): {
        applicationId: string | number;
        customerName: string;
        cnic: string;
        finalScore: number;
        decision: string;
        actionRequired: string;
        riskLevel: string;
        dbrPercentage: number;
        emiAmount: number;
        applicationData: any;
        moduleScores: { [key: string]: any };
    } {
        console.log('='.repeat(100));
        console.log('🎯 PERSONAL LOAN DECISION CALCULATION STARTED');
        console.log('='.repeat(100));
        console.log('📥 INPUT APPLICATION DATA:');
        console.log(JSON.stringify(applicationData, null, 2));
        console.log('='.repeat(100));

        // Calculate all module scores
        const dbrResult = this.modules.dbr.calculate(applicationData, applicationData.dbrData);
        const spuResult = this.modules.spu.calculate(applicationData);
        const eamvuResult = this.modules.eamvu.calculate(applicationData);
        const ageResult = this.modules.age.calculate(applicationData);
        const cityResult = this.modules.city.calculate(applicationData);
        const incomeResult = this.modules.income.calculate(applicationData);
        const loanAffordabilityResult = this.modules.loanAffordability.calculate(applicationData);
        const tenureResult = this.modules.tenure.calculate(applicationData);

        // Check critical conditions first - AUTOMATIC FAIL
        let decision: string, actionRequired: string, riskLevel: string;

        // 1. Age Hard Stop (stricter for personal loans)
        if (ageResult.hardStop) {
            decision = 'FAIL';
            actionRequired = ageResult.hardStop;
            riskLevel = 'VERY_HIGH';
        }
        // 2. Tenure Validation Fail
        else if (tenureResult.flags.includes('INVALID_TENURE')) {
            decision = 'FAIL';
            actionRequired = `Tenure ${tenureResult.proposedTenure} months exceeds maximum allowed`;
            riskLevel = 'VERY_HIGH';
        }
        // 3. DBR exceeds threshold = FAIL (stricter for personal loans)
        else if (!dbrResult.isWithinThreshold || dbrResult.dbrPercentage > 35) {
            decision = 'FAIL';
            actionRequired = `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold 35% - AUTOMATIC FAIL`;
            riskLevel = 'VERY_HIGH';
        }
        // 4. SPU Critical Hit = FAIL
        else if (spuResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'SPU critical hit detected - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // 5. City Annexure A / Unapproved = FAIL
        else if (cityResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'Unapproved city/Annexure A area - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // 6. Loan Affordability Critical Fail
        else if (loanAffordabilityResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'Loan affordability critical fail - EMI exceeds 50% of income';
            riskLevel = 'VERY_HIGH';
        }
        // If no critical failures, calculate weighted score
        else {
            const finalScore = Math.round(
                (dbrResult.raw * this.moduleWeights.dbr) +
                (incomeResult.raw * this.moduleWeights.income) +
                (loanAffordabilityResult.raw * this.moduleWeights.loanAffordability) +
                (spuResult.raw * this.moduleWeights.spu) +
                (eamvuResult.raw * this.moduleWeights.eamvu) +
                (tenureResult.raw * this.moduleWeights.tenure) +
                (cityResult.raw * this.moduleWeights.city) +
                (ageResult.raw * this.moduleWeights.age)
            );

            // Personal Loan specific thresholds (stricter than credit cards)
            if (finalScore >= 85) {
                decision = 'PASS';
                actionRequired = 'None';
                riskLevel = 'VERY_LOW';
            } else if (finalScore >= 75) {
                decision = 'PASS';
                actionRequired = 'Basic conditions';
                riskLevel = 'LOW';
            } else if (finalScore >= 65) {
                decision = 'CONDITIONAL PASS';
                actionRequired = 'Additional conditions';
                riskLevel = 'MEDIUM';
            } else if (finalScore >= 55) {
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
            (incomeResult.raw * this.moduleWeights.income) +
            (loanAffordabilityResult.raw * this.moduleWeights.loanAffordability) +
            (spuResult.raw * this.moduleWeights.spu) +
            (eamvuResult.raw * this.moduleWeights.eamvu) +
            (tenureResult.raw * this.moduleWeights.tenure) +
            (cityResult.raw * this.moduleWeights.city) +
            (ageResult.raw * this.moduleWeights.age)
        );

        console.log('📤 FINAL RESULTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • Decision:', decision);
        console.log('  • Action Required:', actionRequired);
        console.log('  • Risk Level:', riskLevel);
        console.log('  • DBR Percentage:', dbrResult.dbrPercentage.toFixed(2) + '%');
        console.log('  • EMI Amount:', loanAffordabilityResult.emi);
        console.log('='.repeat(100));

        return {
            applicationId: applicationData.los_id || applicationData.id,
            customerName: applicationData.full_name || `${applicationData.first_name} ${applicationData.last_name}`,
            cnic: applicationData.cnic,
            finalScore,
            decision,
            actionRequired,
            riskLevel,
            dbrPercentage: dbrResult.dbrPercentage,
            emiAmount: loanAffordabilityResult.emi,
            applicationData: applicationData,
            moduleScores: {
                dbr: { 
                    score: dbrResult.raw, 
                    weight: this.moduleWeights.dbr, 
                    weightedScore: dbrResult.raw * this.moduleWeights.dbr, 
                    notes: dbrResult.notes 
                },
                income: { 
                    score: incomeResult.raw, 
                    weight: this.moduleWeights.income, 
                    weightedScore: incomeResult.raw * this.moduleWeights.income, 
                    notes: incomeResult.notes 
                },
                loanAffordability: { 
                    score: loanAffordabilityResult.raw, 
                    weight: this.moduleWeights.loanAffordability, 
                    weightedScore: loanAffordabilityResult.raw * this.moduleWeights.loanAffordability, 
                    notes: loanAffordabilityResult.notes 
                },
                spu: { 
                    score: spuResult.raw, 
                    weight: this.moduleWeights.spu, 
                    weightedScore: spuResult.raw * this.moduleWeights.spu, 
                    notes: spuResult.notes 
                },
                eamvu: { 
                    score: eamvuResult.raw, 
                    weight: this.moduleWeights.eamvu, 
                    weightedScore: eamvuResult.raw * this.moduleWeights.eamvu, 
                    notes: eamvuResult.notes 
                },
                tenure: { 
                    score: tenureResult.raw, 
                    weight: this.moduleWeights.tenure, 
                    weightedScore: tenureResult.raw * this.moduleWeights.tenure, 
                    notes: tenureResult.notes 
                },
                city: { 
                    score: cityResult.raw, 
                    weight: this.moduleWeights.city, 
                    weightedScore: cityResult.raw * this.moduleWeights.city, 
                    notes: cityResult.notes 
                },
                age: { 
                    score: ageResult.raw, 
                    weight: this.moduleWeights.age, 
                    weightedScore: ageResult.raw * this.moduleWeights.age, 
                    notes: ageResult.notes 
                }
            }
        };
    }
}

