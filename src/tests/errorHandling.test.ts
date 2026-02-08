// Comprehensive test suite for error handling
import { testErrorHandling, validateBlockchainData, validateFileUpload, AppError, ErrorCodes } from '@/utils/errorHandling';

// Test data
const validBlockchainData = {
  chain: [
    {
      index: 0,
      hash: "test-hash",
      transactions: [],
      timestamp: Date.now(),
      previous_hash: "0"
    }
  ],
  balances: {
    "test-address": 100
  },
  mempool: [],
  difficulty: 4,
  mining_reward: 50
};

const invalidBlockchainData = {
  chain: [],
  balances: {}
};

// Test Cases
export const runAllTests = () => {
  console.log('🚀 Starting comprehensive error handling tests...');
  
  let passedTests = 0;
  let totalTests = 0;

  const test = (name: string, testFn: () => void) => {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${name}: PASSED`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}: FAILED -`, error);
    }
  };

  // Test 1: Valid blockchain data validation
  test('Valid blockchain data validation', () => {
    validateBlockchainData(validBlockchainData);
  });

  // Test 2: Invalid blockchain data validation
  test('Invalid blockchain data validation (should throw)', () => {
    try {
      validateBlockchainData(invalidBlockchainData);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      if (!(error instanceof AppError)) {
        throw new Error('Should throw AppError');
      }
    }
  });

  // Test 3: Null blockchain data validation
  test('Null blockchain data validation (should throw)', () => {
    try {
      validateBlockchainData(null);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      if (!(error instanceof AppError)) {
        throw new Error('Should throw AppError');
      }
    }
  });

  // Test 4: Valid file upload validation
  test('Valid file upload validation', () => {
    const validFile = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
    validateFileUpload(validFile);
  });

  // Test 5: Invalid file type validation
  test('Invalid file type validation (should throw)', () => {
    try {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      validateFileUpload(invalidFile);
      throw new Error('Should have thrown file upload error');
    } catch (error) {
      if (!(error instanceof AppError)) {
        throw new Error('Should throw AppError');
      }
    }
  });

  // Test 6: Large file validation
  test('Large file validation (should throw)', () => {
    try {
      // Create a mock file that's too large
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.json', { type: 'application/json' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
      validateFileUpload(largeFile);
      throw new Error('Should have thrown file upload error');
    } catch (error) {
      if (!(error instanceof AppError)) {
        throw new Error('Should throw AppError');
      }
    }
  });

  // Test 7: AppError creation
  test('AppError creation', () => {
    const error = new AppError('Test message', ErrorCodes.NETWORK_ERROR, 'TestComponent', 'testAction');
    if (error.message !== 'Test message') throw new Error('Wrong message');
    if (error.code !== ErrorCodes.NETWORK_ERROR) throw new Error('Wrong code');
    if (error.component !== 'TestComponent') throw new Error('Wrong component');
    if (error.action !== 'testAction') throw new Error('Wrong action');
  });

  // Test 8: Error handling utility
  test('Error handling utility', () => {
    testErrorHandling();
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Error handling is working correctly.');
    return true;
  } else {
    console.log('⚠️ Some tests failed. Please check the error handling implementation.');
    return false;
  }
};

// Integration tests for specific components
export const testComponentErrorHandling = () => {
  console.log('🧪 Testing component-specific error handling...');

  // Test localStorage availability
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage: Available');
  } catch (error) {
    console.log('❌ localStorage: Not available -', error);
  }

  // Test JSON parsing
  try {
    JSON.parse('{"valid": "json"}');
    console.log('✅ JSON parsing: Working');
  } catch (error) {
    console.log('❌ JSON parsing: Failed -', error);
  }

  // Test network connectivity (mock)
  try {
    // This would be a real network test in production
    console.log('✅ Network connectivity: Assumed available');
  } catch (error) {
    console.log('❌ Network connectivity: Failed -', error);
  }

  console.log('🧪 Component error handling tests completed');
};

// Development test exports removed for production
