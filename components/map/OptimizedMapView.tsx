import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import type { FoodListing } from './FoodMarker';
import { FoodMarker } from './FoodMarker';
import { OptimizedMarkerCluster } from './OptimizedMarkerCluster';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Performance constants
const MAX_MARKERS_BEFORE_CLUSTERING = 50;
const VIEWPORT_PADDING = 0.1; // 10% padding around viewport
const DEBOUNCE_DELAY = 300;
const MIN_ZOOM_FOR_MARKERS = 10;

interface OptimizedMapViewProps {
  listings: FoodListing[];
  initialRegion?: Region;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (listing: FoodListing) => void;
  showUserLocation?: boolean;
  customMapStyle?: any[];
  className?: string;
}

export const OptimizedMapView: React.FC<OptimizedMapViewProps> = memo(({
  listings,
  initialRegion,
  onRegionChange,
  onMarkerPress,
  showUserLocation = true,
  customMapStyle,
  className = '',
}) => {
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(
    initialRegion || {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const regionChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Calculate viewport bounds with padding
  const viewportBounds = useMemo(() => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = currentRegion;
    const paddingLat = latitudeDelta * VIEWPORT_PADDING;
    const paddingLng = longitudeDelta * VIEWPORT_PADDING;
    
    return {
      northEast: {
        latitude: latitude + latitudeDelta / 2 + paddingLat,
        longitude: longitude + longitudeDelta / 2 + paddingLng,
      },
      southWest: {
        latitude: latitude - latitudeDelta / 2 - paddingLat,
        longitude: longitude - longitudeDelta / 2 - paddingLng,
      },
    };
  }, [currentRegion]);

  // Filter listings within viewport for performance
  const visibleListings = useMemo(() => {
    if (!isMapReady) return [];
    
    return listings.filter(listing => {
      const { latitude, longitude } = listing;
      return (
        latitude <= viewportBounds.northEast.latitude &&
        latitude >= viewportBounds.southWest.latitude &&
        longitude <= viewportBounds.northEast.longitude &&
        longitude >= viewportBounds.southWest.longitude
      );
    });
  }, [listings, viewportBounds, isMapReady]);

  // Determine if we should use clustering
  const shouldCluster = useMemo(() => {
    return visibleListings.length > MAX_MARKERS_BEFORE_CLUSTERING;
  }, [visibleListings.length]);

  // Calculate zoom level from region
  const zoomLevel = useMemo(() => {
    const { latitudeDelta } = currentRegion;
    return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
  }, [currentRegion]);

  // Only show markers at appropriate zoom levels
  const shouldShowMarkers = useMemo(() => {
    return zoomLevel >= MIN_ZOOM_FOR_MARKERS;
  }, [zoomLevel]);

  // Debounced region change handler
  const handleRegionChangeComplete = useCallback((region: Region) => {
    if (regionChangeTimeoutRef.current) {
      clearTimeout(regionChangeTimeoutRef.current);
    }

    regionChangeTimeoutRef.current = setTimeout(() => {
      setCurrentRegion(region);
      onRegionChange?.(region);
    }, DEBOUNCE_DELAY);
  }, [onRegionChange]);

  // Optimized marker rendering
  const renderMarkers = useMemo(() => {
    if (!shouldShowMarkers || !isMapReady) {
      return null;
    }

    if (shouldCluster) {
      return (
        <OptimizedMarkerCluster
          listings={visibleListings}
          region={currentRegion}
          onMarkerPress={onMarkerPress}
          maxZoom={18}
          minZoom={MIN_ZOOM_FOR_MARKERS}
        />
      );
    }

    return visibleListings.map((listing) => (
      <FoodMarker
        key={listing.id}
        listing={listing}
        onPress={() => onMarkerPress?.(listing)}

      />
    ));
  }, [shouldShowMarkers, isMapReady, shouldCluster, visibleListings, currentRegion, onMarkerPress]);

  // Map configuration optimized for performance
  const mapConfig = useMemo(() => ({
    showsUserLocation: showUserLocation,
    showsMyLocationButton: false,
    showsCompass: false,
    showsScale: false,
    showsBuildings: false,
    showsTraffic: false,
    showsIndoors: false,
    loadingEnabled: true,
    loadingIndicatorColor: '#2D5016',
    loadingBackgroundColor: '#F3F4F6',
    moveOnMarkerPress: false,
    pitchEnabled: false,
    rotateEnabled: false,
    scrollEnabled: true,
    zoomEnabled: true,
    zoomTapEnabled: true,
    zoomControlEnabled: false,
    mapPadding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    // Performance optimizations
    cacheEnabled: true,
    maxZoomLevel: 18,
    minZoomLevel: 3,
    ...(Platform.OS === 'android' && {
      toolbarEnabled: false,
      compassOffset: { x: -1, y: -1 },
    }),
  }), [showUserLocation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }
    };
  }, []);

  // Performance monitoring (development only)
  useEffect(() => {
    if (__DEV__) {
      console.log(`[MapPerformance] Visible listings: ${visibleListings.length}/${listings.length}`);
      console.log(`[MapPerformance] Clustering: ${shouldCluster ? 'enabled' : 'disabled'}`);
      console.log(`[MapPerformance] Zoom level: ${zoomLevel}`);
    }
  }, [visibleListings.length, listings.length, shouldCluster, zoomLevel]);

  return (
    <MapView
      ref={mapRef}
      className={className}
      style={{ flex: 1 }}
      initialRegion={currentRegion}
      customMapStyle={customMapStyle}
      onMapReady={() => setIsMapReady(true)}
      onRegionChangeComplete={handleRegionChangeComplete}
      {...mapConfig}
    >
      {renderMarkers}
    </MapView>
  );
});

OptimizedMapView.displayName = 'OptimizedMapView';

export default OptimizedMapView;