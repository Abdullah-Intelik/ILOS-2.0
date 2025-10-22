const db = require('../db');

function toSnakeCase(s) {
  return String(s || '')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

const mainFields = [
  'category','controlBranch','creationDate','credtingRating','customerGroup','customerId','customerType','domicileCountry','domicileState','fullname','indicator','industry','internalFlag','profitCenter','relManager','residentFlag','riskCountry','shortName','status','tableInd','typeIndicator','class_1','class_2','class_4','business','district','city','clientNoCmc','ftRateCategory','reclass','oenaceCode','reporting','stopSc','clientVersion','taxRegCompFlag','incorporationCountry','location','aminusB','annualSales'
];

const childTables = {
  customer_id_type: ['customerId','position','expiryDate','idNo','idType'],
  relationship: ['customerId','position','counterRelation','customerId','equityPercentage','relatedCustomerId','relateCustomerName','relationshipType','relVersion'],
  dir_details: ['customerId','position','clientNoDir','directorName','address','ntn','dateAppointment','pgDirector','estimatedNetWorth','declaredNetWorth','assessedNetWorth','sharePct','nic','nomineeInd','fatherName','husbandName','dateExclusion','waiveInd','nationality','version'],
  client_banks: ['customerId','position','acttNo','bankName','branch','version'],
  postal: ['customerId','position','contactSubType','address','addressCountryCode','postalCode','holdMailCode','clientLang','contactRefNo','dftlToLoanStmt','dftlToRbStmt','contactVersion'],
  email: ['customerId','position','contactSubType','address','clientLang','contactRefNo','dftlToLoanStmt','dftlToRbStmt','contactVersion'],
  phone: ['customerId','position','contactSubType','phoneNo','clientLang','contactRefNo','dftlToLoanStmt','dftlToRbStmt','contactVersion'],
  fax: ['customerId','position','contactSubType','faxNo','clientLang','contactRefNo','dftlToLoanStmt','dftlToRbStmt','contactVersion'],
  swift: ['customerId','position','contactSubType','message','clientLang','contactRefNo','dftlToLoanStmt','dftlToRbStmt','contactVersion'],
  collect: ['customerId','position','contactSubType','remarks','contactVersion'],
  individual_info: ['customerId','position','countryCitizenship','countryOfBirth','dateOfBirth','givenName1','givenName2','givenName3','surname','maritialStatus','sex','residentStatus','maidenName','title','palceOfBirth','surnameFirst','occupationCode','fatherHusbandName','indvlVersion'],
};

async function getColumns(tableName) {
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `;
  const res = await db.query(q, [tableName]);
  return res.rows.map(r => r.column_name);
}

async function tableExists(tableName) {
  const q = `
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1
  `;
  const res = await db.query(q, [tableName]);
  return res.rowCount > 0;
}

async function main() {
  const report = {};

  // Main table
  const mainTable = 'cif_customers';
  report[mainTable] = { exists: false, missing: [], present: [] };
  if (await tableExists(mainTable)) {
    report[mainTable].exists = true;
    const cols = new Set(await getColumns(mainTable));
    for (const f of mainFields) {
      const snake = toSnakeCase(f);
      if (cols.has(snake)) report[mainTable].present.push(snake);
      else report[mainTable].missing.push(snake);
    }
  }

  // Child tables
  for (const [table, fields] of Object.entries(childTables)) {
    report[table] = { exists: false, missing: [], present: [] };
    if (await tableExists(table)) {
      report[table].exists = true;
      const cols = new Set(await getColumns(table));
      for (const f of fields) {
        const snake = toSnakeCase(f);
        if (cols.has(snake)) report[table].present.push(snake);
        else report[table].missing.push(snake);
      }
    }
  }

  console.log(JSON.stringify(report, null, 2));
  await db.end();
}

main().catch(async (e) => {
  console.error('Schema check failed:', e.message);
  try { await db.end(); } catch (_) {}
  process.exit(1);
});



