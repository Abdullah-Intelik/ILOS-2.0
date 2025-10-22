function normalizeCnic(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  if (digits.length !== 13) return digits; // return best-effort; validation elsewhere
  return digits;
}

function formatCnic(digits) {
  const d = normalizeCnic(digits);
  if (!d || d.length !== 13) return String(digits || '');
  return `${d.slice(0,5)}-${d.slice(5,12)}-${d.slice(12)}`;
}

module.exports = { normalizeCnic, formatCnic };



