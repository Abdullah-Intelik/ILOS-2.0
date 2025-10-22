# Why is Behavioral Scorecard 0/100?

## ✅ **This is CORRECT and By Design**

The Behavioral Scorecard showing **0/100** is intentional and correct for this application.

---

## 📊 **Understanding Behavioral Scoring**

### What is the Behavioral Scorecard?
The Behavioral Scorecard (5% weight) evaluates a customer's **banking history and payment behavior** with UBL. It analyzes:

1. **Bad Counts** - Previous defaults or delinquencies (Industry & UBL)
2. **Days Past Due** - Late payments (30+, 60+, 90+ days)  
3. **Defaults** - Number of defaults in last 12 months
4. **Late Payment History** - Frequency of late payments
5. **Average Deposit Balance** - Banking relationship strength
6. **Partial Payments** - Payment completion patterns

### Who Gets Scored?
- **ETB (Existing To Bank)** - YES ✅  
  Customers with existing UBL accounts/history
  
- **NTB (New To Bank)** - NO ❌  
  New customers with no UBL relationship

---

## 🔍 **This Application**

Looking at your screenshots:

### Customer Status
- **Type**: NTB (New To Bank)
- **UBL Customer**: No
- **Banking History**: None

### Result
```
Behavioral Scorecard:  0/100
Module Weight:         0% (Not Applicable)
Reason:               "Behavioral scoring only for ETB customers"
```

---

## 📈 **Module Weight Adjustment**

The decision engine **automatically adjusts weights** based on customer type:

### For ETB Customers (Has UBL Account):
```
DBR:               55%
Age:                5%
City:               5%
Income:            10%
SPU Checks:         5%
EAMVU:              5%
Application Score: 10%
Behavioral Score:   5%  ← Active for ETB
─────────────────────
TOTAL:            100%
```

### For NTB Customers (No UBL Account):
```
DBR:               55%
Age:                5%
City:               5%
Income:            10%
SPU Checks:         5%
EAMVU:              5%
Application Score: 15%  ← Increased weight
Behavioral Score:   0%  ← N/A for NTB
─────────────────────
TOTAL:            100%
```

**The Application Score weight increases from 10% to 15% to compensate for the missing Behavioral Score.**

---

## 🎯 **Why This Makes Sense**

### Business Logic
1. **You can't score what doesn't exist**  
   New customers have no banking history to evaluate

2. **Fair assessment**  
   Penalizing NTB customers for lack of history would be discriminatory

3. **Weight redistribution**  
   The system compensates by giving more weight to Application Score

4. **Risk management**  
   Other modules (SPU Checks, EAMVU, DBR) handle risk assessment for NTB

---

## 🚫 **What Caused This Application to Fail?**

Looking at the scores in your screenshots:

### ❌ **Primary Failure Reason: DBR Module**
```
DBR Score:              0/100
Weight:                 55%
Weighted Contribution:  0 points

Details:
• Net Income:        PKR 120,000
• Total Obligations: PKR 500,000
• DBR Ratio:         416.67%
• Threshold:         ≤40%
• Status:            FAIL (416.67% > 40%)
```

**The customer's obligations are 416% of their income!**  
This is a critical failure that alone causes rejection.

### ❌ **Secondary Failure: SPU Checks**
```
SPU Checks Score:       0/100
Weight:                 5%

Failed Checks:
❌ BLACKLIST - Customer on blacklist
❌ CREDITCARD_30K - Credit card issues
❌ NEGATIVE_LIST - On negative watch list
```

Multiple critical checks failed.

### ✅ **Modules That Passed:**
- Age: 100/100 (35 years - acceptable range)
- City: 100/100 (Tier-1 city)
- Income: 100/100 (PKR 120,000 > minimum)
- EAMVU: 100/100 (Field verification passed)
- Application Score: 77.8/100 (Good documentation)

---

## 📱 **For Mobile App Display**

The Behavioral Scorecard should show:

```
⚪ Behavioral Scorecard          0/100
Weight: 0% (NTB Customer)

ℹ️ Not Applicable - NTB Customer
This module only evaluates customers with existing 
UBL banking history (ETB). This is a new customer 
with no prior UBL relationship.
```

---

## ✅ **Conclusion**

**The Behavioral Score of 0/100 is correct and expected.**

The application failed due to:
1. **Critical DBR failure** (416.67% >> 40% threshold)
2. **SPU blacklist hits** (multiple critical flags)

The Behavioral Score had no impact on this decision - it would have been 0 regardless of customer type due to the DBR and SPU failures.

---

**Need More Details?**  
See `MODULE_DISPLAY_ENHANCEMENT.md` for the proposed detailed module breakdown in the mobile app.

