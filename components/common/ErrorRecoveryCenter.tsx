import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LocationData, LocationError } from '../../hooks/useLocationService';
import { AppError } from '../../utils/errorHandling';
import { GPSAccuracyHandler } from '../location/GPSAccuracyHandler';
import { LocationErrorHandler } from '../location/LocationErrorHandler';
import { EmptyState } from './EmptyState';
import { NetworkErrorHandler } from './NetworkErrorHandler';
import { RetryHandler } from './RetryHandler';

interface ErrorRecoveryOptions {
  showRetryHandler?: boolean;
  showNetworkHandler?: boolean;
  showLocationHandler?: boolean;
  showGPSHandler?: boolean;
  showEmptyState?: boolean;
  maxRetries?: number;
  autoRetry?: boolean;
}

interface ErrorRecoveryCenterProps {
  errors: {
    general?: AppError | null;
    network?: boolean;
    location?: LocationError | null;
    gps?: LocationData | null;
  };
  options?: ErrorRecoveryOptions;
  onRetry?: () => Promise<void>;
  onNetworkRetry?: () => Promise<void>;
  onLocationRetry?: () => Promise<void>;
  onManualLocationSelect?: (location: { latitude: number; longitude: number; address?: string }) => void;
  onImproveGPS?: () => void;
  onUseCurrentLocation?: () => void;
  onOfflineMode?: () => void;
  onDismissError?: (errorType: string) => void;
  className?: string;
}

export const ErrorRecoveryCenter: React.FC<ErrorRecoveryCenterProps> = ({
  errors,
  options = {},
  onRetry,
  onNetworkRetry,
  onLocationRetry,
  onManualLocationSelect,
  onImproveGPS,
  onUseCurrentLocation,
  onOfflineMode,
  onDismissError,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const {
    showRetryHandler = true,
    showNetworkHandler = true,
    showLocationHandler = true,
    showGPSHandler = true,
    showEmptyState = true,
    maxRetries = 3,
    autoRetry = false,
  } = options;

  const hasErrors = Object.values(errors).some(error => error !== null && error !== false);
  const errorCount = Object.values(errors).filter(error => error !== null && error !== false).length;

  const handleToggleDetails = useCallback(() => {
    Haptics.selectionAsync();
    setShowDetails(!showDetails);
  }, [showDetails]);

  const handleDismissError = useCallback((errorType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismissError?.(errorType);
  }, [onDismissError]);

  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    await onRetry?.();
  }, [onRetry]);

  const getPriorityError = () => {
    // Prioritize errors by severity
    if (errors.network) return 'network';
    if (errors.location) return 'location';
    if (errors.gps) return 'gps';
    if (errors.general) return 'general';
    return null;
  };

  const getErrorSummary = () => {
    const priorityError = getPriorityError();
    
    switch (priorityError) {
      case 'network':
        return {
          title: 'Connection Issue',
          message: 'No internet connection available',
          icon: 'wifi-outline' as keyof typeof Ionicons.glyphMap,
          color: '#EF4444',
        };
      case 'location':
        return {
          title: 'Location Error',
          message: errors.location?.message || 'Location services unavailable',
          icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
          color: '#F59E0B',
        };
      case 'gps':
        return {
          title: 'GPS Accuracy Issue',
          message: 'GPS signal is weak or inaccurate',
          icon: 'radio-outline' as keyof typeof Ionicons.glyphMap,
          color: '#8B5CF6',
        };
      case 'general':
        return {
          title: errors.general?.type === 'network' ? 'Network Error' : 'System Error',
          message: errors.general?.message || 'An unexpected error occurred',
          icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
          color: '#EF4444',
        };
      default:
        return null;
    }
  };

  if (!hasErrors) {
    return null;
  }

  const errorSummary = getErrorSummary();

  return (
    <>
      {/* Error Summary Card */}
      <View className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <TouchableOpacity
          className="flex-row items-center p-4"
          onPress={handleToggleDetails}
          activeOpacity={0.7}
        >
          {errorSummary && (
            <>
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${errorSummary.color}20` }}
              >
                <Ionicons
                  name={errorSummary.icon}
                  size={24}
                  color={errorSummary.color}
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-gray-900 dark:text-white font-semibold text-base">
                    {errorSummary.title}
                  </Text>
                  {errorCount > 1 && (
                    <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full ml-2">
                      <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                        +{errorCount - 1} more
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 dark:text-gray-300 text-sm">
                  {errorSummary.message}
                </Text>
              </View>

              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9CA3AF"
              />
            </>
          )}
        </TouchableOpacity>

        {/* Quick Actions */}
        {!showDetails && (
          <View className="px-4 pb-4">
            <View className="flex-row space-x-2">
              {onRetry && (
                <TouchableOpacity
                  className="flex-1 bg-forest-green px-4 py-2 rounded-xl active:scale-95"
                  onPress={handleRetry}
                >
                  <Text className="text-white font-medium text-sm text-center">
                    Retry
                  </Text>
                </TouchableOpacity>
              )}
              
              {onOfflineMode && errors.network && (
                <TouchableOpacity
                  className="flex-1 bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-xl active:scale-95"
                  onPress={onOfflineMode}
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm text-center">
                    Offline Mode
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Detailed Error Recovery Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-cream-white dark:bg-gray-900">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Error Recovery
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 active:scale-95"
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* Network Error Handler */}
            {errors.network && showNetworkHandler && (
              <View className="mb-6">
                <NetworkErrorHandler
                  onRetry={onNetworkRetry}
                  onOfflineMode={onOfflineMode}
                />
              </View>
            )}

            {/* Location Error Handler */}
            {errors.location && showLocationHandler && (
              <View className="mb-6">
                <LocationErrorHandler
                  error={errors.location}
                  onRetry={onLocationRetry || (() => Promise.resolve())}
                  onManualLocationSelect={onManualLocationSelect || (() => {})}
                  onDismiss={() => handleDismissError('location')}
                />
              </View>
            )}

            {/* GPS Accuracy Handler */}
            {errors.gps && showGPSHandler && (
              <View className="mb-6">
                <GPSAccuracyHandler
                  location={errors.gps}
                  onImproveAccuracy={onImproveGPS || (() => {})}
                  onUseCurrentLocation={onUseCurrentLocation || (() => {})}
                  onManualLocation={onManualLocationSelect ? () => onManualLocationSelect({ latitude: 0, longitude: 0 }) : () => {}}
                />
              </View>
            )}

            {/* General Retry Handler */}
            {errors.general && showRetryHandler && (
              <View className="mb-6">
                <RetryHandler
                  onRetry={handleRetry}
                  maxRetries={maxRetries}
                  autoRetry={autoRetry}
                  retryCount={retryCount}
                  error={errors.general.message}
                />
              </View>
            )}

            {/* Empty State for No Specific Handlers */}
            {!errors.network && !errors.location && !errors.gps && !errors.general && showEmptyState && (
              <EmptyState
                type="no_network"
                primaryAction={{
                  label: 'Refresh',
                  onPress: handleRetry,
                }}
                secondaryAction={{
                  label: 'Close',
                  onPress: () => setShowDetails(false),
                }}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default ErrorRecoveryCenter;