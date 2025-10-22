const path = require('path');

// ✅ Use ENV if set; else default to your Windows path
const EXCEL_STORE =
  process.env.EXCEL_STORE;

module.exports = {
  EXCEL_STORE: path.resolve(EXCEL_STORE),
};
