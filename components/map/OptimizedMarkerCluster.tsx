import React, { memo, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Region } from 'react-native-maps';
import { ClusterMarker } from './ClusterMarker';
import type { FoodListing } from './FoodMarker';
import { FoodMarker } from './FoodMarker';

const { width, height } = Dimensions.get('window');

// Clustering configuration
const CLUSTER_RADIUS = 60; // pixels
const MIN_CLUSTER_SIZE = 2;
const MAX_CLUSTER_SIZE = 100;

interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  listings: FoodListing[];
  isCluster: boolean;
}

interface OptimizedMarkerClusterProps {
  listings: FoodListing[];
  region: Region;
  onMarkerPress?: (listing: FoodListing) => void;
  onClusterPress?: (listings: FoodListing[]) => void;
  maxZoom?: number;
  minZoom?: number;
  clusterRadius?: number;
}

export const OptimizedMarkerCluster: React.FC<OptimizedMarkerClusterProps> = memo(({
  listings,
  region,
  onMarkerPress,
  onClusterPress,
  maxZoom = 18,
  minZoom = 3,
  clusterRadius = CLUSTER_RADIUS,
}) => {
  // Calculate current zoom level
  const zoomLevel = useMemo(() => {
    const { latitudeDelta } = region;
    return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
  }, [region]);

  // Convert lat/lng to screen coordinates for clustering
  const latLngToPixel = useMemo(() => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    return (lat: number, lng: number) => {
      const x = ((lng - (longitude - longitudeDelta / 2)) / longitudeDelta) * width;
      const y = (((latitude + latitudeDelta / 2) - lat) / latitudeDelta) * height;
      return { x, y };
    };
  }, [region]);



  // Perform clustering algorithm
  const clusteredPoints = useMemo(() => {
    if (zoomLevel >= maxZoom || listings.length < MIN_CLUSTER_SIZE) {
      // Don't cluster at high zoom levels or with few markers
      return listings.map(listing => ({
        id: listing.id,
        latitude: listing.latitude,
        longitude: listing.longitude,
        listings: [listing],
        isCluster: false,
      }));
    }

    const points: ClusterPoint[] = [];
    const processed = new Set<string>();

    for (const listing of listings) {
      if (processed.has(listing.id)) continue;

      const pixel = latLngToPixel(listing.latitude, listing.longitude);
      const cluster: FoodListing[] = [listing];
      processed.add(listing.id);

      // Find nearby points within cluster radius
      for (const otherListing of listings) {
        if (processed.has(otherListing.id)) continue;

        const otherPixel = latLngToPixel(otherListing.latitude, otherListing.longitude);
        const distance = Math.sqrt(
          Math.pow(pixel.x - otherPixel.x, 2) + Math.pow(pixel.y - otherPixel.y, 2)
        );

        if (distance <= clusterRadius && cluster.length < MAX_CLUSTER_SIZE) {
          cluster.push(otherListing);
          processed.add(otherListing.id);
        }
      }

      // Calculate cluster center
      const centerLat = cluster.reduce((sum, item) => sum + item.latitude, 0) / cluster.length;
      const centerLng = cluster.reduce((sum, item) => sum + item.longitude, 0) / cluster.length;

      points.push({
        id: cluster.length > 1 ? `cluster_${points.length}` : listing.id,
        latitude: centerLat,
        longitude: centerLng,
        listings: cluster,
        isCluster: cluster.length > 1,
      });
    }

    return points;
  }, [listings, zoomLevel, maxZoom, latLngToPixel, clusterRadius]);

  // Render optimized markers
  const renderMarkers = useMemo(() => {
    return clusteredPoints.map((point) => {
      if (point.isCluster) {
        return (
          <ClusterMarker
            key={point.id}
            cluster={{
              id: point.id,
              coordinate: {
                latitude: point.latitude,
                longitude: point.longitude,
              },
              pointCount: point.listings.length,
              listings: point.listings,
            }}
            onPress={(cluster) => {
              if (zoomLevel < maxZoom - 2) {
                // Zoom in to expand cluster
                onClusterPress?.(cluster.listings);
              } else {
                // Show cluster details at max zoom
                onClusterPress?.(point.listings);
              }
            }}
          />
        );
      } else {
        const listing = point.listings[0];
        return (
          <FoodMarker
            key={listing.id}
            listing={listing}
            onPress={() => onMarkerPress?.(listing)}
          />
        );
      }
    });
  }, [clusteredPoints, zoomLevel, maxZoom, onMarkerPress, onClusterPress]);

  // Performance logging in development
  if (__DEV__) {
    const clusterCount = clusteredPoints.filter(p => p.isCluster).length;
    const markerCount = clusteredPoints.filter(p => !p.isCluster).length;
    console.log(`[Clustering] ${listings.length} listings → ${clusterCount} clusters + ${markerCount} markers`);
  }

  return <>{renderMarkers}</>;
});

OptimizedMarkerCluster.displayName = 'OptimizedMarkerCluster';

export default OptimizedMarkerCluster;