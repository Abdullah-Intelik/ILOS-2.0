/**
 * Legacy Document Routes
 * For backward compatibility with old frontend components
 */

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function createLegacyDocumentRoutes() {
  const router = express.Router();

  /**
   * POST /api/decision/upload-ecib
   * Upload and process eCIB PDF document
   * Legacy endpoint for DocumentUploadGateway
   */
  router.post('/upload-ecib', upload.single('ecib_pdf'), async (req, res) => {
    try {
      const { losId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      console.log('═'.repeat(80));
      console.log(`📤 UPLOADING ECIB PDF${losId !== 'pending' ? ` FOR LOS-${losId}` : ''}`);
      console.log('═'.repeat(80));
      console.log(`📄 File: ${req.file.originalname}`);
      console.log(`📏 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
      console.log(`🔄 Processing with OCR AI (this may take 5-10 seconds)...`);
      console.log('');

      // Create form data for OCR API
      const formData = new FormData();
      formData.append('files', req.file.buffer, {  // Changed from 'file' to 'files'
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      console.log('📤 Sending eCIB to OCR service with field name: files');

      // Call eCIB OCR service (port 8003/extract)
      const ocrResponse = await axios.post('http://localhost:8003/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 90000, // 90 seconds
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // New format: { total_files, results: [{ id, filename, result, processing_time_seconds, ocr_instance }] }
      const responseData = ocrResponse.data;
      const ecibResult = responseData.results?.[0];
      const ecibData = ecibResult?.result || [];

      console.log('✅ eCIB OCR Processing Complete!');
      console.log(`📊 Extracted Data Summary:`);
      console.log(`   - File: ${ecibResult?.filename || 'N/A'}`);
      console.log(`   - Processing Time: ${ecibResult?.processing_time_seconds || 0}s`);
      console.log(`   - Sections Extracted: ${Array.isArray(ecibData) ? ecibData.length : 0}`);
      
      // Extract key info from new structure
      const individualProfile = ecibData.find(section => section['Individual Profile'])?.[' Individual Profile'];
      if (individualProfile) {
        console.log(`   - Name: ${individualProfile.Name || 'N/A'}`);
        console.log(`   - CNIC: ${individualProfile['CNIC #'] || individualProfile['Profile Identifier'] || 'N/A'}`);
      }
      
      const creditDetails = ecibData.find(section => section['Credit Details'])?.['Credit Details'];
      if (creditDetails) {
        console.log(`   - Total Credit Facilities: ${Array.isArray(creditDetails) ? creditDetails.length - 1 : 0}`); // -1 for header row
      }
      
      console.log('═'.repeat(80));
      console.log('');

      res.json({
        success: true,
        ecib_data: ecibData,
        file_name: ecibResult?.filename,
        processing_time: `${ecibResult?.processing_time_seconds}s`,
        raw_response: responseData,
        message: 'eCIB processed successfully'
      });

    } catch (error) {
      console.error('❌ eCIB Upload Error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'eCIB OCR service is not available',
          message: 'Please ensure the eCIB OCR service is running on port 8003',
          details: error.message
        });
      }

      if (error.response) {
        return res.status(error.response.status).json({
          error: 'OCR processing failed',
          message: error.response.data?.error || error.message
        });
      }

      res.status(500).json({
        error: 'Failed to process eCIB',
        message: error.message
      });
    }
  });

  /**
   * POST /api/decision/upload-cnic
   * Upload and process CNIC image
   * Legacy endpoint for DocumentUploadGateway
   */
  router.post('/upload-cnic', upload.single('cnic_image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      console.log(`📤 Uploading CNIC: ${req.file.originalname}`);

      // Create form data for OCR API
      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      // Call CNIC OCR service (port 8001/extract)
      const ocrResponse = await axios.post('http://localhost:8001/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      // New format: { total_files, results: [{ id, filename, result, processing_time_seconds }] }
      const responseData = ocrResponse.data;
      const cnicResult = responseData.results?.[0];
      const cnicData = cnicResult?.result || {};

      console.log('✅ CNIC OCR Complete');
      console.log(`📊 Processing Time: ${cnicResult?.processing_time_seconds || 0}s`);

      res.json({
        success: true,
        cnic_data: cnicData,
        file_name: cnicResult?.filename,
        processing_time: `${cnicResult?.processing_time_seconds}s`,
        raw_response: responseData,
        message: 'CNIC processed successfully'
      });

    } catch (error) {
      console.error('❌ CNIC Upload Error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'CNIC OCR service is not available',
          message: 'Please ensure the CNIC OCR service is running on port 8001'
        });
      }

      res.status(500).json({
        error: 'Failed to process CNIC',
        message: error.message
      });
    }
  });

  /**
   * POST /api/decision/upload-salary-slip
   * Upload and process salary slip image
   * Legacy endpoint for DocumentUploadGateway
   */
  router.post('/upload-salary-slip', upload.single('salary_slip'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      console.log(`📤 Uploading Salary Slip: ${req.file.originalname}`);

      // Create form data for OCR API
      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      // Call Salary Slip OCR service (port 8002/extract)
      const ocrResponse = await axios.post('http://localhost:8002/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      // New format: { total_files, results: [{ id, filename, result, processing_time_seconds }] }
      const responseData = ocrResponse.data;
      const salaryResult = responseData.results?.[0];
      const salaryData = salaryResult?.result || {};

      console.log('✅ Salary Slip OCR Complete');
      console.log(`📊 Processing Time: ${salaryResult?.processing_time_seconds || 0}s`);

      res.json({
        success: true,
        salary_data: salaryData,
        file_name: salaryResult?.filename,
        processing_time: `${salaryResult?.processing_time_seconds}s`,
        raw_response: responseData,
        message: 'Salary slip processed successfully'
      });

    } catch (error) {
      console.error('❌ Salary Slip Upload Error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Salary Slip OCR service is not available',
          message: 'Please ensure the Salary Slip OCR service is running on port 8002'
        });
      }

      res.status(500).json({
        error: 'Failed to process salary slip',
        message: error.message
      });
    }
  });

  return router;
}

module.exports = { createLegacyDocumentRoutes };

