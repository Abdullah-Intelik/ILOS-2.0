/**
 * eCIB Data Parser
 * Parses the new comprehensive eCIB OCR structure
 * 
 * New Format:
 * [
 *   { "Individual Profile": { ... } },
 *   { "outstanding balance": [ ... ] },
 *   { "Credit Details": [ ... ] },
 *   { "overdue_details": [ ... ] }
 * ]
 */

export interface EcibIndividualProfile {
  Name: string;
  Gender: string;
  'Father/Husband Name': string;
  'Borrower Type': string;
  Employment: string;
  'CNIC #': string;
  'Profile Identifier': string;
  Nationality: string;
  'Obligation as Co-Borrower': string;
  'Country of Passport': string;
  'Current Res. Address': string;
  'Permanent Res. Address': string;
  NICOP?: string;
  POC?: string;
  'Passport No.'?: string;
  'NIC #'?: string;
}

export interface EcibOutstandingBalance {
  'Sr.#': number;
  Principal: number;
  'Mark-up': number;
  Others: number;
  Total: number;
}

export interface EcibCreditDetail {
  'Sr.#': string;
  Product: string;
  'T/E': string;
  'Position as of': string;
  'Date of Approval': string;
  'Date of maturity': string;
  'Secured / Unsecured': string;
  'Sec/ Collateral': string;
  Limit: string;
  'Present Balance': string;
  'Minimum amount due': string;
  'No. of times payments were made late (1-30 days)': string;
  'Current Overdue (Y/N)': string;
  '# of times account went into over due by 30+, 60+, 90+,180+ days': string;
  'Write off/Waived off Amount': {
    S: string;
    U: string;
  };
  'Re-scheduling/Re-Structuring (Y/N)': string;
  'Amount under Litigation': string;
}

export interface EcibOverdueDetail {
  'Sr. #': number;
  Description: string;
  [key: string]: number | string; // Month columns like Jun_2025, May_2025, etc.
}

export interface ParsedEcibData {
  individualProfile?: EcibIndividualProfile;
  outstandingBalance?: EcibOutstandingBalance[];
  creditDetails?: EcibCreditDetail[];
  overdueDetails?: EcibOverdueDetail[];
  raw?: any;
}

/**
 * Parse eCIB data from new OCR format
 */
export function parseEcibData(ecibResult: any[]): ParsedEcibData {
  if (!Array.isArray(ecibResult)) {
    console.warn('⚠️ eCIB result is not an array:', ecibResult);
    return { raw: ecibResult };
  }

  const parsed: ParsedEcibData = { raw: ecibResult };

  ecibResult.forEach((section: any) => {
    // Individual Profile
    if (section['Individual Profile']) {
      parsed.individualProfile = section['Individual Profile'];
    }

    // Outstanding Balance
    if (section['outstanding balance']) {
      parsed.outstandingBalance = section['outstanding balance'];
    }

    // Credit Details
    if (section['Credit Details']) {
      const creditDetails = section['Credit Details'];
      // Filter out header row (contains column labels in parentheses)
      if (Array.isArray(creditDetails)) {
        parsed.creditDetails = creditDetails.filter((item: any) => {
          return item['Sr.#'] && !item['Sr.#'].toString().includes('(');
        });
      }
    }

    // Overdue Details
    if (section['overdue_details']) {
      parsed.overdueDetails = section['overdue_details'];
    }
  });

  return parsed;
}

/**
 * Calculate total exposure from eCIB data
 */
export function calculateTotalExposure(parsedData: ParsedEcibData): {
  totalPrincipal: number;
  totalMarkup: number;
  totalOthers: number;
  totalExposure: number;
} {
  let totalPrincipal = 0;
  let totalMarkup = 0;
  let totalOthers = 0;

  if (parsedData.outstandingBalance && parsedData.outstandingBalance.length > 0) {
    parsedData.outstandingBalance.forEach((balance) => {
      totalPrincipal += Number(balance.Principal) || 0;
      totalMarkup += Number(balance['Mark-up']) || 0;
      totalOthers += Number(balance.Others) || 0;
    });
  }

  return {
    totalPrincipal,
    totalMarkup,
    totalOthers,
    totalExposure: totalPrincipal + totalMarkup + totalOthers
  };
}

/**
 * Get active loans count from credit details
 */
export function getActiveLoansCount(parsedData: ParsedEcibData): number {
  if (!parsedData.creditDetails) return 0;
  
  return parsedData.creditDetails.filter((detail) => {
    const balance = parseFloat(detail['Present Balance']?.replace(/,/g, '') || '0');
    return balance > 0;
  }).length;
}

/**
 * Get overdue loans count
 */
export function getOverdueLoansCount(parsedData: ParsedEcibData): number {
  if (!parsedData.creditDetails) return 0;
  
  return parsedData.creditDetails.filter((detail) => {
    return detail['Current Overdue (Y/N)'] === 'Y';
  }).length;
}

/**
 * Check if customer has any critical overdues (90+ or 180+)
 */
export function hasCriticalOverdues(parsedData: ParsedEcibData): boolean {
  if (!parsedData.overdueDetails) return false;
  
  return parsedData.overdueDetails.some((overdue) => {
    const description = overdue.Description?.toLowerCase() || '';
    if (description.includes('90+') || description.includes('180+')) {
      // Check if any month has overdue amount > 0
      const amounts = Object.keys(overdue)
        .filter(key => key !== 'Sr. #' && key !== 'Description')
        .map(key => parseFloat(String(overdue[key])) || 0);
      
      return amounts.some(amount => amount > 0);
    }
    return false;
  });
}

/**
 * Get credit score risk level based on eCIB data
 */
export function getCreditRiskLevel(parsedData: ParsedEcibData): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const overdueCount = getOverdueLoansCount(parsedData);
  const hasCriticalOD = hasCriticalOverdues(parsedData);
  
  if (hasCriticalOD) return 'CRITICAL';
  if (overdueCount >= 2) return 'HIGH';
  if (overdueCount === 1) return 'MEDIUM';
  return 'LOW';
}

/**
 * Format eCIB data for Decision Engine
 */
export function formatForDecisionEngine(parsedData: ParsedEcibData) {
  const exposure = calculateTotalExposure(parsedData);
  const activeLoans = getActiveLoansCount(parsedData);
  const overdueLoans = getOverdueLoansCount(parsedData);
  const riskLevel = getCreditRiskLevel(parsedData);
  
  return {
    // Legacy format for backward compatibility
    name: parsedData.individualProfile?.Name || '',
    cnic: parsedData.individualProfile?.['CNIC #'] || parsedData.individualProfile?.['Profile Identifier'] || '',
    total_accounts: parsedData.creditDetails?.length || 0,
    active_accounts: activeLoans,
    overdue_accounts: overdueLoans,
    
    // Financial exposure
    principal: exposure.totalPrincipal,
    markup: exposure.totalMarkup,
    others: exposure.totalOthers,
    total_exposure: exposure.totalExposure,
    
    // Risk assessment
    risk_level: riskLevel,
    has_critical_overdues: hasCriticalOverdues(parsedData),
    
    // Full parsed data
    parsed: parsedData
  };
}

/**
 * Backward compatibility: Extract metrics for old system
 */
export function extractLegacyMetrics(ecibData: any): {
  principal: number;
  markup: number;
  others: number;
  total: number;
} {
  // If already in new format
  if (Array.isArray(ecibData)) {
    const parsed = parseEcibData(ecibData);
    const exposure = calculateTotalExposure(parsed);
    return {
      principal: exposure.totalPrincipal,
      markup: exposure.totalMarkup,
      others: exposure.totalOthers,
      total: exposure.totalExposure
    };
  }
  
  // Old format fallback
  return {
    principal: ecibData?.principal || 0,
    markup: ecibData?.markup || 0,
    others: ecibData?.others || 0,
    total: ecibData?.total_exposure || 0
  };
}

