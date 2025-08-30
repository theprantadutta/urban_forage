import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Region } from 'react-native-maps';
import type { ClusterData } from '../components/map/ClusterMarker';
import type { FoodListing } from '../components/map/FoodMarker';
import { clusterListings, expandCluster, getZoomLevel, type ClusterOptions } from '../utils/clustering';

interface UseClusteringOptions extends Partial<ClusterOptions> {
  animationDuration?: number;
}

interface UseClusteringReturn {
  clusters: ClusterData[];
  unclustered: FoodListing[];
  expandedCluster: ClusterData | null;
  expandedListings: FoodListing[];
  isAnimating: boolean;
  expandCluster: (cluster: ClusterData) => void;
  contractCluster: () => void;
  updateRegion: (region: Region) => void;
}

export const useClustering = (
  listings: FoodListing[],
  options: UseClusteringOptions = {}
): UseClusteringReturn => {
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<ClusterData | null>(null);
  const [expandedListings, setExpandedListings] = useState<FoodListing[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    animationDuration = 300,
    ...clusterOptions
  } = options;

  // Calculate clusters based on current region and listings
  const { clusters, unclustered } = useMemo(() => {
    if (!currentRegion || listings.length === 0) {
      return { clusters: [], unclustered: listings };
    }

    const zoomLevel = getZoomLevel(currentRegion.latitudeDelta);
    return clusterListings(listings, zoomLevel, clusterOptions);
  }, [listings, currentRegion, clusterOptions]);

  // Update region
  const updateRegion = useCallback((region: Region) => {
    setCurrentRegion(region);
    // Contract any expanded cluster when region changes
    if (expandedCluster) {
      contractCluster();
    }
  }, [expandedCluster]);

  // Expand cluster to show individual markers
  const handleExpandCluster = useCallback(async (cluster: ClusterData) => {
    if (isAnimating) return;

    setIsAnimating(true);
    
    try {
      // Generate expanded positions for listings
      const expanded = expandCluster(cluster, 0.002); // Adjust expansion radius as needed
      
      setExpandedCluster(cluster);
      setExpandedListings(expanded);
      
      // Simulate animation duration
      await new Promise(resolve => setTimeout(resolve, animationDuration));
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, animationDuration]);

  // Contract expanded cluster
  const contractCluster = useCallback(async () => {
    if (isAnimating || !expandedCluster) return;

    setIsAnimating(true);
    
    try {
      // Simulate animation duration
      await new Promise(resolve => setTimeout(resolve, animationDuration));
      
      setExpandedCluster(null);
      setExpandedListings([]);
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, expandedCluster, animationDuration]);

  // Clean up expanded cluster when listings change
  useEffect(() => {
    if (expandedCluster) {
      // Check if the expanded cluster still exists in the new clusters
      const stillExists = clusters.some(c => c.id === expandedCluster.id);
      if (!stillExists) {
        setExpandedCluster(null);
        setExpandedListings([]);
      }
    }
  }, [clusters, expandedCluster]);

  return {
    clusters,
    unclustered,
    expandedCluster,
    expandedListings,
    isAnimating,
    expandCluster: handleExpandCluster,
    contractCluster,
    updateRegion,
  };
};