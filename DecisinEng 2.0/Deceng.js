
 class CreditCardDecisionEngine {
    constructor() {
        // Updated module weights as per final specification
        this.moduleWeights = {
            dbr: 0.55,              // DBR 55%
            age: 0.05,               // Age 5%
            city: 0.05,              // City 5%
            income: 0.10,            // Income 10%
            spu: 0.05,               // SPU 5%
            eamvu: 0.05,             // EAMVU 5%
            application_score: 0.15, // Application Scorecard 15% (NTB) / 10% (ETB) - excluding age, city, DBR
            behavioral_score: 0.05   // Behavioral Scorecard 5% (ETB only)
        };
        
        // Initialize new modules
        this.ApplicationScoreModule = require('./modules/ApplicationScore');
        this.BehavioralScoreModule = require('./modules/BehavioralScore');
    }

    // User's EXACT spu function - NO CHANGES
    spu(app) {
        console.log('='.repeat(80));
        console.log('🚨 SPU MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • SPU Black List Check:', app.spu_black_list_check, '(type:', typeof app.spu_black_list_check, ')');
        console.log('  • SPU Credit Card 30k Check:', app.spu_credit_card_30k_check, '(type:', typeof app.spu_credit_card_30k_check, ')');
        console.log('  • SPU Negative List Check:', app.spu_negative_list_check, '(type:', typeof app.spu_negative_list_check, ')');

        // robust boolean normalizer
        const asBool = (v) => {
            if (v === true || v === 1) return true;
            if (typeof v === "string") {
                const s = v.trim().toLowerCase();
                return s === "true" || s === "1" || s === "yes" || s === "y";
            }
            return false;
        };

        const blackListHit = asBool(app.spu_black_list_check);
        const cc30kHit     = asBool(app.spu_credit_card_30k_check);
        const negativeHit  = asBool(app.spu_negative_list_check);

        console.log('🔍 PROCESSING:');
        console.log('  • Black List Hit:', blackListHit);
        console.log('  • Credit Card 30k Hit:', cc30kHit);
        console.log('  • Negative List Hit:', negativeHit);

        const anyHit = blackListHit || cc30kHit || negativeHit;

        console.log('📤 OUTPUTS:');
        console.log('  • Any Hit:', anyHit);
        console.log('  • Final Score:', anyHit ? 0 : 100, '/100');
        console.log('  • Flags:', [
            ...(blackListHit ? ["BLACKLIST"] : []),
            ...(cc30kHit ? ["CREDITCARD_30K"] : []),
            ...(negativeHit ? ["NEGATIVE_LIST"] : []),
        ]);
        console.log('='.repeat(80));

        return {
            raw: anyHit ? 0 : 100,
            notes: anyHit
                ? ["Critical SPU hit (Blacklist / CreditCard30k / NegativeList) → score 0"]
                : ["No critical SPU hits → score 100"],
            flags: [
                ...(blackListHit ? ["BLACKLIST"] : []),
                ...(cc30kHit ? ["CREDITCARD_30K"] : []),
                ...(negativeHit ? ["NEGATIVE_LIST"] : []),
            ],
        };
    }

    // User's EXACT eamvu function - NO CHANGES
    eamvu(app) {
        console.log('='.repeat(80));
        console.log('📋 EAMVU MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • EAMVU Submitted:', app.eavmu_submitted, '(type:', typeof app.eavmu_submitted, ')');

        // accept boolean or "true"/"1"
        const submitted =
            app.eavmu_submitted === true ||
            app.eavmu_submitted === "true" ||
            app.eavmu_submitted === 1 ||
            app.eavmu_submitted === "1";

        console.log('🔍 PROCESSING:');
        console.log('  • Submitted (processed):', submitted);

        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', submitted ? 100 : 0, '/100');
        console.log('  • Notes:', [submitted ? "EAMVU approved" : "EAMVU not approved"]);
        console.log('='.repeat(80));

        return {
            raw: submitted ? 100 : 0,
            notes: [submitted ? "EAMVU approved" : "EAMVU not approved"],
        };
    }

    // Updated scoreCity function with Cluster scoring (0–100)
    scoreCity(app) {
        console.log('='.repeat(80));
        console.log('🏙️ CITY MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Current City:', app.curr_city || 'N/A');
        console.log('  • Office City:', app.office_city || 'N/A');
        console.log('  • Cluster:', app.cluster || 'N/A');
        console.log('  • Current Address:', {
            house_apt: app.curr_house_apt,
            street: app.curr_street,
            tehsil_district: app.curr_tehsil_district,
            landmark: app.curr_landmark,
            postal_code: app.curr_postal_code
        });
        console.log('  • Office Address:', {
            address: app.office_address,
            street: app.office_street,
            district: app.office_district,
            landmark: app.office_landmark,
            postal_code: app.office_postal_code
        });

        const trim = (s) => (typeof s === "string" ? s.trim() : "");

        // Config lists
        const FULL_COVERAGE_CITIES = new Set([
            "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"
        ]);

        const ANNEXURE_A_AREAS = [
            "Meekh Pur","Arazi Khudas Yar","Badam","Dhoori","Malata Dandi",
            "Mohallah Sufi Pura","Mohallah Sattar Pura","Mohallah Dadanda Mar",
            "Khaoon","Buchal Kalan","Sarat","Mangwal","Kural Karahi","Janda Chichi",
            "Total Tank","Outskirts of Bannu","North & South Waziristan Agencies",
            "Lakki Marwat","All Trible area Agencies","Hangu","Parachinar","Matta",
            "Gadoon","Qutab Garh","Pirssada","Mukhanpura","Muftpura","Sattokatla",
            "Ghandia Wala Mission Chowk","Tibba Hammad Sahho Mission Chowk",
            "Allah Dad Colony","Massani Bagh","Hajwairy Town","Bolay Di Jughi",
            "Rehmat Abad","Mehmood boti Baghbanpura","Chaprar Mujahid Road",
            "Gulbhar Mujahid Road","Faqir Pura","Mohalla Noor Bawa","Kot Ishaq",
            "Siraj Pura","Abadi Bawa-e-Wali","Mohalla Ghosse Park Wala",
            "Mohalla Aslam Parak Wala","Sabharwal Colony","Guniya Wala","Tariqabad",
            "Baou Mohala","Namy Wali","Islam Pura Joharabad","Mali Colony Bhalwal",
            "Fort Manru","Tribal Area Azmat Road","Shahdra Chowk","Chak 87",
            "Chak Bahader Pur","Landhi","Sultanabad","Lines Area Plaza",
            "Gulshan-e-Hadeed","Lyari","Ziaul-Haq Colony","Latifabad No-12","Phuleli",
        ];

        // Notes & flags
        const notes = [];
        const flags = [];

        // Collect inputs
        const currLines = [
            app.curr_house_apt, app.curr_street, app.curr_tehsil_district,
            app.curr_landmark, app.curr_city, app.curr_postal_code,
        ].map(trim).filter(Boolean);

        const officeLines = [
            app.office_address, app.office_street, app.office_district,
            app.office_landmark, app.office_city, app.office_postal_code,
        ].map(trim).filter(Boolean);

        const currCity = trim(app.curr_city || "");
        const officeCity = trim(app.office_city || "");
        const cluster = trim(app.cluster || ""); // 👈 manual cluster input

        console.log('🔍 PROCESSING:');
        console.log('  • Current Address Lines:', currLines);
        console.log('  • Office Address Lines:', officeLines);
        console.log('  • Current City (processed):', currCity);
        console.log('  • Office City (processed):', officeCity);
        console.log('  • Cluster (processed):', cluster);

        // --- Scoring buckets ---
        let score = 0;

        // 1) Annexure A check (penalty)
        console.log('🔍 ANNEXURE A CHECK:');
        const haystack = (currLines.join(" | ") + " | " + officeLines.join(" | ")).toLowerCase();
        const annexHit = ANNEXURE_A_AREAS.some((kw) => haystack.includes(kw.toLowerCase()));
        console.log('  • Address Haystack:', haystack);
        console.log('  • Annexure A Hit:', annexHit);
        if (annexHit) {
            notes.push("Address matches Annexure A high-risk area → -30 points");
            flags.push("AnnexureA");
            score -= 30;
            console.log('  • Penalty Applied: -30 points');
        } else {
            console.log('  • No Annexure A penalty');
        }

        // 2) Full Coverage (max 40)
        console.log('🔍 FULL COVERAGE CHECK:');
        const livingFullCoverage = FULL_COVERAGE_CITIES.has(currCity);
        const workingFullCoverage = FULL_COVERAGE_CITIES.has(officeCity);
        console.log('  • Living City Full Coverage:', livingFullCoverage);
        console.log('  • Working City Full Coverage:', workingFullCoverage);

        notes.push(`Living city: '${currCity}' → ${livingFullCoverage ? "Full Coverage" : "Not Full Coverage"}`);
        notes.push(`Working city: '${officeCity}' → ${workingFullCoverage ? "Full Coverage" : "Not Full Coverage"}`);

        if (livingFullCoverage && workingFullCoverage) {
            score += 40;
            notes.push("Both cities Full Coverage → +40");
            console.log('  • Both cities Full Coverage: +40 points');
        } else if (livingFullCoverage || workingFullCoverage) {
            score += 20;
            notes.push("One city Full Coverage → +20");
            console.log('  • One city Full Coverage: +20 points');
        } else {
            notes.push("No Full Coverage city → +0");
            console.log('  • No Full Coverage: +0 points');
        }

        // 3) Cluster scoring (max 30)
        console.log('🔍 CLUSTER SCORING:');
        const CLUSTER_SCORES = {
            "FEDERAL": 30,
            "SOUTH": 25,
            "NORTHERN_PUNJAB": 20,
            "NORTH": 15,
            "SOUTHERN_PUNJAB": 10,
            "KP": 5
        };
        const clusterScore = CLUSTER_SCORES[cluster.toUpperCase()] || 0;
        score += clusterScore;
        notes.push(`Cluster '${cluster}' → +${clusterScore}/30`);
        console.log('  • Cluster:', cluster.toUpperCase());
        console.log('  • Cluster Score:', clusterScore, 'points');

        // Final clamp 0–100
        const finalScore = Math.max(0, Math.min(100, score));
        
        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore, '/100');
        console.log('  • Breakdown:');
        console.log('    - Annexure A:', annexHit ? '-30' : '0', 'points');
        console.log('    - Full Coverage:', livingFullCoverage && workingFullCoverage ? '40' : (livingFullCoverage || workingFullCoverage ? '20' : '0'), 'points');
        console.log('    - Cluster:', clusterScore, 'points');
        console.log('  • Notes:', notes);
        console.log('  • Flags:', flags);
        console.log('='.repeat(80));

        return { raw: finalScore, notes, flags };
    }

    // User's EXACT agecalc function - NO CHANGES
    agecalc(app) {
        console.log('='.repeat(80));
        console.log('👤 AGE MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Occupation:', app.occupation || 'N/A');
        console.log('  • Employment Status:', app.employment_status || 'N/A');
        console.log('  • Date of Birth:', app.date_of_birth || 'N/A');

        // Local "today" and tiny helpers kept INSIDE the function (as requested)
        const NOW = new Date();
        const yearsBetween = (d1, d2) => {
            if (!(d1 instanceof Date) || isNaN(d1) || !(d2 instanceof Date) || isNaN(d2)) return null;
            return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 3600 * 1000));
        };

        const occ = String(app.occupation || "").toLowerCase();
        const status = String(app.employment_status || "").toLowerCase();
        const dob = app.date_of_birth ? new Date(app.date_of_birth) : null;
        const age = yearsBetween(dob, NOW);

        console.log('🔍 PROCESSING:');
        console.log('  • Calculated Age:', age);
        console.log('  • Occupation (processed):', occ);
        console.log('  • Status (processed):', status);

        const notes = [];
        const out = { raw: 0, age, band: "Unknown", notes };

        // Guard: DOB must be valid and not future-dated
        if (age == null || age < 0) {
            console.log('❌ VALIDATION FAILED:');
            console.log('  • Reason: Invalid DOB or future-dated');
            console.log('  • Hard Stop: TRUE');
            out.hardStop = "Invalid DOB / future-dated";
            notes.push("DOB missing or invalid.");
            console.log('📤 OUTPUTS:');
            console.log('  • Score: 0/100 (Hard Stop)');
            console.log('  • Hard Stop:', out.hardStop);
            console.log('='.repeat(80));
            return out;
        }

        // Self-Employed rule
        if (occ.includes("self")) {
            console.log('🔍 SELF-EMPLOYED CHECK:');
            console.log('  • Age Range: 22-65');
            console.log('  • Actual Age:', age);
            out.band = "Self-Employed 22–65";
            if (age >= 22 && age <= 65) {
                out.raw = 100;
                notes.push(`Age ${age} within 22–65 (Self-Employed).`);
                console.log('  • Result: PASS');
                console.log('  • Score: 100/100');
                console.log('📤 OUTPUTS:');
                console.log('  • Final Score: 100/100');
                console.log('  • Band:', out.band);
                console.log('  • Notes:', notes);
                console.log('='.repeat(80));
                return out;
            }
            out.hardStop = `Age ${age} outside 22–65 (Self-Employed).`;
            console.log('  • Result: FAIL (Hard Stop)');
            console.log('📤 OUTPUTS:');
            console.log('  • Score: 0/100 (Hard Stop)');
            console.log('  • Hard Stop:', out.hardStop);
            console.log('='.repeat(80));
            return out;
        }

        // Default to Salaried
        console.log('🔍 SALARIED CHECK:');
        out.band = "Salaried 21–60";
        const retired = status === "retired";
        console.log('  • Employment Type: Salaried');
        console.log('  • Retired Status:', retired);
        console.log('  • Age Range: 21-60 (normal), 20-61 (with tolerance)');

        if (retired) {
            console.log('  • Special Case: Retired');
            // Penalized but allowed around retirement age
            if (age < 20 || age > 61) {
                out.hardStop = `Age ${age} not acceptable for Salaried (Retired).`;
                console.log('  • Result: FAIL (Hard Stop)');
                console.log('📤 OUTPUTS:');
                console.log('  • Score: 0/100 (Hard Stop)');
                console.log('  • Hard Stop:', out.hardStop);
                console.log('='.repeat(80));
                return out;
            }
            out.raw = 75;
            if (age < 60) notes.push(`Retired before 60 (Age ${age}) → penalized score.`);
            else notes.push(`Retired at/near 60–61 (Age ${age}) → penalized score.`);
            console.log('  • Result: PASS (Penalized)');
            console.log('  • Score: 75/100');
            console.log('📤 OUTPUTS:');
            console.log('  • Final Score: 75/100');
            console.log('  • Band:', out.band);
            console.log('  • Notes:', notes);
            console.log('='.repeat(80));
            return out;
        }

        // Salaried (not retired)
        if (age >= 21 && age <= 60) {
            out.raw = 100;
            notes.push(`Age ${age} within 21–60 (Salaried).`);
            console.log('  • Result: PASS');
            console.log('  • Score: 100/100');
            console.log('📤 OUTPUTS:');
            console.log('  • Final Score: 100/100');
            console.log('  • Band:', out.band);
            console.log('  • Notes:', notes);
            console.log('='.repeat(80));
            return out;
        }

        // Edge tolerance 20 or 61 → lesser score
        if (age === 20 || age === 61) {
            out.raw = 80;
            notes.push(`Edge tolerance (Age ${age}) for Salaried → lesser score.`);
            console.log('  • Result: PASS (Edge Tolerance)');
            console.log('  • Score: 80/100');
            console.log('📤 OUTPUTS:');
            console.log('  • Final Score: 80/100');
            console.log('  • Band:', out.band);
            console.log('  • Notes:', notes);
            console.log('='.repeat(80));
            return out;
        }

        out.hardStop = `Age ${age} outside 20–61 (Salaried).`;
        console.log('  • Result: FAIL (Hard Stop)');
        console.log('📤 OUTPUTS:');
        console.log('  • Score: 0/100 (Hard Stop)');
        console.log('  • Hard Stop:', out.hardStop);
        console.log('='.repeat(80));
        return out;
    }

    // Helper functions for dynamic threshold calculation
    calculateIncomeScore(netIncome) {
        if (netIncome >= 100000) return 50; // High income
        if (netIncome >= 75000) return 40;  // Good income
        if (netIncome >= 50000) return 30;  // Average income
        if (netIncome >= 25000) return 20;  // Low income
        return 10; // Very low income
    }
    
    calculateObligationsScore(totalObligations) {
        if (totalObligations <= 10000) return 50;  // Very low obligations
        if (totalObligations <= 25000) return 40;  // Low obligations
        if (totalObligations <= 50000) return 30;  // Average obligations
        if (totalObligations <= 100000) return 20; // High obligations
        return 10; // Very high obligations
    }
    
    calculateDynamicThreshold(incomeScore, obligationsScore) {
        const finalScore = (incomeScore + obligationsScore) / 2;
        
        // Higher income + Low obligations = Lower threshold (stricter)
        // Lower income + High obligations = Higher threshold (more lenient)
        if (finalScore >= 40) return 30; // Best case: strict threshold
        if (finalScore >= 30) return 35; // Good case
        if (finalScore >= 20) return 40; // Average case
        return 45; // Worst case: more lenient threshold
    }

        // NEW DBR Function - Using dynamic threshold and scoring from data engine
    async calculateDBR(app, dbrData = null) {
        console.log('='.repeat(80));
        console.log('💳 DBR MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Application Data:', app ? 'Available' : 'Not Available');
        console.log('  • DBR Data:', dbrData ? 'Available' : 'Not Available');
        if (app) {
            console.log('  • Application Data Details:', {
                cnic: app.cnic,
                gross_monthly_income: app.gross_monthly_income,
                total_income: app.total_income,
                net_monthly_income: app.net_monthly_income,
                proposed_loan_amount: app.proposed_loan_amount
            });
        }
        if (dbrData) {
            console.log('  • DBR Data Details:', JSON.stringify(dbrData, null, 2));
        }

        let dbrPercentage = 0;
        let notes = [];
        let netIncome = 0;
        let totalObligations = 0;
        let threshold = 40; // Default threshold
        let isWithinThreshold = false;

        // Check if we have DBR data from the API
        if (dbrData && dbrData.dbr !== undefined && dbrData.dbr !== null) {
            console.log('🔍 PROCESSING DBR DATA:');
            console.log('  • Raw dbrData:', JSON.stringify(dbrData, null, 2));
            console.log('  • dbrData.dbr:', dbrData.dbr);
            console.log('  • dbrData.dbr_details:', dbrData.dbr_details);
            
            dbrPercentage = dbrData.dbr;
            netIncome = dbrData.dbr_details?.net_income || 0;
            totalObligations = dbrData.dbr_details?.total_obligations || 0;
            threshold = dbrData.threshold || 40; // Use dynamic threshold from data engine
            isWithinThreshold = dbrData.status === 'pass'; // Use status from data engine
            
            console.log('  • DBR Percentage:', dbrPercentage + '%');
            console.log('  • Net Income:', netIncome);
            console.log('  • Total Obligations:', totalObligations);
            console.log('  • Threshold:', threshold + '%');
            console.log('  • Status:', dbrData.status);
            console.log('  • Within Threshold:', isWithinThreshold);
            
            notes.push(`DBR from data engine: ${dbrPercentage.toFixed(2)}%`);
            notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
            notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
            notes.push(`DBR Threshold: ${threshold}% (Dynamic)`);
            notes.push(`Status: ${dbrData.status.toUpperCase()}`);
            
            // If status is fail, return 0 score
            if (dbrData.status === 'fail') {
                console.log('❌ DBR STATUS: FAIL');
                console.log('📤 OUTPUTS:');
                console.log('  • Score: 0/100 (DBR Fail)');
                console.log('  • DBR Percentage:', dbrPercentage + '%');
                console.log('  • Threshold:', threshold + '%');
                console.log('  • Notes:', notes);
                console.log('='.repeat(80));
                
                notes.push(`DBR status is FAIL - Score 0`);
                return {
                    raw: 0,
                    dbrPercentage,
                    dbrThreshold: threshold,
                    isWithinThreshold: false,
                    netIncome,
                    totalObligations,
                    notes,
                    flags: ["DBR_FAIL"]
                };
            }
            
            // If status is pass, calculate score based on DBR percentage
            console.log('🔍 DBR SCORING:');
            let dbrScore = 0;
            if (dbrPercentage <= 10) {
                dbrScore = 100;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (1-10%) → Score 100/100`);
                console.log('  • Range: 1-10% (Excellent)');
                console.log('  • Score: 100/100');
            } else if (dbrPercentage <= 20) {
                dbrScore = 75;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (10-20%) → Score 75/100`);
                console.log('  • Range: 10-20% (Good)');
                console.log('  • Score: 75/100');
            } else if (dbrPercentage <= 30) {
                dbrScore = 50;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (20-30%) → Score 50/100`);
                console.log('  • Range: 20-30% (Fair)');
                console.log('  • Score: 50/100');
            } else if (dbrPercentage <= 40) {
                dbrScore = 25;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (30-40%) → Score 25/100`);
                console.log('  • Range: 30-40% (Poor)');
                console.log('  • Score: 25/100');
            } else {
                dbrScore = 0;
                notes.push(`DBR ${dbrPercentage.toFixed(2)}% (>40%) → Score 0/100`);
                console.log('  • Range: >40% (Very Poor)');
                console.log('  • Score: 0/100');
            }
            
            console.log('📤 OUTPUTS:');
            console.log('  • Final Score:', dbrScore + '/100');
            console.log('  • DBR Percentage:', dbrPercentage + '%');
            console.log('  • Threshold:', threshold + '%');
            console.log('  • Within Threshold:', true);
            console.log('  • Notes:', notes);
            console.log('='.repeat(80));
            
            return {
                raw: dbrScore,
                dbrPercentage,
                dbrThreshold: threshold,
                isWithinThreshold: true,
                netIncome,
                totalObligations,
                notes,
                flags: []
            };
        }
        
        // Fallback: Calculate DBR directly from application data
        console.log('⚠️ FALLBACK: No DBR data available, calculating directly from application data...');
        
        if (app) {
            // Extract income data from application - check both field naming conventions
            const grossIncome = parseFloat(app.gross_monthly_income || app.grossMonthlySalary || app.gross_monthly_salary || 0);
            let netIncomeValue = parseFloat(app.total_income || app.net_monthly_income || app.netMonthlyIncome || app.net_monthly_income || 0);
            const loanAmount = parseFloat(app.proposed_loan_amount || app.amount_requested || app.loan_amount || app.amountRequested || 0);
            
            console.log('  • Available fields:', Object.keys(app));
            console.log('  • Gross Income:', grossIncome);
            console.log('  • Net Income:', netIncomeValue);
            console.log('  • Loan Amount:', loanAmount);
            console.log('  • proposed_loan_amount:', app.proposed_loan_amount);
            console.log('  • amount_requested:', app.amount_requested);
            console.log('  • loan_amount:', app.loan_amount);
            
            // FIX: Add 50K fallback if net income is 0 or missing
            if (netIncomeValue <= 0) {
                netIncomeValue = 50000; // 50K PKR fallback
                console.log('  • ⚠️ Net income was 0 or missing - using fallback: PKR 50,000');
            }
            
            // Calculate DBR
            if (netIncomeValue > 0) {
                // If loan amount is 0, use a default amount for DBR calculation
                const effectiveLoanAmount = loanAmount > 0 ? loanAmount : 10000; // Default PKR 10,000
                
                // Simple DBR calculation: (Loan Amount / Net Income) * 100
                dbrPercentage = (effectiveLoanAmount / netIncomeValue) * 100;
                netIncome = netIncomeValue;
                totalObligations = effectiveLoanAmount;
                
                // Calculate dynamic threshold based on income and obligations
                const incomeScore = this.calculateIncomeScore(netIncome);
                const obligationsScore = this.calculateObligationsScore(totalObligations);
                threshold = this.calculateDynamicThreshold(incomeScore, obligationsScore);
                isWithinThreshold = dbrPercentage <= threshold;
                
                if (loanAmount === 0) {
                    notes.push(`No loan amount specified, using default PKR ${effectiveLoanAmount.toLocaleString()} for DBR calculation`);
                }
                
                notes.push(`DBR calculated from application data: ${dbrPercentage.toFixed(2)}%`);
                notes.push(`Net Income: PKR ${netIncome.toLocaleString()}`);
                notes.push(`Total Obligations: PKR ${totalObligations.toLocaleString()}`);
                notes.push(`Income Score: ${incomeScore}/50`);
                notes.push(`Obligations Score: ${obligationsScore}/50`);
                notes.push(`Dynamic Threshold: ${threshold}% (based on income & obligations)`);
                notes.push(`Status: ${isWithinThreshold ? 'PASS' : 'FAIL'}`);
                
                // Calculate score based on DBR percentage
                let dbrScore = 0;
                if (dbrPercentage <= 10) {
                    dbrScore = 100;
                    notes.push(`DBR ${dbrPercentage.toFixed(2)}% (≤10%) → Score 100/100`);
                } else if (dbrPercentage <= 20) {
                    dbrScore = 75;
                    notes.push(`DBR ${dbrPercentage.toFixed(2)}% (10-20%) → Score 75/100`);
                } else if (dbrPercentage <= 30) {
                    dbrScore = 50;
                    notes.push(`DBR ${dbrPercentage.toFixed(2)}% (20-30%) → Score 50/100`);
                } else if (dbrPercentage <= 40) {
                    dbrScore = 25;
                    notes.push(`DBR ${dbrPercentage.toFixed(2)}% (30-40%) → Score 25/100`);
                } else {
                    dbrScore = 0;
                    notes.push(`DBR ${dbrPercentage.toFixed(2)}% (>40%) → Score 0/100`);
                }
                
                console.log('📤 OUTPUTS:');
                console.log('  • Score:', dbrScore + '/100');
                console.log('  • DBR Percentage:', dbrPercentage + '%');
                console.log('  • Threshold:', threshold + '%');
                console.log('  • Within Threshold:', isWithinThreshold);
                console.log('  • Notes:', notes);
                console.log('='.repeat(80));
                
                return {
                    raw: dbrScore,
                    dbrPercentage,
                    dbrThreshold: threshold,
                    isWithinThreshold,
                    netIncome,
                    totalObligations,
                    notes,
                    flags: []
                };
            } else {
                console.log('❌ Cannot calculate DBR: Net income is 0 or missing');
            }
        }
        
        // Final fallback if calculation fails
        console.log('⚠️ FINAL FALLBACK: Using default values');
        notes.push("No DBR data available from data engine or API");
        console.log('📤 OUTPUTS:');
        console.log('  • Score: 0/100 (No Data)');
        console.log('  • DBR Percentage: 0%');
        console.log('  • Threshold:', threshold + '%');
        console.log('  • Within Threshold: false');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));
        
        return {
            raw: 0,
            dbrPercentage: 0,
            dbrThreshold: threshold,
            isWithinThreshold: false,
            netIncome: 0,
            totalObligations: 0,
            notes,
            flags: ["NO_DBR_DATA"]
        };
    }

    // NEW Application Scorecard Function
    calculateApplicationScore(app, cbsData = {}, dbrScore = 0) {
        console.log('='.repeat(80));
        console.log('📊 APPLICATION SCORECARD CALCULATION');
        console.log('='.repeat(80));
        
        const appScoreModule = new this.ApplicationScoreModule();
        const result = appScoreModule.calculate(app, cbsData, dbrScore);
        
        console.log('📤 APPLICATION SCORECARD OUTPUTS:');
        console.log('  • Final Score:', result.raw, '/100');
        console.log('  • Weighted Score:', (result.raw * this.moduleWeights.application_score).toFixed(2));
        console.log('='.repeat(80));
        
        return result;
    }

    // NEW Behavioral Scorecard Function (ETB only)
    calculateBehavioralScore(app, cbsData = {}) {
        console.log('='.repeat(80));
        console.log('📊 BEHAVIORAL SCORECARD CALCULATION');
        console.log('='.repeat(80));
        
        const isETB = app.is_ubl_customer === true || app.is_ubl_customer === 'true';
        const behScoreModule = new this.BehavioralScoreModule();
        const result = behScoreModule.calculate(cbsData, isETB);
        
        console.log('📤 BEHAVIORAL SCORECARD OUTPUTS:');
        console.log('  • Final Score:', result.raw, '/100');
        console.log('  • Weighted Score:', (result.raw * this.moduleWeights.behavioral_score).toFixed(2));
        console.log('  • Is ETB:', isETB);
        console.log('='.repeat(80));
        
        return result;
    }

    // NEW Income Function (to be added)
    calculateIncome(app) {
        console.log('='.repeat(80));
        console.log('💰 INCOME MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Gross Monthly Income:', app.gross_monthly_income, '(type:', typeof app.gross_monthly_income, ')');
        console.log('  • Total Income (Net):', app.total_income, '(type:', typeof app.total_income, ')');
        console.log('  • Length of Employment:', app.length_of_employment, '(type:', typeof app.length_of_employment, ')');
        console.log('  • Existing Customer:', app.is_existing_customer, '(type:', typeof app.is_existing_customer, ')');
        console.log('  • Employment Type:', app.employment_type, '(type:', typeof app.employment_type, ')');
        console.log('  • Salary Transfer Flag:', app.salary_transfer_flag, '(type:', typeof app.salary_transfer_flag, ')');

        const grossIncome = parseFloat(app.gross_monthly_income) || 0;
        const netIncome = parseFloat(app.total_income) || 0;
        const tenure = parseFloat(app.length_of_employment) || 0;
        const isETB = app.is_ubl_customer === true || app.is_ubl_customer === "true";

        // manual inputs
        const employmentType = (app.employment_type || "permanent").toLowerCase();
        const salaryTransferFlag = (app.salary_transfer_flag === true || app.salary_transfer_flag === "true" || app.salary_transfer_flag === 1) ? "salary_transfer" : "non_salary_transfer";
        
        console.log('🔍 PROCESSING:');
        console.log('  • Gross Income (parsed):', grossIncome);
        console.log('  • Net Income (parsed):', netIncome);
        console.log('  • Tenure (parsed):', tenure, 'years');
        console.log('  • Existing Customer (processed):', isETB);
        console.log('  • Employment Type (processed):', employmentType);
        console.log('  • Salary Transfer Flag (processed):', salaryTransferFlag);
        
        let raw = 0;
        const notes = [];

        // --- 1. Income Threshold Check (60 pts) ---
        console.log('🔍 THRESHOLD CHECK:');
        let thresholdMet = false;
        let expectedThreshold = 0;

        if (employmentType === "permanent" || employmentType === "employed") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB) {
                    expectedThreshold = 40000;
                    thresholdMet = netIncome >= 40000;
                } else {
                    expectedThreshold = 45000;
                    thresholdMet = netIncome >= 45000;
                }
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB) {
                    expectedThreshold = 45000;
                    if (netIncome >= 45000) thresholdMet = true;
                } else {
                    expectedThreshold = 50000;
                    if (netIncome >= 50000) thresholdMet = true;
                }
            }
        } else if (employmentType === "contractual") {
            if (salaryTransferFlag === "salary_transfer") {
                if (isETB) {
                    expectedThreshold = 60000;
                    if (netIncome >= 60000) thresholdMet = true;
                } else {
                    expectedThreshold = 65000;
                    if (netIncome >= 65000) thresholdMet = true;
                }
            } else if (salaryTransferFlag === "non_salary_transfer") {
                if (isETB) {
                    expectedThreshold = 65000;
                    if (netIncome >= 65000) thresholdMet = true;
                } else {
                    expectedThreshold = 70000;
                    if (netIncome >= 70000) thresholdMet = true;
                }
            }
        } else if (employmentType === "self-employed" || employmentType === "business") {
            if (isETB) {
                expectedThreshold = 100000;
                if (netIncome >= 100000) thresholdMet = true;
            } else {
                expectedThreshold = 120000;
                if (netIncome >= 120000) thresholdMet = true;
            }
        } else if (employmentType === "probation") {
            notes.push("Probation case → Score based on DBR, no threshold credit");
            console.log('  • Special Case: Probation (no threshold)');
        }

        console.log('  • Expected Threshold:', expectedThreshold);
        console.log('  • Actual Income:', netIncome);
        console.log('  • Threshold Met:', thresholdMet);
        console.log('  • Points Awarded:', thresholdMet ? 60 : 0);

        if (thresholdMet) {
            raw += 60;
            notes.push(`Income threshold met: PKR ${netIncome}`);
        } else {
            if (employmentType !== "probation") {
                notes.push(`Income threshold NOT met: PKR ${netIncome}`);
            }
        }

        // --- 2. Income Stability (25 pts) ---
        console.log('🔍 STABILITY CHECK:');
        if (grossIncome > 0 && netIncome > 0) {
            const stabilityRatio = netIncome / grossIncome;
            console.log('  • Stability Ratio:', (stabilityRatio * 100).toFixed(1) + '%');
            if (stabilityRatio >= 0.8) {
                raw += 25;
                notes.push(`High stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +25`);
                console.log('  • Level: High Stability');
                console.log('  • Points Awarded: 25');
            } else if (stabilityRatio >= 0.6) {
                raw += 20;
                notes.push(`Medium stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +20`);
                console.log('  • Level: Medium Stability');
                console.log('  • Points Awarded: 20');
	} else {
                raw += 10;
                notes.push(`Low stability ratio: ${(stabilityRatio * 100).toFixed(1)}% → +10`);
                console.log('  • Level: Low Stability');
                console.log('  • Points Awarded: 10');
            }
        } else {
            notes.push("Stability not measurable (missing gross/net income)");
            console.log('  • Level: Not Measurable');
            console.log('  • Points Awarded: 0');
        }

        // --- 3. Employment Tenure (15 pts) ---
        console.log('🔍 TENURE CHECK:');
        console.log('  • Years of Experience:', tenure);
        if (tenure >= 5) {
            raw += 15;
            notes.push(`Excellent tenure: ${tenure} years → +15`);
            console.log('  • Level: Excellent');
            console.log('  • Points Awarded: 15');
        } else if (tenure >= 3) {
            raw += 12;
            notes.push(`Good tenure: ${tenure} years → +12`);
            console.log('  • Level: Good');
            console.log('  • Points Awarded: 12');
        } else if (tenure >= 1) {
            raw += 8;
            notes.push(`Acceptable tenure: ${tenure} years → +8`);
            console.log('  • Level: Acceptable');
            console.log('  • Points Awarded: 8');
			} else {
            notes.push(`Low tenure: ${tenure} years → +0`);
            console.log('  • Level: Low');
            console.log('  • Points Awarded: 0');
        }

        const finalScore = Math.min(raw, 100);
        
        console.log('📤 OUTPUTS:');
        console.log('  • Final Score:', finalScore + '/100');
        console.log('  • Breakdown:');
        console.log('    - Threshold:', thresholdMet ? '60' : '0', 'points');
        console.log('    - Stability:', raw - (thresholdMet ? 60 : 0) - (tenure >= 5 ? 15 : tenure >= 3 ? 12 : tenure >= 1 ? 8 : 0), 'points');
        console.log('    - Tenure:', tenure >= 5 ? 15 : tenure >= 3 ? 12 : tenure >= 1 ? 8 : 0, 'points');
        console.log('  • Notes:', notes);
        console.log('='.repeat(80));

        return {
            raw: finalScore,
            notes,
            flags: []
        };
    }

    // Main Decision Engine
    async calculateDecision(applicationData, cbsData = {}) {
        console.log('='.repeat(100));
        console.log('🎯 MAIN DECISION CALCULATION STARTED');
        console.log('='.repeat(100));
        console.log('📥 INPUT APPLICATION DATA:');
        console.log(JSON.stringify(applicationData, null, 2));
        console.log('📥 INPUT CBS DATA:');
        console.log(JSON.stringify(cbsData, null, 2));
        console.log('='.repeat(100));

        // Calculate all module scores using user's exact functions
        console.log('🔄 CALCULATING MODULE SCORES...');
        const dbrResult = await this.calculateDBR(applicationData, applicationData);
        const spuResult = this.spu(applicationData);
        const eamvuResult = this.eamvu(applicationData);
        const incomeResult = this.calculateIncome(applicationData);
        
        // Calculate Age and City scores separately
        const ageResult = this.agecalc(applicationData);
        const cityResult = this.scoreCity(applicationData);
        
        // Determine if customer is ETB or NTB
        const isETB = applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === "true";
        console.log('🔍 CUSTOMER TYPE:', isETB ? 'ETB (Existing-to-Bank)' : 'NTB (New-to-Bank)');
        
        // Adjust weights based on customer type
        const adjustedWeights = { ...this.moduleWeights };
        if (isETB) {
            adjustedWeights.application_score = 0.10; // 10% for ETB
            adjustedWeights.behavioral_score = 0.05;  // 5% for ETB
        } else {
            adjustedWeights.application_score = 0.15; // 15% for NTB
            adjustedWeights.behavioral_score = 0.00;  // 0% for NTB
        }
        
        // NEW: Calculate Application and Behavioral Scorecards
        // Ensure cluster field is available for city calculation
        if (!applicationData.cluster && cbsData.cluster) {
            applicationData.cluster = cbsData.cluster;
        }
        const applicationScoreResult = this.calculateApplicationScore(applicationData, cbsData, dbrResult.raw);
        const behavioralScoreResult = isETB ? this.calculateBehavioralScore(applicationData, cbsData) : { raw: 0, notes: ['Not calculated for NTB customers'], scores: {} };

        console.log('📊 MODULE SCORES SUMMARY:');
        console.log('  • DBR Score:', dbrResult.raw, '/100 (55%)');
        console.log('  • Age Score:', ageResult.raw, '/100 (5%)');
        console.log('  • City Score:', cityResult.raw, '/100 (5%)');
        console.log('  • Income Score:', incomeResult.raw, '/100 (10%)');
        console.log('  • SPU Score:', spuResult.raw, '/100 (5%)');
        console.log('  • EAMVU Score:', eamvuResult.raw, '/100 (5%)');
        console.log('  • Application Score:', applicationScoreResult.raw, '/100 (' + (isETB ? '10%' : '15%') + ' - excluding Age, City, DBR)');
        console.log('  • Behavioral Score:', behavioralScoreResult.raw, '/100 (' + (isETB ? '5%' : '0%') + ' - ' + (isETB ? 'ETB only' : 'NTB not calculated') + ')');

        // ⚠️ CHECK 3 CRITICAL CONDITIONS FIRST - AUTOMATIC FAIL ⚠️
        console.log('🔍 CRITICAL CONDITIONS CHECK:');
        let decision, actionRequired, riskLevel;

        // 1. DBR exceeds threshold = FAIL
        if (!dbrResult.isWithinThreshold) {
            console.log('❌ CRITICAL FAIL: DBR Exceeds Threshold');
            console.log('  • DBR:', dbrResult.dbrPercentage.toFixed(2) + '%');
            console.log('  • Threshold:', dbrResult.dbrThreshold + '%');
            decision = 'FAIL';
            actionRequired = `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}% - AUTOMATIC FAIL`;
            riskLevel = 'VERY_HIGH';
        }
        // 2. SPU Critical Hit = FAIL
        else if (spuResult.raw === 0) {
            console.log('❌ CRITICAL FAIL: SPU Critical Hit');
            console.log('  • SPU Score:', spuResult.raw);
            decision = 'FAIL';
            actionRequired = 'SPU critical hit detected - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // 3. Age/City hard stops are now handled within Application Scorecard
        else if (applicationScoreResult.scores && (applicationScoreResult.scores.age === 0 || applicationScoreResult.scores.city === 0)) {
            console.log('❌ CRITICAL FAIL: Age/City Hard Stop in Application Scorecard');
            console.log('  • Age Score:', applicationScoreResult.scores.age);
            console.log('  • City Score:', applicationScoreResult.scores.city);
            decision = 'FAIL';
            actionRequired = 'Age or City hard stop detected in Application Scorecard - AUTOMATIC FAIL';
            riskLevel = 'VERY_HIGH';
        }
        // If no critical failures, calculate weighted score
        else {
            console.log('✅ NO CRITICAL FAILURES - CALCULATING WEIGHTED SCORE');
            console.log('🔍 WEIGHTED CALCULATION:');
            console.log('  • DBR Score:', dbrResult.raw, '×', adjustedWeights.dbr, '=', (dbrResult.raw * adjustedWeights.dbr).toFixed(2));
            console.log('  • Age Score:', ageResult.raw, '×', adjustedWeights.age, '=', (ageResult.raw * adjustedWeights.age).toFixed(2));
            console.log('  • City Score:', cityResult.raw, '×', adjustedWeights.city, '=', (cityResult.raw * adjustedWeights.city).toFixed(2));
            console.log('  • Income Score:', incomeResult.raw, '×', adjustedWeights.income, '=', (incomeResult.raw * adjustedWeights.income).toFixed(2));
            console.log('  • SPU Score:', spuResult.raw, '×', adjustedWeights.spu, '=', (spuResult.raw * adjustedWeights.spu).toFixed(2));
            console.log('  • EAMVU Score:', eamvuResult.raw, '×', adjustedWeights.eamvu, '=', (eamvuResult.raw * adjustedWeights.eamvu).toFixed(2));
            console.log('  • Application Score:', applicationScoreResult.raw, '×', adjustedWeights.application_score, '=', (applicationScoreResult.raw * adjustedWeights.application_score).toFixed(2));
            console.log('  • Behavioral Score:', behavioralScoreResult.raw, '×', adjustedWeights.behavioral_score, '=', (behavioralScoreResult.raw * adjustedWeights.behavioral_score).toFixed(2));
            
            const finalScore = Math.round(
                (dbrResult.raw * adjustedWeights.dbr) +
                (ageResult.raw * adjustedWeights.age) +
                (cityResult.raw * adjustedWeights.city) +
                (incomeResult.raw * adjustedWeights.income) +
                (spuResult.raw * adjustedWeights.spu) +
                (eamvuResult.raw * adjustedWeights.eamvu) +
                (applicationScoreResult.raw * adjustedWeights.application_score) +
                (behavioralScoreResult.raw * adjustedWeights.behavioral_score)
            );

            console.log('📊 FINAL SCORE CALCULATION:');
            console.log('  • Raw Calculation:', 
                (dbrResult.raw * adjustedWeights.dbr) + ' + ' +
                (ageResult.raw * adjustedWeights.age) + ' + ' +
                (cityResult.raw * adjustedWeights.city) + ' + ' +
                (incomeResult.raw * adjustedWeights.income) + ' + ' +
                (spuResult.raw * adjustedWeights.spu) + ' + ' +
                (eamvuResult.raw * adjustedWeights.eamvu) + ' + ' +
                (applicationScoreResult.raw * adjustedWeights.application_score) + ' + ' +
                (behavioralScoreResult.raw * adjustedWeights.behavioral_score) + ' = ' +
                finalScore
            );
            console.log('  • Final Score:', finalScore, '/100');

            if (finalScore >= 90) {
                decision = 'PASS';
                actionRequired = 'None';
                riskLevel = 'VERY_LOW';
                console.log('  • Decision: PASS (Very Low Risk)');
            } else if (finalScore >= 80) {
                decision = 'PASS';
                actionRequired = 'Basic conditions';
                riskLevel = 'LOW';
                console.log('  • Decision: PASS (Low Risk)');
            } else if (finalScore >= 70) {
                decision = 'CONDITIONAL PASS';
                actionRequired = 'Additional conditions';
                riskLevel = 'MEDIUM';
                console.log('  • Decision: CONDITIONAL PASS (Medium Risk)');
            } else if (finalScore >= 60) {
                decision = 'CONDITIONAL PASS';
                actionRequired = 'Manual review';
                riskLevel = 'HIGH';
                console.log('  • Decision: CONDITIONAL PASS (High Risk)');
	} else {
                decision = 'FAIL';
                actionRequired = 'Low score - Decline application';
                riskLevel = 'VERY_HIGH';
                console.log('  • Decision: FAIL (Very High Risk)');
            }
        }

        // Calculate final score (even for failed cases, for reporting)
        const finalScore = Math.round(
            (dbrResult.raw * adjustedWeights.dbr) +
            (ageResult.raw * adjustedWeights.age) +
            (cityResult.raw * adjustedWeights.city) +
            (incomeResult.raw * adjustedWeights.income) +
            (spuResult.raw * adjustedWeights.spu) +
            (eamvuResult.raw * adjustedWeights.eamvu) +
            (applicationScoreResult.raw * adjustedWeights.application_score) +
            (behavioralScoreResult.raw * adjustedWeights.behavioral_score)
        );

        console.log('🎯 FINAL DECISION SUMMARY:');
        console.log('  • Application ID:', applicationData.los_id || applicationData.id);
        console.log('  • Customer Name:', applicationData.full_name || `${applicationData.first_name} ${applicationData.last_name}`);
        console.log('  • CNIC:', applicationData.cnic);
        console.log('  • Final Score:', finalScore, '/100');
        console.log('  • Decision:', decision);
        console.log('  • Action Required:', actionRequired);
        console.log('  • Risk Level:', riskLevel);
        console.log('  • DBR Percentage:', dbrResult.dbrPercentage + '%');
        console.log('='.repeat(100));

        return {
            applicationId: applicationData.los_id || applicationData.id,
            customerName: applicationData.full_name || `${applicationData.first_name} ${applicationData.last_name}`,
            cnic: applicationData.cnic,
            finalScore,
            decision,
            actionRequired,
            riskLevel,
            dbrPercentage: dbrResult.dbrPercentage,
            applicationData: applicationData, // Include the full application data
            
            // Enhanced DBR Details
            dbrDetails: {
                percentage: dbrResult.dbrPercentage,
                threshold: dbrResult.dbrThreshold,
                netIncome: dbrResult.netIncome,
                totalObligations: dbrResult.totalObligations,
                isWithinThreshold: dbrResult.isWithinThreshold,
                status: dbrResult.isWithinThreshold ? 'PASS' : 'FAIL',
                reason: dbrResult.isWithinThreshold ? 
                    `DBR ${dbrResult.dbrPercentage.toFixed(2)}% is within threshold ${dbrResult.dbrThreshold}%` :
                    `DBR ${dbrResult.dbrPercentage.toFixed(2)}% exceeds threshold ${dbrResult.dbrThreshold}%`,
                calculation: `DBR = (Total Obligations / Net Income) × 100 = (${dbrResult.totalObligations.toLocaleString()} / ${dbrResult.netIncome.toLocaleString()}) × 100 = ${dbrResult.dbrPercentage.toFixed(2)}%`
            },
            
            // Enhanced SPU Details
            spuDetails: {
                blackListHit: spuResult.flags.includes('BLACKLIST'),
                creditCard30kHit: spuResult.flags.includes('CREDITCARD_30K'),
                negativeListHit: spuResult.flags.includes('NEGATIVE_LIST'),
                anyHit: spuResult.raw === 0,
                reason: spuResult.raw === 0 ? 'Critical SPU hit detected' : 'No critical SPU hits',
                flags: spuResult.flags
            },
            
            // Enhanced EAMVU Details
            eamvuDetails: {
                submitted: eamvuResult.raw === 100,
                reason: eamvuResult.raw === 100 ? 'EAMVU approved' : 'EAMVU not approved'
            },
            
            // Enhanced Income Details
            incomeDetails: {
                grossIncome: parseFloat(applicationData.gross_monthly_income) || 0,
                netIncome: parseFloat(applicationData.total_income) || 0,
                employmentType: applicationData.employment_type || 'permanent',
                salaryTransferFlag: applicationData.salary_transfer_flag,
                tenure: parseFloat(applicationData.length_of_employment) || 0,
                isETB: applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === 'true',
                stabilityRatio: (parseFloat(applicationData.total_income) || 0) / (parseFloat(applicationData.gross_monthly_income) || 1),
                thresholdMet: incomeResult.notes.some(note => note.includes('threshold met')),
                breakdown: {
                    threshold: incomeResult.notes.find(note => note.includes('threshold')) || 'Not calculated',
                    stability: incomeResult.notes.find(note => note.includes('stability')) || 'Not calculated',
                    tenure: incomeResult.notes.find(note => note.includes('tenure')) || 'Not calculated'
                }
            },
            
            moduleScores: {
                dbr: { 
                    score: dbrResult.raw, 
                    weight: adjustedWeights.dbr, 
                    weightedScore: dbrResult.raw * adjustedWeights.dbr, 
                    notes: dbrResult.notes,
                    details: {
                        percentage: dbrResult.dbrPercentage,
                        threshold: dbrResult.dbrThreshold,
                        netIncome: dbrResult.netIncome,
                        totalObligations: dbrResult.totalObligations,
                        isWithinThreshold: dbrResult.isWithinThreshold
                    }
                },
                age: { 
                    score: ageResult.raw, 
                    weight: adjustedWeights.age, 
                    weightedScore: ageResult.raw * adjustedWeights.age, 
                    notes: ageResult.notes,
                    details: {
                        age: ageResult.age,
                        band: ageResult.band,
                        withinRange: ageResult.raw > 0
                    }
                },
                city: { 
                    score: cityResult.raw, 
                    weight: adjustedWeights.city, 
                    weightedScore: cityResult.raw * adjustedWeights.city, 
                    notes: cityResult.notes,
                    details: {
                        currentCity: applicationData.curr_city,
                        officeCity: applicationData.office_city,
                        cluster: applicationData.cluster,
                        fullCoverage: cityResult.raw >= 40
                    }
                },
                income: { 
                    score: incomeResult.raw, 
                    weight: adjustedWeights.income, 
                    weightedScore: incomeResult.raw * adjustedWeights.income, 
                    notes: incomeResult.notes,
                    details: {
                        grossIncome: parseFloat(applicationData.gross_monthly_income) || 0,
                        netIncome: parseFloat(applicationData.total_income) || 0,
                        employmentType: applicationData.employment_type || 'permanent',
                        salaryTransferFlag: applicationData.salary_transfer_flag,
                        tenure: parseFloat(applicationData.length_of_employment) || 0,
                        isETB: applicationData.is_ubl_customer === true || applicationData.is_ubl_customer === 'true'
                    }
                },
                spu: { 
                    score: spuResult.raw, 
                    weight: adjustedWeights.spu, 
                    weightedScore: spuResult.raw * adjustedWeights.spu, 
                    notes: spuResult.notes,
                    details: {
                        blackListHit: spuResult.flags.includes('BLACKLIST'),
                        creditCard30kHit: spuResult.flags.includes('CREDITCARD_30K'),
                        negativeListHit: spuResult.flags.includes('NEGATIVE_LIST'),
                        anyHit: spuResult.raw === 0
                    }
                },
                eamvu: { 
                    score: eamvuResult.raw, 
                    weight: adjustedWeights.eamvu, 
                    weightedScore: eamvuResult.raw * adjustedWeights.eamvu, 
                    notes: eamvuResult.notes,
                    details: {
                        submitted: eamvuResult.raw === 100
                    }
                },
                application_score: { 
                    score: applicationScoreResult.raw, 
                    weight: adjustedWeights.application_score, 
                    weightedScore: applicationScoreResult.raw * adjustedWeights.application_score, 
                    notes: applicationScoreResult.notes,
                    breakdown: applicationScoreResult.scores, // Excludes Age, City, DBR
                    customerType: isETB ? 'ETB' : 'NTB'
                },
                behavioral_score: { 
                    score: behavioralScoreResult.raw, 
                    weight: adjustedWeights.behavioral_score, 
                    weightedScore: behavioralScoreResult.raw * adjustedWeights.behavioral_score, 
                    notes: behavioralScoreResult.notes,
                    details: {
                        isETB: isETB,
                        calculated: isETB,
                        breakdown: behavioralScoreResult.scores || {}
                    }
                }
            }
        };
    }

    // Fetch DBR from local API (port 5000)
    async fetchDBRFromDataEngine(losId, loanType) {
        try {
            const response = await fetch('http://localhost:5000/api/dbr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    losId: losId,
                    loan_type: loanType
                })
            });
            
            if (response.ok) {
                const dbrData = await response.json();
                return dbrData;
	} else {
                console.warn('Failed to fetch DBR from local API, using fallback calculation');
                return null;
            }
        } catch (error) {
            console.warn('Error fetching DBR from local API:', error);
            return null;
        }
    }

    // Helper function to normalize null values to false
    normalizeApiData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        const normalized = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null) {
                normalized[key] = false;
            } else if (typeof value === 'object' && value !== null) {
                normalized[key] = this.normalizeApiData(value);
            } else {
                normalized[key] = value;
            }
        }
        return normalized;
    }

    // Process application with API data
    async processApplication(applicationId) {
        try {
            // Use local API at port 5000
            const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let applicationData = await response.json();
            
            // Normalize null values to false
            applicationData = this.normalizeApiData(applicationData);
            
            // Fetch DBR from data engine
            const dbrData = await this.fetchDBRFromDataEngine(applicationId, applicationData.loan_type);
            
            // Add DBR data to application data
            if (dbrData) {
                applicationData.dbrData = dbrData;
            }
            
            // Fetch CBS data
            let cbsData = {};
            try {
                const cbsResponse = await fetch('http://localhost:5000/api/cbs-data/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cnic: applicationData.cnic
                    })
                });
                
                if (cbsResponse.ok) {
                    const cbsResult = await cbsResponse.json();
                    cbsData = cbsResult.data || {};
                }
            } catch (cbsError) {
                console.warn('Failed to fetch CBS data:', cbsError.message);
            }
            
            // Calculate decision with CBS data
            const decision = this.calculateDecision(applicationData, cbsData);
            
            return decision;
            
        } catch (error) {
            console.error('Error processing application:', error);
            throw error;
        }
    }
}

// Make class globally available for browser
if (typeof window !== "undefined") {
    window.CreditCardDecisionEngine = CreditCardDecisionEngine;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreditCardDecisionEngine;
}
