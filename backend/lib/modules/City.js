/**
 * City Module
 * Handles geographic risk assessment and cluster scoring
 */

class CityModule {
    constructor() {
        // Full Coverage cities
        this.FULL_COVERAGE_CITIES = new Set([
            "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"
        ]);

        // Annexure A high-risk areas
        this.ANNEXURE_A_AREAS = [
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

        // Cluster scoring configuration
        this.CLUSTER_SCORES = {
            "FEDERAL": 30,
            "SOUTH": 25,
            "NORTHERN_PUNJAB": 20,
            "NORTH": 15,
            "SOUTHERN_PUNJAB": 10,
            "KP": 5
        };
    }

    /**
     * Trim string helper
     * @param {string} s - String to trim
     * @returns {string} Trimmed string
     */
    trim(s) {
        return (typeof s === "string" ? s.trim() : "");
    }

    /**
     * Calculate city score based on coverage, cluster, and risk areas
     * @param {Object} app - Application data
     * @returns {Object} City result with score, notes, and flags
     */
    calculate(app) {
        const notes = [];
        const flags = [];

        // Collect address inputs
        const currLines = [
            app.curr_house_apt, app.curr_street, app.curr_tehsil_district,
            app.curr_landmark, app.curr_city, app.curr_postal_code,
        ].map(this.trim).filter(Boolean);

        const officeLines = [
            app.office_address, app.office_street, app.office_district,
            app.office_landmark, app.office_city, app.office_postal_code,
        ].map(this.trim).filter(Boolean);

        const currCity = this.trim(app.curr_city || "");
        const officeCity = this.trim(app.office_city || "");
        const cluster = this.trim(app.cluster || ""); // Manual cluster input

        // Scoring buckets
        let score = 0;

        // 1) Annexure A check (penalty)
        const haystack = (currLines.join(" | ") + " | " + officeLines.join(" | ")).toLowerCase();
        const annexHit = this.ANNEXURE_A_AREAS.some((kw) => haystack.includes(kw.toLowerCase()));
        if (annexHit) {
            notes.push("Address matches Annexure A high-risk area → -30 points");
            flags.push("AnnexureA");
            score -= 30;
        }

        // 2) Full Coverage (max 40)
        const livingFullCoverage = this.FULL_COVERAGE_CITIES.has(currCity);
        const workingFullCoverage = this.FULL_COVERAGE_CITIES.has(officeCity);

        notes.push(`Living city: '${currCity}' → ${livingFullCoverage ? "Full Coverage" : "Not Full Coverage"}`);
        notes.push(`Working city: '${officeCity}' → ${workingFullCoverage ? "Full Coverage" : "Not Full Coverage"}`);

        if (livingFullCoverage && workingFullCoverage) {
            score += 40;
            notes.push("Both cities Full Coverage → +40");
        } else if (livingFullCoverage || workingFullCoverage) {
            score += 20;
            notes.push("One city Full Coverage → +20");
        } else {
            notes.push("No Full Coverage city → +0");
        }

        // 3) Cluster scoring (max 30)
        const clusterScore = this.CLUSTER_SCORES[cluster.toUpperCase()] || 0;
        score += clusterScore;
        notes.push(`Cluster '${cluster}' → +${clusterScore}/30`);

        // Final clamp 0–100
        score = Math.max(0, Math.min(100, score));

        return { raw: score, notes, flags };
    }
}

// Export for use in other modules
module.exports = CityModule;
