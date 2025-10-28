const db = require('../db');

// Complete seed data for all CBS tables based on actual schema
const SEED_DATA = {
  // Main customer records
  cif_customers: [
    {
      customer_id: '1001',
      cnic: '1234567890123',
      status: 'ETB',
      category: 'RETAIL',
      control_branch: '001',
      creation_date: '2024-01-15 10:00:00',
      credting_rating: 'AAA',
      customer_type: 'INDIVIDUAL',
      domicile_country: 'PK',
      domicile_state: 'SINDH',
      fullname: 'Ahmed Ali Khan',
      indicator: 'ACTIVE',
      industry: 'BANKING',
      internal_flag: 'Y',
      profit_center: 'PC001',
      rel_manager: 'RM001',
      resident_flag: 'Y',
      risk_country: 'PK',
      short_name: 'Ahmed Khan',
      table_ind: 'MAIN',
      type_indicator: 'IND',
      class_1: 'PREMIUM',
      class_2: 'GOLD',
      class_4: 'VIP',
      business: 'SERVICES',
      district: 'KARACHI',
      city: 'KARACHI',
      client_no_cmc: 'CMC001',
      ft_rate_category: 'STANDARD',
      reclass: 'N',
      oenace_code: 'OE001',
      reporting: 'MONTHLY',
      stop_sc: 'N',
      client_version: '1.0',
      tax_reg_comp_flag: 'Y',
      incorporation_country: 'PK',
      location: 'KARACHI HEAD OFFICE',
      aminus_b: '0',
      annual_sales: '5000000'
    },
    {
      customer_id: '1002',
      cnic: '2345678901234',
      status: 'ETB',
      category: 'CORPORATE',
      control_branch: '002',
      creation_date: '2024-01-16 11:30:00',
      credting_rating: 'AA',
      customer_type: 'CORPORATE',
      domicile_country: 'PK',
      domicile_state: 'PUNJAB',
      fullname: 'Fatima Enterprises Ltd',
      indicator: 'ACTIVE',
      industry: 'MANUFACTURING',
      internal_flag: 'N',
      profit_center: 'PC002',
      rel_manager: 'RM002',
      resident_flag: 'Y',
      risk_country: 'PK',
      short_name: 'Fatima Ent',
      table_ind: 'MAIN',
      type_indicator: 'CORP',
      class_1: 'STANDARD',
      class_2: 'SILVER',
      class_4: 'REGULAR',
      business: 'MANUFACTURING',
      district: 'LAHORE',
      city: 'LAHORE',
      client_no_cmc: 'CMC002',
      ft_rate_category: 'PREMIUM',
      reclass: 'N',
      oenace_code: 'OE002',
      reporting: 'QUARTERLY',
      stop_sc: 'N',
      client_version: '1.0',
      tax_reg_comp_flag: 'Y',
      incorporation_country: 'PK',
      location: 'LAHORE INDUSTRIAL AREA',
      aminus_b: '0',
      annual_sales: '25000000'
    },
    {
      customer_id: '1003',
      cnic: '3456789012345',
      status: 'ETB',
      category: 'SME',
      control_branch: '003',
      creation_date: '2024-01-17 14:15:00',
      credting_rating: 'BBB',
      customer_type: 'BUSINESS',
      domicile_country: 'PK',
      domicile_state: 'KPK',
      fullname: 'Muhammad Hassan Trading',
      indicator: 'ACTIVE',
      industry: 'TRADING',
      internal_flag: 'Y',
      profit_center: 'PC003',
      rel_manager: 'RM003',
      resident_flag: 'Y',
      risk_country: 'PK',
      short_name: 'Hassan Trading',
      table_ind: 'MAIN',
      type_indicator: 'SME',
      class_1: 'BASIC',
      class_2: 'BRONZE',
      class_4: 'STANDARD',
      business: 'TRADING',
      district: 'PESHAWAR',
      city: 'PESHAWAR',
      client_no_cmc: 'CMC003',
      ft_rate_category: 'BASIC',
      reclass: 'N',
      oenace_code: 'OE003',
      reporting: 'MONTHLY',
      stop_sc: 'N',
      client_version: '1.0',
      tax_reg_comp_flag: 'Y',
      incorporation_country: 'PK',
      location: 'PESHAWAR MAIN BAZAAR',
      aminus_b: '0',
      annual_sales: '1500000'
    }
  ],

  // Customer ID types
  customer_id_type: [
    { customer_id: '1001', position: '1', expiry_date: '2030-12-31 23:59:59', id_no: '1234567890123', id_type: 'CNIC' },
    { customer_id: '1002', position: '1', expiry_date: '2030-12-31 23:59:59', id_no: '2345678901234', id_type: 'CNIC' },
    { customer_id: '1003', position: '1', expiry_date: '2030-12-31 23:59:59', id_no: '3456789012345', id_type: 'CNIC' }
  ],

  // Relationships
  relationship: [
    { customer_id: '1001', position: '1', counter_relation: 'SPOUSE', customer_id_related: null, equity_percentage: '50', related_customer_id: null, relate_customer_name: 'Ayesha Khan', relationship_type: 'FAMILY', rel_version: '1.0' },
    { customer_id: '1002', position: '1', counter_relation: 'DIRECTOR', customer_id_related: null, equity_percentage: '75', related_customer_id: null, relate_customer_name: 'Fatima Ahmed', relationship_type: 'BUSINESS', rel_version: '1.0' },
    { customer_id: '1003', position: '1', counter_relation: 'PARTNER', customer_id_related: null, equity_percentage: '100', related_customer_id: null, relate_customer_name: 'Hassan Brothers', relationship_type: 'BUSINESS', rel_version: '1.0' }
  ],

  // Director details
  dir_details: [
    {
      customer_id: '1001', position: '1', client_no_dir: 'DIR1001', director_name: 'Ahmed Ali Khan',
      address: '123 Main Street, Karachi', ntn: 'NTN1234567', date_appointment: '2020-01-01 00:00:00',
      pg_director: 'Y', estimated_net_worth: '10000000', declared_net_worth: '9500000', assessed_net_worth: '9000000',
      share_pct: '100', nic: '1234567890123', nominee_ind: 'N', father_name: 'Ali Khan', husband_name: '',
      date_exclusion: null, waive_ind: 'N', nationality: 'PK', version: '1.0'
    },
    {
      customer_id: '1002', position: '1', client_no_dir: 'DIR1002', director_name: 'Fatima Ahmed',
      address: '456 Industrial Ave, Lahore', ntn: 'NTN2345678', date_appointment: '2019-03-15 00:00:00',
      pg_director: 'Y', estimated_net_worth: '50000000', declared_net_worth: '48000000', assessed_net_worth: '45000000',
      share_pct: '75', nic: '2345678901234', nominee_ind: 'N', father_name: 'Ahmed Ali', husband_name: 'Tariq Ahmed',
      date_exclusion: null, waive_ind: 'N', nationality: 'PK', version: '1.0'
    },
    {
      customer_id: '1003', position: '1', client_no_dir: 'DIR1003', director_name: 'Muhammad Hassan',
      address: '789 Bazaar Road, Peshawar', ntn: 'NTN3456789', date_appointment: '2021-06-01 00:00:00',
      pg_director: 'Y', estimated_net_worth: '3000000', declared_net_worth: '2800000', assessed_net_worth: '2500000',
      share_pct: '100', nic: '3456789012345', nominee_ind: 'N', father_name: 'Hassan Ali', husband_name: '',
      date_exclusion: null, waive_ind: 'N', nationality: 'PK', version: '1.0'
    }
  ],

  // Client banks
  client_banks: [
    { customer_id: '1001', position: '1', actt_no: 'ACC1001001', bank_name: 'Partner Bank', branch: 'Karachi Main Branch', version: '1.0' },
    { customer_id: '1002', position: '1', actt_no: 'ACC1002001', bank_name: 'Partner Bank', branch: 'Lahore Industrial Branch', version: '1.0' },
    { customer_id: '1003', position: '1', actt_no: 'ACC1003001', bank_name: 'Partner Bank', branch: 'Peshawar Saddar Branch', version: '1.0' }
  ],

  // Postal addresses
  postal: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'HOME', address: '123 Main Street, Block A, Gulshan-e-Iqbal, Karachi',
      address_country_code: 'PK', postal_code: '75300', hold_mail_code: 'N', client_lang: 'EN',
      contact_ref_no: 'POST1001', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'OFFICE', address: '456 Industrial Avenue, Phase II, DHA, Lahore',
      address_country_code: 'PK', postal_code: '54000', hold_mail_code: 'N', client_lang: 'EN',
      contact_ref_no: 'POST1002', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'BUSINESS', address: '789 Bazaar Road, Qissa Khwani, Peshawar',
      address_country_code: 'PK', postal_code: '25000', hold_mail_code: 'N', client_lang: 'UR',
      contact_ref_no: 'POST1003', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    }
  ],

  // Email addresses
  email: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'PRIMARY', address: 'ahmed.khan@email.com',
      client_lang: 'EN', contact_ref_no: 'EMAIL1001', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'BUSINESS', address: 'info@fatima-enterprises.com',
      client_lang: 'EN', contact_ref_no: 'EMAIL1002', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'PERSONAL', address: 'hassan.trading@gmail.com',
      client_lang: 'EN', contact_ref_no: 'EMAIL1003', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    }
  ],

  // Phone numbers
  phone: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'MOBILE', phone_no: '+92-300-1234567',
      client_lang: 'EN', contact_ref_no: 'PHONE1001', dft_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'OFFICE', phone_no: '+92-42-5678901',
      client_lang: 'EN', contact_ref_no: 'PHONE1002', dft_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'BUSINESS', phone_no: '+92-91-2345678',
      client_lang: 'UR', contact_ref_no: 'PHONE1003', dft_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    }
  ],

  // Fax numbers
  fax: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'HOME', fax_no: '+92-21-1234567',
      client_lang: 'EN', contact_ref_no: 'FAX1001', dftl_to_loan_stmt: 'N', dftl_to_rb_stmt: 'N', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'OFFICE', fax_no: '+92-42-5678902',
      client_lang: 'EN', contact_ref_no: 'FAX1002', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'BUSINESS', fax_no: '+92-91-2345679',
      client_lang: 'UR', contact_ref_no: 'FAX1003', dftl_to_loan_stmt: 'N', dftl_to_rb_stmt: 'N', contact_version: '1.0'
    }
  ],

  // SWIFT codes
  swift: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'BANKING', message: 'SWIFT transfer for Ahmed Khan',
      client_lang: 'EN', contact_ref_no: 'SWIFT1001', dftl_to_loan_stmt: 'N', dftl_to_rb_stmt: 'N', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'TRADE', message: 'SWIFT for international trade finance',
      client_lang: 'EN', contact_ref_no: 'SWIFT1002', dftl_to_loan_stmt: 'Y', dftl_to_rb_stmt: 'Y', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'REMITTANCE', message: 'SWIFT for remittance services',
      client_lang: 'EN', contact_ref_no: 'SWIFT1003', dftl_to_loan_stmt: 'N', dftl_to_rb_stmt: 'N', contact_version: '1.0'
    }
  ],

  // Collection info
  collect: [
    {
      customer_id: '1001', position: '1', contact_sub_type: 'STATEMENT', remarks: 'Monthly statement collection', contact_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', contact_sub_type: 'DOCUMENTS', remarks: 'Trade document collection', contact_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', contact_sub_type: 'CHEQUES', remarks: 'Cheque collection service', contact_version: '1.0'
    }
  ],

  // Individual info
  individual_info: [
    {
      customer_id: '1001', position: '1', country_citizenship: 'PK', country_of_birth: 'PK', date_of_birth: '1985-03-15',
      given_name1: 'Ahmed', given_name2: 'Ali', given_name3: '', surname: 'Khan', maritial_status: 'MARRIED',
      sex: 'M', resident_status: 'RESIDENT', maiden_name: '', title: 'Mr', palce_of_birth: 'Karachi',
      surname_first: 'N', occupation_code: 'BANKER', father_husband_name: 'Ali Khan', indvl_version: '1.0'
    },
    {
      customer_id: '1002', position: '1', country_citizenship: 'PK', country_of_birth: 'PK', date_of_birth: '1978-07-22',
      given_name1: 'Fatima', given_name2: '', given_name3: '', surname: 'Ahmed', maritial_status: 'MARRIED',
      sex: 'F', resident_status: 'RESIDENT', maiden_name: 'Fatima Ali', title: 'Ms', palce_of_birth: 'Lahore',
      surname_first: 'N', occupation_code: 'BUSINESS', father_husband_name: 'Ahmed Ali', indvl_version: '1.0'
    },
    {
      customer_id: '1003', position: '1', country_citizenship: 'PK', country_of_birth: 'PK', date_of_birth: '1990-11-08',
      given_name1: 'Muhammad', given_name2: 'Hassan', given_name3: '', surname: 'Ali', maritial_status: 'SINGLE',
      sex: 'M', resident_status: 'RESIDENT', maiden_name: '', title: 'Mr', palce_of_birth: 'Peshawar',
      surname_first: 'N', occupation_code: 'TRADER', father_husband_name: 'Hassan Ali', indvl_version: '1.0'
    }
  ]
};

async function clearExistingData() {
  const tables = Object.keys(SEED_DATA);
  console.log('🧹 Clearing existing data...');
  
  for (const table of tables) {
    try {
      await db.query(`TRUNCATE TABLE ${table} CASCADE`);
      console.log(`  ✅ Cleared ${table}`);
    } catch (error) {
      console.log(`  ⚠️  Could not clear ${table}: ${error.message}`);
    }
  }
}

async function insertData(table, records) {
  if (!records || records.length === 0) return;
  
  const columns = Object.keys(records[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnList = columns.join(', ');
  
  console.log(`📝 Inserting ${records.length} records into ${table}...`);
  
  for (const record of records) {
    try {
      const values = columns.map(col => record[col]);
      const sql = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`;
      await db.query(sql, values);
    } catch (error) {
      console.log(`  ⚠️  Error inserting into ${table}: ${error.message}`);
    }
  }
  
  console.log(`  ✅ Completed ${table}`);
}

async function seedAllTables() {
  try {
    console.log('🌱 Starting comprehensive CBS database seeding...\n');
    
    // Clear existing data first
    await clearExistingData();
    console.log('');
    
    // Insert data in dependency order
    const insertOrder = [
      'cif_customers',      // Main table first
      'customer_id_type',   // Customer-dependent tables
      'relationship',
      'dir_details', 
      'client_banks',
      'postal',
      'email',
      'phone',
      'fax',
      'swift',
      'collect',
      'individual_info'
    ];
    
    for (const table of insertOrder) {
      if (SEED_DATA[table]) {
        await insertData(table, SEED_DATA[table]);
      }
    }
    
    console.log('\n🎉 Comprehensive CBS seeding completed successfully!');
    
    // Verify the data
    console.log('\n📊 Verification summary:');
    for (const table of insertOrder) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`  ${table}: Error counting - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedAllTables();
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

module.exports = { seedAllTables };
