// DBR Calculation Module - No Express server, just functions
const db = require('../../db1'); // Use the main database connection

// --- Field alias helpers to support differing schemas across products ---
function pickFirstDefined(obj, keys) {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }
    return undefined;
}

function pickFirstNumber(obj, keys, fallback) {
    const val = pickFirstDefined(obj, keys);
    const num = parseFloat(val);
    if (Number.isFinite(num)) return num;
    return fallback;
}

function pickFirstString(obj, keys, fallback) {
    const val = pickFirstDefined(obj, keys);
    if (val === undefined || val === null) return fallback;
    return String(val);
}

function extractTenureMonths(formData, defaultMonths) {
    // Prefer explicit months (e.g., tenure or loan_period already in months)
    const monthsRaw = pickFirstDefined(formData, ['tenure', 'loan_period']);
    const months = monthsRaw !== undefined && monthsRaw !== null ? parseInt(monthsRaw, 10) : NaN;
    if (Number.isFinite(months) && months > 0) {
        return months;
    }
    // Fallback: convert year-based tenures to months if provided as text or number
    const yearsRaw = pickFirstDefined(formData, ['tenure_years']);
    const years = yearsRaw !== undefined && yearsRaw !== null ? parseFloat(String(yearsRaw).replace(/[^0-9.]/g, '')) : NaN;
    if (Number.isFinite(years) && years > 0) {
        return Math.round(years * 12);
    }
    return defaultMonths;
}

// Helper function to generate random values within realistic ranges
function generateRandomValue(field, loanType) {
    const ranges = {
        gross_monthly_salary: { min: 50000, max: 300000 },
        net_monthly_income: { min: 40000, max: 250000 },
        date_of_birth: () => {
            const currentYear = new Date().getFullYear();
            const age = Math.floor(Math.random() * (65 - 25 + 1)) + 25; // Age between 25-65
            const birthYear = currentYear - age;
            return `${birthYear}-01-01`;
        },
        amount_requested: {
            'Cashplus': { min: 100000, max: 2000000 },
            'creditcard_applications': { min: 50000, max: 1000000 },
            'commercialvehicle': { min: 500000, max: 5000000 },
            'autoloan': { min: 500000, max: 3000000 },
            'smeasaan': { min: 200000, max: 1500000 },
            default: { min: 100000, max: 2000000 }
        },
        tenure: {
            'Cashplus': { min: 12, max: 60 },
            'creditcard_applications': { min: 12, max: 60 },
            'commercialvehicle': { min: 12, max: 84 },
            'autoloan': { min: 12, max: 84 },
            'smeasaan': { min: 12, max: 60 },
            default: { min: 12, max: 60 }
        }
    };

    if (field === 'date_of_birth') {
        return ranges.date_of_birth();
    }

    if (field === 'amount_requested' || field === 'tenure') {
        const range = ranges[field][loanType] || ranges[field].default;
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    const range = ranges[field];
    if (range) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    return 0;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 35; // Default age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Helper function to calculate EMI
function calculateEMI(amount, annualRate, months) {
    if (months <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    if (monthlyRate === 0) return amount / months;
    return amount * monthlyRate * Math.pow(1 + monthlyRate, months) /
        (Math.pow(1 + monthlyRate, months) - 1);
}

// Income scoring function
function calculateIncomeScore(income) {
    if (income <= 10000) return 10;
    if (income <= 100000) return 20;
    if (income <= 1000000) return 30;
    return 40; // 1M+
}

// Obligations scoring function
function calculateObligationsScore(obligations) {
    if (obligations <= 10000) return 50;
    if (obligations <= 100000) return 40;
    if (obligations <= 1000000) return 30;
    if (obligations <= 10000000) return 20;
    return 10; // 10000K+
}

// Calculate dynamic threshold based on income and obligations scores
function calculateDynamicThreshold(incomeScore, obligationsScore) {
    const finalScore = (incomeScore + obligationsScore) / 2;
    
    // Higher income + Low obligations = Lower threshold (stricter)
    // Lower income + High obligations = Higher threshold (more lenient)
    if (finalScore >= 40) return 30; // Best case: strict threshold
    if (finalScore >= 30) return 35; // Good case
    if (finalScore >= 20) return 40; // Average case
    return 45; // Worst case: more lenient threshold
}

// Main DBR evaluation function with dynamic scoring
function evaluateSBPDBR(loanApplication) {
    // Normalize and defensively handle missing/zero values to avoid hard failures
    let netIncome = Number(loanApplication.net_monthly_income) || 0;
    const grossIncome = Number(loanApplication.gross_monthly_income) || 0;
    const taxesAndDeductions = Number(loanApplication.taxes_and_deductions) || 0;

    console.log('💰 DBR Income Processing:');
    console.log('  • Raw net_monthly_income:', loanApplication.net_monthly_income);
    console.log('  • Raw gross_monthly_income:', loanApplication.gross_monthly_income);
    console.log('  • Parsed netIncome:', netIncome);
    console.log('  • Parsed grossIncome:', grossIncome);

    if (netIncome === 0) {
        netIncome = grossIncome - taxesAndDeductions;
        console.log('  • Calculated netIncome from gross:', netIncome);
    }

    // If still invalid or non-positive, fall back to a conservative default
    if (!isFinite(netIncome) || netIncome <= 0) {
        // Use gross if present, otherwise use 50K fallback
        netIncome = grossIncome > 0 ? grossIncome : 50000;
        console.log('  • Fallback netIncome:', netIncome);
        console.log('  • ⚠️ Net income was 0 or missing - using fallback: PKR 50,000');
    }

    console.log('  • Final netIncome used:', netIncome);

    const creditCardComponent = Number(loanApplication.credit_card_limit) * 0.05 || 0;
    const overdraftMonthly = Number(loanApplication.overdraft_interest_year) / 12 || 0;
    const proposedEMI = calculateEMI(
        Number(loanApplication.proposed_loan_amount) || 0, 
        Number(loanApplication.annual_rate_percent) || 0, 
        Number(loanApplication.proposed_tenure_months) || 0
    );
    
    const totalObligations = loanApplication.existing_emis + creditCardComponent + overdraftMonthly + proposedEMI;
    const dbr = (totalObligations / netIncome) * 100;

    // Calculate scores
    const incomeScore = calculateIncomeScore(netIncome);
    const obligationsScore = calculateObligationsScore(totalObligations);
    const finalScore = (incomeScore + obligationsScore) / 2;
    
    // Calculate dynamic threshold
    const threshold = calculateDynamicThreshold(incomeScore, obligationsScore);

    // Determine status based on dynamic threshold
    let status = dbr <= threshold ? 'pass' : 'fail';

    // Age-based override
    if (status === 'pass' && loanApplication.age > 65) {
        status = 'conditionally fail - redirect to RRU';
    }

    return {
        status,
        dbr: Math.round(dbr * 100) / 100,
        net_income: netIncome,
        total_obligations: Math.round(totalObligations * 100) / 100,
        threshold: threshold,
        scoring: {
            income_score: incomeScore,
            obligations_score: obligationsScore,
            final_score: Math.round(finalScore * 100) / 100
        }
    };
}

// Main DBR calculation function - now a module function, not an endpoint
async function calculateDBR(losId, loan_type, applicationFormData = null) {
    console.log("ECIB Fetch");
    console.log(losId);
    console.log(loan_type);

    try {
        // Use provided application form data or fetch it
        let formData;
        if (applicationFormData) {
            formData = applicationFormData.formData || applicationFormData;
            console.log('✅ Using ILOS API data for DBR calculation');
            console.log('📊 Application Data:', {
                cnic: formData.cnic,
                gross_monthly_income: formData.gross_monthly_income,
                total_income: formData.total_income,
                net_monthly_income: formData.net_monthly_income,
                date_of_birth: formData.date_of_birth,
                proposed_loan_amount: formData.proposed_loan_amount
            });
        } else {
            // Fallback to mock data if no application data provided
            console.log('⚠️ No application data provided, using mock data');
            formData = {
                cnic: '3520111112221',
                    gross_monthly_salary: generateRandomValue('gross_monthly_salary'),
                    net_monthly_income: generateRandomValue('net_monthly_income'),
                    date_of_birth: generateRandomValue('date_of_birth', loan_type),
                    amount_requested: generateRandomValue('amount_requested', loan_type)
            };
        }
        
        // Normalize core fields from varying product schemas using aliases
        // CNIC
        let cnic = pickFirstString(formData, ['cnic', 'applicant_cnic', 'nic', 'nic_or_passport'], '3520111112221');
        
        // Incomes - PRIORITIZE ILOS API field names first
        let gross_monthly_salary = pickFirstNumber(
            formData,
            ['gross_monthly_income', 'gross_monthly_salary', 'gross_income', 'total_gross_monthly_income'],
            generateRandomValue('gross_monthly_salary')
        );
        let net_monthly_income = pickFirstNumber(
            formData,
            ['total_income', 'net_monthly_income', 'net_take_home', 'monthly_income'],
            generateRandomValue('net_monthly_income')
        );
        
        // DOB
        let date_of_birth = pickFirstString(
            formData,
            ['date_of_birth', 'applicant_dob', 'dob'],
            generateRandomValue('date_of_birth', loan_type)
        );
        
        // Amount / price / desired - PRIORITIZE ILOS API field names first
        let amount_requested = pickFirstNumber(
            formData,
            ['proposed_loan_amount', 'amount_requested', 'price_value', 'desired_loan_amount', 'loan_amount'],
            generateRandomValue('amount_requested', loan_type)
        );

        console.log('🔍 DBR Field Mapping Results:');
        console.log('  • CNIC:', cnic);
        console.log('  • Gross Monthly Salary:', gross_monthly_salary);
        console.log('  • Net Monthly Income:', net_monthly_income);
        console.log('  • Date of Birth:', date_of_birth);
        console.log('  • Amount Requested:', amount_requested);
        console.log('  • Raw formData keys:', Object.keys(formData));
        console.log('  • Raw formData values:', {
            gross_monthly_income: formData.gross_monthly_income,
            total_income: formData.total_income,
            proposed_loan_amount: formData.proposed_loan_amount
        });
    
        // Extract ECIB data from application form data (passed from frontend)
        console.log('📊 Extracting eCIB data from application...');
        console.log('   formData.ecib:', formData.ecib ? 'Available' : 'Not Available');
        
        let ecibReportData = {
            total_balance_outstanding: 0,
            tenure: generateRandomValue('tenure', loan_type),
            overdraft_interest: 0,
            taxes: 0,
            existing_emi_amount: 0,
            credit_card_limit: 0,
            annual_rate: 14.6
        };
        
        // Extract eCIB data from formData if available
        if (formData.ecib) {
            const ecib = formData.ecib;
            
            // Extract total exposure from eCIB data
            let totalExposure = 0;
            
            if (ecib.total_exposure !== undefined) {
                totalExposure = parseFloat(ecib.total_exposure) || 0;
            } else if (ecib.principal !== undefined && ecib.markup !== undefined) {
                // Calculate from principal + markup + others
                totalExposure = (parseFloat(ecib.principal) || 0) + 
                               (parseFloat(ecib.markup) || 0) + 
                               (parseFloat(ecib.others) || 0);
            }
            
            ecibReportData.total_balance_outstanding = totalExposure;
            
            console.log('✅ eCIB data extracted from application:');
            console.log('   Total Balance Outstanding:', totalExposure);
        } else {
            console.log('⚠️ No eCIB data found in application - using defaults');
        }
        
        console.log('📊 Final eCIB Report Data:', ecibReportData);
        
        // Handle null values from ECIB report with defaults
        const total_balance_outstanding = parseFloat(ecibReportData.total_balance_outstanding) || 0;
        const tenureFromEcib = parseInt(ecibReportData.tenure) || undefined;
        const tenure = extractTenureMonths(formData, tenureFromEcib || generateRandomValue('tenure', loan_type));
        const overdraft_interest = parseFloat(ecibReportData.overdraft_interest) || 0;
        const taxes = parseFloat(ecibReportData.taxes) || 0;
        const existing_emi_amount = parseFloat(ecibReportData.existing_emi_amount) || 0;
        const credit_card_limit = parseFloat(ecibReportData.credit_card_limit) || 0;
        const annual_rate = parseFloat(ecibReportData.annual_rate) || 14.6;

        console.log(loan_type);
        console.log(total_balance_outstanding);

        // Log the LOS ID to console
        console.log(`LOS ID received: ${losId}`);
        
        //dbr calc start
        
        // Calculate age from date of birth
        const age = calculateAge(date_of_birth);
        
        // Calculate EMI for existing debt from eCIB (if any)
        // Assume existing debt is amortized over 12 months at 14.6% annual rate
        const existingDebtEMI = total_balance_outstanding > 0 
            ? calculateEMI(total_balance_outstanding, annual_rate, 12)
            : 0;
        
        console.log('📊 Existing Debt EMI Calculation:');
        console.log('  • Total Balance Outstanding (from eCIB):', total_balance_outstanding);
        console.log('  • Calculated EMI for existing debt:', existingDebtEMI);
        console.log('  • Existing EMI Amount (from records):', existing_emi_amount);
        
        // Total existing EMIs = recorded EMIs + calculated EMI from outstanding balance
        const totalExistingEMIs = parseFloat(existing_emi_amount) + existingDebtEMI;
        
        // Prepare loan application object for DBR calculation
        const loanApplication = {
            gross_monthly_income: parseFloat(gross_monthly_salary),
            net_monthly_income: parseFloat(net_monthly_income) || 0,
            taxes_and_deductions: parseFloat(taxes) || 0,
            existing_emis: totalExistingEMIs,
            credit_card_limit: parseFloat(credit_card_limit) || 0,
            overdraft_interest_year: parseFloat(overdraft_interest) || 0,
            proposed_loan_amount: parseFloat(amount_requested),
            proposed_tenure_months: parseInt(tenure),
            annual_rate_percent: parseFloat(annual_rate),
            age: age
        };

        console.log('💰 DBR Calculation Inputs:');
        console.log('  • Gross Monthly Income:', loanApplication.gross_monthly_income);
        console.log('  • Net Monthly Income:', loanApplication.net_monthly_income);
        console.log('  • Proposed Loan Amount:', loanApplication.proposed_loan_amount);
        console.log('  • Proposed Tenure (months):', loanApplication.proposed_tenure_months);
        console.log('  • Annual Rate (%):', loanApplication.annual_rate_percent);
        console.log('  • Age:', loanApplication.age);

        console.log('Loan Application Data:', loanApplication);

        // Calculate DBR using the integrated logic
        const dbrResult = evaluateSBPDBR(loanApplication);
        
        console.log('DBR Calculation Result:', dbrResult);
        
        //dbr calc end
        
        return {
            success: true,
            message: 'DBR calculated successfully',
            losId: losId,
            loan_type: loan_type,
            cnic: cnic,
            gross_monthly_salary: gross_monthly_salary,
            net_monthly_income: net_monthly_income,
            date_of_birth: date_of_birth,
            amount_requested: amount_requested,
            tenure: tenure,
            overdraft_interest: overdraft_interest,
            taxes: taxes,
            existing_emi_amount: existing_emi_amount,
            credit_card_limit: credit_card_limit,
            annual_rate: annual_rate,
            total_balance_outstanding: total_balance_outstanding,
            age: age,
            // Main DBR results
            dbr: dbrResult.dbr,
            status: dbrResult.status,
            threshold: dbrResult.threshold,
            // Additional details
            dbr_details: {
                net_income: dbrResult.net_income,
                total_obligations: dbrResult.total_obligations,
                dbr_percentage: dbrResult.dbr
            },
            // Scoring information
            scoring: dbrResult.scoring
        };

    } catch (error) {
        console.error('Error in DBR calculation:', error);
        throw new Error(`DBR calculation failed: ${error.message}`);
    }
}

// Export the main function and helper functions
module.exports = {
    calculateDBR,
    evaluateSBPDBR,
    calculateEMI,
    calculateAge,
    generateRandomValue,
    pickFirstDefined,
    pickFirstNumber,
    pickFirstString,
    extractTenureMonths
};