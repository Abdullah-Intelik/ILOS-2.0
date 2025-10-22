const db = require('./db1');

async function backfill() {
  try {
    console.log('🔄 Backfilling ilos_applications registry...');

    // Ensure register function exists (should be created by setup script)
    await db.query(`
      CREATE OR REPLACE FUNCTION register_los_in_ilos(p_los_id INT, p_loan_type TEXT, p_cnic TEXT DEFAULT NULL, p_customer_id TEXT DEFAULT NULL)
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO ilos_applications (los_id, loan_type, cnic, customer_id, status)
        VALUES (p_los_id, p_loan_type, p_cnic, p_customer_id, 'PB_SUBMITTED')
        ON CONFLICT (los_id) DO NOTHING;
      END; $$ LANGUAGE plpgsql;
    `);

    const tasks = [
      {
        table: 'cashplus_applications',
        cnicCol: 'cnic',
        customerCol: 'customer_id'
      },
      {
        table: 'autoloan_applications',
        cnicCol: 'applicant_cnic',
        customerCol: 'customer_id'
      },
      {
        table: 'ameendrive_applications',
        cnicCol: 'applicant_cnic',
        customerCol: 'customer_id'
      },
      {
        table: 'smeasaan_applications',
        cnicCol: 'applicant_cnic',
        customerCol: null
      },
      {
        table: 'commercial_vehicle_applications',
        cnicCol: 'applicant_cnic',
        customerCol: 'customer_id'
      },
      {
        table: 'creditcard_applications',
        cnicCol: 'nic_or_passport',
        customerCol: 'customer_id'
      },
      {
        table: 'platinum_card_applications',
        cnicCol: 'nic',
        customerCol: 'customer_id'
      }
    ];

    for (const { table, cnicCol, customerCol } of tasks) {
      console.log(`➡️ Processing ${table} ...`);
      const insertSql = `
        INSERT INTO ilos_applications (los_id, loan_type, cnic, customer_id, status)
        SELECT t.id, $1::text, t.${cnicCol}, ${customerCol ? `t.${customerCol}` : 'NULL'} AS customer_id, 'PB_SUBMITTED'
        FROM ${table} t
        LEFT JOIN ilos_applications ia ON ia.los_id = t.id
        WHERE ia.los_id IS NULL;
      `;
      const res = await db.query(insertSql, [table]);
      console.log(`✅ ${table}: inserted ${res.rowCount || 0} missing registry rows`);
    }

    console.log('🎉 Backfill complete');
  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  backfill().then(() => process.exit(0));
}

module.exports = { backfill };


