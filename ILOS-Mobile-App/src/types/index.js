// JavaScript doesn't need interface definitions
// This file is kept for consistency but interfaces are handled by PropTypes or JSDoc if needed

export const LoanTypes = {
  CASH_PLUS: 'CashPlus Loan',
  PERSONAL_AUTO: 'Personal Auto Loan',
  SME_ASAAN: 'SME ASAAN Loan',
  SME_COMMERCIAL: 'SME Commericial Vehicle Loan',
  CLASSIC_CREDIT: 'Classic Credit Card Loan',
  PLATINUM_CREDIT: 'Platinum Credit Card',
  AMEEN_DRIVE: 'Ameen Drive Loan'
};

export const DocumentTypes = {
  CNIC: 'CNIC',
  SALARY_SLIP: 'Salary Slip',
  BANK_STATEMENT: 'Bank Statement',
  PROPERTY_DOCS: 'Property Documents',
  OTHER: 'Other'
};

export const StatusTypes = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  COLLECTED: 'Collected',
  VERIFIED: 'Verified'
};

export const PriorityTypes = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};