const db = require('../db');

async function getTableColumns(tableName) {
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `;
  try {
    const res = await db.query(q, [tableName]);
    return new Set(res.rows.map(r => r.column_name));
  } catch (_) {
    return new Set();
  }
}

function toSnakeCase(s) {
  return String(s || '')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

async function insertDynamic(table, desiredRow) {
  const cols = await getTableColumns(table);
  if (!cols.size) return; // table likely doesn't exist in this schema
  // Map input keys to existing snake_case columns
  const mapped = {};
  for (const [k, v] of Object.entries(desiredRow)) {
    const snake = toSnakeCase(k);
    if (cols.has(snake)) mapped[snake] = v;
  }
  if (!Object.keys(mapped).length) return;

  const fields = Object.keys(mapped);
  const params = fields.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${params}) ON CONFLICT DO NOTHING`;
  await db.query(sql, fields.map(f => mapped[f]));
}

async function seed() {
  const rows = [
    {
      customerId: '200001', cnic: '3520111111111', fullname: 'Ahsan Khan', status: 'NTB',
      category: 'I', control_branch: '001', creation_date: new Date(), credting_rating: 'A',
      customer_type: 'INDIVIDUAL', domicile_country: 'PK', domicile_state: 'SD', indicator: 'N',
      industry: 'GEN', internal_flag: 'N', profit_center: '000', rel_manager: 'AUTO', resident_flag: 'Y',
      risk_country: 'PK', short_name: 'Ahsan K', table_ind: 'CIF', type_indicator: 'I', class_1: '01',
      class_2: '01', class_4: '01', business: 'GENERAL', district: 'KHI', city: 'Karachi', client_no_cmc: 'N',
      ft_rate_category: 'STD', reclass: 'N', oenace_code: '0000', reporting: 'Y', stop_sc: 'N', client_version: '1',
      tax_reg_comp_flag: 'N', incorporation_country: 'PK', location: 'PK', aminus_b: 'N', annual_sales: '0'
    },
    {
      customerId: '200002', cnic: '3520222222222', fullname: 'Sara Ahmed', status: 'NTB',
      category: 'I', control_branch: '003', creation_date: new Date(), credting_rating: 'B',
      customer_type: 'INDIVIDUAL', domicile_country: 'PK', domicile_state: 'PB', indicator: 'N',
      industry: 'SERV', internal_flag: 'N', profit_center: '010', rel_manager: 'AUTO', resident_flag: 'Y',
      risk_country: 'PK', short_name: 'Sara A', table_ind: 'CIF', type_indicator: 'I', class_1: '01',
      class_2: '01', class_4: '01', business: 'SERVICES', district: 'LHR', city: 'Lahore', client_no_cmc: 'N',
      ft_rate_category: 'STD', reclass: 'N', oenace_code: '1234', reporting: 'Y', stop_sc: 'N', client_version: '1',
      tax_reg_comp_flag: 'N', incorporation_country: 'PK', location: 'PK', aminus_b: 'N', annual_sales: '0'
    },
    {
      customerId: '200003', cnic: '3520333333333', fullname: 'Alpha Traders Pvt Ltd', status: 'ETB',
      category: 'C', control_branch: '005', creation_date: new Date(), credting_rating: 'A',
      customer_type: 'CORPORATE', domicile_country: 'PK', domicile_state: 'SD', indicator: 'N',
      industry: 'TRD', internal_flag: 'N', profit_center: '020', rel_manager: 'AUTO', resident_flag: 'Y',
      risk_country: 'PK', short_name: 'Alpha Traders', table_ind: 'CIF', type_indicator: 'C', class_1: '02',
      class_2: '02', class_4: '02', business: 'TRADING', district: 'KHI', city: 'Karachi', client_no_cmc: 'N',
      ft_rate_category: 'STD', reclass: 'N', oenace_code: '5678', reporting: 'Y', stop_sc: 'N', client_version: '1',
      tax_reg_comp_flag: 'Y', incorporation_country: 'PK', location: 'PK', aminus_b: 'N', annual_sales: '5000000'
    }
  ];

  const fields = [
    'customer_id','cnic','fullname','status','category','control_branch','creation_date','credting_rating',
    'customer_type','domicile_country','domicile_state','indicator','industry','internal_flag','profit_center',
    'rel_manager','resident_flag','risk_country','short_name','table_ind','type_indicator','class_1','class_2',
    'class_4','business','district','city','client_no_cmc','ft_rate_category','reclass','oenace_code','reporting',
    'stop_sc','client_version','tax_reg_comp_flag','incorporation_country','location','aminus_b','annual_sales'
  ];

  const params = fields.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
    INSERT INTO cif_customers (${fields.join(',')})
    VALUES (${params})
    ON CONFLICT (customer_id) DO UPDATE SET
      fullname = EXCLUDED.fullname,
      status = EXCLUDED.status,
      credting_rating = EXCLUDED.credting_rating,
      short_name = EXCLUDED.short_name
  `;

  for (const r of rows) {
    const values = fields.map(f => {
      if (f === 'customer_id') return r.customerId;
      return r[f] ?? null;
    });
    await db.query(sql, values);

    // Seed child tables minimally if present in schema
    await insertDynamic('customer_id_type', {
      customerId: r.customerId, position: '1', expiryDate: '2030-12-31', idNo: r.cnic, idType: 'CNIC'
    });
    await insertDynamic('relationship', {
      customerId: r.customerId, position: '1', counterRelation: 'SPOUSE', equityPercentage: '0', relatedCustomerId: null,
      relateCustomerName: null, relationshipType: 'FAMILY', relVersion: '1'
    });
    await insertDynamic('dir_details', {
      customerId: r.customerId, position: '1', clientNoDir: 'D' + r.customerId, directorName: r.fullname,
      address: 'Address', ntn: 'NTN000', dateAppointment: '2020-01-01', pgDirector: 'N', estimatedNetWorth: '0',
      declaredNetWorth: '0', assessedNetWorth: '0', sharePct: '0', nic: r.cnic, nomineeInd: 'N', fatherName: '',
      husbandName: '', dateExclusion: null, waiveInd: 'N', nationality: 'PK', version: '1'
    });
    await insertDynamic('client_banks', {
      customerId: r.customerId, position: '1', acttNo: 'ACC-' + r.customerId, bankName: 'UBL', branch: '001', version: '1'
    });
    await insertDynamic('postal', {
      customerId: r.customerId, position: '1', contactSubType: 'HOME', address: 'Test Street 1', addressCountryCode: 'PK',
      postalCode: '00000', holdMailCode: 'N', clientLang: 'EN', contactRefNo: 'P-' + r.customerId,
      dftlToLoanStmt: 'N', dftlToRbStmt: 'N', contactVersion: '1'
    });
    await insertDynamic('email', {
      customerId: r.customerId, position: '1', contactSubType: 'PRIMARY', address: 'test@example.com', clientLang: 'EN',
      contactRefNo: 'E-' + r.customerId, dftlToLoanStmt: 'N', dftlToRbStmt: 'N', contactVersion: '1'
    });
    await insertDynamic('phone', {
      customerId: r.customerId, position: '1', contactSubType: 'MOBILE', phoneNo: '+92-300-0000000', clientLang: 'EN',
      contactRefNo: 'T-' + r.customerId, dftlToLoanStmt: 'N', dftlToRbStmt: 'N', contactVersion: '1'
    });
    await insertDynamic('fax', {
      customerId: r.customerId, position: '1', contactSubType: 'HOME', faxNo: '', clientLang: 'EN', contactRefNo: 'F-' + r.customerId,
      dftlToLoanStmt: 'N', dftlToRbStmt: 'N', contactVersion: '1'
    });
    await insertDynamic('swift', {
      customerId: r.customerId, position: '1', contactSubType: 'GEN', message: '', clientLang: 'EN', contactRefNo: 'S-' + r.customerId,
      dftlToLoanStmt: 'N', dftlToRbStmt: 'N', contactVersion: '1'
    });
    await insertDynamic('collect', {
      customerId: r.customerId, position: '1', contactSubType: 'GEN', remarks: 'N/A', contactVersion: '1'
    });
    await insertDynamic('individual_info', {
      customerId: r.customerId, position: '1', countryCitizenship: 'PK', countryOfBirth: 'PK', dateOfBirth: '1990-01-01',
      givenName1: r.fullname.split(' ')[0], givenName2: '', givenName3: '', surname: (r.fullname.split(' ')[1] || r.fullname),
      maritialStatus: 'SINGLE', sex: 'M', residentStatus: 'RESIDENT', maidenName: '', title: '', palceOfBirth: 'Karachi',
      surnameFirst: 'N', occupationCode: 'GEN', fatherHusbandName: '', indvlVersion: '1'
    });
  }
  console.log('Seeded cif_customers and related child tables (best-effort).');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });


