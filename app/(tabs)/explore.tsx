import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { Region } from 'react-native-maps';
import { CustomMapView, MapControls } from '../../components/map';
import type { FoodListing } from '../../components/map/FoodMarker';
import { AdvancedFilters, FilterChips, SearchOverlay } from '../../components/search';
import { mockFoodListings } from '../../constants/mockData';
import { useSearchAndFilter } from '../../hooks/useSearchAndFilter';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: string;
  distance: string;
  timeLeft: string;
  isUrgent: boolean;
}



export default function ExploreScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isAdvancedFiltersVisible, setIsAdvancedFiltersVisible] = useState(false);

  // Search and filter functionality
  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    advancedFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    updateAdvancedFilters,
    resetAdvancedFilters,
    filteredListings,
  } = useSearchAndFilter(mockFoodListings);

  // Convert FoodListing to FoodItem for list view compatibility
  const convertToFoodItems = (listings: FoodListing[]) => {
    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: `${listing.category.charAt(0).toUpperCase() + listing.category.slice(1)} • Available for pickup`,
      category: listing.category.charAt(0).toUpperCase() + listing.category.slice(1),
      distance: listing.distance || '0 km',
      timeLeft: listing.timeLeft || '24 hours',
      isUrgent: listing.isUrgent || false,
    }));
  };

  const filteredItems = convertToFoodItems(filteredListings);

  const handleRegionChange = (region: Region) => {
    // Handle map region changes for future filtering
    console.log('Map region changed:', region);
  };

  const handleMarkerPress = (listing: FoodListing) => {
    setSelectedMarkerId(listing.id);
  };

  const handleMarkerCalloutPress = (listing: FoodListing) => {
    // Navigate to listing detail or show modal
    console.log('Callout pressed for listing:', listing.title);
    // TODO: Implement navigation to listing detail
  };

  // Handle search overlay
  const handleSearchPress = () => {
    setIsSearchVisible(true);
  };

  const handleSearchClose = () => {
    setIsSearchVisible(false);
  };

  const handleSearch = (query: string) => {
    // Search is handled by the useSearchAndFilter hook
  };

  // Handle filters
  const handleFiltersPress = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const handleAdvancedFiltersPress = () => {
    setIsAdvancedFiltersVisible(true);
  };

  const handleAdvancedFiltersClose = () => {
    setIsAdvancedFiltersVisible(false);
  };

  const handleAdvancedFiltersApply = () => {
    // Applied automatically through the hook
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity className="flex-row p-4 bg-white rounded-xl border border-gray-200 mb-3 active:bg-gray-50">
      <View className="w-15 h-15 bg-forest-green/20 rounded-lg items-center justify-center mr-3">
        <Ionicons name="restaurant" size={32} color="#2D5016" />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {item.title}
          </Text>
          {item.isUrgent && (
            <View className="bg-red-500 px-2 py-1 rounded ml-2">
              <Text className="text-white text-xs font-semibold">
                Urgent
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-600 leading-5 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 mr-2">
              {item.distance}
            </Text>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 mr-2">
              {item.timeLeft}
            </Text>
          </View>
          <Text className="text-xs font-medium text-forest-green bg-forest-green/10 px-2 py-1 rounded">
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-cream-white">
      {/* Header */}
      <View className="pt-4 pb-6 px-6 bg-forest-green">
        <Text className="text-2xl font-bold text-white mb-4">
          Explore Food
        </Text>
        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 bg-white rounded-xl active:bg-gray-50"
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className={`flex-1 text-base ml-3 ${searchQuery ? 'text-gray-900' : 'text-gray-500'}`}>
            {searchQuery || 'Search for food...'}
          </Text>
          {searchQuery && (
            <View className="bg-forest-green px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {filteredListings.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      {isFiltersVisible && (
        <View className="bg-white border-b border-gray-200">
          <FilterChips
            activeFilters={activeFilters}
            onFilterToggle={toggleFilter}
            onFilterRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        </View>
      )}

      {/* View Toggle and Results Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            {filteredItems.length} items found
          </Text>
          <View className="flex-row items-center">
            <View className="flex-row bg-gray-100 rounded-lg p-1 mr-3">
              <TouchableOpacity
                className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setViewMode('list')}
              >
                <Ionicons 
                  name="list" 
                  size={18} 
                  color={viewMode === 'list' ? '#2D5016' : '#6B7280'} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setViewMode('map')}
              >
                <Ionicons 
                  name="map" 
                  size={18} 
                  color={viewMode === 'map' ? '#2D5016' : '#6B7280'} 
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity 
                className="flex-row items-center px-3 py-2 rounded-lg bg-gray-100 active:bg-gray-200"
                onPress={handleFiltersPress}
              >
                <Ionicons name="options-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">Filter</Text>
                {activeFilters.length > 0 && (
                  <View className="ml-2 bg-forest-green w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {activeFilters.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center px-3 py-2 rounded-lg bg-gray-100 active:bg-gray-200"
                onPress={handleAdvancedFiltersPress}
              >
                <Ionicons name="funnel-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">Advanced</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        {viewMode === 'map' ? (
          <View className="flex-1 relative">
            <CustomMapView
              onRegionChange={handleRegionChange}
              showUserLocation={true}
              className="flex-1"
              foodListings={filteredListings}
              selectedMarkerId={selectedMarkerId}
              onMarkerPress={handleMarkerPress}
              onMarkerCalloutPress={handleMarkerCalloutPress}
              enableClustering={true}
              clusteringOptions={{
                radius: 60,
                minPoints: 2,
                maxZoom: 16,
              }}
            />
            <MapControls />
          </View>
        ) : (
          <View className="flex-1 px-6 py-4">
            <FlatList
              data={filteredItems}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                  <Text className="text-lg font-medium text-gray-500 mt-4">
                    No food found
                  </Text>
                  <Text className="text-sm text-gray-400 text-center mt-2">
                    Try adjusting your search or category filter
                  </Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      {/* Search Overlay */}
      <SearchOverlay
        isVisible={isSearchVisible}
        onClose={handleSearchClose}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        foodListings={filteredListings}
      />

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isVisible={isAdvancedFiltersVisible}
        onClose={handleAdvancedFiltersClose}
        filters={advancedFilters}
        onFiltersChange={updateAdvancedFilters}
        onApply={handleAdvancedFiltersApply}
        onReset={resetAdvancedFilters}
      />
    </View>
  );
}
