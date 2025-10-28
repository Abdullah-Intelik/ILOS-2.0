# Autofill DBR Scenarios Implementation

## Overview
Added comprehensive autofill functionality with 3 DBR (Debt Burden Ratio) scenarios to all loan application forms for testing purposes. Each scenario fills the form with realistic data that results in different DBR outcomes.

## Forms Updated

### 1. CashPlus Personal Loan Form
**Location:** `frontend/app/dashboard/applicant/cashplus/page.tsx`

### 2. Personal Auto Loan Form  
**Location:** `frontend/app/dashboard/applicant/auto/personalautoloans/page.tsx`

### 3. Credit Card Form
**Location:** `frontend/app/dashboard/applicant/creditcard/credit-card/page.tsx`

### 4. Platinum Credit Card Form
**Location:** `frontend/app/dashboard/applicant/creditcard/platinum-credit-card/page.tsx`

## DBR Scenarios

### Excellent DBR (<35%)
- **Description:** High income, minimal obligations
- **Net Monthly Income:** PKR 200,000
- **Monthly Rent:** PKR 20,000
- **Existing Credit Cards:** 1 card with minimal balance
- **Existing Loans:** None
- **Expected DBR:** ~30%
- **Expected Result:** ✅ PASS

### Good DBR (35-40%)
- **Description:** Moderate income and obligations
- **Net Monthly Income:** PKR 150,000
- **Monthly Rent:** PKR 30,000
- **Existing Credit Cards:** 2 cards with moderate balances
- **Existing Loans:** 1 personal loan
- **Expected DBR:** ~38%
- **Expected Result:** ⚠️ CONDITIONAL PASS

### Bad DBR (>40%)
- **Description:** Lower income, high obligations
- **Net Monthly Income:** PKR 120,000
- **Monthly Rent:** PKR 50,000
- **Existing Credit Cards:** 3 cards with high balances
- **Existing Loans:** Multiple loans (personal + auto)
- **Expected DBR:** ~62%
- **Expected Result:** ❌ FAIL

## User Interface

Each form now has a "Testing Options" panel that includes:

1. **Validation Toggle:** Enable/disable field validation
2. **Autofill Buttons:** Three color-coded buttons
   - 🟢 **Excellent DBR** (Green) - <35%
   - 🔵 **Good DBR** (Blue) - 35-40%
   - 🔴 **Bad DBR** (Red) - >40%
3. **Status Indicator:** Shows validation status and missing fields

## DBR Calculation Fields

The autofill ensures all DBR-required fields are populated:

### Income Fields
- Gross Monthly Salary
- Net Monthly Income
- Other Income (if applicable)
- Total Monthly Income

### Obligation Fields
- Monthly Rent
- Existing Credit Card Limits & Outstanding
- Personal Loans (Clean & Secured)
- Other Facilities
- Proposed Loan Installment

## Field Name Mapping

Each form uses different field structures in customerData:

### CashPlus
```javascript
customerData.incomeDetails.grossMonthlySalary
customerData.incomeDetails.netMonthlyIncome
customerData.addressDetails.currentAddress.monthlyRent
customerData.loanPreference.amountRequested
customerData.loanPreference.maxAffordableInstallment
```

### Auto Loan
```javascript
formData.grossMonthlySalary
formData.netMonthlyIncome
formData.vehiclePrice
formData.monthlyInstallment
formData.credit_cards_clean
formData.personal_loans_clean
```

### Credit Card
```javascript
customerData.employmentIncome.grossMonthlySalary
customerData.employmentIncome.netMonthlyIncome
customerData.creditCard.requestedLimit
// Backend fetches existing obligations from ECIB
```

### Platinum Credit Card
```javascript
customerData.incomeDetails.monthlyIncome
customerData.incomeDetails.netMonthlySalary
customerData.platinumCard.requestedLimit
// Backend fetches existing obligations from ECIB
```

## How to Use

1. Navigate to any loan application form
2. Click "Show Options" in the Testing Options panel
3. Click one of the three DBR scenario buttons:
   - **Excellent DBR** - For testing approval scenarios
   - **Good DBR** - For testing conditional approval scenarios
   - **Bad DBR** - For testing rejection scenarios
4. Toggle validation OFF if you want to submit incomplete forms
5. Review the autofilled data
6. Submit the application to test the decision engine

## Benefits

1. **Faster Testing:** No need to manually fill forms
2. **Consistent Test Data:** Same scenarios across all products
3. **DBR Testing:** Test different decision engine outcomes
4. **Training:** Helps PB staff understand what data leads to different DBR results
5. **Development:** Easier to test backend changes

## Technical Notes

- Autofill uses `updateCustomerData()` from Customer Context
- Field names are mapped correctly for each form's schema
- Toast notifications confirm successful autofill
- All mandatory fields are populated
- Realistic Pakistani names, addresses, and phone numbers
- Valid CNICs and date formats
- **Generic bank names** (Bank A, Bank B, etc.) used instead of specific banks
- **Generic company names** used for employers and insurance providers
- Form titles updated to remove bank branding (e.g., "Credit Card Application")

## Backend Integration

The autofilled data flows through the normal application pipeline:
1. Form submission → Backend API
2. Data stored in database tables
3. Decision engine retrieves application data
4. DBR calculation uses income and obligation fields
5. Credit history fetched from ECIB (for existing customers)
6. Final decision rendered based on all modules

## Future Enhancements

- Add more scenarios (e.g., NTB vs ETB)
- Add age/city-specific scenarios
- Add SPU (Special Persons Unit) test cases
- Save custom scenarios
- Export test data

## Maintenance

When adding new required fields to forms:
1. Update the autofill function in the form's page component
2. Add the field to all three scenarios
3. Test that the field is properly populated
4. Verify backend receives the field correctly

## Related Files

- Backend DBR Service: `backend/decision-engine/services/dbrService.js`
- Backend Decision Engine: `backend/lib/DecisionEngine.js`
- Customer Context: `frontend/contexts/CustomerContext.tsx`
- Testing Options UI: Integrated in each form's page component

