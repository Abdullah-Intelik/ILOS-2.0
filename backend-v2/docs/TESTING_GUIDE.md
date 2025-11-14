# ILOS V2.0 - Testing Guide

Professional testing strategy and implementation

---

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Complete workflows
     /      \    - User scenarios
    /________\   
   /          \  Integration Tests (Some)
  /____________\ - API endpoints
 /              \- Database operations
/________________\
     Unit Tests    (Many)
     - Services
     - Repositories
     - Utilities
```

---

## 📁 Test Structure

```
tests/
├── setup.js                    # Test configuration
├── unit/                       # Unit tests (fast, isolated)
│   ├── services/
│   │   ├── party.service.test.js
│   │   └── application.service.test.js
│   └── repositories/
│       └── base.repository.test.js
├── integration/                # Integration tests (with DB)
│   └── api/
│       ├── applications.test.js
│       └── parties.test.js
└── e2e/                        # End-to-end tests (full flow)
    └── complete-flow.test.js
```

---

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests sequentially
npm run test:all
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📊 Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Lines | 70% | - |
| Branches | 70% | - |
| Functions | 70% | - |
| Statements | 70% | - |

View detailed coverage: `open coverage/index.html`

---

## 🔧 Test Configuration

### Environment Variables

Tests use `.env.test`:

```env
NODE_ENV=test
PORT=6001
DB_NAME=ilos_v2_test
DB_USER=postgres
DB_PASSWORD=faez
```

### Jest Configuration

See `jest.config.js`:

```javascript
{
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThresholds: { global: { lines: 70 } }
}
```

---

## ✅ Writing Tests

### Unit Test Example

```javascript
describe('PartyService', () => {
  let service;
  let mockDb;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    service = new PartyService(mockDb);
  });

  it('should create party', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ party_id: 1 }] });
    
    const result = await service.createParty({...});
    
    expect(result.party_id).toBe(1);
    expect(mockDb.query).toHaveBeenCalled();
  });
});
```

### Integration Test Example

```javascript
describe('Applications API', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = getDatabase();
    await db.connect();
    app = createApp(db);
  });

  it('should create application', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .send({...})
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

### E2E Test Example

```javascript
describe('E2E: Complete Flow', () => {
  it('should complete full application flow', async () => {
    // 1. Create customer
    const customer = await request(app).post('/api/v1/parties').send({...});
    
    // 2. Create application
    const application = await request(app).post('/api/v1/applications').send({...});
    
    // 3. Submit application
    const submitted = await request(app).post(`/api/v1/applications/${id}/submit`);
    
    // 4. Verify final state
    expect(submitted.body.data.status).toBe('submitted');
  });
});
```

---

## 🗄️ Test Database Setup

### Create Test Database

```bash
# Create database
createdb ilos_v2_test

# Run migrations
cd database/migrations
for file in *.sql; do
  psql -U postgres -d ilos_v2_test -f "$file"
done

# Load test products
psql -U postgres -d ilos_v2_test -c "
INSERT INTO products (product_code, product_name, product_type, is_active, min_amount, max_amount)
VALUES ('CASHPLUS', 'Cash Plus', 'personal_loan', true, 50000, 2000000);
"
```

### Reset Test Database

```bash
# Drop and recreate
dropdb ilos_v2_test
createdb ilos_v2_test
# Run migrations again
```

---

## 📝 Best Practices

### 1. Test Naming

```javascript
// ✅ Good
it('should create application when data is valid')
it('should return 400 when required fields are missing')

// ❌ Bad
it('test1')
it('creates app')
```

### 2. Arrange-Act-Assert

```javascript
it('should...', () => {
  // Arrange
  const mockData = {...};
  mock.mockReturnValue(mockData);
  
  // Act
  const result = service.method();
  
  // Assert
  expect(result).toBe(expected);
});
```

### 3. Test Isolation

```javascript
// ✅ Clean up after each test
afterEach(async () => {
  await db.query('DELETE FROM test_table');
});

// ✅ Use unique identifiers
const testCnic = `TEST${Date.now()}`;
```

### 4. Mock External Dependencies

```javascript
// ✅ Mock database, APIs, file system
jest.mock('../database');
jest.mock('axios');

// ❌ Don't test external services directly
```

---

## 🔍 Running Specific Tests

### By File
```bash
npm test tests/unit/services/party.service.test.js
```

### By Pattern
```bash
npm test -- --testNamePattern="should create"
```

### By Tag
```bash
npm test -- --testPathPattern=unit
```

---

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 🐛 Debugging Tests

### Run with Debugging
```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code debugging
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

### Verbose Output
```bash
npm test -- --verbose
```

### See Console Logs
```bash
npm test -- --silent=false
```

---

## ✨ Advanced Testing

### Snapshot Testing
```javascript
expect(response).toMatchSnapshot();
```

### Async Testing
```javascript
it('should handle async', async () => {
  await expect(asyncFunction()).resolves.toBe(value);
  await expect(asyncFunction()).rejects.toThrow();
});
```

### Parameterized Tests
```javascript
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) = %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});
```

---

## 📊 Performance Testing

### Load Testing (with Artillery)
```yaml
# artillery.yml
config:
  target: 'http://localhost:6000'
scenarios:
  - flow:
      - post:
          url: '/api/v1/applications'
          json:
            party_id: 1
            amount: 100000
```

```bash
artillery run artillery.yml
```

---

## ✅ Checklist Before Deployment

- [ ] All tests passing
- [ ] Coverage > 70%
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security vulnerabilities checked
- [ ] Database migrations tested
- [ ] API documentation updated

---

## 🆘 Common Issues

### Tests Fail Locally
- Check test database exists
- Verify `.env.test` is correct
- Ensure migrations are run
- Clear jest cache: `npm test -- --clearCache`

### Tests Pass Locally, Fail in CI
- Check environment variables
- Verify database access
- Review timing issues (use `jest.setTimeout`)

### Flaky Tests
- Avoid relying on timing
- Use proper cleanup (`afterEach`)
- Don't share state between tests
- Use unique test data

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Run tests often • Write tests first • Keep tests fast** 🚀

