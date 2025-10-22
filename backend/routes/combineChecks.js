const express = require('express');
const axios = require('axios');
const router = express.Router();

function parseServiceName(url) {
  // e.g. http://localhost:5000/api/pep/check => "pep"
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // ["api","pep","check"]
    // pick segment after "api"
    const apiIdx = parts.indexOf('api');
    const svc = apiIdx >= 0 && parts[apiIdx + 1] ? parts[apiIdx + 1] : parts[parts.length - 2] || 'unknown';
    return svc;
  } catch {
    return 'unknown';
  }
}

function computeExistsFlag(payload) {
  // Prioritize explicit boolean 'exists'
  if (payload && typeof payload.exists === 'boolean') {
    return payload.exists ? 1 : 0;
  }
  // Then use success/count/rows heuristics
  const hasCount =
    typeof payload?.count === 'number' ? payload.count > 0 :
    Array.isArray(payload?.rows) ? payload.rows.length > 0 :
    false;

  if (payload && payload.success === true && hasCount) return 1;
  if (hasCount) return 1;

  return 0;
}

router.post('/check-all', async (req, res) => {
  const { cnic } = req.body;

  if (!cnic) {
    return res.status(400).json({ success: false, message: 'CNIC is required' });
  }

  const baseURL = 'http://localhost:5000/api';

  const endpoints = [
    `${baseURL}/pep/check`,
    // `${baseURL}/frms/check`,
    `${baseURL}/sbp-blacklist/check`,
    // `${baseURL}/ecib-reports/check`,
    `${baseURL}/nadra-verisys/check`,
    `${baseURL}/internal-watchlist/check`,
    `${baseURL}/ccl/check`,
  ];

  try {
    const rawResults = await Promise.all(
      endpoints.map(url =>
        axios.post(url, { cnic })
          .then(response => ({ url, ok: true, data: response.data }))
          .catch(error => ({
            url,
            ok: false,
            error: error.response?.data || { message: String(error.message || error) }
          }))
      )
    );

    // Normalize with an 'exists' flag for each service
    const services = rawResults.map(r => {
      const service = parseServiceName(r.url);
      if (r.ok) {
        const exists = computeExistsFlag(r.data);
        return { service, url: r.url, exists, data: r.data };
      } else {
        // On error, mark exists=0 but include the error payload
        return { service, url: r.url, exists: 0, error: r.error };
      }
    });

    // Optional: overall any-hit flag
    const anyHit = services.some(s => s.exists === 1);

    return res.json({
      success: true,
      anyHit,                 // true if any list matched
      summary: Object.fromEntries(services.map(s => [s.service, s.exists])), // { pep:1, sbp-blacklist:1, ... }
      services                // detailed per-service breakdown
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error hitting one or more APIs',
      error: err.message
    });
  }
});

module.exports = router;