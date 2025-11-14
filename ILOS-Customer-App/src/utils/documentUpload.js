/**
 * Document Upload Utility for Mobile App
 * Integrates with existing FileZilla document server (port 8086)
 */

import { API_URL } from './config';

// Document server runs on port 8086 (same as web version)
const DOCUMENT_SERVER_URL = 'http://localhost:8086'; // Use localhost with adb reverse

/**
 * Upload document file to FileZilla document server
 * @param {Object} params
 * @param {string} params.docType - Document type (e.g., 'cnic', 'salarySlip')
 * @param {string} params.imageUri - Local file URI
 * @param {string} params.loanType - Loan type (e.g., 'cashplus', 'autoloan')
 * @param {string} params.losId - LOS ID (optional, can be 'pending' for pre-submission uploads)
 * @param {string} params.cnic - Customer CNIC
 * @param {Object} params.ocrData - OCR extracted data (optional)
 * @returns {Promise<Object>} Upload result with file path
 */
export const uploadDocumentToServer = async ({
  docType,
  imageUri,
  loanType,
  losId = 'pending',
  cnic,
  ocrData = null
}) => {
  try {
    console.log(`📤 Uploading ${docType} to document server...`);
    console.log(`📂 Target: ${loanType}/los-${losId}`);

    // Create FormData for upload
    const formData = new FormData();
    
    // Add the file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${docType}_${cnic}_${Date.now()}.jpg`,
    });
    
    // Add metadata (FileZilla server expects these fields)
    formData.append('loanType', loanType); // or 'loan_type'
    formData.append('losId', losId.toString()); // or 'los_id'
    formData.append('custom_name', `${docType}_${cnic}.jpg`); // Custom filename
    formData.append('document_type', docType);
    
    // Upload to FileZilla document server
    const response = await fetch(`${DOCUMENT_SERVER_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    console.log(`✅ Document uploaded successfully:`, result.file.name);
    console.log(`📂 Saved to: ${result.folder}`);

    // If OCR data is provided, save it alongside the document
    if (ocrData && losId !== 'pending') {
      await saveOcrData({
        loanType,
        losId,
        docType,
        ocrData
      });
    }

    return {
      success: true,
      fileName: result.file.name,
      filePath: result.file.path,
      folder: result.folder,
      url: `/explorer/${loanType}/los-${losId}/${result.file.name}`,
    };

  } catch (error) {
    console.error(`❌ Failed to upload ${docType}:`, error);
    throw error;
  }
};

/**
 * Save OCR data to document server
 * @param {Object} params
 * @param {string} params.loanType
 * @param {string} params.losId
 * @param {string} params.docType
 * @param {Object} params.ocrData
 */
export const saveOcrData = async ({ loanType, losId, docType, ocrData }) => {
  try {
    console.log(`💾 Saving OCR data for ${docType}...`);

    const response = await fetch(`${DOCUMENT_SERVER_URL}/save-ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        loan_type: loanType,
        los_id: losId,
        document_type: docType,
        ocr_data: ocrData,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error('Failed to save OCR data');
    }

    console.log(`✅ OCR data saved: ${result.path}`);
    return result;

  } catch (error) {
    console.error(`❌ Failed to save OCR data:`, error);
    // Don't throw - OCR save failure shouldn't block the flow
    return { success: false, error: error.message };
  }
};

/**
 * Get document URL for viewing
 * @param {string} loanType
 * @param {string} losId
 * @param {string} fileName
 * @returns {string} Document URL
 */
export const getDocumentUrl = (loanType, losId, fileName) => {
  return `${DOCUMENT_SERVER_URL}/explorer/${loanType}/los-${losId}/${fileName}`;
};

/**
 * Fetch all documents for a specific LOS ID
 * @param {string} losId
 * @param {string} applicationType (optional)
 * @returns {Promise<Array>} List of documents
 */
export const fetchDocuments = async (losId, applicationType = null) => {
  try {
    const url = applicationType
      ? `${DOCUMENT_SERVER_URL}/api/documents/${losId}?applicationType=${applicationType}`
      : `${DOCUMENT_SERVER_URL}/api/documents/search/${losId}`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result.documents || [];

  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
};

/**
 * Map mobile app product types to FileZilla loan types
 * @param {string} productType - Mobile app product type
 * @returns {string} Mapped loan type for FileZilla
 */
export const mapProductTypeToLoanType = (productType) => {
  const normalized = productType.toLowerCase().replace(/[-_\s]/g, '');
  
  const mapping = {
    'cashplus': 'cashplus',
    'autoloan': 'autoloan',
    'smeasaan': 'smeasaan',
    'commercialvehicle': 'commercialvehicle',
    'ameendrive': 'ameendrive',
    'platinumcreditcard': 'creditcard',
    'classiccreditcard': 'creditcard',
    'instantloan': 'cashplus', // InstantLoan uses cashplus folder
  };

  return mapping[normalized] || 'temp';
};

