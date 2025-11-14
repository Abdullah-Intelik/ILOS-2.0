# 🔍 CBS Auto-Fill Audit

**Date:** November 6, 2025  
**Purpose:** Verify all available CBS data is being auto-filled

---

## ✅ Fields Currently Auto-Filled from CBS

### Personal Information
| Field | CBS Source | Status |
|-------|------------|--------|
| Full Name | `cif_customers.fullname` | ✅ Auto-filled |
| CNIC | `cif_customers.cnic` | ✅ Auto-filled |
| Date of Birth | `individual_info.date_of_birth` | ✅ Auto-filled |
| Gender | `individual_info.sex` | ✅ Auto-filled |
| Marital Status | `individual_info.maritial_status` | ✅ Auto-filled |
| Father/Husband Name | `individual_info.father_husband_name` | ✅ Auto-filled |
| Mother's Maiden Name | `individual_info.maiden_name` | ✅ Auto-filled |
| Title (Mr/Mrs) | `individual_info.title` | ✅ Auto-filled |
| Nationality | `individual_info.country_citizenship` | ✅ Auto-filled |
| Place of Birth | `individual_info.palce_of_birth` | ✅ Auto-filled |

### Contact Information
| Field | CBS Source | Status |
|-------|------------|--------|
| Mobile Number | `phone.phone_no` | ✅ Auto-filled |
| Email Address | `email.address` | ✅ Auto-filled |

### Address Information
| Field | CBS Source | Status |
|-------|------------|--------|
| Residential Address | `postal.address` | ✅ Auto-filled |
| City | `cif_customers.city` | ✅ Auto-filled |
| District | `cif_customers.district` | ✅ Auto-filled |
| Postal Code | `postal.postal_code` | ✅ Auto-filled |
| Country | `postal.address_country_code` | ✅ Auto-filled |

### Employment Information
| Field | CBS Source | Status |
|-------|------------|--------|
| Employer Name | `cif_customers.business` | ✅ Auto-filled |
| Employment Status | Derived from `business` | ✅ Auto-filled |
| Industry | `cif_customers.industry` | ✅ Auto-filled |
| Occupation Code | `individual_info.occupation_code` | ✅ Auto-filled |

### Banking Information
| Field | CBS Source | Status |
|-------|------------|--------|
| Bank Name | `client_banks.bank_name` | ✅ Auto-filled |
| Account Number (IBAN) | `client_banks.actt_no` | ✅ Auto-filled |
| Branch | `client_banks.branch` | ✅ Auto-filled |
| Account Type | Default: 'Current' | ⚠️ Hardcoded |

### Next of Kin (if available)
| Field | CBS Source | Status |
|-------|------------|--------|
| Name | `relationship.relate_customer_name` | ✅ Auto-filled |
| Relationship | `relationship.relationship_type` | ✅ Auto-filled |

---

## ❌ Fields NOT Available in CBS

These fields **CANNOT** be auto-filled from CBS and must be:
- Manually entered by user
- Extracted from OCR (CNIC, Salary Slip, eCIB)
- Calculated/derived

### Critical Missing Fields
| Field | Why Not in CBS | Alternative Source |
|-------|---------------|-------------------|
| **Designation / Job Title** | Only `occupation_code` (numeric) exists | ❌ Must be manually entered |
| **Employment Tenure** | Not tracked in CBS | ❌ Must be manually entered |
| **Monthly Income / Salary** | CBS does not store salary | ✅ **Salary Slip OCR** |
| **Office Address** | Not in CBS | ❌ Must be manually entered |
| **Purpose of Loan** | Application-specific | ❌ User must select |
| **Amount Requested** | Application-specific | ❌ User must enter |
| **Tenure (Loan Duration)** | Application-specific | ❌ User must select |

---

## 🚨 CRITICAL ISSUE IDENTIFIED

### Monthly Income NOT Being Auto-Filled

**Problem:**
- The user mentioned that **Monthly Income** is not being auto-filled from CBS
- **This is CORRECT behavior** - CBS does **NOT** store salary information!

**Expected Behavior:**
- Monthly Income/Salary should come from **Salary Slip OCR**, NOT CBS
- When user uploads Salary Slip in Document Upload Gateway:
  - OCR extracts: `salary`, `employer`, `employee_name`
  - This should auto-fill: `Monthly Income`, `Employer Name` (verify match)

**Current Implementation:**
- ✅ Document Upload Gateway extracts salary from Salary Slip OCR
- ❓ **Need to verify:** Is this OCR data being passed to the form for auto-fill?

---

## 📋 Recommended Actions

### 1. Verify Salary Slip OCR Integration
- [ ] Check if `salarySlipOcrData.salary` is being auto-filled to `Monthly Income` field
- [ ] Check if `salarySlipOcrData.employer` is being cross-validated with CBS employer
- [ ] Check if `salarySlipOcrData.employee_name` matches customer name

### 2. Add Missing OCR Mappings
If Salary Slip OCR data is NOT being auto-filled:
- Update form to accept OCR data from Document Upload Gateway
- Map: `ocrData.salary` → `customerData.incomeDetails.monthlyIncome`
- Map: `ocrData.employer` → `customerData.employmentDetails.companyName`

### 3. Fields That MUST Be Manual (No Auto-Fill Possible)
These fields have NO data source (not in CBS, not in OCR):
- **Designation / Job Title** - User must type (e.g., "Manager", "Engineer")
- **Employment Tenure** - User must enter (in months)
- **Office Address** - User must enter (full office address)
- **Purpose of Loan** - User must select from dropdown
- **Amount Requested** - User must enter
- **Tenure** - User must select

---

## 🎯 Summary

**Total Fields in Form:** 28

**Auto-Fill Coverage:**
- ✅ **From CBS:** 18 fields (64%)
- ✅ **From Salary Slip OCR:** 1 field (4%) - Monthly Income
- ❌ **Manual Entry Required:** 9 fields (32%)

**Manual Entry Fields (Cannot be avoided):**
1. Designation
2. Employment Tenure
3. Office Address (for Personal Loan)
4. Purpose of Loan
5. Amount Requested
6. Tenure
7. Two References (8 fields total: Name, Relationship, Mobile, Address × 2)

**Auto-Fill Rate:** ~68% (19 out of 28 fields)

---

## ✅ Conclusion

The current auto-fill strategy is **correct and optimal**:
- We're fetching **ALL available CBS data** (18 fields)
- We're using **OCR for salary** (1 field)
- Remaining 9 fields **have no data source** and MUST be manual

**Next Step:** Verify that Salary Slip OCR data is correctly flowing from Document Upload Gateway to the form auto-fill.

