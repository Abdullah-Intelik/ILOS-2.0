/**
 * SPU (Special Purpose Unit) Module
 * Handles blacklist and negative list checks
 */

class SPUModule {
    /**
     * Robust boolean normalizer
     * @param {any} v - Value to normalize
     * @returns {boolean} Normalized boolean value
     */
    asBool(v) {
        if (v === true || v === 1) return true;
        if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            return s === "true" || s === "1" || s === "yes" || s === "y";
        }
        return false;
    }

    /**
     * Calculate SPU score based on blacklist checks
     * @param {Object} app - Application data
     * @returns {Object} SPU result with score, notes, and flags
     * 
     * IMPORTANT: Boolean semantics from SPU dashboard:
     * - TRUE (checked) = CLEARED/VERIFIED/NO HIT FOUND
     * - FALSE (unchecked) = NOT CHECKED YET or HIT FOUND
     * 
     * Therefore, we INVERT the boolean to detect hits:
     * - If check is FALSE/null/undefined → Potential hit (score 0)
     * - If check is TRUE → Cleared (score 100)
     */
    calculate(app) {
        // INVERTED LOGIC: TRUE = cleared, FALSE/null = hit
        // So we check if the value is NOT true (meaning not cleared)
        const blackListHit = !this.asBool(app.spu_black_list_check);
        const cc30kHit = !this.asBool(app.spu_credit_card_30k_check);
        const negativeHit = !this.asBool(app.spu_negative_list_check);

        const anyHit = blackListHit || cc30kHit || negativeHit;

        return {
            raw: anyHit ? 0 : 100,
            notes: anyHit
                ? ["Critical SPU hit (Blacklist / CreditCard30k / NegativeList) → score 0"]
                : ["All SPU checks cleared → score 100"],
            flags: [
                ...(blackListHit ? ["BLACKLIST_NOT_CLEARED"] : []),
                ...(cc30kHit ? ["CREDITCARD_30K_NOT_CLEARED"] : []),
                ...(negativeHit ? ["NEGATIVE_LIST_NOT_CLEARED"] : []),
            ],
        };
    }
}

// Export for use in other modules
export default SPUModule;
