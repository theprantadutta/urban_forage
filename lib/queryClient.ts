import { QueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settingsStore';

// Default query options
const defaultQueryOptions = {
  queries: {
    // Stale time - how long data is considered fresh
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache time - how long data stays in cache after component unmounts
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (useful for web, less so for mobile)
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once on network error
    retry: (failureCount: number, error: any) => {
      if (error?.code === 'NETWORK_ERROR' && failureCount < 1) {
        return true;
      }
      return false;
    },
  },
};

// Create query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
  },
  
  // Food listings
  listings: {
    all: ['listings'] as const,
    list: (filters?: any) => ['listings', 'list', filters] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    nearby: (location: { lat: number; lng: number }, radius: number) => 
      ['listings', 'nearby', location, radius] as const,
    user: (userId: string) => ['listings', 'user', userId] as const,
    favorites: (userId: string) => ['listings', 'favorites', userId] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    conversations: (userId: string) => ['messages', 'conversations', userId] as const,
    conversation: (conversationId: string) => ['messages', 'conversation', conversationId] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unread: (userId: string) => ['notifications', 'unread', userId] as const,
  },
  
  // Location
  location: {
    current: ['location', 'current'] as const,
    geocode: (address: string) => ['location', 'geocode', address] as const,
    reverse: (lat: number, lng: number) => ['location', 'reverse', lat, lng] as const,
  },
  
  // Search
  search: {
    listings: (query: string, filters?: any) => ['search', 'listings', query, filters] as const,
    users: (query: string) => ['search', 'users', query] as const,
  },
} as const;

// Helper function to invalidate related queries
export const invalidateQueries = {
  // Invalidate all user-related data
  userData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.user(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
  },
  
  // Invalidate all listings data
  listings: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
  },
  
  // Invalidate specific listing and related data
  listing: (listingId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(listingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
  },
  
  // Invalidate location-based data
  locationData: () => {
    queryClient.invalidateQueries({ queryKey: ['listings', 'nearby'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.location.current });
  },
};

// Error handling utilities
export const handleQueryError = (error: any, context?: string) => {
  console.error(`Query error${context ? ` in ${context}` : ''}:`, error);
  
  // Get debug mode from settings
  const debugMode = useSettingsStore.getState().debugMode;
  
  if (debugMode) {
    // In debug mode, show more detailed error info
    console.error('Full error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    });
  }
  
  // You could also send errors to a logging service here
  // logError(error, context);
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Add item to list optimistically
  addToList: <T>(queryKey: any[], newItem: T) => {
    queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData ? [...oldData, newItem] : [newItem];
    });
  },
  
  // Update item in list optimistically
  updateInList: <T extends { id: string }>(queryKey: any[], updatedItem: T) => {
    queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData?.map(item => 
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );
    });
  },
  
  // Remove item from list optimistically
  removeFromList: <T extends { id: string }>(queryKey: any[], itemId: string) => {
    queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData?.filter(item => item.id !== itemId);
    });
  },
  
  // Update single item optimistically
  updateItem: <T>(queryKey: any[], updatedData: Partial<T>) => {
    queryClient.setQueryData(queryKey, (oldData: T | undefined) => {
      return oldData ? { ...oldData, ...updatedData } : undefined;
    });
  },
};

// Prefetch utilities
export const prefetchQueries = {
  // Prefetch user profile
  userProfile: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.profile(userId),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  // Prefetch nearby listings
  nearbyListings: async (location: { lat: number; lng: number }, radius: number = 10) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.listings.nearby(location, radius),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};