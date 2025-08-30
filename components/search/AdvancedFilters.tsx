import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export interface AdvancedFilterOptions {
  maxDistance: number; // in kilometers
  availabilityStatus: ('high' | 'medium' | 'low')[];
  urgentOnly: boolean;
  freshnessHours: number; // max hours since posted
  sortBy: 'distance' | 'newest' | 'popularity' | 'freshness';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  isVisible: boolean;
  onClose: () => void;
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

const DEFAULT_FILTERS: AdvancedFilterOptions = {
  maxDistance: 5,
  availabilityStatus: ['high', 'medium', 'low'],
  urgentOnly: false,
  freshnessHours: 24,
  sortBy: 'distance',
  sortOrder: 'asc',
};

const SORT_OPTIONS = [
  { id: 'distance', label: 'Distance', icon: 'location' as const },
  { id: 'newest', label: 'Newest First', icon: 'time' as const },
  { id: 'popularity', label: 'Most Popular', icon: 'heart' as const },
  { id: 'freshness', label: 'Freshest', icon: 'leaf' as const },
];

const AVAILABILITY_OPTIONS = [
  { id: 'high', label: 'High Availability', color: '#22c55e' },
  { id: 'medium', label: 'Medium Availability', color: '#f59e0b' },
  { id: 'low', label: 'Low Availability', color: '#ef4444' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isVisible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onReset,
  className = "flex-1"
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterOptions>(filters);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  React.useEffect(() => {
    if (isVisible) {
      setLocalFilters(filters);
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, modalAnim, contentAnim, filters]);

  // Update local filters
  const updateLocalFilters = useCallback((updates: Partial<AdvancedFilterOptions>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle distance change
  const handleDistanceChange = useCallback((value: number) => {
    updateLocalFilters({ maxDistance: value });
  }, [updateLocalFilters]);

  // Handle availability toggle
  const handleAvailabilityToggle = useCallback((status: 'high' | 'medium' | 'low') => {
    Haptics.selectionAsync();
    updateLocalFilters({
      availabilityStatus: localFilters.availabilityStatus.includes(status)
        ? localFilters.availabilityStatus.filter(s => s !== status)
        : [...localFilters.availabilityStatus, status]
    });
  }, [localFilters.availabilityStatus, updateLocalFilters]);

  // Handle urgent toggle
  const handleUrgentToggle = useCallback(() => {
    Haptics.selectionAsync();
    updateLocalFilters({ urgentOnly: !localFilters.urgentOnly });
  }, [localFilters.urgentOnly, updateLocalFilters]);

  // Handle freshness change
  const handleFreshnessChange = useCallback((value: number) => {
    updateLocalFilters({ freshnessHours: value });
  }, [updateLocalFilters]);

  // Handle sort option change
  const handleSortChange = useCallback((sortBy: AdvancedFilterOptions['sortBy']) => {
    Haptics.selectionAsync();
    updateLocalFilters({ sortBy });
  }, [updateLocalFilters]);

  // Handle sort order toggle
  const handleSortOrderToggle = useCallback(() => {
    Haptics.selectionAsync();
    updateLocalFilters({
      sortOrder: localFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  }, [localFilters.sortOrder, updateLocalFilters]);

  // Handle apply
  const handleApply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange(localFilters);
    onApply();
    onClose();
  }, [localFilters, onFiltersChange, onApply, onClose]);

  // Handle reset
  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
  }, [onReset]);

  // Handle close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        className="flex-1 bg-black/50"
        style={{ opacity: modalAnim }}
      >
        {/* Backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Filter Panel */}
        <Animated.View
          className="bg-white rounded-t-3xl shadow-2xl max-h-4/5"
          style={{
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          {/* Handle Bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">
              Advanced Filters
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Distance Filter */}
            <Animated.View
              className="px-6 py-6 border-b border-gray-100"
              style={{ opacity: contentAnim }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="location" size={20} color="#2D5016" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Maximum Distance
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-3xl font-bold text-forest-green mb-2">
                  {localFilters.maxDistance.toFixed(1)} km
                </Text>
                <View className="flex-row items-center justify-between bg-gray-100 rounded-xl p-2">
                  <TouchableOpacity
                    className="bg-forest-green px-3 py-2 rounded-lg active:bg-forest-green/80"
                    onPress={() => handleDistanceChange(Math.max(0.5, localFilters.maxDistance - 0.5))}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold text-gray-900">
                    {localFilters.maxDistance.toFixed(1)} km
                  </Text>
                  <TouchableOpacity
                    className="bg-forest-green px-3 py-2 rounded-lg active:bg-forest-green/80"
                    onPress={() => handleDistanceChange(Math.min(20, localFilters.maxDistance + 0.5))}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">0.5 km</Text>
                  <Text className="text-gray-500 text-sm">20 km</Text>
                </View>
              </View>
            </Animated.View>

            {/* Availability Status */}
            <Animated.View
              className="px-6 py-6 border-b border-gray-100"
              style={{ opacity: contentAnim }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={20} color="#2D5016" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Availability Status
                </Text>
              </View>
              <View className="space-y-3">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    className="flex-row items-center justify-between py-3 px-4 rounded-xl bg-gray-50 active:bg-gray-100"
                    onPress={() => handleAvailabilityToggle(option.id as any)}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: option.color }}
                      />
                      <Text className="text-gray-900 font-medium">
                        {option.label}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        localFilters.availabilityStatus.includes(option.id as any)
                          ? 'border-forest-green bg-forest-green'
                          : 'border-gray-300'
                      }`}
                    >
                      {localFilters.availabilityStatus.includes(option.id as any) && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Urgent Only Toggle */}
            <Animated.View
              className="px-6 py-6 border-b border-gray-100"
              style={{ opacity: contentAnim }}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between active:bg-gray-50 rounded-xl p-4 -m-4"
                onPress={handleUrgentToggle}
              >
                <View className="flex-row items-center">
                  <Ionicons name="flash" size={20} color="#EF4444" />
                  <View className="ml-3">
                    <Text className="text-lg font-semibold text-gray-900">
                      Urgent Only
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Show only time-sensitive listings
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-12 h-7 rounded-full border-2 items-center ${
                    localFilters.urgentOnly
                      ? 'border-forest-green bg-forest-green justify-end'
                      : 'border-gray-300 bg-gray-200 justify-start'
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full mx-0.5 ${
                      localFilters.urgentOnly ? 'bg-white' : 'bg-white'
                    }`}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Freshness Filter */}
            <Animated.View
              className="px-6 py-6 border-b border-gray-100"
              style={{ opacity: contentAnim }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="leaf" size={20} color="#2D5016" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Maximum Age
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-3xl font-bold text-forest-green mb-2">
                  {localFilters.freshnessHours} hours
                </Text>
                <View className="flex-row items-center justify-between bg-gray-100 rounded-xl p-2">
                  <TouchableOpacity
                    className="bg-forest-green px-3 py-2 rounded-lg active:bg-forest-green/80"
                    onPress={() => handleFreshnessChange(Math.max(1, localFilters.freshnessHours - 1))}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold text-gray-900">
                    {localFilters.freshnessHours} hours
                  </Text>
                  <TouchableOpacity
                    className="bg-forest-green px-3 py-2 rounded-lg active:bg-forest-green/80"
                    onPress={() => handleFreshnessChange(Math.min(72, localFilters.freshnessHours + 1))}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">1 hour</Text>
                  <Text className="text-gray-500 text-sm">3 days</Text>
                </View>
              </View>
            </Animated.View>

            {/* Sort Options */}
            <Animated.View
              className="px-6 py-6"
              style={{ opacity: contentAnim }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="swap-vertical" size={20} color="#2D5016" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Sort By
                </Text>
              </View>
              <View className="space-y-3 mb-4">
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    className="flex-row items-center justify-between py-3 px-4 rounded-xl bg-gray-50 active:bg-gray-100"
                    onPress={() => handleSortChange(option.id as any)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={localFilters.sortBy === option.id ? '#2D5016' : '#6B7280'}
                      />
                      <Text
                        className={`ml-3 font-medium ${
                          localFilters.sortBy === option.id
                            ? 'text-forest-green'
                            : 'text-gray-900'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        localFilters.sortBy === option.id
                          ? 'border-forest-green bg-forest-green'
                          : 'border-gray-300'
                      }`}
                    >
                      {localFilters.sortBy === option.id && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort Order */}
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 px-4 rounded-xl bg-gray-50 active:bg-gray-100"
                onPress={handleSortOrderToggle}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={localFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={18}
                    color="#2D5016"
                  />
                  <Text className="text-gray-900 font-medium ml-3">
                    {localFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Text>
                </View>
                <Ionicons name="swap-vertical" size={16} color="#6B7280" />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Action Buttons */}
          <Animated.View
            className="px-6 py-4 border-t border-gray-200 bg-white"
            style={{ opacity: contentAnim }}
          >
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl border-2 border-gray-300 bg-white active:bg-gray-50"
                onPress={handleReset}
              >
                <Text className="text-gray-700 font-semibold text-center text-base">
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl bg-forest-green active:bg-forest-green/90"
                onPress={handleApply}
              >
                <Text className="text-white font-semibold text-center text-base">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AdvancedFilters;