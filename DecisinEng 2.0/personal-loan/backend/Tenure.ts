/**
 * Tenure Module
 * Handles tenure validation, scoring, and age-based restrictions for personal loans
 */

export default class TenureModule {
    /**
     * Validate tenure based on age and employment type
     * @param {number} age - Applicant age
     * @param {string} employmentType - Employment type
     * @param {number} proposedTenure - Proposed tenure in months
     * @returns {Object} Validation result
     */
    validateTenure(age: number, employmentType: string, proposedTenure: number): {
        isValid: boolean;
        maxAllowed: number;
        minAllowed: number;
        ageLimit: number;
        employmentLimit: number;
        notes: string[];
    } {
        const ageBasedLimits = {
            maxTenureByAge: (age: number) => {
                if (age >= 55) return 12;
                if (age >= 50) return 24;
                if (age >= 45) return 36;
                return 60;
            }
        };

        const employmentTypeLimits = {
            'permanent': 60,
            'contractual': 36,
            'self-employed': 48,
            'probation': 24
        };

        const maxTenureByAge = ageBasedLimits.maxTenureByAge(age);
        const maxTenureByEmployment = employmentTypeLimits[employmentType as keyof typeof employmentTypeLimits] || 60;
        const maxAllowedTenure = Math.min(maxTenureByAge, maxTenureByEmployment);

        const isValid = proposedTenure >= 12 && proposedTenure <= maxAllowedTenure;

        const notes: string[] = [];
        notes.push(`Age: ${age} years → Max tenure: ${maxTenureByAge} months`);
        notes.push(`Employment: ${employmentType} → Max tenure: ${maxTenureByEmployment} months`);
        notes.push(`Proposed: ${proposedTenure} months → Max allowed: ${maxAllowedTenure} months`);
        notes.push(`Valid: ${isValid ? 'YES' : 'NO'}`);

        return {
            isValid,
            maxAllowed: maxAllowedTenure,
            minAllowed: 12,
            ageLimit: maxTenureByAge,
            employmentLimit: maxTenureByEmployment,
            notes
        };
    }

    /**
     * Calculate tenure score based on proposed tenure, age, and employment stability
     * @param {Object} app - Application data
     * @returns {Object} Tenure result with score and notes
     */
    calculate(app: any): {
        raw: number;
        proposedTenure: number;
        age: number;
        employmentYears: number;
        notes: string[];
        flags: string[];
    } {
        const proposedTenure = parseInt(app.proposed_tenure_months) || 12;
        const age = this.calculateAge(app.date_of_birth);
        const employmentType = String(app.employment_type || "permanent").toLowerCase();
        const employmentYears = parseFloat(app.length_of_employment || app.company_tenure || 0);

        console.log('='.repeat(80));
        console.log('📅 TENURE MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Proposed Tenure (months):', proposedTenure);
        console.log('  • Age:', age);
        console.log('  • Employment Type:', employmentType);
        console.log('  • Employment Years:', employmentYears);

        // Validate tenure first
        const validation = this.validateTenure(age, employmentType, proposedTenure);
        
        if (!validation.isValid) {
            console.log('❌ TENURE VALIDATION FAILED');
            console.log('  • Reason: Proposed tenure exceeds limits');
            console.log('📤 OUTPUTS:');
            console.log('  • Score: 0/100 (Invalid Tenure)');
            console.log('='.repeat(80));
            
            return {
                raw: 0,
                proposedTenure,
                age,
                employmentYears,
                notes: [...validation.notes, '❌ Tenure validation failed'],
                flags: ['INVALID_TENURE']
            };
        }

        // Calculate base score by tenure length
        let score = 0;
        if (proposedTenure <= 12) {
            score = 100;
        } else if (proposedTenure <= 24) {
            score = 90;
        } else if (proposedTenure <= 36) {
            score = 80;
        } else if (proposedTenure <= 48) {
            score = 70;
        } else if (proposedTenure <= 60) {
            score = 60;
        }

        console.log('🔍 SCORING:');
        console.log('  • Base Score (by tenure):', score);

        // Age-based penalties
        if (age >= 55 && proposedTenure > 24) {
            score -= 20;
            console.log('  • Age penalty (55+ with >24 months): -20');
        }
        if (age >= 50 && proposedTenure > 36) {
            score -= 30;
            console.log('  • Age penalty (50+ with >36 months): -30');
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
            score -= 10;
            console.log('  • Stability penalty (<1 year): -10');
        }

        const finalScore = Math.max(0, Math.min(100, score));

        const notes: string[] = [...validation.notes];
        const flags: string[] = [];

        notes.push(`Base Score: ${score}`);
        notes.push(`Final Score: ${finalScore}/100`);

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
