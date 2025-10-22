/**
 * Income Module
 * Handles financial capacity and stability evaluation
 */

export default class IncomeModule {
    /**
     * Calculate income score based on threshold, stability, and tenure
     * @param {Object} app - Application data
     * @returns {Object} Income result with score and notes
     */
    calculate(app: any): {
        raw: number;
        notes: string[];
        flags: string[];
    } {
        const grossIncome = parseFloat(app.gross_monthly_income) || 0;
        let netIncome = parseFloat(app.total_income) || 0;
        const tenure = parseFloat(app.length_of_employment) || 0;
        const isETB = app.is_ubl_customer === true || app.is_ubl_customer === "true";
        
        // FIX: Add 50K fallback if net income is 0 or missing
        if (netIncome <= 0) {
            netIncome = 50000; // 50K PKR fallback
            console.log('  • ⚠️ Net income was 0 or missing - using fallback: PKR 50,000');
        }

        // Manual inputs
        const employmentType = String(app.employment_type || "permanent").toLowerCase();
        const salaryTransferFlag = typeof app.salary_transfer_flag === 'boolean' 
            ? (app.salary_transfer_flag ? "salary_transfer" : "non_salary_transfer")
            : String(app.salary_transfer_flag || "salary_transfer").toLowerCase();
        
        console.log('='.repeat(80));
        console.log('📊 INCOME MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Employment Type:', employmentType);
        console.log('  • Salary Transfer Flag:', salaryTransferFlag, `(original: ${app.salary_transfer_flag}, type: ${typeof app.salary_transfer_flag})`);
        console.log('  • UBL Customer:', isETB);
        console.log('  • Net Monthly Income:', netIncome);
        console.log('  • Gross Monthly Income:', grossIncome);
        console.log('  • Employment Tenure:', tenure, 'years');
        console.log('  • Raw Input Data:', JSON.stringify(app, null, 2));
        
        let raw = 0;
        const notes: string[] = [];

        // 1. Income Threshold Check (60 pts)
        let thresholdMet = false;

        if (employmentType === "permanent" || employmentType === "employed") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB) {
                    thresholdMet = netIncome >= 40000;
                } else {
                    thresholdMet = netIncome >= 45000;
                }
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB) {
                    thresholdMet = netIncome >= 45000;
                } else {
                    thresholdMet = netIncome >= 50000;
                }
            }
        } else if (employmentType === "contractual") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB) {
                    thresholdMet = netIncome >= 60000;
                } else {
                    thresholdMet = netIncome >= 65000;
                }
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB) {
                    thresholdMet = netIncome >= 65000;
                } else {
                    thresholdMet = netIncome >= 70000;
                }
            }
        } else if (employmentType === "self-employed" || employmentType === "business") {
            if (isETB) {
                thresholdMet = netIncome >= 100000;
            } else {
                thresholdMet = netIncome >= 120000;
            }
        } else if (employmentType === "probation") {
            notes.push("Probation case → Score based on DBR, no threshold credit");
        }

        console.log('🔍 THRESHOLD CHECK:');
        console.log('  • Expected Threshold:', (employmentType === "permanent" || employmentType === "employed") && salaryTransferFlag === "salary_transfer" 
            ? (isETB ? 40000 : 45000) 
            : "N/A");
        console.log('  • Actual Income:', netIncome);
        console.log('  • Threshold Met:', thresholdMet);
        console.log('  • Points Awarded:', thresholdMet ? 60 : 0);

        if (thresholdMet) {
            raw += 60;
            notes.push(`Income threshold met: PKR ${netIncome}`);
        } else {
            if (employmentType !== "probation") {
                notes.push(`Income threshold NOT met: PKR ${netIncome}`);
            }
        }

        // 2. Income Stability (25 pts)
        console.log('🔍 STABILITY CHECK:');
        if (grossIncome > 0 && netIncome > 0) {
            const stabilityRatio = netIncome / grossIncome;
            console.log('  • Stability Ratio:', (stabilityRatio * 100).toFixed(1) + '%');
            if (stabilityRatio >= 0.8) {
                raw += 25;
                notes.push(`High stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +25`);
                console.log('  • Level: High Stability');
                console.log('  • Points Awarded: 25');
            } else if (stabilityRatio >= 0.6) {
                raw += 20;
                notes.push(`Medium stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +20`);
                console.log('  • Level: Medium Stability');
                console.log('  • Points Awarded: 20');
            } else {
                raw += 10;
                notes.push(`Low stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +10`);
                console.log('  • Level: Low Stability');
                console.log('  • Points Awarded: 10');
            }
        } else {
            notes.push("Stability not measurable (missing gross/net income)");
            console.log('  • Level: Not Measurable');
            console.log('  • Points Awarded: 0');
        }

        // 3. Employment Tenure (15 pts)
        console.log('🔍 TENURE CHECK:');
        console.log('  • Years of Experience:', tenure);
        if (tenure >= 5) {
            raw += 15;
            notes.push(`Excellent tenure: ${tenure} years → +15`);
            console.log('  • Level: Excellent');
            console.log('  • Points Awarded: 15');
        } else if (tenure >= 3) {
            raw += 12;
            notes.push(`Good tenure: ${tenure} years → +12`);
            console.log('  • Level: Good');
            console.log('  • Points Awarded: 12');
        } else if (tenure >= 1) {
            raw += 8;
            notes.push(`Acceptable tenure: ${tenure} years → +8`);
            console.log('  • Level: Acceptable');
            console.log('  • Points Awarded: 8');
        } else {
            notes.push(`Low tenure: ${tenure} years → +0`);
            console.log('  • Level: Low');
            console.log('  • Points Awarded: 0');
        }

        const finalScore = Math.min(raw, 100);
        
        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • Breakdown:');
        console.log('    - Threshold:', thresholdMet ? '60' : '0', 'points');
        console.log('    - Stability:', raw - (thresholdMet ? 60 : 0) - (tenure >= 5 ? 15 : tenure >= 3 ? 12 : tenure >= 1 ? 8 : 0), 'points');
        console.log('    - Tenure:', tenure >= 5 ? 15 : tenure >= 3 ? 12 : tenure >= 1 ? 8 : 0, 'points');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));
        
        return {
            raw: finalScore,
            notes,
            flags: []
        };
    }
}
