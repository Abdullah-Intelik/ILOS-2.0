const db = require('../db');

// Default values per column (snake_case)
const DEFAULTS = {
  // main CIF
  category: `'I'`,
  control_branch: `'001'`,
  creation_date: `NOW()` ,
  credting_rating: `'A'`,
  customer_group: `'GEN'`,
  customer_type: `'INDIVIDUAL'`,
  domicile_country: `'PK'`,
  domicile_state: `'SD'`,
  indicator: `'N'`,
  industry: `'GEN'`,
  internal_flag: `'N'`,
  profit_center: `'000'`,
  rel_manager: `'AUTO'`,
  resident_flag: `'Y'`,
  risk_country: `'PK'`,
  short_name: `'N/A'`,
  status: `'NTB'`,
  table_ind: `'CIF'`,
  type_indicator: `'I'`,
  class_1: `'01'`,
  class_2: `'01'`,
  class_4: `'01'`,
  business: `'GENERAL'`,
  district: `'KHI'`,
  city: `'Karachi'`,
  client_no_cmc: `'N'`,
  ft_rate_category: `'STD'`,
  reclass: `'N'`,
  oenace_code: `'0000'`,
  reporting: `'Y'`,
  stop_sc: `'N'`,
  client_version: `'1'`,
  tax_reg_comp_flag: `'N'`,
  incorporation_country: `'PK'`,
  location: `'PK'`,
  aminus_b: `'N'`,
  annual_sales: `'0'`,
  // customer_id_type
  position: `'1'`,
  expiry_date: `DATE '2030-12-31'`,
  id_no: `'0000000000000'`,
  id_type: `'CNIC'`,
  // relationship
  counter_relation: `'N/A'`,
  equity_percentage: `'0'`,
  related_customer_id: `NULL`,
  relate_customer_name: `''`,
  relationship_type: `'FAMILY'`,
  rel_version: `'1'`,
  // dir_details
  client_no_dir: `'N/A'`,
  director_name: `'N/A'`,
  address: `'N/A'`,
  ntn: `'N/A'`,
  date_appointment: `DATE '2020-01-01'`,
  pg_director: `'N'`,
  estimated_net_worth: `'0'`,
  declared_net_worth: `'0'`,
  assessed_net_worth: `'0'`,
  share_pct: `'0'`,
  nic: `'0000000000000'`,
  nominee_ind: `'N'`,
  father_name: `''`,
  husband_name: `''`,
  date_exclusion: `NULL`,
  waive_ind: `'N'`,
  nationality: `'PK'`,
  version: `'1'`,
  // client_banks
  actt_no: `'ACC-0000'`,
  bank_name: `'UBL'`,
  branch: `'001'`,
  // postal/email/phone/fax/swift/collect
  contact_sub_type: `'GEN'`,
  address_country_code: `'PK'`,
  postal_code: `'00000'`,
  hold_mail_code: `'N'`,
  client_lang: `'EN'`,
  contact_ref_no: `'N/A'`,
  dftl_to_loan_stmt: `'N'`,
  dftl_to_rb_stmt: `'N'`,
  contact_version: `'1'`,
  phone_no: `'+92-300-0000000'`,
  fax_no: `''`,
  message: `''`,
  remarks: `''`,
  // individual_info
  country_citizenship: `'PK'`,
  country_of_birth: `'PK'`,
  date_of_birth: `DATE '1990-01-01'`,
  given_name1: `'N/A'`,
  given_name2: `''`,
  given_name3: `''`,
  surname: `'N/A'`,
  maritial_status: `'SINGLE'`,
  sex: `'M'`,
  resident_status: `'RESIDENT'`,
  maiden_name: `''`,
  title: `''`,
  palce_of_birth: `'Karachi'`,
  surname_first: `'N'`,
  occupation_code: `'GEN'`,
  father_husband_name: `''`,
  indvl_version: `'1'`
};

const TARGET_TABLES = [
  'cif_customers','customer_id_type','relationship','dir_details','client_banks',
  'postal','email','phone','fax','swift','collect','individual_info'
];

async function getTableColumns(table) {
  const q = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`;
  const res = await db.query(q, [table]);
  return res.rows.map(r => r.column_name);
}

async function backfill(table) {
  // Skip if table not exists
  const existsQ = `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`;
  const ex = await db.query(existsQ, [table]);
  if (ex.rowCount === 0) return { table, skipped: true };

  const cols = await getTableColumns(table);
  const setParts = [];
  for (const c of cols) {
    if (DEFAULTS[c] !== undefined) {
      // COALESCE(NULLIF(col, ''), default)
      setParts.push(`${c} = COALESCE(NULLIF(${c}, ''), ${DEFAULTS[c]})`);
    }
  }
  if (!setParts.length) return { table, updated: 0 };
  const sql = `UPDATE ${table} SET ${setParts.join(', ')}`;
  const res = await db.query(sql);
  return { table, updated: res.rowCount || 0 };
}

async function main() {
  const results = [];
  for (const t of TARGET_TABLES) {
    const r = await backfill(t).catch(e => ({ table: t, error: e.message }));
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
  await db.end();
}

main().catch(async (e) => {
  console.error('Fill-missing failed:', e.message);
  try { await db.end(); } catch (_) {}
  process.exit(1);
});


