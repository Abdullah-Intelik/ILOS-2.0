/**
 * Loan Affordability Module
 * Handles EMI calculation and affordability assessment for personal loans
 */

export default class LoanAffordabilityModule {
    /**
     * Calculate EMI using standard formula
     * @param {number} loanAmount - Loan amount
     * @param {number} annualRate - Annual interest rate
     * @param {number} tenureMonths - Tenure in months
     * @returns {number} EMI amount
     */
    calculateEMI(loanAmount: number, annualRate: number, tenureMonths: number): number {
        if (tenureMonths <= 0) return 0;
        
        const monthlyRate = (annualRate / 100) / 12;
        
        if (monthlyRate === 0) {
            return loanAmount / tenureMonths; // No interest scenario
        }
        
        return loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
               (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    }

    /**
     * Calculate affordability score based on EMI vs income ratio
     * @param {Object} app - Application data
     * @returns {Object} Affordability result with score and notes
     */
    calculate(app: any): {
        raw: number;
        emi: number;
        affordabilityRatio: number;
        notes: string[];
        flags: string[];
    } {
        const loanAmount = parseFloat(app.proposed_loan_amount) || 0;
        const tenureMonths = parseInt(app.proposed_tenure_months) || 12;
        const interestRate = parseFloat(app.annual_rate_percent) || 18.5;
        const monthlyIncome = parseFloat(app.net_monthly_income) || parseFloat(app.total_income) || 0;

        console.log('='.repeat(80));
        console.log('💰 LOAN AFFORDABILITY MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Loan Amount:', loanAmount);
        console.log('  • Tenure (months):', tenureMonths);
        console.log('  • Interest Rate (%):', interestRate);
        console.log('  • Monthly Income:', monthlyIncome);

        // Calculate EMI
        const emi = this.calculateEMI(loanAmount, interestRate, tenureMonths);
        const affordabilityRatio = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;

        console.log('🔍 CALCULATIONS:');
        console.log('  • EMI Amount:', emi);
        console.log('  • Affordability Ratio:', affordabilityRatio.toFixed(2) + '%');

        // Calculate score based on affordability ratio
        let score = 0;
        if (affordabilityRatio <= 20) {
            score = 100;
        } else if (affordabilityRatio <= 30) {
            score = 80;
        } else if (affordabilityRatio <= 40) {
            score = 60;
        } else if (affordabilityRatio <= 50) {
            score = 40;
        } else {
            score = 0;
        }

        // Tenure-based penalties
        if (tenureMonths > 36) score -= 10;
        if (tenureMonths > 48) score -= 20;

        const finalScore = Math.max(0, score);

        const notes: string[] = [];
        const flags: string[] = [];

        notes.push(`EMI: PKR ${emi.toLocaleString()}`);
        notes.push(`Affordability: ${affordabilityRatio.toFixed(1)}%`);
        notes.push(`Tenure: ${tenureMonths} months`);
        notes.push(`Score: ${finalScore}/100`);

        if (affordabilityRatio > 50) {
            flags.push('HIGH_AFFORDABILITY_RISK');
            notes.push('⚠️ High affordability risk - EMI exceeds 50% of income');
        }

        if (tenureMonths > 48) {
            flags.push('LONG_TENURE');
            notes.push('⚠️ Long tenure penalty applied');
        }

        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • EMI:', emi);
        console.log('  • Affordability Ratio:', affordabilityRatio.toFixed(2) + '%');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));

        return {
            raw: finalScore,
            emi: emi,
            affordabilityRatio: affordabilityRatio,
            notes,
            flags
        };
    }
}

