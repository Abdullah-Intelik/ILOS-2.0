const cbsDb = require('../db'); // CBS database

/**
 * Create a new customer in CBS database from OCR-extracted data
 * This converts NTB (New to Bank) customers to ETB after document upload
 * 
 * @param {string} cnic - Customer CNIC (13 digits)
 * @param {object} ocrData - OCR extracted data from documents
 * @param {object} ocrData.cnic - CNIC document data
 * @param {object} ocrData.salarySlip - Salary slip data (optional)
 * @returns {Promise<object>} - Result with success status and customer_id
 */
async function createCbsCustomer(cnic, ocrData) {
  try {
    console.log('🏦 Creating CBS customer account for CNIC:', cnic);
    
    // Validate input
    if (!cnic || !ocrData || !ocrData.cnic) {
      throw new Error('CNIC and OCR data are required');
    }
    
    const cleanCNIC = cnic.replace(/[-\s]/g, '');
    
    // Check if customer already exists in CBS
    const existingCustomer = await cbsDb.query(
      'SELECT customer_id FROM cif_customers WHERE cnic = $1',
      [cleanCNIC]
    );
    
    if (existingCustomer.rows.length > 0) {
      console.log('ℹ️ Customer already exists in CBS, skipping creation');
      return {
        success: true,
        alreadyExists: true,
        customer_id: existingCustomer.rows[0].customer_id,
      };
    }
    
    // Extract data from OCR
    const cnicData = ocrData.cnic;
    const salaryData = ocrData.salarySlip || {};
    
    // Parse name from CNIC OCR
    const fullName = cnicData.name || cnicData.full_name || 'Unknown';
    const fatherName = cnicData['father name'] || cnicData.father_name || cnicData.father_husband_name || '';
    const dob = cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth || null;
    const gender = cnicData.gender || cnicData.sex || '';
    const address = cnicData.address || '';
    
    // Parse salary data if available
    const companyName = salaryData.company_name || salaryData.employer || '';
    const salary = salaryData.salary || salaryData.net_salary || null;
    
    // Generate unique customer_id (using timestamp + random)
    const customerId = `CIF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Start transaction
    await cbsDb.query('BEGIN');
    
    try {
      // 1. Insert into cif_customers (main customer table)
      console.log('📝 Inserting into cif_customers...');
      await cbsDb.query(`
        INSERT INTO cif_customers (
          customer_id, fullname, cnic, business, 
          created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        customerId,
        fullName,
        cleanCNIC,
        companyName || null
      ]);
      
      // 2. Insert into individual_info (personal details)
      console.log('📝 Inserting into individual_info...');
      
      // Determine gender code (M/F)
      let genderCode = '';
      if (gender) {
        const g = gender.toUpperCase();
        if (g === 'M' || g === 'MALE') genderCode = 'M';
        else if (g === 'F' || g === 'FEMALE') genderCode = 'F';
      }
      
      await cbsDb.query(`
        INSERT INTO individual_info (
          customer_id, father_husband_name, date_of_birth, 
          sex, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        customerId,
        fatherName || null,
        dob || null,
        genderCode || null
      ]);
      
      // 3. Insert into postal (address)
      if (address) {
        console.log('📝 Inserting into postal...');
        await cbsDb.query(`
          INSERT INTO postal (
            customer_id, position, address, created_at
          ) VALUES ($1, $2, $3, NOW())
        `, [
          customerId,
          '1', // Primary address
          address
        ]);
      }
      
      // 4. Insert placeholder phone (will be updated from form)
      console.log('📝 Inserting placeholder phone...');
      await cbsDb.query(`
        INSERT INTO phone (
          customer_id, position, phone_no, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [
        customerId,
        '1', // Primary phone
        '0000000000' // Placeholder, will be updated from form
      ]);
      
      // 5. Insert placeholder email (will be updated from form)
      console.log('📝 Inserting placeholder email...');
      await cbsDb.query(`
        INSERT INTO email (
          customer_id, position, address, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [
        customerId,
        '1', // Primary email
        'noemail@temp.com' // Placeholder, will be updated from form
      ]);
      
      // Commit transaction
      await cbsDb.query('COMMIT');
      
      console.log('✅ CBS customer account created successfully:', customerId);
      
      return {
        success: true,
        alreadyExists: false,
        customer_id: customerId,
        fullname: fullName,
        cnic: cleanCNIC,
        message: 'Customer account created in CBS database'
      };
      
    } catch (insertError) {
      // Rollback on error
      await cbsDb.query('ROLLBACK');
      throw insertError;
    }
    
  } catch (error) {
    console.error('❌ Error creating CBS customer:', error.message);
    throw new Error(`Failed to create CBS customer: ${error.message}`);
  }
}

/**
 * Update CBS customer with form data (phone, email, etc.)
 * Called when customer submits application with complete details
 * 
 * @param {string} cnic - Customer CNIC
 * @param {object} formData - Application form data
 */
async function updateCbsCustomerFromForm(cnic, formData) {
  try {
    const cleanCNIC = cnic.replace(/[-\s]/g, '');
    
    console.log('🔄 Updating CBS customer with form data for CNIC:', cleanCNIC);
    
    // Get customer_id
    const customer = await cbsDb.query(
      'SELECT customer_id FROM cif_customers WHERE cnic = $1',
      [cleanCNIC]
    );
    
    if (customer.rows.length === 0) {
      console.log('⚠️ Customer not found in CBS, cannot update');
      return { success: false, message: 'Customer not found' };
    }
    
    const customerId = customer.rows[0].customer_id;
    
    // Update phone if provided
    if (formData.mobileNumber || formData.mobile) {
      const phone = formData.mobileNumber || formData.mobile;
      await cbsDb.query(`
        UPDATE phone 
        SET phone_no = $1, version = COALESCE(version, '0')::int + 1
        WHERE customer_id = $2 AND position = '1'
      `, [phone, customerId]);
      console.log('✅ Updated phone number');
    }
    
    // Update email if provided
    if (formData.email) {
      await cbsDb.query(`
        UPDATE email 
        SET address = $1, version = COALESCE(version, '0')::int + 1
        WHERE customer_id = $2 AND position = '1'
      `, [formData.email, customerId]);
      console.log('✅ Updated email');
    }
    
    // Update address if provided
    if (formData.address) {
      await cbsDb.query(`
        UPDATE postal 
        SET address = $1, version = COALESCE(version, '0')::int + 1
        WHERE customer_id = $2 AND position = '1'
      `, [formData.address, customerId]);
      console.log('✅ Updated address');
    }
    
    // Update marital status in individual_info
    if (formData.maritalStatus || formData.marital_status) {
      const maritalStatus = formData.maritalStatus || formData.marital_status;
      // Convert to abbreviation if needed
      let statusCode = maritalStatus;
      if (maritalStatus === 'Single') statusCode = 'S';
      else if (maritalStatus === 'Married') statusCode = 'M';
      else if (maritalStatus === 'Divorced') statusCode = 'D';
      else if (maritalStatus === 'Widowed') statusCode = 'W';
      
      await cbsDb.query(`
        UPDATE individual_info 
        SET maritial_status = $1, version = COALESCE(version, '0')::int + 1
        WHERE customer_id = $2
      `, [statusCode, customerId]);
      console.log('✅ Updated marital status');
    }
    
    console.log('✅ CBS customer updated with form data');
    
    return {
      success: true,
      message: 'Customer details updated in CBS'
    };
    
  } catch (error) {
    console.error('❌ Error updating CBS customer:', error.message);
    return {
      success: false,
      message: `Update failed: ${error.message}`
    };
  }
}

module.exports = {
  createCbsCustomer,
  updateCbsCustomerFromForm
};

