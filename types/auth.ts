export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  phoneNumber?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    units: 'metric' | 'imperial';
  };
  profile: {
    bio?: string;
    interests: string[];
    joinedAt: Date;
    verified: boolean;
  };
  stats: {
    listingsCreated: number;
    itemsShared: number;
    communityRating: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export interface SignUpData extends AuthCredentials {
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ProfileSetupData {
  displayName: string;
  bio?: string;
  interests: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  photoURL?: string | null;
}

export interface AuthError extends Error {
  code?: string;
  message: string;
}