import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { FoodListing } from '../map/FoodMarker';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { RatingDisplay } from './RatingDisplay';

interface ParallaxFoodCardProps {
  listing: FoodListing;
  scrollY: Animated.Value;
  index: number;
  onPress?: (listing: FoodListing) => void;
  onFavoritePress?: (listing: FoodListing) => void;
  isFavorite?: boolean;
  className?: string;
}

const CARD_HEIGHT = 280;

export const ParallaxFoodCard: React.FC<ParallaxFoodCardProps> = ({
  listing,
  scrollY,
  index,
  onPress,
  onFavoritePress,
  isFavorite = false,
  className = "mx-4 mb-4",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
    
    onPress?.(listing);
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.(listing);
  };

  // Parallax calculations
  const inputRange = [
    (index - 1) * CARD_HEIGHT,
    index * CARD_HEIGHT,
    (index + 1) * CARD_HEIGHT,
  ];

  const imageTranslateY = scrollY.interpolate({
    inputRange,
    outputRange: [-50, 0, 50],
    extrapolate: 'clamp',
  });

  const cardScale = scrollY.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const cardOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  const contentTranslateY = scrollY.interpolate({
    inputRange,
    outputRange: [20, 0, -20],
    extrapolate: 'clamp',
  });

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



  return (
    <Animated.View
      className={className}
      style={{
        transform: [
          { scale: Animated.multiply(cardScale, scaleAnim) },
        ],
        opacity: cardOpacity,
      }}
    >
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        onPress={handlePress}
        activeOpacity={1}
      >
        {/* Parallax Image Container */}
        <View className="relative h-48 overflow-hidden">
          <Animated.View
            style={{
              transform: [{ translateY: imageTranslateY }],
              height: CARD_HEIGHT,
              width: '100%',
            }}
          >
            <Image
              source={{ uri: listing.image }}
              className="w-full h-full"
              contentFit="cover"
              placeholder={{
                blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
              }}
            />
          </Animated.View>

          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

          {/* Favorite Button */}
          <TouchableOpacity
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-md"
            onPress={handleFavoritePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>

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

        {/* Animated Content */}
        <Animated.View
          className="p-4"
          style={{
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          {/* Title and Distance */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-gray-900 text-lg font-bold flex-1 mr-2" numberOfLines={2}>
              {listing.title}
            </Text>
            <Text className="text-sage-green text-sm font-medium">
              {listing.distance}
            </Text>
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

          {/* Action Button */}
          <TouchableOpacity
            className="bg-forest-green px-4 py-3 rounded-full active:bg-forest-green/90 flex-row items-center justify-center"
            onPress={handlePress}
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">
              View Details
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ParallaxFoodCard;