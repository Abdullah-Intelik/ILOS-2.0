# Generic Names Implementation for ILOS

## Overview
All bank-specific and company-specific names have been removed from the autofill test data to make ILOS a generic loan origination system that can be used by any financial institution.

## Changes Made

### Bank Names
**Before:**
- Generic company/organization names (removed all specific bank references)
- Etc.

**After:**
- Bank A
- Bank B
- Bank C
- Bank D
- Bank E
- Bank F
- Partner Bank (for primary banking relationship)

### Company Names
**Before:**
- Engro Corporation
- Lucky Cement
- Nestle Pakistan
- Packages Limited
- Systems Limited
- Toyota Indus Motors
- Adamjee Insurance

**After:**
- ABC Corporation
- XYZ Industries
- Global Manufacturing Ltd
- International Corp
- Tech Corporation Ltd
- Auto Dealer XYZ
- Insurance Company A

### Form Titles
**Before:**
- "Credit Card Application"
- "Platinum Credit Card Application"

**After:**
- "Credit Card Application"
- "Platinum Credit Card Application"

## Files Updated

### 1. CashPlus Form
**File:** `frontend/app/dashboard/applicant/cashplus/page.tsx`

Changes:
- Updated personal names from "John Doe" to "Ahmed Khan"
- Removed all bank-specific names from test data

### 2. Personal Auto Loan Form
**File:** `frontend/app/dashboard/applicant/auto/personalautoloans/page.tsx`

Changes:
- Changed vehicle make from "Toyota" to "Honda"
- Changed vehicle model from "Corolla GLi" to "Civic"
- Changed dealer from "Toyota Indus Motors" to "Auto Dealer XYZ"
- Changed insurance from "Adamjee Insurance" to "Insurance Company A"
- Changed employer from "Systems Limited" to "Tech Corporation Ltd"
- Updated all bank names to generic (Bank A, Bank B, etc.)
- Changed specific bank names to generic terms

### 3. Credit Card Form
**File:** `frontend/app/dashboard/applicant/creditcard/credit-card/page.tsx`

Changes:
- Changed employer from "Engro Corporation" to "ABC Corporation"
- Changed previous employer from "Lucky Cement" to "XYZ Industries"
- Updated office address from specific location to "Business Tower, Commercial Area"
- Changed banking partner to generic terms
- Updated form title to "Credit Card Application"

### 4. Platinum Credit Card Form
**File:** `frontend/app/dashboard/applicant/creditcard/platinum-credit-card/page.tsx`

Changes:
- Changed employer from "Packages Limited" to "Global Manufacturing Ltd"
- Changed previous employer from "Nestle Pakistan" to "International Corp"
- Updated all bank names in obligations to generic (Bank A-F)
- Changed banking partner to generic terms
- Updated form title to "Platinum Credit Card Application"
- Updated main heading to "Platinum Credit Card Application"

## Generic Bank Naming Convention

For consistency across the application:

### Primary Banking Relationship
- Use: **"Partner Bank"**
- Purpose: Represents the financial institution using the ILOS system

### Existing Obligations
Use alphabetical naming for competing banks:
- **Bank A** - First external bank (typically highest exposure)
- **Bank B** - Second external bank
- **Bank C** - Third external bank
- **Bank D** - For personal loans
- **Bank E** - For auto loans
- **Bank F** - For other facilities

## Benefits

1. **White-Label Solution:** ILOS can now be deployed for any financial institution
2. **No Branding Conflicts:** Removes competitive bank names
3. **Professional Testing:** Test data appears neutral and professional
4. **Regulatory Compliance:** Avoids appearance of bias toward specific institutions
5. **Flexibility:** Easy to customize for specific deployments
6. **Training:** Staff can focus on processes rather than specific banks

## Implementation Guidelines

When adding new test data or scenarios:

### DO:
✅ Use generic names (Bank A, Company XYZ, etc.)
✅ Use "Partner Bank" for the primary institution
✅ Use realistic but generic Pakistani names
✅ Use generic location descriptions

### DON'T:
❌ Use real bank names
❌ Use real company names (Engro, Nestle, Lucky, etc.)
❌ Use specific brand names (Toyota, Honda are acceptable as they're vehicle makes)
❌ Hard-code bank branding in form titles

## Future Considerations

### Customization for Deployment
When deploying for a specific institution:

1. **Branding:** Update form headers with client's bank name
2. **Logo:** Add client's logo to forms
3. **Color Scheme:** Match client's brand colors
4. **Partner Banks:** Can optionally specify real competing banks in dropdown lists
5. **Forms:** Customize field labels to match client's terminology

### Configuration File
Consider creating a configuration file:

```javascript
// config/branding.js
export const BRANDING = {
  institutionName: 'Partner Bank', // Can be overridden
  formTitles: {
    creditCard: 'Credit Card Application',
    platinum: 'Platinum Credit Card Application',
    autoLoan: 'Auto Loan Application',
    cashPlus: 'Personal Loan Application'
  },
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981'
  }
};
```

## Testing

All autofill functionality remains unchanged:
- ✅ 3 DBR scenarios (Excellent, Good, Bad)
- ✅ All required fields populated
- ✅ Realistic test data
- ✅ Proper field name mapping
- ✅ Toast notifications
- ✅ Form validation

## Related Files

- Primary Implementation: `AUTOFILL_DBR_SCENARIOS_IMPLEMENTATION.md`
- Form Components: All files in `frontend/app/dashboard/applicant/`
- Customer Context: `frontend/contexts/CustomerContext.tsx`

---

**Last Updated:** October 22, 2025  
**Version:** 2.0 - Generic Names Implementation

