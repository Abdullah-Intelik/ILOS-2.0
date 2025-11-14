/**
 * Age Module
 * Handles demographic risk assessment based on age and employment type
 */

class AgeModule {
    constructor() {
        this.NOW = new Date();
    }

    /**
     * Calculate years between two dates
     * @param {Date} d1 - First date
     * @param {Date} d2 - Second date
     * @returns {number|null} Years between dates or null if invalid
     */
    yearsBetween(d1, d2) {
        if (!(d1 instanceof Date) || isNaN(d1) || !(d2 instanceof Date) || isNaN(d2)) return null;
        return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 3600 * 1000));
    }

    /**
     * Calculate age score based on employment type and age
     * @param {Object} app - Application data
     * @returns {Object} Age result with score, notes, and hard stop if applicable
     */
    calculate(app) {
        const occ = String(app.occupation || "").toLowerCase();
        const status = String(app.employment_status || "").toLowerCase();
        const dob = app.date_of_birth ? new Date(app.date_of_birth) : null;
        const age = this.yearsBetween(dob, this.NOW);

        const notes = [];
        const out = { raw: 0, age, band: "Unknown", notes };

        // Guard: DOB must be valid and not future-dated
        if (age == null || age < 0) {
            out.hardStop = "Invalid DOB / future-dated";
            notes.push("DOB missing or invalid.");
            return out;
        }

        // Self-Employed rule
        if (occ.includes("self")) {
            out.band = "Self-Employed 22–65";
            if (age >= 22 && age <= 65) {
                out.raw = 100;
                notes.push(`Age ${age} within 22–65 (Self-Employed).`);
                return out;
            }
            out.hardStop = `Age ${age} outside 22–65 (Self-Employed).`;
            return out;
        }

        // Default to Salaried
        out.band = "Salaried 21–60";
        const retired = status === "retired";

        if (retired) {
            // Penalized but allowed around retirement age
            if (age < 20 || age > 61) {
                out.hardStop = `Age ${age} not acceptable for Salaried (Retired).`;
                return out;
            }
            out.raw = 75;
            if (age < 60) notes.push(`Retired before 60 (Age ${age}) → penalized score.`);
            else notes.push(`Retired at/near 60–61 (Age ${age}) → penalized score.`);
            return out;
        }

        // Salaried (not retired)
        if (age >= 21 && age <= 60) {
            out.raw = 100;
            notes.push(`Age ${age} within 21–60 (Salaried).`);
            return out;
        }

        // Edge tolerance 20 or 61 → lesser score
        if (age === 20 || age === 61) {
            out.raw = 80;
            notes.push(`Edge tolerance (Age ${age}) for Salaried → lesser score.`);
            return out;
        }

        out.hardStop = `Age ${age} outside 20–61 (Salaried).`;
        return out;
    }
}

// Export for use in other modules
module.exports = AgeModule;
