import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { FoodListing } from '../map/FoodMarker';

export interface FilterOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category?: FoodListing['category'];
  type: 'category' | 'availability' | 'distance' | 'freshness' | 'special';
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  type: string;
}

interface FilterChipsProps {
  activeFilters: ActiveFilter[];
  onFilterToggle: (filter: FilterOption) => void;
  onFilterRemove: (filterId: string) => void;
  onClearAll: () => void;
  className?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  // Categories
  {
    id: 'vegetables',
    label: 'Vegetables',
    icon: 'leaf',
    color: '#22c55e',
    category: 'vegetables',
    type: 'category',
  },
  {
    id: 'fruits',
    label: 'Fruits',
    icon: 'nutrition',
    color: '#f59e0b',
    category: 'fruits',
    type: 'category',
  },
  {
    id: 'bakery',
    label: 'Bakery',
    icon: 'cafe',
    color: '#8b5cf6',
    category: 'bakery',
    type: 'category',
  },
  {
    id: 'dairy',
    label: 'Dairy',
    icon: 'water',
    color: '#06b6d4',
    category: 'dairy',
    type: 'category',
  },
  {
    id: 'prepared',
    label: 'Prepared',
    icon: 'restaurant',
    color: '#ef4444',
    category: 'prepared',
    type: 'category',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'basket',
    color: '#6b7280',
    category: 'other',
    type: 'category',
  },

  // Availability
  {
    id: 'available-now',
    label: 'Available Now',
    icon: 'checkmark-circle',
    color: '#22c55e',
    type: 'availability',
  },
  {
    id: 'pickup-today',
    label: 'Pickup Today',
    icon: 'time',
    color: '#f59e0b',
    type: 'availability',
  },
  {
    id: 'urgent',
    label: 'Urgent',
    icon: 'flash',
    color: '#ef4444',
    type: 'special',
  },

  // Distance
  {
    id: 'nearby',
    label: 'Nearby (< 1km)',
    icon: 'location',
    color: '#06b6d4',
    type: 'distance',
  },
  {
    id: 'walking',
    label: 'Walking Distance',
    icon: 'walk',
    color: '#8b5cf6',
    type: 'distance',
  },

  // Freshness
  {
    id: 'fresh-today',
    label: 'Fresh Today',
    icon: 'leaf-outline',
    color: '#22c55e',
    type: 'freshness',
  },
  {
    id: 'organic',
    label: 'Organic',
    icon: 'flower',
    color: '#84cc16',
    type: 'special',
  },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilters,
  onFilterToggle,
  onFilterRemove,
  onClearAll,
  className = "py-4"
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const chipAnimations = useRef<{ [key: string]: Animated.Value }>({});

  // Get or create animation value for a chip
  const getChipAnimation = useCallback((chipId: string) => {
    if (!chipAnimations.current[chipId]) {
      chipAnimations.current[chipId] = new Animated.Value(1);
    }
    return chipAnimations.current[chipId];
  }, []);

  // Handle filter chip press
  const handleChipPress = useCallback((filter: FilterOption) => {
    Haptics.selectionAsync();
    
    const animation = getChipAnimation(filter.id);
    
    // Quick scale animation
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animation, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onFilterToggle(filter);
  }, [onFilterToggle, getChipAnimation]);

  // Handle active filter removal
  const handleActiveFilterRemove = useCallback((filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterRemove(filterId);
  }, [onFilterRemove]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClearAll();
  }, [onClearAll]);

  // Check if filter is active
  const isFilterActive = useCallback((filterId: string) => {
    return activeFilters.some(filter => filter.id === filterId);
  }, [activeFilters]);

  // Render filter chip
  const renderFilterChip = useCallback((filter: FilterOption) => {
    const isActive = isFilterActive(filter.id);
    const animation = getChipAnimation(filter.id);

    return (
      <Animated.View
        key={filter.id}
        style={{
          transform: [{ scale: animation }],
        }}
      >
        <TouchableOpacity
          className={`flex-row items-center px-4 py-2 mr-3 rounded-full border-2 ${
            isActive
              ? 'border-forest-green bg-forest-green'
              : 'border-gray-300 bg-white'
          } active:scale-95`}
          onPress={() => handleChipPress(filter)}
          style={{
            shadowColor: isActive ? filter.color : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isActive ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: isActive ? 4 : 2,
          }}
        >
          <View
            className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${
              isActive ? 'bg-white/20' : ''
            }`}
            style={{
              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : filter.color,
            }}
          >
            <Ionicons
              name={filter.icon}
              size={12}
              color={isActive ? 'white' : 'white'}
            />
          </View>
          <Text
            className={`text-sm font-medium ${
              isActive ? 'text-white' : 'text-gray-700'
            }`}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [isFilterActive, getChipAnimation, handleChipPress]);

  // Render active filter badge
  const renderActiveFilter = useCallback((filter: ActiveFilter, index: number) => (
    <Animated.View
      key={filter.id}
      className="mr-2 mb-2"
      style={{
        opacity: 1,
        transform: [
          {
            scale: 1,
          },
        ],
      }}
    >
      <TouchableOpacity
        className="flex-row items-center bg-forest-green px-3 py-2 rounded-full active:scale-95"
        onPress={() => handleActiveFilterRemove(filter.id)}
      >
        <Text className="text-white text-sm font-medium mr-2">
          {filter.label}
        </Text>
        <View className="w-4 h-4 bg-white/20 rounded-full items-center justify-center">
          <Ionicons name="close" size={10} color="white" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [handleActiveFilterRemove]);

  return (
    <View className={className}>
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-semibold text-base">
              Active Filters ({activeFilters.length})
            </Text>
            <TouchableOpacity
              className="flex-row items-center px-3 py-1 rounded-full bg-gray-100 active:bg-gray-200"
              onPress={handleClearAll}
            >
              <Ionicons name="close-circle" size={14} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-medium ml-1">
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap">
            {activeFilters.map(renderActiveFilter)}
          </View>
        </View>
      )}

      {/* Filter Categories */}
      <View className="px-6">
        <Text className="text-gray-900 font-semibold text-base mb-3">
          Categories
        </Text>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {FILTER_OPTIONS.filter(f => f.type === 'category').map(renderFilterChip)}
        </ScrollView>
      </View>

      <View className="px-6">
        <Text className="text-gray-900 font-semibold text-base mb-3">
          Availability
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {FILTER_OPTIONS.filter(f => f.type === 'availability' || f.type === 'special').map(renderFilterChip)}
        </ScrollView>
      </View>

      <View className="px-6">
        <Text className="text-gray-900 font-semibold text-base mb-3">
          Distance & Freshness
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {FILTER_OPTIONS.filter(f => f.type === 'distance' || f.type === 'freshness').map(renderFilterChip)}
        </ScrollView>
      </View>
    </View>
  );
};

export default FilterChips;