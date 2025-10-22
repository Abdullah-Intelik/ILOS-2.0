# 🏦 Credit Card Decision Engine

## 📋 **Overview**
A modular credit card decision engine that evaluates loan applications using weighted scoring across 6 risk assessment modules.

## 🏗️ **Architecture**

### **Module Structure:**
```
DecisinEng/
├── modules/
│   ├── SPU.js              # Special Purpose Unit (Blacklist checks)
│   ├── EAMVU.js            # External Asset Management Unit
│   ├── City.js             # Geographic risk assessment
│   ├── Age.js              # Demographic risk assessment
│   ├── DBR.js              # Debt-to-Income Ratio calculation
│   ├── Income.js           # Financial capacity evaluation
│   ├── DecisionEngine.js   # Main decision orchestrator
│   └── DataService.js      # API and data handling
├── CreditCardDecisionEngine.js  # Main entry point
├── frontend.js             # Frontend JavaScript (UI logic)
├── index.html              # Frontend interface (HTML only)
└── README.md               # This file
```

## 🎯 **Module Weights**
- **DBR (Debt-to-Income Ratio):** 55% - Primary risk indicator
- **SPU (Special Purpose Unit):** 10% - Blacklist/negative checks
- **EAMVU (External Asset Management Unit):** 10% - Asset verification
- **Income:** 15% - Financial capacity assessment
- **City:** 5% - Geographic risk assessment
- **Age:** 5% - Demographic risk factor

## 📊 **Module Details**

### **1. SPU Module (`modules/SPU.js`)**
- **Purpose:** Blacklist and negative list checks
- **Inputs:** `spu_black_list_check`, `spu_credit_card_30k_check`, `spu_negative_list_check`
- **Output:** 0 (any hit) or 100 (no hits)

### **2. EAMVU Module (`modules/EAMVU.js`)**
- **Purpose:** Asset verification status
- **Inputs:** `eavmu_submitted`
- **Output:** 100 (submitted) or 0 (not submitted)

### **3. City Module (`modules/City.js`)**
- **Purpose:** Geographic risk and coverage assessment
- **Inputs:** Address fields, `cluster` (manual)
- **Scoring:**
  - Annexure A areas: -30 points
  - Full Coverage cities: +40/+20/+0 points
  - Cluster scoring: +30 to +5 points

### **4. Age Module (`modules/Age.js`)**
- **Purpose:** Demographic risk based on age and employment
- **Inputs:** `date_of_birth`, `occupation`, `employment_status`
- **Rules:**
  - Self-Employed: 22-65 years
  - Salaried: 21-60 years (20/61 with penalty)

### **5. DBR Module (`modules/DBR.js`)**
- **Purpose:** Debt-to-Income ratio with dynamic thresholds
- **Inputs:** Income, obligations, loan details
- **Dynamic Thresholds:** 30-45% based on income/obligations scoring
- **Scoring:** 100/75/50/25/0 based on DBR percentage

### **6. Income Module (`modules/Income.js`)**
- **Purpose:** Financial capacity and stability
- **Inputs:** Income data, employment type, salary transfer flag
- **Scoring:**
  - Threshold check: 60 points
  - Stability ratio: 25 points
  - Employment tenure: 15 points

## 🔄 **Data Flow**

### **1. Data Service (`modules/DataService.js`)**
- Fetches application data from API
- Retrieves DBR data from data engine
- Normalizes data for processing

### **2. Decision Engine (`modules/DecisionEngine.js`)**
- Orchestrates all modules
- Calculates weighted final score
- Determines pass/fail/conditional decision

### **3. Main Interface (`CreditCardDecisionEngine.js`)**
- Public API for the decision engine
- Handles application processing
- Provides module access

## 🎯 **Decision Logic**

### **Automatic Failures:**
1. Age outside acceptable range
2. DBR exceeds dynamic threshold
3. SPU critical hits
4. City Annexure A areas

### **Score-Based Decisions:**
- **≥90 points:** PASS (Very Low Risk)
- **80-89 points:** PASS (Low Risk)
- **70-79 points:** CONDITIONAL PASS (Medium Risk)
- **60-69 points:** CONDITIONAL PASS (High Risk)
- **<60 points:** FAIL (Very High Risk)

## 🚀 **Usage**

### **Browser:**
```html
<!-- Load all modules in order -->
<script src="modules/SPU.js"></script>
<script src="modules/EAMVU.js"></script>
<script src="modules/City.js"></script>
<script src="modules/Age.js"></script>
<script src="modules/DBR.js"></script>
<script src="modules/Income.js"></script>
<script src="modules/DecisionEngine.js"></script>
<script src="modules/DataService.js"></script>
<script src="CreditCardDecisionEngine.js"></script>
<script src="frontend.js"></script>

<script>
const engine = new CreditCardDecisionEngine();
const result = await engine.processApplication(141);
</script>
```

### **Node.js:**
```javascript
const CreditCardDecisionEngine = require('./CreditCardDecisionEngine');
const engine = new CreditCardDecisionEngine();
const result = await engine.processApplication(141);
```

## 🔧 **Configuration**

### **API Endpoints:**
- Application API: `http://localhost:5000/api/applications/{id}`
- Data Engine: `http://localhost:3002/dbr`

### **Manual Inputs:**
- **Cluster:** FEDERAL, SOUTH, NORTHERN_PUNJAB, NORTH, SOUTHERN_PUNJAB, KP
- **Employment Type:** permanent, contractual, self-employed, business, probation
- **Salary Transfer:** salary_transfer, non_salary_transfer
- **Total Income:** Net income amount (default: 50,000 PKR)

## 📝 **Output Format**

```javascript
{
  applicationId: "141",
  customerName: "John Doe",
  cnic: "12345-1234567-1",
  finalScore: 85,
  decision: "PASS",
  actionRequired: "Basic conditions",
  riskLevel: "LOW",
  dbrPercentage: 25.5,
  moduleScores: {
    dbr: { score: 75, weight: 0.55, weightedScore: 41.25, notes: [...] },
    spu: { score: 100, weight: 0.10, weightedScore: 10.0, notes: [...] },
    // ... other modules
  }
}
```

## ⚠️ **Important Notes**

- **Modular Design:** Each module is independent and can be modified without affecting others
- **Data Integrity:** All modules maintain the same input/output interface
- **Error Handling:** Graceful fallbacks for missing data
- **Extensibility:** Easy to add new modules or modify existing ones
- **Testing:** Each module can be tested independently

## 🔄 **Migration from Monolithic**

The original `Deceng.js` has been split into:
- **6 functional modules** (SPU, EAMVU, City, Age, DBR, Income)
- **1 orchestration module** (DecisionEngine)
- **1 data service module** (DataService)
- **1 main interface** (CreditCardDecisionEngine)

All functionality remains intact while providing better organization and maintainability.
