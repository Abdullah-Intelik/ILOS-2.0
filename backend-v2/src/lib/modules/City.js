/**
 * City Module
 * Handles geographic risk assessment and cluster scoring
 */

class CityModule {
    constructor() {
        // Full Coverage cities (stored in lowercase for case-insensitive matching)
        this.FULL_COVERAGE_CITIES = new Set([
            "karachi", "lahore", "islamabad", "rawalpindi", "peshawar"
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
     * Auto-detect cluster based on city name
     * @param {string} city - City name
     * @returns {string} Cluster name (FEDERAL, SOUTH, NORTH, etc.)
     */
    detectCluster(city) {
        if (!city) return '';
        
        const cityLower = city.toLowerCase().trim();
        
        // Federal Capital
        if (cityLower === 'islamabad' || cityLower === 'rawalpindi') {
            return 'FEDERAL';
        }
        
        // Southern Pakistan (Sindh, Balochistan)
        const southCities = [
            'karachi', 'hyderabad', 'sukkur', 'larkana', 'nawabshah', 'mirpurkhas',
            'jacobabad', 'shikarpur', 'dadu', 'thatta', 'badin',
            'quetta', 'khuzdar', 'turbat', 'gwadar', 'chaman', 'sibi'
        ];
        if (southCities.some(c => cityLower.includes(c))) {
            return 'SOUTH';
        }
        
        // Northern Punjab (Lahore, Gujranwala, Faisalabad, Sialkot, etc.)
        const northernPunjabCities = [
            'lahore', 'gujranwala', 'faisalabad', 'sialkot', 'gujrat', 'sargodha',
            'sheikhupura', 'kasur', 'okara', 'sahiwal', 'jhang', 'chiniot',
            'hafizabad', 'mandi bahauddin', 'narowal', 'pakpattan'
        ];
        if (northernPunjabCities.some(c => cityLower.includes(c))) {
            return 'NORTHERN_PUNJAB';
        }
        
        // Khyber Pakhtunkhwa
        const kpCities = [
            'peshawar', 'mardan', 'abbottabad', 'mansehra', 'kohat', 'dera ismail khan',
            'swat', 'mingora', 'nowshera', 'swabi', 'charsadda', 'haripur',
            'bannu', 'karak', 'lakki marwat'
        ];
        if (kpCities.some(c => cityLower.includes(c))) {
            return 'KP';
        }
        
        // Southern Punjab (Multan, Bahawalpur, etc.)
        const southernPunjabCities = [
            'multan', 'bahawalpur', 'dera ghazi khan', 'rahim yar khan', 'muzaffargarh',
            'vehari', 'lodhran', 'khanewal', 'rajanpur', 'layyah'
        ];
        if (southernPunjabCities.some(c => cityLower.includes(c))) {
            return 'SOUTHERN_PUNJAB';
        }
        
        // Northern Pakistan (Gilgit-Baltistan, AJK)
        const northCities = [
            'gilgit', 'skardu', 'hunza', 'muzaffarabad', 'mirpur', 'kotli',
            'rawalakot', 'bagh', 'bhimber'
        ];
        if (northCities.some(c => cityLower.includes(c))) {
            return 'NORTH';
        }
        
        // Default: Try to guess based on Punjab cities (most common)
        return 'NORTHERN_PUNJAB';
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
        
        // Auto-detect cluster if not provided
        let cluster = this.trim(app.cluster || "");
        if (!cluster) {
            // Try to detect from current city, fallback to office city
            cluster = this.detectCluster(currCity) || this.detectCluster(officeCity);
            if (cluster) {
                notes.push(`✨ Cluster auto-detected: '${cluster}' (from city: '${currCity || officeCity}')`);
            }
        } else {
            notes.push(`Cluster provided: '${cluster}'`);
        }

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

        // 2) Full Coverage (max 40) - Case-insensitive check
        const livingFullCoverage = this.FULL_COVERAGE_CITIES.has(currCity.toLowerCase());
        const workingFullCoverage = this.FULL_COVERAGE_CITIES.has(officeCity.toLowerCase());

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
