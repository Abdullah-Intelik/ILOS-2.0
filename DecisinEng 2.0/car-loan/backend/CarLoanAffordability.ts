/**
 * Car Loan Affordability Module
 * Handles car loan EMI calculation and affordability assessment
 */

export default class CarLoanAffordabilityModule {
    /**
     * Calculate EMI using standard formula for car loans
     * @param {number} loanAmount - Loan amount (car price - down payment)
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
     * Calculate car loan affordability score
     * @param {Object} app - Application data
     * @returns {Object} Affordability result with score and notes
     */
    calculate(app: any): {
        raw: number;
        emi: number;
        affordabilityRatio: number;
        carPrice: number;
        downPayment: number;
        loanAmount: number;
        notes: string[];
        flags: string[];
    } {
        const carPrice = parseFloat(app.car_price) || 0;
        const downPayment = parseFloat(app.down_payment) || 0;
        const loanAmount = carPrice - downPayment;
        const tenureMonths = parseInt(app.proposed_tenure_months) || 12;
        const interestRate = parseFloat(app.annual_rate_percent) || 16.5; // Car loan rate
        const monthlyIncome = parseFloat(app.net_monthly_income) || parseFloat(app.total_income) || 0;

        console.log('='.repeat(80));
        console.log('🚗 CAR LOAN AFFORDABILITY MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Car Price:', carPrice);
        console.log('  • Down Payment:', downPayment);
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

        // Calculate score based on affordability ratio (stricter for car loans)
        let score = 0;
        if (affordabilityRatio <= 15) {
            score = 100; // Excellent
        } else if (affordabilityRatio <= 25) {
            score = 80;  // Good
        } else if (affordabilityRatio <= 35) {
            score = 60;  // Fair
        } else if (affordabilityRatio <= 45) {
            score = 40;  // Poor
        } else {
            score = 0;   // Fail
        }

        // Car loan specific penalties
        if (tenureMonths > 36) score -= 10; // Penalty for long tenure
        if (downPayment < (carPrice * 0.1)) score -= 15; // Penalty for low down payment
        if (downPayment >= (carPrice * 0.3)) score += 10; // Bonus for high down payment

        const finalScore = Math.max(0, Math.min(100, score));

        const notes: string[] = [];
        const flags: string[] = [];

        notes.push(`Car Price: PKR ${carPrice.toLocaleString()}`);
        notes.push(`Down Payment: PKR ${downPayment.toLocaleString()}`);
        notes.push(`Loan Amount: PKR ${loanAmount.toLocaleString()}`);
        notes.push(`EMI: PKR ${emi.toLocaleString()}`);
        notes.push(`Affordability: ${affordabilityRatio.toFixed(1)}%`);
        notes.push(`Score: ${finalScore}/100`);

        if (affordabilityRatio > 45) {
            flags.push('HIGH_AFFORDABILITY_RISK');
            notes.push('⚠️ High affordability risk - EMI exceeds 45% of income');
        }

        if (downPayment < (carPrice * 0.1)) {
            flags.push('LOW_DOWN_PAYMENT');
            notes.push('⚠️ Low down payment - less than 10% of car price');
        }

        if (tenureMonths > 36) {
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
            carPrice: carPrice,
            downPayment: downPayment,
            loanAmount: loanAmount,
            notes,
            flags
        };
    }
}
