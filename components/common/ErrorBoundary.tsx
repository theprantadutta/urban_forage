import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { Component, ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createError, handleErrorWithRecovery } from '../../utils/errorHandling';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Handle error with recovery options
    const appError = createError('UNKNOWN_ERROR', {
      originalError: error.message,
      componentStack: errorInfo.componentStack,
    });
    
    handleErrorWithRecovery(appError, {
      showAlert: false, // We'll show our own UI
      enableRetry: this.props.enableRetry,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className={`flex-1 bg-cream-white dark:bg-gray-900 ${this.props.className || ''}`}>
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 24,
              minHeight: '100%'
            }}
          >
            {/* Error Icon */}
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="warning-outline" size={48} color="#EF4444" />
            </View>

            {/* Error Title */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Something went wrong
            </Text>

            {/* Error Message */}
            <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6 mb-8 max-w-sm">
              We encountered an unexpected error. Don&apos;t worry, we&apos;re working to fix it.
            </Text>

            {/* Action Buttons */}
            <View className="w-full max-w-sm space-y-3">
              {/* Retry Button */}
              {this.props.enableRetry && this.state.retryCount < this.maxRetries && (
                <TouchableOpacity
                  className="bg-forest-green px-6 py-4 rounded-2xl active:scale-95"
                  onPress={this.handleRetry}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Try Again ({this.maxRetries - this.state.retryCount} left)
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Reset Button */}
              <TouchableOpacity
                className="bg-gray-200 dark:bg-gray-700 px-6 py-4 rounded-2xl active:scale-95"
                onPress={this.handleReset}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="home-outline" size={20} color="#6B7280" />
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold text-base ml-2">
                    Start Fresh
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Error Details (Development) */}
            {this.props.showErrorDetails && __DEV__ && this.state.error && (
              <View className="mt-8 w-full max-w-sm">
                <TouchableOpacity
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl"
                  onPress={() => {
                    // Toggle error details visibility
                  }}
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {this.state.error.message}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text className="text-gray-400 dark:text-gray-500 text-xs font-mono mt-2">
                      {this.state.errorInfo.componentStack.slice(0, 200)}...
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Help Text */}
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-8">
              If the problem persists, please contact support
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;