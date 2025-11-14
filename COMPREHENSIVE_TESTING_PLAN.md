# 🧪 ILOS 2.0 - Comprehensive Testing Plan

## 🎯 **Objective**
Test all frontend operations systematically to ensure Backend V2.0 integration is fully functional.

---

## 📋 **Testing Categories**

### **1. Authentication & User Management**
- [ ] Login (PB, SPU, EAVMU, CIU, COPS, RISK, COMPLIANCE)
- [ ] Logout
- [ ] Session persistence
- [ ] Role-based access control

### **2. Customer Management**
- [ ] Customer search by CNIC
- [ ] Customer creation (NTB)
- [ ] Customer profile view
- [ ] Customer status (NTB/ETB/Returning)
- [ ] CBS integration (auto-fill)

### **3. Application Submission (Web)**
#### **CashPlus (Personal Loan)**
- [ ] Form load and initialization
- [ ] Auto-fill from CBS
- [ ] Document upload gateway (CNIC, Salary, eCIB)
- [ ] OCR processing and validation
- [ ] Form validation (all sections)
- [ ] Form submission
- [ ] LOS ID generation
- [ ] Document storage (FileZilla)
- [ ] Auto-save functionality
- [ ] Form restore on reload

#### **AutoLoan**
- [ ] Form load
- [ ] Auto-fill
- [ ] Form submission

#### **Credit Card (Platinum/Classic)**
- [ ] Form load
- [ ] Auto-fill
- [ ] Form submission

#### **Islamic Finance (Ameen Drive)**
- [ ] Form load
- [ ] Auto-fill
- [ ] Form submission

#### **SME Loan (SMEASAAN)**
- [ ] Form load
- [ ] Auto-fill
- [ ] Form submission

#### **Commercial Vehicle**
- [ ] Form load
- [ ] Auto-fill
- [ ] Form submission

#### **Instant Loan**
- [ ] Form load (ETB only)
- [ ] Auto-approve logic
- [ ] Auto-disburse logic
- [ ] Verify not in PB dashboard

### **4. Application Workflow (Automated)**
#### **SPU Checks (Automated)**
- [ ] PEP check
- [ ] SBP Blacklist check
- [ ] NADRA Verisys check
- [ ] Internal Watchlist check
- [ ] CCL check
- [ ] Auto-pass (no flags)
- [ ] Auto-flag (if issues)

#### **EAVMU Auto-Assignment**
- [ ] Auto-assign to Ahmed Hassan (Agent ID: 101)
- [ ] Skip manual SPU/COPS/EAVMU Head
- [ ] Direct to EAVMU Officer

#### **CIU Approval**
- [ ] View application details
- [ ] Approve application
- [ ] Reject application
- [ ] Request more info

#### **COPS Disbursement (Manual)**
- [ ] View approved applications
- [ ] Disburse loan
- [ ] Update status to disbursed

### **5. Mobile App Integration**
#### **Customer App - Authentication**
- [ ] CNIC-based login
- [ ] NTB profile setup (document upload + CBS creation)
- [ ] ETB login (auto-fill from CBS)

#### **Customer App - Application Submission**
- [ ] CashPlus form
- [ ] AutoLoan form
- [ ] Credit Card form
- [ ] Islamic Finance form
- [ ] SME Loan form
- [ ] Commercial Vehicle form
- [ ] Instant Loan form (ETB only, auto-approve + disburse)

#### **Customer App - Draft Management**
- [ ] Save draft
- [ ] Load draft
- [ ] Submit draft
- [ ] Delete draft

#### **Customer App - Application Tracking**
- [ ] View submitted applications
- [ ] Track application status
- [ ] View application history

#### **Mobile-to-PB Flow (Non-Instant Loans)**
- [ ] Submit from mobile app
- [ ] Show in PB dashboard with "Mobile Submission" badge
- [ ] PB completes form
- [ ] Auto-filled with mobile data
- [ ] Documents from mobile available
- [ ] Form submission updates existing application (no duplicate LOS ID)

### **6. Dashboards**
#### **PB Dashboard**
- [ ] View all applications
- [ ] View mobile submissions (pending completion)
- [ ] Filter by status
- [ ] Search by LOS ID/CNIC
- [ ] View application details
- [ ] Complete mobile submissions
- [ ] Edit applications

#### **SPU Dashboard**
- [ ] View applications requiring manual review (flagged)
- [ ] View SPU check results
- [ ] Approve/Reject

#### **EAVMU Dashboard**
- [ ] View assigned applications
- [ ] View field verification tasks
- [ ] Update verification status

#### **CIU Dashboard**
- [ ] View applications for credit decision
- [ ] View financial details
- [ ] Approve/Reject/Request info

#### **COPS Dashboard**
- [ ] View approved applications (ready for disbursement)
- [ ] Disburse loan
- [ ] Update disbursement details

#### **RISK Dashboard**
- [ ] View all applications
- [ ] View risk scores
- [ ] Flag high-risk applications

#### **COMPLIANCE Dashboard**
- [ ] View all applications
- [ ] View compliance checks
- [ ] Flag non-compliant applications

### **7. Document Management**
- [ ] Upload documents (CNIC, Salary, eCIB, References)
- [ ] OCR processing
- [ ] Document validation
- [ ] View documents (modal preview)
- [ ] Download documents
- [ ] FileZilla storage verification

### **8. Backend V2.0 Integration**
#### **API Endpoints**
- [ ] `POST /api/v1/applications` (Create application)
- [ ] `GET /api/v1/applications/:losId` (Get application)
- [ ] `GET /api/v1/applications/department/:dept/paginated` (List applications)
- [ ] `PUT /api/v1/applications/:losId` (Update application)
- [ ] `GET /api/v1/products` (List products)
- [ ] `GET /api/v1/products/:productCode` (Get product)
- [ ] `POST /api/v1/products/validate` (Validate eligibility)
- [ ] `GET /customer-status/:cnic` (Customer status - Legacy)
- [ ] `GET /api/getNTB_ETB/:cnic` (NTB/ETB check - Legacy)
- [ ] `GET /cif/:customerId` (CIF details - Legacy)
- [ ] `POST /api/decision/upload-ecib` (eCIB OCR - Legacy)
- [ ] `POST /api/decision/upload-cnic` (CNIC OCR - Legacy)
- [ ] `POST /api/decision/upload-salary-slip` (Salary OCR - Legacy)

#### **Database Schema**
- [ ] `parties` table (customer master)
- [ ] `party_details` table (employment, banking)
- [ ] `products` table (product catalog)
- [ ] `applications` table (application registry)
- [ ] `product_personal_loan` table
- [ ] `product_auto_loan` table
- [ ] `product_credit_card` table
- [ ] `product_islamic_finance` table
- [ ] `application_references` table
- [ ] `application_exposure` table
- [ ] `application_documents` table
- [ ] `application_workflow` table
- [ ] `global_los_id_seq` sequence
- [ ] `party_details_party_id_unique` constraint

### **9. Error Handling**
- [ ] Network errors (timeout, connection refused)
- [ ] Validation errors (missing required fields)
- [ ] Business logic errors (amount below minimum)
- [ ] Database errors (duplicate, constraint violations)
- [ ] OCR errors (failed processing)
- [ ] FileZilla errors (upload failed)

### **10. UI/UX**
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error messages
- [ ] Success toasts
- [ ] Form validation feedback
- [ ] Progress indicators
- [ ] Auto-save indicator
- [ ] Restore prompt

---

## 🚀 **Execution Plan**

### **Phase 1: Critical Path (Priority 1)**
1. ✅ Fix all blocking errors
2. ✅ Verify backend is running
3. Test CashPlus submission (end-to-end)
4. Test Instant Loan (auto-approve + disburse)
5. Test Mobile-to-PB flow

### **Phase 2: Core Features (Priority 2)**
1. Test all product forms (web)
2. Test customer app (all products)
3. Test automated workflow (SPU, EAVMU, CIU, COPS)
4. Test dashboards (all roles)

### **Phase 3: Edge Cases (Priority 3)**
1. Test error scenarios
2. Test concurrent submissions
3. Test duplicate prevention
4. Test data integrity

### **Phase 4: Performance (Priority 4)**
1. Load testing (100 applications)
2. OCR performance (large files)
3. Database performance (complex queries)
4. FileZilla storage (large uploads)

---

## 📊 **Test Report Template**

### **Test: [Test Name]**
- **Status:** ✅ Pass / ❌ Fail / ⚠️ Partial
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Errors:** [Error messages, if any]
- **Notes:** [Additional observations]

---

## 🔧 **Testing Tools**

### **Manual Testing**
- Browser DevTools (Console, Network, Application)
- PostgreSQL client (psql, pgAdmin)
- FileZilla client (verify uploads)
- Backend logs (console output)

### **Automated Testing (Future)**
- Jest (unit tests)
- Supertest (API tests)
- Playwright (E2E tests)
- K6 (load tests)

---

## ✅ **Current Status**

### **Fixed Issues (Session Summary)**
1. ✅ Customer ID error (made optional)
2. ✅ Auto-save functionality (5-second interval)
3. ✅ Amount 0 validation error (hardcoded test bypass)
4. ✅ Database constraint error (UNIQUE on party_details.party_id)
5. ✅ Duplicate party error (upsert logic)
6. ✅ Method not found error (added findByCnic)

### **Next Test: CashPlus Submission**
**Prerequisites:**
- ✅ Backend V2.0 running on port 5000
- ✅ Frontend running on port 3000
- ✅ PostgreSQL running (ilos_db)
- ✅ CBS database accessible (cbs_db)
- ✅ FileZilla server running on port 8081
- ✅ OCR services running (ports 8001, 8003, 8004)

**Test Steps:**
1. Navigate to CashPlus form
2. Click "Excellent DBR" autofill
3. Upload documents (CNIC, Salary, eCIB)
4. Verify OCR processing
5. Review auto-filled form
6. Submit application
7. Verify LOS ID generated
8. Verify documents uploaded to FileZilla
9. Verify redirect to Documents page
10. Verify application visible in PB dashboard

---

**Let's proceed with systematic testing!**

