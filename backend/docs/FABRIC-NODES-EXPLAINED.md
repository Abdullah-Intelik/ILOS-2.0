## Hyperledger Fabric in Our UBL Use Case (Simple Explanation)

### Orderer (Ordering Service) — What it does
- Puts all transactions in a single, agreed order for everyone.
- Packs transactions into blocks and delivers them to peers.
- Does not run business logic or store private data; it ensures consistent ordering and reliability across the network.

### Peer — What it does
- Runs the smart contract (chaincode) to simulate a transaction and provide an approval (endorsement).
- Receives blocks from the orderer, verifies them, and commits them.
- Stores both:
  - The full, append‑only blockchain history (the ledger).
  - A fast “current view” database (CouchDB) for quick reads.
- Holds its department’s Private Data Collections (PDCs) so only that department can read its sensitive fields.

### What is stored where
- **Fabric ledger (channel, append‑only history)**
  - Immutable records such as: SHA‑256 hash of the form snapshot, `losId`, department, version, timestamp, signer.
  - Optional minimal metadata to prove “what/when/who.”
  - Same blocks replicated to all orgs’ peers for auditability.

- **Fabric PDC (per department, private)**
  - Optional sensitive subset for that department only (e.g., parts of CIU/EAMVU checks you want anchored but not shared).
  - Not visible to other departments’ peers.

- **CouchDB (per peer, world state / current view)**
  - The latest values for fast queries (e.g., latest hash for a LOS in a department).
  - Stores the department’s PDC JSON docs for quick private reads.
  - Can be rebuilt from the ledger (ledger is the source of truth).

- **PostgreSQL (off‑chain, operational system of record)**
  - Full application forms, workflow states, analytics/reporting, documents.
  - Fast relational queries; main place for day‑to‑day operations.

### Why this split
- Ledger gives immutable, shared proof (hash + minimal metadata) without exposing PII.
- PDC keeps each department’s sensitive fields private but cryptographically anchored.
- PostgreSQL remains the workhorse DB; CouchDB makes Fabric reads fast.

### One write, step by step
1. Backend freezes a form snapshot and computes its SHA‑256 hash.
2. Backend submits a Fabric transaction: store the hash + minimal metadata (and, if needed, a PDC payload for that department).
3. Peers simulate and endorse; the orderer sequences the transaction into a block.
4. Peers commit the block to the ledger and update CouchDB (world state).
5. Later, anyone can verify integrity by recomputing the hash from PostgreSQL and comparing with the on‑chain hash.

### HA and PITR (in plain words)
- **HA (High Availability)**: Run multiple nodes for each critical component so a failure doesn’t cause downtime (e.g., 3 orderers, 2 peers per org, 2 API servers).
- **PITR (Point‑In‑Time Recovery)**: Ability to restore PostgreSQL to an exact moment (e.g., “yesterday 14:05”) using WAL logs, to recover from mistakes or corruption.


