const express = require('express');
const router = express.Router();
const db = require('../db1'); // ILOS database
const cbsDb = require('../db'); // CBS database

// Customer Login with CNIC
router.post('/login', async (req, res) => {
  try {
    const { cnic } = req.body;

    console.log('📱 Customer login request with CNIC:', cnic);

    if (!cnic) {
      return res.status(400).json({ 
        success: false, 
        message: 'CNIC is required' 
      });
    }

    // Clean CNIC (remove dashes/spaces)
    const cleanCNIC = cnic.replace(/[-\s]/g, '');

    // Validate CNIC format (13 digits)
    if (!/^\d{13}$/.test(cleanCNIC)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid CNIC format. Must be 13 digits.' 
      });
    }

    // CHECK CBS DATABASE ONLY (not ILOS applications)
    // CBS is the source of truth for customer existence (ETB/NTB)
    // ILOS is only for storing application data, NOT for determining customer status
    let customer;
    let customerName = 'New Customer';
    let isExisting = false;
    let customerStatus = 'NTB'; // NTB, ETB, or RETURNING
    
    console.log('🏦 Checking CBS database for customer (ETB/NTB check)...');
    try {
      const cbsCustomer = await cbsDb.query(`
        SELECT 
          cif.customer_id,
          cif.fullname,
          cif.cnic
        FROM cif_customers cif
        WHERE cif.cnic = $1
        LIMIT 1
      `, [cleanCNIC]);

      if (cbsCustomer.rows.length > 0) {
        // EXISTING BANK CUSTOMER (ETB)
        const cbs = cbsCustomer.rows[0];
        customerName = cbs.fullname || 'Valued Customer';
        isExisting = true;
        customerStatus = 'ETB';
        console.log('✅ ETB (Existing to Bank) - Customer found in CBS:', customerName);
      } else {
        // NEW TO BANK (NTB)
        console.log('ℹ️ NTB (New to Bank) - Customer not found in CBS');
      }
    } catch (cbsError) {
      console.error('❌ Error querying CBS database:', cbsError.message);
      // Continue with "New Customer" if CBS check fails
    }
    
    // Get application count from ILOS (for display and greeting purposes)
    let totalApplications = 0;
    try {
      const appCount = await db.query(`
        SELECT COUNT(*) as count
        FROM ilos_applications
        WHERE cnic = $1
      `, [cleanCNIC]);
      totalApplications = parseInt(appCount.rows[0]?.count) || 0;
      console.log(`📊 Customer has ${totalApplications} ILOS applications`);
      
      // If not in CBS but has applications, they're a returning applicant
      if (!isExisting && totalApplications > 0) {
        customerName = 'Returning Applicant';
        customerStatus = 'RETURNING';
        console.log('🔄 Customer is a returning applicant (NTB with applications)');
      }
    } catch (err) {
      console.log('⚠️ Could not fetch ILOS application count:', err.message);
    }
    
    customer = {
      name: customerName,
      cnic: cleanCNIC,
      isExisting: isExisting, // Based on CBS ONLY (for auto-fill purposes)
      totalApplications: totalApplications,
      status: customerStatus, // ETB, NTB, or RETURNING
    };
    
    console.log(`✅ Login successful: ${customerStatus} - ${customerName} (${totalApplications} apps)`);

    // In production, you would generate a JWT token here
    // For now, we'll just return customer data
    const token = `customer_${cleanCNIC}_${Date.now()}`;

    res.json({
      success: true,
      customer,
      token,
      message: customer.isExisting 
        ? `Welcome back, ${customer.name}!` 
        : 'Welcome! You can now apply for loans and credit cards.',
    });

  } catch (error) {
    console.error('❌ Customer login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Verify CNIC (optional endpoint for additional validation)
router.post('/verify-cnic', async (req, res) => {
  try {
    const { cnic } = req.body;

    if (!cnic) {
      return res.status(400).json({ 
        success: false, 
        message: 'CNIC is required' 
      });
    }

    const cleanCNIC = cnic.replace(/[-\s]/g, '');

    if (!/^\d{13}$/.test(cleanCNIC)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid CNIC format' 
      });
    }

    // Check if CNIC exists
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM ilos_applications 
      WHERE cnic = $1
    `, [cleanCNIC]);

    const exists = parseInt(result.rows[0]?.count) > 0;

    res.json({
      success: true,
      exists,
      cnic: cleanCNIC,
    });

  } catch (error) {
    console.error('❌ CNIC verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed' 
    });
  }
});

// Get customer's applications by CNIC
router.get('/applications', async (req, res) => {
  try {
    const { cnic } = req.query;

    if (!cnic) {
      return res.status(400).json({ 
        success: false, 
        message: 'CNIC is required' 
      });
    }

    const cleanCNIC = cnic.replace(/[-\s]/g, '');

    const applications = await db.query(`
      SELECT 
        los_id,
        loan_type,
        status,
        created_at,
        updated_at,
        cnic
      FROM ilos_applications
      WHERE cnic = $1
      ORDER BY created_at DESC
    `, [cleanCNIC]);

    res.json(applications.rows);

  } catch (error) {
    console.error('❌ Error fetching customer applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications' 
    });
  }
});

// Alternative route to get applications by CNIC (for mobile app compatibility)
router.get('/applications/by-cnic/:cnic', async (req, res) => {
  try {
    const { cnic } = req.params;
    const cleanCNIC = cnic.replace(/[-\s]/g, '');

    console.log('📱 Fetching applications for CNIC:', cleanCNIC);

    const applications = await db.query(`
      SELECT 
        los_id,
        loan_type,
        status,
        created_at,
        updated_at,
        cnic
      FROM ilos_applications
      WHERE cnic = $1
      ORDER BY created_at DESC
    `, [cleanCNIC]);

    console.log(`✅ Found ${applications.rows.length} applications for customer`);

    res.json(applications.rows);

  } catch (error) {
    console.error('❌ Error fetching customer applications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      message: error.message 
    });
  }
});

// Get customer details for auto-filling form (NTB/ETB check)
router.get('/details/:cnic', async (req, res) => {
  console.log('🔍 Customer details endpoint hit with CNIC:', req.params.cnic);
  try {
    const { cnic } = req.params;
    const cleanCNIC = cnic.replace(/[-\s]/g, '');

    console.log('📋 Fetching customer details for auto-fill:', cleanCNIC);

    let customerDetails = null;

    // FIRST: Check CBS database for customer (same as web version)
    console.log('📋 About to query CBS database...');
    console.log('📋 cbsDb connection type:', typeof cbsDb);
    
    try {
      console.log('📋 Auto-fill: Querying CBS database for CNIC', cleanCNIC);
      
      const cbsCustomer = await cbsDb.query(`
        SELECT 
          cif.customer_id,
          cif.fullname,
          cif.cnic,
          cif.city,
          cif.district,
          cif.domicile_state,
          cif.business,
          cif.industry,
          ind.father_husband_name,
          ind.maiden_name,
          ind.date_of_birth,
          ind.sex as gender,
          ind.maritial_status as marital_status, -- Note: DB column is "maritial_status" (typo in schema)
          ind.occupation_code,
          ind.title,
          ind.resident_status,
          postal.address as address,
          postal.postal_code,
          phone.phone_no as mobile,
          email.address as email,
          banks.bank_name,
          banks.actt_no as account_number,
          banks.branch
        FROM cif_customers cif
        LEFT JOIN individual_info ind ON cif.customer_id = ind.customer_id
        LEFT JOIN postal ON cif.customer_id = postal.customer_id AND postal.position = (
          SELECT MIN(position) FROM postal WHERE customer_id = cif.customer_id
        )
        LEFT JOIN phone ON cif.customer_id = phone.customer_id AND phone.position = (
          SELECT MIN(position) FROM phone WHERE customer_id = cif.customer_id
        )
        LEFT JOIN email ON cif.customer_id = email.customer_id AND email.position = (
          SELECT MIN(position) FROM email WHERE customer_id = cif.customer_id
        )
        LEFT JOIN client_banks banks ON cif.customer_id = banks.customer_id AND banks.position = (
          SELECT MIN(position) FROM client_banks WHERE customer_id = cif.customer_id
        )
        WHERE cif.cnic = $1
        LIMIT 1
      `, [cleanCNIC]);

      console.log(`📋 CBS query returned ${cbsCustomer.rows.length} rows`);

      if (cbsCustomer.rows.length > 0) {
        const cbs = cbsCustomer.rows[0];
        const nameParts = cbs.fullname?.split(' ') || [];
        
        customerDetails = {
          title: cbs.title || 'Mr',
          first_name: nameParts[0] || '',
          middle_name: nameParts.slice(1, -1).join(' ') || '',
          last_name: nameParts[nameParts.length - 1] || nameParts[0] || '',
          cnic: cbs.cnic,
          father_or_husband_name: cbs.father_husband_name || '',
          mother_maiden_name: cbs.maiden_name || '',
          date_of_birth: cbs.date_of_birth,
          gender: cbs.gender,
          marital_status: cbs.marital_status,
          dependants: 0, // Not available in CBS
          education_qualification: cbs.occupation_code || '',
          address: cbs.address || '',
          city: cbs.city || '',
          postal_code: cbs.postal_code || '',
          mobile: cbs.mobile || '',
          email: cbs.email || '',
          company_name: cbs.business || '',
          employment_status: cbs.business ? 'Self Employed' : 'Salaried',
          bank_name: cbs.bank_name || '',
          account_number: cbs.account_number || '',
          branch: cbs.branch || '',
        };
        
        console.log('✅ Found customer details from CBS database:', {
          name: `${customerDetails.first_name} ${customerDetails.last_name}`,
          mobile: customerDetails.mobile,
          city: customerDetails.city,
          bank: customerDetails.bank_name,
          account: customerDetails.account_number ? `***${customerDetails.account_number.slice(-4)}` : 'N/A'
        });
      } else {
        console.log('⚠️ NTB - Customer not found in CBS database (no auto-fill data available)');
      }
    } catch (cbsError) {
      console.error('❌ Error querying CBS database:', cbsError.message);
    }

    // CBS IS THE ONLY SOURCE for auto-fill
    // NO fallback to ILOS applications - ILOS is only for storing application data

    // Return response
    res.json({
      success: true,
      customerDetails: customerDetails || {},
      isExisting: !!customerDetails,
      message: customerDetails 
        ? 'Customer details found - fields will be auto-filled' 
        : 'New customer - please fill all details',
    });

  } catch (error) {
    console.error('❌ Error fetching customer details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch customer details' 
    });
  }
});

module.exports = router;


