/**
 * Car Loan Decision Engine
 * Orchestrates all modules for car loan decisions with CC-based tenure logic
 */

import SPUModule from './SPU';
import EAMVUModule from './EAMVU';
import CityModule from './City';
import AgeModule from './Age';
import DBRModule from './DBR';
import IncomeModule from './Income';
import CarLoanAffordabilityModule from './CarLoanAffordability';
import CarTenureModule from './CarTenure';

export default class CarLoanDecisionEngine {
    public moduleWeights: { [key: string]: number };
    public modules: {
        spu: SPUModule;
        eamvu: EAMVUModule;
        city: CityModule;
        age: AgeModule;
        dbr: DBRModule;
        income: IncomeModule;
        carLoanAffordability: CarLoanAffordabilityModule;
        carTenure: CarTenureModule;
    };

    constructor() {
        // Car Loan specific module weights
        this.moduleWeights = {
            dbr: 0.35,              // DBR 35% (reduced from 40%)
            income: 0.20,           // Income 20% (same as personal loan)
            carLoanAffordability: 0.20, // Car Loan Affordability 20% (NEW - higher weight)
            spu: 0.10,              // SPU 10% (same)
            eamvu: 0.10,            // EAMVU 10% (same)
            carTenure: 0.03,        // Car Tenure 3% (NEW)
            city: 0.02,             // City 2% (same)
            age: 0.00               // Age 0% (handled by tenure module)
        };

        // Initialize modules
        this.modules = {
            spu: new SPUModule(),
            eamvu: new EAMVUModule(),
            city: new CityModule(),
            age: new AgeModule(),
            dbr: new DBRModule(),
            income: new IncomeModule(),
            carLoanAffordability: new CarLoanAffordabilityModule(),
            carTenure: new CarTenureModule()
        };
    }

    /**
     * Calculate decision for a car loan application
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
        carPrice: number;
        downPayment: number;
        loanAmount: number;
        applicationData: any;
        moduleScores: { [key: string]: any };
    } {
        console.log('='.repeat(100));
        console.log('🎯 CAR LOAN DECISION CALCULATION STARTED');
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
        const carLoanAffordabilityResult = this.modules.carLoanAffordability.calculate(applicationData);
        const carTenureResult = this.modules.carTenure.calculate(applicationData);

        // Check critical conditions first - AUTOMATIC FAIL
        let decision: string, actionRequired: string, riskLevel: string;

        // 1. Age Hard Stop (stricter for car loans)
        if (ageResult.hardStop) {
            decision = 'FAIL';
            actionRequired = ageResult.hardStop;
            riskLevel = 'VERY_HIGH';
        }
        // 2. Car Tenure Validation Fail
        else if (carTenureResult.flags.includes('INVALID_CAR_TENURE')) {
            decision = 'FAIL';
            actionRequired = `Car tenure ${carTenureResult.proposedTenure} months exceeds maximum allowed for ${carTenureResult.engineCC}cc engine`;
            riskLevel = 'VERY_HIGH';
        }
        // 3. DBR exceeds threshold = FAIL (stricter for car loans)
        else if (!dbrResult.isWithinThreshold || dbrResult.dbrPercentage > 30) {
            decision = 'FAIL';
            actionRequired = `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold 30% - AUTOMATIC FAIL`;
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
        // 6. Car Loan Affordability Critical Fail
        else if (carLoanAffordabilityResult.raw === 0) {
            decision = 'FAIL';
            actionRequired = 'Car loan affordability critical fail - EMI exceeds 45% of income';
            riskLevel = 'VERY_HIGH';
        }
        // If no critical failures, calculate weighted score
        else {
            const finalScore = Math.round(
                (dbrResult.raw * this.moduleWeights.dbr) +
                (incomeResult.raw * this.moduleWeights.income) +
                (carLoanAffordabilityResult.raw * this.moduleWeights.carLoanAffordability) +
                (spuResult.raw * this.moduleWeights.spu) +
                (eamvuResult.raw * this.moduleWeights.eamvu) +
                (carTenureResult.raw * this.moduleWeights.carTenure) +
                (cityResult.raw * this.moduleWeights.city) +
                (ageResult.raw * this.moduleWeights.age)
            );

            // Car Loan specific thresholds (stricter than personal loans)
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
            (incomeResult.raw * this.moduleWeights.income) +
            (carLoanAffordabilityResult.raw * this.moduleWeights.carLoanAffordability) +
            (spuResult.raw * this.moduleWeights.spu) +
            (eamvuResult.raw * this.moduleWeights.eamvu) +
            (carTenureResult.raw * this.moduleWeights.carTenure) +
            (cityResult.raw * this.moduleWeights.city) +
            (ageResult.raw * this.moduleWeights.age)
        );

        console.log('📤 FINAL RESULTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • Decision:', decision);
        console.log('  • Action Required:', actionRequired);
        console.log('  • Risk Level:', riskLevel);
        console.log('  • DBR Percentage:', dbrResult.dbrPercentage.toFixed(2) + '%');
        console.log('  • EMI Amount:', carLoanAffordabilityResult.emi);
        console.log('  • Car Price:', carLoanAffordabilityResult.carPrice);
        console.log('  • Down Payment:', carLoanAffordabilityResult.downPayment);
        console.log('  • Loan Amount:', carLoanAffordabilityResult.loanAmount);
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
            emiAmount: carLoanAffordabilityResult.emi,
            carPrice: carLoanAffordabilityResult.carPrice,
            downPayment: carLoanAffordabilityResult.downPayment,
            loanAmount: carLoanAffordabilityResult.loanAmount,
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
                carLoanAffordability: { 
                    score: carLoanAffordabilityResult.raw, 
                    weight: this.moduleWeights.carLoanAffordability, 
                    weightedScore: carLoanAffordabilityResult.raw * this.moduleWeights.carLoanAffordability, 
                    notes: carLoanAffordabilityResult.notes 
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
                carTenure: { 
                    score: carTenureResult.raw, 
                    weight: this.moduleWeights.carTenure, 
                    weightedScore: carTenureResult.raw * this.moduleWeights.carTenure, 
                    notes: carTenureResult.notes 
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
