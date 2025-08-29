import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '../types/auth';

export interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Onboarding state
  hasCompletedOnboarding: boolean;
  hasCompletedProfileSetup: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setProfileSetupCompleted: (completed: boolean) => void;
  signOut: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
  hasCompletedProfileSetup: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed getter for authentication status
      get isAuthenticated() {
        return get().user !== null;
      },

      // User management
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
          hasCompletedProfileSetup: user ? true : false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Onboarding management
      setOnboardingCompleted: (hasCompletedOnboarding: boolean) => {
        set({ hasCompletedOnboarding });
      },

      setProfileSetupCompleted: (hasCompletedProfileSetup: boolean) => {
        set({ hasCompletedProfileSetup });
      },

      // Sign out
      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          hasCompletedProfileSetup: false,
        });
      },

      // Reset all state
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedProfileSetup: state.hasCompletedProfileSetup,
      }),
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useOnboardingStatus = () => useAuthStore((state) => state.hasCompletedOnboarding);
export const useProfileSetupStatus = () => useAuthStore((state) => state.hasCompletedProfileSetup);