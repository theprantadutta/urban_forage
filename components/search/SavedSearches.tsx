import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  createdAt: Date;
  lastUsed: Date;
}

interface SavedSearchesProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (searchId: string) => void;
  className?: string;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  searches,
  onLoad,
  onDelete,
  className = '',
}) => {
  const [expandedSearch, setExpandedSearch] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSearchSummary = (search: SavedSearch) => {
    const filters = search.filters;
    const parts = [];
    
    if (filters.query) {
      parts.push(`"${filters.query}"`);
    }
    
    if (filters.categories.length > 0) {
      parts.push(`${filters.categories.length} categories`);
    }
    
    if (filters.maxDistance < 50) {
      parts.push(`within ${filters.maxDistance}km`);
    }
    
    if (filters.availability !== 'all') {
      parts.push(filters.availability);
    }
    
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100) {
      if (filters.priceRange.min === 0 && filters.priceRange.max === 0) {
        parts.push('free only');
      } else {
        parts.push(`$${filters.priceRange.min}-$${filters.priceRange.max}`);
      }
    }
    
    if (filters.dietary.length > 0) {
      parts.push(`${filters.dietary.length} dietary filters`);
    }
    
    if (filters.verified) {
      parts.push('verified only');
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
  };

  const handleDelete = (search: SavedSearch) => {
    Alert.alert(
      'Delete Saved Search',
      `Are you sure you want to delete "${search.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete(search.id);
          },
        },
      ]
    );
  };

  const handleLoad = (search: SavedSearch) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLoad(search);
  };

  const toggleExpanded = (searchId: string) => {
    setExpandedSearch(expandedSearch === searchId ? null : searchId);
  };

  if (searches.length === 0) {
    return null;
  }

  return (
    <View className={`px-4 py-4 border-b border-gray-100 ${className}`}>
      <Text className="text-gray-900 text-lg font-semibold mb-3">
        Saved Searches
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="-mx-1"
      >
        <View className="flex-row space-x-3 px-1">
          {searches.map((search) => {
            const isExpanded = expandedSearch === search.id;
            
            return (
              <View
                key={search.id}
                className="bg-white border border-gray-200 rounded-xl p-4 min-w-[280px] max-w-[280px]"
              >
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
                      {search.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Created {formatDate(search.createdAt)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    className="w-8 h-8 items-center justify-center"
                    onPress={() => toggleExpanded(search.id)}
                  >
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Summary */}
                <Text 
                  className="text-gray-600 text-sm mb-3 leading-5"
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {getSearchSummary(search)}
                </Text>

                {/* Expanded Details */}
                {isExpanded && (
                  <View className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-gray-700 text-xs font-medium mb-2">
                      Filter Details:
                    </Text>
                    
                    <View className="space-y-1">
                      {search.filters.query && (
                        <Text className="text-gray-600 text-xs">
                          • Search: &quot;{search.filters.query}&quot;
                        </Text>
                      )}
                      
                      {search.filters.categories.length > 0 && (
                        <Text className="text-gray-600 text-xs">
                          • Categories: {search.filters.categories.join(', ')}
                        </Text>
                      )}
                      
                      <Text className="text-gray-600 text-xs">
                        • Distance: {search.filters.maxDistance}km
                      </Text>
                      
                      <Text className="text-gray-600 text-xs">
                        • Availability: {search.filters.availability}
                      </Text>
                      
                      <Text className="text-gray-600 text-xs">
                        • Price: ${search.filters.priceRange.min} - ${search.filters.priceRange.max}
                      </Text>
                      
                      <Text className="text-gray-600 text-xs">
                        • Sort: {search.filters.sortBy} ({search.filters.sortOrder})
                      </Text>
                    </View>
                  </View>
                )}

                {/* Last Used */}
                <Text className="text-gray-400 text-xs mb-3">
                  Last used {formatDate(search.lastUsed)}
                </Text>

                {/* Actions */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-forest-green py-2 rounded-lg items-center"
                    onPress={() => handleLoad(search)}
                  >
                    <Text className="text-white font-medium text-sm">
                      Load Search
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="w-10 h-8 bg-red-100 rounded-lg items-center justify-center"
                    onPress={() => handleDelete(search)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default SavedSearches;