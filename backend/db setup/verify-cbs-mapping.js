const db = require('../db');

// Expected field mappings from CustomerContext.tsx and customerService.js
const EXPECTED_MAPPINGS = {
  // Main customer fields from cif_customers
  personalDetails: {
    fullName: 'cif_customers.fullname',
    firstName: 'individual_info.given_name1 || split fullname',
    middleName: 'individual_info.given_name2',
    lastName: 'individual_info.surname || split fullname',
    fatherName: 'individual_info.father_husband_name || dir_details.father_name',
    motherName: 'individual_info.maiden_name',
    dateOfBirth: 'individual_info.date_of_birth',
    gender: 'individual_info.sex (M/F)',
    maritalStatus: 'individual_info.maritial_status',
    mobileNumber: 'phone.phone_no',
    email: 'email.address',
    ntn: 'dir_details.ntn',
    passportNumber: 'customer_id_type.id_no (if id_type=PASSPORT)',
    occupation: 'individual_info.occupation_code',
    nationality: 'individual_info.country_citizenship || dir_details.nationality'
  },
  
  contactDetails: {
    currentAddress: 'postal.address',
    permanentAddress: 'postal.address (different position)',
    city: 'cif_customers.city',
    district: 'cif_customers.district',
    postalCode: 'postal.postal_code',
    country: 'postal.address_country_code'
  },

  bankingDetails: {
    accountNumber: 'client_banks.actt_no',
    bankName: 'client_banks.bank_name',
    branchName: 'client_banks.branch'
  },

  businessDetails: {
    industry: 'cif_customers.industry',
    business: 'cif_customers.business',
    annualSales: 'cif_customers.annual_sales',
    companyName: 'cif_customers.fullname (for corporate)',
    incorporationCountry: 'cif_customers.incorporation_country'
  }
};

async function checkFieldMapping() {
  try {
    console.log('🔍 Verifying CBS data mapping for form auto-fill...\n');
    
    // Get sample data from each table
    const tables = [
      'cif_customers', 'individual_info', 'dir_details', 'phone', 
      'email', 'postal', 'client_banks', 'customer_id_type'
    ];
    
    const sampleData = {};
    
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT * FROM ${table} LIMIT 1`);
        sampleData[table] = result.rows[0] || {};
        console.log(`✅ ${table}: ${result.rows.length} records found`);
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
        sampleData[table] = {};
      }
    }
    
    console.log('\n📋 FIELD MAPPING VERIFICATION:\n');
    
    // Check each expected mapping
    console.log('=== PERSONAL DETAILS ===');
    const customer = sampleData.cif_customers;
    const individual = sampleData.individual_info;
    const director = sampleData.dir_details;
    const phoneData = sampleData.phone;
    const emailData = sampleData.email;
    const postalData = sampleData.postal;
    const bankData = sampleData.client_banks;
    const idData = sampleData.customer_id_type;
    
    // Personal details verification
    console.log(`fullName: ${customer.fullname || 'MISSING'}`);
    console.log(`firstName: ${individual.given_name1 || customer.fullname?.split(' ')[0] || 'MISSING'}`);
    console.log(`middleName: ${individual.given_name2 || 'MISSING'}`);
    console.log(`lastName: ${individual.surname || customer.fullname?.split(' ').slice(1).join(' ') || 'MISSING'}`);
    console.log(`fatherName: ${individual.father_husband_name || director.father_name || 'MISSING'}`);
    console.log(`motherName: ${individual.maiden_name || 'MISSING'}`);
    console.log(`dateOfBirth: ${individual.date_of_birth || 'MISSING'}`);
    console.log(`gender: ${individual.sex || 'MISSING'}`);
    console.log(`maritalStatus: ${individual.maritial_status || 'MISSING'}`);
    console.log(`mobileNumber: ${phoneData.phone_no || 'MISSING'}`);
    console.log(`email: ${emailData.address || 'MISSING'}`);
    console.log(`ntn: ${director.ntn || 'MISSING'}`);
    console.log(`occupation: ${individual.occupation_code || 'MISSING'}`);
    console.log(`nationality: ${individual.country_citizenship || director.nationality || 'MISSING'}`);
    
    console.log('\n=== CONTACT DETAILS ===');
    console.log(`currentAddress: ${postalData.address || 'MISSING'}`);
    console.log(`city: ${customer.city || 'MISSING'}`);
    console.log(`district: ${customer.district || 'MISSING'}`);
    console.log(`postalCode: ${postalData.postal_code || 'MISSING'}`);
    console.log(`country: ${postalData.address_country_code || 'MISSING'}`);
    
    console.log('\n=== BANKING DETAILS ===');
    console.log(`accountNumber: ${bankData.actt_no || 'MISSING'}`);
    console.log(`bankName: ${bankData.bank_name || 'MISSING'}`);
    console.log(`branchName: ${bankData.branch || 'MISSING'}`);
    
    console.log('\n=== BUSINESS DETAILS ===');
    console.log(`industry: ${customer.industry || 'MISSING'}`);
    console.log(`business: ${customer.business || 'MISSING'}`);
    console.log(`annualSales: ${customer.annual_sales || 'MISSING'}`);
    console.log(`incorporationCountry: ${customer.incorporation_country || 'MISSING'}`);
    
    console.log('\n=== ID VERIFICATION ===');
    console.log(`cnic: ${customer.cnic || 'MISSING'}`);
    console.log(`idType: ${idData.id_type || 'MISSING'}`);
    console.log(`idNumber: ${idData.id_no || 'MISSING'}`);
    console.log(`idExpiry: ${idData.expiry_date || 'MISSING'}`);
    
    // Check for empty/null values
    console.log('\n🔍 CHECKING FOR EMPTY VALUES:\n');
    
    const allTables = Object.keys(sampleData);
    let totalFields = 0;
    let emptyFields = 0;
    
    for (const table of allTables) {
      const data = sampleData[table];
      if (!data || Object.keys(data).length === 0) continue;
      
      console.log(`--- ${table.toUpperCase()} ---`);
      for (const [field, value] of Object.entries(data)) {
        totalFields++;
        if (value === null || value === '' || value === undefined) {
          console.log(`  ❌ ${field}: EMPTY`);
          emptyFields++;
        } else {
          console.log(`  ✅ ${field}: ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}`);
        }
      }
      console.log('');
    }
    
    console.log(`📊 SUMMARY: ${totalFields - emptyFields}/${totalFields} fields populated (${Math.round((totalFields - emptyFields) / totalFields * 100)}%)`);
    
    if (emptyFields > 0) {
      console.log(`⚠️  ${emptyFields} fields are empty and may cause form auto-fill issues`);
    } else {
      console.log('🎉 All fields are populated - form auto-fill should work perfectly!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

async function main() {
  try {
    await checkFieldMapping();
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { checkFieldMapping };
