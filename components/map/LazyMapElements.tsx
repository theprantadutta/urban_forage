import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Region } from 'react-native-maps';
import type { FoodListing } from './FoodMarker';

// Lazy loading configuration
const LOAD_THRESHOLD = 0.5; // Load when 50% closer to viewport
const UNLOAD_THRESHOLD = 2.0; // Unload when 2x viewport distance away
const MAX_LOADED_ELEMENTS = 200;
const BATCH_SIZE = 20;

interface LazyElement {
  id: string;
  listing: FoodListing;
  distance: number;
  isLoaded: boolean;
  priority: number;
}

interface LazyMapElementsProps {
  listings: FoodListing[];
  region: Region;
  children: (visibleListings: FoodListing[]) => React.ReactNode;
  maxElements?: number;
  batchSize?: number;
  loadThreshold?: number;
  unloadThreshold?: number;
}

export const LazyMapElements: React.FC<LazyMapElementsProps> = memo(({
  listings,
  region,
  children,
  maxElements = MAX_LOADED_ELEMENTS,
  batchSize = BATCH_SIZE,
  loadThreshold = LOAD_THRESHOLD,
  unloadThreshold = UNLOAD_THRESHOLD,
}) => {
  const [loadedElements, setLoadedElements] = useState<Set<string>>(new Set());
  const [visibleListings, setVisibleListings] = useState<FoodListing[]>([]);
  const loadingQueueRef = useRef<string[]>([]);
  const lastRegionRef = useRef<Region | undefined>(undefined);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Calculate viewport bounds
  const viewportBounds = useMemo(() => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    return {
      north: latitude + latitudeDelta / 2,
      south: latitude - latitudeDelta / 2,
      east: longitude + longitudeDelta / 2,
      west: longitude - longitudeDelta / 2,
      centerLat: latitude,
      centerLng: longitude,
      width: longitudeDelta,
      height: latitudeDelta,
    };
  }, [region]);

  // Calculate distance from viewport center
  const calculateDistanceFromViewport = useCallback((listing: FoodListing) => {
    const { centerLat, centerLng, width, height } = viewportBounds;
    
    // Normalize coordinates relative to viewport
    const normalizedLat = Math.abs(listing.latitude - centerLat) / (height / 2);
    const normalizedLng = Math.abs(listing.longitude - centerLng) / (width / 2);
    
    // Calculate distance as a multiple of viewport size
    return Math.sqrt(normalizedLat * normalizedLat + normalizedLng * normalizedLng);
  }, [viewportBounds]);

  // Calculate element priority
  const calculatePriority = useCallback((listing: FoodListing, distance: number) => {
    let priority = 0;
    
    // Distance priority (closer = higher)
    priority += Math.max(0, 10 - distance * 2);
    
    // Availability priority
    switch (listing.availability) {
      case 'high':
        priority += 5;
        break;
      case 'medium':
        priority += 3;
        break;
      case 'low':
        priority += 1;
        break;
    }
    
    // Urgency priority
    if (listing.isUrgent) {
      priority += 8;
    }
    
    // Rating priority
    if (listing.rating) {
      priority += listing.rating;
    }
    
    return priority;
  }, []);

  // Create lazy elements with distance and priority
  const lazyElements = useMemo((): LazyElement[] => {
    return listings.map(listing => {
      const distance = calculateDistanceFromViewport(listing);
      const priority = calculatePriority(listing, distance);
      
      return {
        id: listing.id,
        listing,
        distance,
        isLoaded: loadedElements.has(listing.id),
        priority,
      };
    });
  }, [listings, calculateDistanceFromViewport, calculatePriority, loadedElements]);

  // Determine which elements should be loaded/unloaded
  const elementActions = useMemo(() => {
    const toLoad: string[] = [];
    const toUnload: string[] = [];
    
    lazyElements.forEach(element => {
      if (!element.isLoaded && element.distance <= loadThreshold) {
        toLoad.push(element.id);
      } else if (element.isLoaded && element.distance > unloadThreshold) {
        toUnload.push(element.id);
      }
    });
    
    // Sort by priority for loading
    toLoad.sort((a, b) => {
      const elementA = lazyElements.find(el => el.id === a)!;
      const elementB = lazyElements.find(el => el.id === b)!;
      return elementB.priority - elementA.priority;
    });
    
    return { toLoad, toUnload };
  }, [lazyElements, loadThreshold, unloadThreshold]);

  // Batch loading function
  const processBatchLoad = useCallback(() => {
    if (loadingQueueRef.current.length === 0) return;
    
    const batch = loadingQueueRef.current.splice(0, batchSize);
    
    setLoadedElements(prev => {
      const newLoaded = new Set(prev);
      batch.forEach(id => newLoaded.add(id));
      
      // Enforce max elements limit
      if (newLoaded.size > maxElements) {
        const elementsArray = Array.from(newLoaded);
        const elementsToRemove = elementsArray.slice(0, newLoaded.size - maxElements);
        elementsToRemove.forEach(id => newLoaded.delete(id));
      }
      
      return newLoaded;
    });
    
    // Continue loading if there are more items
    if (loadingQueueRef.current.length > 0) {
      loadingTimeoutRef.current = setTimeout(processBatchLoad, 16); // Next frame
    }
  }, [batchSize, maxElements]);

  // Update loaded elements based on viewport changes
  useEffect(() => {
    const { toLoad, toUnload } = elementActions;
    
    // Unload elements immediately
    if (toUnload.length > 0) {
      setLoadedElements(prev => {
        const newLoaded = new Set(prev);
        toUnload.forEach(id => newLoaded.delete(id));
        return newLoaded;
      });
    }
    
    // Queue elements for batch loading
    if (toLoad.length > 0) {
      loadingQueueRef.current = [...loadingQueueRef.current, ...toLoad];
      
      // Clear existing timeout and start batch loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(processBatchLoad, 16);
    }
    
    lastRegionRef.current = region;
  }, [elementActions, processBatchLoad, region]);

  // Update visible listings
  useEffect(() => {
    const visible = lazyElements
      .filter(element => element.isLoaded)
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .map(element => element.listing);
    
    setVisibleListings(visible);
  }, [lazyElements]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Performance logging in development
  useEffect(() => {
    if (__DEV__) {
      const loadedCount = loadedElements.size;
      const totalCount = listings.length;
      const queuedCount = loadingQueueRef.current.length;
      
      console.log(`[LazyLoading] ${loadedCount}/${totalCount} loaded, ${queuedCount} queued`);
      
      if (loadedCount === maxElements) {
        console.log(`[LazyLoading] Max elements limit reached`);
      }
    }
  }, [loadedElements.size, listings.length, maxElements]);

  return <>{children(visibleListings)}</>;
});

LazyMapElements.displayName = 'LazyMapElements';

export default LazyMapElements;