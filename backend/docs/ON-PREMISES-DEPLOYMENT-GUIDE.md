# ILOS On-Premises Enterprise Deployment Guide
**Immutable Loan Origination System - Container-Native Deployment**

---

**Document Version:** 2.0  
**Date:** October 2025  
**Prepared For:** Banking On-Premises Deployment  
**Architecture:** Microservices | Containerized | CI/CD Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Deployment Options](#3-deployment-options)
4. [Microservices Architecture](#4-microservices-architecture)
5. [Container Strategy](#5-container-strategy)
6. [Kubernetes Deployment](#6-kubernetes-deployment)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Infrastructure Requirements](#8-infrastructure-requirements)
9. [Database Setup](#9-database-setup)
10. [Security Configuration](#10-security-configuration)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Backup & Disaster Recovery](#12-backup--disaster-recovery)
13. [Deployment Procedures](#13-deployment-procedures)
14. [Troubleshooting](#14-troubleshooting)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

### 1.1 Overview

ILOS is an enterprise-grade loan origination system designed for modern banking operations. This deployment guide provides a comprehensive approach to deploying ILOS on-premises using containerized microservices with Kubernetes orchestration and automated CI/CD pipelines.

### 1.2 Key Features

- ✅ **Multi-Product Support**: Auto Loans, Cash Plus, Credit Cards, SME, Islamic Finance
- ✅ **Multi-Department Workflow**: PB, SPU, COPS, EAMVU, CIU, RRU, Risk, Compliance
- ✅ **ETB/NTB Customer Management**: Seamless existing and new customer handling
- ✅ **Mobile Field Operations**: React Native app for EAMVU officers
- ✅ **Automated Decision Engine**: AI-powered credit decisioning
- ✅ **External API Integration**: NADRA, ECIB, FRMS, PEP, Watchlist
- ✅ **Container-Native**: Docker & Kubernetes ready
- ✅ **CI/CD Ready**: Automated deployment pipelines

### 1.3 Deployment Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Planning & Preparation** | Week 1 | Infrastructure setup, team training |
| **Container Setup** | Week 2 | Docker images, registry setup |
| **CI/CD Implementation** | Week 3 | Pipeline configuration, automation |
| **Deployment & Testing** | Week 4-5 | Deploy to staging, UAT |
| **Production Go-Live** | Week 6 | Production deployment, monitoring |

**Total Estimated Timeline: 6 weeks**

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Internet / Bank Network                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │
                    │  (Nginx/HAProxy)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │  API Gateway │    │  Mobile API  │
│   (Next.js)  │    │  (Backend)   │    │  Endpoints   │
│   Port 3000  │    │  Port 5000   │    └──────────────┘
└──────────────┘    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Application  │  │  Document    │  │  Decision    │
│   Service    │  │   Service    │  │   Engine     │
│  Port 5001   │  │  Port 5002   │  │  Port 5004   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ├─────────────────┼──────────────────┤
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────────────────────────────────────┐
│         PostgreSQL Database Cluster          │
│         Primary (RW) + Replica (RO)          │
│              Port 5432                       │
└──────────────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   Persistent Storage   │
          │   (NFS/Ceph/GlusterFS) │
          │   Documents & Backups  │
          └────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Container Runtime** | Docker | 24+ | Container execution |
| **Orchestration** | Kubernetes | 1.28+ | Container orchestration |
| **Ingress Controller** | Nginx Ingress | Latest | Load balancing, SSL termination |
| **Frontend** | Next.js | 15.2.4 | Web application |
| **Backend** | Node.js + Express | 20 LTS + 5.1.0 | API server |
| **Mobile** | React Native | 0.80.2 | Mobile application |
| **Database** | PostgreSQL | 17+ | Primary data store |
| **Cache/Session** | Redis | 7+ | Caching, session management |
| **Monitoring** | Prometheus + Grafana | Latest | Metrics and visualization |
| **Logging** | ELK Stack (optional) | Latest | Centralized logging |
| **CI/CD** | GitLab CI / Jenkins | Latest | Automated deployment |

---

## 3. Deployment Options

### 3.1 Comparison Matrix

| Feature | Traditional PM2 | Docker Compose | Kubernetes |
|---------|----------------|----------------|------------|
| **Complexity** | ⭐ Low | ⭐⭐ Medium | ⭐⭐⭐ High |
| **Scalability** | Manual | Limited | Auto-scaling |
| **High Availability** | Manual setup | Limited | Built-in |
| **Rolling Updates** | Manual | Basic | Zero-downtime |
| **Resource Management** | Manual | Basic limits | Advanced quotas |
| **Multi-node** | Complex | Single node | Multi-node cluster |
| **Self-healing** | Via PM2 | Via restart policy | Built-in |
| **Service Discovery** | Manual | DNS | Automatic |
| **Load Balancing** | External | External | Built-in |
| **Secret Management** | Environment files | Docker secrets | Kubernetes secrets |
| **Learning Curve** | Low | Medium | Steep |
| **Operational Overhead** | Low | Medium | High |
| **Cost** | Low | Medium | High |
| **Best For** | Small banks | Medium banks | Enterprise banks |

### 3.2 Recommended Approach by Bank Size

#### Small Banks (< 500 applications/day)
```
✅ Docker Compose deployment
✅ Single-node or 2-node setup
✅ PostgreSQL on dedicated VM
✅ Basic GitLab CI/CD
✅ Monolithic architecture
✅ Manual scaling
Cost: $5K-15K infrastructure
Team: 2-3 IT staff
```

#### Medium Banks (500-2000 applications/day)
```
✅ Kubernetes deployment (3-node cluster)
✅ Container-native PostgreSQL
✅ Full CI/CD pipeline
✅ Semi-microservices (3-4 services)
✅ Auto-scaling for web tier
Cost: $20K-50K infrastructure
Team: 5-7 DevOps/IT staff
```

#### Large Banks (2000+ applications/day)
```
✅ Kubernetes deployment (5+ node cluster)
✅ PostgreSQL HA cluster
✅ Full CI/CD with blue-green deployment
✅ Full microservices architecture
✅ Service mesh (Istio)
✅ Multi-datacenter HA
Cost: $100K+ infrastructure
Team: 10+ DevOps/SRE staff
```

---

## 4. Microservices Architecture

### 4.1 Service Breakdown

#### Option A: Monolithic (Recommended for Phase 1)

```
┌─────────────────────────────────────┐
│        ILOS Backend Monolith        │
│                                     │
│  • All business logic               │
│  • Authentication & Authorization   │
│  • Application management           │
│  • Document handling                │
│  • External integrations            │
│  • Decision engine                  │
│                                     │
│  Port: 5000                         │
│  Replicas: 3-5                      │
└─────────────────────────────────────┘

Advantages:
✅ Simpler to develop and maintain
✅ Lower operational complexity
✅ Easier debugging and testing
✅ Better for smaller teams
✅ Faster initial deployment
```

#### Option B: Microservices (Recommended for Phase 2)

```
1. API Gateway Service (Port 5000)
   • Authentication & Authorization
   • Request routing
   • Rate limiting
   • API composition
   Replicas: 3
   Resources: 1 CPU, 2GB RAM

2. Application Service (Port 5001)
   • Loan application CRUD
   • Workflow orchestration
   • Status management
   • Department routing
   Replicas: 5
   Resources: 2 CPU, 4GB RAM

3. Document Service (Port 5002)
   • File upload/download
   • Document storage
   • Image processing
   • OCR integration
   Replicas: 3
   Resources: 1 CPU, 2GB RAM

4. External Integration Service (Port 5003)
   • NADRA API integration
   • ECIB credit bureau
   • FRMS fraud detection
   • PEP screening
   • Watchlist checking
   Replicas: 2
   Resources: 1 CPU, 2GB RAM

5. Decision Engine Service (Port 5004)
   • Credit scoring
   • Risk assessment
   • Automated decisioning
   • DBR calculation
   Replicas: 2
   Resources: 2 CPU, 4GB RAM

6. Notification Service (Port 5005)
   • Email notifications
   • SMS alerts
   • Push notifications
   • Webhook callbacks
   Replicas: 2
   Resources: 0.5 CPU, 1GB RAM

7. Reporting Service (Port 5006)
   • Analytics
   • Report generation
   • Data export
   • Business intelligence
   Replicas: 1
   Resources: 1 CPU, 2GB RAM

8. Frontend Service (Port 3000)
   • Next.js SSR
   • Web UI
   Replicas: 2
   Resources: 1 CPU, 2GB RAM
```

---

## 5. Container Strategy

### 5.1 Backend Dockerfile

```dockerfile
# Backend Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

### 5.2 Frontend Dockerfile

```dockerfile
# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 5.3 Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: ilos-postgres
    environment:
      POSTGRES_DB: ilos_db
      POSTGRES_USER: ilos_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/neon_ilos_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    ports:
      - "5432:5432"
    networks:
      - ilos-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ilos-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    networks:
      - ilos-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ilos-backend
    environment:
      DATABASE_URL: postgresql://ilos_user:${DB_PASSWORD}@postgres:5432/ilos_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      NODE_ENV: production
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    networks:
      - ilos-network
    volumes:
      - ./documents:/app/documents
      - ./logs:/app/logs
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ilos-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - ilos-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: ilos-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - ilos-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  ilos-network:
    driver: bridge
```

---

## 6. Kubernetes Deployment

### 6.1 Namespace and ConfigMaps

```yaml
# k8s/00-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ilos-production
  labels:
    name: ilos-production
    environment: production
---
# k8s/01-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ilos-backend-config
  namespace: ilos-production
data:
  NODE_ENV: "production"
  PORT: "5000"
  LOG_LEVEL: "info"
  CORS_ORIGINS: "https://ilos.yourbank.com"
---
apiVersion: v1
kind: Secret
metadata:
  name: ilos-secrets
  namespace: ilos-production
type: Opaque
stringData:
  DATABASE_URL: "postgresql://ilos_user:password@postgres:5432/ilos_db"
  JWT_ACCESS_SECRET: "your-jwt-secret"
  JWT_REFRESH_SECRET: "your-jwt-refresh-secret"
  SESSION_SECRET: "your-session-secret"
  ENCRYPTION_KEY: "your-encryption-key"
```

### 6.2 Backend Deployment

```yaml
# k8s/03-backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ilos-backend
  namespace: ilos-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ilos-backend
  template:
    metadata:
      labels:
        app: ilos-backend
    spec:
      containers:
      - name: backend
        image: yourbank.registry.com/ilos-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: ilos-backend-config
        - secretRef:
            name: ilos-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ilos-backend-service
  namespace: ilos-production
spec:
  type: ClusterIP
  selector:
    app: ilos-backend
  ports:
  - port: 5000
    targetPort: 5000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ilos-backend-hpa
  namespace: ilos-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ilos-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 6.3 Ingress Configuration

```yaml
# k8s/05-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ilos-ingress
  namespace: ilos-production
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - ilos.yourbank.com
    - api.ilos.yourbank.com
    secretName: ilos-tls-secret
  rules:
  - host: ilos.yourbank.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ilos-frontend-service
            port:
              number: 3000
  - host: api.ilos.yourbank.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ilos-backend-service
            port:
              number: 5000
```

---

## 7. CI/CD Pipeline

### 7.1 GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - security
  - deploy-staging
  - deploy-production

variables:
  DOCKER_REGISTRY: registry.yourbank.com

build-backend:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - cd backend
    - docker build -t $DOCKER_REGISTRY/ilos-backend:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/ilos-backend:$CI_COMMIT_SHA
  only:
    - main
    - develop

test-backend:
  stage: test
  image: node:20-alpine
  script:
    - cd backend
    - npm ci
    - npm run test
    - npm run lint
  only:
    - main
    - develop

security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --severity HIGH,CRITICAL $DOCKER_REGISTRY/ilos-backend:$CI_COMMIT_SHA
  only:
    - main

deploy-production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/ilos-backend ilos-backend=$DOCKER_REGISTRY/ilos-backend:$CI_COMMIT_SHA -n ilos-production
    - kubectl rollout status deployment/ilos-backend -n ilos-production
  when: manual
  only:
    - main
```

---

## 8. Infrastructure Requirements

### 8.1 Hardware Requirements

#### Kubernetes Cluster

**Master Nodes (3 for HA):**
- CPU: 4 cores each
- RAM: 8GB each
- Disk: 100GB SSD

**Worker Nodes (5+):**
- CPU: 8 cores each
- RAM: 32GB each
- Disk: 500GB SSD

**Database Server:**
- CPU: 16 cores
- RAM: 64GB
- Disk: 1TB SSD (RAID 10)

**Storage:**
- Capacity: 2TB minimum
- Type: NFS/Ceph/GlusterFS
- IOPS: 5000+ for production

---

## 9. Database Setup

### 9.1 PostgreSQL Configuration

```sql
-- PostgreSQL Settings for Production

-- Memory (for 64GB RAM)
shared_buffers = 16GB
effective_cache_size = 48GB
maintenance_work_mem = 2GB
work_mem = 64MB

-- Connections
max_connections = 200

-- WAL
wal_level = replica
max_wal_size = 4GB

-- Performance
random_page_cost = 1.1  # SSD
effective_io_concurrency = 200
```

### 9.2 Database Initialization

```bash
# Create databases
kubectl exec -it postgres-0 -n ilos-production -- psql -U postgres

CREATE DATABASE ilos_db OWNER ilos_user;
CREATE DATABASE cbs_db OWNER ilos_user;

# Import schemas
kubectl cp ./database/neon_ilos_schema.sql ilos-production/postgres-0:/tmp/
kubectl exec -it postgres-0 -n ilos-production -- psql -U ilos_user -d ilos_db -f /tmp/neon_ilos_schema.sql
```

---

## 10. Security Configuration

### 10.1 Network Policies

```yaml
# k8s/07-network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ilos-network-policy
  namespace: ilos-production
spec:
  podSelector:
    matchLabels:
      app: ilos-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: ilos-frontend
    ports:
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

---

## 11. Monitoring & Observability

### 11.1 Prometheus Setup

```yaml
# k8s/10-prometheus.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: ilos-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
```

### 11.2 Key Metrics

```
Application Metrics:
• Request rate (req/sec)
• Response time (p50, p95, p99)
• Error rate (4xx, 5xx)
• Database query performance

Infrastructure Metrics:
• CPU/Memory usage per pod
• Disk I/O and usage
• Network throughput
• Pod restart count

Business Metrics:
• Applications processed/hour
• Department processing times
• Approval/rejection rates
```

---

## 12. Backup & Disaster Recovery

### 12.1 Backup Strategy

```
Database Backups:
• Full: Daily at 2 AM
• Incremental: Every 6 hours
• Retention: 30 days local, 90 days remote

Document Storage:
• Incremental: Every 6 hours
• Full: Weekly
• Retention: 90 days

RTO: 4 hours
RPO: 6 hours
```

### 12.2 Recovery Procedures

```bash
# Database Recovery
LATEST_BACKUP=$(ls -t /backups/ilos_db_*.dump | head -1)
kubectl cp $LATEST_BACKUP ilos-production/postgres-0:/tmp/restore.dump
kubectl exec -it postgres-0 -n ilos-production -- \
  pg_restore -U ilos_user -d ilos_db -c /tmp/restore.dump

# Application Recovery
kubectl apply -f k8s/
kubectl rollout status deployment/ilos-backend -n ilos-production
```

---

## 13. Deployment Procedures

### 13.1 Initial Deployment

```bash
# 1. Create namespace
kubectl apply -f k8s/00-namespace.yaml

# 2. Create secrets and configmaps
kubectl apply -f k8s/01-configmap.yaml

# 3. Deploy database
kubectl apply -f k8s/02-postgres.yaml

# 4. Deploy backend
kubectl apply -f k8s/03-backend.yaml

# 5. Deploy frontend
kubectl apply -f k8s/04-frontend.yaml

# 6. Setup ingress
kubectl apply -f k8s/05-ingress.yaml

# 7. Verify deployment
kubectl get pods -n ilos-production
kubectl get svc -n ilos-production
```

### 13.2 Update Deployment

```bash
# Update image
kubectl set image deployment/ilos-backend \
  ilos-backend=yourbank.registry.com/ilos-backend:v2.0 \
  -n ilos-production

# Monitor rollout
kubectl rollout status deployment/ilos-backend -n ilos-production

# Rollback if needed
kubectl rollout undo deployment/ilos-backend -n ilos-production
```

---

## 14. Troubleshooting

### 14.1 Common Issues

#### Pod Crashes

```bash
# Check pod status
kubectl get pods -n ilos-production

# View logs
kubectl logs <pod-name> -n ilos-production

# Describe pod
kubectl describe pod <pod-name> -n ilos-production

# Check previous logs
kubectl logs <pod-name> --previous -n ilos-production
```

#### Database Connection

```bash
# Test connectivity
kubectl exec -it postgres-0 -n ilos-production -- \
  psql -U ilos_user -d ilos_db -c "SELECT 1"

# Check service
kubectl get svc postgres -n ilos-production

# Test from backend
kubectl exec -it deployment/ilos-backend -n ilos-production -- sh
psql postgresql://ilos_user:password@postgres:5432/ilos_db -c "SELECT 1"
```

---

## 15. Appendices

### 15.1 Essential Commands

```bash
# Kubernetes
kubectl get pods -n ilos-production
kubectl logs -f <pod-name> -n ilos-production
kubectl exec -it <pod-name> -n ilos-production -- sh
kubectl scale deployment ilos-backend --replicas=5 -n ilos-production

# Docker
docker build -t registry.yourbank.com/ilos-backend:latest .
docker push registry.yourbank.com/ilos-backend:latest
docker-compose up -d
docker-compose logs -f

# Database
psql -h localhost -U ilos_user -d ilos_db
pg_dump -U ilos_user -Fc ilos_db > backup.dump
pg_restore -U ilos_user -d ilos_db backup.dump
```

### 15.2 Port Reference

```
Application:
• 3000 - Frontend
• 5000 - Backend API
• 5001-5006 - Microservices
• 8003 - Decision Engine

Infrastructure:
• 5432 - PostgreSQL
• 6379 - Redis
• 9090 - Prometheus
• 3000 - Grafana (monitoring)
• 80/443 - Nginx Ingress
```

### 15.3 Deployment Size Guidelines

#### Small (< 500 apps/day)
- Docker Compose
- 2-3 nodes
- Cost: $5K-15K
- Team: 2-3 people

#### Medium (500-2000 apps/day)
- Kubernetes (5 nodes)
- Full CI/CD
- Cost: $20K-50K
- Team: 5-7 people

#### Large (2000+ apps/day)
- Kubernetes (10+ nodes)
- Microservices
- Cost: $100K+
- Team: 10+ people

---

## Conclusion

This guide provides a complete roadmap for deploying ILOS in an enterprise banking environment using modern container-native technologies.

### Recommended Deployment Path

**Phase 1 (Months 1-3): Start Simple**
- Deploy with Docker Compose
- Monolithic architecture
- Basic CI/CD

**Phase 2 (Months 4-6): Scale Up**
- Migrate to Kubernetes
- Implement auto-scaling
- Enhanced monitoring

**Phase 3 (Months 7-12): Optimize**
- Split into microservices
- Advanced observability
- Multi-region HA

---

**Document Version:** 2.0  
**Last Updated:** October 2025  
**© 2025 ILOS - All Rights Reserved**

