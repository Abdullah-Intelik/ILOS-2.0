const crypto = require('crypto');

/**
 * Department-wise Field Integrity System
 * Tracks and detects manipulation as applications move between departments
 */

// Field sensitivity classification
const FIELD_SENSITIVITY = {
  HIGH: ['salary', 'income', 'loanAmount', 'cnic', 'applicantName', 'monthlyIncome'],
  MEDIUM: ['tenure', 'purpose', 'employmentType', 'address', 'phone'],
  LOW: ['email', 'comments', 'preferences', 'branch']
};

// Risk scoring based on sensitivity and change type
const RISK_SCORES = {
  HIGH: { VALUE_CHANGE: 10, LENGTH_CHANGE: 8, TYPE_CHANGE: 9 },
  MEDIUM: { VALUE_CHANGE: 5, LENGTH_CHANGE: 3, TYPE_CHANGE: 4 },
  LOW: { VALUE_CHANGE: 1, LENGTH_CHANGE: 1, TYPE_CHANGE: 1 }
};

/**
 * Create field-level integrity data for an application
 * @param {Object} formData - The application form data
 * @param {string} department - Department creating the hash
 * @param {string} losId - LOS ID
 * @return {Object} Field integrity object
 */
function createFieldIntegrity(formData, department, losId) {
  const fieldIntegrity = {};
  const sensitivityMap = {};
  
  for (const [fieldName, value] of Object.entries(formData)) {
    if (value !== null && value !== undefined) {
      const normalizedValue = canonicalize(value);
      const hash = crypto.createHash('sha256').update(normalizedValue).digest('hex');
      const sensitivity = classifyFieldSensitivity(fieldName);
      const checksum = crypto.createHash('md5').update(normalizedValue).digest('hex').substring(0, 8);
      
      fieldIntegrity[fieldName] = {
        hash,
        type: getFieldType(value),
        sensitivity,
        length: String(value).length,
        checksum,
        department: department,
        timestamp: new Date().toISOString()
      };
      
      sensitivityMap[fieldName] = sensitivity;
    }
  }
  
  // Create overall hash of all field hashes
  const overallHash = crypto.createHash('sha256')
    .update(Object.values(fieldIntegrity).map(f => f.hash).sort().join(''))
    .digest('hex');
  
  return {
    formMetadata: {
      losId,
      department,
      formType: 'loan_application',
      timestamp: new Date().toISOString(),
      version: '1.0'
    },
    fieldIntegrity,
    overallHash,
    sensitivityMap,
    isBasicComparison: false
  };
}

/**
 * Verify form integrity against original field data
 * @param {Object} currentFormData - Current form data
 * @param {Object} originalFieldIntegrity - Original field integrity data
 * @return {Object} Verification result
 */
function verifyFormIntegrity(currentFormData, originalFieldIntegrity) {
  if (!originalFieldIntegrity || originalFieldIntegrity.isBasicComparison) {
    // Basic comparison mode
    return {
      isValid: true,
      overallChanged: false,
      changedFields: [],
      addedFields: [],
      removedFields: [],
      suspiciousChanges: [],
      integrityScore: 100,
      report: generateReport([], [], [], 100)
    };
  }
  
  const changedFields = [];
  const addedFields = [];
  const removedFields = [];
  const suspiciousChanges = [];
  let totalRiskScore = 0;
  
  const originalFields = originalFieldIntegrity.fieldIntegrity || {};
  const currentFields = new Set(Object.keys(currentFormData));
  const originalFieldNames = new Set(Object.keys(originalFields));
  
  // Check for removed fields
  for (const fieldName of originalFieldNames) {
    if (!currentFields.has(fieldName)) {
      removedFields.push({
        fieldName,
        sensitivity: originalFields[fieldName].sensitivity,
        changeType: 'FIELD_REMOVED',
        riskScore: RISK_SCORES[originalFields[fieldName].sensitivity].VALUE_CHANGE
      });
      totalRiskScore += RISK_SCORES[originalFields[fieldName].sensitivity].VALUE_CHANGE;
    }
  }
  
  // Check for added fields
  for (const fieldName of currentFields) {
    if (!originalFieldNames.has(fieldName)) {
      const sensitivity = classifyFieldSensitivity(fieldName);
      addedFields.push({
        fieldName,
        sensitivity,
        changeType: 'FIELD_ADDED',
        riskScore: RISK_SCORES[sensitivity].VALUE_CHANGE
      });
      totalRiskScore += RISK_SCORES[sensitivity].VALUE_CHANGE;
    }
  }
  
  // Check existing fields for changes
  for (const [fieldName, currentValue] of Object.entries(currentFormData)) {
    if (originalFields[fieldName]) {
      const originalField = originalFields[fieldName];
      const currentNormalized = canonicalize(currentValue);
      const currentHash = crypto.createHash('sha256').update(currentNormalized).digest('hex');
      
      if (currentHash !== originalField.hash) {
        const changeType = determineChangeType(originalField, currentValue);
        const riskScore = RISK_SCORES[originalField.sensitivity][changeType];
        
        const change = {
          fieldName,
          sensitivity: originalField.sensitivity,
          changeType,
          originalHash: originalField.hash,
          currentHash,
          riskScore,
          originalDepartment: originalField.department
        };
        
        changedFields.push(change);
        totalRiskScore += riskScore;
        
        // Flag suspicious changes (high sensitivity fields)
        if (originalField.sensitivity === 'HIGH') {
          suspiciousChanges.push(change);
        }
      }
    }
  }
  
  // Calculate integrity score (0-100, lower is worse)
  const maxPossibleScore = Object.keys(originalFields).length * 10;
  const integrityScore = Math.max(0, Math.min(100, 100 - ((totalRiskScore / maxPossibleScore) * 100)));
  
  const isValid = changedFields.length === 0 && addedFields.length === 0 && removedFields.length === 0;
  const overallChanged = !isValid;
  
  return {
    isValid,
    overallChanged,
    changedFields,
    addedFields,
    removedFields,
    suspiciousChanges,
    integrityScore: Math.round(integrityScore),
    report: generateReport(changedFields, addedFields, removedFields, Math.round(integrityScore), suspiciousChanges)
  };
}

/**
 * Normalize value for consistent hashing
 */
function canonicalize(value) {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return JSON.stringify(value);
}

/**
 * Classify field sensitivity based on field name
 */
function classifyFieldSensitivity(fieldName) {
  const lowerField = fieldName.toLowerCase();
  
  for (const field of FIELD_SENSITIVITY.HIGH) {
    if (lowerField.includes(field.toLowerCase())) {
      return 'HIGH';
    }
  }
  
  for (const field of FIELD_SENSITIVITY.MEDIUM) {
    if (lowerField.includes(field.toLowerCase())) {
      return 'MEDIUM';
    }
  }
  
  return 'LOW';
}

/**
 * Get field type for a value
 */
function getFieldType(value) {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    if (/^\d{5}-\d{7}-\d{1}$/.test(value)) return 'cnic';
    if (/^\+?[\d\s-()]+$/.test(value)) return 'phone';
    if (/@/.test(value)) return 'email';
    return 'string';
  }
  return 'object';
}

/**
 * Determine the type of change that occurred
 */
function determineChangeType(originalField, currentValue) {
  const currentStr = String(currentValue);
  const originalLength = originalField.length;
  const currentLength = currentStr.length;
  
  if (Math.abs(currentLength - originalLength) > originalLength * 0.2) {
    return 'LENGTH_CHANGE';
  }
  
  if (getFieldType(currentValue) !== originalField.type) {
    return 'TYPE_CHANGE';
  }
  
  return 'VALUE_CHANGE';
}

/**
 * Compare two values for changes
 */
function compareValues(original, current) {
  const originalNorm = canonicalize(original);
  const currentNorm = canonicalize(current);
  return originalNorm === currentNorm;
}

/**
 * Generate a detailed report of changes
 */
function generateReport(changedFields, addedFields, removedFields, integrityScore, suspiciousChanges = []) {
  const totalChanges = changedFields.length + addedFields.length + removedFields.length;
  
  let summary;
  let riskLevel;
  
  if (totalChanges === 0) {
    summary = 'Form integrity verified. No changes detected.';
    riskLevel = 'NONE';
  } else if (suspiciousChanges.length > 0) {
    summary = `Critical changes detected (${totalChanges} fields modified, ${suspiciousChanges.length} suspicious).`;
    riskLevel = 'CRITICAL';
  } else if (totalChanges > 5) {
    summary = `Major changes detected (${totalChanges} fields modified).`;
    riskLevel = 'HIGH';
  } else if (totalChanges > 2) {
    summary = `Moderate changes detected (${totalChanges} fields modified).`;
    riskLevel = 'MEDIUM';
  } else {
    summary = `Minor changes detected (${totalChanges} fields modified).`;
    riskLevel = 'LOW';
  }
  
  const details = [];
  
  // Add change details
  changedFields.forEach(change => {
    details.push({
      field: change.fieldName,
      sensitivity: change.sensitivity,
      changeType: change.changeType,
      riskScore: change.riskScore,
      message: `Field '${change.fieldName}' (${change.sensitivity} sensitivity) was modified`,
      department: change.originalDepartment
    });
  });
  
  addedFields.forEach(field => {
    details.push({
      field: field.fieldName,
      sensitivity: field.sensitivity,
      changeType: field.changeType,
      riskScore: field.riskScore,
      message: `Field '${field.fieldName}' was added`
    });
  });
  
  removedFields.forEach(field => {
    details.push({
      field: field.fieldName,
      sensitivity: field.sensitivity,
      changeType: field.changeType,
      riskScore: field.riskScore,
      message: `Field '${field.fieldName}' was removed`
    });
  });
  
  // Add alerts for suspicious changes
  if (suspiciousChanges.length > 0) {
    details.push({
      type: 'ALERT',
      message: `${suspiciousChanges.length} suspicious changes detected in high-sensitivity fields`
    });
  }
  
  return {
    summary,
    details,
    riskLevel
  };
}

module.exports = {
  createFieldIntegrity,
  verifyFormIntegrity,
  canonicalize,
  classifyFieldSensitivity,
  compareValues,
  generateReport
};







