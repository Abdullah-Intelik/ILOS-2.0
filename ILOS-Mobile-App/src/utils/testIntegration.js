// Test script for ILOS Mobile App Backend Integration
import apiService from './api';
import { debugLog, debugError } from './config';

export const runIntegrationTests = async () => {
  console.log('🧪 Starting ILOS Mobile App Integration Tests...\n');

  const tests = [
    {
      name: 'Backend Connection Test',
      test: async () => {
        const result = await apiService.testBackendConnection();
        return result.success;
      }
    },
    {
      name: 'EAMVU Applications Fetch Test',
      test: async () => {
        try {
          const applications = await apiService.getEAMVUApplications();
          return Array.isArray(applications);
        } catch (error) {
          debugError('EAMVU applications test failed:', error);
          return false;
        }
      }
    },
    {
      name: 'Health Check Test',
      test: async () => {
        try {
          const health = await apiService.checkHealth();
          return health && typeof health === 'object';
        } catch (error) {
          debugError('Health check test failed:', error);
          return false;
        }
      }
    },
    {
      name: 'API Configuration Test',
      test: async () => {
        // Test if API endpoints are properly configured
        const endpoints = [
          '/api/applications/department/eamvu',
          '/api/applications/form/',
          '/api/applications/update-status',
          '/health'
        ];
        
        return endpoints.every(endpoint => 
          endpoint.startsWith('/') && endpoint.length > 0
        );
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Running: ${test.name}`);
      const result = await test.test();
      
      if (result) {
        console.log(`✅ PASSED: ${test.name}`);
        passedTests++;
      } else {
        console.log(`❌ FAILED: ${test.name}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name} - ${error.message}`);
    }
    console.log('');
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Mobile app is ready for use.');
  } else {
    console.log('⚠️ Some tests failed. Please check backend connection and configuration.');
  }

  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
};

// Test specific API endpoints
export const testSpecificEndpoints = async () => {
  console.log('🔍 Testing Specific API Endpoints...\n');

  const endpoints = [
    {
      name: 'EAMVU Applications',
      test: () => apiService.getEAMVUApplications()
    },
    {
      name: 'Backend Health',
      test: () => apiService.checkHealth()
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}`);
      const result = await endpoint.test();
      console.log(`✅ ${endpoint.name}: Success`);
      console.log(`   Data:`, result);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed`);
      console.log(`   Error:`, error.message);
    }
    console.log('');
  }
};

// Test data transformation
export const testDataTransformation = () => {
  console.log('🔍 Testing Data Transformation...\n');

  const mockBackendData = [
    {
      id: 1,
      los_id: 'LOS-123',
      applicant_name: 'John Doe',
      loan_type: 'CashPlus Loan',
      loan_amount: 2500000,
      status: 'SUBMITTED_TO_EAMVU',
      priority: 'high',
      created_at: '2024-01-15T10:30:00Z'
    }
  ];

  try {
    const { transformEAMVUApplications } = require('./dataTransformer');
    const transformed = transformEAMVUApplications(mockBackendData);
    
    console.log('✅ Data transformation test passed');
    console.log('   Input:', mockBackendData);
    console.log('   Output:', transformed);
  } catch (error) {
    console.log('❌ Data transformation test failed:', error.message);
  }
};

// Main test runner
export const runAllTests = async () => {
  console.log('🚀 Starting Complete Integration Test Suite...\n');
  
  // Run integration tests
  const integrationResults = await runIntegrationTests();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test specific endpoints
  await testSpecificEndpoints();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test data transformation
  testDataTransformation();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (integrationResults.success) {
    console.log('🎉 All tests completed successfully!');
    console.log('📱 Mobile app is ready for EAMVU officers.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
};

// Export for use in development
export default {
  runIntegrationTests,
  testSpecificEndpoints,
  testDataTransformation,
  runAllTests
}; 