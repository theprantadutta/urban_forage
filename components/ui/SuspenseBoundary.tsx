import React, { ReactNode, Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import {
    DotsLoading,
    FullScreenLoading,
    SkeletonCard,
    SkeletonList,
    SkeletonProfile,
    SpinnerLoading,
} from './LoadingStates';

// Suspense boundary props
interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackType?: 'spinner' | 'dots' | 'skeleton-card' | 'skeleton-list' | 'skeleton-profile' | 'fullscreen';
  loadingMessage?: string;
  showMessage?: boolean;
  style?: any;
}

// Main suspense boundary component
export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
  fallbackType = 'spinner',
  loadingMessage = 'Loading...',
  showMessage = false,
  style,
}) => {
  const { colors } = useTheme();

  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    switch (fallbackType) {
      case 'dots':
        return (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.background }, style]}>
            <DotsLoading size="medium" />
            {showMessage && (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {loadingMessage}
              </Text>
            )}
          </View>
        );

      case 'skeleton-card':
        return (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.background }, style]}>
            <SkeletonCard />
          </View>
        );

      case 'skeleton-list':
        return (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.background }, style]}>
            <SkeletonList itemCount={3} />
          </View>
        );

      case 'skeleton-profile':
        return (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.background }, style]}>
            <SkeletonProfile />
          </View>
        );

      case 'fullscreen':
        return (
          <FullScreenLoading
            type="spinner"
            message={loadingMessage}
            showMessage={showMessage}
          />
        );

      default:
        return (
          <View style={[styles.fallbackContainer, { backgroundColor: colors.background }, style]}>
            <SpinnerLoading size="medium" />
            {showMessage && (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {loadingMessage}
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <Suspense fallback={renderFallback()}>
      {children}
    </Suspense>
  );
};

// Specialized suspense boundaries for different contexts
export const ScreenSuspenseBoundary: React.FC<{
  children: ReactNode;
  loadingMessage?: string;
}> = ({ children, loadingMessage = 'Loading screen...' }) => (
  <SuspenseBoundary
    fallbackType="fullscreen"
    loadingMessage={loadingMessage}
    showMessage={true}
  >
    {children}
  </SuspenseBoundary>
);

export const ComponentSuspenseBoundary: React.FC<{
  children: ReactNode;
  fallbackType?: 'spinner' | 'dots' | 'skeleton-card';
}> = ({ children, fallbackType = 'spinner' }) => (
  <SuspenseBoundary
    fallbackType={fallbackType}
    style={styles.componentBoundary}
  >
    {children}
  </SuspenseBoundary>
);

export const ListSuspenseBoundary: React.FC<{
  children: ReactNode;
  itemCount?: number;
}> = ({ children, itemCount = 5 }) => (
  <SuspenseBoundary
    fallback={<SkeletonList itemCount={itemCount} />}
  >
    {children}
  </SuspenseBoundary>
);

export const CardSuspenseBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <SuspenseBoundary
    fallbackType="skeleton-card"
  >
    {children}
  </SuspenseBoundary>
);

// Hook for creating suspense boundaries with loading states
export const useSuspenseWithLoading = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const wrapWithSuspense = React.useCallback((
    component: ReactNode,
    fallbackType: SuspenseBoundaryProps['fallbackType'] = 'spinner'
  ) => {
    return (
      <SuspenseBoundary fallbackType={fallbackType}>
        {component}
      </SuspenseBoundary>
    );
  }, []);

  const handleAsyncOperation = React.useCallback(async (
    operation: () => Promise<any>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    wrapWithSuspense,
    handleAsyncOperation,
  };
};

// Higher-order component for adding suspense boundaries
export const withSuspenseBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  suspenseProps?: Omit<SuspenseBoundaryProps, 'children'>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <SuspenseBoundary {...suspenseProps}>
      <Component {...(props as P)} ref={ref} />
    </SuspenseBoundary>
  ));

  WrappedComponent.displayName = `withSuspenseBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Lazy loading with suspense utility
export const createLazyComponentWithSuspense = <P extends object>(
  importFunction: () => Promise<{ default: React.ComponentType<P> }>,
  suspenseProps?: Omit<SuspenseBoundaryProps, 'children'>
) => {
  const LazyComponent = React.lazy(importFunction);
  
  return React.forwardRef<any, P>((props, ref) => (
    <SuspenseBoundary {...suspenseProps}>
      <LazyComponent {...props} ref={ref} />
    </SuspenseBoundary>
  ));
};

// Progressive loading component
interface ProgressiveLoadingProps {
  children: ReactNode;
  stages: {
    component: ReactNode;
    delay: number;
  }[];
  finalComponent?: ReactNode;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  stages,
  finalComponent,
}) => {
  const [currentStage, setCurrentStage] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (currentStage < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, stages[currentStage].delay);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentStage, stages]);

  if (isComplete) {
    return <>{finalComponent || children}</>;
  }

  if (currentStage < stages.length) {
    return <>{stages[currentStage].component}</>;
  }

  return <>{children}</>;
};

// Loading state manager
export class LoadingStateManager {
  private loadingStates: Map<string, boolean> = new Map();
  private listeners: Map<string, Set<(isLoading: boolean) => void>> = new Map();

  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
    this.notifyListeners(key, isLoading);
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  subscribe(key: string, callback: (isLoading: boolean) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(callback);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string, isLoading: boolean) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => callback(isLoading));
    }
  }

  clearAll() {
    this.loadingStates.clear();
    this.listeners.clear();
  }
}

// Global loading state manager
export const globalLoadingManager = new LoadingStateManager();

// Hook for global loading states
export const useGlobalLoading = (key: string) => {
  const [isLoading, setIsLoading] = React.useState(
    globalLoadingManager.isLoading(key)
  );

  React.useEffect(() => {
    const unsubscribe = globalLoadingManager.subscribe(key, setIsLoading);
    return unsubscribe;
  }, [key]);

  const setLoading = React.useCallback((loading: boolean) => {
    globalLoadingManager.setLoading(key, loading);
  }, [key]);

  return { isLoading, setLoading };
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  componentBoundary: {
    minHeight: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});