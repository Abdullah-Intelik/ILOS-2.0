/**
 * Script to remove test CNIC from all compliance Excel files
 * Run with: node clean-test-cnic.js 3520111112221
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const TEST_CNIC = process.argv[2] || '3520111112221';
const EXCEL_STORE = process.env.EXCEL_STORE || 'D:/ILOS/backend/excel_files/store';

console.log('🧹 Cleaning Test CNIC from Compliance Lists');
console.log('━'.repeat(60));
console.log(`📋 CNIC to remove: ${TEST_CNIC}`);
console.log(`📁 Excel folder: ${EXCEL_STORE}`);
console.log('━'.repeat(60));

const files = [
  { file: 'pep.xlsx', cnicColumns: ['cnic', 'CNIC', 'id_no', 'ID_NO'] },
  { file: 'sbp_blacklist.xlsx', cnicColumns: ['cnic', 'CNIC', 'id_no', 'ID_NO'] },
  { file: 'internal_watchlist.xlsx', cnicColumns: ['id_number', 'ID_NUMBER', 'cnic', 'CNIC'] },
  { file: 'ccl_list.xlsx', cnicColumns: ['cnic', 'CNIC', 'id_number', 'ID_NUMBER', 'client_no'] }
];

function normalizeCnic(value) {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

function findCnicColumn(headers, candidates) {
  for (const candidate of candidates) {
    if (headers.includes(candidate)) {
      return candidate;
    }
  }
  return null;
}

function cleanFile(fileConfig) {
  const filePath = path.join(EXCEL_STORE, fileConfig.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileConfig.file} - File not found, skipping`);
    return;
  }

  console.log(`\n📄 Processing: ${fileConfig.file}`);
  
  const workbook = XLSX.readFile(filePath);
  let totalRemoved = 0;

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      console.log(`   Sheet "${sheetName}": Empty, skipping`);
      return;
    }

    const headers = Object.keys(data[0]);
    const cnicColumn = findCnicColumn(headers, fileConfig.cnicColumns);

    if (!cnicColumn) {
      console.log(`   Sheet "${sheetName}": No CNIC column found, skipping`);
      return;
    }

    console.log(`   Sheet "${sheetName}": Using column "${cnicColumn}"`);

    // Filter out rows with matching CNIC
    const beforeCount = data.length;
    const filteredData = data.filter((row) => {
      const rowCnic = normalizeCnic(row[cnicColumn]);
      return rowCnic !== normalizeCnic(TEST_CNIC);
    });
    const afterCount = filteredData.length;
    const removed = beforeCount - afterCount;

    if (removed > 0) {
      console.log(`   ✅ Removed ${removed} row(s) with CNIC ${TEST_CNIC}`);
      totalRemoved += removed;

      // Write filtered data back to sheet
      const newSheet = XLSX.utils.json_to_sheet(filteredData);
      workbook.Sheets[sheetName] = newSheet;
    } else {
      console.log(`   ℹ️  No matching CNIC found`);
    }
  });

  if (totalRemoved > 0) {
    // Backup original file
    const backupPath = filePath.replace('.xlsx', `.backup.${Date.now()}.xlsx`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup created: ${path.basename(backupPath)}`);

    // Write updated workbook
    XLSX.writeFile(workbook, filePath);
    console.log(`   💾 File updated: ${fileConfig.file}`);
  }

  return totalRemoved;
}

// Main execution
console.log('\n🚀 Starting cleanup...\n');

let grandTotal = 0;
files.forEach((fileConfig) => {
  try {
    const removed = cleanFile(fileConfig);
    grandTotal += removed || 0;
  } catch (error) {
    console.error(`❌ Error processing ${fileConfig.file}:`, error.message);
  }
});

console.log('\n' + '━'.repeat(60));
console.log(`✅ Cleanup complete!`);
console.log(`📊 Total rows removed across all files: ${grandTotal}`);

if (grandTotal > 0) {
  console.log('\n⚠️  IMPORTANT: Restart your backend server to reload the Excel files:');
  console.log('   taskkill /F /IM node.exe');
  console.log('   cd "D:\\ILOS 2.0\\backend"');
  console.log('   node server.js');
}

console.log('━'.repeat(60));

