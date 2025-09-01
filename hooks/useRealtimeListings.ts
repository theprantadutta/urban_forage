import { Unsubscribe } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodListing } from '../components/map/FoodMarker';
import { subscribeToListings, type ListingFilters, type ViewportBounds } from '../services/firestore';

interface UseRealtimeListingsOptions {
  filters: ListingFilters;
  viewport?: ViewportBounds;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface UseRealtimeListingsReturn {
  listings: FoodListing[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  updateFilters: (newFilters: Partial<ListingFilters>) => void;
  updateViewport: (newViewport: ViewportBounds) => void;
}

/**
 * Custom hook for managing real-time food listings subscription
 */
export const useRealtimeListings = ({
  filters,
  viewport,
  enabled = true,
  onError,
}: UseRealtimeListingsOptions): UseRealtimeListingsReturn => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>(filters);
  const [currentViewport, setCurrentViewport] = useState<ViewportBounds | undefined>(viewport);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const isSubscribedRef = useRef(false);

  // Handle listings updates
  const handleListingsUpdate = useCallback((newListings: FoodListing[]) => {
    setListings(newListings);
    setLoading(false);
    setError(null);
  }, []);

  // Handle subscription errors
  const handleError = useCallback((err: Error) => {
    console.error('Real-time listings error:', err);
    setError(err);
    setLoading(false);
    onError?.(err);
  }, [onError]);

  // Subscribe to listings
  const subscribe = useCallback(() => {
    if (!enabled || isSubscribedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToListings(
        currentFilters,
        handleListingsUpdate,
        currentViewport,
        handleError
      );

      unsubscribeRef.current = unsubscribe;
      isSubscribedRef.current = true;
    } catch (err) {
      handleError(err as Error);
    }
  }, [enabled, currentFilters, currentViewport, handleListingsUpdate, handleError]);

  // Unsubscribe from listings
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  // Refresh subscription
  const refresh = useCallback(() => {
    unsubscribe();
    if (enabled) {
      subscribe();
    }
  }, [unsubscribe, subscribe, enabled]);

  // Update filters and refresh subscription
  const updateFilters = useCallback((newFilters: Partial<ListingFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update viewport and refresh subscription
  const updateViewport = useCallback((newViewport: ViewportBounds) => {
    setCurrentViewport(newViewport);
  }, []);

  // Set up subscription when filters or viewport change
  useEffect(() => {
    if (enabled) {
      unsubscribe();
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [enabled, currentFilters, currentViewport, subscribe, unsubscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    listings,
    loading,
    error,
    refresh,
    updateFilters,
    updateViewport,
  };
};

export default useRealtimeListings;