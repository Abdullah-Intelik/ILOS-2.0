## ILOS Documentation Index

- ARCHITECTURE.mmd
  - Mermaid source for the high-level architecture diagram.
  - Edit this file to update the diagram; export SVG/PNG with Mermaid CLI.

- ARCHITECTURE.png
  - High-resolution raster export of the architecture diagram.

- DEPLOYMENT-FABRIC-POSTGRES.md
  - Comprehensive deployment plan with architecture, Fabric integration, backup/DR, and PKR cost models.

- FABRIC-NODES-EXPLAINED.md
  - Plain-language explanation of orderers, peers, ledger vs CouchDB vs PDC vs PostgreSQL, and definitions of HA (High Availability) and PITR (Point-In-Time Recovery).

- STARTING-POINT.md
  - Environment and architecture checklist: development tools (including blockchain/smart contracts/networking), databases, integration methods, hosting, server sizing, encryption, and internet access (only EAMVU React Native app is internet-exposed).

### How to regenerate diagram exports
- Requires Docker Desktop and internet to pull the Mermaid CLI image.
- From repo root:
  - SVG: `docker run --rm -v "$PWD":/data ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:10.9.1 -i ilos-backend-2.0/docs/ARCHITECTURE.mmd -o ilos-backend-2.0/docs/ARCHITECTURE.svg -w 2800`
  - PNG: `docker run --rm -v "$PWD":/data ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:10.9.1 -i ilos-backend-2.0/docs/ARCHITECTURE.mmd -o ilos-backend-2.0/docs/ARCHITECTURE.png -w 2800 -s 2`
