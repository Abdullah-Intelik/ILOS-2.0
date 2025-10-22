const fs = require('fs');
const path = require('path');
const readline = require('readline');
const XLSX = require('xlsx');
const db = require('../db');
const { EXCEL_STORE } = require('../excel_files/config');

function normalizeCnic(raw) {
  return String(raw || '').replace(/\D/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateSequentialCustomerId(startAt = 110000) {
  try {
    const res = await db.query(
      "SELECT customer_id FROM cif_customers WHERE customer_id ~ '^[0-9]+$' ORDER BY (customer_id)::bigint DESC LIMIT 1"
    );
    if (res.rows.length > 0) {
      const last = parseInt(res.rows[0].customer_id, 10);
      const base = Number.isFinite(last) ? last : startAt;
      return String(base + 1);
    }
    return String(startAt + 1);
  } catch (_) {
    // Fallback if table not ready or query fails
    return String(startAt + Math.floor(Math.random() * 1000) + 1);
  }
}

function ensureWorkbook(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      return XLSX.readFile(filePath, { cellDates: true });
    } catch (e) {
      // If file is corrupted or unreadable, recreate a new workbook
      const wb = XLSX.utils.book_new();
      XLSX.writeFile(wb, filePath);
      return wb;
    }
  }
  const wb = XLSX.utils.book_new();
  XLSX.writeFile(wb, filePath);
  return wb;
}

function appendRowToExcel(fileName, rowObject) {
  const filePath = path.join(EXCEL_STORE, fileName);
  const wb = ensureWorkbook(filePath);
  const sheetName = wb.SheetNames[0] || 'Sheet1';
  let ws = wb.Sheets[sheetName];

  if (!ws) {
    // Create sheet with header from rowObject keys
    ws = XLSX.utils.json_to_sheet([rowObject], { skipHeader: false });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  } else {
    // Convert existing sheet to JSON, append, and recreate sheet
    const existing = XLSX.utils.sheet_to_json(ws, { defval: '' });
    existing.push(rowObject);
    const newWs = XLSX.utils.json_to_sheet(existing, { skipHeader: false });
    wb.Sheets[sheetName] = newWs;
  }

  try {
    XLSX.writeFile(wb, filePath);
  } catch (err) {
    if (err && (err.code === 'EBUSY' || err.code === 'EPERM')) {
      enqueuePendingRow(fileName, rowObject);
      console.warn(`⚠️ Excel file locked (${fileName}). Queued the row to write later. Close the file and rerun the tool.`);
      return;
    }
    throw err;
  }
}

function readSheetHeadersExact(filePath) {
  const wb = ensureWorkbook(filePath);
  const sheetName = wb.SheetNames[0] || 'Sheet1';
  let ws = wb.Sheets[sheetName];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerRow = rows[0] || [];
  return headerRow.map((h) => String(h));
}

function normalizeHeaderKeyForMatch(h) {
  return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function randomString(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomPhone() {
  return '+92-' + (300 + Math.floor(Math.random() * 600)) + '-' + (1000000 + Math.floor(Math.random() * 8999999));
}

function randomPassport() {
  return randomString(1) + randomString(7);
}

function randomDateISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildRowForHeaders(headers, cnic, fullName, label) {
  const row = {};
  for (const h of headers) {
    const key = normalizeHeaderKeyForMatch(h);
    if (!key) { row[h] = ''; continue; }
    if (key.includes('idnumber')) { row[h] = cnic; continue; }
    if (key === 'cnic' || key.endsWith('cnic')) { row[h] = cnic; continue; }
    if (key.includes('idtype')) { row[h] = 'CNIC'; continue; }
    if (key === 'fullname' || key === 'name' || key.endsWith('name')) { row[h] = fullName; continue; }
    if (key.includes('reason') || key.includes('remarks')) { row[h] = label ? `Manual ${label}` : 'Manual'; continue; }
    if (key.includes('source')) { row[h] = 'data_insertion_tool'; continue; }
    if (key.includes('update') || key.includes('added') || key.includes('date')) { row[h] = randomDateISO(); continue; }
    if (key.includes('phone')) { row[h] = randomPhone(); continue; }
    if (key.includes('passport')) { row[h] = randomPassport(); continue; }
    if (key.includes('country')) { row[h] = 'Pakistan'; continue; }
    if (key.includes('city')) { row[h] = 'Karachi'; continue; }
    if (key.includes('address')) { row[h] = 'Test Street 123'; continue; }
    if (key.includes('letter')) { row[h] = 'LR-' + Math.floor(1000 + Math.random() * 9000); continue; }
    if (key.includes('reference') || key.includes('ref')) { row[h] = 'Ref-' + randomString(5); continue; }
    // default
    row[h] = '';
  }
  return row;
}

function appendRowToExcelMapped(fileName, cnic, fullName, label) {
  const filePath = path.join(EXCEL_STORE, fileName);
  const headers = readSheetHeadersExact(filePath);
  if (!headers.length) {
    // fallback to simple append with minimal keys
    const minimal = fileName === 'sbp_blacklist.xlsx'
      ? { s_no: '', CNIC: cnic, Customer_Name: fullName, FullName: fullName, Source: 'data_insertion_tool', Added_At: new Date().toISOString() }
      : { CNIC: cnic, FullName: fullName, Source: 'data_insertion_tool', Added_At: new Date().toISOString() };
    return appendRowToExcel(fileName, minimal);
  }
  const rowObject = buildRowForHeaders(headers, cnic, fullName, label);
  return appendRowToExcel(fileName, rowObject);
}

function enqueuePendingRow(fileName, rowObject) {
  try {
    const queuePath = path.join(EXCEL_STORE, `${fileName}.queue.json`);
    let existing = [];
    if (fs.existsSync(queuePath)) {
      try { existing = JSON.parse(fs.readFileSync(queuePath, 'utf8') || '[]'); } catch (_) { existing = []; }
    }
    existing.push(rowObject);
    fs.writeFileSync(queuePath, JSON.stringify(existing, null, 2), 'utf8');
  } catch (_) {}
}

function listQueueFiles() {
  try {
    const entries = fs.readdirSync(EXCEL_STORE, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.queue.json'))
      .map((e) => e.name);
  } catch (_) {
    return [];
  }
}

async function flushQueues() {
  const queues = listQueueFiles();
  for (const q of queues) {
    const targetFile = q.replace(/\.queue\.json$/, '');
    const queuePath = path.join(EXCEL_STORE, q);
    let items = [];
    try { items = JSON.parse(fs.readFileSync(queuePath, 'utf8') || '[]'); } catch (_) { items = []; }
    if (!items.length) {
      try { fs.unlinkSync(queuePath); } catch (_) {}
      continue;
    }
    try {
      for (const row of items) appendRowToExcel(targetFile, row);
      // if no exception was thrown above, clear queue
      try { fs.unlinkSync(queuePath); } catch (_) {}
      console.log(`✅ Flushed ${items.length} queued row(s) into ${targetFile}`);
    } catch (err) {
      if (err && (err.code === 'EBUSY' || err.code === 'EPERM')) {
        console.warn(`⏳ Still locked: ${targetFile}. Keep queue for later.`);
      } else {
        console.warn(`⚠️ Failed flushing queue for ${targetFile}: ${err.message}`);
      }
    }
  }
}

async function getTableColumns(tableName) {
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `;
  const res = await db.query(q, [tableName]);
  return res.rows.map(r => r.column_name);
}

async function getColumnTypes(tableName) {
  const q = `
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = $1
  `;
  const res = await db.query(q, [tableName]);
  const map = new Map();
  for (const row of res.rows) map.set(row.column_name, { type: row.data_type, maxLen: row.character_maximum_length });
  return map;
}

async function upsertCifCustomer(minimalData) {
  const table = 'cif_customers';
  const availableCols = await getTableColumns(table);
  const colTypes = await getColumnTypes(table);

  // Default data to "generate remaining data" for testing
  const defaults = {
    category: 'I',
    control_branch: '001',
    creation_date: new Date(),
    credting_rating: 'A',
    customer_type: 'INDIVIDUAL',
    domicile_country: 'PK',
    domicile_state: 'SD',
    indicator: 'N',
    industry: 'GEN',
    internal_flag: 'N',
    profit_center: '000',
    rel_manager: 'AUTO',
    resident_flag: 'Y',
    risk_country: 'PK',
    short_name: (minimalData.fullname || '').split(' ').slice(0, 2).join(' '),
    status: minimalData.status || 'NTB',
    table_ind: 'CIF',
    type_indicator: 'I',
    class_1: '01',
    class_2: '01',
    class_4: '01',
    business: 'GENERAL',
    district: 'KHI',
    city: 'Karachi',
    client_no_cmc: 'N',
    ft_rate_category: 'STD',
    reclass: 'N',
    oenace_code: '0000',
    reporting: 'Y',
    stop_sc: 'N',
    client_version: '1',
    tax_reg_comp_flag: 'N',
    incorporation_country: 'PK',
    location: 'PK',
    aminus_b: 'N',
    annual_sales: '0'
  };

  const data = { ...defaults, ...minimalData };

  // Build field list that actually exists in table
  const desiredKeys = [
    'customer_id', 'cnic', 'fullname', 'status',
    'category', 'control_branch', 'creation_date', 'credting_rating',
    'customer_type', 'domicile_country', 'domicile_state', 'indicator',
    'industry', 'internal_flag', 'profit_center', 'rel_manager', 'resident_flag',
    'risk_country', 'short_name', 'table_ind', 'type_indicator', 'class_1',
    'class_2', 'class_4', 'business', 'district', 'city', 'client_no_cmc',
    'ft_rate_category', 'reclass', 'oenace_code', 'reporting', 'stop_sc',
    'client_version', 'tax_reg_comp_flag', 'incorporation_country', 'location',
    'aminus_b', 'annual_sales'
  ];

  const fields = desiredKeys.filter(k => availableCols.includes(k));
  if (!fields.includes('customer_id')) {
    throw new Error('cif_customers table must contain customer_id column');
  }

  const values = fields.map(k => data[k]);
  // Enforce varchar max lengths and build param casts
  for (let idx = 0; idx < fields.length; idx++) {
    const k = fields[idx];
    const meta = colTypes.get(k) || {};
    if ((meta.type || '').includes('character varying') && meta.maxLen && data[k] != null) {
      const s = String(data[k]);
      if (s.length > meta.maxLen) data[k] = s.slice(0, meta.maxLen);
    }
  }

  const params = fields.map((k, i) => {
    const meta = colTypes.get(k) || {};
    const t = meta.type || '';
    if (t.includes('timestamp')) return `$${i + 1}::timestamp`;
    if (t.includes('integer')) return `$${i + 1}::integer`;
    if (t.includes('numeric')) return `$${i + 1}::numeric`;
    if (t.includes('boolean')) return `$${i + 1}::boolean`;
    return `$${i + 1}`;
  }).join(', ');

  // If CNIC already exists, update that row instead of inserting a new one
  const existing = await db.query(`SELECT customer_id FROM ${table} WHERE cnic = $1`, [data.cnic]);
  if (existing.rows.length > 0) {
    const existingCustomerId = existing.rows[0].customer_id;
    const updatable = fields.filter(k => k !== 'customer_id' && k !== 'cnic');
    const updateValues = updatable.map(k => data[k]);
    const updateParams = updatable.map((k, i) => {
      const meta = colTypes.get(k) || {};
      const t = meta.type || '';
      if (t.includes('timestamp')) return `$${i + 1}::timestamp`;
      if (t.includes('integer')) return `$${i + 1}::integer`;
      if (t.includes('numeric')) return `$${i + 1}::numeric`;
      if (t.includes('boolean')) return `$${i + 1}::boolean`;
      return `$${i + 1}`;
    }).join(', ');
    const sql = `
      UPDATE ${table}
      SET ${updatable.map((k, i) => `${k} = ${updateParams.split(', ')[i]}`).join(', ')}
      WHERE customer_id = $${updatable.length + 1}
      RETURNING customer_id
    `;
    const res = await db.query(sql, [...updateValues, existingCustomerId]);
    return res.rows[0].customer_id;
  }

  // Insert new; if CNIC conflicts, update existing row (excluding customer_id)
  const updateSet = fields
    .filter(k => k !== 'customer_id')
    .map((k) => `${k} = EXCLUDED.${k}`)
    .join(', ');

  const sql = `
    INSERT INTO ${table} (${fields.join(', ')})
    VALUES (${params})
    ON CONFLICT (cnic) DO UPDATE SET ${updateSet}
    RETURNING customer_id
  `;

  const res = await db.query(sql, values);
  return res.rows[0].customer_id;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise((resolve) => rl.question(q, resolve));

  try {
    // Attempt to flush any queued Excel writes from previous runs
    await flushQueues();

    console.log('=== ILOS Data Insertion Tool ===');
    const rawCnic = await question('Enter CNIC (digits only or any format): ');
    const cnic = normalizeCnic(rawCnic);
    if (!cnic || cnic.length < 5) {
      throw new Error('Invalid CNIC input.');
    }

    const fullname = (await question('Enter Full Name: ')).trim();
    if (!fullname) {
      throw new Error('Full name is required.');
    }

    const statusAns = (await question('Mark user as Blacklist or Good? (b/g): ')).trim().toLowerCase();
    const isBlacklist = statusAns === 'b' || statusAns === 'blacklist';

    const customerId = await generateSequentialCustomerId(110000);
    const cifStatus = isBlacklist ? 'BLACKLIST' : 'NTB';

    // Insert/Update CIF minimal record
    const insertedCustomerId = await upsertCifCustomer({
      customer_id: customerId,
      cnic,
      fullname,
      status: cifStatus
    });

    console.log(`CIF record upserted for Customer ID: ${insertedCustomerId}`);

    const nowIso = new Date().toISOString();
    if (isBlacklist) {
      appendRowToExcelMapped('sbp_blacklist.xlsx', cnic, fullname, 'Blacklist');
      appendRowToExcelMapped('internal_watchlist.xlsx', cnic, fullname, 'Blacklist');
      console.log('Added to SBP Blacklist and Internal Watchlist Excel files.');
    } else {
      appendRowToExcelMapped('ccl_list.xlsx', cnic, fullname, 'Good');
      console.log('Added to CCL list Excel file.');
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message);
    try { console.error('Error details:', err); } catch (_) {}
  } finally {
    rl && rl.close();
    try { await db.end?.(); } catch (_) {}
  }
}

if (require.main === module) {
  main();
}


