# ILOS V2.0 Backend

> **Industry-Standard Multi-Bank Loan Origination System**

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue)]()
[![Tests](https://img.shields.io/badge/tests-unit%20%7C%20integration%20%7C%20e2e-success)]()

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create & setup database
createdb ilos_v2_demo
cd database/migrations && # Run all .sql files

# 3. Start server
npm run dev
```

✅ **Server:** http://localhost:6000  
✅ **API:** http://localhost:6000/api/v1  
✅ **Health:** http://localhost:6000/api/v1/health

**→ See [Quick Test Guide](./docs/QUICK_TEST.md) for frontend connection**

---

## 📖 Documentation

Quick access to all documentation in [`docs/`](./docs):

| Guide | Purpose | Time |
|-------|---------|------|
| **[Quick Test](./docs/QUICK_TEST.md)** | Test backend + connect frontend | ⚡ 5 min |
| **[Testing Guide](./docs/TESTING_GUIDE.md)** | Professional testing strategy | 📚 15 min |
| **[Frontend Connection](./docs/FRONTEND_CONNECTION.md)** | Integrate with Next.js | 🔌 10 min |
| **[Setup Guide](./docs/SETUP_GUIDE.md)** | Complete installation | 📘 20 min |
| **[API Reference](./docs/TEST_API.md)** | API endpoints & testing | 📗 15 min |
| **[Complete Summary](./docs/COMPLETE_SUMMARY.md)** | Full architecture docs | 📕 30 min |

---

## ✨ Key Features

### Clean Architecture
- ✅ **Repository Pattern** - Data access layer
- ✅ **Service Layer** - Business logic
- ✅ **Controllers** - HTTP handling
- ✅ **Dependency Injection** - Loose coupling

### Professional Testing
- ✅ **Unit Tests** - Service & repository logic
- ✅ **Integration Tests** - API endpoints
- ✅ **E2E Tests** - Complete workflows
- ✅ **70% Coverage Target** - Industry standard

### Multi-Bank Support
- ✅ **Configuration-Driven** - JSON-based configs
- ✅ **Feature Flags** - Dynamic features
- ✅ **Bank-Specific Modules** - Customization
- ✅ **Separate Deployments** - Per-bank instances

### Production Ready
- ✅ **Security** - Helmet, CORS, validation
- ✅ **Performance** - Connection pooling, compression
- ✅ **Monitoring** - Comprehensive logging
- ✅ **Error Handling** - Graceful degradation

---

## 🧪 Testing

### Run All Tests
```bash
npm test                  # All tests with coverage
npm run test:unit        # Unit tests only
npm run test:integration # API integration tests
npm run test:e2e         # End-to-end workflows
npm run test:watch       # Watch mode
```

### View Coverage
```bash
npm run test:coverage
start coverage/index.html
```

**→ Full guide:** [Testing Guide](./docs/TESTING_GUIDE.md)

---

## 🔌 Frontend Connection

### Quick Setup

**1. Start Backend:**
```bash
cd "d:\ILOS 2.0\backend-v2"
npm run dev
```

**2. Configure Frontend:**
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:6000/api/v1
```

**3. Start Frontend:**
```bash
cd "d:\ILOS 2.0\frontend"
npm run dev
```

**→ Full guide:** [Frontend Connection](./docs/FRONTEND_CONNECTION.md)

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| **Server** | ✅ Running (port 6000) |
| **Database** | ✅ Connected (ilos_v2_demo) |
| **Tables** | ✅ 16 tables |
| **API** | ✅ 15+ endpoints |
| **Tests** | ✅ Unit, Integration, E2E |
| **CORS** | ✅ Configured for frontend |
| **Docs** | ✅ Complete |

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   Frontend (3000)   │  Next.js
└──────────┬──────────┘
           │ HTTP/REST
┌──────────▼──────────────────────┐
│   API Controllers (v1)          │  ← Request handling
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│   Business Services             │  ← Business logic
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│   Data Repositories             │  ← Data access
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│   PostgreSQL (5432)             │  ← Data storage
└─────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
backend-v2/
├── docs/                 # 📚 Complete documentation
│   ├── QUICK_TEST.md     # ⚡ 5-min quick start
│   ├── TESTING_GUIDE.md  # 🧪 Testing strategy
│   ├── FRONTEND_CONNECTION.md
│   └── ...
├── database/             # Database setup
│   ├── migrations/       # SQL migrations (run in order)
│   └── README.md         # Schema docs
├── tests/                # Professional test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # API tests
│   └── e2e/              # End-to-end tests
├── src/
│   ├── api/v1/           # API layer
│   ├── core/services/    # Business logic
│   ├── infrastructure/   # Database & repos
│   └── shared/           # Utilities
├── config/               # Bank configurations
├── server.js             # Entry point
└── jest.config.js        # Test configuration
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/parties/cnic/:cnic` | Get customer |
| POST | `/api/v1/parties` | Create customer |
| POST | `/api/v1/applications` | Create application |
| GET | `/api/v1/applications/:id` | Get application |
| POST | `/api/v1/applications/:id/submit` | Submit app |
| GET | `/api/v1/dashboard/metrics` | Dashboard data |

**→ Full API docs:** [API Reference](./docs/TEST_API.md)

---

## 🚀 Deployment

### Single Bank
```bash
export BANK_CODE=demo
export DB_NAME=ilos_demo
npm start
```

### Multi-Bank
```bash
# Bank 1
BANK_CODE=hbl DB_NAME=ilos_hbl PORT=6000 npm start

# Bank 2
BANK_CODE=mcb DB_NAME=ilos_mcb PORT=6001 npm start
```

**→ Full guide:** [Setup Guide](./docs/SETUP_GUIDE.md)

---

## 📈 Test Coverage

```
Test Suites: 3 (unit, integration, e2e)
Tests:       20+ professional tests
Coverage:    Target 70% (industry standard)
```

### Example Test Output

```
 PASS  tests/unit/services/party.service.test.js
 PASS  tests/integration/api/applications.test.js
 PASS  tests/e2e/complete-flow.test.js

Tests:       20 passed, 20 total
Time:        3.5s
Coverage:    Lines 75% | Branches 72% | Functions 78%
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=6000
BANK_CODE=demo
NODE_ENV=development

# Database
DB_NAME=ilos_v2_demo
DB_USER=postgres
DB_PASSWORD=faez

# Features
FEATURE_INSTANT_LOAN=true
FEATURE_MOBILE_APP=true
```

### Bank Configuration

```json
{
  "bank": {
    "code": "demo",
    "name": "Demo Bank"
  },
  "features": {
    "instantLoan": { "enabled": true }
  }
}
```

---

## 💡 Quick Commands

```bash
npm run dev           # Start development server
npm test              # Run all tests
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Generate coverage report
npm start             # Production server
```

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check database
psql -l | grep ilos_v2

# Check port
netstat -ano | findstr :6000
```

### Tests fail
```bash
# Setup test database
createdb ilos_v2_test

# Clear cache
npm test -- --clearCache
```

### Frontend can't connect
- Verify backend running on 6000
- Check `.env.local` has correct URL
- Restart frontend after env changes

**→ Full troubleshooting:** [Testing Guide](./docs/TESTING_GUIDE.md#-troubleshooting)

---

## 📚 Learn More

### For Developers
1. [Quick Test](./docs/QUICK_TEST.md) - Get started
2. [Testing Guide](./docs/TESTING_GUIDE.md) - Write tests
3. [API Reference](./docs/TEST_API.md) - API docs

### For DevOps
1. [Setup Guide](./docs/SETUP_GUIDE.md) - Installation
2. [Complete Summary](./docs/COMPLETE_SUMMARY.md) - Architecture

---

## ✅ What You Get

- ✅ **Clean codebase** - Industry-standard architecture
- ✅ **Professional tests** - Unit, integration, E2E
- ✅ **Complete docs** - Setup, API, testing guides
- ✅ **Frontend ready** - CORS configured, connection guide
- ✅ **Multi-bank** - Config-driven, easy deployment
- ✅ **Production ready** - Security, logging, monitoring

---

## 🎯 Next Steps

1. **Test it:** `npm test` → See all tests pass
2. **Run it:** `npm run dev` → Server starts
3. **Connect it:** [Frontend guide](./docs/FRONTEND_CONNECTION.md)
4. **Deploy it:** [Setup guide](./docs/SETUP_GUIDE.md)

---

**Professional • Tested • Documented • Production-Ready** 🚀
