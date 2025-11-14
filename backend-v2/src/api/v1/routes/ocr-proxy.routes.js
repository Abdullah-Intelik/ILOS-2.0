/**
 * OCR Proxy Routes
 * Proxies requests to external OCR services with CORS support
 */

const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function createOcrProxyRoutes() {
  const router = express.Router();

  /**
   * POST /api/v1/ocr/cnic
   * Proxy for CNIC OCR service (port 8001)
   */
  router.post('/cnic', upload.single('file'), async (req, res) => {
    try {
      console.log('📥 Received CNIC OCR request');
      console.log('   Body keys:', Object.keys(req.body));
      console.log('   File:', req.file ? req.file.originalname : 'NO FILE');
      console.log('   Files:', req.files ? Object.keys(req.files) : 'NO FILES');
      
      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({ 
          error: 'No file uploaded',
          debug: {
            body: Object.keys(req.body),
            file: req.file,
            files: req.files
          }
        });
      }

      console.log(`🔄 Proxying CNIC OCR request: ${req.file.originalname}`);

      // Create form data - OCR service expects 'files' not 'file'
      const formData = new FormData();
      formData.append('files', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      console.log('📤 Sending to OCR service with field name: files');

      const response = await axios.post('http://127.0.0.1:8001/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      console.log(`✅ CNIC OCR success: ${response.data?.results?.[0]?.processing_time_seconds || 0}s`);

      res.json(response.data);

    } catch (error) {
      console.error('❌ CNIC OCR Proxy Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'CNIC OCR service is not available',
          message: 'Please ensure the CNIC OCR service is running on port 8001'
        });
      }

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      res.status(500).json({
        error: 'Failed to process CNIC',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/ocr/salary
   * Proxy for Salary Slip OCR service (port 8002)
   */
  router.post('/salary', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`🔄 Proxying Salary OCR request: ${req.file.originalname}`);

      // Create form data - OCR service expects 'files' not 'file'
      const formData = new FormData();
      formData.append('files', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      console.log('📤 Sending to OCR service with field name: files');

      const response = await axios.post('http://127.0.0.1:8002/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      console.log(`✅ Salary OCR success: ${response.data?.results?.[0]?.processing_time_seconds || 0}s`);

      res.json(response.data);

    } catch (error) {
      console.error('❌ Salary OCR Proxy Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Salary OCR service is not available',
          message: 'Please ensure the Salary OCR service is running on port 8002'
        });
      }

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      res.status(500).json({
        error: 'Failed to process salary slip',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/ocr/ecib
   * Proxy for eCIB OCR service (port 8003)
   */
  router.post('/ecib', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`🔄 Proxying eCIB OCR request: ${req.file.originalname}`);

      // Create form data - OCR service expects 'files' not 'file'
      const formData = new FormData();
      formData.append('files', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      console.log('📤 Sending to OCR service with field name: files');

      const response = await axios.post('http://127.0.0.1:8003/extract', formData, {
        headers: formData.getHeaders(),
        timeout: 90000 // 90 seconds for eCIB
      });

      console.log(`✅ eCIB OCR success: ${response.data?.results?.[0]?.processing_time_seconds || 0}s`);

      res.json(response.data);

    } catch (error) {
      console.error('❌ eCIB OCR Proxy Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'eCIB OCR service is not available',
          message: 'Please ensure the eCIB OCR service is running on port 8003'
        });
      }

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      res.status(500).json({
        error: 'Failed to process eCIB',
        message: error.message
      });
    }
  });

  return router;
}

module.exports = { createOcrProxyRoutes };

