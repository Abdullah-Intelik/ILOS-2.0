const db = require('../db1');

async function describe(table) {
  try {
    const cols = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    console.log(`\n=== ${table} columns ===`);
    cols.rows.forEach(r => console.log(`${r.column_name} :: ${r.data_type} ${r.is_nullable}`));
  } catch (e) {
    console.error(`Error describing ${table}:`, e.message);
  }
}

(async () => {
  const tables = process.argv.slice(2);
  if (tables.length === 0) {
    console.log('Usage: node scripts/describe-table.js <table1> <table2> ...');
    process.exit(1);
  }
  for (const t of tables) {
    await describe(t);
  }
  await db.end();
})();



