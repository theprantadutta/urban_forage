import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { FoodListing } from './FoodMarker';

interface MapErrorHandlerProps {
  error: {
    type: 'load_failed' | 'render_error' | 'marker_error' | 'timeout';
    message: string;
  } | null;
  listings: FoodListing[];
  onRetry: () => void;
  onSwitchToList: () => void;
  onRefreshData: () => void;
  className?: string;
}

export const MapErrorHandler: React.FC<MapErrorHandlerProps> = ({
  error,
  listings,
  onRetry,
  onSwitchToList,
  onRefreshData,
  className = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, onRetry]);

  const handleSwitchToList = useCallback(() => {
    Haptics.selectionAsync();
    onSwitchToList();
  }, [onSwitchToList]);

  const handleRefreshData = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRefreshData();
  }, [onRefreshData]);

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'load_failed':
        return 'map-outline';
      case 'render_error':
        return 'warning-outline';
      case 'marker_error':
        return 'location-outline';
      case 'timeout':
        return 'time-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'load_failed':
        return 'Map Failed to Load';
      case 'render_error':
        return 'Map Rendering Error';
      case 'marker_error':
        return 'Marker Display Error';
      case 'timeout':
        return 'Map Loading Timeout';
      default:
        return 'Map Error';
    }
  };

  const getSuggestions = (errorType: string) => {
    switch (errorType) {
      case 'load_failed':
        return [
          'Check your internet connection',
          'Try switching to list view',
          'Refresh the data',
        ];
      case 'render_error':
        return [
          'Switch to list view temporarily',
          'Restart the app if problem persists',
          'Clear app cache',
        ];
      case 'marker_error':
        return [
          'Some listings may not be visible',
          'Try refreshing the data',
          'Use search to find specific items',
        ];
      case 'timeout':
        return [
          'Check your internet speed',
          'Try again in a moment',
          'Use offline mode if available',
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your connection',
          'Contact support if issue persists',
        ];
    }
  };

  if (!error) return null;

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Error Header */}
      <View className="items-center mb-4">
        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
          <Ionicons 
            name={getErrorIcon(error.type) as any} 
            size={32} 
            color="#EF4444" 
          />
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {getErrorTitle(error.type)}
        </Text>
      </View>

      {/* Error Message */}
      <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6 mb-6">
        {error.message}
      </Text>

      {/* Suggestions */}
      <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
          Suggestions:
        </Text>
        {getSuggestions(error.type).map((suggestion, index) => (
          <View key={index} className="flex-row items-start mb-2 last:mb-0">
            <View className="w-1.5 h-1.5 bg-forest-green rounded-full mt-2 mr-3" />
            <Text className="text-gray-600 dark:text-gray-400 text-sm flex-1">
              {suggestion}
            </Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="space-y-3">
        {/* Primary Action - Retry or Switch to List */}
        <TouchableOpacity
          className={`bg-forest-green px-6 py-4 rounded-2xl active:scale-95 ${
            isRetrying ? 'opacity-50' : ''
          }`}
          onPress={error.type === 'render_error' ? handleSwitchToList : handleRetry}
          disabled={isRetrying}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons 
              name={
                error.type === 'render_error' 
                  ? 'list-outline' 
                  : isRetrying 
                    ? 'hourglass-outline' 
                    : 'refresh'
              } 
              size={20} 
              color="white" 
            />
            <Text className="text-white font-semibold text-base ml-2">
              {error.type === 'render_error' 
                ? 'Switch to List View' 
                : isRetrying 
                  ? 'Retrying...' 
                  : 'Try Again'
              }
            </Text>
          </View>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View className="flex-row space-x-3">
          {error.type !== 'render_error' && (
            <TouchableOpacity
              className="flex-1 bg-sage-green px-4 py-3 rounded-xl active:scale-95"
              onPress={handleSwitchToList}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="list-outline" size={16} color="white" />
                <Text className="text-white font-medium text-sm ml-2">
                  List View
                </Text>
              </View>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className="flex-1 bg-gray-200 dark:bg-gray-600 px-4 py-3 rounded-xl active:scale-95"
            onPress={handleRefreshData}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="download-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm ml-2">
                Refresh Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fallback List Preview */}
      {listings.length > 0 && (
        <View className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
            Available Listings ({listings.length}):
          </Text>
          <View className="max-h-32">
            <FlatList
              data={listings.slice(0, 3)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="flex-row items-center py-2">
                  <View className="w-8 h-8 bg-forest-green/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-forest-green text-xs font-bold">
                      {item.category.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium text-sm">
                      {item.title}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      {item.distance} • {item.category}
                    </Text>
                  </View>
                </View>
              )}
            />
            {listings.length > 3 && (
              <TouchableOpacity
                className="py-2"
                onPress={handleSwitchToList}
              >
                <Text className="text-forest-green text-sm font-medium text-center">
                  View all {listings.length} listings
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default MapErrorHandler;