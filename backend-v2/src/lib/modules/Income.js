/**
 * Income Module
 * Handles financial capacity and stability evaluation
 */

class IncomeModule {
    /**
     * Calculate income score based on threshold, stability, and tenure
     * @param {Object} app - Application data
     * @returns {Object} Income result with score and notes
     */
    calculate(app) {
        const grossIncome = parseFloat(app.gross_monthly_income) || 0;
        let netIncome = parseFloat(app.total_income) || 0;
        const tenure = parseFloat(app.length_of_employment) || 0;
        const isETB = app.is_existing_customer === true || app.is_existing_customer === "true";
        
        // FIX: Add 50K fallback if net income is 0 or missing
        if (netIncome <= 0) {
            netIncome = 50000; // 50K PKR fallback
            console.log('  • ⚠️ Net income was 0 or missing - using fallback: PKR 50,000');
        }

        // Manual inputs
        const employmentType = (app.employment_type || "permanent").toLowerCase();
        const salaryTransferFlag = (app.salary_transfer_flag || "salary_transfer").toLowerCase();
        
        let raw = 0;
        const notes = [];

        // 1. Income Threshold Check (60 pts)
        let thresholdMet = false;

        if (employmentType === "permanent") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB && netIncome >= 40000) thresholdMet = true;
                if (!isETB && netIncome >= 45000) thresholdMet = true;
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB && netIncome >= 45000) thresholdMet = true;
                if (!isETB && netIncome >= 50000) thresholdMet = true;
            }
        } else if (employmentType === "contractual") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB && netIncome >= 60000) thresholdMet = true;
                if (!isETB && netIncome >= 65000) thresholdMet = true;
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB && netIncome >= 65000) thresholdMet = true;
                if (!isETB && netIncome >= 70000) thresholdMet = true;
            }
        } else if (employmentType === "self-employed" || employmentType === "business") {
            if (isETB && netIncome >= 100000) thresholdMet = true;
            if (!isETB && netIncome >= 120000) thresholdMet = true;
        } else if (employmentType === "probation") {
            notes.push("Probation case → Score based on DBR, no threshold credit");
        }

        if (thresholdMet) {
            raw += 60;
            notes.push(`Income threshold met: PKR ${netIncome}`);
        } else {
            if (employmentType !== "probation") {
                notes.push(`Income threshold NOT met: PKR ${netIncome}`);
            }
        }

        // 2. Income Stability (25 pts)
        if (grossIncome > 0 && netIncome > 0) {
            const stabilityRatio = netIncome / grossIncome;
            if (stabilityRatio >= 0.8) {
                raw += 25;
                notes.push(`High stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +25`);
            } else if (stabilityRatio >= 0.6) {
                raw += 20;
                notes.push(`Medium stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +20`);
            } else {
                raw += 10;
                notes.push(`Low stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +10`);
            }
        } else {
            notes.push("Stability not measurable (missing gross/net income)");
        }

        // 3. Employment Tenure (15 pts)
        if (tenure >= 5) {
            raw += 15;
            notes.push(`Excellent tenure: ${tenure} years → +15`);
        } else if (tenure >= 3) {
            raw += 12;
            notes.push(`Good tenure: ${tenure} years → +12`);
        } else if (tenure >= 1) {
            raw += 8;
            notes.push(`Acceptable tenure: ${tenure} years → +8`);
        } else {
            notes.push(`Low tenure: ${tenure} years → +0`);
        }

        return {
            raw: Math.min(raw, 100),
            notes,
            flags: []
        };
    }
}

// Export for use in other modules
export default IncomeModule;
