// Error handling utilities for the GSC application

export interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: number;
  component?: string;
  action?: string;
}

export class AppError extends Error {
  public code: string;
  public timestamp: number;
  public component?: string;
  public action?: string;

  constructor(message: string, code = 'UNKNOWN_ERROR', component?: string, action?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = Date.now();
    this.component = component;
    this.action = action;
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  SUPABASE_ERROR: 'SUPABASE_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;

export const handleError = (error: unknown, component?: string, action?: string): ErrorInfo => {
  console.error(`Error in ${component || 'Unknown'} during ${action || 'unknown action'}:`, error);

  let errorInfo: ErrorInfo;

  if (error instanceof AppError) {
    errorInfo = {
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      component: error.component || component,
      action: error.action || action,
    };
  } else if (error instanceof Error) {
    errorInfo = {
      message: error.message,
      code: ErrorCodes.NETWORK_ERROR,
      timestamp: Date.now(),
      component,
      action,
    };
  } else {
    errorInfo = {
      message: 'An unknown error occurred',
      code: ErrorCodes.NETWORK_ERROR,
      timestamp: Date.now(),
      component,
      action,
    };
  }

  // Log to console for debugging
  console.error('Processed error:', errorInfo);

  return errorInfo;
};

export const showErrorWithHomeOption = (errorMessage: string, title = 'Error') => {
  const shouldGoHome = confirm(`${title}: ${errorMessage}\n\nWould you like to go back to the home page?`);
  if (shouldGoHome) {
    window.location.href = '/';
  }
};

export const validateBlockchainData = (data: any): void => {
  if (!data) {
    throw new AppError('Blockchain data is null or undefined', ErrorCodes.VALIDATION_ERROR);
  }

  if (!data.chain || !Array.isArray(data.chain)) {
    throw new AppError('Invalid blockchain: missing chain array', ErrorCodes.VALIDATION_ERROR);
  }

  if (!data.balances || typeof data.balances !== 'object') {
    throw new AppError('Invalid blockchain: missing balances object', ErrorCodes.VALIDATION_ERROR);
  }

  if (data.chain.length === 0) {
    throw new AppError('Blockchain chain is empty', ErrorCodes.VALIDATION_ERROR);
  }

  // Validate each block in the chain
  data.chain.forEach((block: any, index: number) => {
    if (!block.index && block.index !== 0) {
      throw new AppError(`Block ${index} missing index`, ErrorCodes.VALIDATION_ERROR);
    }
    if (!block.hash) {
      throw new AppError(`Block ${index} missing hash`, ErrorCodes.VALIDATION_ERROR);
    }
    if (!Array.isArray(block.transactions)) {
      throw new AppError(`Block ${index} missing transactions array`, ErrorCodes.VALIDATION_ERROR);
    }
  });
};

export const validateFileUpload = (file: File): void => {
  if (!file) {
    throw new AppError('No file selected', ErrorCodes.FILE_UPLOAD_ERROR);
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new AppError('File too large. Maximum size is 10MB.', ErrorCodes.FILE_UPLOAD_ERROR);
  }

  // Check file type
  if (!file.name.endsWith('.json') && !file.name.endsWith('.blockchain')) {
    throw new AppError('Invalid file type. Please select a .json or .blockchain file.', ErrorCodes.FILE_UPLOAD_ERROR);
  }
};

export const testErrorHandling = () => {
  console.log('🧪 Testing error handling...');
  
  const testCases = [
    {
      name: 'Network Error',
      test: () => {
        throw new AppError('Network connection failed', ErrorCodes.NETWORK_ERROR, 'TestComponent', 'networkTest');
      }
    },
    {
      name: 'Validation Error',
      test: () => {
        validateBlockchainData({ chain: [], balances: {} });
      }
    },
    {
      name: 'File Upload Error',
      test: () => {
        const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
        validateFileUpload(mockFile);
      }
    }
  ];

  testCases.forEach(({ name, test }) => {
    try {
      test();
      console.log(`❌ ${name}: Should have thrown an error`);
    } catch (error) {
      const errorInfo = handleError(error, 'TestComponent', name);
      console.log(`✅ ${name}: Correctly caught error -`, errorInfo.message);
    }
  });

  console.log('🧪 Error handling tests completed');
};
