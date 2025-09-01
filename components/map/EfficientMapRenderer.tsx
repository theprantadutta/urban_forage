import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';
import type { Region } from 'react-native-maps';
import type { FoodListing } from './FoodMarker';
import { LazyMapElements } from './LazyMapElements';
import { OptimizedMarkerCluster } from './OptimizedMarkerCluster';
import { ViewportMarkerRenderer } from './ViewportMarkerRenderer';

// Rendering strategies
type RenderingStrategy = 'viewport' | 'lazy' | 'clustered' | 'hybrid';

// Performance thresholds
const CLUSTERING_THRESHOLD = 50;
const LAZY_LOADING_THRESHOLD = 100;
const VIEWPORT_ONLY_THRESHOLD = 200;

interface RenderingConfig {
  strategy: RenderingStrategy;
  maxMarkers: number;
  enableClustering: boolean;
  enableLazyLoading: boolean;
  enableViewportFiltering: boolean;
}

interface EfficientMapRendererProps {
  listings: FoodListing[];
  region: Region;
  userLocation?: { latitude: number; longitude: number };
  onMarkerPress?: (listing: FoodListing) => void;
  onClusterPress?: (listings: FoodListing[]) => void;
  forceStrategy?: RenderingStrategy;
  className?: string;
}

export const EfficientMapRenderer: React.FC<EfficientMapRendererProps> = memo(({
  listings,
  region,
  userLocation,
  onMarkerPress,
  onClusterPress,
  forceStrategy,
  className = '',
}) => {
  const [isInteractionComplete, setIsInteractionComplete] = useState(true);
  const [renderingConfig, setRenderingConfig] = useState<RenderingConfig>({
    strategy: 'viewport',
    maxMarkers: 50,
    enableClustering: false,
    enableLazyLoading: false,
    enableViewportFiltering: true,
  });


  const renderCountRef = useRef<number>(0);
  const performanceMetricsRef = useRef({
    averageRenderTime: 0,
    renderTimes: [] as number[],
  });

  // Determine optimal rendering strategy based on data size and performance
  const determineStrategy = useCallback((listingCount: number): RenderingConfig => {
    if (forceStrategy) {
      return {
        strategy: forceStrategy,
        maxMarkers: getMaxMarkersForStrategy(forceStrategy, listingCount),
        enableClustering: forceStrategy === 'clustered' || forceStrategy === 'hybrid',
        enableLazyLoading: forceStrategy === 'lazy' || forceStrategy === 'hybrid',
        enableViewportFiltering: true,
      };
    }

    // Auto-determine strategy based on listing count and performance
    if (listingCount <= CLUSTERING_THRESHOLD) {
      return {
        strategy: 'viewport',
        maxMarkers: listingCount,
        enableClustering: false,
        enableLazyLoading: false,
        enableViewportFiltering: true,
      };
    } else if (listingCount <= LAZY_LOADING_THRESHOLD) {
      return {
        strategy: 'clustered',
        maxMarkers: CLUSTERING_THRESHOLD,
        enableClustering: true,
        enableLazyLoading: false,
        enableViewportFiltering: true,
      };
    } else if (listingCount <= VIEWPORT_ONLY_THRESHOLD) {
      return {
        strategy: 'lazy',
        maxMarkers: LAZY_LOADING_THRESHOLD,
        enableClustering: false,
        enableLazyLoading: true,
        enableViewportFiltering: true,
      };
    } else {
      return {
        strategy: 'hybrid',
        maxMarkers: VIEWPORT_ONLY_THRESHOLD,
        enableClustering: true,
        enableLazyLoading: true,
        enableViewportFiltering: true,
      };
    }
  }, [forceStrategy]);

  // Get max markers for a given strategy
  const getMaxMarkersForStrategy = (strategy: RenderingStrategy, listingCount: number): number => {
    switch (strategy) {
      case 'viewport':
        return Math.min(listingCount, 50);
      case 'clustered':
        return Math.min(listingCount, 100);
      case 'lazy':
        return Math.min(listingCount, 150);
      case 'hybrid':
        return Math.min(listingCount, 200);
      default:
        return 50;
    }
  };

  // Update rendering configuration when listings change
  useEffect(() => {
    const newConfig = determineStrategy(listings.length);
    setRenderingConfig(newConfig);
    
    if (__DEV__) {
      console.log(`[EfficientRenderer] Strategy: ${newConfig.strategy}, Markers: ${newConfig.maxMarkers}/${listings.length}`);
    }
  }, [listings.length, determineStrategy]);

  // Track interaction state for performance optimization
  useEffect(() => {
    setIsInteractionComplete(false);
    
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsInteractionComplete(true);
    });
    
    return () => handle.cancel();
  }, [region]);

  // Performance monitoring
  const trackRenderPerformance = useCallback(() => {
    const startTime = performance.now();
    renderCountRef.current++;
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const metrics = performanceMetricsRef.current;
      metrics.renderTimes.push(renderTime);
      
      // Keep only last 10 render times
      if (metrics.renderTimes.length > 10) {
        metrics.renderTimes.shift();
      }
      
      metrics.averageRenderTime = metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length;
      
      if (__DEV__ && renderTime > 16) {
        console.warn(`[EfficientRenderer] Slow render: ${renderTime.toFixed(2)}ms (avg: ${metrics.averageRenderTime.toFixed(2)}ms)`);
      }
    };
  }, []);

  // Render based on strategy
  const renderContent = useMemo(() => {
    const endTracking = trackRenderPerformance();
    
    const content = (() => {
      switch (renderingConfig.strategy) {
        case 'viewport':
          return (
            <ViewportMarkerRenderer
              listings={listings}
              region={region}
              userLocation={userLocation}
              onMarkerPress={onMarkerPress}
              maxMarkers={renderingConfig.maxMarkers}
            />
          );
          
        case 'clustered':
          return (
            <OptimizedMarkerCluster
              listings={listings}
              region={region}
              onMarkerPress={onMarkerPress}
              onClusterPress={onClusterPress}
            />
          );
          
        case 'lazy':
          return (
            <LazyMapElements
              listings={listings}
              region={region}
              maxElements={renderingConfig.maxMarkers}
            >
              {(visibleListings) => (
                <ViewportMarkerRenderer
                  listings={visibleListings}
                  region={region}
                  userLocation={userLocation}
                  onMarkerPress={onMarkerPress}
                  maxMarkers={renderingConfig.maxMarkers}
                />
              )}
            </LazyMapElements>
          );
          
        case 'hybrid':
          return (
            <LazyMapElements
              listings={listings}
              region={region}
              maxElements={renderingConfig.maxMarkers}
            >
              {(visibleListings) => (
                <OptimizedMarkerCluster
                  listings={visibleListings}
                  region={region}
                  onMarkerPress={onMarkerPress}
                  onClusterPress={onClusterPress}
                />
              )}
            </LazyMapElements>
          );
          
        default:
          return null;
      }
    })();
    
    // Track render completion
    setTimeout(endTracking, 0);
    
    return content;
  }, [
    renderingConfig.strategy,
    renderingConfig.maxMarkers,
    listings,
    region,
    userLocation,
    onMarkerPress,
    onClusterPress,
    trackRenderPerformance,
  ]);

  // Defer rendering during interactions for better performance
  if (!isInteractionComplete && Platform.OS === 'android') {
    return null;
  }

  return renderContent;
});

EfficientMapRenderer.displayName = 'EfficientMapRenderer';

export default EfficientMapRenderer;