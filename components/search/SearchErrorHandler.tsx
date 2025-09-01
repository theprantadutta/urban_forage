import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getSearchFallback } from '../../utils/errorHandling';

interface SearchErrorHandlerProps {
  error: {
    type: 'service_error' | 'timeout' | 'invalid_query' | 'no_results';
    message: string;
    query?: string;
  } | null;
  onRetry: (query?: string) => void;
  onUseCachedResults: () => void;
  onClearSearch: () => void;
  cachedResultsCount?: number;
  className?: string;
}

export const SearchErrorHandler: React.FC<SearchErrorHandlerProps> = ({
  error,
  onRetry,
  onUseCachedResults,
  onClearSearch,
  cachedResultsCount = 0,
  className = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      onRetry(error?.query);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, onRetry, error?.query]);

  const handleUseCached = useCallback(() => {
    Haptics.selectionAsync();
    onUseCachedResults();
  }, [onUseCachedResults]);

  const handleClearSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClearSearch();
  }, [onClearSearch]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    Haptics.selectionAsync();
    onRetry(suggestion);
  }, [onRetry]);

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'service_error':
        return 'server-outline';
      case 'timeout':
        return 'time-outline';
      case 'invalid_query':
        return 'alert-circle-outline';
      case 'no_results':
        return 'search-outline';
      default:
        return 'warning-outline';
    }
  };

  const getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'service_error':
        return 'Search Service Error';
      case 'timeout':
        return 'Search Timeout';
      case 'invalid_query':
        return 'Invalid Search';
      case 'no_results':
        return 'No Results Found';
      default:
        return 'Search Error';
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'service_error':
        return '#EF4444'; // red
      case 'timeout':
        return '#F59E0B'; // amber
      case 'invalid_query':
        return '#8B5CF6'; // purple
      case 'no_results':
        return '#6B7280'; // gray
      default:
        return '#EF4444';
    }
  };

  const getSuggestions = () => {
    if (!error?.query) return getSearchFallback('');
    return getSearchFallback(error.query);
  };

  if (!error) return null;

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Error Header */}
      <View className="items-center mb-4">
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${getErrorColor(error.type)}20` }}
        >
          <Ionicons 
            name={getErrorIcon(error.type) as any} 
            size={32} 
            color={getErrorColor(error.type)} 
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

      {/* Search Query Display */}
      {error.query && (
        <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Search query:
          </Text>
          <Text className="text-gray-900 dark:text-white font-medium">
            &quot;{error.query}&quot;
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="space-y-3 mb-6">
        {/* Retry Button */}
        {error.type !== 'invalid_query' && (
          <TouchableOpacity
            className={`bg-forest-green px-6 py-4 rounded-2xl active:scale-95 ${
              isRetrying ? 'opacity-50' : ''
            }`}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name={isRetrying ? 'hourglass-outline' : 'refresh'} 
                size={20} 
                color="white" 
              />
              <Text className="text-white font-semibold text-base ml-2">
                {isRetrying ? 'Searching...' : 'Try Again'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Secondary Actions */}
        <View className="flex-row space-x-3">
          {/* Use Cached Results */}
          {cachedResultsCount > 0 && (
            <TouchableOpacity
              className="flex-1 bg-sage-green px-4 py-3 rounded-xl active:scale-95"
              onPress={handleUseCached}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="download-outline" size={16} color="white" />
                <Text className="text-white font-medium text-sm ml-2">
                  Cached ({cachedResultsCount})
                </Text>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Clear Search */}
          <TouchableOpacity
            className="flex-1 bg-gray-200 dark:bg-gray-600 px-4 py-3 rounded-xl active:scale-95"
            onPress={handleClearSearch}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="close-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm ml-2">
                Clear
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Suggestions */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 font-medium mb-3">
          {error.type === 'no_results' ? 'Try searching for:' : 'Popular searches:'}
        </Text>
        
        <FlatList
          data={getSuggestions()}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-forest-green/10 px-4 py-2 rounded-full mr-3 active:scale-95"
              onPress={() => handleSuggestionPress(item)}
            >
              <Text className="text-forest-green font-medium text-sm">
                {item}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-gray-500 dark:text-gray-400 text-sm italic">
              No suggestions available
            </Text>
          }
        />
      </View>

      {/* Help Text */}
      {error.type === 'no_results' && (
        <View className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-2">
            Tips for better results:
          </Text>
          <View className="space-y-1">
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Try broader search terms
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Check spelling and try different keywords
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Expand your search radius
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchErrorHandler;