/**
 * Application Scorecard Module
 * Handles ILOS-based application scoring with 15% weight
 * Uses existing Age.js, City.js, and DBR.js modules
 */

const AgeModule = require('./Age');
const CityModule = require('./City');

class ApplicationScoreModule {
    constructor() {
        // Application Scorecard weights (Total = 100%)
        this.weights = {
            education: 0.08,              // 8%
            marital_status: 0.08,         // 8%
            employment_status: 0.03,      // 3%
            net_income: 0.13,             // 13%
            residence_ownership: 0.02,    // 2%
            dependents: 0.02,             // 2%
            length_of_employment: 0.11,   // 11%
            industry: 0.03,               // 3%
            portfolio_type: 0.09,         // 9%
            deposits: 0.15,               // 15% (CBS)
            highest_dpd: 0.04,            // 4% (CBS)
            industry_exposure: 0.04,      // 4% (CBS)
            age: 0.07,                    // 7% (uses Age.js)
            city: 0.05,                   // 5% (uses City.js)
            dbr_score: 0.06               // 6% (uses DBR.js)
        };
        
        // Initialize existing modules
        this.ageModule = new AgeModule();
        this.cityModule = new CityModule();
    }

    /**
     * Calculate application score based on ILOS and CBS data
     * @param {Object} ilosData - ILOS application data
     * @param {Object} cbsData - CBS/ECIB data
     * @param {number} dbrScore - DBR score from DBR module
     * @returns {Object} Application score result
     */
    calculate(ilosData, cbsData = {}, dbrScore = 0) {
        console.log('='.repeat(80));
        console.log('📊 APPLICATION SCORECARD CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • ILOS Data:', Object.keys(ilosData).length, 'fields');
        console.log('  • CBS Data:', Object.keys(cbsData).length, 'fields');
        console.log('  • DBR Score:', dbrScore);

        const scores = {};
        const notes = [];
        let totalScore = 0;

        // 1. Age Score (7%) - Using Age.js module
        const ageResult = this.ageModule.calculate(ilosData);
        scores.age = ageResult.raw;
        totalScore += scores.age * this.weights.age;
        notes.push(`Age: ${scores.age}/100 (${(scores.age * this.weights.age).toFixed(2)} points) - ${ageResult.notes.join(', ')}`);

        // 2. City Score (5%) - Using City.js module
        const cityResult = this.cityModule.calculate(ilosData);
        scores.city = cityResult.raw;
        totalScore += scores.city * this.weights.city;
        notes.push(`City: ${scores.city}/100 (${(scores.city * this.weights.city).toFixed(2)} points) - ${cityResult.notes.join(', ')}`);

        // 3. Education Score (8%)
        scores.education = this.calculateEducationScore(ilosData.education_qualification);
        totalScore += scores.education * this.weights.education;
        notes.push(`Education: ${scores.education}/100 (${(scores.education * this.weights.education).toFixed(2)} points)`);

        // 4. Marital Status Score (8%)
        scores.marital_status = this.calculateMaritalStatusScore(ilosData.marital_status);
        totalScore += scores.marital_status * this.weights.marital_status;
        notes.push(`Marital Status: ${scores.marital_status}/100 (${(scores.marital_status * this.weights.marital_status).toFixed(2)} points)`);

        // 5. Employment Status Score (3%)
        scores.employment_status = this.calculateEmploymentStatusScore(ilosData.employment_status);
        totalScore += scores.employment_status * this.weights.employment_status;
        notes.push(`Employment Status: ${scores.employment_status}/100 (${(scores.employment_status * this.weights.employment_status).toFixed(2)} points)`);

        // 6. Net Income Score (13%)
        scores.net_income = this.calculateNetIncomeScore(ilosData.total_income);
        totalScore += scores.net_income * this.weights.net_income;
        notes.push(`Net Income: ${scores.net_income}/100 (${(scores.net_income * this.weights.net_income).toFixed(2)} points)`);

        // 7. Residence Ownership Score (2%)
        scores.residence_ownership = this.calculateResidenceOwnershipScore(ilosData.nature_of_residence);
        totalScore += scores.residence_ownership * this.weights.residence_ownership;
        notes.push(`Residence Ownership: ${scores.residence_ownership}/100 (${(scores.residence_ownership * this.weights.residence_ownership).toFixed(2)} points)`);

        // 8. Dependents Score (2%)
        scores.dependents = this.calculateDependentsScore(ilosData.num_dependents);
        totalScore += scores.dependents * this.weights.dependents;
        notes.push(`Dependents: ${scores.dependents}/100 (${(scores.dependents * this.weights.dependents).toFixed(2)} points)`);

        // 9. Length of Employment Score (11%)
        scores.length_of_employment = this.calculateEmploymentLengthScore(ilosData.length_of_employment);
        totalScore += scores.length_of_employment * this.weights.length_of_employment;
        notes.push(`Employment Length: ${scores.length_of_employment}/100 (${(scores.length_of_employment * this.weights.length_of_employment).toFixed(2)} points)`);

        // 10. Industry Score (3%)
        scores.industry = this.calculateIndustryScore(ilosData.business_nature);
        totalScore += scores.industry * this.weights.industry;
        notes.push(`Industry: ${scores.industry}/100 (${(scores.industry * this.weights.industry).toFixed(2)} points)`);

        // 11. Portfolio Type Score (9%)
        scores.portfolio_type = this.calculatePortfolioTypeScore(ilosData.is_ubl_customer);
        totalScore += scores.portfolio_type * this.weights.portfolio_type;
        notes.push(`Portfolio Type: ${scores.portfolio_type}/100 (${(scores.portfolio_type * this.weights.portfolio_type).toFixed(2)} points)`);

        // 12. Deposits Score (15% - CBS)
        scores.deposits = this.calculateDepositsScore(cbsData.average_deposit_balance);
        totalScore += scores.deposits * this.weights.deposits;
        notes.push(`Deposits: ${scores.deposits}/100 (${(scores.deposits * this.weights.deposits).toFixed(2)} points)`);

        // 13. DBR Score (6%) - Using DBR.js module result
        scores.dbr_score = dbrScore;
        totalScore += dbrScore * this.weights.dbr_score;
        notes.push(`DBR Score: ${dbrScore}/100 (${(dbrScore * this.weights.dbr_score).toFixed(2)} points) - From DBR module`);

        // 14. Highest DPD Score (4% - CBS)
        scores.highest_dpd = this.calculateDPDScore(cbsData.highest_dpd);
        totalScore += scores.highest_dpd * this.weights.highest_dpd;
        notes.push(`Highest DPD: ${scores.highest_dpd}/100 (${(scores.highest_dpd * this.weights.highest_dpd).toFixed(2)} points)`);

        // 15. Industry Exposure Score (4% - CBS)
        scores.industry_exposure = this.calculateIndustryExposureScore(cbsData.exposure_in_industry);
        totalScore += scores.industry_exposure * this.weights.industry_exposure;
        notes.push(`Industry Exposure: ${scores.industry_exposure}/100 (${(scores.industry_exposure * this.weights.industry_exposure).toFixed(2)} points)`);

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

    // Age and City scoring now handled by existing modules

    // Education scoring (8%)
    calculateEducationScore(education) {
        if (!education) return 0;
        const edu = education.toLowerCase();
        
        if (edu.includes('phd') || edu.includes('doctorate')) return 100;
        if (edu.includes('masters') || edu.includes('ms') || edu.includes('mba')) return 90;
        if (edu.includes('bachelors') || edu.includes('ba') || edu.includes('bs')) return 80;
        if (edu.includes('intermediate') || edu.includes('fsc') || edu.includes('a-levels')) return 60;
        if (edu.includes('matric') || edu.includes('o-levels')) return 40;
        return 20;
    }

    // Marital Status scoring (8%)
    calculateMaritalStatusScore(maritalStatus) {
        if (!maritalStatus) return 0;
        const status = maritalStatus.toLowerCase();
        
        if (status === 'married') return 100;
        if (status === 'single') return 80;
        if (status === 'divorced') return 60;
        if (status === 'widowed') return 70;
        return 50;
    }

    // Employment Status scoring (3%)
    calculateEmploymentStatusScore(employmentStatus) {
        if (!employmentStatus) return 0;
        const status = employmentStatus.toLowerCase();
        
        if (status === 'permanent') return 100;
        if (status === 'contractual') return 80;
        if (status === 'probation') return 60;
        if (status.includes('self')) return 70;
        return 40;
    }

    // Net Income scoring (13%)
    calculateNetIncomeScore(netIncome) {
        const income = parseFloat(netIncome) || 0;
        
        if (income >= 200000) return 100;
        if (income >= 150000) return 90;
        if (income >= 100000) return 80;
        if (income >= 75000) return 70;
        if (income >= 50000) return 60;
        if (income >= 30000) return 40;
        if (income >= 20000) return 20;
        return 0;
    }

    // Residence Ownership scoring (2%)
    calculateResidenceOwnershipScore(residenceType) {
        if (!residenceType) return 0;
        const type = residenceType.toLowerCase();
        
        if (type === 'owned') return 100;
        if (type === 'rented') return 60;
        if (type === 'family') return 80;
        return 40;
    }

    // Dependents scoring (2%)
    calculateDependentsScore(dependents) {
        const deps = parseInt(dependents) || 0;
        
        if (deps === 0) return 100;
        if (deps === 1) return 90;
        if (deps === 2) return 80;
        if (deps === 3) return 70;
        if (deps >= 4 && deps <= 6) return 50;
        return 30;
    }

    // Employment Length scoring (11%)
    calculateEmploymentLengthScore(lengthOfEmployment) {
        const years = parseFloat(lengthOfEmployment) || 0;
        
        if (years >= 10) return 100;
        if (years >= 7) return 90;
        if (years >= 5) return 80;
        if (years >= 3) return 70;
        if (years >= 2) return 60;
        if (years >= 1) return 40;
        if (years >= 0.5) return 20;
        return 0;
    }

    // Industry scoring (3%)
    calculateIndustryScore(businessNature) {
        if (!businessNature) return 0;
        const industry = businessNature.toLowerCase();
        
        const highRisk = ['construction', 'trading', 'retail', 'wholesale'];
        const mediumRisk = ['manufacturing', 'services', 'consulting'];
        const lowRisk = ['banking', 'it', 'telecom', 'pharmaceutical', 'education'];
        
        if (lowRisk.some(risk => industry.includes(risk))) return 100;
        if (mediumRisk.some(risk => industry.includes(risk))) return 80;
        if (highRisk.some(risk => industry.includes(risk))) return 60;
        return 50;
    }

    // Portfolio Type scoring (9%)
    calculatePortfolioTypeScore(isUblCustomer) {
        if (isUblCustomer === true || isUblCustomer === 'true') return 100;
        return 0;
    }

    // Deposits scoring (15% - CBS)
    calculateDepositsScore(averageDepositBalance) {
        const balance = parseFloat(averageDepositBalance) || 0;
        
        if (balance >= 1000000) return 100;
        if (balance >= 500000) return 90;
        if (balance >= 250000) return 80;
        if (balance >= 100000) return 70;
        if (balance >= 50000) return 60;
        if (balance >= 25000) return 40;
        if (balance >= 10000) return 20;
        return 0;
    }

    // DPD scoring (4% - CBS)
    calculateDPDScore(highestDPD) {
        const dpd = parseInt(highestDPD) || 0;
        
        if (dpd === 0) return 100;
        if (dpd <= 30) return 80;
        if (dpd <= 60) return 60;
        if (dpd <= 90) return 40;
        if (dpd <= 180) return 20;
        return 0;
    }

    // Industry Exposure scoring (4% - CBS)
    calculateIndustryExposureScore(exposureInIndustry) {
        const exposure = parseFloat(exposureInIndustry) || 0;
        
        if (exposure === 0) return 100;
        if (exposure <= 100000) return 90;
        if (exposure <= 500000) return 80;
        if (exposure <= 1000000) return 70;
        if (exposure <= 2000000) return 60;
        if (exposure <= 5000000) return 40;
        return 20;
    }

    // Age calculation now handled by Age.js module
}

module.exports = ApplicationScoreModule;
