# Enhanced Module Display for Mobile App

## Current Issue
The decision engine modules show only:
- Module name  
- Score (e.g., 0/100)
- Progress bar

## What's Missing
- **Actual user values** (Age: 35 years, City: Karachi, Income: PKR 120,000)
- **Thresholds/Criteria** (Acceptable DBR: ≤40%, Age: 21-60 years)
- **Why Pass/Fail** (DBR 416.67% > 40% → FAIL)

## Behavioral Scorecard - Why 0?
✅ **This is CORRECT**
- Score: 0/100
- Reason: "Behavioral scoring only applies to ETB (Existing To Bank) customers"
- This customer is NTB (New To Bank)
- Module weight automatically adjusts: ETB=5%, NTB=0%

## Proposed Enhancement

### DBR Module
```
🔴 Debt Burden Ratio (DBR)      0/100
Weight: 55%

📊 Calculation:
• Net Income: PKR 120,000
• Total Obligations: PKR 500,000
• DBR: 416.67%

📏 Thresholds:
• Pass: ≤ 35%
• Conditional: 35-40%
• Fail: > 40%

❌ Status: FAIL
DBR 416.67% exceeds maximum threshold of 40%
Income Score: 50/50, Obligations Score: 10/50
Dynamic Threshold: 35% (based on income & obligations)
```

### Age Module
```
🟢 Age                           100/100
Weight: 5%

📊 Details:
• Applicant Age: 35 years
• Acceptable Range: 21-60 years

✅ Status: PASS  
Age is within acceptable range
```

### City Module
```
🟢 City                          100/100
Weight: 5%

📊 Details:
• City: Karachi
• Tier: Tier-1 City

✅ Status: PASS
Major urban center - Low risk
```

### Income Module
```
🟢 Income                        100/100
Weight: 10%

📊 Details:
• Monthly Income: PKR 120,000
• Minimum Required: PKR 40,000

✅ Status: PASS
Income exceeds minimum threshold
```

### SPU Checks
```
🔴 SPU Checks                    0/100
Weight: 5%

📊 Checks Failed:
❌ BLACKLIST - Customer on blacklist
❌ CREDITCARD_30K - Credit card limit exceeded
❌ NEGATIVE_LIST - On negative watch list

❌ Status: FAIL
Multiple critical checks failed
```

### EAMVU Verification
```
🟢 EAMVU Verification           100/100
Weight: 5%

📊 Field Verification:
✅ Address Verified
✅ Employment Confirmed
✅ References Contacted

✅ Status: PASS
All verifications completed successfully
```

### Behavioral Scorecard
```
⚪ Behavioral Scorecard          0/100
Weight: 0% (NTB Customer)

📊 Customer Type:
• Status: NTB (New To Bank)
• Existing Customer: No

ℹ️  Note: N/A for NTB Customers
Behavioral scoring only applies to existing customers (ETB) 
with banking history. This customer has no prior banking relationship.

For ETB customers, this module evaluates:
• Bad counts (Industry & Banking)
• Days Past Due (30+, 60+)
• Defaults in last 12 months
• Late payment history
• Average deposit balance
• Partial payment patterns
```

## Implementation Notes

1. **Data Source**: Backend already sends detailed module information in decision engine response
2. **Parse Notes**: Extract details from `modules.{module_name}.notes` array
3. **Color Coding**:
   - 🟢 Green: 80-100 (Pass)
   - 🟡 Yellow: 60-79 (Conditional)
   - 🔴 Red: 0-59 (Fail)
   - ⚪ Gray: Not Applicable

4. **Expandable Cards**: Each module should be tappable to show/hide details
5. **Icons**: Use appropriate icons for each status

