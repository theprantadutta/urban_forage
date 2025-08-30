import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { LocationError } from '../../hooks/useLocationService';

interface LocationPermissionPromptProps {
  isVisible: boolean;
  error: LocationError | null;
  onRequestPermission: () => Promise<void>;
  onDismiss: () => void;
  className?: string;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  isVisible,
  error,
  onRequestPermission,
  onDismiss,
  className = "absolute inset-0 z-40"
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  const handleRequestPermission = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onRequestPermission();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    Haptics.selectionAsync();
    onDismiss();
  };

  if (!isVisible) return null;

  const getErrorContent = () => {
    if (!error) return null;

    switch (error.type) {
      case 'permission':
        return {
          icon: 'location-outline' as const,
          title: 'Location Permission Required',
          message: 'We need access to your location to show nearby food listings and provide accurate distances.',
          actionText: 'Grant Permission',
        };
      case 'unavailable':
        return {
          icon: 'warning-outline' as const,
          title: 'Location Services Unavailable',
          message: 'Please enable location services in your device settings to use location-based features.',
          actionText: 'Try Again',
        };
      case 'timeout':
        return {
          icon: 'time-outline' as const,
          title: 'Location Timeout',
          message: 'Unable to get your location. Please check your GPS signal and try again.',
          actionText: 'Retry',
        };
      case 'accuracy':
        return {
          icon: 'radio-outline' as const,
          title: 'Location Accuracy Issue',
          message: 'Your location accuracy is low. Try moving to an area with better GPS signal.',
          actionText: 'Retry',
        };
      default:
        return {
          icon: 'alert-circle-outline' as const,
          title: 'Location Error',
          message: error.message || 'An unknown error occurred while accessing your location.',
          actionText: 'Try Again',
        };
    }
  };

  const content = getErrorContent();
  if (!content) return null;

  return (
    <Animated.View
      className={className}
      style={{
        opacity: fadeAnim,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={handleDismiss}
      />

      {/* Permission Prompt */}
      <Animated.View
        className="absolute inset-x-6 top-1/3 bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Header */}
        <View className="bg-gradient-to-r from-forest-green to-forest-green/80 px-6 py-8 items-center">
          <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
            <Ionicons name={content.icon} size={32} color="white" />
          </View>
          <Text className="text-white text-xl font-bold text-center">
            {content.title}
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          <Text className="text-gray-700 text-base leading-6 text-center mb-6">
            {content.message}
          </Text>

          {/* Benefits List */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-3">This helps us:</Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-forest-green rounded-full mr-3" />
                <Text className="text-gray-600 text-sm flex-1">
                  Show food listings near you
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-forest-green rounded-full mr-3" />
                <Text className="text-gray-600 text-sm flex-1">
                  Calculate accurate distances
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-forest-green rounded-full mr-3" />
                <Text className="text-gray-600 text-sm flex-1">
                  Provide turn-by-turn directions
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl border-2 border-gray-300 bg-white active:bg-gray-50"
              onPress={handleDismiss}
              disabled={isLoading}
            >
              <Text className="text-gray-700 font-semibold text-center text-base">
                Not Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-4 rounded-xl ${
                isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-forest-green active:bg-forest-green/90'
              }`}
              onPress={handleRequestPermission}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-white font-semibold text-base">
                    Loading...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-center text-base">
                  {content.actionText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default LocationPermissionPrompt;