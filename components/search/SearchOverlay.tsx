import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// import * as Speech from 'expo-speech'; // Commented out for now
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
    ACCESSIBILITY_ROLES,
    accessibleHapticFeedback,
    createAccessibilityHint
} from '../../utils/accessibility';
import { getCachedData, setCachedData } from '../../utils/errorHandling';
import type { FoodListing } from '../map/FoodMarker';
import { SearchErrorHandler } from './SearchErrorHandler';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category' | 'location';
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  foodListings: FoodListing[];
  className?: string;
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { id: '1', text: 'Fresh vegetables', type: 'popular', icon: 'leaf' },
  { id: '2', text: 'Bread and bakery', type: 'popular', icon: 'cafe' },
  { id: '3', text: 'Fruits', type: 'category', icon: 'nutrition' },
  { id: '4', text: 'Dairy products', type: 'category', icon: 'water' },
  { id: '5', text: 'Prepared meals', type: 'category', icon: 'restaurant' },
  { id: '6', text: 'Near me', type: 'location', icon: 'location' },
  { id: '7', text: 'Available today', type: 'popular', icon: 'time' },
  { id: '8', text: 'Organic', type: 'popular', icon: 'leaf-outline' },
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isVisible,
  onClose,
  onSearch,
  searchQuery,
  onSearchQueryChange,
  foodListings,
  className = "absolute inset-0 z-50"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>(SEARCH_SUGGESTIONS);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<{
    type: 'service_error' | 'timeout' | 'invalid_query' | 'no_results';
    message: string;
    query?: string;
  } | null>(null);
  const [cachedResults, setCachedResults] = useState<FoodListing[]>([]);
  const { isScreenReaderEnabled, announceMessage, isReduceMotionEnabled } = useAccessibility();
  
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);

  // Debounced search
  const debounceTimeout = useRef<any>(null);

  const debouncedSearch = useCallback(async (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      try {
        setSearchError(null);
        
        // Validate query
        if (query.trim().length > 0 && query.trim().length < 2) {
          setSearchError({
            type: 'invalid_query',
            message: 'Search query must be at least 2 characters long.',
            query,
          });
          return;
        }
        
        // Cache current results before new search
        if (foodListings.length > 0) {
          await setCachedData('search_results', foodListings);
          setCachedResults(foodListings);
        }
        
        // Perform search
        onSearch(query);
        
        if (query.trim()) {
          // Add to recent searches
          setRecentSearches(prev => {
            const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
            return updated;
          });
          
          // Cache recent searches
          setCachedData('recent_searches', recentSearches);
        }
        
        // Simulate search timeout (in real app, this would be handled by the search service)
        setTimeout(() => {
          if (foodListings.length === 0 && query.trim()) {
            setSearchError({
              type: 'no_results',
              message: `No food listings found for "${query}". Try different keywords or expand your search area.`,
              query,
            });
          }
        }, 2000);
        
      } catch (error) {
        console.error('Search error:', error);
        setSearchError({
          type: 'service_error',
          message: 'Search service is temporarily unavailable. Please try again.',
          query,
        });
      }
    }, 300);
  }, [onSearch, foodListings, recentSearches]);

  // Handle search query changes
  const handleSearchChange = useCallback((text: string) => {
    onSearchQueryChange(text);
    debouncedSearch(text);
    
    // Filter suggestions based on input
    if (text.trim()) {
      const filtered = SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      
      // Announce filtered suggestions count for screen readers
      if (isScreenReaderEnabled) {
        announceMessage(`${filtered.length} suggestions available`);
      }
    } else {
      setSuggestions(SEARCH_SUGGESTIONS);
    }
  }, [onSearchQueryChange, debouncedSearch, isScreenReaderEnabled, announceMessage]);

  // Voice search functionality
  const handleVoiceSearch = useCallback(async () => {
    try {
      setIsListening(true);
      await accessibleHapticFeedback('impact');
      
      if (isScreenReaderEnabled) {
        announceMessage('Voice search started, listening for your query');
      }
      
      // Note: Expo Speech doesn't have speech recognition, only text-to-speech
      // In a real app, you'd use expo-speech-recognition or react-native-voice
      // For now, we'll simulate voice input
      
      // Simulate voice recognition delay
      setTimeout(() => {
        const voiceQueries = ['fresh vegetables', 'bread', 'fruits near me', 'organic food'];
        const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
        handleSearchChange(randomQuery);
        setIsListening(false);
        
        if (isScreenReaderEnabled) {
          announceMessage(`Voice search completed. Searching for ${randomQuery}`);
        }
        
        // Provide audio feedback (commented out for now)
        // Speech.speak('Searching for ' + randomQuery, {
        //   language: 'en',
        //   pitch: 1.0,
        //   rate: 0.8,
        // });
      }, 2000);
      
    } catch (error) {
      console.error('Voice search error:', error);
      setIsListening(false);
      if (isScreenReaderEnabled) {
        announceMessage('Voice search failed. Please try again or use text input.');
      }
    }
  }, [handleSearchChange, isScreenReaderEnabled, announceMessage]);

  // Animation effects
  useEffect(() => {
    if (isVisible) {
      // Focus text input when overlay opens
      setTimeout(() => {
        textInputRef.current?.focus();
        if (isScreenReaderEnabled) {
          announceMessage('Search overlay opened. Search field is focused.');
        }
      }, 100);
      
      if (!isReduceMotionEnabled) {
        Animated.parallel([
          Animated.timing(overlayAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(searchBarAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(suggestionsAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Skip animations if reduce motion is enabled
        overlayAnim.setValue(1);
        searchBarAnim.setValue(1);
        suggestionsAnim.setValue(1);
      }
    } else {
      if (!isReduceMotionEnabled) {
        Animated.parallel([
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(searchBarAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(suggestionsAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        overlayAnim.setValue(0);
        searchBarAnim.setValue(0);
        suggestionsAnim.setValue(0);
      }
    }
  }, [isVisible, overlayAnim, searchBarAnim, suggestionsAnim, isScreenReaderEnabled, announceMessage, isReduceMotionEnabled]);

  // Handle suggestion selection
  const handleSuggestionPress = useCallback(async (suggestion: SearchSuggestion) => {
    await accessibleHapticFeedback('selection');
    
    if (isScreenReaderEnabled) {
      announceMessage(`Selected ${suggestion.text}. Searching now.`);
    }
    
    handleSearchChange(suggestion.text);
    textInputRef.current?.blur();
  }, [handleSearchChange, isScreenReaderEnabled, announceMessage]);

  // Handle clear search
  const handleClearSearchInput = useCallback(() => {
    Haptics.selectionAsync();
    handleSearchChange('');
    textInputRef.current?.focus();
  }, [handleSearchChange]);

  // Handle close
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  // Search error handlers
  const handleRetrySearch = useCallback((query?: string) => {
    const retryQuery = query || searchQuery;
    setSearchError(null);
    debouncedSearch(retryQuery);
  }, [searchQuery, debouncedSearch]);

  const handleUseCachedResults = useCallback(() => {
    setSearchError(null);
    // In a real app, you would update the parent component with cached results
    console.log('Using cached results:', cachedResults);
  }, [cachedResults]);

  const handleClearSearch = useCallback(() => {
    setSearchError(null);
    handleSearchChange('');
  }, [handleSearchChange]);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await getCachedData<string[]>('recent_searches');
        if (cached) {
          setRecentSearches(cached);
        }
        
        const cachedSearchResults = await getCachedData<FoodListing[]>('search_results');
        if (cachedSearchResults) {
          setCachedResults(cachedSearchResults);
        }
      } catch (error) {
        console.error('Failed to load cached search data:', error);
      }
    };
    
    loadCachedData();
  }, []);

  if (!isVisible) return null;

  const searchBarTranslateY = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const suggestionsTranslateY = suggestionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const renderSuggestion = ({ item, index }: { item: SearchSuggestion; index: number }) => (
    <Animated.View
      style={{
        opacity: isReduceMotionEnabled ? 1 : suggestionsAnim,
        transform: isReduceMotionEnabled ? [] : [
          {
            translateY: suggestionsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50 min-h-[60px]"
        onPress={() => handleSuggestionPress(item)}
        style={{ animationDelay: `${index * 50}ms` }}
        accessible={true}
        accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
        accessibilityLabel={`Search for ${item.text}`}
        accessibilityHint={createAccessibilityHint(
          'search',
          `Searches for ${item.text} in available food listings`
        )}
        accessibilityValue={{
          text: `${item.type === 'recent' ? 'Recent search' : item.type} suggestion`
        }}
      >
        <View className="w-10 h-10 bg-forest-green/10 rounded-full items-center justify-center mr-4">
          <Ionicons
            name={item.icon || 'search'}
            size={18}
            color="#2D5016"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-base">
            {item.text}
          </Text>
          <Text className="text-gray-500 text-sm capitalize">
            {item.type === 'recent' ? 'Recent search' : item.type}
          </Text>
        </View>
        <Ionicons
          name="arrow-up-outline"
          size={16}
          color="#9CA3AF"
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View
      className={className}
      style={{
        opacity: overlayAnim,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* Search Container */}
      <Animated.View
        className="bg-white rounded-t-3xl shadow-2xl"
        style={{
          transform: [{ translateY: searchBarTranslateY }],
          minHeight: '60%',
        }}
      >
        {/* Handle Bar */}
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Search Header */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-900 flex-1">
              Search Food
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <Animated.View
          className="px-6 mb-6"
          style={{
            transform: [{ translateY: searchBarTranslateY }],
          }}
        >
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              ref={textInputRef}
              className="flex-1 text-base text-gray-900 ml-3 mr-3"
              placeholder="Search for food, categories, or locations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              onSubmitEditing={() => textInputRef.current?.blur()}
              accessible={true}
              accessibilityRole={ACCESSIBILITY_ROLES.SEARCH}
              accessibilityLabel="Search for food listings"
              accessibilityHint="Enter keywords to search for food, categories, or locations"
              accessibilityValue={searchQuery ? { text: searchQuery } : undefined}
            />
            
            {/* Clear Button */}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="w-6 h-6 items-center justify-center rounded-full bg-gray-300 mr-2 active:bg-gray-400"
                onPress={handleClearSearchInput}
              >
                <Ionicons name="close" size={12} color="#6B7280" />
              </TouchableOpacity>
            )}

            {/* Voice Search Button */}
            <TouchableOpacity
              className={`w-8 h-8 items-center justify-center rounded-full ${
                isListening ? 'bg-red-500' : 'bg-forest-green'
              } active:scale-95`}
              onPress={handleVoiceSearch}
              disabled={isListening}
              accessible={true}
              accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
              accessibilityLabel={isListening ? 'Voice search in progress' : 'Start voice search'}
              accessibilityHint={isListening ? 'Voice search is listening for your query' : 'Double tap to start voice search'}
              accessibilityState={{
                busy: isListening,
                disabled: isListening,
              }}
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Voice Search Indicator */}
          {isListening && (
            <Animated.View className="mt-2 flex-row items-center justify-center">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              <Text className="text-red-500 text-sm font-medium">
                Listening...
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Search Results Count */}
        {searchQuery.trim() && !searchError && (
          <Animated.View
            className="px-6 mb-4"
            style={{ opacity: suggestionsAnim }}
          >
            <Text className="text-gray-600 text-sm">
              {foodListings.length} results found
            </Text>
          </Animated.View>
        )}

        {/* Search Error Handler */}
        {searchError && (
          <Animated.View
            className="px-6 mb-4"
            style={{ opacity: suggestionsAnim }}
          >
            <SearchErrorHandler
              error={searchError}
              onRetry={handleRetrySearch}
              onUseCachedResults={handleUseCachedResults}
              onClearSearch={handleClearSearch}
              cachedResultsCount={cachedResults.length}
            />
          </Animated.View>
        )}

        {/* Suggestions List */}
        {!searchError && (
          <Animated.View
            className="flex-1"
            style={{
              opacity: suggestionsAnim,
              transform: [{ translateY: suggestionsTranslateY }],
            }}
          >
            <FlatList
              data={searchQuery.trim() ? suggestions : [...recentSearches.map(search => ({
                id: search,
                text: search,
                type: 'recent' as const,
                icon: 'time' as keyof typeof Ionicons.glyphMap,
              })), ...SEARCH_SUGGESTIONS]}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                recentSearches.length > 0 && !searchQuery.trim() ? (
                  <View className="px-6 py-2 border-b border-gray-100">
                    <Text className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                      Recent Searches
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-lg font-medium mt-4">
                    No suggestions found
                  </Text>
                  <Text className="text-gray-400 text-sm text-center mt-2 px-6">
                    Try searching for food categories, locations, or specific items
                  </Text>
                </View>
              }
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default SearchOverlay;