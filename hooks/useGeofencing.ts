// import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodListing } from '../components/map/FoodMarker';
import type { LocationData } from './useLocationService';

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  title: string;
  description?: string;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
  data?: any; // Additional data to store with the geofence
}

export interface GeofenceEvent {
  id: string;
  regionId: string;
  type: 'enter' | 'exit';
  timestamp: number;
  location: LocationData;
  region: GeofenceRegion;
}

interface UseGeofencingOptions {
  enableNotifications?: boolean;
  proximityThreshold?: number; // meters
  checkInterval?: number; // milliseconds
}

interface UseGeofencingReturn {
  // Geofence regions
  regions: GeofenceRegion[];
  activeRegions: GeofenceRegion[];
  
  // Events
  events: GeofenceEvent[];
  lastEvent: GeofenceEvent | null;
  
  // Actions
  addRegion: (region: GeofenceRegion) => void;
  removeRegion: (regionId: string) => void;
  clearRegions: () => void;
  
  // Food listing specific
  addFoodListingGeofence: (listing: FoodListing, radius?: number) => void;
  removeFoodListingGeofence: (listingId: string) => void;
  
  // Proximity checking
  checkProximity: (currentLocation: LocationData) => GeofenceEvent[];
  getNearbyRegions: (currentLocation: LocationData, maxDistance?: number) => GeofenceRegion[];
  
  // Utilities
  isInsideRegion: (location: LocationData, region: GeofenceRegion) => boolean;
  getDistanceToRegion: (location: LocationData, region: GeofenceRegion) => number;
}

const DEFAULT_OPTIONS: Required<UseGeofencingOptions> = {
  enableNotifications: true,
  proximityThreshold: 100, // 100 meters
  checkInterval: 10000, // 10 seconds
};

const MAX_EVENTS_HISTORY = 100;

export const useGeofencing = (
  currentLocation: LocationData | null,
  options: UseGeofencingOptions = {}
): UseGeofencingReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [activeRegions, setActiveRegions] = useState<GeofenceRegion[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<GeofenceEvent | null>(null);
  
  const checkIntervalRef = useRef<any>(null);
  const previousLocationRef = useRef<LocationData | null>(null);
  const activeRegionIdsRef = useRef<Set<string>>(new Set());

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Check if location is inside a region
  const isInsideRegion = useCallback((location: LocationData, region: GeofenceRegion): boolean => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      region.latitude,
      region.longitude
    );
    return distance <= region.radius;
  }, [calculateDistance]);

  // Get distance to region center
  const getDistanceToRegion = useCallback((location: LocationData, region: GeofenceRegion): number => {
    return calculateDistance(
      location.latitude,
      location.longitude,
      region.latitude,
      region.longitude
    );
  }, [calculateDistance]);

  // Send notification for geofence event
  const sendNotification = useCallback(async (event: GeofenceEvent) => {
    if (!opts.enableNotifications) return;

    try {
      // TODO: Implement notifications when expo-notifications is available
      console.log('Geofence event:', event.type, event.region.title);
    } catch (error) {
      console.error('Failed to send geofence notification:', error);
    }
  }, [opts.enableNotifications]);

  // Add a geofence region
  const addRegion = useCallback((region: GeofenceRegion) => {
    setRegions(prev => {
      const existing = prev.find(r => r.id === region.id);
      if (existing) {
        // Update existing region
        return prev.map(r => r.id === region.id ? region : r);
      } else {
        // Add new region
        return [...prev, region];
      }
    });
  }, []);

  // Remove a geofence region
  const removeRegion = useCallback((regionId: string) => {
    setRegions(prev => prev.filter(r => r.id !== regionId));
    setActiveRegions(prev => prev.filter(r => r.id !== regionId));
    activeRegionIdsRef.current.delete(regionId);
  }, []);

  // Clear all regions
  const clearRegions = useCallback(() => {
    setRegions([]);
    setActiveRegions([]);
    activeRegionIdsRef.current.clear();
  }, []);

  // Add geofence for food listing
  const addFoodListingGeofence = useCallback((listing: FoodListing, radius: number = 100) => {
    const region: GeofenceRegion = {
      id: `food-${listing.id}`,
      latitude: listing.latitude,
      longitude: listing.longitude,
      radius,
      title: listing.title,
      description: `${listing.category} • ${listing.distance} away`,
      notifyOnEntry: true,
      notifyOnExit: false,
      data: { listing },
    };
    addRegion(region);
  }, [addRegion]);

  // Remove geofence for food listing
  const removeFoodListingGeofence = useCallback((listingId: string) => {
    removeRegion(`food-${listingId}`);
  }, [removeRegion]);

  // Check proximity to all regions
  const checkProximity = useCallback((location: LocationData): GeofenceEvent[] => {
    const newEvents: GeofenceEvent[] = [];
    const currentActiveIds = new Set<string>();

    regions.forEach(region => {
      const isInside = isInsideRegion(location, region);
      const wasInside = activeRegionIdsRef.current.has(region.id);

      if (isInside) {
        currentActiveIds.add(region.id);
        
        // Entry event
        if (!wasInside && region.notifyOnEntry) {
          const event: GeofenceEvent = {
            id: `${region.id}-${Date.now()}`,
            regionId: region.id,
            type: 'enter',
            timestamp: Date.now(),
            location,
            region,
          };
          newEvents.push(event);
        }
      } else {
        // Exit event
        if (wasInside && region.notifyOnExit) {
          const event: GeofenceEvent = {
            id: `${region.id}-${Date.now()}`,
            regionId: region.id,
            type: 'exit',
            timestamp: Date.now(),
            location,
            region,
          };
          newEvents.push(event);
        }
      }
    });

    // Update active regions
    activeRegionIdsRef.current = currentActiveIds;
    setActiveRegions(regions.filter(r => currentActiveIds.has(r.id)));

    // Add events to history
    if (newEvents.length > 0) {
      setEvents(prev => [...newEvents, ...prev].slice(0, MAX_EVENTS_HISTORY));
      setLastEvent(newEvents[0]);
      
      // Send notifications
      newEvents.forEach(event => {
        sendNotification(event);
      });
    }

    return newEvents;
  }, [regions, isInsideRegion, sendNotification]);

  // Get nearby regions
  const getNearbyRegions = useCallback((location: LocationData, maxDistance: number = opts.proximityThreshold): GeofenceRegion[] => {
    return regions.filter(region => {
      const distance = getDistanceToRegion(location, region);
      return distance <= maxDistance;
    }).sort((a, b) => {
      const distanceA = getDistanceToRegion(location, a);
      const distanceB = getDistanceToRegion(location, b);
      return distanceA - distanceB;
    });
  }, [regions, getDistanceToRegion, opts.proximityThreshold]);

  // Automatic proximity checking
  useEffect(() => {
    if (!currentLocation) return;

    // Check proximity immediately
    checkProximity(currentLocation);

    // Set up interval checking
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        checkProximity(currentLocation);
      }
    }, opts.checkInterval);

    previousLocationRef.current = currentLocation;

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [currentLocation, checkProximity, opts.checkInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return {
    regions,
    activeRegions,
    events,
    lastEvent,
    addRegion,
    removeRegion,
    clearRegions,
    addFoodListingGeofence,
    removeFoodListingGeofence,
    checkProximity,
    getNearbyRegions,
    isInsideRegion,
    getDistanceToRegion,
  };
};