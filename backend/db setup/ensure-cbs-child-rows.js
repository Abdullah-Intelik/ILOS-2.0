const db = require('../db');

const CHILD_TABLES = [
  'customer_id_type','relationship','dir_details','client_banks',
  'postal','email','phone','fax','swift','collect','individual_info'
];

const DEFAULT_ROW = (custId, cnic = '0000000000000', fullname = 'N/A') => ({
  // common
  customer_id: custId,
  position: '1',
  // id type
  expiry_date: `DATE '2030-12-31'`,
  id_no: cnic,
  id_type: 'CNIC',
  // relationship
  counter_relation: 'N/A',
  equity_percentage: '0',
  related_customer_id: null,
  relate_customer_name: '',
  relationship_type: 'FAMILY',
  rel_version: '1',
  // dir_details
  client_no_dir: `D${custId}`,
  director_name: fullname,
  address: 'Address',
  ntn: 'NTN000',
  date_appointment: `DATE '2020-01-01'`,
  pg_director: 'N',
  estimated_net_worth: '0',
  declared_net_worth: '0',
  assessed_net_worth: '0',
  share_pct: '0',
  nic: cnic,
  nominee_ind: 'N',
  father_name: '',
  husband_name: '',
  date_exclusion: null,
  waive_ind: 'N',
  nationality: 'PK',
  version: '1',
  // client_banks
  actt_no: `ACC-${custId}`,
  bank_name: 'UBL',
  branch: '001',
  // contact tables
  contact_sub_type: 'GEN',
  address_country_code: 'PK',
  postal_code: '00000',
  hold_mail_code: 'N',
  client_lang: 'EN',
  contact_ref_no: `REF-${custId}`,
  dftl_to_loan_stmt: 'N',
  dftl_to_rb_stmt: 'N',
  contact_version: '1',
  phone_no: '+92-300-0000000',
  fax_no: '',
  message: '',
  remarks: '',
  // individual_info
  country_citizenship: 'PK',
  country_of_birth: 'PK',
  date_of_birth: `DATE '1990-01-01'`,
  given_name1: fullname.split(' ')[0] || 'N/A',
  given_name2: '',
  given_name3: '',
  surname: (fullname.split(' ')[1] || fullname || 'N/A'),
  maritial_status: 'SINGLE',
  sex: 'M',
  resident_status: 'RESIDENT',
  maiden_name: '',
  title: '',
  palce_of_birth: 'Karachi',
  surname_first: 'N',
  occupation_code: 'GEN',
  father_husband_name: ''
});

async function getColumns(table) {
  const q = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`;
  const res = await db.query(q, [table]);
  return new Set(res.rows.map(r => r.column_name));
}

async function insertIfMissing(table, row) {
  const cols = await getColumns(table);
  if (!cols.has('customer_id')) return; // can't key on customer_id
  const fields = Object.keys(row).filter(k => cols.has(k));
  const values = fields.map((_, i) => `$${i + 1}`);
  const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${values.join(',')}) ON CONFLICT (customer_id) DO NOTHING`;
  await db.query(sql, fields.map(f => row[f] === null ? null : row[f]));
}

async function ensureAll() {
  const res = await db.query(`SELECT customer_id, cnic, COALESCE(fullname,'N/A') AS fullname FROM cif_customers ORDER BY customer_id`);
  for (const r of res.rows) {
    const row = DEFAULT_ROW(r.customer_id, r.cnic || '0000000000000', r.fullname);
    for (const t of CHILD_TABLES) {
      await insertIfMissing(t, row).catch(()=>{});
    }
  }
}

async function main() {
  await ensureAll();
  console.log('Ensured child rows for all CIF customers.');
  await db.end();
}

main().catch(async (e) => {
  console.error('ensure-cbs-child-rows failed:', e.message);
  try { await db.end(); } catch (_) {}
  process.exit(1);
});


