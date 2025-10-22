const path = require('path');
const express = require('express');
const { EXCEL_STORE } = require('../excel_files/config');
const { readWorkbook, sheetToNormalizedRows } = require('../excel_files/excelUtils');

const router = express.Router();

const FILE = path.join(EXCEL_STORE, 'sbp_blacklist.xlsx');
const CNIC_CANDIDATES = ['id_number', 'cnic', 'cnic_no', 'cnic_number', 'nic', 'id'];

let INDEX = null;
let loadedAt = null;
let lastHeadersPerSheet = [];

function detectCnicKey(headers) {
  const set = new Set(headers);
  for (const c of CNIC_CANDIDATES) if (set.has(c)) return c;
  return null;
}

// Robust CNIC normalization (handles numbers and scientific notation)
function normalizeCnicValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(Math.trunc(val));
  const s = String(val).trim();
  if (/e\+/i.test(s)) return Number(s).toFixed(0);
  return s.replace(/\D/g, '');
}

function buildIndex() {
  const wb = readWorkbook(FILE);
  const sheets = sheetToNormalizedRows(wb);
  const idx = new Map();
  lastHeadersPerSheet = [];

  for (const { sheetName, rows } of sheets) {
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]);
    lastHeadersPerSheet.push({ sheet: sheetName, headers });

    const cnicKey = detectCnicKey(headers);
    if (!cnicKey) continue;

    for (const row of rows) {
      const cnic = normalizeCnicValue(row[cnicKey]);
      if (!cnic) continue;
      const enriched = { ...row, _src_sheet: sheetName, _src_file: path.basename(FILE) };
      if (!idx.has(cnic)) idx.set(cnic, []);
      idx.get(cnic).push(enriched);
    }
  }
  INDEX = idx;
  loadedAt = new Date();
}

buildIndex();

router.post('/reload', (_req, res) => {
  buildIndex();
  res.json({ success: true, reloadedAt: loadedAt, file: FILE });
});

router.get('/stats', (_req, res) => {
  res.json({ file: FILE, loadedAt, keysIndexed: INDEX ? INDEX.size : 0, sheets: lastHeadersPerSheet });
});

router.post('/check', (req, res) => {
  const { cnic } = req.body || {};
  if (!cnic) return res.status(400).json({ success: false, message: 'CNIC is required' });
  const key = normalizeCnicValue(cnic);
  const rows = INDEX.get(key) || [];
  res.json({ success: true, count: rows.length, rows, loadedAt, file: FILE });
});

module.exports = router;
