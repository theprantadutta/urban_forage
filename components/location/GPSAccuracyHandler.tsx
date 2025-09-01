import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { LocationData } from '../../hooks/useLocationService';

interface GPSAccuracyHandlerProps {
  location: LocationData | null;
  onImproveAccuracy: () => void;
  onUseCurrentLocation: () => void;
  onManualLocation: () => void;
  className?: string;
}

const ACCURACY_THRESHOLDS = {
  EXCELLENT: 10, // meters
  GOOD: 50,
  FAIR: 100,
  POOR: 500,
};

const getAccuracyLevel = (accuracy?: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (!accuracy) return 'poor';
  
  if (accuracy <= ACCURACY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (accuracy <= ACCURACY_THRESHOLDS.GOOD) return 'good';
  if (accuracy <= ACCURACY_THRESHOLDS.FAIR) return 'fair';
  return 'poor';
};

const getAccuracyColor = (level: string) => {
  switch (level) {
    case 'excellent':
      return '#22C55E'; // green
    case 'good':
      return '#84CC16'; // lime
    case 'fair':
      return '#F59E0B'; // amber
    case 'poor':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

const getAccuracyIcon = (level: string) => {
  switch (level) {
    case 'excellent':
      return 'radio';
    case 'good':
      return 'radio-outline';
    case 'fair':
      return 'cellular-outline';
    case 'poor':
      return 'warning-outline';
    default:
      return 'help-outline';
  }
};

export const GPSAccuracyHandler: React.FC<GPSAccuracyHandlerProps> = ({
  location,
  onImproveAccuracy,
  onUseCurrentLocation,
  onManualLocation,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const accuracyLevel = getAccuracyLevel(location?.accuracy);
  const shouldShowWarning = accuracyLevel === 'poor' || accuracyLevel === 'fair';

  // Pulse animation for poor accuracy
  useEffect(() => {
    if (shouldShowWarning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [shouldShowWarning, pulseAnim]);

  const handleToggleDetails = useCallback(() => {
    Haptics.selectionAsync();
    setShowDetails(!showDetails);
  }, [showDetails]);

  const handleImproveAccuracy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onImproveAccuracy();
  }, [onImproveAccuracy]);

  const handleUseCurrentLocation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUseCurrentLocation();
  }, [onUseCurrentLocation]);

  const handleManualLocation = useCallback(() => {
    Haptics.selectionAsync();
    onManualLocation();
  }, [onManualLocation]);

  const getAccuracyDescription = () => {
    switch (accuracyLevel) {
      case 'excellent':
        return 'Your location is very accurate. Perfect for finding nearby food!';
      case 'good':
        return 'Good location accuracy. You should see accurate distances.';
      case 'fair':
        return 'Location accuracy is okay, but distances might be slightly off.';
      case 'poor':
        return 'Poor GPS signal. Consider moving to an open area for better accuracy.';
      default:
        return 'Unable to determine location accuracy.';
    }
  };

  const getImprovementTips = () => {
    return [
      'Move to an open area away from buildings',
      'Ensure you\'re not indoors or underground',
      'Check that location services are enabled',
      'Wait a moment for GPS to stabilize',
      'Restart your device if problems persist',
    ];
  };

  if (!location) return null;

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Accuracy Indicator */}
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={handleToggleDetails}
        activeOpacity={0.7}
      >
        <Animated.View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{
            backgroundColor: `${getAccuracyColor(accuracyLevel)}20`,
            transform: shouldShowWarning ? [{ scale: pulseAnim }] : [],
          }}
        >
          <Ionicons
            name={getAccuracyIcon(accuracyLevel) as any}
            size={24}
            color={getAccuracyColor(accuracyLevel)}
          />
        </Animated.View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-gray-900 dark:text-white font-semibold text-base capitalize">
              {accuracyLevel} Accuracy
            </Text>
            {location.accuracy && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                ±{Math.round(location.accuracy)}m
              </Text>
            )}
          </View>
          <Text className="text-gray-600 dark:text-gray-300 text-sm">
            {getAccuracyDescription()}
          </Text>
        </View>

        <Ionicons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* Detailed Information */}
      {showDetails && (
        <View className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          {/* Location Details */}
          <View className="py-4">
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
              Location Details:
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  Coordinates:
                </Text>
                <Text className="text-gray-900 dark:text-white text-sm font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
              {location.accuracy && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">
                    Accuracy:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm">
                    ±{Math.round(location.accuracy)} meters
                  </Text>
                </View>
              )}
              {location.altitude && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">
                    Altitude:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm">
                    {Math.round(location.altitude)}m
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  Last Updated:
                </Text>
                <Text className="text-gray-900 dark:text-white text-sm">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Improvement Tips */}
          {shouldShowWarning && (
            <View className="py-4 border-t border-gray-100 dark:border-gray-700">
              <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                Tips to improve accuracy:
              </Text>
              <View className="space-y-2">
                {getImprovementTips().map((tip, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-1.5 h-1.5 bg-forest-green rounded-full mt-2 mr-3" />
                    <Text className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row space-x-3">
              {/* Improve Accuracy */}
              {shouldShowWarning && (
                <TouchableOpacity
                  className="flex-1 bg-forest-green px-4 py-3 rounded-xl active:scale-95"
                  onPress={handleImproveAccuracy}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="refresh" size={16} color="white" />
                    <Text className="text-white font-medium text-sm ml-2">
                      Improve
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Use Current Location */}
              <TouchableOpacity
                className="flex-1 bg-sage-green px-4 py-3 rounded-xl active:scale-95"
                onPress={handleUseCurrentLocation}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text className="text-white font-medium text-sm ml-2">
                    Use This
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Manual Location */}
              <TouchableOpacity
                className="flex-1 bg-gray-200 dark:bg-gray-600 px-4 py-3 rounded-xl active:scale-95"
                onPress={handleManualLocation}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="map-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm ml-2">
                    Manual
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default GPSAccuracyHandler;