'use client';

import React, { useState, useEffect, useRef } from 'react';

// Import modules
import SPUModule from '../lib/modules/SPU';
import EAMVUModule from '../lib/modules/EAMVU';
import CityModule from '../lib/modules/City';
import AgeModule from '../lib/modules/Age';
import DBRModule from '../lib/modules/DBR';
import IncomeModule from '../lib/modules/Income';
import DecisionEngine from '../lib/modules/DecisionEngine';
import DataService from '../lib/modules/DataService';

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
  
  // Progress bar ref
  const finalScoreProgressRef = useRef<HTMLDivElement>(null);
  const finalScoreLabelRef = useRef<HTMLDivElement>(null);
  
  // Collapsible states
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
        education_qualification: applicationData.education || 'Masters',
        marital_status: applicationData.maritalStatus,
        employment_status: applicationData.employmentStatus,
        employment_type: employmentType,
        gross_monthly_income: applicationData.grossMonthlySalary,
        total_income: applicationData.netMonthlyIncome,
        net_monthly_income: applicationData.netMonthlyIncome,
        length_of_employment: applicationData.experience,
        nature_of_residence: applicationData.residenceType || 'owned',
        num_dependents: applicationData.dependents || 2,
        business_nature: applicationData.industry || 'IT',
        is_ubl_customer: applicationData.ublCustomer === 'Yes',
        salary_transfer_flag: salaryTransfer === 'Yes',
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
      alert('Error calculating decision: ' + error.message);
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
    setFinalDecision(decision.decision || 'UNKNOWN');
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
      
      // 6. EAMVU Scoring
      console.log('6️⃣ Running EAMVU Scoring...');
      const eamvuResult = calculateEAMVUScoringAndGetScore();
      
      // 7. Final Score - Calculate with actual results
      console.log('7️⃣ Running Final Score...');
      calculateFinalScoreWithResults(ageResult, dbrResult, spuResult, cityResult, incomeResult, eamvuResult);
      
      // Show final decision panel
      setShowFinalDecision(true);
      
      console.log('✅ All calculations completed');
      
    } catch (error) {
      console.error('❌ Error in decision calculation:', error);
      alert('Error calculating decision. Please try again.');
    } finally {
      setCalculating(false);
    }
  };


  // Age Check Calculation
  const calculateAgeCheck = () => {
    const age = applicationData?.age || 0;
    const ageModule = new AgeModule();
    const result = ageModule.calculate({ 
      age, 
      employment_status: employmentType,
      date_of_birth: applicationData?.dateOfBirth,
      occupation: applicationData?.occupation || ''
    });
    
    // Age score: 100 if pass, 0 if fail
    const score = result.hardStop ? 0 : 100;
    setAgeScore(score);
    
    setAgeCalculation(`Age: ${age}, Employment: ${employmentType} → ${result.hardStop ? 'FAIL' : 'PASS'}`);
    setAgeReasoning(result.hardStop || result.notes?.join(', ') || 'Age must be within acceptable limits based on employment type.');
    
    if (result.hardStop) {
      setCriticalChecksStatus('FAIL');
    }
    
    console.log('Age Score calculated:', score);
  };

  // Age Check Calculation - Returns score directly
  const calculateAgeCheckAndGetScore = () => {
    const age = applicationData?.age || 0;
    const ageModule = new AgeModule();
    const result = ageModule.calculate({ 
      age, 
      employment_status: employmentType,
      date_of_birth: applicationData?.dateOfBirth,
      occupation: applicationData?.occupation || ''
    });
    
    // Age score: 100 if pass, 0 if fail
    const score = result.hardStop ? 0 : 100;
    
    // Update UI
    setAgeScore(score);
    setAgeCalculation(`Age: ${age}, Employment: ${employmentType} → ${result.hardStop ? 'FAIL' : 'PASS'}`);
    setAgeReasoning(result.hardStop || result.notes?.join(', ') || 'Age must be within acceptable limits based on employment type.');
    
    if (result.hardStop) {
      setCriticalChecksStatus('FAIL');
    }
    
    console.log('Age Score calculated:', score);
    return score;
  };

  // DBR Check Calculation using actual API
  const calculateDBRFromAPI = async () => {
    console.log('🔍 DBR API Calculation Started');
    setDbrLoading(true);
    
    try {
      // Call the actual DBR API
      const response = await fetch('http://localhost:5000/api/dbr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          losId: applicationData?.applicationId || applicationId,
          loan_type: 'creditcard_applications'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const dbrResult = await response.json();
      console.log('✅ DBR API Response:', dbrResult);
      
      // Store DBR data
      setDbrData(dbrResult);
      
      // Update DBR calculation display
      const dbrPercentage = dbrResult.dbr || 0;
      const status = dbrResult.status || 'UNKNOWN';
      const threshold = dbrResult.threshold || 40;
      
      const dbrText = `DBR: ${dbrPercentage.toFixed(1)}% → ${status.toUpperCase()} (Threshold: ${threshold}%)`;
      console.log('✅ DBR Result:', dbrText);
      
      setDbrCalculation(dbrText);
      
      // DBR score: 100 if pass, 0 if fail
      const dbrScore = (status === 'pass' && dbrPercentage <= threshold) ? 100 : 0;
      setDbrScore(dbrScore);
      console.log('DBR Score calculated:', dbrScore);
      
      // Set warnings based on DBR status
      if (status === 'fail' || dbrPercentage > threshold) {
        setDbrWarning('Critical DBR threshold exceeded');
        setCriticalChecksStatus('FAIL');
      } else if (dbrPercentage > threshold * 0.8) {
        setDbrWarning('DBR approaching threshold');
      } else {
        setDbrWarning('');
      }
      
      console.log('🔍 DBR API Calculation Complete:', {
        dbrPercentage,
        status,
        threshold,
        dbrText,
        dbrResult
      });
      
      return dbrScore;
      
    } catch (error) {
      console.error('❌ Error calling DBR API:', error);
      setDbrCalculation('DBR: Error calling API');
      setDbrWarning('Error calling DBR API');
      return 0;
    } finally {
      setDbrLoading(false);
      console.log('🏁 DBR API Calculation Finished');
    }
  };

  // DBR Check Calculation - Returns score directly
  const calculateDBRFromAPIAndGetScore = async () => {
    return await calculateDBRFromAPI();
  };

  // SPU Check Calculation
  const calculateSPUCheck = () => {
    const spuModule = new SPUModule();
    const result = spuModule.calculate({
      spu_black_list_check: applicationData?.spuBlackList === 'Yes' || false,
      spu_negative_list_check: applicationData?.spuNegativeList === 'Yes' || false,
      spu_credit_card_30k_check: applicationData?.spuCreditCard === 'Yes' || false
    });
    
    const score = result.raw || 0;
    setSpuScore(score);
    console.log('SPU Score calculated:', score);
    
    setSpuCalculation(`SPU Score: ${score} → ${score === 100 ? 'PASS' : 'FAIL'}`);
    
    if (score === 0) {
      setCriticalChecksStatus('FAIL');
    } else if (criticalChecksStatus !== 'FAIL') {
      setCriticalChecksStatus('PASS');
    }
  };

  // SPU Check Calculation - Returns score directly
  const calculateSPUCheckAndGetScore = () => {
    const spuModule = new SPUModule();
    const result = spuModule.calculate({
      spu_black_list_check: applicationData?.spuBlackList === 'Yes' || false,
      spu_negative_list_check: applicationData?.spuNegativeList === 'Yes' || false,
      spu_credit_card_30k_check: applicationData?.spuCreditCard === 'Yes' || false
    });
    
    const score = result.raw || 0;
    
    // Update UI
    setSpuScore(score);
    setSpuCalculation(`SPU Score: ${score} → ${score === 100 ? 'PASS' : 'FAIL'}`);
    
    if (score === 0) {
      setCriticalChecksStatus('FAIL');
    } else if (criticalChecksStatus !== 'FAIL') {
      setCriticalChecksStatus('PASS');
    }
    
    console.log('SPU Score calculated:', score);
    return score;
  };

  // City Scoring Calculation
  const calculateCityScoring = () => {
    const cityModule = new CityModule();
    const result = cityModule.calculate({
      curr_city: applicationData?.currentCity || '',
      office_city: applicationData?.officeCity || '',
      cluster: cluster,
      curr_house_apt: applicationData?.currentAddress,
      office_address: applicationData?.officeAddress
    });
    
    const score = result.raw || 0;
    setCityScore(score);
    setCityCalculation(`City Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    console.log('City Score calculated:', score);
  };

  // City Scoring Calculation - Returns score directly
  const calculateCityScoringAndGetScore = () => {
    const cityModule = new CityModule();
    const result = cityModule.calculate({
      curr_city: applicationData?.currentCity || '',
      office_city: applicationData?.officeCity || '',
      cluster: cluster,
      curr_house_apt: applicationData?.currentAddress,
      office_address: applicationData?.officeAddress
    });
    
    const score = result.raw || 0;
    
    // Update UI
    setCityScore(score);
    setCityCalculation(`City Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    
    console.log('City Score calculated:', score);
    return score;
  };

  // Income Scoring Calculation
  const calculateIncomeScoring = () => {
    console.log('Income calculation triggered');
    
    if (!applicationData) {
      console.log('No application data available for income calculation');
      setIncomeCalculation('Waiting for application data...');
      return;
    }
    
    const incomeModule = new IncomeModule();
    
    // Use API data directly - prioritize netMonthlyIncome from API
    const netMonthlyIncome = applicationData?.netMonthlyIncome || 0;
    const grossMonthlySalary = applicationData?.grossMonthlySalary || netMonthlyIncome; // Use net as gross if gross not available
    const experience = applicationData?.experience || 0;
    const ublCustomer = applicationData?.ublCustomer === 'Yes';
    const salaryTransfer = salaryTransferFlag === 'salary_transfer';
    
    console.log('🔍 Income Calculation Debug:', {
      'API netMonthlyIncome': applicationData?.netMonthlyIncome,
      'API grossMonthlySalary': applicationData?.grossMonthlySalary,
      'Final netMonthlyIncome': netMonthlyIncome,
      'Final grossMonthlySalary': grossMonthlySalary,
      'employmentType': employmentType,
      'salaryTransferFlag': salaryTransferFlag,
      'salaryTransfer (boolean)': salaryTransfer,
      'experience': experience,
      'ublCustomer (string)': applicationData?.ublCustomer,
      'ublCustomer (boolean)': ublCustomer
    });
    
    const incomeData = {
      net_monthly_income: netMonthlyIncome,
      gross_monthly_income: grossMonthlySalary,
      total_income: netMonthlyIncome,
      employment_status: employmentType,
      employment_type: employmentType,
      salary_transfer_flag: salaryTransfer,
      length_of_employment: experience,
      is_ubl_customer: ublCustomer
    };
    
    console.log('🔍 Income Module Input:', incomeData);
    
    const result = incomeModule.calculate(incomeData);
    
    console.log('🔍 Income Module Result:', {
      raw: result.raw,
      notes: result.notes,
      flags: result.flags
    });
    
    const score = result.raw || 0;
    setIncomeScore(score);
    setIncomeCalculation(`Income Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    console.log('✅ Income Score calculated:', score);
  };

  // Income Scoring Calculation - Returns score directly
  const calculateIncomeScoringAndGetScore = () => {
    console.log('Income calculation triggered');
    
    if (!applicationData) {
      console.log('No application data available for income calculation');
      setIncomeCalculation('Waiting for application data...');
      return 0;
    }
    
    const incomeModule = new IncomeModule();
    
    // Use API data directly - prioritize netMonthlyIncome from API
    const netMonthlyIncome = applicationData?.netMonthlyIncome || 0;
    const grossMonthlySalary = applicationData?.grossMonthlySalary || netMonthlyIncome; // Use net as gross if gross not available
    const experience = applicationData?.experience || 0;
    const ublCustomer = applicationData?.ublCustomer === 'Yes';
    const salaryTransfer = salaryTransferFlag === 'salary_transfer';
    
    console.log('🔍 Income Calculation Debug:', {
      'API netMonthlyIncome': applicationData?.netMonthlyIncome,
      'API grossMonthlySalary': applicationData?.grossMonthlySalary,
      'Final netMonthlyIncome': netMonthlyIncome,
      'Final grossMonthlySalary': grossMonthlySalary,
      'employmentType': employmentType,
      'salaryTransferFlag': salaryTransferFlag,
      'salaryTransfer (boolean)': salaryTransfer,
      'experience': experience,
      'ublCustomer (string)': applicationData?.ublCustomer,
      'ublCustomer (boolean)': ublCustomer
    });
    
    const incomeData = {
      net_monthly_income: netMonthlyIncome,
      gross_monthly_income: grossMonthlySalary,
      total_income: netMonthlyIncome,
      employment_status: employmentType,
      employment_type: employmentType,
      salary_transfer_flag: salaryTransfer,
      length_of_employment: experience,
      is_ubl_customer: ublCustomer
    };
    
    console.log('🔍 Income Module Input:', incomeData);
    
    const result = incomeModule.calculate(incomeData);
    
    console.log('🔍 Income Module Result:', {
      raw: result.raw,
      notes: result.notes,
      flags: result.flags
    });
    
    const score = result.raw || 0;
    
    // Update UI
    setIncomeScore(score);
    setIncomeCalculation(`Income Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    
    console.log('✅ Income Score calculated:', score);
    return score;
  };

  // EAMVU Scoring Calculation
  const calculateEAMVUScoring = () => {
    console.log('EAMVU calculation triggered');
    
    if (!applicationData) {
      console.log('No application data available for EAMVU calculation');
      setEamvuCalculation('Waiting for application data...');
      return;
    }
    
    const eamvuModule = new EAMVUModule();
    
    // Check both possible field names from API data
    const eamvuSubmitted = applicationData?.eamvuStatus === 'Submitted' || 
                          applicationData?.eavmu_submitted === true ||
                          applicationData?.eavmu_submitted === 'true';
    
    console.log('EAMVU Data:', {
      eamvuStatus: applicationData?.eamvuStatus,
      eavmu_submitted: applicationData?.eavmu_submitted,
      calculated: eamvuSubmitted,
      applicationData: applicationData
    });
    
    const result = eamvuModule.calculate({
      eavmu_submitted: eamvuSubmitted
    });
    
    const score = result.raw || 0;
    setEamvuScore(score);
    console.log('EAMVU Result:', result);
    setEamvuCalculation(`EAMVU Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    console.log('EAMVU Score calculated:', score);
  };

  // EAMVU Scoring Calculation - Returns score directly
  const calculateEAMVUScoringAndGetScore = () => {
    console.log('EAMVU calculation triggered');
    
    if (!applicationData) {
      console.log('No application data available for EAMVU calculation');
      setEamvuCalculation('Waiting for application data...');
      return 0;
    }
    
    const eamvuModule = new EAMVUModule();
    
    // Check both possible field names from API data
    const eamvuSubmitted = applicationData?.eamvuStatus === 'Submitted' || 
                          applicationData?.eavmu_submitted === true ||
                          applicationData?.eavmu_submitted === 'true';
    
    console.log('EAMVU Data:', {
      eamvuStatus: applicationData?.eamvuStatus,
      eavmu_submitted: applicationData?.eavmu_submitted,
      calculated: eamvuSubmitted,
      applicationData: applicationData
    });
    
    const result = eamvuModule.calculate({
      eavmu_submitted: eamvuSubmitted
    });
    
    const score = result.raw || 0;
    
    // Update UI
    setEamvuScore(score);
    setEamvuCalculation(`EAMVU Score: ${score} (${result.notes?.join(', ') || 'No notes'})`);
    
    console.log('EAMVU Score calculated:', score);
    return score;
  };

  // Final Score Calculation
  const calculateFinalScore = () => {
    console.log('Final Score Calculation - Using all state scores:', {
      ageScore,
      dbrScore,
      spuScore,
      cityScore,
      incomeScore,
      eamvuScore
    });
    
    // Calculate weighted scores for all components
    // DBR: 55%, SPU: 10%, EAMVU: 10%, Income: 15%, Age: 5%, City: 5%
    const weightedDbr = dbrScore * 0.55;
    const weightedSpu = spuScore * 0.10;
    const weightedEamvu = eamvuScore * 0.10;
    const weightedIncome = incomeScore * 0.15;
    const weightedAge = ageScore * 0.05;
    const weightedCity = cityScore * 0.05;
    
    const totalWeighted = weightedAge + weightedDbr + weightedSpu + weightedCity + weightedIncome + weightedEamvu;
    
    console.log('Weighted calculations:', {
      weightedAge,
      weightedDbr,
      weightedSpu,
      weightedCity,
      weightedIncome,
      weightedEamvu,
      totalWeighted
    });
    
    // Update weighted calculations display
    setWeightedCalculations(
      `DBR Score: ${dbrScore} × 55% = ${weightedDbr.toFixed(2)}\n` +
      `SPU Score: ${spuScore} × 10% = ${weightedSpu.toFixed(2)}\n` +
      `EAMVU Score: ${eamvuScore} × 10% = ${weightedEamvu.toFixed(2)}\n` +
      `Income Score: ${incomeScore} × 15% = ${weightedIncome.toFixed(2)}\n` +
      `Age Score: ${ageScore} × 5% = ${weightedAge.toFixed(2)}\n` +
      `City Score: ${cityScore} × 5% = ${weightedCity.toFixed(2)}\n` +
      `──────────────────────\n` +
      `Total Weighted Score: ${totalWeighted.toFixed(2)}`
    );
    
    // Update progress bar with animation
    setTimeout(() => {
      if (finalScoreProgressRef.current && finalScoreLabelRef.current) {
        finalScoreProgressRef.current.style.width = `${totalWeighted}%`;
        finalScoreLabelRef.current.textContent = `${totalWeighted.toFixed(1)}/100`;
      }
    }, 100);
    
    // Determine final decision
    let decisionText = 'PENDING';
    let riskLevelText = 'N/A';
    let actionText = '';
    
    if (totalWeighted >= 70) {
      decisionText = 'APPROVED';
      riskLevelText = 'LOW';
      actionText = 'Application approved. Proceed with card issuance.';
      setFinalScoreStatus('PASS');
    } else if (totalWeighted >= 50) {
      decisionText = 'CONDITIONAL APPROVAL';
      riskLevelText = 'MEDIUM';
      actionText = 'Application conditionally approved. Requires manager review.';
      setFinalScoreStatus('WARNING');
    } else {
      decisionText = 'DECLINED';
      riskLevelText = 'HIGH';
      actionText = 'Application declined. Consider alternative products.';
      setFinalScoreStatus('FAIL');
    }
    
    // Update state
    setFinalScore(totalWeighted);
    setDecision(decisionText);
    setRiskLevel(riskLevelText);
    setActionRequired(actionText);
    setShowFinalDecision(true);
    
    // Update module scores for breakdown
    setModuleScores([
      { 
        title: 'DBR Check', 
        weight: '55%', 
        score: dbrScore, 
        maxScore: 100,
        notes: '100 points if DBR is within threshold, 0 if exceeded'
      },
      { 
        title: 'SPU Check', 
        weight: '10%', 
        score: spuScore, 
        maxScore: 100,
        notes: '100 points if not on blacklist, 0 if on any list'
      },
      { 
        title: 'EAMVU Scoring', 
        weight: '10%', 
        score: eamvuScore, 
        maxScore: 100,
        notes: '100 points if EAMVU submitted, 0 if not submitted'
      },
      { 
        title: 'Income Scoring', 
        weight: '15%', 
        score: incomeScore, 
        maxScore: 100,
        notes: 'Based on Threshold, Stability, and Tenure'
      },
      { 
        title: 'Age Check', 
        weight: '5%', 
        score: ageScore, 
        maxScore: 100,
        notes: '100 points if age is within acceptable limits, 0 if not'
      },
      { 
        title: 'City Scoring', 
        weight: '5%', 
        score: cityScore, 
        maxScore: 100,
        notes: 'Based on Annexure A, Full Coverage, and Cluster'
      }
    ]);
    
    // Set module scoring status
    if (cityScore > 0 && incomeScore > 0 && eamvuScore > 0) {
      setModuleScoringStatus('PASS');
    }
    
    console.log('Final decision:', {
      totalWeighted,
      decisionText,
      riskLevelText,
      actionText
    });
  };

  // Final Score Calculation with direct results
  const calculateFinalScoreWithResults = (ageScore, dbrScore, spuScore, cityScore, incomeScore, eamvuScore) => {
    console.log('Final Score Calculation - Using direct results:', {
      ageScore,
      dbrScore,
      spuScore,
      cityScore,
      incomeScore,
      eamvuScore
    });
    
    // Calculate weighted scores for all components
    // DBR: 55%, SPU: 10%, EAMVU: 10%, Income: 15%, Age: 5%, City: 5%
    const weightedDbr = dbrScore * 0.55;
    const weightedSpu = spuScore * 0.10;
    const weightedEamvu = eamvuScore * 0.10;
    const weightedIncome = incomeScore * 0.15;
    const weightedAge = ageScore * 0.05;
    const weightedCity = cityScore * 0.05;
    
    const totalWeighted = weightedAge + weightedDbr + weightedSpu + weightedCity + weightedIncome + weightedEamvu;
    
    console.log('Weighted calculations:', {
      weightedAge,
      weightedDbr,
      weightedSpu,
      weightedCity,
      weightedIncome,
      weightedEamvu,
      totalWeighted
    });
    
    // Update weighted calculations display
    setWeightedCalculations(
      `DBR Score: ${dbrScore} × 55% = ${weightedDbr.toFixed(2)}\n` +
      `SPU Score: ${spuScore} × 10% = ${weightedSpu.toFixed(2)}\n` +
      `EAMVU Score: ${eamvuScore} × 10% = ${weightedEamvu.toFixed(2)}\n` +
      `Income Score: ${incomeScore} × 15% = ${weightedIncome.toFixed(2)}\n` +
      `Age Score: ${ageScore} × 5% = ${weightedAge.toFixed(2)}\n` +
      `City Score: ${cityScore} × 5% = ${weightedCity.toFixed(2)}\n` +
      `──────────────────────\n` +
      `Total Weighted Score: ${totalWeighted.toFixed(2)}`
    );
    
    // Update progress bar with animation
    setTimeout(() => {
      if (finalScoreProgressRef.current && finalScoreLabelRef.current) {
        finalScoreProgressRef.current.style.width = `${totalWeighted}%`;
        finalScoreLabelRef.current.textContent = `${totalWeighted.toFixed(1)}/100`;
      }
    }, 100);
    
    // Determine final decision
    let decisionText = 'PENDING';
    let riskLevelText = 'N/A';
    let actionText = '';
    
    if (totalWeighted >= 70) {
      decisionText = 'APPROVED';
      riskLevelText = 'LOW';
      actionText = 'Application approved. Proceed with card issuance.';
      setFinalScoreStatus('PASS');
    } else if (totalWeighted >= 50) {
      decisionText = 'CONDITIONAL APPROVAL';
      riskLevelText = 'MEDIUM';
      actionText = 'Application conditionally approved. Requires manager review.';
      setFinalScoreStatus('WARNING');
    } else {
      decisionText = 'DECLINED';
      riskLevelText = 'HIGH';
      actionText = 'Application declined. Consider alternative products.';
      setFinalScoreStatus('FAIL');
    }
    
    // Update state
    setFinalScore(totalWeighted);
    setDecision(decisionText);
    setRiskLevel(riskLevelText);
    setActionRequired(actionText);
    setShowFinalDecision(true);
    
    // Update module scores for breakdown
    setModuleScores([
      { 
        title: 'DBR Check', 
        weight: '55%', 
        score: dbrScore, 
        maxScore: 100,
        notes: '100 points if DBR is within threshold, 0 if exceeded'
      },
      { 
        title: 'SPU Check', 
        weight: '10%', 
        score: spuScore, 
        maxScore: 100,
        notes: '100 points if not on blacklist, 0 if on any list'
      },
      { 
        title: 'EAMVU Scoring', 
        weight: '10%', 
        score: eamvuScore, 
        maxScore: 100,
        notes: '100 points if EAMVU submitted, 0 if not submitted'
      },
      { 
        title: 'Income Scoring', 
        weight: '15%', 
        score: incomeScore, 
        maxScore: 100,
        notes: 'Based on Threshold, Stability, and Tenure'
      },
      { 
        title: 'Age Check', 
        weight: '5%', 
        score: ageScore, 
        maxScore: 100,
        notes: '100 points if age is within acceptable limits, 0 if not'
      },
      { 
        title: 'City Scoring', 
        weight: '5%', 
        score: cityScore, 
        maxScore: 100,
        notes: 'Based on Annexure A, Full Coverage, and Cluster'
      }
    ]);
    
    // Set module scoring status
    if (cityScore > 0 && incomeScore > 0 && eamvuScore > 0) {
      setModuleScoringStatus('PASS');
    }
    
    console.log('Final decision:', {
      totalWeighted,
      decisionText,
      riskLevelText,
      actionText
    });
  };

  // Helper function to extract score from calculation string
  const extractScore = (calculation: string) => {
    console.log('Extracting score from:', calculation);
    
    // Try different patterns to match the score
    let match = calculation.match(/Score[:\s]+(\d+)/);
    if (match) {
      console.log('Found score with pattern 1:', match[1]);
      return parseInt(match[1]);
    }
    
    // Try pattern for "City Score: 25"
    match = calculation.match(/(\w+)\s+Score[:\s]+(\d+)/);
    if (match) {
      console.log('Found score with pattern 2:', match[2]);
      return parseInt(match[2]);
    }
    
    // Try pattern for "Score: 25"
    match = calculation.match(/Score[:\s]+(\d+)/);
    if (match) {
      console.log('Found score with pattern 3:', match[1]);
      return parseInt(match[1]);
    }
    
    // Try pattern for just a number at the beginning
    match = calculation.match(/^(\d+)/);
    if (match) {
      console.log('Found score with pattern 4:', match[1]);
      return parseInt(match[1]);
    }
    
    console.log('No score found, returning 0');
    return 0;
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleData = {
      applicationId: 141,
      customerName: "John Doe",
      cnic: "35202-1234567-8",
      dateOfBirth: "1985-06-15",
      age: 38,
      gender: "Male",
      maritalStatus: "Married",
      mobile: "+92 300 1234567",
      employmentStatus: "Permanent",
      occupation: "Software Engineer",
      companyName: "Tech Solutions Ltd.",
      designation: "Senior Developer",
      experience: 8,
      grossMonthlySalary: 150000,
      netMonthlyIncome: 120000,
      amountRequested: 500000,
      tenure: 24,
      ublCustomer: "Yes",
      currentCity: "Karachi",
      currentAddress: "123 Main Street, Karachi",
      officeCity: "Karachi",
      officeAddress: "456 Business Avenue, Karachi",
      eamvuStatus: "Submitted",
      eavmu_submitted: true,
      spuBlackList: "No",
      spuCreditCard: "No",
      spuNegativeList: "No",
      existingDebt: 20000,
      cluster: "FEDERAL"
    };
    
    setApplicationData(sampleData);
    setShowApplicationData(true);
    setApplicationId(141);
    setCluster("FEDERAL");
    setEmploymentType("permanent");
    setTotalIncome(120000);
    
    // Trigger recalculation
    setTimeout(() => {
      recalculateDecision();
      // Also trigger individual calculations to ensure they run
      calculateAgeCheck();
      calculateSPUCheck();
      calculateCityScoring();
      calculateIncomeScoring();
      calculateEAMVUScoring();
    }, 100);
  };

  // Load real API data sample
  const loadRealApiData = () => {
    const realApiData = {
      applicationId: 104,
      customerName: "haris",
      cnic: "3520111112221",
      dateOfBirth: "1979-12-31T19:00:00.000Z",
      age: 45,
      gender: "Male",
      maritalStatus: "Single",
      mobile: "03451234567",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
      companyName: "Tech Solutions",
      designation: "Senior Developer",
      experience: 5,
      grossMonthlySalary: 80000,
      netMonthlyIncome: 70000,
      amountRequested: 200000, // Credit limit requested
      tenure: 24,
      ublCustomer: "Yes",
      currentCity: "BHWALNGR",
      currentAddress: "Street 10, BHWALNGR",
      officeCity: "Karachi",
      officeAddress: "Tech Park, Karachi",
      eamvuStatus: "Submitted",
      eavmu_submitted: true,
      spuBlackList: "No",
      spuCreditCard: "No",
      spuNegativeList: "No",
      existingDebt: 15000, // Existing monthly debt obligations
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
    
    // Trigger recalculation
    setTimeout(() => {
      recalculateDecision();
      // Also trigger individual calculations to ensure they run
      calculateAgeCheck();
      calculateSPUCheck();
      calculateCityScoring();
      calculateIncomeScoring();
      calculateEAMVUScoring();
    }, 100);
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

  // Download report
  const downloadReport = () => {
    const reportContent = `
      CREDIT CARD DECISION REPORT
      ===========================
      
      Application ID: ${applicationData?.applicationId || '-'}
      Customer Name: ${applicationData?.customerName || '-'}
      Date: ${new Date().toLocaleDateString()}
      
      FINAL DECISION: ${decision}
      FINAL SCORE: ${finalScore.toFixed(2)}/100
      RISK LEVEL: ${riskLevel}
      
      Critical Checks Status: ${criticalChecksStatus}
      Module Scoring Status: ${moduleScoringStatus}
      
      Detailed Calculations:
      ---------------------
      Age Check: ${ageCalculation}
      DBR Check: ${dbrCalculation}
      SPU Check: ${spuCalculation}
      City Scoring: ${cityCalculation}
      Income Scoring: ${incomeCalculation}
      EAMVU Scoring: ${eamvuCalculation}
      
      Weighted Calculations:
      ${weightedCalculations.replace(/\n/g, '\n      ')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit_decision_report_${applicationId}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // Render status badge with appropriate styling
  const renderStatusBadge = (status: string) => {
    let className = 'step-status ';
    
    if (status === 'PASS') className += 'status-pass';
    else if (status === 'FAIL') className += 'status-fail';
    else if (status === 'WARNING') className += 'status-warning';
    else className += 'status-warning';
    
    return <span className={className}>{status}</span>;
  };

  // Render risk level badge
  const renderRiskLevelBadge = () => {
    let className = 'risk-level ';
    
    if (riskLevel === 'LOW' || riskLevel === 'VERY LOW') className += 'risk-low';
    else if (riskLevel === 'MEDIUM') className += 'risk-medium';
    else if (riskLevel === 'HIGH' || riskLevel === 'VERY HIGH') className += 'risk-high';
    
    return <div className={className}>Risk Level: {riskLevel}</div>;
  };

  // Render final decision panel with appropriate styling
  const renderFinalDecisionPanel = () => {
    let className = 'final-decision ';
    
    if (decision === 'APPROVED') className += 'decision-pass';
    else if (decision === 'CONDITIONAL APPROVAL') className += 'decision-conditional';
    else if (decision === 'DECLINED') className += 'decision-fail';
    
    return (
      <div id="finalDecision" className={className}>
        <div className="final-score" id="displayFinalScore">{finalScore.toFixed(1)}</div>
        <div className="decision-text" id="displayDecision">{decision}</div>
        {renderRiskLevelBadge()}
        <div id="displayActionRequired" style={{ margin: '15px 0', fontSize: '1.1rem', fontWeight: '600' }}>
          {actionRequired}
        </div>
        
        {dbrWarning && (
          <div className={dbrWarning.includes('Critical') ? 'dbr-critical' : 'dbr-warning'} id="finalDbrWarning">
            <span>⚠️</span> {dbrWarning}
          </div>
        )}
      </div>
    );
  };

  // Render module score cards
  const renderModuleScores = () => {
    return moduleScores.map((module, index) => {
      const percentage = (module.score / module.maxScore) * 100;
      let scoreClass = 'score-low';
      
      if (percentage >= 70) scoreClass = 'score-high';
      else if (percentage >= 50) scoreClass = 'score-medium';
      
      return (
        <div key={index} className="module-card fade-in">
          <div className="module-header">
            <div className="module-title">{module.title}</div>
            <div className="module-weight">{module.weight}</div>
          </div>
          <div className="score-details">
            <span>Score: {module.score}/{module.maxScore}</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="score-bar">
            <div className={`score-fill ${scoreClass}`} style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="notes">
            <div className="notes-title">Scoring Criteria:</div>
            {module.notes}
          </div>
        </div>
      );
    });
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
                    <h3>Address & Checks</h3>
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
                      <span className="data-label">EAMVU Status:</span>
                      <span className="data-value">{applicationData?.eamvuStatus || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Black List:</span>
                      <span className="data-value">{applicationData?.spuBlackList || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Credit Card 30k:</span>
                      <span className="data-value">{applicationData?.spuCreditCard || '-'}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">SPU Negative List:</span>
                      <span className="data-value">{applicationData?.spuNegativeList || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show Calculate Decision button after API data is fetched */}
          {showApplicationData && (
            <div className="section">
              <button 
                onClick={calculateDecision}
                disabled={calculating}
                style={{ 
                  backgroundColor: calculating ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: calculating ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  width: '100%',
                  marginTop: '20px'
                }}
              >
                <span>{calculating ? '🔄 Calculating Decision...' : '🧠 Calculate Decision'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Decision Flow - Only show after calculations */}
        {calculationsRun && (
          <div className="right-panel">
            {/* Final Decision Summary - Show first */}
            {showFinalDecision && (
              <div className="section" style={{ marginBottom: '30px' }}>
                <h2 className="section-title">📊 Final Decision Summary</h2>
                {renderFinalDecisionPanel()}
                
                <h3 className="section-title" style={{ marginTop: '20px' }}>📈 Module Scores Breakdown</h3>
                <div className="module-scores" id="moduleScoresContainer">
                  {renderModuleScores()}
                </div>
              </div>
            )}

            {/* Real-Time Decision Flow - Show second */}
            <div className="section">
              <h2 className="section-title">🧠 Real-Time Decision Flow</h2>
              
              <div id="decisionFlow">
              {/* Critical Checks */}
              <div className="decision-step">
                <div 
                  className={`step-header collapsible ${expandedSections.criticalChecks ? 'active' : ''}`} 
                  onClick={() => toggleSection('criticalChecks')}
                >
                  <div className="step-title">1️⃣ Critical Checks (Automatic Failures)</div>
                  {renderStatusBadge(criticalChecksStatus)}
                </div>
                <div className={`step-content ${expandedSections.criticalChecks ? 'expanded' : ''}`}>
                  <div id="ageCheck">
                    <h4>Age Check</h4>
                    <div className="calculation" id="ageCalculation">{ageCalculation}</div>
                    <div className="reasoning" id="ageReasoning">{ageReasoning}</div>
                  </div>

                   <div id="dbrCheck">
                     <h4>DBR Check</h4>
                     <div className="calculation" id="dbrCalculation">
                       {dbrLoading ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                           <span>Calculating DBR from API...</span>
                         </div>
                       ) : (
                         dbrCalculation
                       )}
                     </div>
                     
                     {dbrData && (
                       <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                         <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>DBR Details:</h5>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '14px' }}>
                           <div><strong>Net Income:</strong> PKR {dbrData.dbr_details?.net_income?.toLocaleString() || 'N/A'}</div>
                           <div><strong>Total Obligations:</strong> PKR {dbrData.dbr_details?.total_obligations?.toLocaleString() || 'N/A'}</div>
                           <div><strong>DBR Percentage:</strong> {dbrData.dbr?.toFixed(2)}%</div>
                           <div><strong>Threshold:</strong> {dbrData.threshold}%</div>
                           <div><strong>Status:</strong> {dbrData.status?.toUpperCase()}</div>
                           <div><strong>Income Score:</strong> {dbrData.scoring?.income_score || 'N/A'}</div>
                         </div>
                       </div>
                     )}
                     
                     {dbrWarning && (
                       <div id="dbrWarningContainer" className={dbrWarning.includes('Critical') ? 'dbr-critical' : 'dbr-warning'}>
                         <span>⚠️</span> {dbrWarning}
                       </div>
                     )}
                     <div className="reasoning">
                       DBR (Debt Burden Ratio) calculated from backend API. Must not exceed threshold.
                     </div>
                   </div>

                  <div id="spuCheck">
                    <h4>SPU Check</h4>
                    <div className="calculation" id="spuCalculation">{spuCalculation}</div>
                    <div className="reasoning">Application fails if customer appears on SPU blacklist or negative list.</div>
                  </div>
                </div>
              </div>
              
              {/* Module Scoring */}
              <div className="decision-step">
                <div 
                  className={`step-header collapsible ${expandedSections.moduleScoring ? 'active' : ''}`} 
                  onClick={() => toggleSection('moduleScoring')}
                >
                  <div className="step-title">2️⃣ Module Scoring</div>
                  {renderStatusBadge(moduleScoringStatus)}
                </div>
                <div className={`step-content ${expandedSections.moduleScoring ? 'expanded' : ''}`}>
                  <div id="cityScoring">
                    <h4>City Scoring (5%)</h4>
                    <div className="calculation" id="cityCalculation">{cityCalculation}</div>
                    <div className="reasoning">Score based on Annexure A (-30), Full Coverage (+40/+20/+0), and Cluster (+30 to +5).</div>
                  </div>
                  
                   <div id="incomeScoring">
                     <h4>Income Scoring (15%)</h4>
                     <div className="calculation" id="incomeCalculation">{incomeCalculation}</div>
                     <div className="reasoning">
                       Score based on Threshold (60pts), Stability (25pts), and Tenure (15pts).
                     </div>
                   </div>
                  
                   <div id="eamvuScoring">
                     <h4>EAMVU Scoring (10%)</h4>
                     <div className="calculation" id="eamvuCalculation">{eamvuCalculation}</div>
                     <div className="reasoning">
                       100 points if EAMVU submitted, 0 if not submitted.
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Weighted Final Score */}
              <div className="decision-step">
                <div 
                  className={`step-header collapsible ${expandedSections.finalScore ? 'active' : ''}`} 
                  onClick={() => toggleSection('finalScore')}
                >
                  <div className="step-title">3️⃣ Weighted Final Score</div>
                  {renderStatusBadge(finalScoreStatus)}
                </div>
                <div className={`step-content ${expandedSections.finalScore ? 'expanded' : ''}`}>
                  <div className="progress-container">
                    <div className="progress-bar" id="finalScoreProgress" ref={finalScoreProgressRef}></div>
                    <div className="progress-label" id="finalScoreLabel" ref={finalScoreLabelRef}>0/100</div>
                  </div>
                  
                  <h4>Weighted Calculations:</h4>
                  <div className="calculation" id="weightedCalculations">{weightedCalculations}</div>
                  
                  <div className="reasoning">
                    <strong>Decision Thresholds:</strong><br />
                    • PASS: Final score ≥ 70<br />
                    • CONDITIONAL PASS: 50 ≤ Final score ≤ 70<br />
                    • FAIL: Final score &lt; 50
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Show at bottom */}
      {calculationsRun && (
        <div className="action-buttons" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          <button onClick={loadSampleData}>📋 Load Sample Data</button>
          <button onClick={loadRealApiData}>🔗 Load Real API Data</button>
          <button className="btn-outline" onClick={resetForm}>🔄 Reset Form</button>
          <button onClick={downloadReport}>📥 Download Report</button>
        </div>
      )}
    </div>
  );
}
