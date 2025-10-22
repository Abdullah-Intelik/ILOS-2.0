/**
 * Frontend JavaScript for Credit Card Decision Engine
 * Handles UI interactions and displays decision results
 */

class DecisionEngineFrontend {
    constructor() {
        this.currentApplicationData = null;
        this.decisionEngine = null;
        this.initialize();
    }

    /**
     * Initialize the frontend
     */
    initialize() {
        this.decisionEngine = new CreditCardDecisionEngine();
        this.setupEventListeners();
        this.loadSampleData();
    }

    /**
     * Setup event listeners for form inputs
     */
    setupEventListeners() {
        // Manual input event listeners
        document.getElementById('cluster').addEventListener('change', () => this.recalculateDecision());
        document.getElementById('employmentType').addEventListener('change', () => this.recalculateDecision());
        document.getElementById('salaryTransferFlag').addEventListener('change', () => this.recalculateDecision());
        document.getElementById('totalIncome').addEventListener('change', () => this.recalculateDecision());
        document.getElementById('totalIncome').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.recalculateDecision();
            }
        });

        // Fetch button
        document.getElementById('fetchBtn').addEventListener('click', () => this.fetchApplicationData());
    }

    /**
     * Fetch application data from API
     */
    async fetchApplicationData() {
        const applicationId = document.getElementById('applicationId').value;
        if (!applicationId) {
            alert('Please enter an application ID');
            return;
        }

        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = 'block';
        
        try {
            // Show loading state for decision flow
            this.updateDecisionFlowStatus('criticalChecksStatus', 'Processing...', 'status-warning');
            this.updateDecisionFlowStatus('moduleScoringStatus', 'Waiting...', 'status-warning');
            this.updateDecisionFlowStatus('finalScoreStatus', 'Waiting...', 'status-warning');
            
            // Fetch application data
            const result = await this.decisionEngine.processApplication(parseInt(applicationId));
            this.currentApplicationData = result.applicationData;
            
            // Populate the UI with fetched data
            this.populateApiFields(this.currentApplicationData);
            document.getElementById('applicationDataSection').style.display = 'block';
            
            // Auto-expand the application data section on mobile
            if (window.innerWidth <= 768) {
                const collapsible = document.querySelector('.collapsible');
                collapsible.classList.add('active');
                collapsible.nextElementSibling.style.maxHeight = collapsible.nextElementSibling.scrollHeight + "px";
            }
            
            // Calculate and display decision
            await this.calculateAndDisplayDecision();
        } catch (error) {
            console.error('Error fetching application data:', error);
            alert('Error fetching application data: ' + error.message);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    /**
     * Populate API fields with application data
     */
    populateApiFields(data) {
        // Basic Info
        document.getElementById('apiApplicationId').textContent = data.los_id || data.id || '-';
        document.getElementById('apiCustomerName').textContent = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || '-';
        document.getElementById('apiCnic').textContent = data.cnic || '-';
        document.getElementById('apiDateOfBirth').textContent = data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString() : '-';
        
        // Calculate age
        if (data.date_of_birth) {
            const age = new Date().getFullYear() - new Date(data.date_of_birth).getFullYear();
            document.getElementById('apiAge').textContent = age;
        } else {
            document.getElementById('apiAge').textContent = '-';
        }
        
        document.getElementById('apiGender').textContent = data.gender || '-';
        document.getElementById('apiMaritalStatus').textContent = data.marital_status || '-';
        document.getElementById('apiMobile').textContent = data.curr_mobile || data.mobile || '-';
        
        // Employment Info
        document.getElementById('apiEmploymentStatus').textContent = data.employment_status || '-';
        document.getElementById('apiOccupation').textContent = data.occupation || '-';
        document.getElementById('apiCompanyName').textContent = data.company_employer_name || data.company_name || '-';
        document.getElementById('apiDesignation').textContent = data.designation || '-';
        document.getElementById('apiExperience').textContent = data.length_of_employment || data.exp_current_years || '-';
        
        // Financial Info
        document.getElementById('apiGrossSalary').textContent = data.gross_monthly_income ? `PKR ${parseInt(data.gross_monthly_income).toLocaleString()}` : '-';
        document.getElementById('apiNetIncome').textContent = data.total_income ? `PKR ${parseInt(data.total_income).toLocaleString()}` : '-';
        document.getElementById('apiAmountRequested').textContent = data.collateral_lien_amount ? `PKR ${parseInt(data.collateral_lien_amount).toLocaleString()}` : '-';
        document.getElementById('apiTenure').textContent = data.length_of_employment ? `${data.length_of_employment} months` : '-';
        document.getElementById('apiUblCustomer').textContent = data.is_ubl_customer ? 'Yes' : 'No';

        // Address Info
        const currentAddress = [data.curr_house_apt, data.curr_street, data.curr_tehsil_district, data.curr_landmark].filter(Boolean).join(', ');
        const officeAddress = [data.office_address, data.office_street, data.office_district, data.office_landmark].filter(Boolean).join(', ');
        
        document.getElementById('apiCurrentCity').textContent = data.curr_city || '-';
        document.getElementById('apiCurrentAddress').textContent = currentAddress || '-';
        document.getElementById('apiOfficeCity').textContent = data.office_city || '-';
        document.getElementById('apiOfficeAddress').textContent = officeAddress || '-';

        // SPU & EAMVU Status
        document.getElementById('apiEamvuStatus').textContent = data.eavmu_submitted !== null ? String(data.eavmu_submitted) : '-';
        document.getElementById('apiSpuBlackList').textContent = data.spu_black_list_check !== null ? String(data.spu_black_list_check) : '-';
        document.getElementById('apiSpuCreditCard').textContent = data.spu_credit_card_30k_check !== null ? String(data.spu_credit_card_30k_check) : '-';
        document.getElementById('apiSpuNegativeList').textContent = data.spu_negative_list_check !== null ? String(data.spu_negative_list_check) : '-';
    }

    /**
     * Calculate and display decision
     */
    async calculateAndDisplayDecision() {
        if (!this.currentApplicationData) {
            alert('No application data available. Please fetch application data first.');
            return;
        }

        try {
            // Get manual inputs
            const cluster = document.getElementById('cluster').value;
            const employmentType = document.getElementById('employmentType').value;
            const salaryTransferFlag = document.getElementById('salaryTransferFlag').value;
            const totalIncome = document.getElementById('totalIncome').value;
            
            // Update application data with manual inputs
            this.currentApplicationData.cluster = cluster;
            this.currentApplicationData.employment_type = employmentType;
            this.currentApplicationData.salary_transfer_flag = salaryTransferFlag;
            this.currentApplicationData.total_income = totalIncome || this.currentApplicationData.total_income;
            
            // Calculate decision
            const result = this.decisionEngine.calculateDecision(this.currentApplicationData);
            
            // Update UI with results
            this.updateDecisionFlow(result);
            this.displayFinalDecision(result);
            
            // Show final decision panel
            document.getElementById('finalDecisionPanel').style.display = 'block';
            
            // Scroll to final decision on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('finalDecisionPanel').scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error calculating decision:', error);
            alert('Error calculating decision: ' + error.message);
        }
    }

    /**
     * Recalculate decision when manual inputs change
     */
    recalculateDecision() {
        if (this.currentApplicationData) {
            this.calculateAndDisplayDecision();
        }
    }

    /**
     * Update decision flow with results
     */
    updateDecisionFlow(result) {
        this.updateCriticalChecks(result);
        this.updateModuleScoring(result);
        this.updateFinalScore(result);
    }

    /**
     * Update critical checks section
     */
    updateCriticalChecks(result) {
        // Age Check
        const ageElement = document.getElementById('ageCalculation');
        const age = result.applicationData.date_of_birth ? 
            new Date().getFullYear() - new Date(result.applicationData.date_of_birth).getFullYear() : 0;
        const employmentType = result.applicationData.employment_type || 'permanent';
        
        let ageStatus = 'PASS';
        let ageReason = '';
        
        if (employmentType === 'permanent' && (age < 21 || age > 60)) {
            ageStatus = 'FAIL';
            ageReason = `Age ${age} is outside acceptable range (21-60) for permanent employment.`;
        } else if (employmentType === 'contractual' && (age < 21 || age > 55)) {
            ageStatus = 'FAIL';
            ageReason = `Age ${age} is outside acceptable range (21-55) for contractual employment.`;
        } else if ((employmentType === 'self-employed' || employmentType === 'business') && (age < 25 || age > 65)) {
            ageStatus = 'FAIL';
            ageReason = `Age ${age} is outside acceptable range (25-65) for self-employed/business.`;
        } else if (employmentType === 'probation' && (age < 21 || age > 50)) {
            ageStatus = 'FAIL';
            ageReason = `Age ${age} is outside acceptable range (21-50) for probation employment.`;
        } else {
            ageReason = `Age ${age} is within acceptable range for ${employmentType} employment.`;
        }
        
        ageElement.innerHTML = `
            Age: ${age}<br>
            Employment Type: ${employmentType}<br>
            Status: <strong>${ageStatus}</strong><br>
            ${ageReason}
        `;
        
        // DBR Check
        const dbrElement = document.getElementById('dbrCalculation');
        const dbrPercentage = result.dbrPercentage || 0;
        const dbrThreshold = 40;
        const dbrStatus = dbrPercentage <= dbrThreshold ? 'PASS' : 'FAIL';
        
        dbrElement.innerHTML = `
            DBR: ${dbrPercentage.toFixed(2)}%<br>
            Threshold: ${dbrThreshold}%<br>
            Status: <strong>${dbrStatus}</strong><br>
            Formula: (Monthly Obligations / Net Monthly Income) × 100
        `;
        
        // Update DBR warning
        const dbrWarningContainer = document.getElementById('dbrWarningContainer');
        dbrWarningContainer.innerHTML = '';
        
        if (dbrPercentage > dbrThreshold) {
            dbrWarningContainer.innerHTML = `
                <div class="dbr-critical">
                    <strong>⚠️ CRITICAL:</strong> DBR ${dbrPercentage.toFixed(2)}% exceeds threshold ${dbrThreshold}% - Application FAILED
                </div>
            `;
        } else if (dbrPercentage > (dbrThreshold * 0.8)) {
            dbrWarningContainer.innerHTML = `
                <div class="dbr-warning">
                    <strong>⚠️ WARNING:</strong> DBR ${dbrPercentage.toFixed(2)}% is close to threshold ${dbrThreshold}% - Monitor closely
                </div>
            `;
        }
        
        // SPU Check
        const spuElement = document.getElementById('spuCalculation');
        const spuBlackList = result.applicationData.spu_black_list_check || false;
        const spuNegativeList = result.applicationData.spu_negative_list_check || false;
        const spuStatus = !(spuBlackList || spuNegativeList) ? 'PASS' : 'FAIL';
        
        spuElement.innerHTML = `
            SPU Black List: ${spuBlackList ? 'YES' : 'NO'}<br>
            SPU Negative List: ${spuNegativeList ? 'YES' : 'NO'}<br>
            Status: <strong>${spuStatus}</strong><br>
            ${spuStatus === 'FAIL' ? 'Application fails if on any SPU list' : 'Customer cleared SPU checks'}
        `;
        
        // Update critical checks status
        const criticalStatus = (ageStatus === 'PASS' && dbrStatus === 'PASS' && spuStatus === 'PASS') ? 'PASS' : 'FAIL';
        this.updateDecisionFlowStatus('criticalChecksStatus', criticalStatus, 
            criticalStatus === 'PASS' ? 'status-pass' : 'status-fail');
    }

    /**
     * Update module scoring section
     */
    updateModuleScoring(result) {
        // City Scoring
        const cityElement = document.getElementById('cityCalculation');
        const cityScore = result.moduleScores.city?.score || 0;
        const cityWeighted = result.moduleScores.city?.weightedScore || 0;
        const cluster = result.applicationData.cluster || '';
        
        cityElement.innerHTML = `
            Base Score: ${cityScore}<br>
            Weighted Score: ${cityWeighted.toFixed(1)}<br>
            Cluster: ${cluster}<br>
            Formula: Annexure A (-30) + Full Coverage (+40/+20/+0) + Cluster Bonus
        `;
        
        // Income Scoring
        const incomeElement = document.getElementById('incomeCalculation');
        const incomeScore = result.moduleScores.income?.score || 0;
        const incomeWeighted = result.moduleScores.income?.weightedScore || 0;
        const totalIncome = result.applicationData.total_income || 0;
        
        incomeElement.innerHTML = `
            Total Income: PKR ${parseInt(totalIncome).toLocaleString()}<br>
            Base Score: ${incomeScore}<br>
            Weighted Score: ${incomeWeighted.toFixed(1)}<br>
            Formula: Threshold (60pts) + Stability (25pts) + Tenure (15pts)
        `;
        
        // EAMVU Scoring
        const eamvuElement = document.getElementById('eamvuCalculation');
        const eamvuScore = result.moduleScores.eamvu?.score || 0;
        const eamvuWeighted = result.moduleScores.eamvu?.weightedScore || 0;
        const eamvuSubmitted = result.applicationData.eavmu_submitted || false;
        
        eamvuElement.innerHTML = `
            EAMVU Submitted: ${eamvuSubmitted ? 'YES' : 'NO'}<br>
            Base Score: ${eamvuScore}<br>
            Weighted Score: ${eamvuWeighted.toFixed(1)}<br>
            Formula: Submitted = 100, Not Submitted = 0
        `;
        
        // Update module scoring status
        this.updateDecisionFlowStatus('moduleScoringStatus', 'COMPLETE', 'status-pass');
    }

    /**
     * Update final score section
     */
    updateFinalScore(result) {
        // Update progress bar
        const progressBar = document.getElementById('finalScoreProgress');
        const progressLabel = document.getElementById('finalScoreLabel');
        const finalScore = result.finalScore || 0;
        
        progressBar.style.width = `${Math.min(finalScore, 100)}%`;
        progressLabel.textContent = `${finalScore.toFixed(1)}/100`;
        
        // Calculate weighted scores
        let weightedCalculations = '<strong>Weighted Score Calculation:</strong><br>';
        let totalWeighted = 0;
        
        Object.entries(result.moduleScores).forEach(([module, data]) => {
            const weightedScore = data.weightedScore || 0;
            totalWeighted += weightedScore;
            weightedCalculations += `${module.toUpperCase()} (${(data.weight * 100).toFixed(0)}%): ${data.score} × ${(data.weight * 100).toFixed(0)}% = ${weightedScore.toFixed(1)}<br>`;
        });
        
        weightedCalculations += `<strong>TOTAL SCORE:</strong> ${totalWeighted.toFixed(1)}/100`;
        document.getElementById('weightedCalculations').innerHTML = weightedCalculations;
        
        // Update final score status
        let statusClass = 'status-warning';
        if (finalScore >= 70) statusClass = 'status-pass';
        else if (finalScore < 50) statusClass = 'status-fail';
        
        this.updateDecisionFlowStatus('finalScoreStatus', `${finalScore.toFixed(1)}/100`, statusClass);
    }

    /**
     * Display final decision
     */
    displayFinalDecision(result) {
        const finalDecisionDiv = document.getElementById('finalDecision');
        const finalScoreElement = document.getElementById('displayFinalScore');
        const decisionElement = document.getElementById('displayDecision');
        const riskElement = document.getElementById('displayRiskLevel');
        const actionElement = document.getElementById('displayActionRequired');
        const dbrWarningElement = document.getElementById('finalDbrWarning');
        
        // Set decision class
        finalDecisionDiv.className = 'final-decision';
        if (result.decision === 'PASS') {
            finalDecisionDiv.classList.add('decision-pass');
        } else if (result.decision === 'FAIL') {
            finalDecisionDiv.classList.add('decision-fail');
        } else {
            finalDecisionDiv.classList.add('decision-conditional');
        }
        
        // Update elements
        finalScoreElement.textContent = result.finalScore.toFixed(1);
        decisionElement.textContent = result.decision;
        riskElement.textContent = `Risk Level: ${result.riskLevel}`;
        riskElement.className = 'risk-level risk-' + result.riskLevel.toLowerCase().replace(' ', '-');
        actionElement.textContent = `Action Required: ${result.actionRequired}`;
        
        // Update DBR warning in final decision
        dbrWarningElement.innerHTML = '';
        const dbrPercentage = result.dbrPercentage || 0;
        const dbrThreshold = 40;
        
        if (dbrPercentage > dbrThreshold) {
            dbrWarningElement.innerHTML = `
                <div class="dbr-critical">
                    <strong>⚠️ CRITICAL:</strong> DBR ${dbrPercentage.toFixed(2)}% exceeds threshold ${dbrThreshold}% - Application FAILED
                </div>
            `;
        } else if (dbrPercentage > (dbrThreshold * 0.8)) {
            dbrWarningElement.innerHTML = `
                <div class="dbr-warning">
                    <strong>⚠️ WARNING:</strong> DBR ${dbrPercentage.toFixed(2)}% is close to threshold ${dbrThreshold}% - Monitor closely
                </div>
            `;
        }
        
        // Update module scores breakdown
        this.updateModuleScoresBreakdown(result);
    }

    /**
     * Update module scores breakdown
     */
    updateModuleScoresBreakdown(result) {
        const container = document.getElementById('moduleScoresContainer');
        container.innerHTML = '';
        
        Object.entries(result.moduleScores).forEach(([module, data]) => {
            // Determine score color class
            let scoreClass = 'score-low';
            if (data.score >= 80) scoreClass = 'score-high';
            else if (data.score >= 60) scoreClass = 'score-medium';
            
            // Create notes HTML
            let notesHtml = '';
            if (data.notes && data.notes.length > 0) {
                notesHtml = `
                    <div class="notes">
                        <div class="notes-title">Notes:</div>
                        ${data.notes.join('; ')}
                    </div>
                `;
            }
            
            // Create module card
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card';
            moduleCard.innerHTML = `
                <div class="module-header">
                    <div class="module-title">${module.toUpperCase()}</div>
                    <div class="module-weight">${(data.weight * 100).toFixed(0)}%</div>
                </div>
                <div class="score-details">
                    <span>Score: ${data.score}/100</span>
                    <span>Weighted: ${data.weightedScore.toFixed(1)}</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill ${scoreClass}" style="width: ${data.score}%"></div>
                </div>
                ${notesHtml}
            `;
            
            container.appendChild(moduleCard);
        });
    }

    /**
     * Update decision flow status
     */
    updateDecisionFlowStatus(elementId, text, className) {
        const element = document.getElementById(elementId);
        element.textContent = text;
        element.className = 'step-status ' + className;
    }

    /**
     * Load sample data
     */
    loadSampleData() {
        document.getElementById('applicationId').value = '141';
        document.getElementById('cluster').value = 'FEDERAL';
        document.getElementById('employmentType').value = 'permanent';
        document.getElementById('salaryTransferFlag').value = 'salary_transfer';
        document.getElementById('totalIncome').value = '50000';
        
        // If we have data, recalculate
        if (this.currentApplicationData) {
            this.recalculateDecision();
        }
    }

    /**
     * Reset form
     */
    resetForm() {
        document.getElementById('applicationId').value = '';
        document.getElementById('cluster').value = '';
        document.getElementById('employmentType').value = 'permanent';
        document.getElementById('salaryTransferFlag').value = 'salary_transfer';
        document.getElementById('totalIncome').value = '50000';
        
        // Reset UI elements
        document.getElementById('applicationDataSection').style.display = 'none';
        document.getElementById('finalDecisionPanel').style.display = 'none';
        
        // Reset decision flow
        document.getElementById('criticalChecksStatus').textContent = 'Pending';
        document.getElementById('criticalChecksStatus').className = 'step-status status-warning';
        document.getElementById('moduleScoringStatus').textContent = 'Pending';
        document.getElementById('moduleScoringStatus').className = 'step-status status-warning';
        document.getElementById('finalScoreStatus').textContent = 'Pending';
        document.getElementById('finalScoreStatus').className = 'step-status status-warning';
        
        // Reset calculation elements
        document.getElementById('ageCalculation').textContent = 'Waiting for data...';
        document.getElementById('dbrCalculation').textContent = 'Waiting for data...';
        document.getElementById('spuCalculation').textContent = 'Waiting for data...';
        document.getElementById('cityCalculation').textContent = 'Waiting for data...';
        document.getElementById('incomeCalculation').textContent = 'Waiting for data...';
        document.getElementById('eamvuCalculation').textContent = 'Waiting for data...';
        document.getElementById('weightedCalculations').textContent = 'Waiting for module scores...';
        document.getElementById('finalScoreProgress').style.width = '0%';
        document.getElementById('finalScoreLabel').textContent = '0/100';
        document.getElementById('dbrWarningContainer').innerHTML = '';
        
        this.currentApplicationData = null;
    }

    /**
     * Download report
     */
    downloadReport() {
        if (!this.currentApplicationData) {
            alert('No decision data available to download.');
            return;
        }
        
        // Create a simple text report
        const applicationId = document.getElementById('apiApplicationId').textContent;
        const customerName = document.getElementById('apiCustomerName').textContent;
        const finalScore = document.getElementById('displayFinalScore').textContent;
        const decision = document.getElementById('displayDecision').textContent;
        const riskLevel = document.getElementById('displayRiskLevel').textContent;
        const actionRequired = document.getElementById('displayActionRequired').textContent;
        
        let report = `CREDIT CARD DECISION REPORT\n`;
        report += `=========================\n\n`;
        report += `Application ID: ${applicationId}\n`;
        report += `Customer Name: ${customerName}\n`;
        report += `Date: ${new Date().toLocaleString()}\n\n`;
        report += `FINAL DECISION\n`;
        report += `-------------\n`;
        report += `Final Score: ${finalScore}\n`;
        report += `Decision: ${decision}\n`;
        report += `${riskLevel}\n`;
        report += `${actionRequired}\n\n`;
        
        report += `MODULE SCORES\n`;
        report += `-------------\n`;
        
        // Get module scores from the result
        const result = this.decisionEngine.calculateDecision(this.currentApplicationData);
        
        Object.entries(result.moduleScores).forEach(([module, data]) => {
            report += `${module.toUpperCase()} (${(data.weight * 100).toFixed(0)}%):\n`;
            report += `  Score: ${data.score}/100\n`;
            report += `  Weighted Score: ${data.weightedScore.toFixed(1)}\n`;
            if (data.notes && data.notes.length > 0) {
                report += `  Notes: ${data.notes.join('; ')}\n`;
            }
            report += `\n`;
        });
        
        // Create download link
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
        element.setAttribute('download', `credit_decision_report_${applicationId}.txt`);
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
    }
}

// Utility functions for UI interactions
function toggleStep(element) {
    const content = element.nextElementSibling;
    const isActive = element.classList.contains('active');
    
    if (isActive) {
        element.classList.remove('active');
        content.style.maxHeight = null;
    } else {
        element.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

function toggleSection(element) {
    const content = element.nextElementSibling;
    const isActive = element.classList.contains('active');
    
    if (isActive) {
        element.classList.remove('active');
        content.style.maxHeight = null;
    } else {
        element.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

// Global variables and initialization
let frontend = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    frontend = new DecisionEngineFrontend();
});

// Global functions for HTML onclick handlers
function fetchApplicationData() {
    if (frontend) frontend.fetchApplicationData();
}

function recalculateDecision() {
    if (frontend) frontend.recalculateDecision();
}

function loadSampleData() {
    if (frontend) frontend.loadSampleData();
}

function resetForm() {
    if (frontend) frontend.resetForm();
}

function downloadReport() {
    if (frontend) frontend.downloadReport();
}
