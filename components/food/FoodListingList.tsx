import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, RefreshControl, Text, View } from 'react-native';
import type { FoodListing } from '../map/FoodMarker';
import { FoodListingCard } from './FoodListingCard';

interface FoodListingListProps {
  listings: FoodListing[];
  onListingPress?: (listing: FoodListing) => void;
  onFavoritePress?: (listing: FoodListing) => void;
  favoriteIds?: string[];
  onRefresh?: () => void;
  refreshing?: boolean;
  showDistance?: boolean;
  className?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
}

interface AnimatedCardProps {
  listing: FoodListing;
  index: number;
  onPress?: (listing: FoodListing) => void;
  onFavoritePress?: (listing: FoodListing) => void;
  isFavorite: boolean;
  showDistance: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  listing,
  index,
  onPress,
  onFavoritePress,
  isFavorite,
  showDistance,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const delay = index * 100; // Stagger animation by 100ms per card
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <FoodListingCard
        listing={listing}
        onPress={onPress}
        onFavoritePress={onFavoritePress}
        isFavorite={isFavorite}
        showDistance={showDistance}
      />
    </Animated.View>
  );
};

export const FoodListingList: React.FC<FoodListingListProps> = ({
  listings,
  onListingPress,
  onFavoritePress,
  favoriteIds = [],
  onRefresh,
  refreshing = false,
  showDistance = true,
  className = "flex-1",
  emptyStateTitle = "No food listings found",
  emptyStateMessage = "Try adjusting your search criteria or location to find more listings.",
}) => {
  const renderItem = ({ item, index }: { item: FoodListing; index: number }) => (
    <AnimatedCard
      listing={item}
      index={index}
      onPress={onListingPress}
      onFavoritePress={onFavoritePress}
      isFavorite={favoriteIds.includes(item.id)}
      showDistance={showDistance}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">🍎</Text>
      </View>
      <Text className="text-gray-900 text-xl font-bold text-center mb-3">
        {emptyStateTitle}
      </Text>
      <Text className="text-gray-600 text-base text-center leading-6 mb-8">
        {emptyStateMessage}
      </Text>
      <View className="flex-row space-x-4">
        <View className="bg-forest-green/10 px-4 py-2 rounded-full">
          <Text className="text-forest-green text-sm font-medium">
            Try &quot;fruits near me&quot;
          </Text>
        </View>
        <View className="bg-sage-green/10 px-4 py-2 rounded-full">
          <Text className="text-sage-green text-sm font-medium">
            Expand search area
          </Text>
        </View>
      </View>
    </View>
  );

  const keyExtractor = (item: FoodListing) => item.id;

  return (
    <View className={className}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 32,
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2D5016"
              colors={['#2D5016']}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 280, // Approximate card height
          offset: 280 * index,
          index,
        })}
      />
    </View>
  );
};

export default FoodListingList;