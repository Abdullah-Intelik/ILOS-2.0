/**
 * COMPREHENSIVE FORM SUBMISSION TEST
 * Tests that ALL fields are properly saved to Backend V2.0
 */

const axios = require('axios');
const { Pool } = require('pg');

const API_BASE = 'http://localhost:5000';

const pool = new Pool({
  connectionString: 'postgresql://postgres:faez@localhost:5432/ilos_v2_demo'
});

async function testFullSubmission() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║      TESTING FULL FORM SUBMISSION - ALL FIELDS              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const testData = {
    product_code: 'CASHPLUS',
    product_type: 'personal_loan',
    requested_amount: 750000,
    tenure_months: 36,
    
    // ✅ PURPOSE - THIS IS THE MISSING FIELD!
    purpose: 'Home Renovation', // This should be saved in applications.purpose
    
    product_details: {
      loan_type: 'Normal',
      min_acceptable_amount: 600000,
      max_affordable_installment: 25000
    },
    
    party_data: {
      cnic: '1234567890123',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      gender: 'M',
      marital_status: 'Married',
      mobile: '03001234567',
      email: 'john.doe@example.com',
      residential_address: '123 Main Street, Block A',
      city: 'Lahore',
      country: 'Pakistan',
      customer_type: 'NTB'
    },
    
    party_details: {
      employment_type: 'Salaried',
      employer_name: 'ABC Company',
      designation: 'Software Engineer',
      employment_tenure_months: 48,
      office_address: '456 Office Tower, Blue Area', // This goes to party_details
      monthly_income: 150000,
      bank_name: 'Standard Chartered',
      account_number: '9876543210'
    },
    
    references: [
      {
        name: 'Ali Ahmed',
        relationship: 'Brother',
        mobile: '03211111111',
        address: '789 Reference Street'
      },
      {
        name: 'Sara Khan',
        relationship: 'Sister',
        mobile: '03222222222',
        address: '321 Family Avenue'
      }
    ],
    
    exposure: {
      has_existing_cards: false,
      has_existing_loans: false
    }
  };

  try {
    // Submit application
    console.log('📤 Submitting application...\n');
    const response = await axios.post(`${API_BASE}/api/v1/applications`, testData);
    
    if (!response.data.success) {
      throw new Error('Application submission failed');
    }
    
    const losId = response.data.data.los_id;
    console.log(`✅ Application created: LOS-${losId}\n`);
    
    // Verify in database
    console.log('🔍 Verifying data in database...\n');
    
    // 1. Check applications table
    const appResult = await pool.query(
      'SELECT * FROM applications WHERE los_id = $1',
      [losId]
    );
    const app = appResult.rows[0];
    
    console.log('📋 Applications Table:');
    console.log(`   ✓ Purpose: ${app.purpose || '❌ MISSING'}`);
    console.log(`   ✓ Requested Amount: ${app.requested_amount}`);
    console.log(`   ✓ Tenure: ${app.tenure_months} months\n`);
    
    // 2. Check party details
    const partyResult = await pool.query(
      'SELECT pd.* FROM party_details pd JOIN applications a ON pd.party_id = a.party_id WHERE a.los_id = $1',
      [losId]
    );
    const partyDetails = partyResult.rows[0];
    
    console.log('👤 Party Details:');
    console.log(`   ✓ Office Address: ${partyDetails?.office_address || '❌ MISSING'}`);
    console.log(`   ✓ Monthly Income: ${partyDetails?.monthly_income || '❌ MISSING'}\n`);
    
    // 3. Check references
    const refsResult = await pool.query(
      'SELECT * FROM application_references WHERE los_id = $1',
      [losId]
    );
    
    console.log(`👥 References (${refsResult.rows.length}):`);
    refsResult.rows.forEach((ref, i) => {
      console.log(`   ${i + 1}. Name: ${ref.full_name}, Mobile: ${ref.mobile}`);
    });
    console.log('');
    
    // 4. Check product-specific details
    const prodResult = await pool.query(
      'SELECT * FROM product_personal_loan WHERE application_id = $1',
      [app.application_id]
    );
    const prodDetails = prodResult.rows[0];
    
    console.log('🎯 Product-Specific Details:');
    console.log(`   ✓ Loan Type: ${prodDetails?.loan_type || '❌ MISSING'}`);
    console.log(`   ✓ Min Acceptable: ${prodDetails?.min_acceptable_amount || '❌ MISSING'}\n`);
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const issues = [];
    if (!app.purpose) issues.push('❌ Purpose not saved');
    if (!partyDetails?.office_address) issues.push('❌ Office Address not saved');
    if (refsResult.rows.length !== 2) issues.push(`❌ Only ${refsResult.rows.length}/2 references saved`);
    
    if (issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('\n');
    } else {
      console.log('\n✅ ALL FIELDS SAVED CORRECTLY!\n');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    await pool.end();
  }
}

testFullSubmission();

