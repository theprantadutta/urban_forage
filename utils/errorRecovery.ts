import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

// Error recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  REDIRECT = 'redirect',
  IGNORE = 'ignore',
}

// Error recovery configuration
interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackAction?: () => void;
  redirectPath?: string;
}

// Default recovery configurations for different error types
const DEFAULT_RECOVERY_CONFIGS: Record<ErrorType, ErrorRecoveryConfig> = {
  [ErrorType.NETWORK]: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  [ErrorType.SERVER]: {
    maxRetries: 2,
    retryDelay: 2000,
    exponentialBackoff: true,
  },
  [ErrorType.PERMISSION]: {
    maxRetries: 1,
    retryDelay: 0,
    exponentialBackoff: false,
  },
  [ErrorType.VALIDATION]: {
    maxRetries: 0,
    retryDelay: 0,
    exponentialBackoff: false,
  },
  [ErrorType.UNKNOWN]: {
    maxRetries: 1,
    retryDelay: 1000,
    exponentialBackoff: false,
  },
};

// Error recovery manager
class ErrorRecoveryManager {
  private retryAttempts: Map<string, number> = new Map();
  private recoveryConfigs: Map<ErrorType, ErrorRecoveryConfig> = new Map();

  constructor() {
    // Initialize with default configs
    Object.entries(DEFAULT_RECOVERY_CONFIGS).forEach(([type, config]) => {
      this.recoveryConfigs.set(type as ErrorType, config);
    });
  }

  // Set custom recovery config for an error type
  setRecoveryConfig(errorType: ErrorType, config: Partial<ErrorRecoveryConfig>) {
    const existingConfig = this.recoveryConfigs.get(errorType) || DEFAULT_RECOVERY_CONFIGS[errorType];
    this.recoveryConfigs.set(errorType, { ...existingConfig, ...config });
  }

  // Get recovery config for an error type
  getRecoveryConfig(errorType: ErrorType): ErrorRecoveryConfig {
    return this.recoveryConfigs.get(errorType) || DEFAULT_RECOVERY_CONFIGS[errorType];
  }

  // Attempt recovery for an error
  async attemptRecovery(
    errorKey: string,
    errorType: ErrorType,
    recoveryAction: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const config = this.getRecoveryConfig(errorType);
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;

    if (currentAttempts >= config.maxRetries) {
      return { success: false, error: new Error('Max retry attempts exceeded') };
    }

    try {
      // Calculate delay with exponential backoff if enabled
      const delay = config.exponentialBackoff 
        ? config.retryDelay * Math.pow(2, currentAttempts)
        : config.retryDelay;

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Increment retry count
      this.retryAttempts.set(errorKey, currentAttempts + 1);

      // Attempt recovery
      const result = await recoveryAction();
      
      // Reset retry count on success
      this.retryAttempts.delete(errorKey);
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // Reset retry count for a specific error
  resetRetryCount(errorKey: string) {
    this.retryAttempts.delete(errorKey);
  }

  // Clear all retry counts
  clearAllRetryCounts() {
    this.retryAttempts.clear();
  }

  // Get current retry count for an error
  getRetryCount(errorKey: string): number {
    return this.retryAttempts.get(errorKey) || 0;
  }
}

// Global error recovery manager instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// Hook for error recovery
export const useErrorRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<Error | null>(null);

  const attemptRecovery = useCallback(async (
    errorKey: string,
    errorType: ErrorType,
    recoveryAction: () => Promise<any>
  ) => {
    setIsRecovering(true);
    setRecoveryError(null);

    try {
      const result = await errorRecoveryManager.attemptRecovery(
        errorKey,
        errorType,
        recoveryAction
      );

      if (!result.success) {
        setRecoveryError(result.error || new Error('Recovery failed'));
      }

      return result;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const resetRetryCount = useCallback((errorKey: string) => {
    errorRecoveryManager.resetRetryCount(errorKey);
  }, []);

  const getRetryCount = useCallback((errorKey: string) => {
    return errorRecoveryManager.getRetryCount(errorKey);
  }, []);

  return {
    isRecovering,
    recoveryError,
    attemptRecovery,
    resetRetryCount,
    getRetryCount,
  };
};

// Error classification utility
export const classifyError = (error: any): ErrorType => {
  if (!error) return ErrorType.UNKNOWN;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || 
      error.message?.includes('Network') ||
      error.message?.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  // Server errors (5xx status codes)
  if (error.status >= 500 && error.status < 600) {
    return ErrorType.SERVER;
  }

  // Permission errors
  if (error.code === 'PERMISSION_DENIED' ||
      error.message?.includes('permission') ||
      error.message?.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  }

  // Validation errors (4xx status codes except 401, 403)
  if (error.status >= 400 && error.status < 500 && 
      error.status !== 401 && error.status !== 403) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
};

// Error persistence for offline recovery
class ErrorPersistence {
  private static STORAGE_KEY = '@error_recovery_queue';

  // Save failed operation for later retry
  static async saveFailedOperation(
    operationId: string,
    operation: any,
    errorType: ErrorType
  ): Promise<void> {
    try {
      const existingQueue = await this.getFailedOperations();
      const newOperation = {
        id: operationId,
        operation,
        errorType,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const updatedQueue = [...existingQueue, newOperation];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to save failed operation:', error);
    }
  }

  // Get all failed operations
  static async getFailedOperations(): Promise<any[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Failed to get failed operations:', error);
      return [];
    }
  }

  // Remove failed operation from queue
  static async removeFailedOperation(operationId: string): Promise<void> {
    try {
      const existingQueue = await this.getFailedOperations();
      const updatedQueue = existingQueue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to remove failed operation:', error);
    }
  }

  // Clear all failed operations
  static async clearFailedOperations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear failed operations:', error);
    }
  }
}

// Hook for offline error recovery
export const useOfflineErrorRecovery = () => {
  const [failedOperations, setFailedOperations] = useState<any[]>([]);
  const [isRetryingOfflineOperations, setIsRetryingOfflineOperations] = useState(false);

  // Load failed operations on mount
  useEffect(() => {
    loadFailedOperations();
  }, []);

  const loadFailedOperations = async () => {
    const operations = await ErrorPersistence.getFailedOperations();
    setFailedOperations(operations);
  };

  const saveFailedOperation = async (
    operationId: string,
    operation: any,
    errorType: ErrorType
  ) => {
    await ErrorPersistence.saveFailedOperation(operationId, operation, errorType);
    await loadFailedOperations();
  };

  const retryFailedOperations = async (
    retryFunction: (operation: any) => Promise<any>
  ) => {
    setIsRetryingOfflineOperations(true);

    try {
      const operations = await ErrorPersistence.getFailedOperations();
      
      for (const operation of operations) {
        try {
          await retryFunction(operation.operation);
          await ErrorPersistence.removeFailedOperation(operation.id);
        } catch (error) {
          console.error(`Failed to retry operation ${operation.id}:`, error);
        }
      }

      await loadFailedOperations();
    } finally {
      setIsRetryingOfflineOperations(false);
    }
  };

  const clearFailedOperations = async () => {
    await ErrorPersistence.clearFailedOperations();
    setFailedOperations([]);
  };

  return {
    failedOperations,
    isRetryingOfflineOperations,
    saveFailedOperation,
    retryFailedOperations,
    clearFailedOperations,
    loadFailedOperations,
  };
};

// Error reporting utility
export const reportError = async (
  error: Error,
  context: Record<string, any> = {},
  userId?: string
) => {
  try {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userId,
      platform: 'react-native',
      // Add device info, app version, etc.
    };

    // In production, send to your error reporting service
    console.error('Error Report:', errorReport);

    // Example: Send to Sentry, Bugsnag, or custom endpoint
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};