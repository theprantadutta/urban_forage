import React, { memo, useMemo, useRef } from 'react';
import type { Region } from 'react-native-maps';
import type { FoodListing } from './FoodMarker';
import { FoodMarker } from './FoodMarker';

// Performance constants
const VIEWPORT_BUFFER = 0.2; // 20% buffer around visible area
const MAX_VISIBLE_MARKERS = 100;


interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ViewportMarkerRendererProps {
  listings: FoodListing[];
  region: Region;
  userLocation?: { latitude: number; longitude: number };
  onMarkerPress?: (listing: FoodListing) => void;
  maxMarkers?: number;
  bufferRatio?: number;
}

export const ViewportMarkerRenderer: React.FC<ViewportMarkerRendererProps> = memo(({
  listings,
  region,
  userLocation,
  onMarkerPress,
  maxMarkers = MAX_VISIBLE_MARKERS,
  bufferRatio = VIEWPORT_BUFFER,
}) => {
  const lastRegionRef = useRef<Region | undefined>(undefined);
  const cachedMarkersRef = useRef<React.JSX.Element[]>([]);

  // Calculate viewport bounds with buffer
  const viewportBounds = useMemo((): ViewportBounds => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const latBuffer = latitudeDelta * bufferRatio;
    const lngBuffer = longitudeDelta * bufferRatio;

    return {
      north: latitude + latitudeDelta / 2 + latBuffer,
      south: latitude - latitudeDelta / 2 - latBuffer,
      east: longitude + longitudeDelta / 2 + lngBuffer,
      west: longitude - longitudeDelta / 2 - lngBuffer,
    };
  }, [region, bufferRatio]);

  // Check if a listing is within viewport bounds
  const isInViewport = useMemo(() => {
    return (listing: FoodListing): boolean => {
      const { latitude, longitude } = listing;
      return (
        latitude <= viewportBounds.north &&
        latitude >= viewportBounds.south &&
        longitude <= viewportBounds.east &&
        longitude >= viewportBounds.west
      );
    };
  }, [viewportBounds]);

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Priority scoring for marker selection
  const calculatePriority = useMemo(() => {
    return (listing: FoodListing): number => {
      let priority = 0;

      // Distance priority (closer = higher priority)
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listing.latitude,
          listing.longitude
        );
        priority += Math.max(0, 10 - distance); // Max 10 points for very close items
      }

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

      // Verification priority
      if (listing.isVerified) {
        priority += 2;
      }

      return priority;
    };
  }, [userLocation]);

  // Filter and prioritize listings for rendering
  const visibleListings = useMemo(() => {
    // Filter listings within viewport
    const inViewport = listings.filter(isInViewport);

    // If we have too many markers, prioritize them
    if (inViewport.length <= maxMarkers) {
      return inViewport;
    }

    // Sort by priority and take top markers
    return inViewport
      .map(listing => ({
        listing,
        priority: calculatePriority(listing),
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxMarkers)
      .map(item => item.listing);
  }, [listings, isInViewport, maxMarkers, calculatePriority]);

  // Check if region has changed significantly
  const hasRegionChanged = useMemo(() => {
    if (!lastRegionRef.current) return true;

    const prev = lastRegionRef.current;
    const threshold = 0.001; // Minimum change threshold

    return (
      Math.abs(region.latitude - prev.latitude) > threshold ||
      Math.abs(region.longitude - prev.longitude) > threshold ||
      Math.abs(region.latitudeDelta - prev.latitudeDelta) > threshold ||
      Math.abs(region.longitudeDelta - prev.longitudeDelta) > threshold
    );
  }, [region]);

  // Render markers with caching
  const renderedMarkers = useMemo(() => {
    // Use cached markers if region hasn't changed significantly
    if (!hasRegionChanged && cachedMarkersRef.current.length > 0) {
      return cachedMarkersRef.current;
    }

    const markers = visibleListings.map((listing, index) => (
      <FoodMarker
        key={listing.id}
        listing={listing}
        onPress={() => onMarkerPress?.(listing)}
      />
    ));

    // Cache the rendered markers
    cachedMarkersRef.current = markers;
    lastRegionRef.current = region;

    return markers;
  }, [visibleListings, hasRegionChanged, onMarkerPress, region]);

  // Performance logging in development
  if (__DEV__) {
    console.log(`[ViewportRenderer] ${visibleListings.length}/${listings.length} markers visible`);
    if (visibleListings.length === maxMarkers) {
      console.log(`[ViewportRenderer] Marker limit reached, showing prioritized selection`);
    }
  }

  return <>{renderedMarkers}</>;
});

ViewportMarkerRenderer.displayName = 'ViewportMarkerRenderer';

export default ViewportMarkerRenderer;