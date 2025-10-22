const db = require('../db');

// Type-based defaults
const TYPE_DEFAULT = {
  'character varying': `''`,
  'text': `''`,
  'integer': `0`,
  'bigint': `0`,
  'numeric': `0`,
  'double precision': `0`,
  'real': `0`,
  'boolean': `false`,
  'date': `DATE '1970-01-01'`,
  'timestamp without time zone': `NOW()`,
  'timestamp with time zone': `NOW()`,
  'json': `'{}'::json`,
  'jsonb': `'{}'::jsonb`
};

async function listTables() {
  const q = `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`;
  const res = await db.query(q);
  return res.rows.map(r => r.table_name);
}

async function listNullableColumns(table) {
  const q = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1
  `;
  const res = await db.query(q, [table]);
  return res.rows
    .filter(r => r.is_nullable === 'YES')
    .map(r => ({ name: r.column_name, type: r.data_type }));
}

function defaultForType(dataType) {
  return TYPE_DEFAULT[dataType] ?? `''`;
}

async function fillTable(table) {
  const cols = await listNullableColumns(table);
  if (!cols.length) return { table, updated: 0 };
  const setParts = cols.map(c => {
    const def = defaultForType(c.type);
    if (c.type === 'character varying' || c.type === 'text') {
      return `${c.name} = COALESCE(NULLIF(${c.name}, ''), ${def})`;
    }
    return `${c.name} = COALESCE(${c.name}, ${def})`;
  });
  const sql = `UPDATE ${table} SET ${setParts.join(', ')}`;
  const res = await db.query(sql);
  return { table, updated: res.rowCount || 0 };
}

async function main() {
  const tables = await listTables();
  const results = [];
  for (const t of tables) {
    const r = await fillTable(t).catch(e => ({ table: t, error: e.message }));
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
  await db.end();
}

main().catch(async (e) => {
  console.error('Fill-all CBS failed:', e.message);
  try { await db.end(); } catch (_) {}
  process.exit(1);
});


