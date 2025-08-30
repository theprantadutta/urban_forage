import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FoodListing } from '../map/FoodMarker';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { RatingDisplay } from './RatingDisplay';

interface FoodListingDetailModalProps {
  listing: FoodListing | null;
  visible: boolean;
  onClose: () => void;
  onFavoritePress?: (listing: FoodListing) => void;
  onMessagePress?: (listing: FoodListing) => void;
  onDirectionsPress?: (listing: FoodListing) => void;
  onSharePress?: (listing: FoodListing) => void;
  onListingPress?: (listing: FoodListing) => void;
  isFavorite?: boolean;
  relatedListings?: FoodListing[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FoodListingDetailModal: React.FC<FoodListingDetailModalProps> = ({
  listing,
  visible,
  onClose,
  onFavoritePress,
  onMessagePress,
  onDirectionsPress,
  onSharePress,
  onListingPress,
  isFavorite = false,
  relatedListings = [],
}) => {
  const insets = useSafeAreaInsets();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Animation values
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panGestureRef = useRef<PanGestureHandler>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Pan gesture state
  const panY = useRef(new Animated.Value(0)).current;
  const panVelocityRef = useRef(0);

  React.useEffect(() => {
    if (visible) {
      // Reset values
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
      panY.setValue(0);
      setCurrentImageIndex(0);
      
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: screenHeight,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity, panY]);

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const { translationY, velocityY } = event.nativeEvent;
        panVelocityRef.current = velocityY;
        
        // Only allow downward swipes
        if (translationY > 0) {
          translateY.setValue(translationY);
          backdropOpacity.setValue(1 - translationY / screenHeight);
        }
      },
    }
  );

  const handlePanEnd = () => {
    // @ts-ignore - accessing private _value property
    const currentTranslateY = panY._value;
    const shouldClose = currentTranslateY > screenHeight * 0.3 || panVelocityRef.current > 1000;

    if (shouldClose) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onClose();
    } else {
      // Snap back
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    panY.setValue(0);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleFavorite = () => {
    if (listing) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onFavoritePress?.(listing);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruits':
        return 'leaf-outline';
      case 'vegetables':
        return 'nutrition-outline';
      case 'bakery':
        return 'restaurant-outline';
      case 'dairy':
        return 'water-outline';
      case 'prepared':
        return 'fast-food-outline';
      default:
        return 'basket-outline';
    }
  };

  if (!listing) return null;

  // Create image gallery (for now, we'll use the same image multiple times)
  const images = [listing.image, listing.image, listing.image];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{ opacity: backdropOpacity }}
      />

      {/* Modal Content */}
      <PanGestureHandler
        ref={panGestureRef}
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) { // END state
            handlePanEnd();
          }
        }}
      >
        <Animated.View
          className="flex-1 bg-white"
          style={{
            transform: [{ translateY: translateY }],
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: insets.top + 20,
          }}
        >
          {/* Pull Indicator */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-4">
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                onPress={() => listing && onSharePress?.(listing)}
              >
                <Ionicons name="share-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                onPress={handleFavorite}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? '#EF4444' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Image Gallery */}
            <View className="relative">
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentImageIndex(index);
                }}
              >
                {images.map((imageUrl, index) => (
                  <View key={index} style={{ width: screenWidth }}>
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-80"
                      contentFit="cover"
                      placeholder={{
                        blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
                      }}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Image Indicators */}
              {images.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </View>
              )}

              {/* Category Badge */}
              <View className="absolute top-4 left-4 bg-forest-green/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex-row items-center">
                <Ionicons name={getCategoryIcon(listing.category)} size={14} color="white" />
                <Text className="text-white text-xs font-medium ml-1.5 capitalize">
                  {listing.category}
                </Text>
              </View>

              {/* Availability Indicator */}
              <View className="absolute top-4 right-4">
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
              <View className="flex-row items-start justify-between mb-3">
                <Text className="text-gray-900 text-2xl font-bold flex-1 mr-4">
                  {listing.title}
                </Text>
                {listing.distance && (
                  <Text className="text-sage-green text-lg font-semibold">
                    {listing.distance}
                  </Text>
                )}
              </View>

              {/* Description */}
              <Text className="text-gray-600 text-base leading-6 mb-4">
                {listing.description}
              </Text>

              {/* Provider Info */}
              <View className="flex-row items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-sage-green/20 rounded-full items-center justify-center mr-4">
                    <Ionicons name="person-outline" size={20} color="#87A96B" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-900 text-lg font-semibold mr-2">
                        {listing.provider}
                      </Text>
                      {listing.isVerified && (
                        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      )}
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {listing.location}
                    </Text>
                  </View>
                </View>

                {/* Rating */}
                {listing.rating && (
                  <RatingDisplay
                    rating={listing.rating}
                    reviewCount={listing.reviewCount}
                    size="medium"
                  />
                )}
              </View>

              {/* Details Grid */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-bold mb-3">Details</Text>
                <View className="space-y-3">
                  {listing.quantity && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="cube-outline" size={18} color="#3B82F6" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-medium">Quantity</Text>
                        <Text className="text-gray-600">{listing.quantity}</Text>
                      </View>
                    </View>
                  )}
                  
                  {listing.expiresAt && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="time-outline" size={18} color="#F97316" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-medium">Expires</Text>
                        <Text className="text-gray-600">{listing.expiresAt}</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="leaf-outline" size={18} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text className="text-gray-900 font-medium">Freshness</Text>
                      <Text className="text-gray-600">
                        {listing.availability === 'high' ? 'Very Fresh' : 
                         listing.availability === 'medium' ? 'Fresh' : 'Best consumed soon'}
                      </Text>
                    </View>
                  </View>
                  
                  {listing.pickupInstructions && (
                    <View className="flex-row items-start">
                      <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3 mt-1">
                        <Ionicons name="information-circle-outline" size={18} color="#22C55E" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">Pickup Instructions</Text>
                        <Text className="text-gray-600">
                          {listing.pickupInstructions || 'Contact provider for pickup details'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Provider Profile Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-bold mb-3">About the Provider</Text>
                <View className="bg-gray-50 rounded-xl p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-16 h-16 bg-sage-green/20 rounded-full items-center justify-center mr-4">
                      <Ionicons name="person-outline" size={24} color="#87A96B" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-900 text-xl font-bold mr-2">
                          {listing.provider}
                        </Text>
                        {listing.isVerified && (
                          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                        )}
                      </View>
                      <Text className="text-gray-500 text-sm mb-2">
                        {listing.location}
                      </Text>
                      {listing.rating && (
                        <RatingDisplay
                          rating={listing.rating}
                          reviewCount={listing.reviewCount}
                          size="small"
                        />
                      )}
                    </View>
                  </View>
                  
                  <Text className="text-gray-600 text-sm leading-5">
                    {listing.isVerified 
                      ? "Verified community member sharing fresh, quality food with neighbors."
                      : "Community member sharing food with neighbors. Contact for more details."
                    }
                  </Text>
                </View>
              </View>

              {/* Related Listings */}
              {relatedListings.length > 0 && (
                <View className="mb-6">
                  <Text className="text-gray-900 text-lg font-bold mb-3">More from this area</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-3 px-1">
                      {relatedListings.slice(0, 5).map((relatedListing) => (
                        <TouchableOpacity
                          key={relatedListing.id}
                          className="w-48 bg-white rounded-xl shadow-sm border border-gray-100"
                          onPress={() => onListingPress?.(relatedListing)}
                        >
                          <Image
                            source={{ uri: relatedListing.image }}
                            className="w-full h-32 rounded-t-xl"
                            contentFit="cover"
                            placeholder={{
                              blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
                            }}
                          />
                          <View className="p-3">
                            <Text className="text-gray-900 font-semibold text-sm mb-1" numberOfLines={1}>
                              {relatedListing.title}
                            </Text>
                            <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>
                              {relatedListing.description}
                            </Text>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-sage-green text-xs font-medium">
                                {relatedListing.distance}
                              </Text>
                              <View className="flex-row items-center">
                                <View
                                  className="w-2 h-2 rounded-full mr-1"
                                  style={{
                                    backgroundColor: 
                                      relatedListing.availability === 'high' ? '#22C55E' :
                                      relatedListing.availability === 'medium' ? '#F59E0B' : '#EF4444'
                                  }}
                                />
                                <Text className="text-gray-500 text-xs capitalize">
                                  {relatedListing.availability}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Action Buttons */}
              <View className="space-y-3 pb-8">
                <TouchableOpacity
                  className="bg-forest-green px-6 py-4 rounded-xl flex-row items-center justify-center active:bg-forest-green/90"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    listing && onMessagePress?.(listing);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold ml-3">
                    Message {listing.provider}
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className="flex-1 bg-sage-green/20 px-6 py-4 rounded-xl flex-row items-center justify-center active:bg-sage-green/30"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      listing && onDirectionsPress?.(listing);
                    }}
                  >
                    <Ionicons name="navigate-outline" size={20} color="#87A96B" />
                    <Text className="text-sage-green text-lg font-semibold ml-2">
                      Directions
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className={`px-6 py-4 rounded-xl flex-row items-center justify-center ${
                      isFavorite 
                        ? 'bg-red-50 border border-red-200 active:bg-red-100' 
                        : 'bg-gray-50 border border-gray-200 active:bg-gray-100'
                    }`}
                    onPress={handleFavorite}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? '#EF4444' : '#6B7280'}
                    />
                    <Text className={`text-lg font-semibold ml-2 ${
                      isFavorite ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      {isFavorite ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Secondary Actions */}
                <View className="flex-row justify-center space-x-8 pt-2">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      listing && onSharePress?.(listing);
                    }}
                  >
                    <Ionicons name="share-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-sm font-medium ml-2">
                      Share
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // TODO: Implement report functionality
                    }}
                  >
                    <Ionicons name="flag-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-sm font-medium ml-2">
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
};

export default FoodListingDetailModal;