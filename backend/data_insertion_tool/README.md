ILOS Data Insertion Tool
========================

Command-line utility to quickly seed/test a CNIC user by inserting a minimal CIF record into the CBS (PostgreSQL) and updating relevant Excel lists under `excel_files/store`.

Prerequisites
-------------
- Configure `ILOS-backend/.env` with `DATABASE_URL` pointing to your CBS Postgres.
- Ensure `excel_files/config.js` points to the correct `EXCEL_STORE` directory.

Usage
-----
From `ILOS-backend` directory:

```bash
npm run data-insert
```

The tool will:
- Ask for CNIC and Full Name.
- Ask whether to mark the user as Blacklist or Good.
- Insert/Upsert a minimal record into `cif_customers` table.
- Append to Excel files:
  - Blacklist: `sbp_blacklist.xlsx` and `internal_watchlist.xlsx`
  - Good: `ccl_list.xlsx`

Notes
-----
- The tool auto-generates a `customer_id` with the format `NTB-XXXX-######`.
- If an Excel file does not exist, it will be created with a simple header inferred from the first row.
- Minimal CIF fields are populated with sensible defaults for testing.


