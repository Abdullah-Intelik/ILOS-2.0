const db = require('../db');

const TARGET_COLS = {
  category: `'I'`,
  control_branch: `'001'`,
  creation_date: `NOW()`
};

async function listTables() {
  const q = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `;
  const res = await db.query(q);
  return res.rows.map(r => r.table_name);
}

async function listColumns(table) {
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1
  `;
  const res = await db.query(q, [table]);
  return new Set(res.rows.map(r => r.column_name));
}

async function backfillTable(table) {
  const cols = await listColumns(table);
  const presentTargets = Object.keys(TARGET_COLS).filter(c => cols.has(c));
  if (!presentTargets.length) return { table, updated: 0 };

  const sets = presentTargets.map(c => `${c} = COALESCE(${c}, ${TARGET_COLS[c]})`).join(', ');
  const q = `UPDATE ${table} SET ${sets}`;
  const res = await db.query(q);
  return { table, updated: res.rowCount || 0 };
}

async function main() {
  const tables = await listTables();
  const results = [];
  for (const t of tables) {
    const r = await backfillTable(t).catch(e => ({ table: t, error: e.message }));
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
  await db.end();
}

main().catch(async (e) => {
  console.error('Backfill failed:', e.message);
  try { await db.end(); } catch (_) {}
  process.exit(1);
});


