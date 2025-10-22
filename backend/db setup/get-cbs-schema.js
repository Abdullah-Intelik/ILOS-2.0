const db = require('../db');

async function getFullSchema() {
  try {
    // Get all tables
    const tablesRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('=== CBS DATABASE TABLES ===');
    console.log(tablesRes.rows.map(r => r.table_name).join(', '));
    console.log('');
    
    // Get detailed column info for each table
    for (const table of tablesRes.rows) {
      const tableName = table.table_name;
      
      const columnsRes = await db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`=== TABLE: ${tableName.toUpperCase()} ===`);
      columnsRes.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const maxLen = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  ${col.column_name}: ${col.data_type}${maxLen} ${nullable}${defaultVal}`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.end();
  }
}

getFullSchema();
