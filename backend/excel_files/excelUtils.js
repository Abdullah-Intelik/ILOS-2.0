const XLSX = require('xlsx');

const normalizeHeader = (h) =>
  String(h || '').trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, '_');

const normalizeDigits = (v) => String(v || '').replace(/\D/g, ''); // keep only digits

function readWorkbook(filePath) {
  return XLSX.readFile(filePath, { cellDates: true });
}

function sheetToNormalizedRows(workbook) {
  const out = [];
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
    if (!rows.length) continue;
    const normalized = rows.map((r) => {
      const o = {};
      for (const [k, v] of Object.entries(r)) o[normalizeHeader(k)] = v;
      return o;
    });
    out.push({ sheetName, rows: normalized });
  }
  return out;
}

module.exports = { readWorkbook, sheetToNormalizedRows, normalizeHeader, normalizeDigits };
