import type { ClusterData } from '../components/map/ClusterMarker';
import type { FoodListing } from '../components/map/FoodMarker';

export interface Point {
  latitude: number;
  longitude: number;
}

export interface ClusterOptions {
  radius: number; // Clustering radius in pixels
  minPoints: number; // Minimum points to form a cluster
  maxZoom: number; // Maximum zoom level for clustering
}

const DEFAULT_OPTIONS: ClusterOptions = {
  radius: 60,
  minPoints: 2,
  maxZoom: 16,
};

/**
 * Calculate distance between two points in kilometers
 */
export const calculateDistance = (point1: Point, point2: Point): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Convert geographic distance to pixel distance based on zoom level
 */
export const getPixelDistance = (distance: number, zoomLevel: number): number => {
  // Approximate conversion from km to pixels at different zoom levels
  const metersPerPixel = 156543.03392 * Math.cos(0) / Math.pow(2, zoomLevel);
  return (distance * 1000) / metersPerPixel;
};

/**
 * Calculate the center point of a group of coordinates
 */
export const calculateCentroid = (points: Point[]): Point => {
  if (points.length === 0) {
    throw new Error('Cannot calculate centroid of empty array');
  }

  const sum = points.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
};

/**
 * Simple clustering algorithm based on distance
 */
export const clusterListings = (
  listings: FoodListing[],
  zoomLevel: number,
  options: Partial<ClusterOptions> = {}
): { clusters: ClusterData[]; unclustered: FoodListing[] } => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Don't cluster at high zoom levels
  if (zoomLevel >= opts.maxZoom) {
    return {
      clusters: [],
      unclustered: listings,
    };
  }

  const clusters: ClusterData[] = [];
  const unclustered: FoodListing[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    
    if (processed.has(listing.id)) {
      continue;
    }

    const nearbyListings: FoodListing[] = [listing];
    processed.add(listing.id);

    // Find nearby listings
    for (let j = i + 1; j < listings.length; j++) {
      const otherListing = listings[j];
      
      if (processed.has(otherListing.id)) {
        continue;
      }

      const distance = calculateDistance(
        { latitude: listing.latitude, longitude: listing.longitude },
        { latitude: otherListing.latitude, longitude: otherListing.longitude }
      );

      const pixelDistance = getPixelDistance(distance, zoomLevel);

      if (pixelDistance <= opts.radius) {
        nearbyListings.push(otherListing);
        processed.add(otherListing.id);
      }
    }

    // Create cluster if we have enough points
    if (nearbyListings.length >= opts.minPoints) {
      const centroid = calculateCentroid(
        nearbyListings.map(l => ({ latitude: l.latitude, longitude: l.longitude }))
      );

      clusters.push({
        id: `cluster-${clusters.length}`,
        coordinate: centroid,
        pointCount: nearbyListings.length,
        listings: nearbyListings,
      });
    } else {
      // Add individual listings that don't form clusters
      unclustered.push(...nearbyListings);
    }
  }

  return { clusters, unclustered };
};

/**
 * Expand cluster to show individual markers
 */
export const expandCluster = (cluster: ClusterData, expansionRadius: number = 0.001): FoodListing[] => {
  const { coordinate, listings } = cluster;
  const expandedListings: FoodListing[] = [];

  // Arrange listings in a circle around the cluster center
  const angleStep = (2 * Math.PI) / listings.length;
  
  listings.forEach((listing, index) => {
    const angle = index * angleStep;
    const offsetLat = expansionRadius * Math.cos(angle);
    const offsetLng = expansionRadius * Math.sin(angle);

    expandedListings.push({
      ...listing,
      latitude: coordinate.latitude + offsetLat,
      longitude: coordinate.longitude + offsetLng,
    });
  });

  return expandedListings;
};

/**
 * Get zoom level from region delta
 */
export const getZoomLevel = (latitudeDelta: number): number => {
  return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
};

/**
 * Animate cluster expansion/contraction
 */
export const animateClusterTransition = (
  fromClusters: ClusterData[],
  toClusters: ClusterData[],
  duration: number = 300
): Promise<void> => {
  return new Promise((resolve) => {
    // This would be implemented with React Native Reanimated
    // For now, we'll just resolve after the duration
    setTimeout(resolve, duration);
  });
};