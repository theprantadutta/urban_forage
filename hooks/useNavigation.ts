import { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';
import type { LocationData } from './useLocationService';

export interface NavigationDestination {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
}

export interface NavigationOptions {
  mode?: 'driving' | 'walking' | 'transit' | 'cycling';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  provider?: 'apple' | 'google' | 'waze' | 'system';
}

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface NavigationRoute {
  steps: RouteStep[];
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  polyline?: string; // Encoded polyline for map display
}

interface UseNavigationReturn {
  // Navigation state
  isNavigating: boolean;
  currentRoute: NavigationRoute | null;
  currentStep: RouteStep | null;
  stepIndex: number;
  
  // Actions
  startNavigation: (destination: NavigationDestination, options?: NavigationOptions) => Promise<boolean>;
  stopNavigation: () => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // External navigation
  openInMaps: (destination: NavigationDestination, options?: NavigationOptions) => Promise<boolean>;
  openInGoogleMaps: (destination: NavigationDestination, options?: NavigationOptions) => Promise<boolean>;
  openInWaze: (destination: NavigationDestination, options?: NavigationOptions) => Promise<boolean>;
  
  // Utilities
  calculateETA: (destination: NavigationDestination, currentLocation?: LocationData) => Promise<number | null>;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
  getNavigationApps: () => Promise<{ name: string; available: boolean; action: () => Promise<boolean> }[]>;
}

const DEFAULT_OPTIONS: Required<NavigationOptions> = {
  mode: 'driving',
  avoidTolls: false,
  avoidHighways: false,
  provider: 'system',
};

export const useNavigation = (
  currentLocation: LocationData | null
): UseNavigationReturn => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [currentStep, setCurrentStep] = useState<RouteStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Format distance for display
  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  // Calculate ETA (mock implementation)
  const calculateETA = useCallback(async (
    destination: NavigationDestination,
    location: LocationData = currentLocation!
  ): Promise<number | null> => {
    if (!location) return null;

    try {
      // Calculate straight-line distance
      const R = 6371000; // Earth's radius in meters
      const dLat = (destination.latitude - location.latitude) * Math.PI / 180;
      const dLon = (destination.longitude - location.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(location.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Estimate travel time (rough calculation)
      // Walking: 5 km/h, Driving: 50 km/h average in city
      const walkingSpeed = 5000 / 3600; // m/s
      const drivingSpeed = 50000 / 3600; // m/s
      
      const estimatedTime = distance / drivingSpeed; // seconds
      return Math.round(estimatedTime);
    } catch (error) {
      console.error('ETA calculation error:', error);
      return null;
    }
  }, [currentLocation]);

  // Open in Apple Maps (iOS) or Google Maps (Android)
  const openInMaps = useCallback(async (
    destination: NavigationDestination,
    options: NavigationOptions = {}
  ): Promise<boolean> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      const { latitude, longitude, title } = destination;
      
      if (Platform.OS === 'ios') {
        // Apple Maps
        const url = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=${opts.mode === 'walking' ? 'w' : 'd'}`;
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
          return true;
        }
      } else {
        // Google Maps
        const mode = opts.mode === 'walking' ? 'walking' : 'driving';
        const url = `google.navigation:q=${latitude},${longitude}&mode=${mode}`;
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
          return true;
        } else {
          // Fallback to web version
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${mode}`;
          await Linking.openURL(webUrl);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Open in maps error:', error);
      return false;
    }
  }, []);

  // Open in Google Maps specifically
  const openInGoogleMaps = useCallback(async (
    destination: NavigationDestination,
    options: NavigationOptions = {}
  ): Promise<boolean> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      const { latitude, longitude } = destination;
      const mode = opts.mode === 'walking' ? 'walking' : 'driving';
      
      // Try native Google Maps app first
      const nativeUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=${mode}`;
      const nativeSupported = await Linking.canOpenURL(nativeUrl);
      
      if (nativeSupported) {
        await Linking.openURL(nativeUrl);
        return true;
      } else {
        // Fallback to web version
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${mode}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Open in Google Maps error:', error);
      return false;
    }
  }, []);

  // Open in Waze
  const openInWaze = useCallback(async (
    destination: NavigationDestination,
    options: NavigationOptions = {}
  ): Promise<boolean> => {
    try {
      const { latitude, longitude } = destination;
      const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web version
        const webUrl = `https://waze.com/ul?ll=${latitude}%2C${longitude}&navigate=yes`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Open in Waze error:', error);
      return false;
    }
  }, []);

  // Get available navigation apps
  const getNavigationApps = useCallback(async () => {
    const apps = [
      {
        name: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
        available: true, // System maps are always available
        action: async () => openInMaps({ latitude: 0, longitude: 0 }),
      },
      {
        name: 'Google Maps',
        available: false,
        action: async () => openInGoogleMaps({ latitude: 0, longitude: 0 }),
      },
      {
        name: 'Waze',
        available: false,
        action: async () => openInWaze({ latitude: 0, longitude: 0 }),
      },
    ];

    // Check availability of each app
    try {
      const googleMapsUrl = Platform.OS === 'ios' 
        ? 'comgooglemaps://' 
        : 'google.navigation:q=0,0';
      apps[1].available = await Linking.canOpenURL(googleMapsUrl);
      
      const wazeUrl = 'waze://';
      apps[2].available = await Linking.canOpenURL(wazeUrl);
    } catch (error) {
      console.error('Error checking app availability:', error);
    }

    return apps;
  }, [openInMaps, openInGoogleMaps, openInWaze]);

  // Start in-app navigation (mock implementation)
  const startNavigation = useCallback(async (
    destination: NavigationDestination,
    options: NavigationOptions = {}
  ): Promise<boolean> => {
    if (!currentLocation) {
      console.error('Current location not available for navigation');
      return false;
    }

    try {
      // Mock route generation
      const mockRoute: NavigationRoute = {
        steps: [
          {
            instruction: "Head north on current street",
            distance: 200,
            duration: 30,
            maneuver: "straight",
            coordinates: {
              latitude: currentLocation.latitude + 0.001,
              longitude: currentLocation.longitude,
            },
          },
          {
            instruction: "Turn right onto Main Street",
            distance: 500,
            duration: 90,
            maneuver: "turn-right",
            coordinates: {
              latitude: currentLocation.latitude + 0.001,
              longitude: currentLocation.longitude + 0.002,
            },
          },
          {
            instruction: "Continue straight for 1.2 km",
            distance: 1200,
            duration: 180,
            maneuver: "straight",
            coordinates: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        ],
        totalDistance: 1900,
        totalDuration: 300,
      };

      setCurrentRoute(mockRoute);
      setCurrentStep(mockRoute.steps[0]);
      setStepIndex(0);
      setIsNavigating(true);

      return true;
    } catch (error) {
      console.error('Start navigation error:', error);
      return false;
    }
  }, [currentLocation]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentRoute(null);
    setCurrentStep(null);
    setStepIndex(0);
  }, []);

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentRoute && stepIndex < currentRoute.steps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      setCurrentStep(currentRoute.steps[newIndex]);
    }
  }, [currentRoute, stepIndex]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentRoute && stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      setCurrentStep(currentRoute.steps[newIndex]);
    }
  }, [currentRoute, stepIndex]);

  return {
    isNavigating,
    currentRoute,
    currentStep,
    stepIndex,
    startNavigation,
    stopNavigation,
    nextStep,
    previousStep,
    openInMaps,
    openInGoogleMaps,
    openInWaze,
    calculateETA,
    formatDistance,
    formatDuration,
    getNavigationApps,
  };
};