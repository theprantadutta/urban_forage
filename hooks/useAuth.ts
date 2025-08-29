import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { authService } from '../services/auth';
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      
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
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (credentials: AuthCredentials): Promise<AuthResult> => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: Omit<AuthCredentials, 'displayName'>): Promise<AuthResult> => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      
      if (result.error) {
        setError(result.error);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('An unexpected error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithSocial = async (provider: SocialProvider): Promise<AuthResult> => {
    setIsLoading(true);
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
      setIsLoading(false);
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
    setError(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signUp,
    signIn,
    signOut,
    signInWithSocial,
    resetPassword,
    clearError,
  };
};