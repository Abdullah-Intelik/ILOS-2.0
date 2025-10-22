## Comprehensive Deployment Plan: ILOS + PostgreSQL + Hyperledger Fabric (PKR Costed)

### 1) Executive Summary

- **Licensing**: PostgreSQL (PostgreSQL License) and Hyperledger Fabric (Apache 2.0) have no software license fees for enterprise use when self‑hosted. Optional enterprise/managed platforms are subscription-based.
- **Blockchain Data Strategy**: Store immutable hashes (per LOS/department) on Fabric; optionally use Private Data Collections (PDC) per department for sensitive fields. Full data stays in PostgreSQL.
- **Infra Options**: Existing virtualization (monthly OPEX) vs new hardware (one-time CAPEX + OPEX). Examples in PKR included; replace unit rates/quotes with UBL’s actuals.
- **DR/Backup**: PITR for Postgres (WAL), ledger/channel/crypto backups for Fabric, offsite copies, and recovery drills.

---

### 2) Current Application Architecture (from repository)

- **Backend (Node/Express)**
  - Core APIs under `ilos-backend-2.0/routes/*`, DB connection via `db1.js` (PostgreSQL).
  - DBR microservice: `ilos-backend-2.0/DataEng/data-engine-server.js` (port 3002) fetching from core backend then computing DBR.
- **Frontend (Next.js)**
  - Role dashboards under `ilos-frontend-2.0/app/dashboard/*` (PB, SPU, COPS, EAMVU, CIU, RRU, Risk, Compliance).
- **Database (PostgreSQL)**
  - Schema initialization and evolution via `setup-core-schema-db1.js` and related scripts.

---

### 3) Hyperledger Fabric Integration Design

- **Channel**: Single application channel `iloschannel`.
- **Organizations / MSPs**: One per department (or grouped), e.g., PBMSP, SPUMSP, COPSMSP, EAMVUMSP, CIUMSP, RRUMSP, RiskMSP, ComplianceMSP.
- **Private Data Collections (PDCs)**: One per department to retain privacy while leveraging on-chain ordering and endorsement.
  - Example `collections_config.json` entries:
  ```json
  [
    { "name": "PBPrivate", "policy": "OR('PBMSP.member')", "requiredPeerCount": 1, "maxPeerCount": 2, "blockToLive": 0, "memberOnlyRead": true, "memberOnlyWrite": true },
    { "name": "CIUPrivate", "policy": "OR('CIUMSP.member')", "requiredPeerCount": 1, "maxPeerCount": 2, "blockToLive": 0, "memberOnlyRead": true, "memberOnlyWrite": true }
  ]
  ```
- **What to Store**:
  - On-chain (public): Per‑LOS, per‑department immutable hash (SHA‑256) of the canonical form snapshot + minimal metadata (losId, department, version, timestamp, signer).
  - PDC (per dept, optional): Sensitive field subset if stronger anchoring is required for that department.
  - Off-chain (PostgreSQL): Full record for queries and reporting.
- **Benefits**: Tamper‑evidence, non‑repudiation, auditability, and privacy via PDCs with minimal ledger bloat.

---

### 4) Reference Topology (Production)

- **PostgreSQL HA**: 3 nodes (Primary + 2 replicas) — 4 vCPU, 16 GB RAM, 200 GB SSD each; WAL archiving; Patroni/pgpool or equivalent.
- **Fabric**:
  - Orderers x3 (Raft): 2 vCPU, 4–8 GB RAM, 50 GB SSD
  - Peers x8 (2 per org group): 4 vCPU, 8 GB RAM, 200 GB SSD
  - CouchDB x8 (if separate): 2 vCPU, 4 GB RAM, 100 GB SSD
  - Fabric CAs x4: 1 vCPU, 2 GB RAM, 20 GB SSD
- **Application Tier**:
  - Backend x2: 2 vCPU, 4–8 GB RAM
  - Data Engine x2: 2 vCPU, 4 GB RAM
  - Frontend x2: 2 vCPU, 2–4 GB RAM
  - Ingress/LB x2: 1–2 vCPU, 1–2 GB RAM
- **Monitoring/Logging**: 1–2 nodes: 4 vCPU, 8–16 GB RAM, 500 GB SSD
- **Storage Baseline**: ~5 TB SSD usable (Prod), plus backup target (see DR).

---

### 5) Backup and Disaster Recovery (DR)

#### PostgreSQL
- **Backups**:
  - PITR: WAL archiving every 5–10 minutes to a hardened backup server (pgBackRest).
  - Daily full backup, weekly synthetic full, 30–90 day retention.
- **DR**:
  - Async replica in secondary DC (RPO ≤ 10 min), promote on disaster (RTO 30–90 min).
  - Quarterly recovery drill restoring to a selected point‑in‑time.

#### Hyperledger Fabric
- **Backups**:
  - MSP/crypto material (peers/orderers/CAs), channel artifacts (genesis/config blocks), connection profiles.
  - Periodic peer/orderer ledger snapshots (e.g., weekly), daily config backups.
- **DR**:
  - Rebuild orderers/peers in DR DC; restore crypto + channel artifacts; peers resync from orderers/snapshots; verify endorsement/anchor peers.
  - RPO: minutes (dependent on snapshot cadence/orderer availability). RTO: hours.

#### Application Tier
- Immutable container images in registry, config and secrets backups (Vault/KMS), IaC manifests.

#### Backup Target Sizing
- At least 2–3× primary data size for warm+retention. For ~5 TB primary, plan 10–15 TB backup capacity (fast + archival tiers).

---

### 6) Security & Operations

- **mTLS** everywhere; cert rotation via Fabric CA + internal PKI.
- **Secrets** in Vault/HSM; no static secrets in repos or disks.
- **HSM** for CA keys if policy requires; otherwise softHSM with tight controls.
- **Monitoring** with Prometheus/Grafana; logs to ELK/Splunk; alerting by SLO.

---

### 7) Costing (PKR) — Toggleable Models

Define internal unit rates (replace with UBL rates):
- vCPU/month (PKR): `Rv`
- RAM GB/month (PKR): `Rm`
- SSD GB/month (PKR): `Rs`
- Backup GB/month (PKR): `Rb` (cheaper tier)
- Ops uplift: `Ro%` (power/cooling/space/support)

Assumed production resource totals:
- vCPU ≈ 88, RAM ≈ 194 GB, SSD ≈ 5,000 GB active, Backup ≈ 10,000 GB

#### A) Existing Virtualization (Monthly OPEX)
- Monthly subtotal:
  - vCPU: `88 × Rv`
  - RAM: `194 × Rm`
  - SSD: `5,000 × Rs`
  - Backup: `10,000 × Rb`
- Ops uplift: `Ro% × (vCPU+RAM+SSD+Backup)`
- Dev+UAT: ~50% of Prod

Example (replace rates later): `Rv=2,500; Rm=400; Rs=30; Rb=10; Ro=15%`
- vCPU: 220,000
- RAM: 77,600
- SSD: 150,000
- Backup: 100,000
- Subtotal: 547,600
- Ops uplift (15%): 82,140
- **Total Prod/month**: 629,740 PKR
- **Dev+UAT (50%)**: 314,870 PKR
- **Grand total (All envs/month)**: 944,610 PKR

If enabling PDC heavy usage: add ~10–15% CPU/RAM for peers/CouchDB.

#### B) New Hardware (CAPEX + Monthly OPEX)
- Example CAPEX (replace with vendor quotes):
  - DB servers x3: 3 × 1,250,000 = 3,750,000
  - Orderers x3: 3 × 600,000 = 1,800,000
  - Peers x8 (mid) incl. Couch-ready: 8 × 1,000,000 = 8,000,000
  - Fabric CAs x4: 4 × 250,000 = 1,000,000
  - App/Ingress/Mon/Log x7 (mixed): ≈ 4,900,000
  - Storage (5 TB active + 10 TB backup NAS): 2,500,000
  - Network/rack/spares: 1,000,000
  - Setup services (rack/OS/hardening): 1,200,000
  - **One-time CAPEX Total (example)**: ≈ 24,150,000 PKR
- Monthly OPEX (power/cooling/support; 8–12%/yr of CAPEX): ≈ 200,000–250,000 PKR/month
- Add Dev/UAT ~50% if separate hardware.

#### C) Hybrid (DB on existing cluster, Fabric new)
- Reduce CAPEX accordingly; OPEX includes Fabric/app nodes.

#### Optional Adders (include if chosen)
- HSM for CA keys: 3,000,000–8,000,000 PKR
- Enterprise support (optional):
  - PostgreSQL: 2,000,000–7,000,000 PKR/year
  - Managed/Enterprise Fabric: 4,000,000–15,000,000 PKR/year
- Premium backup software (if not using pgBackRest + snapshots): vendor‑dependent

---

### 8) “If You Add Then Total Cost Will Be” (All in PKR)

- **Minimal** (hash‑only, existing virtualization, no support): ~0.95M PKR/month across Dev+UAT+Prod (based on example unit rates). Replace with UBL’s Rv/Rm/Rs/Rb/Ro to finalize.
- **Enhanced** (add PDC): Minimal + 10–15% → ~1.05–1.09M PKR/month.
- **Enterprise** (new hardware CAPEX, PDC, HSM, support):
  - One‑time CAPEX: ~24–35M PKR (depends on quotes + HSM)
  - Monthly OPEX: ~0.2–0.4M PKR/month
  - Annual support (optional): +6–22M PKR/year

---

### 9) Benefits vs Tradeoffs

**With Fabric**
- Pros: Tamper‑evident audit trails, non‑repudiation, PDC privacy, regulator‑friendly integrity posture.
- Cons: Operational complexity (peers/orderers/CAs), chaincode lifecycle, lower throughput than RDBMS, ongoing maintenance.

**Without Fabric**
- Pros: Simpler ops, lower infra cost, higher throughput, faster iteration.
- Cons: Weaker immutability story; rely on DB audit logs and backups for integrity.

---

### 10) Next Steps

- Plug in UBL’s internal unit rates (Rv, Rm, Rs, Rb, Ro) and vendor quotes to produce a signed‑off PKR total per option.
- Deliver chaincode + backend adapter for per‑department PDC write/verify and hash anchoring.
- Produce K8s/Docker manifests and a DR runbook; schedule quarterly recovery drills.


