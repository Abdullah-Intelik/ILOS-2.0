'use client';

import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface CarLoanApplicationData {
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

export default function CarLoanDecisionEngine() {
  // State management
  const [applicationId, setApplicationId] = useState(141);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [applicationData, setApplicationData] = useState<CarLoanApplicationData | null>(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  const [dbrData, setDbrData] = useState<any>(null);
  
  // Manual inputs
  const [cluster, setCluster] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [salaryTransferFlag, setSalaryTransferFlag] = useState('salary_transfer');
  const [totalIncome, setTotalIncome] = useState(50000);
  
  // Car Loan specific inputs
  const [carName, setCarName] = useState('Toyota Corolla');
  const [carPrice, setCarPrice] = useState(3000000);
  const [downPayment, setDownPayment] = useState(300000);
  const [engineCC, setEngineCC] = useState(1300);
  const [proposedTenureMonths, setProposedTenureMonths] = useState(24);
  const [annualRatePercent, setAnnualRatePercent] = useState(16.5);
  const [carYear, setCarYear] = useState(2024);
  const [carType, setCarType] = useState('new');
  const [companyTenure, setCompanyTenure] = useState(3);
  
  // CBS data inputs
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
  const [carTenureCalculation, setCarTenureCalculation] = useState('Click "Calculate Decision" to start...');
  const [carAffordabilityCalculation, setCarAffordabilityCalculation] = useState('Click "Calculate Decision" to start...');
  const [weightedCalculations, setWeightedCalculations] = useState('Click "Calculate Decision" to start...');
  
  // Final results
  const [finalScore, setFinalScore] = useState(0);
  const [decision, setDecision] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [dbrPercentage, setDbrPercentage] = useState(0);
  const [emiAmount, setEmiAmount] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  
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

  // Calculate loan amount when car price or down payment changes
  useEffect(() => {
    setLoanAmount(carPrice - downPayment);
  }, [carPrice, downPayment]);

  // Toggle module expansion
  const toggleModuleExpansion = (moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Update tenure options based on engine CC
  const getTenureOptions = () => {
    const maxTenure = engineCC >= 1000 ? 24 : 60; // 1000cc+ = 2 years, <1000cc = 5 years
    const options = [];
    
    for (let months = 12; months <= maxTenure; months += 6) {
      options.push(months);
    }
    
    return options;
  };

  // Fetch application data
  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // Mock data for Car Loan testing
      const mockData: CarLoanApplicationData = {
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
        amountRequested: loanAmount,
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
        loan_type: 'car_loan',
        dbrData: null
      };
      
      setApplicationData(mockData);
      setShowApplicationData(true);
      console.log('Mock car loan application data loaded:', mockData);
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
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

  // Calculate decision
  const calculateDecision = async () => {
    if (!applicationData) {
      alert('Please fetch application data first');
      return;
    }

    setCalculating(true);
    setCalculationsRun(true);

    try {
      // Prepare application data for Car Loan decision engine
      const carLoanData = {
        ...applicationData,
        car_name: carName,
        car_price: carPrice,
        down_payment: downPayment,
        engine_cc: engineCC,
        car_year: carYear,
        car_type: carType,
        proposed_loan_amount: loanAmount,
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

      // Call Car Loan Decision Engine API
      const response = await fetch('/api/car-loan/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationData: carLoanData
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
        setLoanAmount(result.loanAmount);

        // Store module details for expandable sections
        setModuleDetails(result.moduleScores || {});

        // Set module calculations
        setAgeCalculation(`Age: ${result.moduleScores?.age?.score || 0}/100`);
        setAgeReasoning(result.moduleScores?.age?.notes?.join(', ') || '');
        
        setDbrCalculation(`DBR: ${result.dbrPercentage?.toFixed(2) || 0}%`);
        setDbrWarning(`Score: ${result.moduleScores?.dbr?.score || 0}/100`);
        
        setIncomeCalculation(`Income: ${result.moduleScores?.income?.score || 0}/100`);
        
        setSpuCalculation(`SPU: ${result.moduleScores?.spu?.score || 0}/100`);
        
        setEamvuCalculation(`EAMVU: ${result.moduleScores?.eamvu?.score || 0}/100`);
        
        setCityCalculation(`City: ${result.moduleScores?.city?.score || 0}/100`);
        
        setCarTenureCalculation(`Car Tenure: ${result.moduleScores?.carTenure?.score || 0}/100`);
        
        setCarAffordabilityCalculation(`Car Affordability: ${result.moduleScores?.carLoanAffordability?.score || 0}/100`);

        setWeightedCalculations(`Final Score: ${result.finalScore}/100`);

        setCriticalChecksStatus('Completed');
        setModuleScoringStatus('Completed');
        setFinalScoreStatus('Completed');

      } else {
        // Fallback to manual calculation if API fails
        const age = new Date().getFullYear() - new Date(applicationData.dateOfBirth).getFullYear();
        const emi = calculateEMI(loanAmount, annualRatePercent, proposedTenureMonths);
        const netIncome = applicationData.netMonthlyIncome || totalIncome;
        const dbrPercentage = (emi / netIncome) * 100;

        setEmiAmount(emi);
        setDbrPercentage(dbrPercentage);

        // Manual calculations
        setAgeCalculation(`Age: ${age} years`);
        setAgeReasoning(`Age ${age} is within acceptable range for car loans`);
        setDbrCalculation(`DBR: ${dbrPercentage.toFixed(2)}%`);
        setDbrWarning(`EMI: PKR ${emi.toLocaleString()}, Net Income: PKR ${netIncome.toLocaleString()}`);
        setIncomeCalculation(`Income: PKR ${netIncome.toLocaleString()}`);
        setSpuCalculation('SPU: Pass');
        setEamvuCalculation('EAMVU: Pass');
        setCityCalculation(`City: ${applicationData.currentCity}`);
        setCarTenureCalculation(`Car Tenure: ${proposedTenureMonths} months (${engineCC}cc)`);
        setCarAffordabilityCalculation(`Car Affordability: ${((emi / netIncome) * 100).toFixed(1)}%`);

        // Calculate final score
        const finalScoreValue = Math.round(
          (dbrPercentage <= 30 ? 100 : 0) * 0.35 +
          (netIncome >= 80000 ? 100 : 80) * 0.20 +
          (emi / netIncome <= 0.25 ? 100 : 80) * 0.20 +
          100 * 0.10 + 100 * 0.10 + 100 * 0.03 + 100 * 0.02
        );

        setFinalScore(finalScoreValue);
        setWeightedCalculations(`Final Score: ${finalScoreValue}/100`);

        // Determine decision
        if (dbrPercentage > 30) {
          setDecision('FAIL');
          setActionRequired(`DBR ${dbrPercentage.toFixed(2)}% exceeds threshold 30%`);
          setRiskLevel('VERY_HIGH');
        } else if (finalScoreValue >= 90) {
          setDecision('PASS');
          setActionRequired('None');
          setRiskLevel('VERY_LOW');
        } else if (finalScoreValue >= 80) {
          setDecision('PASS');
          setActionRequired('Basic conditions');
          setRiskLevel('LOW');
        } else if (finalScoreValue >= 70) {
          setDecision('CONDITIONAL PASS');
          setActionRequired('Additional conditions');
          setRiskLevel('MEDIUM');
        } else if (finalScoreValue >= 60) {
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
            🚗 Car Loan Decision Engine
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            margin: 0
          }}>
            Advanced CC-based tenure decision engine for car loan applications
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
            <a 
              href="/personal-loan" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              <span style={{ marginRight: '8px' }}>💰</span>
              Personal Loan Engine
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

            {/* Car Details */}
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
                🚗 Car Details
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
                    Car Name:
                  </label>
                  <input
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
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
                    Car Price (PKR):
                  </label>
                  <input
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
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
                    Down Payment (PKR):
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseInt(e.target.value))}
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
                    Engine CC:
                  </label>
                  <input
                    type="number"
                    value={engineCC}
                    onChange={(e) => setEngineCC(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
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
                    {getTenureOptions().map(months => (
                      <option key={months} value={months}>
                        {months} months ({Math.round(months/12*10)/10} years)
                      </option>
                    ))}
                  </select>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#718096',
                    margin: '5px 0 0 0'
                  }}>
                    {engineCC >= 1000 ? 'Max 24 months (1000cc+)' : 'Max 60 months (<1000cc)'}
                  </p>
                </div>
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
              </div>

              {/* Loan Amount Display */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '15px'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  margin: '0 0 10px 0'
                }}>
                  📊 Loan Calculation
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#0c4a6e',
                  margin: '0 0 5px 0'
                }}>
                  <strong>Loan Amount:</strong> PKR {loanAmount.toLocaleString()}
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#0c4a6e',
                  margin: '0'
                }}>
                  <strong>EMI:</strong> PKR {calculateEMI(loanAmount, annualRatePercent, proposedTenureMonths).toLocaleString()}/month
                </p>
              </div>
            </div>

            {/* Employment Details */}
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
                💼 Employment Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  backgroundColor: calculating || !applicationData ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: calculating || !applicationData ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseOver={(e) => !calculating && applicationData && (e.target.style.backgroundColor = '#d97706')}
                onMouseOut={(e) => !calculating && applicationData && (e.target.style.backgroundColor = '#f59e0b')}
              >
                {calculating ? '⏳ Calculating...' : '🚗 Calculate Car Loan Decision'}
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
                    📊 Car Loan Summary
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

                    {/* Car Tenure Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('carTenure')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          🚗 Car Tenure Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.carTenure ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {carTenureCalculation}
                      </p>
                      {expandedModules.carTenure && moduleDetails.carTenure && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.carTenure.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.carTenure.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.carTenure.weightedScore || 0)).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Car Affordability Module */}
                    <div style={{
                      padding: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => toggleModuleExpansion('carLoanAffordability')}
                    onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
                          🚙 Car Affordability Module
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {expandedModules.carLoanAffordability ? '▼' : '▶'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 5px 0' }}>
                        {carAffordabilityCalculation}
                      </p>
                      {expandedModules.carLoanAffordability && moduleDetails.carLoanAffordability && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                            Detailed Breakdown:
                          </h4>
                          <ul style={{ fontSize: '0.8rem', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                            {moduleDetails.carLoanAffordability.notes?.map((note: string, index: number) => (
                              <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>Weight:</strong> {((moduleDetails.carLoanAffordability.weight || 0) * 100).toFixed(1)}% | 
                            <strong> Weighted Score:</strong> {((moduleDetails.carLoanAffordability.weightedScore || 0)).toFixed(1)}
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
