/**
 * Age Module
 * Handles demographic risk assessment based on age and employment type
 */

export default class AgeModule {
    private NOW: Date;

    constructor() {
        this.NOW = new Date();
    }

    /**
     * Calculate years between two dates
     * @param {Date} d1 - First date
     * @param {Date} d2 - Second date
     * @returns {number|null} Years between dates or null if invalid
     */
    yearsBetween(d1: Date, d2: Date): number | null {
        if (!(d1 instanceof Date) || isNaN(d1.getTime()) || !(d2 instanceof Date) || isNaN(d2.getTime())) return null;
        return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 3600 * 1000));
    }

    /**
     * Calculate age score based on employment type and age
     * @param {Object} app - Application data
     * @returns {Object} Age result with score, notes, and hard stop if applicable
     */
    calculate(app: any): {
        raw: number;
        age: number | null;
        band: string;
        notes: string[];
        hardStop?: string;
    } {
        console.log('='.repeat(80));
        console.log('👤 AGE MODULE CALCULATION');
        console.log('='.repeat(80));
        console.log('📥 INPUTS:');
        console.log('  • Occupation:', app.occupation || 'N/A');
        console.log('  • Employment Status:', app.employment_status || 'N/A');
        console.log('  • Date of Birth:', app.date_of_birth || 'N/A');
        console.log('  • Raw Input Data:', JSON.stringify(app, null, 2));

        const occ = String(app.occupation || "").toLowerCase();
        const status = String(app.employment_status || "").toLowerCase();
        const dob = app.date_of_birth ? new Date(app.date_of_birth) : null;
        const age = this.yearsBetween(dob, this.NOW);

        console.log('🔍 PROCESSING:');
        console.log('  • Calculated Age:', age);
        console.log('  • Occupation (processed):', occ);
        console.log('  • Status (processed):', status);

        const notes: string[] = [];
        const out: {
            raw: number;
            age: number | null;
            band: string;
            notes: string[];
            hardStop?: string;
        } = { raw: 0, age, band: "Unknown", notes };

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
}


