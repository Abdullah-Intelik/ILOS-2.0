/**
 * Schema Checker - Find where CNIC is stored
 */

const db = require('./db1');

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check if personal_details exists
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%personal%' OR table_name LIKE '%detail%'
      ORDER BY table_name
    `);

    console.log('📋 Tables with "personal" or "detail":');
    tableCheck.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // Check ilos_applications columns
    console.log('\n📋 Columns in ilos_applications:');
    const ilosColumns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ilos_applications'
      ORDER BY ordinal_position
    `);
    ilosColumns.rows.forEach(row => console.log(`   - ${row.column_name} (${row.data_type})`));

    // Check cashplus_applications columns
    console.log('\n📋 Columns in cashplus_applications:');
    const cashplusColumns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cashplus_applications'
      ORDER BY ordinal_position
      LIMIT 30
    `);
    cashplusColumns.rows.forEach(row => console.log(`   - ${row.column_name} (${row.data_type})`));

    // Try to find CNIC in LOS-89
    console.log('\n🔍 Searching for CNIC in LOS-89...');
    
    try {
      const los89 = await db.query(`
        SELECT * FROM ilos_applications WHERE los_id = 89
      `);
      if (los89.rows.length > 0) {
        console.log('✅ Found in ilos_applications:', Object.keys(los89.rows[0]).join(', '));
      }
    } catch (e) {
      console.log('❌ Error:', e.message);
    }

    try {
      const cashplus89 = await db.query(`
        SELECT * FROM cashplus_applications WHERE los_id = 89 LIMIT 1
      `);
      if (cashplus89.rows.length > 0) {
        console.log('✅ Found in cashplus_applications');
        console.log('   Columns:', Object.keys(cashplus89.rows[0]).slice(0, 20).join(', '));
        // Look for CNIC-like fields
        const row = cashplus89.rows[0];
        Object.keys(row).forEach(key => {
          if (key.toLowerCase().includes('cnic') || key.toLowerCase().includes('id_no')) {
            console.log(`   💡 ${key}: ${row[key]}`);
          }
        });
      }
    } catch (e) {
      console.log('❌ Error:', e.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();

