import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SkeletonLoader } from '../components/ui/AnimatedComponents';
import { useTheme } from '../providers/ThemeProvider';

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  const { colors } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      {/* You could also use SkeletonLoader here for a more sophisticated loading state */}
    </View>
  );
};

// Screen loading fallback with skeleton
const ScreenSkeletonFallback: React.FC = () => {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <SkeletonLoader width={200} height={24} style={{ marginBottom: 16 }} />
      <SkeletonLoader width={350} height={200} style={{ marginBottom: 16 }} />
      <SkeletonLoader width={280} height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={320} height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={240} height={16} style={{ marginBottom: 16 }} />
      <SkeletonLoader width={350} height={100} />
    </View>
  );
};

// Higher-order component for lazy loading screens
export const withLazyLoading = <P extends object>(
  importFunction: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackType: 'spinner' | 'skeleton' = 'spinner',
  fallbackMessage?: string
) => {
  const LazyComponent = React.lazy(importFunction);
  
  return React.forwardRef<any, P>((props, ref) => {
    const FallbackComponent = fallbackType === 'skeleton' 
      ? ScreenSkeletonFallback 
      : () => <LoadingFallback message={fallbackMessage} />;

    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    );
  });
};

// Preload screen components
class ScreenPreloader {
  private preloadedScreens: Set<string> = new Set();
  private preloadPromises: Map<string, Promise<any>> = new Map();

  // Preload a screen component
  async preloadScreen(
    screenName: string,
    importFunction: () => Promise<any>
  ): Promise<void> {
    if (this.preloadedScreens.has(screenName)) {
      return; // Already preloaded
    }

    if (this.preloadPromises.has(screenName)) {
      return this.preloadPromises.get(screenName); // Already preloading
    }

    const preloadPromise = importFunction()
      .then(() => {
        this.preloadedScreens.add(screenName);
        this.preloadPromises.delete(screenName);
      })
      .catch((error) => {
        console.warn(`Failed to preload screen ${screenName}:`, error);
        this.preloadPromises.delete(screenName);
      });

    this.preloadPromises.set(screenName, preloadPromise);
    return preloadPromise;
  }

  // Preload multiple screens
  async preloadScreens(
    screens: { name: string; importFunction: () => Promise<any> }[]
  ): Promise<void> {
    const preloadPromises = screens.map(screen => 
      this.preloadScreen(screen.name, screen.importFunction)
    );

    await Promise.allSettled(preloadPromises);
  }

  // Check if screen is preloaded
  isScreenPreloaded(screenName: string): boolean {
    return this.preloadedScreens.has(screenName);
  }

  // Get preload status
  getPreloadStatus(): {
    preloadedScreens: string[];
    preloadingScreens: string[];
  } {
    return {
      preloadedScreens: Array.from(this.preloadedScreens),
      preloadingScreens: Array.from(this.preloadPromises.keys()),
    };
  }
}

export const screenPreloader = new ScreenPreloader();

// Hook for screen preloading
export const useScreenPreloader = () => {
  const preloadScreen = (screenName: string, importFunction: () => Promise<any>) => {
    return screenPreloader.preloadScreen(screenName, importFunction);
  };

  const preloadScreens = (screens: { name: string; importFunction: () => Promise<any> }[]) => {
    return screenPreloader.preloadScreens(screens);
  };

  const isPreloaded = (screenName: string) => {
    return screenPreloader.isScreenPreloaded(screenName);
  };

  const getStatus = () => {
    return screenPreloader.getPreloadStatus();
  };

  return {
    preloadScreen,
    preloadScreens,
    isPreloaded,
    getStatus,
  };
};

// Route-based preloading strategies
export const PreloadingStrategies = {
  // Preload screens that are likely to be visited next
  preloadNextLikelyScreens: (currentScreen: string) => {
    const screenRelationships: Record<string, string[]> = {
      'Home': ['Profile', 'Search', 'Settings'],
      'Profile': ['Settings', 'EditProfile'],
      'Search': ['Results', 'Filters'],
      // Add more relationships based on your app's navigation patterns
    };

    const nextScreens = screenRelationships[currentScreen] || [];
    return nextScreens;
  },

  // Preload screens based on user behavior patterns
  preloadBasedOnUserBehavior: (userHistory: string[]) => {
    // Analyze user navigation patterns and preload accordingly
    const frequentScreens = userHistory
      .reduce((acc, screen) => {
        acc[screen] = (acc[screen] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(frequentScreens)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([screen]) => screen);
  },

  // Preload screens during idle time
  preloadDuringIdle: (screens: string[], importFunctions: Record<string, () => Promise<any>>) => {
    // Use requestIdleCallback if available, otherwise use setTimeout
    const schedulePreload = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    };

    screens.forEach(screenName => {
      schedulePreload(() => {
        const importFunction = importFunctions[screenName];
        if (importFunction) {
          screenPreloader.preloadScreen(screenName, importFunction);
        }
      });
    });
  },
};

// Performance-aware lazy loading
export const createPerformantLazyScreen = <P extends object>(
  importFunction: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    preloadCondition?: () => boolean;
    fallbackType?: 'spinner' | 'skeleton';
    timeout?: number;
  } = {}
) => {
  const {
    preloadCondition,
    fallbackType = 'spinner',
    timeout = 10000,
  } = options;

  // Preload if condition is met
  if (preloadCondition?.()) {
    importFunction().catch(error => {
      console.warn('Failed to preload screen:', error);
    });
  }

  const LazyComponent = React.lazy(() => {
    const importPromise = importFunction();
    
    // Add timeout to prevent indefinite loading
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Screen loading timeout')), timeout);
    });

    return Promise.race([importPromise, timeoutPromise]);
  });

  return withLazyLoading(() => Promise.resolve({ default: LazyComponent }), fallbackType);
};