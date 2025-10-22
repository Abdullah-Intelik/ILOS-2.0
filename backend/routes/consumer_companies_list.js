const path = require('path');
const express = require('express');
const { EXCEL_STORE } = require('../excel_files/config');
const { readWorkbook, sheetToNormalizedRows } = require('../excel_files/excelUtils');

const router = express.Router();

const FILE = path.join(EXCEL_STORE, 'ccl_list.xlsx');

// Candidate headers after normalization (lowercase, spaces->_, dots removed)
const CNIC_CANDIDATES = ['id_number', 'cnic', 'cnic_no', 'cnic_number', 'client_no', 'nic', 'id'];
const IDTYPE_KEYS = ['id_type', 'idtype', 'document_type'];

// normalize numeric/scientific and strip non-digits
function normalizeCnicValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(Math.trunc(val));
  const s = String(val).trim();
  if (/e\+/i.test(s)) return Number(s).toFixed(0);
  return s.replace(/\D/g, '');
}

let INDEX = null;          // Map<cnic, rows[]>
let loadedAt = null;
let lastHeadersPerSheet = [];

function detectKey(headers, candidates) {
  const set = new Set(headers);
  for (const c of candidates) if (set.has(c)) return c;
  return null;
}

function buildIndex() {
  const wb = readWorkbook(FILE);
  const sheets = sheetToNormalizedRows(wb); // headers normalized
  const idx = new Map();
  lastHeadersPerSheet = [];

  for (const { sheetName, rows } of sheets) {
    if (!rows.length) continue;

    const headers = Object.keys(rows[0]);
    lastHeadersPerSheet.push({ sheet: sheetName, headers });

    // Find a CNIC-bearing column
    const cnicKey = detectKey(headers, CNIC_CANDIDATES);
    // Find an ID-Type column if present
    const idTypeKey = detectKey(headers, IDTYPE_KEYS);

    if (!cnicKey) {
      console.warn(`[CCL] No CNIC-like column in ${path.basename(FILE)} [${sheetName}]`);
      continue;
    }

    for (const row of rows) {
      // If we have an ID-Type column, enforce CNIC
      if (idTypeKey) {
        const idType = String(row[idTypeKey] || '').trim().toUpperCase();
        if (idType !== 'CNIC') continue;
      }

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

// ----- endpoints -----

router.post('/reload', (_req, res) => {
  buildIndex();
  res.json({ success: true, reloadedAt: loadedAt, file: FILE });
});

router.get('/stats', (_req, res) => {
  res.json({ file: FILE, loadedAt, keysIndexed: INDEX ? INDEX.size : 0, sheets: lastHeadersPerSheet });
});

router.get('/sample', (_req, res) => {
  const samples = [];
  if (INDEX) {
    for (const [k, v] of INDEX.entries()) {
      samples.push({ cnic: k, row: v[0] });
      if (samples.length >= 5) break;
    }
  }
  res.json({ file: FILE, loadedAt, samples });
});

router.post('/check', (req, res) => {
  const { cnic } = req.body || {};
  if (!cnic) return res.status(400).json({ success: false, message: 'CNIC is required' });
  const key = normalizeCnicValue(cnic);
  const rows = INDEX.get(key) || [];
  res.json({ success: true, count: rows.length, rows, loadedAt, file: FILE });
});

module.exports = router;
