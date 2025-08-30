import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { GeofenceEvent } from '../../hooks/useGeofencing';

interface ProximityAlertProps {
  event: GeofenceEvent | null;
  onDismiss: () => void;
  onViewDetails: (event: GeofenceEvent) => void;
  onGetDirections: (event: GeofenceEvent) => void;
  className?: string;
}

export const ProximityAlert: React.FC<ProximityAlertProps> = ({
  event,
  onDismiss,
  onViewDetails,
  onGetDirections,
  className = "absolute top-20 left-4 right-4 z-50"
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleDismiss = React.useCallback(() => {
    Haptics.selectionAsync();
    onDismiss();
  }, [onDismiss]);

  const handleViewDetails = React.useCallback(() => {
    if (event) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onViewDetails(event);
    }
  }, [event, onViewDetails]);

  const handleGetDirections = React.useCallback(() => {
    if (event) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onGetDirections(event);
    }
  }, [event, onGetDirections]);

  useEffect(() => {
    if (event) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulsing animation for attention
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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

      // Auto dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
      };
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [event, slideAnim, opacityAnim, scaleAnim, pulseAnim, handleDismiss]);

  if (!event) return null;

  const isEntry = event.type === 'enter';
  const iconName = isEntry ? 'location' : 'checkmark-circle';
  const bgGradient = isEntry 
    ? 'from-green-500 to-emerald-600' 
    : 'from-blue-500 to-cyan-600';

  return (
    <Animated.View
      className={className}
      style={{
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
        opacity: opacityAnim,
      }}
    >
      <Animated.View
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        {/* Header */}
        <View className={`bg-gradient-to-r ${bgGradient} px-4 py-3`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name={iconName} size={18} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  {isEntry ? "You're nearby!" : "Visit complete"}
                </Text>
                <Text className="text-white/80 text-sm">
                  {event.region.title}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-4">
          {event.region.description && (
            <Text className="text-gray-600 text-sm mb-4 leading-5">
              {event.region.description}
            </Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-100 rounded-xl active:bg-gray-200"
              onPress={handleViewDetails}
            >
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-2 text-sm">
                Details
              </Text>
            </TouchableOpacity>
            
            {isEntry && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-3 px-4 bg-forest-green rounded-xl active:bg-forest-green/90"
                onPress={handleGetDirections}
              >
                <Ionicons name="navigate-outline" size={16} color="white" />
                <Text className="text-white font-medium ml-2 text-sm">
                  Directions
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Progress Bar (Auto-dismiss indicator) */}
        <View className="h-1 bg-gray-200">
          <Animated.View
            className={`h-full bg-gradient-to-r ${bgGradient}`}
            style={{
              width: '100%',
              transform: [
                {
                  scaleX: slideAnim.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ProximityAlert;