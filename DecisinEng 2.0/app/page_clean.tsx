'use client';

import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface ApplicationData {
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

export default function CreditCardDecisionEngine() {
  // State management
  const [applicationId, setApplicationId] = useState(141);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  const [dbrData, setDbrData] = useState<any>(null);
  
  // Manual inputs
  const [cluster, setCluster] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [salaryTransferFlag, setSalaryTransferFlag] = useState('salary_transfer');
  const [totalIncome, setTotalIncome] = useState(50000);
  
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
  const [weightedCalculations, setWeightedCalculations] = useState('Click "Calculate Decision" to start...');
  
  // Actual scores for calculations
  const [cityScore, setCityScore] = useState(0);
  const [incomeScore, setIncomeScore] = useState(0);
  const [eamvuScore, setEamvuScore] = useState(0);
  const [ageScore, setAgeScore] = useState(0);
  const [dbrScore, setDbrScore] = useState(0);
  const [spuScore, setSpuScore] = useState(0);
  
  // Final decision states
  const [finalScore, setFinalScore] = useState(0);
  const [decision, setDecision] = useState('PENDING');
  const [riskLevel, setRiskLevel] = useState('N/A');
  const [actionRequired, setActionRequired] = useState('');
  const [showFinalDecision, setShowFinalDecision] = useState(false);
  const [moduleScores, setModuleScores] = useState<ModuleScore[]>([]);
  
  // Progress bar refs
  const finalScoreProgressRef = useRef<HTMLDivElement>(null);
  const finalScoreLabelRef = useRef<HTMLSpanElement>(null);
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    applicationData: false,
    criticalChecks: true,
    moduleScoring: true,
    finalScore: true
  });

  // Toggle section expand/collapse
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch application data
  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // Use Next.js API route
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Raw API data:', data);
      
      // Map API data to frontend expected format
      const mappedData = {
        applicationId: data.los_id || data.id,
        customerName: data.full_name,
        cnic: data.cnic,
        dateOfBirth: data.date_of_birth,
        age: data.date_of_birth ? new Date().getFullYear() - new Date(data.date_of_birth).getFullYear() : 0,
        gender: data.gender,
        maritalStatus: data.marital_status,
        mobile: data.curr_mobile,
        employmentStatus: data.employment_status,
        occupation: data.occupation,
        companyName: data.company_employer_name,
        designation: data.designation,
        experience: data.length_of_employment || 0,
        grossMonthlySalary: parseFloat(data.gross_monthly_income) || 0,
        netMonthlyIncome: parseFloat(data.total_income) || 0,
        amountRequested: parseFloat(data.collateral_lien_amount) || 0,
        tenure: 24, // Default tenure
        ublCustomer: data.is_ubl_customer === "true" ? "Yes" : "No",
        currentCity: data.curr_city,
        currentAddress: `${data.curr_house_apt || ''} ${data.curr_street || ''}`.trim(),
        officeCity: data.office_city,
        officeAddress: `${data.office_address || ''} ${data.office_street || ''}`.trim(),
        eamvuStatus: data.eavmu_submitted ? "Submitted" : "Not Submitted",
        eavmu_submitted: data.eavmu_submitted,
        spuBlackList: data.spu_black_list_check ? "Yes" : "No",
        spuCreditCard: data.spu_credit_card_30k_check ? "Yes" : "No",
        spuNegativeList: data.spu_negative_list_check ? "Yes" : "No",
        existingDebt: 0, // Default value
        cluster: "FEDERAL" // Default cluster
      };
      
      console.log('Mapped data:', mappedData);
      setApplicationData(mappedData);
      setShowApplicationData(true);
      
      // Auto-populate some fields if available
      if (mappedData.cluster) setCluster(mappedData.cluster);
      if (mappedData.employmentStatus) setEmploymentType(mappedData.employmentStatus.toLowerCase());
      if (mappedData.netMonthlyIncome) setTotalIncome(mappedData.netMonthlyIncome);
      
      // Auto-scroll to API data section
      setTimeout(() => {
        const apiDataSection = document.getElementById('applicationDataSection');
        if (apiDataSection) {
          apiDataSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error fetching application data:', error);
      alert('Failed to fetch application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate decision using new integrated decision engine
  const calculateDecision = async () => {
    if (!applicationData) return;
    
    setCalculating(true);
    setCalculationsRun(true);
    
    try {
      console.log('🚀 Starting Decision Calculation...');
      
      // Reset all calculations
      setAgeCalculation('Calculating...');
      setDbrCalculation('Calculating...');
      setSpuCalculation('Calculating...');
      setCityCalculation('Calculating...');
      setIncomeCalculation('Calculating...');
      setEamvuCalculation('Calculating...');
      setWeightedCalculations('Calculating...');
      
      // Reset statuses
      setCriticalChecksStatus('Processing...');
      setModuleScoringStatus('Processing...');
      setFinalScoreStatus('Processing...');
      
      // Prepare CBS data for decision engine
      const cbsData = {
        average_deposit_balance: parseFloat(cbsDepositBalance) || 0,
        highest_dpd: parseInt(cbsHighestDPD) || 0,
        exposure_in_industry: parseFloat(cbsIndustryExposure) || 0,
        bad_counts_industry: parseInt(cbsBadCountsIndustry) || 0,
        bad_counts_ubl: parseInt(cbsBadCountsUBL) || 0,
        dpd_30_plus: parseInt(cbsDPD30Plus) || 0,
        dpd_60_plus: parseInt(cbsDPD60Plus) || 0,
        defaults_12m: parseInt(cbsDefaults12M) || 0,
        late_payments: parseInt(cbsLatePayments) || 0,
        partial_payments: parseInt(cbsPartialPayments) || 0,
        credit_utilization_ratio: parseFloat(cbsCreditUtilization) || 0
      };
      
      // Prepare ILOS data for decision engine
      const ilosData = {
        applicationId: applicationData.applicationId,
        cnic: applicationData.cnic,
        full_name: applicationData.customerName,
        date_of_birth: applicationData.dateOfBirth,
        curr_city: applicationData.currentCity,
        office_city: applicationData.officeCity,
        education_qualification: 'Masters', // Default
        marital_status: applicationData.maritalStatus,
        employment_status: applicationData.employmentStatus,
        employment_type: employmentType,
        gross_monthly_income: applicationData.grossMonthlySalary,
        total_income: applicationData.netMonthlyIncome,
        net_monthly_income: applicationData.netMonthlyIncome,
        length_of_employment: applicationData.experience,
        nature_of_residence: 'owned', // Default
        num_dependents: 2, // Default
        business_nature: 'IT', // Default
        is_ubl_customer: applicationData.ublCustomer === 'Yes',
        salary_transfer_flag: salaryTransferFlag === 'salary_transfer',
        occupation: applicationData.occupation,
        spu_black_list_check: applicationData.spuBlackList === 'Yes',
        spu_credit_card_30k_check: applicationData.spuCreditCard === 'Yes',
        spu_negative_list_check: applicationData.spuNegativeList === 'Yes',
        spu_pep_list_check: false,
        spu_ctl_check: false,
        spu_frmu_check: false,
        spu_ecib_check: false,
        eavmu_submitted: applicationData.eavmu_submitted
      };
      
      console.log('📥 ILOS Data:', ilosData);
      console.log('📥 CBS Data:', cbsData);
      
      // Call the new decision engine API
      const response = await fetch('http://localhost:5000/api/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationData: ilosData,
          cbsData: cbsData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const decisionResult = await response.json();
      console.log('🎯 Decision Result:', decisionResult);
      
      // Update UI with results
      updateUIWithDecisionResult(decisionResult.decision);
      
    } catch (error) {
      console.error('❌ Error in decision calculation:', error);
      alert('Error calculating decision: ' + (error as Error).message);
    } finally {
      setCalculating(false);
    }
  };
  
  // Update UI with decision result
  const updateUIWithDecisionResult = (decision: any) => {
    // Update individual module scores
    setAgeScore(decision.moduleScores?.application_score?.breakdown?.age || 0);
    setDbrScore(decision.moduleScores?.dbr?.score || 0);
    setSpuScore(decision.moduleScores?.spu?.score || 0);
    setCityScore(decision.moduleScores?.application_score?.breakdown?.city || 0);
    setIncomeScore(decision.moduleScores?.income?.score || 0);
    setEamvuScore(decision.moduleScores?.eamvu?.score || 0);
    
    // Update calculations display
    setAgeCalculation(`Age: ${decision.moduleScores?.application_score?.breakdown?.age || 0}/100`);
    setDbrCalculation(`DBR: ${decision.moduleScores?.dbr?.score || 0}/100 (${decision.dbrPercentage || 0}%)`);
    setSpuCalculation(`SPU: ${decision.moduleScores?.spu?.score || 0}/100`);
    setCityCalculation(`City: ${decision.moduleScores?.application_score?.breakdown?.city || 0}/100`);
    setIncomeCalculation(`Income: ${decision.moduleScores?.income?.score || 0}/100`);
    setEamvuCalculation(`EAMVU: ${decision.moduleScores?.eamvu?.score || 0}/100`);
    
    // Update final score
    setFinalScore(decision.finalScore || 0);
    setDecision(decision.decision || 'UNKNOWN');
    setRiskLevel(decision.riskLevel || 'UNKNOWN');
    setActionRequired(decision.actionRequired || 'None');
    
    // Update weighted calculations
    const weightedCalc = `
      DBR: ${decision.moduleScores?.dbr?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.dbr?.score || 0} × 0.55)
      SPU: ${decision.moduleScores?.spu?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.spu?.score || 0} × 0.10)
      EAMVU: ${decision.moduleScores?.eamvu?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.eamvu?.score || 0} × 0.10)
      Application: ${decision.moduleScores?.application_score?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.application_score?.score || 0} × 0.15)
      Behavioral: ${decision.moduleScores?.behavioral_score?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.behavioral_score?.score || 0} × 0.10)
      Income: ${decision.moduleScores?.income?.weightedScore?.toFixed(2) || 0} (${decision.moduleScores?.income?.score || 0} × 0.15)
      Total: ${decision.finalScore || 0}/100
    `;
    setWeightedCalculations(weightedCalc);
    
    // Update statuses
    setCriticalChecksStatus(decision.decision === 'FAIL' ? 'FAIL' : 'PASS');
    setModuleScoringStatus('COMPLETE');
    setFinalScoreStatus('COMPLETE');
    
    console.log('✅ UI Updated with Decision Result');
  };

  // Load sample data
  const loadSampleData = () => {
    const realApiData = {
      applicationId: 104,
      customerName: "John Doe",
      cnic: "3520111112221",
      dateOfBirth: "1985-06-15",
      age: 38,
      gender: "Male",
      maritalStatus: "Married",
      mobile: "03001234567",
      employmentStatus: "employed",
      occupation: "Software Engineer",
      companyName: "Tech Corp",
      designation: "Senior Developer",
      experience: 5,
      grossMonthlySalary: 100000,
      netMonthlyIncome: 80000,
      amountRequested: 500000,
      tenure: 24,
      ublCustomer: "Yes",
      currentCity: "Karachi",
      currentAddress: "123 Main Street, Karachi",
      officeCity: "Karachi",
      officeAddress: "456 Business District, Karachi",
      eamvuStatus: "Submitted",
      eavmu_submitted: true,
      spuBlackList: "No",
      spuCreditCard: "No",
      spuNegativeList: "No",
      existingDebt: 15000,
      cluster: "FEDERAL"
    };
    
    setApplicationData(realApiData);
    setShowApplicationData(true);
    setApplicationId(104);
    setCluster("FEDERAL");
    setEmploymentType("permanent");
    setTotalIncome(70000);
    
    // Set sample CBS data
    setCbsDepositBalance('750000');
    setCbsHighestDPD('0');
    setCbsIndustryExposure('0');
    setCbsBadCountsIndustry('0');
    setCbsBadCountsUBL('0');
    setCbsDPD30Plus('0');
    setCbsDPD60Plus('0');
    setCbsDefaults12M('0');
    setCbsLatePayments('0');
    setCbsPartialPayments('0');
    setCbsCreditUtilization('0.25');
  };

  // Reset form
  const resetForm = () => {
    setApplicationId(141);
    setLoading(false);
    setCalculating(false);
    setApplicationData(null);
    setShowApplicationData(false);
    setCalculationsRun(false);
    setCluster('');
    setEmploymentType('permanent');
    setSalaryTransferFlag('salary_transfer');
    setTotalIncome(50000);
    
    // Reset CBS data
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
    
    // Reset calculation results
    setAgeCalculation('Click "Calculate Decision" to start...');
    setDbrCalculation('Click "Calculate Decision" to start...');
    setSpuCalculation('Click "Calculate Decision" to start...');
    setCityCalculation('Click "Calculate Decision" to start...');
    setIncomeCalculation('Click "Calculate Decision" to start...');
    setEamvuCalculation('Click "Calculate Decision" to start...');
    setWeightedCalculations('Click "Calculate Decision" to start...');
    setDbrWarning('');
    setDbrData(null);
    
    // Reset score state variables
    setCityScore(0);
    setIncomeScore(0);
    setEamvuScore(0);
    setAgeScore(0);
    setDbrScore(0);
    setSpuScore(0);
    
    // Reset statuses
    setCriticalChecksStatus('Pending');
    setModuleScoringStatus('Pending');
    setFinalScoreStatus('Pending');
    setDbrLoading(false);
    
    // Reset final decision
    setFinalScore(0);
    setDecision('PENDING');
    setRiskLevel('N/A');
    setActionRequired('');
    setShowFinalDecision(false);
    setModuleScores([]);
    
    // Reset progress bar
    if (finalScoreProgressRef.current && finalScoreLabelRef.current) {
      finalScoreProgressRef.current.style.width = '0%';
      finalScoreLabelRef.current.textContent = '0/100';
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🏦 Credit Card Decision Engine</h1>
        <p>Real-time, transparent credit decisioning with interactive scoring</p>
      </header>

      <div className="main-layout" style={{ 
        display: 'flex', 
        flexDirection: showApplicationData ? 'row' : 'column',
        gap: '20px',
        minHeight: '100vh'
      }}>
        {/* Left Panel - Input Controls */}
        <div className="left-panel" style={{ 
          width: showApplicationData ? '50%' : '100%',
          maxWidth: showApplicationData ? '600px' : 'none'
        }}>
          <div className="section">
            <h2 className="section-title">📋 Application Input</h2>
            
            <div className="form-group">
              <label htmlFor="applicationId">Application ID:</label>
              <input 
                type="number" 
                id="applicationId" 
                value={applicationId} 
                onChange={(e) => setApplicationId(parseInt(e.target.value) || 0)}
                placeholder="Enter application ID"
              />
            </div>
            
            <button 
              id="fetchBtn" 
              onClick={fetchApplicationData}
              disabled={loading}
              style={{ 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                marginRight: '10px'
              }}
            >
              <span>{loading ? '🔄 Fetching...' : '📥 Fetch API Data'}</span>
            </button>

            {loading && (
              <div id="loading" className="loading">
                <div className="spinner"></div>
                <p>🔄 Fetching application data...</p>
              </div>
            )}
          </div>

          <div className="section">
            <h2 className="section-title">🎯 Manual Inputs</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Enter income values manually if not available from API data
            </p>
            
            <div className="data-grid">
              <div className="form-group">
                <label htmlFor="cluster">Cluster:</label>
                <select 
                  id="cluster" 
                  value={cluster} 
                  onChange={(e) => setCluster(e.target.value)}
                >
                  <option value="">Select Cluster</option>
                  <option value="FEDERAL">FEDERAL (30 points)</option>
                  <option value="SOUTH">SOUTH (25 points)</option>
                  <option value="NORTHERN_PUNJAB">NORTHERN_PUNJAB (20 points)</option>
                  <option value="NORTH">NORTH (15 points)</option>
                  <option value="SOUTHERN_PUNJAB">SOUTHERN_PUNJAB (10 points)</option>
                  <option value="KP">KP (5 points)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="employmentType">Employment Type:</label>
                <select 
                  id="employmentType" 
                  value={employmentType} 
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="permanent">Permanent</option>
                  <option value="contractual">Contractual</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business</option>
                  <option value="probation">Probation</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="salaryTransferFlag">Salary Transfer:</label>
                <select 
                  id="salaryTransferFlag" 
                  value={salaryTransferFlag} 
                  onChange={(e) => setSalaryTransferFlag(e.target.value)}
                >
                  <option value="salary_transfer">Salary Transfer</option>
                  <option value="non_salary_transfer">Non-Salary Transfer</option>
                </select>
              </div>
              
               
            </div>
          </div>

          {/* CBS Data Input Section */}
          <div className="section">
            <h2 className="section-title">🏦 CBS Data Input</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Enter CBS/ECIB data manually for behavioral scoring
            </p>
            
            <div className="data-grid">
              <div className="form-group">
                <label htmlFor="cbsDepositBalance">Average Deposit Balance:</label>
                <input 
                  type="number" 
                  id="cbsDepositBalance" 
                  value={cbsDepositBalance} 
                  onChange={(e) => setCbsDepositBalance(e.target.value)}
                  placeholder="500000"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsHighestDPD">Highest DPD:</label>
                <input 
                  type="number" 
                  id="cbsHighestDPD" 
                  value={cbsHighestDPD} 
                  onChange={(e) => setCbsHighestDPD(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsIndustryExposure">Industry Exposure:</label>
                <input 
                  type="number" 
                  id="cbsIndustryExposure" 
                  value={cbsIndustryExposure} 
                  onChange={(e) => setCbsIndustryExposure(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsBadCountsIndustry">Bad Counts Industry:</label>
                <input 
                  type="number" 
                  id="cbsBadCountsIndustry" 
                  value={cbsBadCountsIndustry} 
                  onChange={(e) => setCbsBadCountsIndustry(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsBadCountsUBL">Bad Counts UBL:</label>
                <input 
                  type="number" 
                  id="cbsBadCountsUBL" 
                  value={cbsBadCountsUBL} 
                  onChange={(e) => setCbsBadCountsUBL(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsDPD30Plus">DPD 30+:</label>
                <input 
                  type="number" 
                  id="cbsDPD30Plus" 
                  value={cbsDPD30Plus} 
                  onChange={(e) => setCbsDPD30Plus(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsDPD60Plus">DPD 60+:</label>
                <input 
                  type="number" 
                  id="cbsDPD60Plus" 
                  value={cbsDPD60Plus} 
                  onChange={(e) => setCbsDPD60Plus(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsDefaults12M">Defaults 12M:</label>
                <input 
                  type="number" 
                  id="cbsDefaults12M" 
                  value={cbsDefaults12M} 
                  onChange={(e) => setCbsDefaults12M(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsLatePayments">Late Payments:</label>
                <input 
                  type="number" 
                  id="cbsLatePayments" 
                  value={cbsLatePayments} 
                  onChange={(e) => setCbsLatePayments(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsPartialPayments">Partial Payments:</label>
                <input 
                  type="number" 
                  id="cbsPartialPayments" 
                  value={cbsPartialPayments} 
                  onChange={(e) => setCbsPartialPayments(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbsCreditUtilization">Credit Utilization Ratio:</label>
                <input 
                  type="number" 
                  id="cbsCreditUtilization" 
                  value={cbsCreditUtilization} 
                  onChange={(e) => setCbsCreditUtilization(e.target.value)}
                  placeholder="0.3"
                  step="0.1"
                  min="0"
                  max="1"
                />
              </div>
            </div>
          </div>

          {/* Show API Data after fetching */}
          {showApplicationData && (
            <div className="section" id="applicationDataSection">
              <h2 
                className={`section-title collapsible ${expandedSections.applicationData ? 'active' : ''}`} 
                onClick={() => toggleSection('applicationData')}
              >
                📄 API Fetched Data <small>(Click to expand/collapse)</small>
              </h2>
              
              <div className={`collapsible-content ${expandedSections.applicationData ? 'expanded' : ''}`}>
                <div className="data-grid">
                  <div className="data-card">
                    <h3>Basic Info</h3>
                    <div className="data-row">
                      <span className="data-label">Application ID:</span>
                      <span className="data-value">{applicationData?.applicationId || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Customer Name:</span>
                      <span className="data-value">{applicationData?.customerName || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">CNIC:</span>
                      <span className="data-value">{applicationData?.cnic || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Date of Birth:</span>
                      <span className="data-value">{applicationData?.dateOfBirth || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Age:</span>
                      <span className="data-value">{applicationData?.age || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Gender:</span>
                      <span className="data-value">{applicationData?.gender || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Marital Status:</span>
                      <span className="data-value">{applicationData?.maritalStatus || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Mobile:</span>
                      <span className="data-value">{applicationData?.mobile || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="data-card">
                    <h3>Employment & Income</h3>
                    <div className="data-row">
                      <span className="data-label">Employment Status:</span>
                      <span className="data-value">{applicationData?.employmentStatus || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Occupation:</span>
                      <span className="data-value">{applicationData?.occupation || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Company Name:</span>
                      <span className="data-value">{applicationData?.companyName || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Designation:</span>
                      <span className="data-value">{applicationData?.designation || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Experience (Years):</span>
                      <span className="data-value">{applicationData?.experience || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Gross Monthly Salary:</span>
                      <span className="data-value">PKR {applicationData?.grossMonthlySalary?.toLocaleString() || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Net Monthly Income:</span>
                      <span className="data-value">PKR {applicationData?.netMonthlyIncome?.toLocaleString() || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Amount Requested:</span>
                      <span className="data-value">PKR {applicationData?.amountRequested?.toLocaleString() || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Tenure (Months):</span>
                      <span className="data-value">{applicationData?.tenure || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">UBL Customer:</span>
                      <span className="data-value">{applicationData?.ublCustomer || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="data-card">
                    <h3>Address & Location</h3>
                    <div className="data-row">
                      <span className="data-label">Current City:</span>
                      <span className="data-value">{applicationData?.currentCity || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Current Address:</span>
                      <span className="data-value">{applicationData?.currentAddress || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Office City:</span>
                      <span className="data-value">{applicationData?.officeCity || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Office Address:</span>
                      <span className="data-value">{applicationData?.officeAddress || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Cluster:</span>
                      <span className="data-value">{applicationData?.cluster || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="data-card">
                    <h3>Verification & Checks</h3>
                    <div className="data-row">
                      <span className="data-label">EAMVU Status:</span>
                      <span className="data-value">{applicationData?.eamvuStatus || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Black List:</span>
                      <span className="data-value">{applicationData?.spuBlackList || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Credit Card:</span>
                      <span className="data-value">{applicationData?.spuCreditCard || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Negative List:</span>
                      <span className="data-value">{applicationData?.spuNegativeList || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Existing Debt:</span>
                      <span className="data-value">PKR {applicationData?.existingDebt?.toLocaleString() || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="section">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={loadSampleData}
                style={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                📋 Load Sample Data
              </button>
              
              <button 
                onClick={calculateDecision}
                disabled={calculating || !applicationData}
                style={{ 
                  backgroundColor: calculating ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: calculating || !applicationData ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <span>{calculating ? '🔄 Calculating...' : '🚀 Calculate Decision'}</span>
              </button>
              
              <button 
                onClick={resetForm}
                style={{ 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                🔄 Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        {showApplicationData && (
          <div className="right-panel" style={{ 
            width: '50%',
            minWidth: '600px'
          }}>
            {/* Critical Checks Section */}
            <div className="section">
              <h2 
                className={`section-title collapsible ${expandedSections.criticalChecks ? 'active' : ''}`} 
                onClick={() => toggleSection('criticalChecks')}
              >
                ⚠️ Critical Checks <small>(Click to expand/collapse)</small>
                <span className={`status-badge ${criticalChecksStatus.toLowerCase()}`}>
                  {criticalChecksStatus}
                </span>
              </h2>
              
              <div className={`collapsible-content ${expandedSections.criticalChecks ? 'expanded' : ''}`}>
                <div className="calculation-item">
                  <h4>Age Check</h4>
                  <p className="calculation-result">{ageCalculation}</p>
                  <p className="calculation-reasoning">{ageReasoning}</p>
                </div>
                
                <div className="calculation-item">
                  <h4>DBR Check</h4>
                  <p className="calculation-result">{dbrCalculation}</p>
                  {dbrWarning && <p className="calculation-warning">{dbrWarning}</p>}
                </div>
                
                <div className="calculation-item">
                  <h4>SPU Check</h4>
                  <p className="calculation-result">{spuCalculation}</p>
                </div>
              </div>
            </div>

            {/* Module Scoring Section */}
            <div className="section">
              <h2 
                className={`section-title collapsible ${expandedSections.moduleScoring ? 'active' : ''}`} 
                onClick={() => toggleSection('moduleScoring')}
              >
                📊 Module Scoring <small>(Click to expand/collapse)</small>
                <span className={`status-badge ${moduleScoringStatus.toLowerCase()}`}>
                  {moduleScoringStatus}
                </span>
              </h2>
              
              <div className={`collapsible-content ${expandedSections.moduleScoring ? 'expanded' : ''}`}>
                <div className="calculation-item">
                  <h4>City Scoring</h4>
                  <p className="calculation-result">{cityCalculation}</p>
                </div>
                
                <div className="calculation-item">
                  <h4>Income Scoring</h4>
                  <p className="calculation-result">{incomeCalculation}</p>
                </div>
                
                <div className="calculation-item">
                  <h4>EAMVU Scoring</h4>
                  <p className="calculation-result">{eamvuCalculation}</p>
                </div>
              </div>
            </div>

            {/* Final Score Section */}
            <div className="section">
              <h2 
                className={`section-title collapsible ${expandedSections.finalScore ? 'active' : ''}`} 
                onClick={() => toggleSection('finalScore')}
              >
                🎯 Final Score <small>(Click to expand/collapse)</small>
                <span className={`status-badge ${finalScoreStatus.toLowerCase()}`}>
                  {finalScoreStatus}
                </span>
              </h2>
              
              <div className={`collapsible-content ${expandedSections.finalScore ? 'expanded' : ''}`}>
                <div className="final-score-display">
                  <div className="score-circle">
                    <div className="score-value">{finalScore.toFixed(1)}</div>
                    <div className="score-label">/ 100</div>
                  </div>
                  
                  <div className="score-details">
                    <h3>Decision: {decision}</h3>
                    <p><strong>Risk Level:</strong> {riskLevel}</p>
                    <p><strong>Action Required:</strong> {actionRequired}</p>
                  </div>
                </div>
                
                <div className="weighted-calculations">
                  <h4>Weighted Calculations</h4>
                  <pre className="calculation-breakdown">{weightedCalculations}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
