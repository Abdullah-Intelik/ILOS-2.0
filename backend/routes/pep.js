const path = require('path');
const express = require('express');
const { EXCEL_STORE } = require('../excel_files/config');
const { readWorkbook, sheetToNormalizedRows, normalizeDigits } = require('../excel_files/excelUtils');

const router = express.Router();

// If your actual file is ccg_ref_list.xlsx, change here:
const FILE = path.join(EXCEL_STORE, 'pep.xlsx');

const CNIC_CANDIDATES = ['cnic', 'cnic_no', 'cnic_number', 'nic', 'id_number', 'id'];

let INDEX = null;
let loadedAt = null;
let lastHeadersPerSheet = [];

function detectCnicKey(headers) {
  const set = new Set(headers);
  for (const cand of CNIC_CANDIDATES) if (set.has(cand)) return cand;
  return null;
}

function buildIndex() {
  const wb = readWorkbook(FILE);
  const sheets = sheetToNormalizedRows(wb);     // headers normalized (e.g., "CNIC" -> "cnic")
  const idx = new Map();
  lastHeadersPerSheet = [];

  for (const { sheetName, rows } of sheets) {
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]);
    lastHeadersPerSheet.push({ sheet: sheetName, headers });

    const cnicKey = detectCnicKey(headers);
    if (!cnicKey) continue;                     // no CNIC-like column in this sheet

    for (const row of rows) {
      const cnic = normalizeDigits(row[cnicKey]);
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

// Optional: quick sanity endpoints (helpful while debugging)
router.get('/stats', (_req, res) => {
  res.json({ file: FILE, loadedAt, keysIndexed: INDEX?.size || 0, sheets: lastHeadersPerSheet });
});
router.get('/sample', (_req, res) => {
  const samples = [];
  if (INDEX) for (const [k, v] of INDEX.entries()) { samples.push({ cnic: k, row: v[0] }); if (samples.length >= 5) break; }
  res.json({ file: FILE, loadedAt, samples });
});

router.post('/check', (req, res) => {
  const { cnic } = req.body || {};
  if (!cnic) return res.status(400).json({ success: false, message: 'CNIC is required' });
  const key  = normalizeDigits(cnic);
  const rows = INDEX.get(key) || [];
  res.json({ success: true, count: rows.length, rows, loadedAt, file: FILE });
});

module.exports = router;
