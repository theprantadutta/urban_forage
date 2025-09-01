import {
    AuthError,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db as firestore } from '../config/firebase';

// Types
export interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserProfile {
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

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface AuthResult {
  user: UserProfile | null;
  error: string | null;
}

// Authentication Service Class
class AuthService {
  /**
   * Sign up with email and password
   */
  async signUp(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const { email, password, displayName } = credentials;
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Create user profile in Firestore
      const userProfile = await this.createUserProfile(firebaseUser, { displayName });
      
      return { user: userProfile, error: null };
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error as AuthError) };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: Omit<AuthCredentials, 'displayName'>): Promise<AuthResult> {
    try {
      const { email, password } = credentials;
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      
      return { user: userProfile, error: null };
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error as AuthError) };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error as AuthError) };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error as AuthError) };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Note: This requires additional setup with Google Sign-In
      // For now, we'll return a placeholder implementation
      throw new Error('Google Sign-In requires additional native configuration');
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error as Error) };
    }
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(): Promise<AuthResult> {
    try {
      // Note: This requires additional setup with Facebook SDK
      // For now, we'll return a placeholder implementation
      throw new Error('Facebook Sign-In requires additional native configuration');
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error as Error) };
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthResult> {
    try {
      // Note: This requires additional setup with Apple Sign-In
      // For now, we'll return a placeholder implementation
      throw new Error('Apple Sign-In requires additional native configuration');
    } catch (error) {
      return { user: null, error: this.getErrorMessage(error as Error) };
    }
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(
    firebaseUser: FirebaseUser,
    additionalData?: { displayName?: string }
  ): Promise<UserProfile> {
    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: additionalData?.displayName || firebaseUser.displayName || 'Anonymous User',
      preferences: {
        notifications: true,
        darkMode: false,
        units: 'metric',
      },
      profile: {
        bio: '',
        interests: [],
        joinedAt: new Date(),
        verified: false,
      },
      stats: {
        listingsCreated: 0,
        itemsShared: 0,
        communityRating: 0,
      },
    };

    // Only add optional fields if they have values
    if (firebaseUser.photoURL) {
      userProfile.photoURL = firebaseUser.photoURL;
    }
    
    if (firebaseUser.phoneNumber) {
      userProfile.phoneNumber = firebaseUser.phoneNumber;
    }

    // Save to Firestore
    await setDoc(doc(firestore, 'users', firebaseUser.uid), userProfile);
    
    return userProfile;
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          profile: {
            ...data.profile,
            joinedAt: data.profile.joinedAt.toDate(),
          },
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    try {
      await updateDoc(doc(firestore, 'users', uid), updates);
      return { error: null };
    } catch (error) {
      return { error: this.getErrorMessage(error as Error) };
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Convert Firebase auth errors to user-friendly messages
   */
  private getErrorMessage(error: AuthError | Error): string {
    if ('code' in error) {
      switch (error.code) {
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
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }
    
    return error.message || 'An unexpected error occurred.';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;