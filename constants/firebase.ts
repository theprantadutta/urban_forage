// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  LISTINGS: 'listings',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  REVIEWS: 'reviews',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  PROFILE_IMAGES: 'profile-images',
  LISTING_IMAGES: 'listing-images',
  MESSAGE_ATTACHMENTS: 'message-attachments',
} as const;

// Authentication providers
export const AUTH_PROVIDERS = {
  EMAIL: 'password',
  GOOGLE: 'google.com',
  FACEBOOK: 'facebook.com',
  APPLE: 'apple.com',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

// Listing statuses
export const LISTING_STATUS = {
  ACTIVE: 'active',
  RESERVED: 'reserved',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  REMOVED: 'removed',
} as const;

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  LOCATION: 'location',
  SYSTEM: 'system',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  LISTING_INTEREST: 'listing_interest',
  LISTING_RESERVED: 'listing_reserved',
  LISTING_COMPLETED: 'listing_completed',
  REVIEW_RECEIVED: 'review_received',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

// Firebase configuration validation
export const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

// Error codes
export const FIREBASE_ERROR_CODES = {
  // Auth errors
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
  USER_DISABLED: 'auth/user-disabled',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
  INVALID_CREDENTIAL: 'auth/invalid-credential',
  
  // Firestore errors
  PERMISSION_DENIED: 'firestore/permission-denied',
  UNAVAILABLE: 'firestore/unavailable',
  DEADLINE_EXCEEDED: 'firestore/deadline-exceeded',
  
  // Storage errors
  STORAGE_UNAUTHORIZED: 'storage/unauthorized',
  STORAGE_CANCELED: 'storage/canceled',
  STORAGE_UNKNOWN: 'storage/unknown',
} as const;

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  notifications: true,
  darkMode: false,
  units: 'metric' as const,
  language: 'en',
  emailNotifications: true,
  pushNotifications: true,
  locationSharing: true,
};

// Default user profile
export const DEFAULT_USER_PROFILE = {
  bio: '',
  interests: [],
  verified: false,
  isPublic: true,
  showLocation: true,
  showStats: true,
};

// Default user stats
export const DEFAULT_USER_STATS = {
  listingsCreated: 0,
  itemsShared: 0,
  communityRating: 0,
  reviewsReceived: 0,
  reviewsGiven: 0,
};

// Validation constants
export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_LETTER: true,
    REQUIRE_NUMBER: true,
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REGEX: /^[a-zA-Z0-9\s\-_]+$/,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
} as const;