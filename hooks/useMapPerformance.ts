import { useCallback, useEffect, useRef, useState } from 'react';
import type { Region } from 'react-native-maps';

interface PerformanceMetrics {
  renderTime: number;
  markerCount: number;
  regionChanges: number;
  averageRenderTime: number;
  memoryUsage?: number;
  frameDrops: number;
}

interface UseMapPerformanceOptions {
  enableLogging?: boolean;
  sampleRate?: number; // 0-1, percentage of renders to measure
  maxSamples?: number;
}

export const useMapPerformance = (options: UseMapPerformanceOptions = {}) => {
  const {
    enableLogging = __DEV__,
    sampleRate = 0.1,
    maxSamples = 100,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    markerCount: 0,
    regionChanges: 0,
    averageRenderTime: 0,
    frameDrops: 0,
  });

  const renderTimesRef = useRef<number[]>([]);
  const lastRenderTimeRef = useRef<number>(0);
  const regionChangeCountRef = useRef<number>(0);
  const frameDropCountRef = useRef<number>(0);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Start performance measurement
  const startMeasurement = useCallback((label: string = 'map-render') => {
    if (!enableLogging || Math.random() > sampleRate) return null;
    
    const startTime = performance.now();
    return {
      label,
      startTime,
      end: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Store render time
        renderTimesRef.current.push(renderTime);
        if (renderTimesRef.current.length > maxSamples) {
          renderTimesRef.current.shift();
        }
        
        // Calculate average
        const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
        
        setMetrics(prev => ({
          ...prev,
          renderTime,
          averageRenderTime,
        }));
        
        if (enableLogging && renderTime > 16) { // More than one frame at 60fps
          console.warn(`[MapPerformance] Slow render: ${renderTime.toFixed(2)}ms for ${label}`);
        }
        
        return renderTime;
      },
    };
  }, [enableLogging, sampleRate, maxSamples]);

  // Track region changes
  const trackRegionChange = useCallback((region: Region) => {
    regionChangeCountRef.current++;
    setMetrics(prev => ({
      ...prev,
      regionChanges: regionChangeCountRef.current,
    }));
    
    if (enableLogging) {
      console.log(`[MapPerformance] Region change #${regionChangeCountRef.current}:`, {
        lat: region.latitude.toFixed(4),
        lng: region.longitude.toFixed(4),
        latDelta: region.latitudeDelta.toFixed(4),
        lngDelta: region.longitudeDelta.toFixed(4),
      });
    }
  }, [enableLogging]);

  // Track marker count
  const trackMarkerCount = useCallback((count: number) => {
    setMetrics(prev => ({
      ...prev,
      markerCount: count,
    }));
    
    if (enableLogging && count > 50) {
      console.warn(`[MapPerformance] High marker count: ${count}`);
    }
  }, [enableLogging]);

  // Track frame drops (if available)
  const trackFrameDrops = useCallback(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        performanceObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let drops = 0;
          
          entries.forEach((entry) => {
            if (entry.entryType === 'measure' && entry.duration > 16.67) {
              drops++;
            }
          });
          
          if (drops > 0) {
            frameDropCountRef.current += drops;
            setMetrics(prev => ({
              ...prev,
              frameDrops: frameDropCountRef.current,
            }));
          }
        });
        
        performanceObserverRef.current.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('[MapPerformance] PerformanceObserver not supported:', error);
      }
    }
  }, []);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  }, []);

  // Performance report
  const getPerformanceReport = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    
    return {
      ...metrics,
      memoryUsage,
      recommendations: generateRecommendations(metrics, memoryUsage),
    };
  }, [metrics, getMemoryUsage]);

  // Generate performance recommendations
  const generateRecommendations = (
    metrics: PerformanceMetrics,
    memoryUsage: any
  ): string[] => {
    const recommendations: string[] = [];
    
    if (metrics.averageRenderTime > 16) {
      recommendations.push('Consider reducing marker count or enabling clustering');
    }
    
    if (metrics.markerCount > 100) {
      recommendations.push('Enable viewport-based marker rendering');
    }
    
    if (metrics.frameDrops > 10) {
      recommendations.push('Optimize marker animations or reduce visual complexity');
    }
    
    if (memoryUsage && memoryUsage.used > 100) {
      recommendations.push('Consider implementing marker recycling or lazy loading');
    }
    
    if (metrics.regionChanges > 50) {
      recommendations.push('Implement region change debouncing');
    }
    
    return recommendations;
  };

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderTimesRef.current = [];
    regionChangeCountRef.current = 0;
    frameDropCountRef.current = 0;
    
    setMetrics({
      renderTime: 0,
      markerCount: 0,
      regionChanges: 0,
      averageRenderTime: 0,
      frameDrops: 0,
    });
  }, []);

  // Setup performance monitoring
  useEffect(() => {
    if (enableLogging) {
      trackFrameDrops();
    }
    
    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, [enableLogging, trackFrameDrops]);

  // Log performance summary periodically
  useEffect(() => {
    if (!enableLogging) return;
    
    const interval = setInterval(() => {
      if (renderTimesRef.current.length > 0) {
        const report = getPerformanceReport();
        console.log('[MapPerformance] Summary:', {
          avgRenderTime: `${report.averageRenderTime.toFixed(2)}ms`,
          markerCount: report.markerCount,
          regionChanges: report.regionChanges,
          frameDrops: report.frameDrops,
          memoryUsage: report.memoryUsage,
          recommendations: report.recommendations,
        });
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [enableLogging, getPerformanceReport]);

  return {
    metrics,
    startMeasurement,
    trackRegionChange,
    trackMarkerCount,
    getPerformanceReport,
    resetMetrics,
  };
};

export default useMapPerformance;