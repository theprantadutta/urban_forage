import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: string;
  message: string;
  type: 'permission' | 'unavailable' | 'timeout' | 'accuracy';
}

interface LocationServiceOptions {
  enableHighAccuracy?: boolean;
  distanceInterval?: number; // meters
  timeInterval?: number; // milliseconds
  enableBackgroundLocation?: boolean;
  showLocationDialog?: boolean;
}

interface UseLocationServiceReturn {
  // Current location state
  currentLocation: LocationData | null;
  isTracking: boolean;
  hasPermission: boolean;
  permissionStatus: Location.PermissionStatus | null;
  
  // Location history
  locationHistory: LocationData[];
  
  // Error handling
  error: LocationError | null;
  
  // Actions
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  clearHistory: () => void;
  
  // Utility functions
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  isLocationStale: (location: LocationData, maxAgeMs?: number) => boolean;
}

const DEFAULT_OPTIONS: Required<LocationServiceOptions> = {
  enableHighAccuracy: true,
  distanceInterval: 10, // 10 meters
  timeInterval: 5000, // 5 seconds
  enableBackgroundLocation: false,
  showLocationDialog: true,
};

const MAX_LOCATION_HISTORY = 50;
const DEFAULT_MAX_AGE_MS = 60000; // 1 minute

export const useLocationService = (
  options: LocationServiceOptions = {}
): UseLocationServiceReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [error, setError] = useState<LocationError | null>(null);
  
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const appStateSubscription = useRef<any>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Check if location is stale
  const isLocationStale = useCallback((location: LocationData, maxAgeMs: number = DEFAULT_MAX_AGE_MS): boolean => {
    return Date.now() - location.timestamp > maxAgeMs;
  }, []);

  // Request location permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        if (opts.showLocationDialog) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Location.enableNetworkProviderAsync() },
            ]
          );
        }
        setError({
          code: 'LOCATION_UNAVAILABLE',
          message: 'Location services are disabled',
          type: 'unavailable',
        });
        return false;
      }

      // Request foreground permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(foregroundStatus);
      
      if (foregroundStatus !== 'granted') {
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied',
          type: 'permission',
        });
        setHasPermission(false);
        return false;
      }

      // Request background permissions if needed
      if (opts.enableBackgroundLocation) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission denied');
          // Continue with foreground only
        }
      }

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Permission request error:', err);
      setError({
        code: 'PERMISSION_ERROR',
        message: err instanceof Error ? err.message : 'Unknown permission error',
        type: 'permission',
      });
      setHasPermission(false);
      return false;
    }
  }, [opts.showLocationDialog, opts.enableBackgroundLocation]);

  // Get current location once
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      setError(null);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: opts.enableHighAccuracy 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Get current location error:', err);
      setError({
        code: 'LOCATION_ERROR',
        message: err instanceof Error ? err.message : 'Failed to get current location',
        type: 'unavailable',
      });
      return null;
    }
  }, [hasPermission, requestPermission, opts.enableHighAccuracy]);

  // Start location tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      if (isTracking) {
        console.warn('Location tracking is already active');
        return true;
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      setError(null);
      setIsTracking(true);

      // Start watching position
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: opts.enableHighAccuracy 
            ? Location.Accuracy.BestForNavigation 
            : Location.Accuracy.Balanced,
          timeInterval: opts.timeInterval,
          distanceInterval: opts.distanceInterval,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          setCurrentLocation(locationData);
          
          // Add to history
          setLocationHistory(prev => {
            const updated = [locationData, ...prev].slice(0, MAX_LOCATION_HISTORY);
            return updated;
          });
        }
      );

      return true;
    } catch (err) {
      console.error('Start tracking error:', err);
      setError({
        code: 'TRACKING_ERROR',
        message: err instanceof Error ? err.message : 'Failed to start location tracking',
        type: 'unavailable',
      });
      setIsTracking(false);
      return false;
    }
  }, [isTracking, hasPermission, requestPermission, opts]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  }, []);

  // Clear location history
  const clearHistory = useCallback(() => {
    setLocationHistory([]);
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && !opts.enableBackgroundLocation) {
        // Optionally stop tracking when app goes to background
        // stopTracking();
      } else if (nextAppState === 'active' && hasPermission) {
        // Optionally restart tracking when app becomes active
        // startTracking();
      }
    };

    appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [opts.enableBackgroundLocation, hasPermission]);

  // Check initial permissions
  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(status);
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Initial permission check error:', err);
      }
    };

    checkInitialPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [stopTracking]);

  return {
    currentLocation,
    isTracking,
    hasPermission,
    permissionStatus,
    locationHistory,
    error,
    startTracking,
    stopTracking,
    requestPermission,
    getCurrentLocation,
    clearHistory,
    calculateDistance,
    isLocationStale,
  };
};