import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

interface ManualLocationSelectorProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  onCancel: () => void;
  className?: string;
}

const POPULAR_LOCATIONS: LocationSuggestion[] = [
  {
    id: '1',
    title: 'San Francisco, CA',
    subtitle: 'California, United States',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: '2',
    title: 'New York, NY',
    subtitle: 'New York, United States',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: '3',
    title: 'Los Angeles, CA',
    subtitle: 'California, United States',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: '4',
    title: 'Chicago, IL',
    subtitle: 'Illinois, United States',
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: '5',
    title: 'Seattle, WA',
    subtitle: 'Washington, United States',
    latitude: 47.6062,
    longitude: -122.3321,
  },
];

export const ManualLocationSelector: React.FC<ManualLocationSelectorProps> = ({
  onLocationSelect,
  onCancel,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>(POPULAR_LOCATIONS);
  const [isSearching, setIsSearching] = useState(false);
  const [customLocation, setCustomLocation] = useState({ latitude: '', longitude: '' });

  // Simulate geocoding search (in a real app, you'd use a geocoding service)
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions(POPULAR_LOCATIONS);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter popular locations based on query
      const filtered = POPULAR_LOCATIONS.filter(location =>
        location.title.toLowerCase().includes(query.toLowerCase()) ||
        location.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      
      // Add some mock search results
      const mockResults: LocationSuggestion[] = [
        {
          id: `search-${Date.now()}`,
          title: query,
          subtitle: 'Search result',
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        },
      ];
      
      setSuggestions([...mockResults, ...filtered]);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to search for locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleLocationSelect = useCallback((location: LocationSuggestion) => {
    Haptics.selectionAsync();
    onLocationSelect({
      latitude: location.latitude,
      longitude: location.longitude,
      address: `${location.title}, ${location.subtitle}`,
    });
  }, [onLocationSelect]);

  const handleCustomLocationSubmit = useCallback(() => {
    const lat = parseFloat(customLocation.latitude);
    const lng = parseFloat(customLocation.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid Coordinates', 'Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  }, [customLocation, onLocationSelect]);

  const renderLocationItem = ({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
      onPress={() => handleLocationSelect(item)}
    >
      <View className="w-10 h-10 bg-forest-green/10 rounded-full items-center justify-center mr-4">
        <Ionicons name="location" size={18} color="#2D5016" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-base">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-sm">
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 bg-cream-white ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:scale-95"
          onPress={onCancel}
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          Select Location
        </Text>
        <View className="w-10" />
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-base text-gray-900 ml-3"
            placeholder="Search for a city or address..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#2D5016" />
          )}
        </View>
      </View>

      {/* Custom Coordinates Input */}
      <View className="px-6 pb-4">
        <Text className="text-gray-700 font-medium text-sm mb-3">
          Or enter coordinates manually:
        </Text>
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-gray-900"
              placeholder="Latitude"
              placeholderTextColor="#9CA3AF"
              value={customLocation.latitude}
              onChangeText={(text) => setCustomLocation(prev => ({ ...prev, latitude: text }))}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-gray-900"
              placeholder="Longitude"
              placeholderTextColor="#9CA3AF"
              value={customLocation.longitude}
              onChangeText={(text) => setCustomLocation(prev => ({ ...prev, longitude: text }))}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            className="bg-forest-green px-4 py-3 rounded-xl items-center justify-center active:scale-95"
            onPress={handleCustomLocationSubmit}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Suggestions */}
      <View className="flex-1">
        <Text className="text-gray-500 font-medium text-sm px-6 py-2 uppercase tracking-wide">
          {searchQuery.trim() ? 'Search Results' : 'Popular Locations'}
        </Text>
        
        <FlatList
          data={suggestions}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Ionicons name="location-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No locations found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2 px-6">
                Try searching for a different city or enter coordinates manually
              </Text>
            </View>
          }
        />
      </View>

      {/* Help Text */}
      <View className="px-6 py-4 border-t border-gray-200">
        <Text className="text-gray-500 text-xs text-center">
          Your selected location will be used to show nearby food listings
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ManualLocationSelector;