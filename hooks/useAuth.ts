import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '../config/firebase';
import { authService } from '../services/auth';
import { useAuthStore } from '../stores/authStore';
import { AuthCredentials, AuthResult, SocialProvider, User } from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (credentials: AuthCredentials) => Promise<AuthResult>;
  signIn: (credentials: Omit<AuthCredentials, 'displayName'>) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signInWithSocial: (provider: SocialProvider) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setLoading,
    setError,
    clearError: clearStoreError,
    signOut: signOutStore,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading, setError]);

  const signUp = async (credentials: AuthCredentials): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signUp(credentials);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign up';
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: Omit<AuthCredentials, 'displayName'>): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signIn(credentials);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      
      if (result.error) {
        setError(result.error);
      } else {
        signOutStore();
      }
    } catch (err) {
      setError('An unexpected error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  const signInWithSocial = async (provider: SocialProvider): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      let result: AuthResult;
      
      switch (provider) {
        case 'google':
          result = await authService.signInWithGoogle();
          break;
        case 'facebook':
          result = await authService.signInWithFacebook();
          break;
        case 'apple':
          result = await authService.signInWithApple();
          break;
        default:
          result = { user: null, error: 'Unsupported social provider' };
      }
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (err) {
      const errorMessage = `An unexpected error occurred during ${provider} sign in`;
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while sending reset email';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const clearError = (): void => {
    clearStoreError();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signOut,
    signInWithSocial,
    resetPassword,
    clearError,
  };
};