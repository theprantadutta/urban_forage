import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, InteractionManager } from 'react-native';

// Navigation performance utilities
export const NavigationOptimization = {
  // Defer heavy operations until after navigation animation
  runAfterInteractions: (callback: () => void): void => {
    InteractionManager.runAfterInteractions(callback);
  },

  // Preload screen components
  preloadScreen: async (screenName: string): Promise<void> => {
    try {
      // This would dynamically import screen components
      console.log(`Preloading screen: ${screenName}`);
    } catch (error) {
      console.warn(`Failed to preload screen ${screenName}:`, error);
    }
  },

  // Optimize list rendering
  getOptimalListConfig: () => {
    const { height } = Dimensions.get('window');
    const itemHeight = 80; // Estimated item height
    const windowSize = Math.ceil(height / itemHeight) + 2;
    
    return {
      windowSize,
      maxToRenderPerBatch: 10,
      initialNumToRender: Math.min(windowSize, 10),
      removeClippedSubviews: true,
      getItemLayout: (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
    };
  },
};

// Hook for screen-specific performance optimizations
export const useScreenPerformance = (screenName: string) => {
  const navigation = useNavigation();
  const isScreenFocused = useRef(false);
  const performanceMetrics = useRef({
    mountTime: 0,
    firstRenderTime: 0,
    interactionTime: 0,
  });

  // Track screen mount time
  useEffect(() => {
    performanceMetrics.current.mountTime = Date.now();
    
    // Track first render
    const timer = setTimeout(() => {
      performanceMetrics.current.firstRenderTime = Date.now();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Track when screen becomes interactive
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      performanceMetrics.current.interactionTime = Date.now();
      console.log(`Screen ${screenName} performance:`, {
        mountToRender: performanceMetrics.current.firstRenderTime - performanceMetrics.current.mountTime,
        mountToInteractive: performanceMetrics.current.interactionTime - performanceMetrics.current.mountTime,
      });
    });
  }, [screenName]);

  // Handle screen focus/blur for performance optimizations
  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true;
      
      return () => {
        isScreenFocused.current = false;
      };
    }, [])
  );

  const deferUntilInteractive = useCallback((callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  }, []);

  const isScreenActive = () => isScreenFocused.current;

  return {
    deferUntilInteractive,
    isScreenActive,
    performanceMetrics: performanceMetrics.current,
  };
};

// Hook for lazy loading screen content
export const useLazyScreenContent = (shouldLoad: boolean = true) => {
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shouldLoad && !isContentLoaded && !isLoading) {
      setIsLoading(true);
      
      InteractionManager.runAfterInteractions(() => {
        // Simulate content loading
        setTimeout(() => {
          setIsContentLoaded(true);
          setIsLoading(false);
        }, 100);
      });
    }
  }, [shouldLoad, isContentLoaded, isLoading]);

  return {
    isContentLoaded,
    isLoading,
  };
};

// Memory management utilities
export const MemoryOptimization = {
  // Clean up resources when screen is not visible
  cleanupOnBlur: (cleanup: () => void) => {
    return useFocusEffect(
      useCallback(() => {
        return cleanup;
      }, [cleanup])
    );
  },

  // Optimize image memory usage
  getOptimalImageDimensions: (containerWidth: number, containerHeight: number) => {
    const { width: screenWidth } = Dimensions.get('window');
    const maxWidth = Math.min(containerWidth, screenWidth);
    const maxHeight = Math.min(containerHeight, screenWidth); // Use screen width as max height too
    
    return {
      width: maxWidth,
      height: maxHeight,
    };
  },

  // Debounce expensive operations
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay) as any;
    };
  },

  // Throttle high-frequency operations
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },
};

// Performance monitoring
class NavigationPerformanceMonitor {
  private navigationTimes: Map<string, number> = new Map();
  private screenMetrics: Map<string, any> = new Map();

  startNavigation(screenName: string): void {
    this.navigationTimes.set(screenName, Date.now());
  }

  endNavigation(screenName: string): void {
    const startTime = this.navigationTimes.get(screenName);
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`Navigation to ${screenName} took ${duration}ms`);
      
      // Store metrics
      this.screenMetrics.set(screenName, {
        ...this.screenMetrics.get(screenName),
        lastNavigationTime: duration,
        navigations: (this.screenMetrics.get(screenName)?.navigations || 0) + 1,
      });
    }
  }

  getMetrics(): Map<string, any> {
    return this.screenMetrics;
  }

  getAverageNavigationTime(screenName: string): number {
    const metrics = this.screenMetrics.get(screenName);
    return metrics?.averageNavigationTime || 0;
  }
}

export const navigationPerformanceMonitor = new NavigationPerformanceMonitor();

// Hook for navigation performance monitoring
export const useNavigationPerformance = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      // Track navigation state changes
      const currentRoute = navigation.getState()?.routes?.slice(-1)[0];
      if (currentRoute) {
        navigationPerformanceMonitor.endNavigation(currentRoute.name);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const trackNavigation = useCallback((screenName: string) => {
    navigationPerformanceMonitor.startNavigation(screenName);
  }, []);

  return {
    trackNavigation,
    getMetrics: () => navigationPerformanceMonitor.getMetrics(),
  };
};