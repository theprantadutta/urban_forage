import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleQueryError, queryKeys } from '../../lib/queryClient';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../stores/authStore';
import {
  ProfileSetupData,
  SignInData,
  SignUpData,
  User
} from '../../types/auth';

// Query: Get current user profile
export const useUserProfile = (userId?: string) => {
  const query = useQuery({
    queryKey: queryKeys.auth.profile(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await authService.getUserProfile(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors
  if (query.error) {
    handleQueryError(query.error, 'useUserProfile');
  }

  return query;
};

// Mutation: Sign in with email/password
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: SignInData) => {
      setLoading(true);
      setError(null);
      const result = await authService.signIn({ email: data.email, password: data.password });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: (user: User | null) => {
      if (user) {
        setUser(user);
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(user.id) });
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useSignIn');
    },
  });

  return mutation;
};

// Mutation: Sign up with email/password
export const useSignUp = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      setLoading(true);
      setError(null);
      const result = await authService.signUp({ 
        email: data.email, 
        password: data.password, 
        displayName: data.displayName 
      });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: (user: User | null) => {
      if (user) {
        setUser(user);
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(user.id) });
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useSignUp');
    },
  });

  return mutation;
};

// Mutation: Sign in with Google
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      setError(null);
      const result = await authService.signInWithGoogle();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: (user: User | null) => {
      if (user) {
        setUser(user);
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(user.id) });
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useGoogleSignIn');
    },
  });

  return mutation;
};

// Mutation: Sign in with Apple
export const useAppleSignIn = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      setError(null);
      const result = await authService.signInWithApple();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: (user: User | null) => {
      if (user) {
        setUser(user);
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(user.id) });
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useGoogleSignIn');
    },
  });

  return mutation;
};

// Mutation: Complete profile setup (placeholder)
export const useCompleteProfileSetup = () => {
  const queryClient = useQueryClient();
  const { setUser, setProfileSetupCompleted, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: ProfileSetupData) => {
      setLoading(true);
      setError(null);
      // This would call a profile setup service method
      // For now, just return success
      return { user: null, error: null };
    },
    onSuccess: () => {
      setProfileSetupCompleted(true);
      setLoading(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useCompleteProfileSetup');
    },
  });

  return mutation;
};

// Mutation: Update user profile (placeholder)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: Partial<ProfileSetupData>) => {
      setLoading(true);
      setError(null);
      // This would call the update profile service method
      // For now, just return success
      return { error: null };
    },
    onSuccess: () => {
      setLoading(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useUpdateProfile');
    },
  });

  return mutation;
};

// Mutation: Sign out
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const { signOut, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      setError(null);
      const result = await authService.signOut();
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      signOut();
      setLoading(false);
      
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useSignOut');
    },
  });

  return mutation;
};

// Mutation: Delete account (placeholder)
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { signOut, setLoading, setError } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      setError(null);
      // This would call a delete account service method
      // For now, just return success
      return { error: null };
    },
    onSuccess: () => {
      signOut();
      setLoading(false);
      
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
      handleQueryError(error, 'useDeleteAccount');
    },
  });

  return mutation;
};

// Mutation: Reset password
export const useResetPassword = () => {
  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return await authService.resetPassword(email);
    },
  });

  // Handle errors
  if (mutation.error) {
    handleQueryError(mutation.error, 'useResetPassword');
  }

  return mutation;
};