/**
 * eCIB Parser Utility
 * Extracts exposure data from eCIB credit reports
 * Auto-fills Credit Cards, Personal Loans, and Other Facilities
 */

export interface ECIBCreditCard {
  bankName: string;
  approvedLimit: string;
  currentOutstanding?: string;
  cardType?: 'Clean' | 'Secured';
  isActive: boolean;
}

export interface ECIBLoan {
  bankName: string;
  approvedLimit: string;
  outstandingAmount: string;
  loanType?: 'Clean' | 'Secured';
  isActive: boolean;
}

export interface ECIBOtherFacility {
  bankName: string;
  approvedLimit: string;
  nature: string;
  currentOutstanding: string;
  isActive: boolean;
}

/**
 * Parse eCIB data and extract exposure information
 */
export function parseECIBExposure(ecibData: any) {
  if (!ecibData?.credit_details?.['Credit Details']) {
    return {
      creditCardsClean: [],
      creditCardsSecured: [],
      personalLoansClean: [],
      personalLoansSecured: [],
      otherFacilities: []
    };
  }

  const creditDetails = ecibData.credit_details['Credit Details'];
  
  const creditCardsClean: ECIBCreditCard[] = [];
  const creditCardsSecured: ECIBCreditCard[] = [];
  const personalLoansClean: ECIBLoan[] = [];
  const personalLoansSecured: ECIBLoan[] = [];
  const otherFacilities: ECIBOtherFacility[] = [];

  creditDetails.forEach((item: any) => {
    // Skip terminated/closed accounts
    if (item['T/E'] === 'T' || item['Account Status']?.toLowerCase().includes('closed')) {
      return;
    }

    const bankName = item.MFI || item['Bank Name'] || 'Unknown Bank';
    const limit = item.Limit || item['Approved Limit'] || '0';
    const balance = item['Present Balance'] || item['Outstanding'] || '0';
    const isActive = item['T/E'] === 'E'; // E = Existing

    // Product code mapping (eCIB standard)
    const productCode = item.Product || item['Product Code'];

    switch (productCode) {
      case '8': // Credit Card
        const cardType = item.Type?.toLowerCase().includes('secured') ? 'Secured' : 'Clean';
        const card: ECIBCreditCard = {
          bankName,
          approvedLimit: formatAmount(limit),
          currentOutstanding: formatAmount(balance),
          cardType,
          isActive
        };
        if (cardType === 'Secured') {
          creditCardsSecured.push(card);
        } else {
          creditCardsClean.push(card);
        }
        break;

      case '1': // Personal Loan
      case '2': // Consumer Finance
      case '9': // Other Consumer Finance
        const loanType = item.Type?.toLowerCase().includes('secured') ? 'Secured' : 'Clean';
        const loan: ECIBLoan = {
          bankName,
          approvedLimit: formatAmount(limit),
          outstandingAmount: formatAmount(balance),
          loanType,
          isActive
        };
        if (loanType === 'Secured') {
          personalLoansSecured.push(loan);
        } else {
          personalLoansClean.push(loan);
        }
        break;

      default: // Other facilities (auto loans, mortgages, etc.)
        const nature = getProductName(productCode) || item.Type || 'Other Facility';
        otherFacilities.push({
          bankName,
          approvedLimit: formatAmount(limit),
          nature,
          currentOutstanding: formatAmount(balance),
          isActive
        });
        break;
    }
  });

  return {
    creditCardsClean,
    creditCardsSecured,
    personalLoansClean,
    personalLoansSecured,
    otherFacilities
  };
}

/**
 * Format amount to readable string
 */
function formatAmount(amount: string | number): string {
  if (!amount || amount === '0') return '0';
  const numAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, '')) : amount;
  return numAmount.toLocaleString();
}

/**
 * Map eCIB product codes to readable names
 */
function getProductName(productCode: string): string {
  const mapping: Record<string, string> = {
    '1': 'Personal Loan',
    '2': 'Consumer Finance',
    '3': 'Auto Loan',
    '4': 'Mortgage / Home Loan',
    '5': 'Business Loan',
    '6': 'Agricultural Loan',
    '7': 'Running Finance',
    '8': 'Credit Card',
    '9': 'Other Consumer Finance',
    '10': 'Overdraft',
    '11': 'Commercial Loan',
    '12': 'SME Loan'
  };
  return mapping[productCode] || `Product ${productCode}`;
}

/**
 * Convert eCIB parsed data to ILOS exposure format
 */
export function convertECIBToILOSFormat(ecibExposure: ReturnType<typeof parseECIBExposure>) {
  return {
    creditCardsClean: ecibExposure.creditCardsClean.map((card, index) => ({
      srNo: index + 1,
      bankName: card.bankName,
      approvedLimit: card.approvedLimit,
      ecibSource: true // Flag to indicate auto-filled from eCIB
    })),
    creditCardsSecured: ecibExposure.creditCardsSecured.map((card, index) => ({
      srNo: index + 1,
      bankName: card.bankName,
      approvedLimit: card.approvedLimit,
      ecibSource: true
    })),
    personalLoansClean: ecibExposure.personalLoansClean.map((loan, index) => ({
      srNo: index + 1,
      bankName: loan.bankName,
      approvedLimit: loan.approvedLimit,
      outstandingAmount: loan.outstandingAmount,
      ecibSource: true
    })),
    personalLoansSecured: ecibExposure.personalLoansSecured.map((loan, index) => ({
      srNo: index + 1,
      bankName: loan.bankName,
      approvedLimit: loan.approvedLimit,
      outstandingAmount: loan.outstandingAmount,
      ecibSource: true
    })),
    otherFacilities: ecibExposure.otherFacilities.map((facility, index) => ({
      srNo: index + 1,
      bankName: facility.bankName,
      approvedLimit: facility.approvedLimit,
      nature: facility.nature,
      currentOutstanding: facility.currentOutstanding,
      ecibSource: true
    }))
  };
}

/**
 * Check if eCIB data is available and valid
 */
export function hasValidECIBData(ecibData: any): boolean {
  return !!(
    ecibData?.credit_details?.['Credit Details'] &&
    Array.isArray(ecibData.credit_details['Credit Details']) &&
    ecibData.credit_details['Credit Details'].length > 0
  );
}

