import { FirebaseError } from 'firebase/app';
import { AuthError } from 'firebase/auth';

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  const requiredEnvVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ];

  return requiredEnvVars.every(envVar => process.env[envVar]);
};

/**
 * Get user-friendly error message from Firebase error
 */
export const getFirebaseErrorMessage = (error: FirebaseError | AuthError | Error): string => {
  if ('code' in error) {
    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      
      // Firestore errors
      case 'firestore/permission-denied':
        return 'You do not have permission to perform this action.';
      case 'firestore/unavailable':
        return 'Service is currently unavailable. Please try again later.';
      case 'firestore/deadline-exceeded':
        return 'Request timed out. Please try again.';
      
      // Storage errors
      case 'storage/unauthorized':
        return 'You do not have permission to access this file.';
      case 'storage/canceled':
        return 'Upload was canceled.';
      case 'storage/unknown':
        return 'An unknown error occurred during upload.';
      
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  return error.message || 'An unexpected error occurred.';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters long.' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'Password must contain at least one letter and one number.' };
  }
  
  return { isValid: true };
};

/**
 * Validate display name
 */
export const validateDisplayName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Display name is required.' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Display name must be at least 2 characters long.' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Display name must be less than 50 characters long.' };
  }
  
  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validNameRegex.test(name.trim())) {
    return { isValid: false, message: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores.' };
  }
  
  return { isValid: true };
};

/**
 * Generate a random avatar URL based on user's name
 */
export const generateAvatarURL = (name: string): string => {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=87A96B&color=2D5016&bold=true`;
};

/**
 * Format Firebase timestamp to readable date
 */
export const formatFirebaseDate = (timestamp: any): Date => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};

/**
 * Log Firebase operations in development
 */
export const logFirebaseOperation = (operation: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`🔥 Firebase ${operation}:`, data);
  }
};