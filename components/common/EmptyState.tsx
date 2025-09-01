import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  type: 'no_results' | 'no_listings' | 'no_favorites' | 'no_network' | 'location_required' | 'permission_denied';
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  suggestions?: string[];
  className?: string;
  animated?: boolean;
}

const EMPTY_STATE_CONFIG = {
  no_results: {
    icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
    title: 'No Results Found',
    message: 'We couldn\'t find any food listings matching your search. Try adjusting your filters or search terms.',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
  },
  no_listings: {
    icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
    title: 'No Food Listings',
    message: 'There are no food listings in your area right now. Check back later or expand your search radius.',
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  no_favorites: {
    icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
    title: 'No Favorites Yet',
    message: 'Start exploring and save your favorite food listings to see them here.',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  no_network: {
    icon: 'wifi-outline' as keyof typeof Ionicons.glyphMap,
    title: 'No Internet Connection',
    message: 'Please check your internet connection and try again.',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  location_required: {
    icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Location Required',
    message: 'We need your location to show nearby food listings. Please enable location services.',
    color: '#06B6D4',
    backgroundColor: '#F0F9FF',
  },
  permission_denied: {
    icon: 'lock-closed-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Permission Required',
    message: 'Please grant the necessary permissions to use this feature.',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  icon,
  primaryAction,
  secondaryAction,
  suggestions = [],
  className = '',
  animated = true,
}) => {
  const config = EMPTY_STATE_CONFIG[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayIcon = icon || config.icon;

  const handlePrimaryAction = useCallback(() => {
    if (primaryAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      primaryAction.onPress();
    }
  }, [primaryAction]);

  const handleSecondaryAction = useCallback(() => {
    if (secondaryAction) {
      Haptics.selectionAsync();
      secondaryAction.onPress();
    }
  }, [secondaryAction]);

  const getDefaultActions = () => {
    switch (type) {
      case 'no_results':
        return {
          primary: { label: 'Clear Filters', onPress: () => {} },
          secondary: { label: 'Expand Search', onPress: () => {} },
        };
      case 'no_listings':
        return {
          primary: { label: 'Refresh', onPress: () => {} },
          secondary: { label: 'Expand Radius', onPress: () => {} },
        };
      case 'no_favorites':
        return {
          primary: { label: 'Explore Food', onPress: () => {} },
        };
      case 'no_network':
        return {
          primary: { label: 'Try Again', onPress: () => {} },
          secondary: { label: 'Offline Mode', onPress: () => {} },
        };
      case 'location_required':
        return {
          primary: { label: 'Enable Location', onPress: () => {} },
          secondary: { label: 'Manual Location', onPress: () => {} },
        };
      case 'permission_denied':
        return {
          primary: { label: 'Open Settings', onPress: () => {} },
          secondary: { label: 'Skip', onPress: () => {} },
        };
      default:
        return {};
    }
  };

  const defaultActions = getDefaultActions();
  const finalPrimaryAction = primaryAction || defaultActions.primary;
  const finalSecondaryAction = secondaryAction || defaultActions.secondary;

  return (
    <View className={`flex-1 items-center justify-center px-8 py-12 ${className}`}>
      {/* Icon */}
      <View 
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <Ionicons 
          name={displayIcon} 
          size={48} 
          color={config.color} 
        />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
        {displayTitle}
      </Text>

      {/* Message */}
      <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6 mb-8 max-w-sm">
        {displayMessage}
      </Text>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View className="w-full max-w-sm mb-8">
          <Text className="text-gray-700 dark:text-gray-300 font-medium text-center mb-4">
            Try these suggestions:
          </Text>
          <View className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <View key={index} className="flex-row items-center">
                <View className="w-1.5 h-1.5 bg-forest-green rounded-full mr-3" />
                <Text className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="w-full max-w-sm space-y-3">
        {/* Primary Action */}
        {finalPrimaryAction && (
          <TouchableOpacity
            className="bg-forest-green px-6 py-4 rounded-2xl active:scale-95"
            onPress={handlePrimaryAction}
          >
            <Text className="text-white font-semibold text-base text-center">
              {finalPrimaryAction.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Secondary Action */}
        {finalSecondaryAction && (
          <TouchableOpacity
            className="bg-gray-200 dark:bg-gray-700 px-6 py-4 rounded-2xl active:scale-95"
            onPress={handleSecondaryAction}
          >
            <Text className="text-gray-700 dark:text-gray-300 font-semibold text-base text-center">
              {finalSecondaryAction.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-8">
        Need help? Contact our support team
      </Text>
    </View>
  );
};

// Specialized empty state components
export const NoSearchResults: React.FC<{
  query: string;
  onClearFilters: () => void;
  onExpandSearch: () => void;
  className?: string;
}> = ({ query, onClearFilters, onExpandSearch, className }) => (
  <EmptyState
    type="no_results"
    title="No Results Found"
    message={`No food listings found for "${query}". Try different keywords or adjust your filters.`}
    primaryAction={{ label: 'Clear Filters', onPress: onClearFilters }}
    secondaryAction={{ label: 'Expand Search Area', onPress: onExpandSearch }}
    suggestions={[
      'Try broader search terms',
      'Check your spelling',
      'Remove some filters',
      'Increase search radius',
    ]}
    className={className}
  />
);

export const NoListingsInArea: React.FC<{
  onRefresh: () => void;
  onExpandRadius: () => void;
  className?: string;
}> = ({ onRefresh, onExpandRadius, className }) => (
  <EmptyState
    type="no_listings"
    primaryAction={{ label: 'Refresh', onPress: onRefresh }}
    secondaryAction={{ label: 'Expand Search Radius', onPress: onExpandRadius }}
    suggestions={[
      'Check back later for new listings',
      'Expand your search radius',
      'Try different categories',
      'Post your own listing to get started',
    ]}
    className={className}
  />
);

export const LocationRequired: React.FC<{
  onEnableLocation: () => void;
  onManualLocation: () => void;
  className?: string;
}> = ({ onEnableLocation, onManualLocation, className }) => (
  <EmptyState
    type="location_required"
    primaryAction={{ label: 'Enable Location', onPress: onEnableLocation }}
    secondaryAction={{ label: 'Set Manual Location', onPress: onManualLocation }}
    suggestions={[
      'Location helps us show nearby food',
      'Your location is kept private',
      'You can change this anytime in settings',
    ]}
    className={className}
  />
);

export default EmptyState;