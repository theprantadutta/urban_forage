import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AnimatedButton, AnimatedView } from './AnimatedComponents';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: (string | number)[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

// Error logging service
class ErrorLogger {
  static logError(error: Error, errorInfo: ErrorInfo, eventId: string) {
    // In production, this would send to your error reporting service
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      eventId,
    });

    // Example: Send to Sentry, Bugsnag, or other error reporting service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  static generateEventId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      eventId: ErrorLogger.generateEventId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.state.eventId || ErrorLogger.generateEventId();
    
    this.setState({
      errorInfo,
      eventId,
    });

    // Log the error
    ErrorLogger.logError(error, errorInfo, eventId);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    // In a web environment, you might use window.location.reload()
    // For React Native, you might restart the app or navigate to a safe screen
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallbackUI 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        eventId={this.state.eventId}
        onRetry={this.handleRetry}
        onReload={this.handleReload}
      />;
    }

    return this.props.children;
  }
}

// Error fallback UI component
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  onRetry: () => void;
  onReload: () => void;
}

const ErrorFallbackUI: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  eventId,
  onRetry,
  onReload,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Error Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.icon, { color: colors.error }]}>⚠️</Text>
        </View>

        {/* Error Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>

        {/* Error Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          We encountered an unexpected error. Don&apos;t worry, this has been reported and we&apos;re working on a fix.
        </Text>

        {/* Error Details (Development only) */}
        {__DEV__ && error && (
          <ScrollView style={styles.errorDetails} showsVerticalScrollIndicator={false}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              Error Details:
            </Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error.message}
            </Text>
            {error.stack && (
              <Text style={[styles.errorStack, { color: colors.textSecondary }]}>
                {error.stack}
              </Text>
            )}
          </ScrollView>
        )}

        {/* Event ID */}
        {eventId && (
          <Text style={[styles.eventId, { color: colors.textSecondary }]}>
            Error ID: {eventId}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AnimatedButton
            onPress={onRetry}
            style={[styles.button, styles.retryButton, { backgroundColor: colors.primary }]}
            pressAnimation="both"
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              Try Again
            </Text>
          </AnimatedButton>

          <AnimatedButton
            onPress={onReload}
            style={[styles.button, styles.reloadButton, { 
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
            }]}
            pressAnimation="both"
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Reload App
            </Text>
          </AnimatedButton>
        </View>
      </AnimatedView>
    </View>
  );
};

// Hook for using error boundaries programmatically
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    const eventId = ErrorLogger.generateEventId();
    ErrorLogger.logError(error, errorInfo || { componentStack: '' }, eventId);
  }, []);

  return { handleError };
};

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...(props as P)} ref={ref} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized error boundaries for different contexts
export const ScreenErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.log('Screen error:', error.message);
    }}
    resetOnPropsChange={true}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ErrorBoundary
    fallback={fallback || <ComponentErrorFallback />}
    onError={(error, errorInfo) => {
      console.log('Component error:', error.message);
    }}
  >
    {children}
  </ErrorBoundary>
);

// Simple component error fallback
const ComponentErrorFallback: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.componentError, { backgroundColor: colors.error + '10' }]}>
      <Text style={[styles.componentErrorText, { color: colors.error }]}>
        Component failed to load
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  eventId: {
    fontSize: 12,
    marginBottom: 24,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    // Primary button styles handled by backgroundColor prop
  },
  reloadButton: {
    // Secondary button styles handled by backgroundColor and border props
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  componentError: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  componentErrorText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorBoundary;