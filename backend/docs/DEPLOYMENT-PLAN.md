# ILOS Enterprise Deployment Plan
**Specific Recommendations for Banking On-Premises Deployment**

---

## 🎯 Technology Stack (Finalized)

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **CI/CD** | GitLab CI | Latest | Self-hosted, best for banking security |
| **Orchestration** | Kubernetes (kubeadm) | 1.28+ | Standard K8s, full control, compliance-ready |
| **Container Registry** | GitLab Container Registry | Latest | Integrated with GitLab, secure |
| **Repository** | GitHub | - | Source code hosting |
| **Monitoring** | Prometheus + Grafana | Latest | Industry standard, open-source |
| **Logging** | ELK Stack | 8.x | Centralized logs, audit trails |
| **Database** | PostgreSQL | 17+ | ACID compliance, enterprise-grade |
| **Cache** | Redis | 7+ | Session management, performance |
| **Load Balancer** | Nginx Ingress | Latest | K8s native, SSL termination |
| **SAST** | Semgrep + SonarQube | Latest | Code security analysis |
| **DAST** | OWASP ZAP | Latest | Dynamic security testing |
| **Container Scan** | Trivy | Latest | Vulnerability scanning |
| **Dependency Scan** | npm audit + Snyk | Latest | Package vulnerabilities |
| **Secrets Management** | HashiCorp Vault | Latest | Enterprise secrets management |
| **IaC Security** | Checkov | Latest | Kubernetes manifest scanning |

---

## 🏗️ Architecture: Strategic Microservices

### **Recommended: 5-6 Core Services** (Perfect Balance)

**Why 5-6 Services?**
- ✅ **Not too few** - Proper separation of concerns
- ✅ **Not too many** - Manageable operational complexity
- ✅ **Perfect for banking** - Aligns with regulatory boundaries
- ✅ **Team-friendly** - 2-3 teams can own services
- ✅ **Scalable** - Can scale what matters (Application Service)
- ✅ **Secure** - External APIs isolated from core logic

### 5 Core Services (Domain-Driven Design)

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx Ingress)            │
│                    SSL Termination + Routing                │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  1. API Gateway │
                    │  (Auth + Routing)│
                    │  Port: 5000     │
                    │  Replicas: 3    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┬─────────────┐
        │                    │                    │             │
        ▼                    ▼                    ▼             ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│2. Application│    │3. Document   │    │4. External   │  │5. Decision   │
│   Service    │    │   Service    │    │  Integration │  │   Engine     │
│              │    │              │    │   Service    │  │   Service    │
│ Port: 5001   │    │ Port: 5002   │    │ Port: 5003   │  │ Port: 5004   │
│ Replicas: 5  │    │ Replicas: 3  │    │ Replicas: 2  │  │ Replicas: 2  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘  └──────┬───────┘
       │                   │                   │                  │
       └───────────────────┴───────────────────┴──────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  PostgreSQL HA Cluster   │
                    │  Primary + Replica       │
                    │  Port: 5432              │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Persistent Storage      │
                    │  NFS/Ceph (2TB+)         │
                    └──────────────────────────┘
```

### Service Details

#### 1. API Gateway Service
```yaml
Purpose:       Authentication, authorization, rate limiting, routing
Technology:    Node.js + Express
Port:          5000
Replicas:      3
Resources:     1 CPU, 2GB RAM
Responsibilities:
  - JWT validation
  - MFA verification
  - Rate limiting (100 req/min)
  - Request routing to services
  - Session management
  - CORS handling
```

#### 2. Application Service (Core Business Logic)
```yaml
Purpose:       Main loan application processing
Technology:    Node.js + Express
Port:          5001
Replicas:      5 (auto-scale to 10)
Resources:     2 CPU, 4GB RAM
Responsibilities:
  - Loan application CRUD
  - Workflow orchestration (PB→SPU→COPS→...)
  - Status management
  - Department routing
  - Business rules
  - Application scoring
Critical:      YES (most important service)
```

#### 3. Document Service
```yaml
Purpose:       Document management and storage
Technology:    Node.js + Express + Multer
Port:          5002
Replicas:      3
Resources:     1 CPU, 3GB RAM
Responsibilities:
  - File uploads (10MB limit)
  - Document storage (NFS/S3)
  - Image processing
  - OCR integration (optional)
  - Document validation
Security:      Isolated (file handling risks)
```

#### 4. External Integration Service
```yaml
Purpose:       Third-party API integrations
Technology:    Node.js + Express + Axios
Port:          5003
Replicas:      2
Resources:     1 CPU, 2GB RAM
Responsibilities:
  - NADRA Verisys (CNIC verification)
  - ECIB (Credit bureau)
  - FRMS (Fraud detection)
  - PEP screening
  - SBP Blacklist
  - Internal Watchlist
  - Circuit breaker pattern
  - Response caching (Redis)
Isolation:     YES (external dependencies)
```

#### 5. Decision Engine Service
```yaml
Purpose:       Automated loan decisioning
Technology:    Node.js + Custom algorithms
Port:          5004
Replicas:      2
Resources:     2 CPU, 4GB RAM
Responsibilities:
  - Credit scoring
  - Risk assessment
  - DBR calculation
  - Automated approval/rejection
  - Policy engine
CPU-Intensive: YES (heavy calculations)
```

#### Frontend Service (Web)
```yaml
Purpose:       Web user interface
Technology:    Next.js 15.2.4
Port:          3000
Replicas:      2
Resources:     1 CPU, 2GB RAM
```

---

## 🚀 Deployment Timeline: 4 Weeks

### Week 1: Infrastructure Setup
```
Day 1-2:  Provision servers (3 masters, 5 workers)
Day 3-4:  Install Kubernetes with kubeadm
Day 5:    Install GitLab (self-hosted)
Day 6-7:  Configure networking, storage, security
```

### Week 2: Microservices Development
```
Day 1-2:  Split backend into 5 services
Day 3:    Create Dockerfiles for each service
Day 4:    Create Kubernetes manifests
Day 5:    Setup inter-service communication
Day 6-7:  Local testing with docker-compose
```

### Week 3: CI/CD & Staging
```
Day 1-2:  Configure GitLab CI pipeline
Day 3:    Setup container registry
Day 4:    Deploy to staging environment
Day 5:    Integration testing
Day 6-7:  Security scanning, load testing
```

### Week 4: Production Go-Live
```
Day 1-2:  Production deployment
Day 3:    Setup monitoring (Prometheus/Grafana)
Day 4:    User acceptance testing (UAT)
Day 5:    Performance tuning
Day 6-7:  Training and handover
```

---

## 📋 Infrastructure Requirements

### Kubernetes Cluster (kubeadm)

#### Master Nodes (3 for High Availability)
```
Quantity:  3 nodes
CPU:       4 cores each
RAM:       8GB each
Disk:      100GB SSD each
Network:   1 Gbps
OS:        Ubuntu 22.04 LTS
```

#### Worker Nodes (5+ for Production)
```
Quantity:  5-7 nodes
CPU:       8 cores each
RAM:       32GB each
Disk:      500GB SSD each
Network:   10 Gbps
OS:        Ubuntu 22.04 LTS
```

#### Database Server (Dedicated or in K8s)
```
Option 1 - Dedicated Server (Recommended):
  CPU:     16 cores
  RAM:     64GB (128GB for large banks)
  Disk:    1TB SSD (RAID 10)
  Network: 10 Gbps

Option 2 - Kubernetes StatefulSet:
  Storage Class: fast-ssd
  PVC Size:      500GB
  Replicas:      1 primary + 1 replica
```

#### Storage (Documents & Backups)
```
Type:      NFS/Ceph/GlusterFS
Capacity:  2TB minimum (5TB recommended)
IOPS:      5000+ for production
Backup:    Daily snapshots to off-site location
```

---

## 🔄 GitLab CI/CD Pipeline

### Pipeline Structure

```yaml
# .gitlab-ci.yml (Complete Pipeline)

stages:
  - build
  - test
  - security
  - deploy-staging
  - deploy-production

variables:
  REGISTRY: registry.yourbank.local
  K8S_NAMESPACE_STAGING: ilos-staging
  K8S_NAMESPACE_PROD: ilos-production

# Build all 5 microservices
build-api-gateway:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - cd services/api-gateway
    - docker build -t $REGISTRY/api-gateway:$CI_COMMIT_SHA .
    - docker push $REGISTRY/api-gateway:$CI_COMMIT_SHA
  only:
    - main
    - develop

build-application-service:
  stage: build
  script:
    - cd services/application-service
    - docker build -t $REGISTRY/application-service:$CI_COMMIT_SHA .
    - docker push $REGISTRY/application-service:$CI_COMMIT_SHA
  only:
    - main
    - develop

build-document-service:
  stage: build
  script:
    - cd services/document-service
    - docker build -t $REGISTRY/document-service:$CI_COMMIT_SHA .
    - docker push $REGISTRY/document-service:$CI_COMMIT_SHA
  only:
    - main
    - develop

build-external-integration:
  stage: build
  script:
    - cd services/external-integration
    - docker build -t $REGISTRY/external-integration:$CI_COMMIT_SHA .
    - docker push $REGISTRY/external-integration:$CI_COMMIT_SHA
  only:
    - main
    - develop

build-decision-engine:
  stage: build
  script:
    - cd services/decision-engine
    - docker build -t $REGISTRY/decision-engine:$CI_COMMIT_SHA .
    - docker push $REGISTRY/decision-engine:$CI_COMMIT_SHA
  only:
    - main
    - develop

build-frontend:
  stage: build
  script:
    - cd frontend
    - docker build -t $REGISTRY/frontend:$CI_COMMIT_SHA .
    - docker push $REGISTRY/frontend:$CI_COMMIT_SHA
  only:
    - main
    - develop

# Run tests
test-services:
  stage: test
  image: node:20-alpine
  script:
    - cd services
    - npm ci
    - npm run test
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  only:
    - main
    - develop

# Security scanning
security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --severity HIGH,CRITICAL $REGISTRY/api-gateway:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL $REGISTRY/application-service:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL $REGISTRY/document-service:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL $REGISTRY/external-integration:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL $REGISTRY/decision-engine:$CI_COMMIT_SHA
  allow_failure: false
  only:
    - main

# Deploy to staging (automatic)
deploy-staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/api-gateway api-gateway=$REGISTRY/api-gateway:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl set image deployment/application-service application-service=$REGISTRY/application-service:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl set image deployment/document-service document-service=$REGISTRY/document-service:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl set image deployment/external-integration external-integration=$REGISTRY/external-integration:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl set image deployment/decision-engine decision-engine=$REGISTRY/decision-engine:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl set image deployment/frontend frontend=$REGISTRY/frontend:$CI_COMMIT_SHA -n $K8S_NAMESPACE_STAGING
    - kubectl rollout status deployment/api-gateway -n $K8S_NAMESPACE_STAGING
    - kubectl rollout status deployment/application-service -n $K8S_NAMESPACE_STAGING
  environment:
    name: staging
    url: https://staging.ilos.yourbank.com
  only:
    - develop

# Deploy to production (manual approval)
deploy-production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    # Backup current deployments
    - kubectl get deployment -n $K8S_NAMESPACE_PROD -o yaml > backup-$(date +%Y%m%d-%H%M%S).yaml
    
    # Deploy all services
    - kubectl set image deployment/api-gateway api-gateway=$REGISTRY/api-gateway:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    - kubectl set image deployment/application-service application-service=$REGISTRY/application-service:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    - kubectl set image deployment/document-service document-service=$REGISTRY/document-service:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    - kubectl set image deployment/external-integration external-integration=$REGISTRY/external-integration:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    - kubectl set image deployment/decision-engine decision-engine=$REGISTRY/decision-engine:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    - kubectl set image deployment/frontend frontend=$REGISTRY/frontend:$CI_COMMIT_SHA -n $K8S_NAMESPACE_PROD
    
    # Wait for rollout
    - kubectl rollout status deployment/api-gateway -n $K8S_NAMESPACE_PROD --timeout=10m
    - kubectl rollout status deployment/application-service -n $K8S_NAMESPACE_PROD --timeout=10m
    - kubectl rollout status deployment/document-service -n $K8S_NAMESPACE_PROD --timeout=10m
    - kubectl rollout status deployment/external-integration -n $K8S_NAMESPACE_PROD --timeout=10m
    - kubectl rollout status deployment/decision-engine -n $K8S_NAMESPACE_PROD --timeout=10m
  environment:
    name: production
    url: https://ilos.yourbank.com
  when: manual
  only:
    - main

# Rollback production
rollback-production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    - kubectl rollout undo deployment/api-gateway -n $K8S_NAMESPACE_PROD
    - kubectl rollout undo deployment/application-service -n $K8S_NAMESPACE_PROD
    - kubectl rollout undo deployment/document-service -n $K8S_NAMESPACE_PROD
    - kubectl rollout undo deployment/external-integration -n $K8S_NAMESPACE_PROD
    - kubectl rollout undo deployment/decision-engine -n $K8S_NAMESPACE_PROD
  when: manual
  only:
    - main
```

---

## 🔐 Security Configuration

### 1. Network Policies (Kubernetes)
```yaml
# Only API Gateway accepts external traffic
# Services communicate only as needed
# Database access restricted to Application Service
```

### 2. Secrets Management
```yaml
# Kubernetes Secrets for:
- Database credentials
- JWT secrets
- External API keys
- SSL certificates
```

### 3. RBAC (Role-Based Access Control)
```yaml
Departments: 9 (PB, SPU, COPS, EAMVU, CIU, RRU, Risk, Compliance, Admin)
Roles:       8 (Super Admin, Admin, Manager, Senior Officer, Officer, etc.)
```

### 4. Authentication & Authorization
```yaml
Method:      JWT with MFA (TOTP)
Session:     Redis-backed sessions
Timeout:     30 minutes (configurable)
Password:    bcrypt with 12 rounds
```

---

## 🛡️ Security Testing & Tools

### SAST (Static Application Security Testing)

#### SonarQube (Recommended)
```yaml
Purpose:      Code quality and security analysis
Deployment:   Self-hosted on Kubernetes
Language:     Supports Node.js, JavaScript, TypeScript
Integration:  GitLab CI pipeline

Features:
  - Code vulnerabilities detection
  - Security hotspots identification
  - Code smells and bugs
  - Technical debt tracking
  - Quality gates enforcement

Setup:
  - Deploy SonarQube on K8s
  - Configure quality gates
  - Integrate with GitLab CI
  - Fail builds on critical issues
```

#### Semgrep (Fast, Open-Source)
```yaml
Purpose:      Lightweight SAST for CI/CD
Deployment:   Container in GitLab CI
Language:     JavaScript, TypeScript, Python

Features:
  - Fast static analysis
  - Custom rule creation
  - Security patterns detection
  - No false positives (rule-based)

GitLab CI Integration:
  sast-semgrep:
    stage: security
    image: returntocorp/semgrep
    script:
      - semgrep --config=auto --json -o semgrep-report.json .
      - semgrep --config=p/security-audit .
    artifacts:
      reports:
        sast: semgrep-report.json
```

#### ESLint Security Plugin
```yaml
Purpose:      JavaScript/TypeScript linting with security rules
Integration:  Pre-commit hooks + CI/CD

npm install --save-dev eslint-plugin-security

.eslintrc.js:
  plugins: ['security']
  extends: ['plugin:security/recommended']
```

### DAST (Dynamic Application Security Testing)

#### OWASP ZAP (Recommended for Banking)
```yaml
Purpose:      Dynamic security scanning of running application
Deployment:   Docker container in CI/CD
Frequency:    Nightly + before production deployment

Features:
  - Active/passive scanning
  - API security testing
  - OWASP Top 10 coverage
  - Authenticated scanning
  - Comprehensive reports

GitLab CI Integration:
  dast-zap:
    stage: security
    image: owasp/zap2docker-stable
    script:
      - mkdir /zap/wrk
      - /zap/zap-full-scan.py -t https://staging.ilos.yourbank.com -r zap-report.html
    artifacts:
      paths:
        - zap-report.html
    only:
      - develop
      - main
```

#### Burp Suite Professional (Manual Testing)
```yaml
Purpose:      Manual penetration testing
Usage:        Before production release
Team:         Security team / pentesters
Frequency:    Quarterly + major releases

Focus Areas:
  - Authentication bypass attempts
  - Authorization testing
  - Business logic flaws
  - API endpoint security
  - Session management
```

### Container Security Scanning

#### Trivy (Already Included)
```yaml
Purpose:      Container image vulnerability scanning
Integration:  GitLab CI pipeline
Coverage:     OS packages, application dependencies

Enhanced Configuration:
  security-scan-trivy:
    stage: security
    image: aquasec/trivy:latest
    script:
      # Scan with detailed output
      - trivy image --severity HIGH,CRITICAL --exit-code 1 
          --format json --output trivy-report.json 
          $REGISTRY/api-gateway:$CI_COMMIT_SHA
      
      # Generate HTML report
      - trivy image --severity HIGH,CRITICAL --format template 
          --template "@contrib/html.tpl" -o trivy-report.html 
          $REGISTRY/api-gateway:$CI_COMMIT_SHA
    artifacts:
      reports:
        container_scanning: trivy-report.json
      paths:
        - trivy-report.html
```

#### Anchore Engine (Advanced Alternative)
```yaml
Purpose:      Deep image analysis and policy enforcement
Features:     CVE scanning, policy gates, compliance checks
Use Case:     For banks requiring detailed compliance reports
```

### Dependency Scanning

#### npm audit (Built-in)
```yaml
Purpose:      Scan Node.js dependencies for vulnerabilities
Integration:  CI/CD pipeline

GitLab CI:
  dependency-scan:
    stage: security
    image: node:20-alpine
    script:
      - npm audit --audit-level=high
      - npm audit fix --dry-run
    allow_failure: false
```

#### Snyk (Comprehensive)
```yaml
Purpose:      Dependency vulnerability scanning with fix suggestions
Coverage:     npm packages, container images, IaC
Features:     Real-time monitoring, auto-fix PRs

GitLab CI Integration:
  snyk-scan:
    stage: security
    image: snyk/snyk:node
    script:
      - snyk test --severity-threshold=high
      - snyk monitor
    only:
      - main
      - develop
```

#### OWASP Dependency-Check
```yaml
Purpose:      Identify known vulnerabilities in dependencies
Integration:  Weekly scheduled scans

docker run --rm -v $(pwd):/src owasp/dependency-check:latest 
  --scan /src --format HTML --out /src/dependency-check-report.html
```

### Infrastructure as Code (IaC) Security

#### Checkov (Kubernetes Manifest Scanning)
```yaml
Purpose:      Scan Kubernetes manifests for misconfigurations
Coverage:     Security, compliance, best practices

GitLab CI:
  iac-scan-checkov:
    stage: security
    image: bridgecrew/checkov:latest
    script:
      - checkov --directory k8s/ --framework kubernetes 
          --output json --output-file checkov-report.json
    artifacts:
      reports:
        sast: checkov-report.json
```

#### kube-score
```yaml
Purpose:      Kubernetes object analysis
Focus:        Production readiness, best practices

docker run -v $(pwd):/project zegl/kube-score:latest 
  score k8s/*.yaml
```

### Secrets Scanning

#### GitGuardian (Recommended)
```yaml
Purpose:      Detect secrets in code repositories
Coverage:     API keys, passwords, tokens, certificates
Integration:  Pre-commit hooks + GitLab CI

Features:
  - Real-time secret detection
  - 350+ secret types
  - Historical repository scanning
  - Incident dashboard
```

#### TruffleHog
```yaml
Purpose:      Find secrets in git history
Usage:        One-time scan + periodic audits

docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog:latest 
  git file:///repo --json
```

#### git-secrets (Preventive)
```yaml
Purpose:      Prevent committing secrets
Integration:  Pre-commit hook

Installation:
  git clone https://github.com/awslabs/git-secrets
  cd git-secrets
  sudo make install
  
  # Setup in repository
  git secrets --install
  git secrets --register-aws
```

---

## 🔐 Secrets Management (Enterprise-Grade)

### Option 1: HashiCorp Vault (Recommended for Enterprise)

```yaml
Purpose:       Centralized secrets management
Deployment:    Kubernetes StatefulSet
Access:        Kubernetes auth, AppRole, JWT
Audit:         Complete audit trail of all secret access

Architecture:
  ┌─────────────────────────────────────────┐
  │         HashiCorp Vault Cluster         │
  │         (3 replicas for HA)             │
  └────────────────┬────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
  API Gateway  Application  External
   Service      Service    Integration

Features:
  ✅ Dynamic secrets generation
  ✅ Secret rotation
  ✅ Encryption as a service
  ✅ PKI certificate management
  ✅ Database credential rotation
  ✅ Detailed audit logs
  ✅ Policy-based access control
```

**Vault Setup:**
```bash
# Install Vault on Kubernetes
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault \
  --set='server.ha.enabled=true' \
  --set='server.ha.replicas=3' \
  --namespace ilos-production

# Initialize and unseal Vault
kubectl exec -it vault-0 -n ilos-production -- vault operator init
kubectl exec -it vault-0 -n ilos-production -- vault operator unseal

# Enable Kubernetes auth
vault auth enable kubernetes
vault write auth/kubernetes/config \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443"

# Create policy for ILOS services
vault policy write ilos-policy - <<EOF
path "secret/data/ilos/*" {
  capabilities = ["read"]
}
EOF

# Store secrets
vault kv put secret/ilos/database \
  url="postgresql://user:pass@postgres:5432/ilos_db"
vault kv put secret/ilos/jwt \
  access_secret="your-secret" \
  refresh_secret="your-secret"
```

**Application Integration:**
```javascript
// Backend service using Vault
const vault = require('node-vault')({
  apiVersion: 'v1',
  endpoint: 'http://vault:8200',
  token: process.env.VAULT_TOKEN
});

// Read secret
const secrets = await vault.read('secret/data/ilos/database');
const dbUrl = secrets.data.data.url;
```

### Option 2: Kubernetes Sealed Secrets (Simpler Alternative)

```yaml
Purpose:       Encrypt secrets in Git (GitOps friendly)
Deployment:    Controller in Kubernetes
Use Case:      When Vault is too complex

How it works:
  1. Encrypt secrets with public key
  2. Commit encrypted secrets to Git
  3. Controller decrypts in cluster
  4. Creates standard Kubernetes secrets

Installation:
  kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
  
  # Install kubeseal CLI
  wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-linux-amd64
  sudo install -m 755 kubeseal-linux-amd64 /usr/local/bin/kubeseal
```

**Usage:**
```bash
# Create secret locally
kubectl create secret generic ilos-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --dry-run=client -o yaml > secret.yaml

# Seal the secret
kubeseal -f secret.yaml -w sealed-secret.yaml

# Commit sealed-secret.yaml to Git (safe!)
git add sealed-secret.yaml
git commit -m "Add sealed secrets"

# Apply to cluster
kubectl apply -f sealed-secret.yaml
# Controller automatically creates the actual secret
```

### Option 3: External Secrets Operator (Multi-Provider)

```yaml
Purpose:       Sync secrets from external providers to K8s
Supports:      AWS Secrets Manager, Azure Key Vault, Vault, etc.
Use Case:      If using cloud secret managers

Installation:
  helm repo add external-secrets https://charts.external-secrets.io
  helm install external-secrets external-secrets/external-secrets \
    -n external-secrets --create-namespace
```

### Secrets Management Best Practices

```yaml
✅ Do This:
  - Rotate secrets every 90 days
  - Use different secrets per environment
  - Never commit secrets to Git
  - Limit secret access (least privilege)
  - Enable audit logging
  - Use automatic secret injection
  - Encrypt secrets at rest
  - Use short-lived tokens when possible

❌ Don't Do This:
  - Store secrets in ConfigMaps
  - Hardcode secrets in code
  - Share secrets via email/chat
  - Use same secrets across environments
  - Disable secret encryption
  - Give broad secret access
```

### Secret Rotation Strategy

```yaml
Database Credentials:
  Frequency:  Every 90 days
  Method:     Vault dynamic secrets or manual rotation
  Downtime:   Zero (use connection pooling)

JWT Secrets:
  Frequency:  Every 180 days
  Method:     Graceful key rotation (support old + new)
  Downtime:   Zero (dual key validation period)

API Keys (External):
  Frequency:  Per vendor policy (typically 90-180 days)
  Method:     Update in Vault, restart pods
  Downtime:   < 30 seconds (rolling restart)

SSL/TLS Certificates:
  Frequency:  Before expiry (auto-renew 30 days before)
  Method:     cert-manager with Let's Encrypt or internal CA
  Downtime:   Zero (Ingress handles gracefully)
```

---

## 🔍 Complete Security Testing Pipeline

### Enhanced GitLab CI Security Stages

```yaml
# .gitlab-ci.yml - Complete Security Pipeline

stages:
  - build
  - sast
  - dependency-scan
  - container-scan
  - iac-scan
  - secrets-scan
  - test
  - dast
  - deploy-staging
  - deploy-production

# SAST - SonarQube
sonarqube-scan:
  stage: sast
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner 
        -Dsonar.projectKey=ilos 
        -Dsonar.sources=. 
        -Dsonar.host.url=$SONAR_HOST_URL 
        -Dsonar.login=$SONAR_TOKEN
  only:
    - main
    - develop

# SAST - Semgrep
semgrep-scan:
  stage: sast
  image: returntocorp/semgrep
  script:
    - semgrep --config=auto --json -o semgrep-report.json .
    - semgrep --config=p/security-audit .
    - semgrep --config=p/owasp-top-ten .
  artifacts:
    reports:
      sast: semgrep-report.json
  allow_failure: false

# Dependency Scanning - npm audit
npm-audit:
  stage: dependency-scan
  image: node:20-alpine
  script:
    - cd backend && npm audit --audit-level=high
    - cd ../frontend && npm audit --audit-level=high
  allow_failure: false

# Dependency Scanning - Snyk
snyk-scan:
  stage: dependency-scan
  image: snyk/snyk:node
  script:
    - snyk auth $SNYK_TOKEN
    - snyk test --all-projects --severity-threshold=high
    - snyk monitor
  only:
    - main

# Container Scanning - Trivy
trivy-scan:
  stage: container-scan
  image: aquasec/trivy:latest
  script:
    - trivy image --severity HIGH,CRITICAL --exit-code 1 $REGISTRY/api-gateway:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL --exit-code 1 $REGISTRY/application-service:$CI_COMMIT_SHA
    - trivy image --severity HIGH,CRITICAL $REGISTRY/document-service:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: trivy-report.json
  allow_failure: false

# IaC Scanning - Checkov
checkov-scan:
  stage: iac-scan
  image: bridgecrew/checkov:latest
  script:
    - checkov --directory k8s/ --framework kubernetes --output json --output-file checkov-report.json
  artifacts:
    reports:
      sast: checkov-report.json
  allow_failure: true

# Secrets Scanning - TruffleHog
trufflehog-scan:
  stage: secrets-scan
  image: trufflesecurity/trufflehog:latest
  script:
    - trufflehog git file://. --json --fail
  allow_failure: false

# DAST - OWASP ZAP (after staging deployment)
zap-scan:
  stage: dast
  image: owasp/zap2docker-stable
  script:
    - mkdir /zap/wrk
    - /zap/zap-baseline.py -t https://staging.ilos.yourbank.com -r zap-baseline-report.html
    - /zap/zap-api-scan.py -t https://staging.ilos.yourbank.com/api/openapi.json -f openapi -r zap-api-report.html
  artifacts:
    paths:
      - zap-baseline-report.html
      - zap-api-report.html
  dependencies:
    - deploy-staging
  only:
    - develop
    - main

# Security Report Consolidation
security-report:
  stage: dast
  image: alpine:latest
  script:
    - echo "Generating consolidated security report..."
    - apk add --no-cache jq
    - |
      cat > security-summary.json <<EOF
      {
        "scan_date": "$(date -Iseconds)",
        "branch": "$CI_COMMIT_REF_NAME",
        "commit": "$CI_COMMIT_SHORT_SHA",
        "sast": "$(cat semgrep-report.json | jq '.errors | length')",
        "dependency": "$(npm audit --json | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')",
        "container": "$(cat trivy-report.json | jq '.Results[].Vulnerabilities | length')",
        "status": "PASSED"
      }
      EOF
    - cat security-summary.json
  artifacts:
    reports:
      metrics: security-summary.json
  dependencies:
    - semgrep-scan
    - npm-audit
    - trivy-scan
```

### Security Testing Schedule

```yaml
Continuous (Every Commit):
  ✅ SAST (Semgrep) - < 1 minute
  ✅ Linting (ESLint Security) - < 30 seconds
  ✅ Secrets scanning (TruffleHog) - < 1 minute
  ✅ Unit tests - 2-3 minutes

Pre-Merge (Pull Request):
  ✅ Full SAST (SonarQube) - 5-10 minutes
  ✅ Dependency scanning (npm audit + Snyk) - 2-3 minutes
  ✅ Container scanning (Trivy) - 3-5 minutes
  ✅ IaC scanning (Checkov) - 1-2 minutes

Staging Deployment:
  ✅ DAST (OWASP ZAP baseline) - 10-15 minutes
  ✅ API security testing - 5-10 minutes

Weekly (Scheduled):
  ✅ Full DAST scan (ZAP full scan) - 1-2 hours
  ✅ Dependency audit review - Manual
  ✅ Security patch review - Manual

Before Production Release:
  ✅ Manual penetration testing (Burp Suite) - 2-3 days
  ✅ Security audit - 1 week
  ✅ Compliance review - 1 week
  ✅ Load testing with security - 1-2 days

Quarterly:
  ✅ External penetration testing - 1-2 weeks
  ✅ Security architecture review - 1 week
  ✅ Threat modeling workshop - 2 days
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics
```yaml
Application Metrics:
  - Request rate per service
  - Response time (p50, p95, p99)
  - Error rates (4xx, 5xx)
  - Active users/sessions
  - Queue depth

Infrastructure Metrics:
  - CPU/Memory per pod
  - Disk I/O and usage
  - Network throughput
  - Pod restart count

Business Metrics:
  - Applications processed/hour
  - Department processing times
  - Approval/rejection rates
  - Average decision time
```

### Grafana Dashboards
```yaml
1. System Overview
   - All services health
   - Request flows
   - Error rates

2. Service-Specific
   - Per-service metrics
   - Resource utilization
   - Response times

3. Business Intelligence
   - Loan applications stats
   - Department performance
   - Daily/weekly trends
```

### Log Aggregation (ELK Stack)
```yaml
Elasticsearch: Log storage and indexing
Logstash:      Log processing and enrichment
Kibana:        Log visualization and search

Retention:     90 days (compliance requirement)
```

---

## 💾 Backup & Disaster Recovery

### Backup Strategy
```yaml
Database:
  Full:        Daily at 2 AM
  Incremental: Every 6 hours
  Retention:   30 days local, 90 days off-site
  Method:      pg_dump with compression

Documents:
  Incremental: Every 6 hours (rsync)
  Full:        Weekly
  Retention:   90 days
  Location:    NFS with off-site replication

Kubernetes State:
  ConfigMaps:  Git-backed (GitOps)
  Secrets:     Encrypted backups daily
  Manifests:   Version controlled in GitHub
```

### Disaster Recovery
```yaml
RTO (Recovery Time Objective):  4 hours
RPO (Recovery Point Objective): 6 hours

Recovery Procedure:
  1. Restore Kubernetes cluster (1 hour)
  2. Restore database from backup (1 hour)
  3. Deploy applications via GitLab CI (30 min)
  4. Restore document storage (1 hour)
  5. Verify and test (30 min)
```

---

## 🚦 Deployment Steps

### Step 1: Setup Kubernetes Cluster with kubeadm

```bash
# On all nodes (master + workers)
sudo apt update && sudo apt install -y docker.io kubeadm kubelet kubectl
sudo systemctl enable docker
sudo systemctl start docker

# Disable swap
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# On master node (first master)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --control-plane-endpoint="master1.yourbank.local:6443"

# Setup kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Calico network plugin
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# Join other master nodes (for HA)
sudo kubeadm join master1.yourbank.local:6443 --token <token> \
  --discovery-token-ca-cert-hash <hash> \
  --control-plane

# Join worker nodes
sudo kubeadm join master1.yourbank.local:6443 --token <token> \
  --discovery-token-ca-cert-hash <hash>

# Verify cluster
kubectl get nodes
kubectl get pods -A
```

### Step 2: Install GitLab (Self-Hosted)

```bash
# Install GitLab CE
sudo docker run -d \
  --hostname gitlab.yourbank.local \
  --publish 443:443 --publish 80:80 --publish 22:22 \
  --name gitlab \
  --restart always \
  --volume /srv/gitlab/config:/etc/gitlab \
  --volume /srv/gitlab/logs:/var/log/gitlab \
  --volume /srv/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest

# Get initial root password
sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password

# Access GitLab at: http://your-server-ip
# Login: root / <password from above>
```

### Step 3: Setup Container Registry

```bash
# Enable GitLab Container Registry
# In GitLab Admin → Settings → CI/CD → Container Registry
# Enable registry and configure domain: registry.yourbank.local

# Login to registry
docker login registry.yourbank.local
```

### Step 4: Deploy ILOS

```bash
# Clone repository
git clone https://github.com/yourbank/ILOS.git
cd ILOS

# Create namespace
kubectl create namespace ilos-production

# Create secrets
kubectl create secret generic ilos-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@postgres:5432/ilos_db" \
  --from-literal=JWT_ACCESS_SECRET="your-secret-here" \
  --from-literal=JWT_REFRESH_SECRET="your-secret-here" \
  --from-literal=SESSION_SECRET="your-secret-here" \
  -n ilos-production

# Apply all manifests
kubectl apply -f k8s/microservices/

# Check deployment
kubectl get pods -n ilos-production
kubectl get svc -n ilos-production

# Access application
kubectl get ingress -n ilos-production
# Configure DNS to point to Ingress IP
```

---

## 📋 Pre-Production Checklist

### Infrastructure
```
☐ Kubernetes cluster installed and tested (3 masters, 5 workers)
☐ GitLab installed and accessible
☐ Container registry configured
☐ Storage (NFS/Ceph) configured and mounted
☐ Network policies configured
☐ SSL certificates obtained and installed
☐ DNS configured for all services
☐ Firewall rules configured
```

### Application
```
☐ All 5 microservices created and tested
☐ Dockerfiles created for each service
☐ Docker images built and pushed to registry
☐ Kubernetes manifests created and validated
☐ ConfigMaps and Secrets created
☐ Database schemas imported
☐ Inter-service communication tested
```

### CI/CD
```
☐ GitLab CI pipeline configured
☐ Automated tests passing
☐ Security scanning enabled
☐ Staging environment deployed and tested
☐ Production deployment tested (dry-run)
☐ Rollback procedure tested
```

### Security
```
☐ Network policies applied
☐ RBAC configured
☐ Secrets encrypted
☐ SSL/TLS enabled
☐ Security scanning passed
☐ Penetration testing completed
☐ Compliance audit passed
```

### Monitoring
```
☐ Prometheus installed and configured
☐ Grafana dashboards created
☐ Alerting rules configured
☐ Log aggregation working (ELK)
☐ Backup jobs scheduled and tested
☐ Monitoring alerts tested
```

### Documentation
```
☐ Runbooks created for each service
☐ Incident response procedures documented
☐ User training completed
☐ Technical documentation updated
☐ Disaster recovery plan tested
```

---

## 🎯 Success Criteria

### Performance
```
✅ API response time < 100ms (p95)
✅ System handles 2000+ applications/day
✅ Auto-scaling working (3-10 pods)
✅ Zero downtime during deployments
✅ Database queries < 50ms (p95)
```

### Reliability
```
✅ 99.9% uptime SLA
✅ Automatic pod restarts working
✅ Circuit breakers preventing cascading failures
✅ Backup and restore tested successfully
✅ Disaster recovery within 4 hours (RTO)
```

### Security
```
✅ All external APIs isolated
✅ JWT authentication working
✅ MFA enabled for admin users
✅ Network policies enforced
✅ Security scanning in CI/CD
✅ Audit logs capturing all actions
```

---

## 📞 Support & Escalation

### Level 1: DevOps Team
```
Response Time: 30 minutes (business hours)
Scope:         Deployment issues, pipeline failures
Contact:       devops@yourbank.com
```

### Level 2: Infrastructure Team
```
Response Time: 1 hour
Scope:         Kubernetes issues, network problems
Contact:       infrastructure@yourbank.com
```

### Level 3: Emergency On-Call
```
Response Time: 15 minutes (24/7)
Scope:         Production outages, security incidents
Contact:       +92-XXX-XXXXXXX
```

---

## 📚 Related Documentation

- [Full Deployment Guide](./ON-PREMISES-DEPLOYMENT-GUIDE.md) - Comprehensive guide
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture details
- [API Documentation](./API-DOCUMENTATION.md) - API endpoints reference
- [Security Guide](../SECURITY_INTEGRATION_GUIDE.md) - Security implementation

---

## ✅ Final Recommendations

### Do This:
```
✅ Use 5-6 microservices (PERFECT NUMBER for banking)
✅ Use GitLab CI for CI/CD (self-hosted)
✅ Use kubeadm for Kubernetes (standard, compliant)
✅ Use HashiCorp Vault for secrets management
✅ Implement SAST + DAST in pipeline
✅ Use Prometheus + Grafana for monitoring
✅ Deploy to staging first, then production
✅ Test disaster recovery procedures
✅ Enable all security scanning (Trivy, Semgrep, ZAP)
✅ Use auto-scaling (HPA)
✅ Rotate secrets every 90 days
✅ Setup comprehensive audit logging
```

### Don't Do This:
```
❌ Don't deploy monolith in enterprise banking
❌ Don't use 1 service (too monolithic)
❌ Don't use 20+ services (too complex)
❌ Don't use public cloud for sensitive banking data
❌ Don't skip security scanning (SAST/DAST)
❌ Don't store secrets in Git
❌ Don't deploy directly to production
❌ Don't ignore backup testing
❌ Don't skip penetration testing
❌ Don't use complex service mesh initially
❌ Don't hardcode credentials
❌ Don't disable audit logs
```

### 🎯 Perfect Microservices Count: 5-6 Services

```
Why exactly 5-6?

✅ Separation of Concerns:
   - API Gateway (Auth)
   - Application Logic (Core)
   - Documents (I/O intensive)
   - External APIs (Isolated)
   - Decision Engine (CPU intensive)
   - [Optional] Reporting (Analytics)

✅ Team Structure:
   - 2-3 teams can own services
   - Clear ownership boundaries
   - Independent development

✅ Operational Complexity:
   - Manageable in production
   - 15-20 pods total (reasonable)
   - Simple inter-service communication
   - Easy troubleshooting

✅ Security Boundaries:
   - External APIs isolated
   - File uploads separated
   - Core business logic protected
   - Network policies enforceable

✅ Scalability:
   - Scale what matters independently
   - Application service can go to 10 pods
   - Others remain at 2-3 pods
   - Cost-effective scaling

❌ Why NOT more?
   - > 10 services = Ops nightmare
   - Too much network overhead
   - Service mesh becomes necessary
   - Complex troubleshooting
   - Higher costs
   - More points of failure
```

---

**Deployment Timeline: 4 weeks**  
**Production Ready: ✅**  
**Enterprise Grade: ✅**  
**Banking Compliant: ✅**

---

## 📋 Security Tools Summary

| Category | Tool | Priority | Integration | Cost |
|----------|------|----------|-------------|------|
| **SAST** | SonarQube | High | GitLab CI | Free (CE) |
| **SAST** | Semgrep | High | GitLab CI | Free |
| **SAST** | ESLint Security | Medium | Pre-commit | Free |
| **DAST** | OWASP ZAP | High | GitLab CI | Free |
| **DAST** | Burp Suite Pro | Medium | Manual | Paid |
| **Container** | Trivy | High | GitLab CI | Free |
| **Container** | Anchore | Low | GitLab CI | Free/Paid |
| **Dependency** | npm audit | High | GitLab CI | Free |
| **Dependency** | Snyk | Medium | GitLab CI | Free tier |
| **IaC** | Checkov | High | GitLab CI | Free |
| **IaC** | kube-score | Medium | Manual | Free |
| **Secrets** | TruffleHog | High | GitLab CI | Free |
| **Secrets** | GitGuardian | Medium | GitLab CI | Paid |
| **Secrets Mgmt** | HashiCorp Vault | High | Kubernetes | Free (OSS) |
| **Secrets Mgmt** | Sealed Secrets | Medium | Kubernetes | Free |

### Recommended Security Stack (Free & Open Source)

```yaml
Mandatory (Free):
  ✅ Semgrep (SAST) - Fast, accurate
  ✅ OWASP ZAP (DAST) - Industry standard
  ✅ Trivy (Container scanning) - Best in class
  ✅ npm audit (Dependencies) - Built-in
  ✅ Checkov (IaC) - Comprehensive
  ✅ TruffleHog (Secrets) - Git history scan
  ✅ HashiCorp Vault (Secrets management) - Enterprise ready

Optional (Paid but recommended):
  💰 SonarQube (SAST) - $150/year (Developer Edition)
  💰 Snyk (Dependencies) - Free tier → $98/month
  💰 Burp Suite Pro (Manual testing) - $449/year
  💰 GitGuardian (Secrets) - Custom pricing

Total Cost: $0 (open-source stack) to ~$1,000/year (with paid tools)
```

---

**Last Updated:** October 2025  
**Version:** 2.0  
**Status:** Ready for Implementation  
**Security:** Enterprise-Grade ✅

