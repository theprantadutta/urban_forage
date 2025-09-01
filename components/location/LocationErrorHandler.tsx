import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useCallback, useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { LocationError } from '../../hooks/useLocationService';
import { ManualLocationSelector } from './ManualLocationSelector';

interface LocationErrorHandlerProps {
  error: LocationError | null;
  onRetry: () => Promise<void>;
  onManualLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  onDismiss: () => void;
  className?: string;
}

export const LocationErrorHandler: React.FC<LocationErrorHandlerProps> = ({
  error,
  onRetry,
  onManualLocationSelect,
  onDismiss,
  className = '',
}) => {
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, onRetry]);

  const handleOpenSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Location Settings',
      'Please enable location services in your device settings to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            // On iOS, this will open the app settings
            // On Android, this will open location settings
            Location.enableNetworkProviderAsync().catch(console.error);
          }
        },
      ]
    );
  }, []);

  const handleManualLocation = useCallback(() => {
    Haptics.selectionAsync();
    setShowManualSelector(true);
  }, []);

  const handleManualLocationConfirm = useCallback((location: { latitude: number; longitude: number; address?: string }) => {
    setShowManualSelector(false);
    onManualLocationSelect(location);
  }, [onManualLocationSelect]);

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'permission':
        return 'lock-closed-outline';
      case 'unavailable':
        return 'location-outline';
      case 'timeout':
        return 'time-outline';
      case 'accuracy':
        return 'radio-outline';
      default:
        return 'warning-outline';
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'permission':
        return '#F59E0B'; // amber
      case 'unavailable':
        return '#EF4444'; // red
      case 'timeout':
        return '#8B5CF6'; // purple
      case 'accuracy':
        return '#06B6D4'; // cyan
      default:
        return '#6B7280'; // gray
    }
  };

  const getActionButtons = () => {
    if (!error) return null;

    const buttons = [];

    // Retry button for retryable errors
    if (error.type !== 'permission') {
      buttons.push(
        <TouchableOpacity
          key="retry"
          className={`flex-1 bg-forest-green px-4 py-3 rounded-xl mr-2 active:scale-95 ${
            isRetrying ? 'opacity-50' : ''
          }`}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons 
              name={isRetrying ? 'hourglass-outline' : 'refresh'} 
              size={16} 
              color="white" 
            />
            <Text className="text-white font-semibold text-sm ml-2">
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Settings button for permission errors
    if (error.type === 'permission') {
      buttons.push(
        <TouchableOpacity
          key="settings"
          className="flex-1 bg-warm-orange px-4 py-3 rounded-xl mr-2 active:scale-95"
          onPress={handleOpenSettings}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="settings-outline" size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Settings
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Manual location button
    buttons.push(
      <TouchableOpacity
        key="manual"
        className="flex-1 bg-sage-green px-4 py-3 rounded-xl active:scale-95"
        onPress={handleManualLocation}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="map-outline" size={16} color="white" />
          <Text className="text-white font-semibold text-sm ml-2">
            Manual
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <View className="flex-row mt-4">
        {buttons}
      </View>
    );
  };

  if (!error) return null;

  return (
    <>
      <View className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Error Header */}
        <View className="flex-row items-center mb-3">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${getErrorColor(error.type)}20` }}
          >
            <Ionicons 
              name={getErrorIcon(error.type) as any} 
              size={20} 
              color={getErrorColor(error.type)} 
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-white font-semibold text-base">
              Location Error
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm capitalize">
              {error.type} issue
            </Text>
          </View>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 active:scale-95"
            onPress={onDismiss}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5 mb-4">
          {error.message}
        </Text>

        {/* Helpful Tips */}
        {error.type === 'accuracy' && (
          <View className="bg-sky-blue/10 rounded-xl p-3 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="bulb-outline" size={16} color="#0EA5E9" />
              <Text className="text-sky-blue text-xs ml-2 flex-1">
                Try moving to an open area away from buildings for better GPS accuracy
              </Text>
            </View>
          </View>
        )}

        {error.type === 'permission' && (
          <View className="bg-warm-orange/10 rounded-xl p-3 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={16} color="#D2691E" />
              <Text className="text-warm-orange text-xs ml-2 flex-1">
                Location access helps us show you nearby food listings and calculate distances
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {getActionButtons()}
      </View>

      {/* Manual Location Selector Modal */}
      <Modal
        visible={showManualSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowManualSelector(false)}
      >
        <ManualLocationSelector
          onLocationSelect={handleManualLocationConfirm}
          onCancel={() => setShowManualSelector(false)}
        />
      </Modal>
    </>
  );
};

export default LocationErrorHandler;