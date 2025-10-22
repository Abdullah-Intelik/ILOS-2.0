const { useState, useEffect, useRef } = React;

const CreditCardDecisionEngine = () => {
  // State management
  const [applicationId, setApplicationId] = useState(141);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  
  // Manual inputs
  const [cluster, setCluster] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [salaryTransferFlag, setSalaryTransferFlag] = useState('salary_transfer');
  const [totalIncome, setTotalIncome] = useState(50000);
  
  // Decision flow states
  const [criticalChecksStatus, setCriticalChecksStatus] = useState('Pending');
  const [moduleScoringStatus, setModuleScoringStatus] = useState('Pending');
  const [finalScoreStatus, setFinalScoreStatus] = useState('Pending');
  
  // Calculation results
  const [ageCalculation, setAgeCalculation] = useState('Waiting for data...');
  const [ageReasoning, setAgeReasoning] = useState('Age must be within acceptable limits based on employment type.');
  const [dbrCalculation, setDbrCalculation] = useState('Waiting for data...');
  const [dbrWarning, setDbrWarning] = useState('');
  const [spuCalculation, setSpuCalculation] = useState('Waiting for data...');
  const [cityCalculation, setCityCalculation] = useState('Waiting for data...');
  const [incomeCalculation, setIncomeCalculation] = useState('Waiting for data...');
  const [eamvuCalculation, setEamvuCalculation] = useState('Waiting for data...');
  const [weightedCalculations, setWeightedCalculations] = useState('Waiting for module scores...');
  
  // Final decision states
  const [finalScore, setFinalScore] = useState(0);
  const [decision, setDecision] = useState('PENDING');
  const [riskLevel, setRiskLevel] = useState('N/A');
  const [actionRequired, setActionRequired] = useState('');
  const [showFinalDecision, setShowFinalDecision] = useState(false);
  const [moduleScores, setModuleScores] = useState([]);
  
  // Progress bar ref
  const finalScoreProgressRef = useRef(null);
  const finalScoreLabelRef = useRef(null);
  
  // Collapsible states
  const [expandedSections, setExpandedSections] = useState({
    applicationData: false,
    criticalChecks: true,
    moduleScoring: true,
    finalScore: true
  });

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch application data
  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const dataService = new DataService();
      const data = await dataService.fetchApplicationData(applicationId);
      setApplicationData(data);
      setShowApplicationData(true);
      
      // Auto-populate some fields if available
      if (data.cluster) setCluster(data.cluster);
      if (data.employmentStatus) setEmploymentType(data.employmentStatus.toLowerCase());
      if (data.netMonthlyIncome) setTotalIncome(data.netMonthlyIncome);
      
      // Trigger recalculation
      setTimeout(() => recalculateDecision(), 500);
    } catch (error) {
      console.error('Error fetching application data:', error);
      alert('Failed to fetch application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate decision based on current inputs
  const recalculateDecision = () => {
    if (!applicationData) return;
    
    // Reset statuses
    setCriticalChecksStatus('Processing...');
    setModuleScoringStatus('Processing...');
    setFinalScoreStatus('Processing...');
    
    // Simulate processing delay for animation
    setTimeout(() => {
      try {
        // Run all calculations
        calculateAgeCheck();
        calculateDBRCheck();
        calculateSPUCheck();
        calculateCityScoring();
        calculateIncomeScoring();
        calculateEAMVUScoring();
        calculateFinalScore();
      } catch (error) {
        console.error('Error in recalculation:', error);
      }
    }, 300);
  };

  // Age Check Calculation
  const calculateAgeCheck = () => {
    const age = applicationData?.age || 0;
    let pass = true;
    let reasoning = 'Age must be within acceptable limits based on employment type.';
    
    if (employmentType === 'self-employed') {
      pass = age >= 22 && age <= 65;
      reasoning = `Self-employed: Age must be 22-65 years. Current age: ${age}`;
    } else {
      pass = age >= 21 && age <= 60;
      reasoning = `Salaried: Age must be 21-60 years. Current age: ${age}`;
    }
    
    setAgeCalculation(`Age: ${age}, Employment: ${employmentType} → ${pass ? 'PASS' : 'FAIL'}`);
    setAgeReasoning(reasoning);
    
    if (!pass) {
      setCriticalChecksStatus('FAIL');
    }
  };

  // DBR Check Calculation
  const calculateDBRCheck = () => {
    const monthlyIncome = totalIncome;
    const existingDebt = applicationData?.existingDebt || 0;
    const requestedAmount = applicationData?.amountRequested || 0;
    const tenure = applicationData?.tenure || 12;
    
    // Calculate monthly payment for requested amount
    const monthlyPayment = requestedAmount / tenure;
    const totalMonthlyObligations = existingDebt + monthlyPayment;
    const dbrPercentage = (totalMonthlyObligations / monthlyIncome) * 100;
    
    const pass = dbrPercentage <= 40;
    let warning = '';
    
    if (dbrPercentage > 40) {
      warning = `Critical: DBR ${dbrPercentage.toFixed(1)}% exceeds 40% threshold`;
    } else if (dbrPercentage > 30) {
      warning = `Warning: DBR ${dbrPercentage.toFixed(1)}% is high`;
    }
    
    setDbrCalculation(`DBR: ${dbrPercentage.toFixed(1)}% → ${pass ? 'PASS' : 'FAIL'}`);
    setDbrWarning(warning);
    
    if (!pass) {
      setCriticalChecksStatus('FAIL');
    }
  };

  // SPU Check Calculation
  const calculateSPUCheck = () => {
    const spuModule = new SPUModule();
    const result = spuModule.calculate({
      spu_black_list_check: applicationData?.spuBlackList === 'Yes',
      spu_negative_list_check: applicationData?.spuNegativeList === 'Yes',
      spu_credit_card_30k_check: applicationData?.spuCreditCard === 'Yes'
    });
    
    setSpuCalculation(`SPU Score: ${result.raw} → ${result.raw === 100 ? 'PASS' : 'FAIL'}`);
    
    if (result.raw === 0) {
      setCriticalChecksStatus('FAIL');
    } else if (criticalChecksStatus !== 'FAIL') {
      setCriticalChecksStatus('PASS');
    }
  };

  // City Scoring Calculation
  const calculateCityScoring = () => {
    const cityModule = new CityModule();
    const result = cityModule.calculate({
      curr_city: applicationData?.currentCity || '',
      office_city: applicationData?.officeCity || '',
      cluster: cluster
    });
    
    setCityCalculation(`City Score: ${result.raw} (${result.notes?.join(', ') || 'No notes'})`);
  };

  // Income Scoring Calculation
  const calculateIncomeScoring = () => {
    const incomeModule = new IncomeModule();
    const result = incomeModule.calculate({
      net_monthly_income: totalIncome,
      employment_status: employmentType,
      salary_transfer_flag: salaryTransferFlag === 'salary_transfer',
      tenure: applicationData?.tenure || 12
    });
    
    setIncomeCalculation(`Income Score: ${result.raw} (${result.notes?.join(', ') || 'No notes'})`);
  };

  // EAMVU Scoring Calculation
  const calculateEAMVUScoring = () => {
    const eamvuModule = new EAMVUModule();
    const result = eamvuModule.calculate({
      eavmu_submitted: applicationData?.eamvuStatus === 'Submitted'
    });
    
    setEamvuCalculation(`EAMVU Score: ${result.raw} (${result.notes?.join(', ') || 'No notes'})`);
  };

  // Final Score Calculation
  const calculateFinalScore = () => {
    // Gather all scores
    const cityScore = extractScore(cityCalculation);
    const incomeScore = extractScore(incomeCalculation);
    const eamvuScore = extractScore(eamvuCalculation);
    
    // Calculate weighted score
    const weightedCity = cityScore * 0.05;
    const weightedIncome = incomeScore * 0.15;
    const weightedEamvu = eamvuScore * 0.10;
    const totalWeighted = weightedCity + weightedIncome + weightedEamvu;
    
    // Update weighted calculations display
    setWeightedCalculations(
      `City Score: ${cityScore} × 5% = ${weightedCity.toFixed(2)}\n` +
      `Income Score: ${incomeScore} × 15% = ${weightedIncome.toFixed(2)}\n` +
      `EAMVU Score: ${eamvuScore} × 10% = ${weightedEamvu.toFixed(2)}\n` +
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
        title: 'City Scoring', 
        weight: '5%', 
        score: cityScore, 
        maxScore: 100,
        notes: 'Based on Annexure A, Full Coverage, and Cluster'
      },
      { 
        title: 'Income Scoring', 
        weight: '15%', 
        score: incomeScore, 
        maxScore: 100,
        notes: 'Based on Threshold, Stability, and Tenure'
      },
      { 
        title: 'EAMVU Scoring', 
        weight: '10%', 
        score: eamvuScore, 
        maxScore: 100,
        notes: '100 points if EAMVU submitted, 0 if not submitted'
      }
    ]);
    
    // Set module scoring status
    if (cityScore > 0 && incomeScore > 0 && eamvuScore > 0) {
      setModuleScoringStatus('PASS');
    }
  };

  // Helper function to extract score from calculation string
  const extractScore = (calculation) => {
    const match = calculation.match(/Score[:\s]+(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
    setTimeout(() => recalculateDecision(), 100);
  };

  // Reset form
  const resetForm = () => {
    setApplicationId(141);
    setLoading(false);
    setApplicationData(null);
    setShowApplicationData(false);
    setCluster('');
    setEmploymentType('permanent');
    setSalaryTransferFlag('salary_transfer');
    setTotalIncome(50000);
    
    // Reset calculation results
    setAgeCalculation('Waiting for data...');
    setDbrCalculation('Waiting for data...');
    setSpuCalculation('Waiting for data...');
    setCityCalculation('Waiting for data...');
    setIncomeCalculation('Waiting for data...');
    setEamvuCalculation('Waiting for data...');
    setWeightedCalculations('Waiting for module scores...');
    setDbrWarning('');
    
    // Reset statuses
    setCriticalChecksStatus('Pending');
    setModuleScoringStatus('Pending');
    setFinalScoreStatus('Pending');
    
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

  // Effect to trigger recalculation when dependencies change
  useEffect(() => {
    if (applicationData) {
      recalculateDecision();
    }
  }, [cluster, employmentType, salaryTransferFlag, totalIncome]);

  // Render status badge with appropriate styling
  const renderStatusBadge = (status) => {
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

      <div className="main-layout">
        {/* Left Panel - Input Controls */}
        <div className="left-panel">
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
            >
              <span>📥 Fetch Application Data</span>
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
              
              <div className="form-group">
                <label htmlFor="totalIncome">Total Income (PKR):</label>
                <input 
                  type="number" 
                  id="totalIncome" 
                  value={totalIncome} 
                  onChange={(e) => setTotalIncome(parseInt(e.target.value) || 0)}
                  placeholder="Enter total income"
                />
              </div>
            </div>
          </div>

          {showApplicationData && (
            <div className="section" id="applicationDataSection">
              <h2 
                className={`section-title collapsible ${expandedSections.applicationData ? 'active' : ''}`} 
                onClick={() => toggleSection('applicationData')}
              >
                📄 Application Data <small>(Click to expand/collapse)</small>
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
        </div>

        {/* Right Panel - Decision Flow */}
        <div className="right-panel">
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
                  <div className="calculation" id="dbrCalculation">{dbrCalculation}</div>
                  {dbrWarning && (
                    <div id="dbrWarningContainer" className={dbrWarning.includes('Critical') ? 'dbr-critical' : 'dbr-warning'}>
                      <span>⚠️</span> {dbrWarning}
                    </div>
                  )}
                  <div className="reasoning">DBR (Debt Burden Ratio) must not exceed 40% threshold.</div>
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
                  <div className="reasoning">Score based on Threshold (60pts), Stability (25pts), and Tenure (15pts).</div>
                </div>
                
                <div id="eamvuScoring">
                  <h4>EAMVU Scoring (10%)</h4>
                  <div className="calculation" id="eamvuCalculation">{eamvuCalculation}</div>
                  <div className="reasoning">100 points if EAMVU submitted, 0 if not submitted.</div>
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

      {/* Bottom Panel - Final Decision */}
      {showFinalDecision && (
        <div className="bottom-panel" id="finalDecisionPanel">
          <h2 className="section-title">📊 Final Decision Summary</h2>
          
          {renderFinalDecisionPanel()}
          
          <h3 className="section-title">📈 Module Scores Breakdown</h3>
          <div className="module-scores" id="moduleScoresContainer">
            {renderModuleScores()}
          </div>
          
          <div className="action-buttons">
            <button onClick={loadSampleData}>📋 Load Sample Data</button>
            <button className="btn-outline" onClick={resetForm}>🔄 Reset Form</button>
            <button onClick={downloadReport}>📥 Download Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardDecisionEngine;