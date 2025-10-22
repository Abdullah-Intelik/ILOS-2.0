## Starting Point: Environment and Architecture Checklist

### 1) Development tools
- Node.js 18 LTS, TypeScript 5
- Frontend: Next.js 14, React 18
- Backend: Express (API), Swagger/OpenAPI for API docs
- Mobile: React Native (EAMVU mobile app)
- Package manager: npm/pnpm
- Lint/format: ESLint, Prettier
- Testing: Jest (unit), Playwright (e2e, optional)
- Containers: Docker Desktop (dev), Docker Engine/containerd (servers)
- CI/CD: GitHub Actions/Jenkins (build/test/deploy)
- Observability: Prometheus + Grafana (metrics), ELK/Splunk (logs)
- Blockchain: Hyperledger Fabric toolchain (peer/orderer/CA CLIs), Fabric SDK (Node), Fabric test network
- Smart contracts: Fabric chaincode toolchain (Node/TypeScript), shim/contract APIs, collections config management
- Networking: Nginx/HAProxy, OpenSSL, mTLS tooling, WireShark/tcpdump for diagnostics, Kubernetes/Helm (optional)

### 2) Databases
- Primary RDBMS: PostgreSQL 15/16
  - HA pattern: 3 nodes (Primary + 2 replicas), SSD storage
  - PITR via pgBackRest (WAL archiving)
- Hyperledger Fabric state DB: CouchDB per peer (if rich queries needed)
- Object/file storage (optional): on‑prem NAS/S3‑compatible for documents and backups

### 3) Integration methods
- REST/JSON over TLS 1.2/1.3 from frontend/mobile to backend `/api/*`
- Internal service‑to‑service mTLS (Backend ↔ Data Engine; Backend ↔ Fabric Gateway)
- Hyperledger Fabric SDK (Gateway pattern) for on‑chain hash anchoring and PDC writes
- SFTP/secure file ingest for documents (optional)
- Eventing (optional/future): Kafka/RabbitMQ or webhooks for async workflows

### 4) Hosting location (on‑prem/cloud)
- Recommended: On‑prem (UBL data center) for data residency and compliance
- Alternative: Cloud for non‑PII workloads or DR; ensure private networking, KMS, and no public DB/ledger endpoints

### 5) On‑prem application servers required (OS/Configuration)
- OS: Ubuntu LTS (22.04/24.04), hardened baseline, automatic security updates
- Reverse proxy/WAF: Nginx/HAProxy (TLS 1.2+/1.3, HSTS, TLS modern ciphers)
- Sizing (starting point per instance):
  - Backend/API: 2 vCPU, 4–8 GB RAM
  - Data Engine (DBR): 2 vCPU, 4 GB RAM
  - Frontend: 2 vCPU, 2–4 GB RAM
- PostgreSQL cluster: 3× nodes, 4 vCPU, 16 GB RAM, 200 GB SSD each, WAL to backup store
- Hyperledger Fabric:
  - Orderers: 3× (2 vCPU, 4–8 GB RAM, 50 GB SSD)
  - Peers: 2 per org group (4 vCPU, 8 GB RAM, 200 GB SSD)
  - CouchDB: 1 per peer (2 vCPU, 4 GB RAM, 100 GB SSD) if separate
  - Fabric CA: 1 per org (1 vCPU, 2 GB RAM, 20 GB SSD)

### 6) Data encryption methods
- In‑transit: TLS 1.2/1.3 everywhere; mTLS for internal service calls and Fabric components
- At rest:
  - Disk encryption (LUKS/dm‑crypt or encrypted hypervisor storage)
  - PostgreSQL: encrypted volumes; `pgcrypto` for sensitive columns (PII)
  - Backups: pgBackRest encrypted, offsite immutable copies (WORM)
  - Secrets/keys: Vault/KMS; CA keys optionally HSM‑backed
- Fabric privacy:
  - On‑chain: store only hashes + minimal metadata
  - Private Data Collections (PDCs): department‑scoped sensitive fields

### 7) Application access over internet
- Only the EAMVU React Native mobile app requires internet access.
- All other modules are internal‑only (VPN/ZTNA).
- Exposure pattern for mobile:
  - Public API gateway in DMZ with WAF, strict IP allow‑lists, rate limiting
  - OAuth2/OIDC with MFA; short‑lived tokens; refresh control
  - No direct exposure of PostgreSQL or Fabric; gateway → internal services over mTLS
  - Audit logging for all external requests; anomaly detection enabled


