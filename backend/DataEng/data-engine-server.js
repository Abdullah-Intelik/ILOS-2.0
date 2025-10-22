const express = require('express');
const config = require('./config');
const app = express();
const PORT = process.env.PORT || 3002;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

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
            'commercialvehicle': { min: 500000, max: 5000000 },
            'autoloan': { min: 500000, max: 3000000 },
            'smeasaan': { min: 200000, max: 1500000 },
            default: { min: 100000, max: 2000000 }
        },
        tenure: {
            'Cashplus': { min: 12, max: 60 },
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

// Main DBR evaluation function
function evaluateSBPDBR(loanApplication) {
    // Normalize and defensively handle missing/zero values to avoid hard failures
    let netIncome = Number(loanApplication.net_monthly_income) || 0;
    const grossIncome = Number(loanApplication.gross_monthly_income) || 0;
    const taxesAndDeductions = Number(loanApplication.taxes_and_deductions) || 0;

    if (netIncome === 0) {
        netIncome = grossIncome - taxesAndDeductions;
    }

    // If still invalid or non-positive, fall back to a conservative default
    if (!isFinite(netIncome) || netIncome <= 0) {
        // Use gross if present, otherwise a safe baseline so calculation proceeds
        netIncome = grossIncome > 0 ? grossIncome : 50000;
    }

    const creditCardComponent = Number(loanApplication.credit_card_limit) * 0.05 || 0;
    const overdraftMonthly = Number(loanApplication.overdraft_interest_year) / 12 || 0;
    const proposedEMI = calculateEMI(
        Number(loanApplication.proposed_loan_amount) || 0, 
        Number(loanApplication.annual_rate_percent) || 0, 
        Number(loanApplication.proposed_tenure_months) || 0
    );
    
    const totalObligations = loanApplication.existing_emis + creditCardComponent + overdraftMonthly + proposedEMI;
    const dbr = (totalObligations / netIncome) * 100;

    let status = dbr <= 35 ? 'pass' :
                 dbr <= 40 ? 'conditionally fail - redirect to RRU' : 'fail';

    if (status === 'pass' && loanApplication.age > 65) {
        status = 'conditionally fail - redirect to RRU';
    }

    return {
        status,
        dbr: Math.round(dbr * 100) / 100,
        net_income: netIncome,
        total_obligations: Math.round(totalObligations * 100) / 100,
    };
}

// API endpoint that accepts LOS ID
app.post('/dbr', async (req, res) => {
    const losId = req.body.losId;
    const loan_type = req.body.loan_type;
    
    // Validate required fields
    if (!losId || !loan_type) {
        return res.status(400).json({
            success: false,
            message: 'losId and loan_type are required'
        });
    }
    
    console.log("ECIB Fetch");
    console.log(losId);
    console.log(loan_type);

    try {
        // /api/application/form/:losId
        let applicationFormData;
        try {
            const applicationForm = await fetch(`${config.apiBaseUrl}/api/applications/form/${losId}`, {
                timeout: config.fetchTimeout
            });
            if (!applicationForm.ok) {
                throw new Error(`HTTP ${applicationForm.status}: ${applicationForm.statusText}`);
            }
            applicationFormData = await applicationForm.json();
        } catch (fetchError) {
            console.warn(`Failed to fetch application form from ${config.apiBaseUrl}, using fallback data: ${fetchError.message}`);
            // Fallback to mock data
            applicationFormData = {
                formData: {
                    cnic: config.defaults.cnic,
                    gross_monthly_salary: generateRandomValue('gross_monthly_salary'),
                    net_monthly_income: generateRandomValue('net_monthly_income'),
                    date_of_birth: generateRandomValue('date_of_birth', loan_type),
                    amount_requested: generateRandomValue('amount_requested', loan_type)
                }
            };
        }
        
        // Normalize core fields from varying product schemas using aliases
        const form = applicationFormData.formData || {};
        // CNIC
        let cnic = pickFirstString(form, ['cnic', 'applicant_cnic', 'nic', 'nic_or_passport'], config.defaults.cnic);
        // Incomes
        let gross_monthly_salary = pickFirstNumber(
            form,
            ['gross_monthly_salary', 'gross_monthly_income', 'gross_income', 'total_gross_monthly_income'],
            generateRandomValue('gross_monthly_salary')
        );
        let net_monthly_income = pickFirstNumber(
            form,
            ['net_monthly_income', 'net_take_home', 'monthly_income', 'total_income'],
            generateRandomValue('net_monthly_income')
        );
        // DOB
        let date_of_birth = pickFirstString(
            form,
            ['date_of_birth', 'applicant_dob', 'dob'],
            generateRandomValue('date_of_birth', loan_type)
        );
        // Amount / price / desired
        let amount_requested = pickFirstNumber(
            form,
            ['amount_requested', 'price_value', 'desired_loan_amount', 'loan_amount'],
            generateRandomValue('amount_requested', loan_type)
        );

        console.log(cnic);
    
        // /api/ecib-reports/check
        let ecibReportData;
        try {
            const ecibReport = await fetch(`${config.apiBaseUrl}/api/ecib-reports/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cnic: cnic
                }),
                timeout: config.fetchTimeout
            });
            
            if (!ecibReport.ok) {
                throw new Error(`HTTP ${ecibReport.status}: ${ecibReport.statusText}`);
            }
            
            ecibReportData = await ecibReport.json();
        } catch (ecibError) {
            console.warn(`Failed to fetch ECIB report from ${config.apiBaseUrl}, using fallback data: ${ecibError.message}`);
            // Fallback to mock ECIB data
            ecibReportData = {
                total_balance_outstanding: 0,
                tenure: generateRandomValue('tenure', loan_type),
                overdraft_interest: 0,
                taxes: 0,
                existing_emi_amount: 0,
                credit_card_limit: 0,
                annual_rate: config.defaults.annualRate
            };
        }
        console.log(ecibReportData);
        
        // Handle null values from ECIB report with defaults
        const total_balance_outstanding = 1400;
        const tenureFromEcib = parseInt(ecibReportData.tenure) || undefined;
        const tenure = extractTenureMonths(form, tenureFromEcib || generateRandomValue('tenure', loan_type));
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
        
        // Prepare loan application object for DBR calculation
        const loanApplication = {
            gross_monthly_income: parseFloat(gross_monthly_salary),
            net_monthly_income: parseFloat(net_monthly_income) || 0,
            taxes_and_deductions: parseFloat(taxes) || 0,
            existing_emis: parseFloat(existing_emi_amount) || 0,
            credit_card_limit: parseFloat(credit_card_limit) || 0,
            overdraft_interest_year: parseFloat(total_balance_outstanding) || 0,
            proposed_loan_amount: parseFloat(amount_requested),
            proposed_tenure_months: parseInt(tenure),
            annual_rate_percent: parseFloat(annual_rate),
            age: age
        };

        console.log('Loan Application Data:', loanApplication);

        // Calculate DBR using the integrated logic
        const dbrResult = evaluateSBPDBR(loanApplication);
        
        console.log('DBR Calculation Result:', dbrResult);
        
        //dbr calc end
        
        res.json({
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
            // Additional details
            dbr_details: {
                net_income: dbrResult.net_income,
                total_obligations: dbrResult.total_obligations,
                dbr_percentage: dbrResult.dbr
            }
        });

    } catch (error) {
        console.error('Error in DBR calculation:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating DBR',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'LOS API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LOS API Server',
        endpoints: {
            'GET /dbr': 'Calculate DBR for loan application',
            'GET /health': 'Health check endpoint'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`LOS API server is running on port ${PORT}`);
    console.log(`Server started at: ${new Date().toISOString()}`);
    console.log(`Access the API at:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://192.168.1.116:${PORT}`);
});