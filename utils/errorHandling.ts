import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  type: 'network' | 'location' | 'map' | 'search' | 'permission' | 'storage' | 'unknown';
  recoverable: boolean;
  retryable: boolean;
  timestamp: number;
  context?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  showAlert?: boolean;
  enableRetry?: boolean;
  fallbackAction?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  API_ERROR: 'API_ERROR',
  
  // Location errors
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  LOCATION_TIMEOUT: 'LOCATION_TIMEOUT',
  GPS_ACCURACY_LOW: 'GPS_ACCURACY_LOW',
  
  // Map errors
  MAP_LOAD_FAILED: 'MAP_LOAD_FAILED',
  MAP_RENDER_ERROR: 'MAP_RENDER_ERROR',
  MARKER_LOAD_FAILED: 'MARKER_LOAD_FAILED',
  
  // Search errors
  SEARCH_SERVICE_ERROR: 'SEARCH_SERVICE_ERROR',
  SEARCH_TIMEOUT: 'SEARCH_TIMEOUT',
  SEARCH_INVALID_QUERY: 'SEARCH_INVALID_QUERY',
  
  // Permission errors
  CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
  STORAGE_PERMISSION_DENIED: 'STORAGE_PERMISSION_DENIED',
  
  // Storage errors
  CACHE_WRITE_FAILED: 'CACHE_WRITE_FAILED',
  CACHE_READ_FAILED: 'CACHE_READ_FAILED',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_UNAVAILABLE]: 'No internet connection available. Please check your network settings.',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.API_ERROR]: 'Service temporarily unavailable. Please try again later.',
  
  [ERROR_CODES.LOCATION_PERMISSION_DENIED]: 'Location permission is required to show nearby food listings.',
  [ERROR_CODES.LOCATION_UNAVAILABLE]: 'Unable to determine your location. Please enable location services.',
  [ERROR_CODES.LOCATION_TIMEOUT]: 'Location request timed out. Please try again.',
  [ERROR_CODES.GPS_ACCURACY_LOW]: 'GPS accuracy is low. Consider moving to an open area.',
  
  [ERROR_CODES.MAP_LOAD_FAILED]: 'Failed to load map. Please check your internet connection.',
  [ERROR_CODES.MAP_RENDER_ERROR]: 'Map rendering error. Switching to list view.',
  [ERROR_CODES.MARKER_LOAD_FAILED]: 'Some listings may not be visible on the map.',
  
  [ERROR_CODES.SEARCH_SERVICE_ERROR]: 'Search service is temporarily unavailable.',
  [ERROR_CODES.SEARCH_TIMEOUT]: 'Search request timed out. Please try again.',
  [ERROR_CODES.SEARCH_INVALID_QUERY]: 'Please enter a valid search term.',
  
  [ERROR_CODES.CAMERA_PERMISSION_DENIED]: 'Camera permission is required to take photos.',
  [ERROR_CODES.STORAGE_PERMISSION_DENIED]: 'Storage permission is required to save images.',
  
  [ERROR_CODES.CACHE_WRITE_FAILED]: 'Failed to save data locally.',
  [ERROR_CODES.CACHE_READ_FAILED]: 'Failed to load cached data.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
} as const;

// Create standardized error
export const createError = (
  code: keyof typeof ERROR_CODES,
  context?: Record<string, any>,
  customMessage?: string
): AppError => {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code],
    type: getErrorType(code),
    recoverable: isRecoverable(code),
    retryable: isRetryable(code),
    timestamp: Date.now(),
    context,
  };
};

// Determine error type from code
const getErrorType = (code: string): AppError['type'] => {
  if (code.startsWith('NETWORK') || code.startsWith('API')) return 'network';
  if (code.startsWith('LOCATION') || code.startsWith('GPS')) return 'location';
  if (code.startsWith('MAP') || code.startsWith('MARKER')) return 'map';
  if (code.startsWith('SEARCH')) return 'search';
  if (code.includes('PERMISSION')) return 'permission';
  if (code.includes('CACHE') || code.includes('STORAGE')) return 'storage';
  return 'unknown';
};

// Check if error is recoverable
const isRecoverable = (code: string): boolean => {
  const nonRecoverableCodes = [
    ERROR_CODES.LOCATION_PERMISSION_DENIED,
    ERROR_CODES.CAMERA_PERMISSION_DENIED,
    ERROR_CODES.STORAGE_PERMISSION_DENIED,
  ];
  return !nonRecoverableCodes.includes(code as any);
};

// Check if error is retryable
const isRetryable = (code: string): boolean => {
  const retryableCodes = [
    ERROR_CODES.NETWORK_UNAVAILABLE,
    ERROR_CODES.NETWORK_TIMEOUT,
    ERROR_CODES.API_ERROR,
    ERROR_CODES.LOCATION_TIMEOUT,
    ERROR_CODES.MAP_LOAD_FAILED,
    ERROR_CODES.SEARCH_SERVICE_ERROR,
    ERROR_CODES.SEARCH_TIMEOUT,
    ERROR_CODES.CACHE_WRITE_FAILED,
    ERROR_CODES.CACHE_READ_FAILED,
  ];
  return retryableCodes.includes(code as any);
};

// Network connectivity checker
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch (error) {
    console.error('Network check failed:', error);
    return false;
  }
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Error recovery handler
export const handleErrorWithRecovery = async (
  error: AppError,
  options: ErrorRecoveryOptions = {}
): Promise<void> => {
  const {
    showAlert = true,
    enableRetry = false,
    fallbackAction,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  // Log error for debugging
  console.error('App Error:', error);
  
  // Store error for analytics
  await storeErrorForAnalytics(error);

  if (showAlert) {
    const buttons: any[] = [];
    
    if (enableRetry && error.retryable) {
      buttons.push({
        text: 'Retry',
        onPress: () => {
          // Retry logic would be handled by the calling component
        },
      });
    }
    
    if (fallbackAction) {
      buttons.push({
        text: 'Use Fallback',
        onPress: fallbackAction,
      });
    }
    
    buttons.push({
      text: 'OK',
      style: 'cancel',
    });

    Alert.alert(
      getErrorTitle(error.type),
      error.message,
      buttons
    );
  }
};

// Get user-friendly error title
const getErrorTitle = (type: AppError['type']): string => {
  switch (type) {
    case 'network':
      return 'Connection Issue';
    case 'location':
      return 'Location Error';
    case 'map':
      return 'Map Error';
    case 'search':
      return 'Search Error';
    case 'permission':
      return 'Permission Required';
    case 'storage':
      return 'Storage Error';
    default:
      return 'Error';
  }
};

// Store error for analytics
const storeErrorForAnalytics = async (error: AppError): Promise<void> => {
  try {
    const errorLog = {
      ...error,
      userAgent: 'UrbanForage Mobile App',
      platform: 'React Native',
    };
    
    await AsyncStorage.setItem(
      `error_${error.timestamp}`,
      JSON.stringify(errorLog)
    );
  } catch (storageError) {
    console.error('Failed to store error for analytics:', storageError);
  }
};

// Cache management for offline scenarios
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

export const setCachedData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache data:', error);
    throw createError('CACHE_WRITE_FAILED', { key });
  }
};

// Location fallback utilities
export const getLocationFallback = (): { latitude: number; longitude: number } => {
  // Default to San Francisco coordinates as fallback
  return {
    latitude: 37.7749,
    longitude: -122.4194,
  };
};

// Search fallback utilities
export const getSearchFallback = (query: string): string[] => {
  const commonSuggestions = [
    'fresh vegetables',
    'fruits',
    'bread',
    'dairy products',
    'prepared meals',
    'organic food',
  ];
  
  if (!query.trim()) {
    return commonSuggestions;
  }
  
  return commonSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );
};