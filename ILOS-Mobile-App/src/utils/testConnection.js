import apiService from './api';
import { debugLog, debugError } from './config';

export const testNetworkConnectivity = async () => {
  try {
    console.log('🌐 Testing basic network connectivity...');
    
    // Test 1: Basic fetch to a known endpoint
    const testResponse = await fetch('https://httpbin.org/get', {
      method: 'GET',
      timeout: 5000,
    });
    
    if (testResponse.ok) {
      console.log('✅ Basic internet connectivity: OK');
      return true;
    } else {
      console.log('❌ Basic internet connectivity: Failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error.message);
    return false;
  }
};

export const testBackendConnection = async () => {
  try {
    debugLog('🔍 Testing backend connection...');
    
    const response = await fetch('https://ilos-backend.vercel.app/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    
    return {
      success: true,
      data,
      message: 'Backend connection successful'
    };
    
  } catch (error) {
    debugError('❌ Backend connection failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: `Backend connection failed: ${error.message}`
    };
  }
};

export const testSpecificEndpoint = async (endpoint) => {
  try {
    debugLog(`🔍 Testing specific endpoint: ${endpoint}`);
    
    const response = await fetch(`http://10.0.2.2:5000${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Endpoint ${endpoint} successful:`, data);
    
    return {
      success: true,
      data,
      message: `Endpoint ${endpoint} is working correctly`
    };
    
  } catch (error) {
    debugError(`❌ Endpoint ${endpoint} failed:`, error);
    
    return {
      success: false,
      error: error.message,
      message: `Endpoint ${endpoint} failed: ${error.message}`
    };
  }
};

export const testAgentAssignments = async () => {
  try {
    debugLog('🔍 Testing agent assignments endpoint...');
    
    const response = await fetch('https://ilos-backend.vercel.app/api/applications/test/assignments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Agent assignments endpoint successful:', data);
    
    // Test filtering for a specific agent
    const agent001Assignments = data.assignments.filter(assignment => 
      assignment.agent_id === 'agent-001' && assignment.assignment_status === 'active'
    );
    
    console.log('✅ Agent-001 active assignments:', agent001Assignments);
    
    return {
      success: true,
      data,
      agentAssignments: agent001Assignments,
      message: `Agent assignments endpoint working. Found ${data.total_assignments} total assignments.`
    };
    
  } catch (error) {
    debugError('❌ Agent assignments endpoint failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: `Agent assignments endpoint failed: ${error.message}`
    };
  }
};

export const runAllTests = async () => {
  console.log('🧪 Running all connection tests...');
  
  const results = {
    network: await testNetworkConnectivity(),
    backend: await testBackendConnection(),
    health: await testSpecificEndpoint('/health'),
    eamvu: await testSpecificEndpoint('/api/applications/department/eamvu'),
    assignments: await testAgentAssignments(),
  };
  
  console.log('📊 Test Results:', results);
  
  return results;
};

export default {
  testNetworkConnectivity,
  testBackendConnection,
  testSpecificEndpoint,
  testAgentAssignments,
  runAllTests,
}; 