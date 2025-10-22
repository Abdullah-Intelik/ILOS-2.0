/**
 * Car Tenure Module
 * Handles car loan tenure validation based on engine CC and other factors
 */

export default class CarTenureModule {
    /**
     * Validate car loan tenure based on engine CC and other factors
     * @param {number} engineCC - Engine displacement in CC
     * @param {number} proposedTenure - Proposed tenure in months
     * @param {number} age - Applicant age
     * @param {string} employmentType - Employment type
     * @returns {Object} Validation result
     */
    validateCarTenure(engineCC: number, proposedTenure: number, age: number, employmentType: string): {
        isValid: boolean;
        maxAllowed: number;
        minAllowed: number;
        ccLimit: number;
        ageLimit: number;
        employmentLimit: number;
        notes: string[];
    } {
        // CC-based tenure restrictions
        const ccBasedLimit = engineCC >= 1000 ? 24 : 60; // 1000cc+ = 2 years, <1000cc = 5 years
        
        // Age-based limits (stricter for car loans)
        const ageBasedLimits = {
            maxTenureByAge: (age: number) => {
                if (age >= 55) return 12; // Max 1 year for 55+
                if (age >= 50) return 24; // Max 2 years for 50+
                if (age >= 45) return 36; // Max 3 years for 45+
                return 60; // Max 5 years for under 45
            }
        };

        // Employment type limits
        const employmentTypeLimits = {
            'permanent': 60,
            'contractual': 36,
            'self-employed': 48,
            'probation': 24
        };

        const maxTenureByAge = ageBasedLimits.maxTenureByAge(age);
        const maxTenureByEmployment = employmentTypeLimits[employmentType as keyof typeof employmentTypeLimits] || 60;
        
        // Take the most restrictive limit
        const maxAllowedTenure = Math.min(ccBasedLimit, maxTenureByAge, maxTenureByEmployment);

        const isValid = proposedTenure >= 12 && proposedTenure <= maxAllowedTenure;

        const notes: string[] = [];
        notes.push(`Engine CC: ${engineCC}cc → Max tenure: ${ccBasedLimit} months`);
        notes.push(`Age: ${age} years → Max tenure: ${maxTenureByAge} months`);
        notes.push(`Employment: ${employmentType} → Max tenure: ${maxTenureByEmployment} months`);
        notes.push(`Proposed: ${proposedTenure} months → Max allowed: ${maxAllowedTenure} months`);
        notes.push(`Valid: ${isValid ? 'YES' : 'NO'}`);

        return {
            isValid,
            maxAllowed: maxAllowedTenure,
            minAllowed: 12,
            ccLimit: ccBasedLimit,
            ageLimit: maxTenureByAge,
            employmentLimit: maxTenureByEmployment,
            notes
        };
    }

    /**
     * Calculate car tenure score based on CC, age, employment, and proposed tenure
     * @param {Object} app - Application data
     * @returns {Object} Car tenure result with score and notes
     */
    calculate(app: any): {
        raw: number;
        proposedTenure: number;
        engineCC: number;
        age: number;
        employmentYears: number;
        notes: string[];
        flags: string[];
    } {
        const proposedTenure = parseInt(app.proposed_tenure_months) || 12;
        const engineCC = parseInt(app.engine_cc) || 0;
        const age = this.calculateAge(app.date_of_birth);
        const employmentType = String(app.employment_type || "permanent").toLowerCase();
        const employmentYears = parseFloat(app.length_of_employment || app.company_tenure || 0);

        console.log('='.repeat(80));
        console.log('🚗 CAR TENURE MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Proposed Tenure (months):', proposedTenure);
        console.log('  • Engine CC:', engineCC);
        console.log('  • Age:', age);
        console.log('  • Employment Type:', employmentType);
        console.log('  • Employment Years:', employmentYears);

        // Validate tenure first
        const validation = this.validateCarTenure(engineCC, proposedTenure, age, employmentType);
        
        if (!validation.isValid) {
            console.log('❌ CAR TENURE VALIDATION FAILED');
            console.log('  • Reason: Proposed tenure exceeds limits');
            console.log('📤 OUTPUTS:');
            console.log('  • Score: 0/100 (Invalid Tenure)');
            console.log('='.repeat(80));
            
            return {
                raw: 0,
                proposedTenure,
                engineCC,
                age,
                employmentYears,
                notes: [...validation.notes, '❌ Car tenure validation failed'],
                flags: ['INVALID_CAR_TENURE']
            };
        }

        // Calculate base score by tenure length (car loan specific)
        let score = 0;
        if (proposedTenure <= 12) {
            score = 100; // Excellent - short tenure
        } else if (proposedTenure <= 24) {
            score = 90;  // Very good
        } else if (proposedTenure <= 36) {
            score = 80;  // Good
        } else if (proposedTenure <= 48) {
            score = 70;  // Fair
        } else if (proposedTenure <= 60) {
            score = 60;  // Acceptable
        }

        console.log('🔍 SCORING:');
        console.log('  • Base Score (by tenure):', score);

        // CC-based scoring adjustments
        if (engineCC >= 1000 && proposedTenure > 24) {
            score -= 20; // Penalty for high CC with long tenure
            console.log('  • CC penalty (1000cc+ with >24 months): -20');
        }

        // Age-based penalties (stricter for car loans)
        if (age >= 55 && proposedTenure > 12) {
            score -= 25; // Higher penalty for older applicants
            console.log('  • Age penalty (55+ with >12 months): -25');
        } else if (age >= 50 && proposedTenure > 24) {
            score -= 20;
            console.log('  • Age penalty (50+ with >24 months): -20');
        }

        // Employment-based penalties
        if (employmentType === 'contractual' && proposedTenure > 24) {
            score -= 15;
            console.log('  • Employment penalty (contractual >24 months): -15');
        }
        if (employmentType === 'self-employed' && proposedTenure > 36) {
            score -= 10;
            console.log('  • Employment penalty (self-employed >36 months): -10');
        }

        // Employment stability bonus
        if (employmentYears >= 5) {
            score += 5;
            console.log('  • Stability bonus (5+ years): +5');
        } else if (employmentYears >= 3) {
            score += 3;
            console.log('  • Stability bonus (3+ years): +3');
        } else if (employmentYears < 1) {
            score -= 15; // Higher penalty for car loans
            console.log('  • Stability penalty (<1 year): -15');
        }

        const finalScore = Math.max(0, Math.min(100, score));

        const notes: string[] = [...validation.notes];
        const flags: string[] = [];

        notes.push(`Base Score: ${score}`);
        notes.push(`Final Score: ${finalScore}/100`);

        if (engineCC >= 1000) flags.push('HIGH_CC_ENGINE');
        if (age >= 55) flags.push('HIGH_AGE_RISK');
        if (employmentType === 'contractual') flags.push('CONTRACTUAL_EMPLOYMENT');
        if (employmentYears < 1) flags.push('LOW_EMPLOYMENT_STABILITY');

        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • Validation:', validation.isValid ? 'PASS' : 'FAIL');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));

        return {
            raw: finalScore,
            proposedTenure,
            engineCC,
            age,
            employmentYears,
            notes,
            flags
        };
    }

    /**
     * Calculate age from date of birth
     * @param {string} dateOfBirth - Date of birth string
     * @returns {number} Age in years
     */
    private calculateAge(dateOfBirth: string): number {
        if (!dateOfBirth) return 35; // Default age
        
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
}

