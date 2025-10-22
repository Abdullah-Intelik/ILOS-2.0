/**
 * Behavioral Scorecard Module
 * Handles CBS-based behavioral scoring for ETB customers with 10% weight
 */

class BehavioralScoreModule {
    constructor() {
        // Behavioral Scorecard weights (ETB customers only)
        this.weights = {
            bad_counts_industry: 0.15,        // 15%
            bad_counts_ubl: 0.15,             // 15%
            dpd_30_plus: 0.12,                // 12%
            dpd_60_plus: 0.12,                // 12%
            defaults_12m: 0.10,               // 10%
            late_payments: 0.08,              // 8%
            avg_deposit_balance: 0.10,        // 10%
            partial_payments: 0.08,           // 8%
            credit_utilization: 0.10          // 10%
        };
    }

    /**
     * Calculate behavioral score based on CBS data (ETB customers only)
     * @param {Object} cbsData - CBS/ECIB behavioral data
     * @param {boolean} isETB - Whether customer is ETB
     * @returns {Object} Behavioral score result
     */
    calculate(cbsData, isETB = false) {
        console.log('='.repeat(80));
        console.log('📊 BEHAVIORAL SCORECARD CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • CBS Data:', Object.keys(cbsData).length, 'fields');
        console.log('  • Is ETB:', isETB);

        // Return 0 score for NTB customers
        if (!isETB) {
            console.log('📤 OUTPUTS:');
            console.log('  • Final Score: 0/100 (NTB Customer)');
            console.log('  • Notes: ["Behavioral scoring only for ETB customers"]');
            console.log('='.repeat(80));
            return {
                raw: 0,
                scores: {},
                notes: ['Behavioral scoring only for ETB customers'],
                weights: this.weights
            };
        }

        const scores = {};
        const notes = [];
        let totalScore = 0;

        // 1. Bad Counts Industry (15%)
        scores.bad_counts_industry = this.calculateBadCountsScore(cbsData.bad_counts_industry);
        totalScore += scores.bad_counts_industry * this.weights.bad_counts_industry;
        notes.push(`Bad Counts Industry: ${scores.bad_counts_industry}/100 (${(scores.bad_counts_industry * this.weights.bad_counts_industry).toFixed(2)} points)`);

        // 2. Bad Counts UBL (15%)
        scores.bad_counts_ubl = this.calculateBadCountsScore(cbsData.bad_counts_ubl);
        totalScore += scores.bad_counts_ubl * this.weights.bad_counts_ubl;
        notes.push(`Bad Counts UBL: ${scores.bad_counts_ubl}/100 (${(scores.bad_counts_ubl * this.weights.bad_counts_ubl).toFixed(2)} points)`);

        // 3. DPD 30+ (12%)
        scores.dpd_30_plus = this.calculateDPD30PlusScore(cbsData.dpd_30_plus);
        totalScore += scores.dpd_30_plus * this.weights.dpd_30_plus;
        notes.push(`DPD 30+: ${scores.dpd_30_plus}/100 (${(scores.dpd_30_plus * this.weights.dpd_30_plus).toFixed(2)} points)`);

        // 4. DPD 60+ (12%)
        scores.dpd_60_plus = this.calculateDPD60PlusScore(cbsData.dpd_60_plus);
        totalScore += scores.dpd_60_plus * this.weights.dpd_60_plus;
        notes.push(`DPD 60+: ${scores.dpd_60_plus}/100 (${(scores.dpd_60_plus * this.weights.dpd_60_plus).toFixed(2)} points)`);

        // 5. Defaults 12M (10%)
        scores.defaults_12m = this.calculateDefaults12MScore(cbsData.defaults_12m);
        totalScore += scores.defaults_12m * this.weights.defaults_12m;
        notes.push(`Defaults 12M: ${scores.defaults_12m}/100 (${(scores.defaults_12m * this.weights.defaults_12m).toFixed(2)} points)`);

        // 6. Late Payments (8%)
        scores.late_payments = this.calculateLatePaymentsScore(cbsData.late_payments);
        totalScore += scores.late_payments * this.weights.late_payments;
        notes.push(`Late Payments: ${scores.late_payments}/100 (${(scores.late_payments * this.weights.late_payments).toFixed(2)} points)`);

        // 7. Average Deposit Balance (10%)
        scores.avg_deposit_balance = this.calculateDepositBalanceScore(cbsData.avg_deposit_balance);
        totalScore += scores.avg_deposit_balance * this.weights.avg_deposit_balance;
        notes.push(`Avg Deposit Balance: ${scores.avg_deposit_balance}/100 (${(scores.avg_deposit_balance * this.weights.avg_deposit_balance).toFixed(2)} points)`);

        // 8. Partial Payments (8%)
        scores.partial_payments = this.calculatePartialPaymentsScore(cbsData.partial_payments);
        totalScore += scores.partial_payments * this.weights.partial_payments;
        notes.push(`Partial Payments: ${scores.partial_payments}/100 (${(scores.partial_payments * this.weights.partial_payments).toFixed(2)} points)`);

        // 9. Credit Utilization (10%)
        scores.credit_utilization = this.calculateCreditUtilizationScore(cbsData.credit_utilization_ratio);
        totalScore += scores.credit_utilization * this.weights.credit_utilization;
        notes.push(`Credit Utilization: ${scores.credit_utilization}/100 (${(scores.credit_utilization * this.weights.credit_utilization).toFixed(2)} points)`);

        const finalScore = Math.round(totalScore * 100) / 100;

        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore, '/100');
        console.log('  • Breakdown:', scores);
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));

        return {
            raw: finalScore,
            scores: scores,
            notes: notes,
            weights: this.weights
        };
    }

    // Bad Counts scoring (Industry & UBL)
    calculateBadCountsScore(badCounts) {
        const count = parseInt(badCounts) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 80;
        if (count === 2) return 60;
        if (count === 3) return 40;
        if (count === 4) return 20;
        return 0;
    }

    // DPD 30+ scoring (12%)
    calculateDPD30PlusScore(dpd30Plus) {
        const count = parseInt(dpd30Plus) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 90;
        if (count === 2) return 80;
        if (count === 3) return 70;
        if (count === 4) return 60;
        if (count === 5) return 50;
        if (count <= 10) return 30;
        return 0;
    }

    // DPD 60+ scoring (12%)
    calculateDPD60PlusScore(dpd60Plus) {
        const count = parseInt(dpd60Plus) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 80;
        if (count === 2) return 60;
        if (count === 3) return 40;
        if (count === 4) return 20;
        return 0;
    }

    // Defaults 12M scoring (10%)
    calculateDefaults12MScore(defaults12M) {
        const count = parseInt(defaults12M) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 60;
        if (count === 2) return 30;
        return 0;
    }

    // Late Payments scoring (8%)
    calculateLatePaymentsScore(latePayments) {
        const count = parseInt(latePayments) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 90;
        if (count === 2) return 80;
        if (count === 3) return 70;
        if (count === 4) return 60;
        if (count === 5) return 50;
        if (count <= 10) return 30;
        return 0;
    }

    // Deposit Balance scoring (10%)
    calculateDepositBalanceScore(avgDepositBalance) {
        const balance = parseFloat(avgDepositBalance) || 0;
        
        if (balance >= 1000000) return 100;
        if (balance >= 500000) return 90;
        if (balance >= 250000) return 80;
        if (balance >= 100000) return 70;
        if (balance >= 50000) return 60;
        if (balance >= 25000) return 50;
        if (balance >= 10000) return 30;
        return 0;
    }

    // Partial Payments scoring (8%)
    calculatePartialPaymentsScore(partialPayments) {
        const count = parseInt(partialPayments) || 0;
        
        if (count === 0) return 100;
        if (count === 1) return 80;
        if (count === 2) return 60;
        if (count === 3) return 40;
        if (count === 4) return 20;
        return 0;
    }

    // Credit Utilization scoring (10%)
    calculateCreditUtilizationScore(utilizationRatio) {
        const ratio = parseFloat(utilizationRatio) || 0;
        
        if (ratio <= 0.1) return 100;  // ≤10%
        if (ratio <= 0.2) return 90;   // ≤20%
        if (ratio <= 0.3) return 80;   // ≤30%
        if (ratio <= 0.4) return 70;   // ≤40%
        if (ratio <= 0.5) return 60;   // ≤50%
        if (ratio <= 0.6) return 50;   // ≤60%
        if (ratio <= 0.7) return 40;   // ≤70%
        if (ratio <= 0.8) return 30;   // ≤80%
        if (ratio <= 0.9) return 20;   // ≤90%
        return 0;  // >90%
    }
}

module.exports = BehavioralScoreModule;
