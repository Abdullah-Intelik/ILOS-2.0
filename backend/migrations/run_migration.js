/**
 * Database Migration Runner
 * Run this script to apply the automation columns migration
 */

const db = require('../db1');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add_automation_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing migration SQL...');
    
    // Execute the migration
    const result = await db.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Result:', result.rows);
    
    // Verify the changes
    console.log('\n🔍 Verifying new columns...');
    const verifyResult = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ilos_applications'
        AND column_name LIKE '%auto%' OR column_name LIKE '%spu_checks%'
      ORDER BY column_name;
    `);
    
    console.log('\n✅ New columns added:');
    verifyResult.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Verify views
    console.log('\n🔍 Verifying views...');
    const viewsResult = await db.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_name IN ('v_automation_stats', 'v_queued_applications');
    `);
    
    console.log('\n✅ Views created:');
    viewsResult.rows.forEach(view => {
      console.log(`   - ${view.table_name}`);
    });
    
    console.log('\n✅ All migration steps completed successfully!');
    console.log('🎯 Automation system is ready to use.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the migration
runMigration();

