const express = require('express');
const router = express.Router();
const { createCbsCustomer, updateCbsCustomerFromForm } = require('../services/createCbsCustomer');

/**
 * Create CBS customer account from OCR data
 * Called after document upload and validation
 * Converts NTB → ETB
 */
router.post('/create-from-ocr', async (req, res) => {
  try {
    const { cnic, ocrData } = req.body;
    
    console.log('📱 Request to create CBS customer from OCR');
    
    if (!cnic || !ocrData) {
      return res.status(400).json({
        success: false,
        message: 'CNIC and OCR data are required'
      });
    }
    
    const result = await createCbsCustomer(cnic, ocrData);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error in create-from-ocr endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create CBS customer'
    });
  }
});

/**
 * Update CBS customer with form data
 * Called after application submission
 */
router.post('/update-from-form', async (req, res) => {
  try {
    const { cnic, formData } = req.body;
    
    console.log('📱 Request to update CBS customer from form');
    
    if (!cnic || !formData) {
      return res.status(400).json({
        success: false,
        message: 'CNIC and form data are required'
      });
    }
    
    const result = await updateCbsCustomerFromForm(cnic, formData);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error in update-from-form endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update CBS customer'
    });
  }
});

module.exports = router;

