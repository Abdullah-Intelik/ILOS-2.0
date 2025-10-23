/**
 * UNIVERSAL DOCUMENT FOLDER MAPPING
 * 
 * This module provides a single source of truth for mapping application types
 * to their corresponding document storage folders.
 * 
 * Used by:
 * - Web Frontend (Next.js)
 * - Mobile App (React Native)
 * - Backend API (Express)
 * - Document Server (Port 8081)
 * 
 * @author ILOS System
 * @version 2.0
 */

/**
 * Map any application type variation to its standard folder name
 * 
 * @param {string} applicationType - The application type (any format/case)
 * @returns {string} - The standardized folder name
 * 
 * @example
 * mapApplicationTypeToFolder('PlatinumCreditCard') // => 'creditcard'
 * mapApplicationTypeToFolder('CashPlus') // => 'cashplus'
 * mapApplicationTypeToFolder('autoloan') // => 'autoloan'
 */
function mapApplicationTypeToFolder(applicationType) {
    if (!applicationType) return 'temp';
    
    // Normalize: lowercase, remove spaces, dashes, underscores
    const normalized = applicationType.toLowerCase().replace(/[-_\s]/g, '');
    
    // Map to standard folder names
    if (normalized === 'cashplus') {
        return 'cashplus';
    } else if (normalized === 'autoloan') {
        return 'autoloan';
    } else if (normalized === 'smeasaan') {
        return 'smeasaan';
    } else if (normalized === 'commercialvehicle') {
        return 'commercialvehicle';
    } else if (normalized === 'ameendrive') {
        return 'ameendrive';
    } else if (normalized === 'personalloan') {
        return 'personalloan';
    } else if (normalized === 'homeloan') {
        return 'homeloan';
    } else if (normalized.includes('creditcard') || 
               normalized === 'platinumcreditcard' || 
               normalized === 'classiccreditcard') {
        // UNIFIED: All credit card types go to single 'creditcard' folder
        return 'creditcard';
    } else {
        // Unknown types go to temp folder
        return 'temp';
    }
}

/**
 * Get all supported application type folders
 * @returns {string[]} - Array of standard folder names
 */
function getAllApplicationFolders() {
    return [
        'cashplus',
        'autoloan',
        'smeasaan',
        'commercialvehicle',
        'ameendrive',
        'personalloan',
        'homeloan',
        'creditcard' // All credit card types unified here
    ];
}

/**
 * Get document path for a given LOS ID and application type
 * 
 * @param {string|number} losId - The LOS ID (with or without 'LOS-' prefix)
 * @param {string} applicationType - The application type
 * @returns {string} - The path: appType/los-XX
 * 
 * @example
 * getDocumentPath('LOS-76', 'PlatinumCreditCard') // => 'creditcard/los-76'
 * getDocumentPath(76, 'cashplus') // => 'cashplus/los-76'
 */
function getDocumentPath(losId, applicationType) {
    // Extract numeric LOS ID
    const numericId = String(losId).replace(/^LOS-/i, '').replace(/^los-/i, '');
    
    // Get standardized folder
    const folder = mapApplicationTypeToFolder(applicationType);
    
    return `${folder}/los-${numericId}`;
}

/**
 * Build full document URL for serving
 * 
 * @param {string|number} losId - The LOS ID
 * @param {string} applicationType - The application type
 * @param {string} filename - The document filename
 * @param {string} baseUrl - Base URL (default: http://localhost:8081)
 * @returns {string} - Full document URL
 * 
 * @example
 * getDocumentUrl('76', 'PlatinumCreditCard', 'photo.jpg')
 * // => 'http://localhost:8081/explorer/creditcard/los-76/photo.jpg'
 */
function getDocumentUrl(losId, applicationType, filename, baseUrl = 'http://localhost:8081') {
    const path = getDocumentPath(losId, applicationType);
    const encodedFilename = encodeURIComponent(filename);
    return `${baseUrl}/explorer/${path}/${encodedFilename}`;
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mapApplicationTypeToFolder,
        getAllApplicationFolders,
        getDocumentPath,
        getDocumentUrl
    };
}

// Export for ES6 modules (if used in frontend)
if (typeof exports !== 'undefined') {
    exports.mapApplicationTypeToFolder = mapApplicationTypeToFolder;
    exports.getAllApplicationFolders = getAllApplicationFolders;
    exports.getDocumentPath = getDocumentPath;
    exports.getDocumentUrl = getDocumentUrl;
}

