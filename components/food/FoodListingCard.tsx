import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
  ACCESSIBILITY_ROLES,
  accessibleHapticFeedback,
  createAccessibilityHint,
  getFoodListingAccessibilityLabel
} from '../../utils/accessibility';
import { ProgressiveImage } from '../common';
import type { FoodListing } from '../map/FoodMarker';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { RatingDisplay } from './RatingDisplay';

interface FoodListingCardProps {
  listing: FoodListing;
  onPress?: (listing: FoodListing) => void;
  onFavoritePress?: (listing: FoodListing) => void;
  isFavorite?: boolean;
  className?: string;
  showDistance?: boolean;
}

export const FoodListingCard: React.FC<FoodListingCardProps> = ({
  listing,
  onPress,
  onFavoritePress,
  isFavorite = false,
  className = "mx-4 mb-4",
  showDistance = true,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { isScreenReaderEnabled, announceMessage, isReduceMotionEnabled } = useAccessibility();
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const heartRotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  // Animate card press
  const handlePress = async () => {
    await accessibleHapticFeedback('impact');
    
    if (isScreenReaderEnabled) {
      announceMessage(`Opening details for ${listing.title}`);
    }
    
    if (!isReduceMotionEnabled) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onPress?.(listing);
  };

  // Animate favorite button with particles
  const handleFavoritePress = async () => {
    await accessibleHapticFeedback('selection');
    
    const action = isFavorite ? 'Removed from favorites' : 'Added to favorites';
    if (isScreenReaderEnabled) {
      announceMessage(`${listing.title} ${action}`);
    }
    
    if (!isReduceMotionEnabled) {
      if (!isFavorite) {
        // Heart animation
        Animated.parallel([
          Animated.sequence([
            Animated.timing(heartScaleAnim, {
              toValue: 1.3,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(heartScaleAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(heartRotateAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          heartRotateAnim.setValue(0);
        });

        // Particle explosion animation
        const particleAnimations = particleAnims.map((particle, index) => {
          const angle = (index * 60) * Math.PI / 180; // 60 degrees apart
          const distance = 30;
          
          return Animated.parallel([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 400,
              delay: 200,
              useNativeDriver: true,
            }),
          ]);
        });

        Animated.parallel(particleAnimations).start(() => {
          // Reset particles
          particleAnims.forEach(particle => {
            particle.scale.setValue(0);
            particle.translateX.setValue(0);
            particle.translateY.setValue(0);
            particle.opacity.setValue(1);
          });
        });
      } else {
        // Simple scale animation for unfavorite
        Animated.sequence([
          Animated.timing(heartScaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(heartScaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    
    onFavoritePress?.(listing);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruits':
        return 'leaf-outline';
      case 'vegetables':
        return 'nutrition-outline';
      case 'bread':
        return 'restaurant-outline';
      case 'dairy':
        return 'water-outline';
      case 'meat':
        return 'fish-outline';
      case 'prepared':
        return 'fast-food-outline';
      default:
        return 'basket-outline';
    }
  };



  const formatDistance = (distance: string) => {
    // Extract numeric value and convert to proper format
    const numericDistance = parseFloat(distance.replace(/[^\d.]/g, ''));
    if (numericDistance < 1) {
      return `${Math.round(numericDistance * 1000)}m away`;
    }
    return `${numericDistance.toFixed(1)}km away`;
  };

  const heartRotation = heartRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  // Generate comprehensive accessibility label
  const accessibilityLabel = getFoodListingAccessibilityLabel({
    title: listing.title,
    category: listing.category,
    distance: showDistance ? listing.distance : undefined,
    availability: listing.availability,
    timeLeft: listing.timeLeft,
    isUrgent: listing.isUrgent,
  });

  const accessibilityHint = createAccessibilityHint(
    'view details',
    `Opens detailed information about this ${listing.category} listing`
  );

  return (
    <Animated.View
      style={{
        transform: [{ scale: isReduceMotionEnabled ? 1 : scaleAnim }],
      }}
    >
      <TouchableOpacity
        className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
        onPress={handlePress}
        activeOpacity={isReduceMotionEnabled ? 1 : 0.8}
        accessible={true}
        accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          selected: false,
        }}
      >
      {/* Image Container */}
      <View className="relative">
        <ProgressiveImage
          source={{ uri: listing.image }}
          className="w-full h-48"
          contentFit="cover"
          aspectRatio={4/3}
          alt={`${listing.title} food listing`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />

        {/* Loading Overlay */}
        {imageLoading && (
          <View className="absolute inset-0 bg-gray-200 items-center justify-center">
            <View className="w-8 h-8 border-2 border-forest-green border-t-transparent rounded-full animate-spin" />
          </View>
        )}

        {/* Error Fallback */}
        {imageError && (
          <View className="absolute inset-0 bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm mt-2">Image unavailable</Text>
          </View>
        )}

        {/* Favorite Button */}
        <View className="absolute top-3 right-3">
          <TouchableOpacity
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-md"
            onPress={handleFavoritePress}
            activeOpacity={isReduceMotionEnabled ? 1 : 0.8}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
            accessibilityLabel={isFavorite ? `Remove ${listing.title} from favorites` : `Add ${listing.title} to favorites`}
            accessibilityHint={isFavorite ? 'Double tap to remove from favorites' : 'Double tap to add to favorites'}
            accessibilityState={{
              selected: isFavorite,
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { scale: heartScaleAnim },
                  { rotate: heartRotation },
                ],
              }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#6B7280'}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Particle Effects */}
          {particleAnims.map((particle, index) => (
            <Animated.View
              key={index}
              className="absolute top-5 left-5 w-1 h-1 bg-red-400 rounded-full"
              style={{
                transform: [
                  { scale: particle.scale },
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                ],
                opacity: particle.opacity,
              }}
            />
          ))}
        </View>

        {/* Category Badge */}
        <View className="absolute top-3 left-3 bg-forest-green/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex-row items-center">
          <Ionicons name={getCategoryIcon(listing.category)} size={14} color="white" />
          <Text className="text-white text-xs font-medium ml-1.5 capitalize">
            {listing.category}
          </Text>
        </View>

        {/* Availability Indicator */}
        <View className="absolute bottom-3 left-3">
          <AvailabilityIndicator
            availability={listing.availability}
            timeLeft={listing.timeLeft}
            isUrgent={listing.isUrgent}
            size="small"
            className="bg-white/90 backdrop-blur-sm rounded-full"
          />
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Title and Distance */}
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-gray-900 text-lg font-bold flex-1 mr-2" numberOfLines={2}>
            {listing.title}
          </Text>
          {showDistance && listing.distance && (
            <Text className="text-sage-green text-sm font-medium">
              {formatDistance(listing.distance)}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text className="text-gray-600 text-sm leading-5 mb-3" numberOfLines={2}>
          {listing.description}
        </Text>

        {/* Provider Info and Rating */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 bg-sage-green/20 rounded-full items-center justify-center mr-3">
              <Ionicons name="person-outline" size={16} color="#87A96B" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-900 text-sm font-medium mr-2" numberOfLines={1}>
                  {listing.provider}
                </Text>
                {listing.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                )}
              </View>
              <Text className="text-gray-500 text-xs">
                {listing.location}
              </Text>
            </View>
          </View>

          {/* Rating Display */}
          {listing.rating && (
            <RatingDisplay
              rating={listing.rating}
              reviewCount={listing.reviewCount}
              size="small"
            />
          )}
        </View>

        {/* Quantity and Expiration Info */}
        {(listing.quantity || listing.expiresAt) && (
          <View className="flex-row items-center justify-between mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            {listing.quantity && (
              <View className="flex-row items-center">
                <Ionicons name="cube-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {listing.quantity}
                </Text>
              </View>
            )}
            {listing.expiresAt && (
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  Expires {listing.expiresAt}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-forest-green px-4 py-3 rounded-full active:bg-forest-green/90 flex-row items-center justify-center min-h-[44px]"
            onPress={handlePress}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
            accessibilityLabel={`View details for ${listing.title}`}
            accessibilityHint="Opens detailed information about this food listing"
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">
              View Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-sage-green/20 px-4 py-3 rounded-full active:bg-sage-green/30 flex-row items-center justify-center min-h-[44px]"
            onPress={async () => {
              await accessibleHapticFeedback('selection');
              if (isScreenReaderEnabled) {
                announceMessage(`Opening message for ${listing.provider}`);
              }
              // TODO: Implement messaging functionality
            }}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
            accessibilityLabel={`Message ${listing.provider}`}
            accessibilityHint="Opens messaging to contact the food provider"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#87A96B" />
            <Text className="text-sage-green text-sm font-semibold ml-2">
              Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
};

export default FoodListingCard;