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
import type { FoodListing } from '../map/FoodMarker';

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
  
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);

  // Debounced search
  const debounceTimeout = useRef<any>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onSearch(query);
      if (query.trim()) {
        // Add to recent searches
        setRecentSearches(prev => {
          const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
          return updated;
        });
      }
    }, 300);
  }, [onSearch]);

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
    } else {
      setSuggestions(SEARCH_SUGGESTIONS);
    }
  }, [onSearchQueryChange, debouncedSearch]);

  // Voice search functionality
  const handleVoiceSearch = useCallback(async () => {
    try {
      setIsListening(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Note: Expo Speech doesn't have speech recognition, only text-to-speech
      // In a real app, you'd use expo-speech-recognition or react-native-voice
      // For now, we'll simulate voice input
      
      // Simulate voice recognition delay
      setTimeout(() => {
        const voiceQueries = ['fresh vegetables', 'bread', 'fruits near me', 'organic food'];
        const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
        handleSearchChange(randomQuery);
        setIsListening(false);
        
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
    }
  }, [handleSearchChange]);

  // Animation effects
  useEffect(() => {
    if (isVisible) {
      // Focus text input when overlay opens
      setTimeout(() => textInputRef.current?.focus(), 100);
      
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
    }
  }, [isVisible, overlayAnim, searchBarAnim, suggestionsAnim]);

  // Handle suggestion selection
  const handleSuggestionPress = useCallback((suggestion: SearchSuggestion) => {
    Haptics.selectionAsync();
    handleSearchChange(suggestion.text);
    textInputRef.current?.blur();
  }, [handleSearchChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    Haptics.selectionAsync();
    handleSearchChange('');
    textInputRef.current?.focus();
  }, [handleSearchChange]);

  // Handle close
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

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
        opacity: suggestionsAnim,
        transform: [
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
        className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
        onPress={() => handleSuggestionPress(item)}
        style={{ animationDelay: `${index * 50}ms` }}
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
            />
            
            {/* Clear Button */}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="w-6 h-6 items-center justify-center rounded-full bg-gray-300 mr-2 active:bg-gray-400"
                onPress={handleClearSearch}
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
        {searchQuery.trim() && (
          <Animated.View
            className="px-6 mb-4"
            style={{ opacity: suggestionsAnim }}
          >
            <Text className="text-gray-600 text-sm">
              {foodListings.length} results found
            </Text>
          </Animated.View>
        )}

        {/* Suggestions List */}
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
      </Animated.View>
    </Animated.View>
  );
};

export default SearchOverlay;