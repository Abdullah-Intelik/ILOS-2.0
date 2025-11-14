const db = require('./db');

const cnic = '1234512345673'; // without dashes

console.log('🔍 Checking CBS database for CNIC:', cnic);

db.query(`
  SELECT customer_id, fullname, cnic, created_at
  FROM cif_customers 
  WHERE cnic = $1 OR cnic = $2
`, [cnic, '12345-1234567-3'])
  .then(result => {
    console.log('\n📊 Results:', result.rows.length, 'customer(s) found\n');
    
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log('✅ Customer Found:');
        console.log('   - ID:', row.customer_id);
        console.log('   - Name:', row.fullname);
        console.log('   - CNIC:', row.cnic);
        console.log('   - Created:', row.created_at);
        console.log('');
      });
    } else {
      console.log('❌ No customer found in CBS database');
      console.log('   This CNIC is NTB (New to Bank)');
      console.log('   Cannot apply for Instant Loan');
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error querying CBS:', error.message);
    process.exit(1);
  });

