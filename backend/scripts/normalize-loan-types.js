const db = require('../db1');

async function normalizeLoanTypes() {
  try {
    console.log('🔧 Normalizing ilos_applications.loan_type values...');

    const mappings = [
      ['cashplus', 'cashplus_applications'],
      ['autoloan', 'autoloan_applications'],
      ['smeasaan', 'smeasaan_applications'],
      ['commercialvehicle', 'commercial_vehicle_applications'],
      ['commercial_vehicle', 'commercial_vehicle_applications'],
      ['commercialvehicle_applications', 'commercial_vehicle_applications'],
      ['ameendrive', 'ameendrive_applications'],
      ['platinum_card', 'platinum_card_applications'],
      ['creditcard', 'creditcard_applications'],
    ];

    for (const [from, to] of mappings) {
      const res = await db.query(
        `UPDATE ilos_applications SET loan_type = $1 WHERE loan_type = $2 RETURNING los_id`,
        [to, from]
      );
      if (res.rowCount) {
        console.log(`✅ Updated ${res.rowCount} rows: '${from}' -> '${to}'`);
      }
    }

    console.log('✅ Normalization complete');
  } catch (err) {
    console.error('❌ Normalization failed:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  normalizeLoanTypes().then(() => process.exit(0));
}

module.exports = { normalizeLoanTypes };



