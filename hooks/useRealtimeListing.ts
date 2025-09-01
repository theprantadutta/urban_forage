import { Unsubscribe } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodListing } from '../components/map/FoodMarker';
import { subscribeToListing } from '../services/firestore';

interface UseRealtimeListingOptions {
  listingId: string | null;
  userLocation?: { latitude: number; longitude: number };
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface UseRealtimeListingReturn {
  listing: FoodListing | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Custom hook for managing real-time individual listing subscription
 */
export const useRealtimeListing = ({
  listingId,
  userLocation,
  enabled = true,
  onError,
}: UseRealtimeListingOptions): UseRealtimeListingReturn => {
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const isSubscribedRef = useRef(false);
  const currentListingIdRef = useRef<string | null>(null);

  // Handle listing updates
  const handleListingUpdate = useCallback((newListing: FoodListing | null) => {
    setListing(newListing);
    setLoading(false);
    setError(null);
  }, []);

  // Handle subscription errors
  const handleError = useCallback((err: Error) => {
    console.error('Real-time listing error:', err);
    setError(err);
    setLoading(false);
    onError?.(err);
  }, [onError]);

  // Subscribe to listing
  const subscribe = useCallback(() => {
    if (!enabled || !listingId || isSubscribedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToListing(
        listingId,
        handleListingUpdate,
        handleError,
        userLocation
      );

      unsubscribeRef.current = unsubscribe;
      isSubscribedRef.current = true;
      currentListingIdRef.current = listingId;
    } catch (err) {
      handleError(err as Error);
    }
  }, [enabled, listingId, userLocation, handleListingUpdate, handleError]);

  // Unsubscribe from listing
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      isSubscribedRef.current = false;
      currentListingIdRef.current = null;
    }
  }, []);

  // Refresh subscription
  const refresh = useCallback(() => {
    unsubscribe();
    if (enabled && listingId) {
      subscribe();
    }
  }, [unsubscribe, subscribe, enabled, listingId]);

  // Set up subscription when listingId changes
  useEffect(() => {
    // If listingId changed, unsubscribe from previous and subscribe to new
    if (currentListingIdRef.current !== listingId) {
      unsubscribe();
      
      if (enabled && listingId) {
        subscribe();
      } else {
        // Clear listing if no listingId
        setListing(null);
        setLoading(false);
        setError(null);
      }
    }
  }, [listingId, enabled, subscribe, unsubscribe]);

  // Update subscription when userLocation changes
  useEffect(() => {
    if (enabled && listingId && isSubscribedRef.current) {
      // Refresh subscription to update distance calculations
      refresh();
    }
  }, [userLocation, enabled, listingId, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    listing,
    loading,
    error,
    refresh,
  };
};

export default useRealtimeListing;