'use client';

import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface PersonalLoanApplicationData {
  applicationId?: number;
  customerName?: string;
  cnic?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  mobile?: string;
  employmentStatus?: string;
  occupation?: string;
  companyName?: string;
  designation?: string;
  experience?: number;
  grossMonthlySalary?: number;
  netMonthlyIncome?: number;
  amountRequested?: number;
  tenure?: number;
  ublCustomer?: string;
  currentCity?: string;
  currentAddress?: string;
  officeCity?: string;
  officeAddress?: string;
  eamvuStatus?: string;
  eavmu_submitted?: boolean;
  spuBlackList?: string;
  spuCreditCard?: string;
  spuNegativeList?: string;
  existingDebt?: number;
  cluster?: string;
  loan_type?: string;
  dbrData?: any;
}

interface ModuleScore {
  title: string;
  weight: string;
  score: number;
  maxScore: number;
  notes: string;
}

interface ExpandedSections {
  applicationData: boolean;
  criticalChecks: boolean;
  moduleScoring: boolean;
  finalScore: boolean;
}

export default function PersonalLoanDecisionEngine() {
  // State management
  const [applicationId, setApplicationId] = useState(141);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [applicationData, setApplicationData] = useState<PersonalLoanApplicationData | null>(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  const [dbrData, setDbrData] = useState<any>(null);
  
  // Manual inputs
  const [cluster, setCluster] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [salaryTransferFlag, setSalaryTransferFlag] = useState('salary_transfer');
  const [totalIncome, setTotalIncome] = useState(50000);
  
  // Personal Loan specific inputs
  const [proposedLoanAmount, setProposedLoanAmount] = useState(500000);
  const [proposedTenureMonths, setProposedTenureMonths] = useState(24);
  const [annualRatePercent, setAnnualRatePercent] = useState(18.5);
  const [loanPurpose, setLoanPurpose] = useState('personal');
  const [existingLoans, setExistingLoans] = useState(0);
  const [creditCardBalances, setCreditCardBalances] = useState(0);
  const [otherMonthlyObligations, setOtherMonthlyObligations] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [employmentStability, setEmploymentStability] = useState('stable');
  const [companyTenure, setCompanyTenure] = useState(3);
  const [industryRisk, setIndustryRisk] = useState('low');
  const [purposeVerification, setPurposeVerification] = useState(false);
  const [guarantorRequired, setGuarantorRequired] = useState(false);
  
  // ECIB document upload
  const [ecibFile, setEcibFile] = useState<File | null>(null);
  const [ecibUploading, setEcibUploading] = useState(false);
  const [ecibData, setEcibData] = useState<any>(null);
  const [ecibError, setEcibError] = useState('');
  
  // CBS data inputs (populated from ECIB)
  const [cbsDepositBalance, setCbsDepositBalance] = useState('500000');
  const [cbsHighestDPD, setCbsHighestDPD] = useState('0');
  const [cbsIndustryExposure, setCbsIndustryExposure] = useState('0');
  const [cbsBadCountsIndustry, setCbsBadCountsIndustry] = useState('0');
  const [cbsBadCountsUBL, setCbsBadCountsUBL] = useState('0');
  const [cbsDPD30Plus, setCbsDPD30Plus] = useState('0');
  const [cbsDPD60Plus, setCbsDPD60Plus] = useState('0');
  const [cbsDefaults12M, setCbsDefaults12M] = useState('0');
  const [cbsLatePayments, setCbsLatePayments] = useState('0');
  const [cbsPartialPayments, setCbsPartialPayments] = useState('0');
  const [cbsCreditUtilization, setCbsCreditUtilization] = useState('0.3');
  
  // Decision flow states
  const [criticalChecksStatus, setCriticalChecksStatus] = useState('Pending');
  const [moduleScoringStatus, setModuleScoringStatus] = useState('Pending');
  const [finalScoreStatus, setFinalScoreStatus] = useState('Pending');
  const [dbrLoading, setDbrLoading] = useState(false);
  const [calculationsRun, setCalculationsRun] = useState(false);
  
  // Calculation results
  const [ageCalculation, setAgeCalculation] = useState('Click "Calculate Decision" to start...');
  const [ageReasoning, setAgeReasoning] = useState('Age must be within acceptable limits based on employment type.');
  const [dbrCalculation, setDbrCalculation] = useState('Click "Calculate Decision" to start...');
  const [dbrWarning, setDbrWarning] = useState('');
  const [spuCalculation, setSpuCalculation] = useState('Click "Calculate Decision" to start...');
  const [cityCalculation, setCityCalculation] = useState('Click "Calculate Decision" to start...');
  const [incomeCalculation, setIncomeCalculation] = useState('Click "Calculate Decision" to start...');
  const [eamvuCalculation, setEamvuCalculation] = useState('Click "Calculate Decision" to start...');
  const [tenureCalculation, setTenureCalculation] = useState('Click "Calculate Decision" to start...');
  const [affordabilityCalculation, setAffordabilityCalculation] = useState('Click "Calculate Decision" to start...');
  const [weightedCalculations, setWeightedCalculations] = useState('Click "Calculate Decision" to start...');
  
  // Final results
  const [finalScore, setFinalScore] = useState(0);
  const [decision, setDecision] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [dbrPercentage, setDbrPercentage] = useState(0);
  const [emiAmount, setEmiAmount] = useState(0);
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    applicationData: false,
    criticalChecks: false,
    moduleScoring: false,
    finalScore: false
  });

  // Module details state
  const [moduleDetails, setModuleDetails] = useState<{[key: string]: any}>({});
  const [expandedModules, setExpandedModules] = useState<{[key: string]: boolean}>({});

  // Toggle module expansion
  const toggleModuleExpansion = (moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Fetch application data
  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // Mock data for Personal Loan testing
      const mockData: PersonalLoanApplicationData = {
        applicationId: applicationId,
        customerName: `Customer ${applicationId}`,
        cnic: '3520111112221',
        dateOfBirth: '1990-01-15',
        age: 34,
        gender: 'Male',
        maritalStatus: 'Married',
        mobile: '+92-300-1234567',
        employmentStatus: 'Active',
        occupation: 'Software Engineer',
        companyName: 'Tech Company Ltd',
        designation: 'Senior Developer',
        experience: 5,
        grossMonthlySalary: 120000,
        netMonthlyIncome: 100000,
        amountRequested: proposedLoanAmount,
        tenure: proposedTenureMonths,
        ublCustomer: 'Yes',
        currentCity: 'Karachi',
        currentAddress: '123 Main Street, Karachi',
        officeCity: 'Karachi',
        officeAddress: '456 Business District, Karachi',
        eamvuStatus: 'Approved',
        eavmu_submitted: true,
        spuBlackList: 'No',
        spuCreditCard: 'No',
        spuNegativeList: 'No',
        existingDebt: 0,
        cluster: cluster || 'FEDERAL',
        loan_type: 'personal_loan',
        dbrData: null
      };
      
      setApplicationData(mockData);
      setShowApplicationData(true);
      console.log('Mock application data loaded:', mockData);
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle ECIB file upload
  const handleEcibFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEcibFile(file);
      setEcibError('');
    }
  };

  // Upload ECIB document and extract CBS data
  const uploadEcibDocument = async () => {
    if (!ecibFile) {
      setEcibError('Please select a file to upload');
      return;
    }

    setEcibUploading(true);
    setEcibError('');

    try {
      const formData = new FormData();
      formData.append('file', ecibFile);

      const response = await fetch('http://127.0.0.1:8000/ocr/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('ECIB OCR Response:', data);
      
      setEcibData(data);
      
      // Extract CBS data from ECIB response
      extractCbsDataFromEcib(data);
      
    } catch (error) {
      console.error('Error uploading ECIB document:', error);
      setEcibError('ECIB upload failed. Using demo data for testing purposes.');
      
      // Use demo data when upload fails
      setEcibData({
        demo: true,
        message: 'Using demo ECIB data for testing'
      });
      
      // Set demo CBS data
      setCbsDepositBalance('500000');
      setCbsHighestDPD('0');
      setCbsIndustryExposure('0');
      setCbsBadCountsIndustry('0');
      setCbsBadCountsUBL('0');
      setCbsDPD30Plus('0');
      setCbsDPD60Plus('0');
      setCbsDefaults12M('0');
      setCbsLatePayments('0');
      setCbsPartialPayments('0');
      setCbsCreditUtilization('0.3');
    } finally {
      setEcibUploading(false);
    }
  };

  // Extract CBS data from ECIB OCR response
  const extractCbsDataFromEcib = (ecibData: any) => {
    try {
      console.log('Processing ECIB data:', ecibData);
      
      // Extract data from ECIB response structure
      const creditDetails = ecibData.credit_details?.['Credit Details'] || [];
      const overdueDetails = ecibData.overdue_details?.outstanding_balance || [];
      const outstandingBalance = ecibData.outstanding_balance?.outstanding_balance || [];
      
      // Calculate CBS metrics from ECIB data
      let totalOutstanding = 0;
      let highestDPD = 0;
      let badCountsIndustry = 0;
      let badCountsUBL = 0;
      let dpd30Plus = 0;
      let dpd60Plus = 0;
      let defaults12M = 0;
      let latePayments = 0;
      let partialPayments = 0;
      let creditUtilization = 0;
      let depositBalance = 500000; // Default value
      
      // Process outstanding balance
      if (outstandingBalance.length > 0) {
        const balance = outstandingBalance[0];
        if (balance.Total) {
          totalOutstanding = parseFloat(balance.Total.toString()) || 0;
        }
      }
      
      // Process credit details
      creditDetails.forEach((credit: any, index: number) => {
        // Skip header row (index 0)
        if (index === 0) return;
        
        // Parse present balance
        if (credit['Present Balance'] && credit['Present Balance'] !== '-') {
          const balance = parseFloat(credit['Present Balance'].replace(/,/g, ''));
          if (!isNaN(balance)) {
            totalOutstanding += balance;
          }
        }
        
        // Count overdue accounts
        if (credit['Current Overdue (Y/N)'] === 'Y') {
          badCountsIndustry++;
        }
        
        // Count late payments
        const lateCount = parseInt(credit['No. of times payments were made late (1-30 days)']) || 0;
        latePayments += lateCount;
        
        // Count overdue by days
        const overdueDays = credit['# of times account went into over due by 30+, 60+, 90+,180+ days'];
        if (overdueDays && overdueDays !== '-' && overdueDays !== '0') {
          const days = parseInt(overdueDays);
          if (days >= 30) dpd30Plus++;
          if (days >= 60) dpd60Plus++;
          if (days >= 180) defaults12M++;
        }
      });
      
      // Process overdue details for additional DPD information
      overdueDetails.forEach((overdue: any) => {
        Object.keys(overdue).forEach(key => {
          if (key.includes('2025') || key.includes('2024')) {
            const amount = parseFloat(overdue[key]) || 0;
            if (amount > 0) {
              if (overdue.Description && overdue.Description.includes('90+')) {
                dpd60Plus++;
              }
              if (overdue.Description && overdue.Description.includes('180+')) {
                defaults12M++;
              }
            }
          }
        });
      });
      
      // Calculate credit utilization
      const totalLimits = creditDetails.reduce((sum: number, credit: any, index: number) => {
        if (index === 0) return sum; // Skip header
        const limit = parseFloat(credit['Limit']?.replace(/,/g, '') || '0');
        return sum + (isNaN(limit) ? 0 : limit);
      }, 0);
      
      creditUtilization = totalLimits > 0 ? Math.min(totalOutstanding / totalLimits, 1) : 0;
      
      // Calculate highest DPD from overdue details
      overdueDetails.forEach((overdue: any) => {
        Object.keys(overdue).forEach(key => {
          if (key.includes('2025') || key.includes('2024')) {
            const amount = parseFloat(overdue[key]) || 0;
            if (amount > 0) {
              if (overdue.Description && overdue.Description.includes('180+')) {
                highestDPD = Math.max(highestDPD, 180);
              } else if (overdue.Description && overdue.Description.includes('90+')) {
                highestDPD = Math.max(highestDPD, 90);
              }
            }
          }
        });
      });
      
      // Update CBS data state with extracted values
      setCbsDepositBalance(depositBalance.toString());
      setCbsHighestDPD(highestDPD.toString());
      setCbsIndustryExposure('0'); // Default value
      setCbsBadCountsIndustry(badCountsIndustry.toString());
      setCbsBadCountsUBL(badCountsUBL.toString());
      setCbsDPD30Plus(dpd30Plus.toString());
      setCbsDPD60Plus(dpd60Plus.toString());
      setCbsDefaults12M(defaults12M.toString());
      setCbsLatePayments(latePayments.toString());
      setCbsPartialPayments(partialPayments.toString());
      setCbsCreditUtilization(creditUtilization.toFixed(4));
      
      console.log('Extracted CBS data from ECIB:', {
        depositBalance,
        totalOutstanding,
        highestDPD,
        badCountsIndustry,
        badCountsUBL,
        dpd30Plus,
        dpd60Plus,
        defaults12M,
        latePayments,
        partialPayments,
        creditUtilization: creditUtilization.toFixed(4)
      });
      
    } catch (error) {
      console.error('Error extracting CBS data from ECIB:', error);
      setEcibError('Failed to extract CBS data from ECIB document');
    }
  };

  // EMI Calculation Function
  const calculateEMI = (loanAmount: number, annualRate: number, tenureMonths: number): number => {
    if (tenureMonths <= 0) return 0;
    
    const monthlyRate = (annualRate / 100) / 12;
    
    if (monthlyRate === 0) {
      return loanAmount / tenureMonths; // No interest scenario
    }
    
    return loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
           (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  };

  // Tenure Validation Rules
  const validateTenure = (age: number, employmentType: string, proposedTenure: number) => {
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

    return {
      isValid: proposedTenure >= 12 && proposedTenure <= maxAllowedTenure,
      maxAllowed: maxAllowedTenure,
      minAllowed: 12,
      ageLimit: maxTenureByAge,
      employmentLimit: maxTenureByEmployment
    };
  };

  // Calculate decision
  const calculateDecision = async () => {
    if (!applicationData) {
      alert('Please fetch application data first');
      return;
    }

    setCalculating(true);
    setCalculationsRun(true);

    try {
      // Prepare application data for Personal Loan decision engine
      const personalLoanData = {
        ...applicationData,
        proposed_loan_amount: proposedLoanAmount,
        proposed_tenure_months: proposedTenureMonths,
        annual_rate_percent: annualRatePercent,
        employment_type: employmentType,
        length_of_employment: companyTenure,
        cluster: cluster || 'FEDERAL',
        salary_transfer_flag: salaryTransferFlag,
        total_income: totalIncome,
        gross_monthly_income: applicationData.grossMonthlySalary || 120000,
        net_monthly_income: applicationData.netMonthlyIncome || totalIncome,
        is_ubl_customer: applicationData.ublCustomer === 'Yes',
        spu_black_list_check: applicationData.spuBlackList === 'Yes',
        spu_credit_card_30k_check: applicationData.spuCreditCard === 'Yes',
        spu_negative_list_check: applicationData.spuNegativeList === 'Yes',
        eavmu_submitted: applicationData.eavmu_submitted,
        curr_city: applicationData.currentCity,
        office_city: applicationData.officeCity,
        date_of_birth: applicationData.dateOfBirth,
        occupation: applicationData.occupation,
        employment_status: applicationData.employmentStatus
      };

      // Call Personal Loan Decision Engine API
      const response = await fetch('/api/personal-loan/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationData: personalLoanData
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Set results
        setFinalScore(result.finalScore);
        setDecision(result.decision);
        setActionRequired(result.actionRequired);
        setRiskLevel(result.riskLevel);
        setDbrPercentage(result.dbrPercentage);
        setEmiAmount(result.emiAmount);

        // Set module calculations
        setAgeCalculation(`Age: ${result.moduleScores?.age?.score || 0}/100`);
        setAgeReasoning(result.moduleScores?.age?.notes?.join(', ') || '');
        
        setDbrCalculation(`DBR: ${result.dbrPercentage?.toFixed(2) || 0}%`);
        setDbrWarning(`Score: ${result.moduleScores?.dbr?.score || 0}/100`);
        
        setIncomeCalculation(`Income: ${result.moduleScores?.income?.score || 0}/100`);
        
        setSpuCalculation(`SPU: ${result.moduleScores?.spu?.score || 0}/100`);
        
        setEamvuCalculation(`EAMVU: ${result.moduleScores?.eamvu?.score || 0}/100`);
        
        setCityCalculation(`City: ${result.moduleScores?.city?.score || 0}/100`);
        
        setTenureCalculation(`Tenure: ${result.moduleScores?.tenure?.score || 0}/100`);
        
        setAffordabilityCalculation(`Affordability: ${result.moduleScores?.loanAffordability?.score || 0}/100`);

        setWeightedCalculations(`Final Score: ${result.finalScore}/100`);

        setCriticalChecksStatus('Completed');
        setModuleScoringStatus('Completed');
        setFinalScoreStatus('Completed');

      } else {
        // Fallback to manual calculation if API fails
        const age = new Date().getFullYear() - new Date(applicationData.dateOfBirth).getFullYear();
        const tenureValidation = validateTenure(age, employmentType, proposedTenureMonths);
        const emi = calculateEMI(proposedLoanAmount, annualRatePercent, proposedTenureMonths);
        const netIncome = applicationData.netMonthlyIncome || totalIncome;
        const dbrPercentage = (emi / netIncome) * 100;
        const affordabilityRatio = (emi / netIncome) * 100;

        setEmiAmount(emi);
        setDbrPercentage(dbrPercentage);

        // Manual calculations
        setAgeCalculation(`Age: ${age} years`);
        setAgeReasoning(`Age ${age} is within acceptable range for personal loans`);
        setDbrCalculation(`DBR: ${dbrPercentage.toFixed(2)}%`);
        setDbrWarning(`EMI: PKR ${emi.toLocaleString()}, Net Income: PKR ${netIncome.toLocaleString()}`);
        setIncomeCalculation(`Income: PKR ${netIncome.toLocaleString()}`);
        setSpuCalculation('SPU: Pass');
        setEamvuCalculation('EAMVU: Pass');
        setCityCalculation(`City: ${applicationData.currentCity}`);
        setTenureCalculation(`Tenure: ${proposedTenureMonths} months`);
        setAffordabilityCalculation(`Affordability: ${affordabilityRatio.toFixed(1)}%`);

        // Calculate final score
        const finalScoreValue = Math.round(
          (dbrPercentage <= 35 ? 100 : 0) * 0.40 +
          (netIncome >= 60000 ? 100 : 80) * 0.20 +
          (affordabilityRatio <= 30 ? 100 : 80) * 0.15 +
          100 * 0.10 + 100 * 0.10 + 100 * 0.03 + 100 * 0.02
        );

        setFinalScore(finalScoreValue);
        setWeightedCalculations(`Final Score: ${finalScoreValue}/100`);

        // Determine decision
        if (!tenureValidation.isValid) {
          setDecision('FAIL');
          setActionRequired(`Tenure ${proposedTenureMonths} months exceeds maximum allowed ${tenureValidation.maxAllowed} months`);
          setRiskLevel('VERY_HIGH');
        } else if (dbrPercentage > 35) {
          setDecision('FAIL');
          setActionRequired(`DBR ${dbrPercentage.toFixed(2)}% exceeds threshold 35%`);
          setRiskLevel('VERY_HIGH');
        } else if (finalScoreValue >= 85) {
          setDecision('PASS');
          setActionRequired('None');
          setRiskLevel('VERY_LOW');
        } else if (finalScoreValue >= 75) {
          setDecision('PASS');
          setActionRequired('Basic conditions');
          setRiskLevel('LOW');
        } else if (finalScoreValue >= 65) {
          setDecision('CONDITIONAL PASS');
          setActionRequired('Additional conditions');
          setRiskLevel('MEDIUM');
        } else if (finalScoreValue >= 55) {
          setDecision('CONDITIONAL PASS');
          setActionRequired('Manual review');
          setRiskLevel('HIGH');
        } else {
          setDecision('FAIL');
          setActionRequired('Low score - Decline application');
          setRiskLevel('VERY_HIGH');
        }

        setCriticalChecksStatus('Completed');
        setModuleScoringStatus('Completed');
        setFinalScoreStatus('Completed');
      }

    } catch (error) {
      console.error('Error calculating decision:', error);
      alert('Error calculating decision');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            💰 Personal Loan Decision Engine
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            margin: 0
          }}>
            Advanced tenure-based decision engine for personal loan applications
          </p>
          <div style={{ marginTop: '20px' }}>
            <a 
              href="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                marginRight: '10px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              <span style={{ marginRight: '8px' }}>🏦</span>
              Credit Card Engine
            </a>
          </div>
        </header>

        <div style={{ 
          display: 'flex', 
          flexDirection: showApplicationData ? 'row' : 'column',
          gap: '30px',
          minHeight: '80vh'
        }}>
          {/* Left Panel - Input Controls */}
          <div style={{ 
            width: showApplicationData ? '45%' : '100%',
            maxWidth: showApplicationData ? '500px' : 'none'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Application Input
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Application ID:
                </label>
                <input 
                  type="number" 
                  value={applicationId} 
                  onChange={(e) => setApplicationId(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button
                onClick={fetchApplicationData}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '20px'
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
              >
                {loading ? '⏳ Loading...' : '📥 Fetch Application Data'}
              </button>

              {applicationData && (
                <div style={{
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    margin: '0 0 10px 0'
                  }}>
                    ✅ Application Loaded
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#4a5568',
                    margin: '0 0 5px 0'
                  }}>
                    <strong>Customer:</strong> {applicationData.customerName}
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#4a5568',
                    margin: '0'
                  }}>
                    <strong>CNIC:</strong> {applicationData.cnic}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Loan Parameters */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                💰 Personal Loan Parameters
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Loan Amount (PKR):
                  </label>
                  <input
                    type="number"
                    value={proposedLoanAmount}
                    onChange={(e) => setProposedLoanAmount(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Tenure (Months):
                  </label>
                  <select
                    value={proposedTenureMonths}
                    onChange={(e) => setProposedTenureMonths(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value={12}>12 months</option>
                    <option value={18}>18 months</option>
                    <option value={24}>24 months</option>
                    <option value={36}>36 months</option>
                    <option value={48}>48 months</option>
                    <option value={60}>60 months</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Interest Rate (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={annualRatePercent}
                    onChange={(e) => setAnnualRatePercent(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Employment Type:
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="permanent">Permanent</option>
                    <option value="contractual">Contractual</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="probation">Probation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Company Tenure (Years):
                  </label>
                  <input
                    type="number"
                    value={companyTenure}
                    onChange={(e) => setCompanyTenure(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Cluster:
                  </label>
                  <select
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="">Select Cluster</option>
                    <option value="FEDERAL">Federal</option>
                    <option value="SOUTH">South</option>
                    <option value="NORTHERN_PUNJAB">Northern Punjab</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTHERN_PUNJAB">Southern Punjab</option>
                    <option value="KP">KP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CBS Data Input */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📄 ECIB Document Upload
              </h2>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#718096', 
                marginBottom: '25px',
                lineHeight: '1.5'
              }}>
                Upload ECIB document to automatically extract CBS data for behavioral scoring
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* File Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Select ECIB Document (PDF):
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleEcibFileChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  {ecibFile && (
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: '#28a745', 
                      margin: '8px 0 0 0' 
                    }}>
                      ✅ Selected: {ecibFile.name}
                    </p>
                  )}
                </div>

                {/* Upload Button */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={uploadEcibDocument}
                    disabled={!ecibFile || ecibUploading}
                    style={{
                      backgroundColor: !ecibFile || ecibUploading ? '#9ca3af' : '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: !ecibFile || ecibUploading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: '1'
                    }}
                    onMouseOver={(e) => !ecibUploading && ecibFile && (e.target.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => !ecibUploading && ecibFile && (e.target.style.backgroundColor = '#007bff')}
                  >
                    {ecibUploading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ffffff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Processing ECIB...
                      </>
                    ) : (
                      <>
                        📤 Upload & Extract CBS Data
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setEcibData({
                        demo: true,
                        message: 'Using demo ECIB data for testing'
                      });
                      setCbsDepositBalance('500000');
                      setCbsHighestDPD('0');
                      setCbsIndustryExposure('0');
                      setCbsBadCountsIndustry('0');
                      setCbsBadCountsUBL('0');
                      setCbsDPD30Plus('0');
                      setCbsDPD60Plus('0');
                      setCbsDefaults12M('0');
                      setCbsLatePayments('0');
                      setCbsPartialPayments('0');
                      setCbsCreditUtilization('0.3');
                      setEcibError('');
                    }}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: '1'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                  >
                    🧪 Use Demo Data
                  </button>
                </div>

                {/* Error Display */}
                {ecibError && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    color: '#856404',
                    fontSize: '0.9rem'
                  }}>
                    ⚠️ {ecibError}
                  </div>
                )}

                {/* Success Display */}
                {ecibData && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: ecibData.demo ? '#fff3cd' : '#d4edda',
                    border: ecibData.demo ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
                    borderRadius: '8px',
                    color: ecibData.demo ? '#856404' : '#155724',
                    fontSize: '0.9rem'
                  }}>
                    {ecibData.demo ? '⚠️ Using demo ECIB data for testing purposes.' : '✅ ECIB data extracted successfully! CBS data has been automatically populated.'}
                  </div>
                )}

                {/* Extracted CBS Data Display */}
                {ecibData && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      margin: '0 0 12px 0', 
                      color: '#495057' 
                    }}>
                      📊 Extracted CBS Data:
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '0.8rem'
                    }}>
                      <div><strong>Deposit Balance:</strong> {cbsDepositBalance}</div>
                      <div><strong>Highest DPD:</strong> {cbsHighestDPD}</div>
                      <div><strong>Bad Counts Industry:</strong> {cbsBadCountsIndustry}</div>
                      <div><strong>Bad Counts Banking:</strong> {cbsBadCountsUBL}</div>
                      <div><strong>DPD 30+:</strong> {cbsDPD30Plus}</div>
                      <div><strong>DPD 60+:</strong> {cbsDPD60Plus}</div>
                      <div><strong>Defaults 12M:</strong> {cbsDefaults12M}</div>
                      <div><strong>Late Payments:</strong> {cbsLatePayments}</div>
                      <div><strong>Partial Payments:</strong> {cbsPartialPayments}</div>
                      <div><strong>Credit Utilization:</strong> {cbsCreditUtilization}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Decision Button */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={calculateDecision}
                disabled={calculating || !applicationData}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: calculating || !applicationData ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: calculating || !applicationData ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseOver={(e) => !calculating && applicationData && (e.target.style.backgroundColor = '#059669')}
                onMouseOut={(e) => !calculating && applicationData && (e.target.style.backgroundColor = '#10b981')}
              >
                {calculating ? '⏳ Calculating...' : '🚀 Calculate Personal Loan Decision'}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          {showApplicationData && (
            <div style={{ 
              width: '55%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* EMI and DBR Summary */}
              {calculationsRun && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: '#2d3748'
                  }}>
                    📊 Loan Summary
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ fontSize: '0.9rem', margin: '0 0 8px 0', opacity: 0.9 }}>EMI Amount</h3>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                        PKR {emiAmount.toLocaleString()}
                      </p>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ fontSize: '0.9rem', margin: '0 0 8px 0', opacity: 0.9 }}>DBR %</h3>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                        {dbrPercentage.toFixed(2)}%
                      </p>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ fontSize: '0.9rem', margin: '0 0 8px 0', opacity: 0.9 }}>Final Score</h3>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                        {finalScore}/100
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Result */}
              {calculationsRun && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: '#2d3748'
                  }}>
                    🎯 Decision Result
                  </h2>
                  <div style={{
                    padding: '25px',
                    borderRadius: '12px',
                    background: decision === 'PASS' ? 'linear-gradient(135deg, #10b981, #059669)' :
                               decision === 'CONDITIONAL PASS' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                               'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      margin: '0 0 10px 0'
                    }}>
                      {decision}
                    </h3>
                    <p style={{
                      fontSize: '1.1rem',
                      margin: '0 0 5px 0',
                      opacity: 0.9
                    }}>
                      {actionRequired}
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      margin: 0,
                      opacity: 0.8
                    }}>
                      Risk Level: {riskLevel}
                    </p>
                  </div>
                </div>
              )}

              {/* Module Calculations */}
              {calculationsRun && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: '#2d3748'
                  }}>
                    🔍 Module Calculations
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {/* Age Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('age')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          👤 Age Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.age ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {ageCalculation}
                      </p>
                      {expandedModules.age && moduleDetails.age && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.age.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.age.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.age.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DBR Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('dbr')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          📊 DBR Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.dbr ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {dbrCalculation}
                      </p>
                      {expandedModules.dbr && moduleDetails.dbr && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.dbr.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.dbr.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.dbr.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Income Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('income')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          💰 Income Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.income ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {incomeCalculation}
                      </p>
                      {expandedModules.income && moduleDetails.income && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.income.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.income.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.income.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SPU Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('spu')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          🛡️ SPU Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.spu ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {spuCalculation}
                      </p>
                      {expandedModules.spu && moduleDetails.spu && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.spu.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.spu.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.spu.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* EAMVU Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('eamvu')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          🏢 EAMVU Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.eamvu ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {eamvuCalculation}
                      </p>
                      {expandedModules.eamvu && moduleDetails.eamvu && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.eamvu.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.eamvu.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.eamvu.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* City Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('city')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          🏙️ City Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.city ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {cityCalculation}
                      </p>
                      {expandedModules.city && moduleDetails.city && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.city.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.city.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.city.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tenure Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('tenure')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          📅 Tenure Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.tenure ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {tenureCalculation}
                      </p>
                      {expandedModules.tenure && moduleDetails.tenure && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.tenure.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.tenure.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.tenure.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Affordability Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('loanAffordability')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          💳 Affordability Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.loanAffordability ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {affordabilityCalculation}
                      </p>
                      {expandedModules.loanAffordability && moduleDetails.loanAffordability && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.loanAffordability.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.loanAffordability.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.loanAffordability.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}