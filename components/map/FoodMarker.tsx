import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export interface FoodListing {
  id: string;
  title: string;
  description: string;
  category: 'vegetables' | 'fruits' | 'bakery' | 'dairy' | 'prepared' | 'other';
  availability: 'high' | 'medium' | 'low';
  latitude: number;
  longitude: number;
  distance?: string;
  timeLeft?: string;
  isUrgent?: boolean;
  image: string;
  provider: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  pickupInstructions?: string;
  quantity?: string;
  expiresAt?: string;
  isVerified?: boolean;
}

interface FoodMarkerProps {
  listing: FoodListing;
  isSelected?: boolean;
  onPress?: (listing: FoodListing) => void;
  onCalloutPress?: (listing: FoodListing) => void;
}

const getCategoryIcon = (category: FoodListing['category']): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'vegetables':
      return 'leaf';
    case 'fruits':
      return 'nutrition';
    case 'bakery':
      return 'cafe';
    case 'dairy':
      return 'water';
    case 'prepared':
      return 'restaurant';
    case 'other':
    default:
      return 'basket';
  }
};

const getCategoryColor = (category: FoodListing['category']): string => {
  switch (category) {
    case 'vegetables':
      return '#22c55e'; // Green
    case 'fruits':
      return '#f59e0b'; // Orange
    case 'bakery':
      return '#8b5cf6'; // Purple
    case 'dairy':
      return '#06b6d4'; // Cyan
    case 'prepared':
      return '#ef4444'; // Red
    case 'other':
    default:
      return '#6b7280'; // Gray
  }
};

const getAvailabilityColor = (availability: FoodListing['availability']): string => {
  switch (availability) {
    case 'high':
      return '#22c55e'; // Green
    case 'medium':
      return '#f59e0b'; // Orange
    case 'low':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

export const FoodMarker: React.FC<FoodMarkerProps> = ({
  listing,
  isSelected = false,
  onPress,
  onCalloutPress
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const { isReduceMotionEnabled, announceMessage } = useAccessibility();

  // Bounce animation when marker is first rendered (respect reduce motion)
  useEffect(() => {
    if (!isReduceMotionEnabled) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [bounceAnim, isReduceMotionEnabled]);

  // Selection animation
  useEffect(() => {
    if (isSelected) {
      // Scale up when selected
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();

      // Start pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Scale back to normal when deselected
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();

      pulseAnim.setValue(1);
    }
  }, [isSelected, scaleAnim, pulseAnim]);

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Quick scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.3 : 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(listing);
  };

  const categoryIcon = getCategoryIcon(listing.category);
  const categoryColor = getCategoryColor(listing.category);
  const availabilityColor = getAvailabilityColor(listing.availability);

  return (
    <Marker
      coordinate={{
        latitude: listing.latitude,
        longitude: listing.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
            { translateY: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10],
            })},
          ],
        }}
      >
        {/* Main Marker Container */}
        <View className="items-center">
          {/* Marker Body */}
          <View 
            className="w-12 h-12 rounded-full items-center justify-center shadow-lg border-2 border-white"
            style={{ backgroundColor: categoryColor }}
          >
            <Ionicons
              name={categoryIcon}
              size={20}
              color="white"
            />
          </View>

          {/* Availability Indicator */}
          <View 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: availabilityColor }}
          />

          {/* Urgent Indicator */}
          {listing.isUrgent && (
            <View className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-red-500 border border-white">
              <Animated.View
                className="w-full h-full rounded-full bg-red-500"
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              />
            </View>
          )}

          {/* Marker Tail */}
          <View 
            className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent"
            style={{ 
              borderTopColor: categoryColor,
              marginTop: -1,
            }}
          />
        </View>
      </Animated.View>

      {/* Callout */}
      {isSelected && (
        <Animated.View
          className="absolute -top-20 left-1/2 transform -translate-x-1/2"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <TouchableOpacity
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-48"
            onPress={() => onCalloutPress?.(listing)}
            activeOpacity={0.8}
          >
            <Text className="text-forest-green font-semibold text-sm mb-1" numberOfLines={1}>
              {listing.title}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-xs capitalize">
                {listing.category}
              </Text>
              {listing.distance && (
                <Text className="text-sage-green text-xs">
                  {listing.distance}
                </Text>
              )}
            </View>
            {listing.timeLeft && (
              <Text className="text-gray-500 text-xs mt-1">
                {listing.timeLeft} left
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Callout Tail */}
          <View className="items-center">
            <View className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white" />
          </View>
        </Animated.View>
      )}
    </Marker>
  );
};

export default FoodMarker;