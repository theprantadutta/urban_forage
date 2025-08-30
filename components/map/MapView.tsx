import { useGeofencing } from "@/hooks/useGeofencing";
import { useLocationService } from "@/hooks/useLocationService";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import MapView, {
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { mockFoodListings } from "../../constants/mockData";
import { useClustering } from "../../hooks/useClustering";
import { useMapTheme } from "../../hooks/useMapTheme";
import { useNavigation as useNavigationHook } from "../../hooks/useNavigation";
import { LocationPermissionPrompt } from "../location/LocationPermissionPrompt";
import { LocationStatusIndicator } from "../location/LocationStatusIndicator";
import { ProximityAlert } from "../location/ProximityAlert";
import { NavigationOptionsModal } from "../navigation/NavigationOptionsModal";
import { NavigationPanel } from "../navigation/NavigationPanel";
import { ThemedText } from "../ThemedText";
import { ClusterMarker } from "./ClusterMarker";
import { FoodMarker, type FoodListing } from "./FoodMarker";

interface CustomMapViewProps {
  onRegionChange?: (region: Region) => void;
  initialRegion?: Region;
  showUserLocation?: boolean;
  className?: string;
  foodListings?: FoodListing[];
  selectedMarkerId?: string;
  onMarkerPress?: (listing: FoodListing) => void;
  onMarkerCalloutPress?: (listing: FoodListing) => void;
  enableClustering?: boolean;
  clusteringOptions?: {
    radius?: number;
    minPoints?: number;
    maxZoom?: number;
  };
  enableLocationTracking?: boolean;
  enableGeofencing?: boolean;
  enableNavigation?: boolean;
  onLocationUpdate?: (location: any) => void;
}

interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const CustomMapView: React.FC<CustomMapViewProps> = ({
  onRegionChange,
  initialRegion,
  showUserLocation = true,
  className = "flex-1",
  foodListings = mockFoodListings,
  selectedMarkerId,
  onMarkerPress,
  onMarkerCalloutPress,
  enableClustering = true,
  clusteringOptions = {},
  enableLocationTracking = true,
  enableGeofencing = true,
  enableNavigation = true,
  onLocationUpdate,
}) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [, setLocationPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPermissionPrompt, setShowPermissionPrompt] =
    useState<boolean>(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showNavigationModal, setShowNavigationModal] =
    useState<boolean>(false);

  const mapRef = useRef<MapView>(null);
  const { mapStyle, theme } = useMapTheme();

  // Location service hook
  const {
    currentLocation,
    isTracking,
    hasPermission,
    error: locationError,
    startTracking,
    requestPermission,
  } = useLocationService({
    enableHighAccuracy: true,
    distanceInterval: 10,
    timeInterval: 5000,
  });

  // Navigation hook
  const {
    isNavigating,
    currentRoute,
    currentStep,
    stepIndex,
    startNavigation,
    stopNavigation,
    nextStep,
    previousStep,
    openInMaps,
    calculateETA,
    getNavigationApps,
  } = useNavigationHook(currentLocation);

  // Geofencing hook
  const { lastEvent, addFoodListingGeofence } = useGeofencing(currentLocation, {
    enableNotifications: enableGeofencing,
    proximityThreshold: 100,
  });

  const [navigationApps, setNavigationApps] = useState<any[]>([]);

  // Clustering functionality
  const {
    clusters,
    unclustered,
    expandedCluster,
    expandedListings,
    isAnimating,
    expandCluster,
    contractCluster,
    updateRegion: updateClusteringRegion,
  } = useClustering(foodListings, clusteringOptions);

  // Helper functions
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371000; // Earth's radius in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const initializeLocationServices = useCallback(async () => {
    if (enableLocationTracking) {
      const granted = await requestPermission();
      if (granted) {
        await startTracking();
      } else {
        setShowPermissionPrompt(true);
      }
    }
  }, [enableLocationTracking, requestPermission, startTracking]);

  const loadNavigationApps = useCallback(async () => {
    if (enableNavigation) {
      const apps = await getNavigationApps();
      setNavigationApps(apps);
    }
  }, [enableNavigation, getNavigationApps]);

  // Initialize location and navigation apps
  useEffect(() => {
    initializeLocationServices();
    loadNavigationApps();
  }, [initializeLocationServices, loadNavigationApps]);

  // Update location state when current location changes
  useEffect(() => {
    if (currentLocation) {
      const locationState: LocationState = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(locationState);
      setLocationPermission(true);
      setLoading(false);

      // Notify parent component
      onLocationUpdate?.(currentLocation);
    }
  }, [currentLocation, onLocationUpdate]);

  // Handle location errors
  useEffect(() => {
    if (locationError) {
      setShowPermissionPrompt(true);
      setLocationPermission(false);
    }
  }, [locationError]);

  // Auto-add geofences for nearby food listings
  useEffect(() => {
    if (enableGeofencing && currentLocation && foodListings.length > 0) {
      foodListings.forEach((listing) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          listing.latitude,
          listing.longitude
        );

        // Add geofence for listings within 500m
        if (distance <= 500) {
          addFoodListingGeofence(listing, 100);
        }
      });
    }
  }, [
    currentLocation,
    foodListings,
    enableGeofencing,
    addFoodListingGeofence,
    calculateDistance,
  ]);

  // Handle marker press with navigation option
  const handleMarkerPress = useCallback(
    (listing: FoodListing) => {
      onMarkerPress?.(listing);

      // Add geofence for this listing
      if (enableGeofencing) {
        addFoodListingGeofence(listing, 100);
      }
    },
    [onMarkerPress, enableGeofencing, addFoodListingGeofence]
  );

  // Handle marker callout press to show navigation options
  const handleMarkerCalloutPress = useCallback(
    (listing: FoodListing) => {
      if (enableNavigation) {
        setSelectedDestination({
          latitude: listing.latitude,
          longitude: listing.longitude,
          title: listing.title,
          address: `${listing.latitude.toFixed(4)}, ${listing.longitude.toFixed(
            4
          )}`,
        });
        setShowNavigationModal(true);
      }
      onMarkerCalloutPress?.(listing);
    },
    [onMarkerCalloutPress, enableNavigation]
  );

  // Handle permission prompt actions
  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      await startTracking();
      setShowPermissionPrompt(false);
    }
  };

  const handlePermissionDismiss = () => {
    setShowPermissionPrompt(false);
    // Set fallback location
    const fallbackLocation: LocationState = {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setLocation(fallbackLocation);
    setLoading(false);
  };

  // Handle proximity alert actions
  const handleProximityAlertDismiss = () => {
    // Alert will auto-dismiss
  };

  const handleViewDetails = (event: any) => {
    const listing = event.region.data?.listing;
    if (listing) {
      onMarkerPress?.(listing);
    }
  };

  const handleGetDirections = (event: any) => {
    const listing = event.region.data?.listing;
    if (listing) {
      setSelectedDestination({
        latitude: listing.latitude,
        longitude: listing.longitude,
        title: listing.title,
        address: `${listing.latitude.toFixed(4)}, ${listing.longitude.toFixed(
          4
        )}`,
      });
      setShowNavigationModal(true);
    }
  };

  // Handle navigation modal actions
  const handleStartInAppNavigation = async (
    destination: any,
    options?: any
  ) => {
    return await startNavigation(destination, options);
  };

  const handleNavigationModalClose = () => {
    setShowNavigationModal(false);
    setSelectedDestination(null);
  };

  // Handle navigation panel actions
  const handleOpenInMaps = async () => {
    if (selectedDestination) {
      await openInMaps(selectedDestination);
    }
  };

  const handleRegionChange = (region: Region) => {
    onRegionChange?.(region);
    if (enableClustering) {
      updateClusteringRegion(region);
    }
  };

  if (loading) {
    return (
      <View
        className={`${className} bg-cream-white dark:bg-gray-900 justify-center items-center`}
      >
        <ThemedText className="text-forest-green dark:text-sage-green">
          Loading map...
        </ThemedText>
      </View>
    );
  }

  const region = initialRegion ||
    location || {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

  return (
    <View className={className}>
      <MapView
        ref={mapRef}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={{ flex: 1 }}
        customMapStyle={mapStyle}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation && hasPermission}
        showsMyLocationButton={true}
        showsCompass={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor={theme === "dark" ? "#87A96B" : "#2D5016"}
        loadingBackgroundColor={theme === "dark" ? "#1a1a1a" : "#FDF6E3"}
        moveOnMarkerPress={false}
        showsBuildings={true}
        showsTraffic={false}
      >
        {/* Render markers based on clustering state */}
        {enableClustering ? (
          <>
            {/* Cluster Markers */}
            {clusters.map((cluster) => (
              <ClusterMarker
                key={cluster.id}
                cluster={cluster}
                onPress={expandCluster}
                isExpanding={expandedCluster?.id === cluster.id && isAnimating}
              />
            ))}

            {/* Unclustered Individual Markers */}
            {unclustered.map((listing) => (
              <FoodMarker
                key={listing.id}
                listing={listing}
                isSelected={selectedMarkerId === listing.id}
                onPress={handleMarkerPress}
                onCalloutPress={handleMarkerCalloutPress}
              />
            ))}

            {/* Expanded Cluster Markers */}
            {expandedListings.map((listing) => (
              <FoodMarker
                key={`expanded-${listing.id}`}
                listing={listing}
                isSelected={selectedMarkerId === listing.id}
                onPress={(listing) => {
                  contractCluster();
                  handleMarkerPress(listing);
                }}
                onCalloutPress={handleMarkerCalloutPress}
              />
            ))}
          </>
        ) : (
          /* Non-clustered markers */
          foodListings.map((listing) => (
            <FoodMarker
              key={listing.id}
              listing={listing}
              isSelected={selectedMarkerId === listing.id}
              onPress={handleMarkerPress}
              onCalloutPress={handleMarkerCalloutPress}
            />
          ))
        )}
      </MapView>

      {/* Location Status Indicator */}
      {enableLocationTracking && (
        <View className="absolute top-4 left-4 right-4 z-40">
          <LocationStatusIndicator
            currentLocation={currentLocation}
            isTracking={isTracking}
            hasPermission={hasPermission}
            error={locationError}
            showDetails={true}
            onPress={() => {
              if (!hasPermission || locationError) {
                setShowPermissionPrompt(true);
              }
            }}
            className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg"
          />
        </View>
      )}

      {/* Location Permission Prompt */}
      <LocationPermissionPrompt
        isVisible={showPermissionPrompt}
        error={locationError}
        onRequestPermission={handlePermissionRequest}
        onDismiss={handlePermissionDismiss}
      />

      {/* Proximity Alert */}
      {enableGeofencing && (
        <ProximityAlert
          event={lastEvent}
          onDismiss={handleProximityAlertDismiss}
          onViewDetails={handleViewDetails}
          onGetDirections={handleGetDirections}
        />
      )}

      {/* Navigation Options Modal */}
      {enableNavigation && (
        <NavigationOptionsModal
          isVisible={showNavigationModal}
          destination={selectedDestination}
          navigationApps={navigationApps}
          onClose={handleNavigationModalClose}
          onStartInAppNavigation={handleStartInAppNavigation}
          onCalculateETA={calculateETA}
        />
      )}

      {/* Navigation Panel */}
      {enableNavigation && (
        <NavigationPanel
          isVisible={isNavigating}
          currentStep={currentStep}
          route={currentRoute}
          stepIndex={stepIndex}
          onNextStep={nextStep}
          onPreviousStep={previousStep}
          onStopNavigation={stopNavigation}
          onOpenInMaps={handleOpenInMaps}
        />
      )}
    </View>
  );
};

export default CustomMapView;
