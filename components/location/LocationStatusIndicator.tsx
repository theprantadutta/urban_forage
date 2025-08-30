import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { LocationData, LocationError } from '../../hooks/useLocationService';

interface LocationStatusIndicatorProps {
  currentLocation: LocationData | null;
  isTracking: boolean;
  hasPermission: boolean;
  error: LocationError | null;
  onPress?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  currentLocation,
  isTracking,
  hasPermission,
  error,
  onPress,
  showDetails = false,
  className = "flex-row items-center"
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation for active tracking
  useEffect(() => {
    if (isTracking) {
      const pulseAnimation = Animated.loop(
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
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking, pulseAnim]);

  // Rotation animation for loading states
  useEffect(() => {
    if (isTracking && !currentLocation) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        rotateAnimation.stop();
        rotateAnim.setValue(0);
      };
    }
  }, [isTracking, currentLocation, rotateAnim]);

  const getStatusInfo = () => {
    if (error) {
      return {
        icon: 'warning' as const,
        color: '#EF4444',
        bgColor: '#FEF2F2',
        text: 'Location Error',
        subtext: error.message,
      };
    }

    if (!hasPermission) {
      return {
        icon: 'location-outline' as const,
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        text: 'Permission Required',
        subtext: 'Tap to enable location',
      };
    }

    if (isTracking && !currentLocation) {
      return {
        icon: 'radio' as const,
        color: '#06B6D4',
        bgColor: '#F0F9FF',
        text: 'Finding Location...',
        subtext: 'Getting GPS signal',
      };
    }

    if (currentLocation) {
      const accuracy = currentLocation.accuracy;
      const isStale = Date.now() - currentLocation.timestamp > 60000; // 1 minute
      
      if (isStale) {
        return {
          icon: 'time' as const,
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          text: 'Location Outdated',
          subtext: 'Tap to refresh',
        };
      }

      if (accuracy && accuracy > 100) {
        return {
          icon: 'radio-outline' as const,
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          text: 'Low Accuracy',
          subtext: `±${Math.round(accuracy)}m`,
        };
      }

      return {
        icon: 'location' as const,
        color: '#22C55E',
        bgColor: '#F0FDF4',
        text: isTracking ? 'Tracking Active' : 'Location Found',
        subtext: accuracy ? `±${Math.round(accuracy)}m` : 'Good signal',
      };
    }

    return {
      icon: 'location-outline' as const,
      color: '#6B7280',
      bgColor: '#F9FAFB',
      text: 'Location Disabled',
      subtext: 'Tap to enable',
    };
  };

  const statusInfo = getStatusInfo();
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatLastUpdate = () => {
    if (!currentLocation) return null;
    
    const now = Date.now();
    const diff = now - currentLocation.timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`${className} ${onPress ? 'active:opacity-70' : ''}`}
      onPress={onPress}
    >
      {/* Status Icon */}
      <Animated.View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: statusInfo.bgColor,
          transform: [
            { scale: isTracking ? pulseAnim : 1 },
            { rotate: isTracking && !currentLocation ? rotation : '0deg' },
          ],
        }}
      >
        <Ionicons
          name={statusInfo.icon}
          size={20}
          color={statusInfo.color}
        />
      </Animated.View>

      {/* Status Text */}
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-sm">
          {statusInfo.text}
        </Text>
        {showDetails && (
          <Text className="text-gray-500 text-xs mt-0.5">
            {statusInfo.subtext}
            {currentLocation && formatLastUpdate() && (
              <Text className="text-gray-400"> • {formatLastUpdate()}</Text>
            )}
          </Text>
        )}
      </View>

      {/* Accuracy Badge */}
      {currentLocation && currentLocation.accuracy && (
        <View 
          className="px-2 py-1 rounded-full ml-2"
          style={{ backgroundColor: statusInfo.bgColor }}
        >
          <Text 
            className="text-xs font-medium"
            style={{ color: statusInfo.color }}
          >
            ±{Math.round(currentLocation.accuracy)}m
          </Text>
        </View>
      )}

      {/* Tracking Indicator */}
      {isTracking && (
        <View className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
      )}
    </Component>
  );
};

export default LocationStatusIndicator;