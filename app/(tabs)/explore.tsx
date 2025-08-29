import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: string;
  distance: string;
  timeLeft: string;
  isUrgent: boolean;
}

const mockFoodItems: FoodItem[] = [
  {
    id: '1',
    title: 'Fresh Vegetables Bundle',
    description: 'Carrots, broccoli, and bell peppers from our garden',
    category: 'Vegetables',
    distance: '0.3 km',
    timeLeft: '2 hours',
    isUrgent: true,
  },
  {
    id: '2',
    title: 'Homemade Bread Loaves',
    description: 'Whole wheat and sourdough, baked this morning',
    category: 'Bakery',
    distance: '0.8 km',
    timeLeft: '1 day',
    isUrgent: false,
  },
  {
    id: '3',
    title: 'Fruit Salad Mix',
    description: 'Apples, oranges, and bananas - perfect for smoothies',
    category: 'Fruits',
    distance: '1.2 km',
    timeLeft: '6 hours',
    isUrgent: false,
  },
  {
    id: '4',
    title: 'Dairy Products',
    description: 'Milk, cheese, and yogurt expiring soon',
    category: 'Dairy',
    distance: '0.5 km',
    timeLeft: '4 hours',
    isUrgent: true,
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Prepared', 'Other'];

  const filteredItems = mockFoodItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <View className="flex-row items-center px-4 py-3 bg-white rounded-xl">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 text-base text-gray-900 ml-3"
            placeholder="Search for food..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View className="py-4 bg-white">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`px-4 py-2 mr-3 rounded-full border ${
                selectedCategory === category
                  ? 'bg-forest-green border-forest-green'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text className={`text-sm font-medium ${
                selectedCategory === category ? 'text-white' : 'text-gray-700'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <View className="flex-1 px-6 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            {filteredItems.length} items found
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="options-outline" size={20} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">Filter</Text>
          </TouchableOpacity>
        </View>

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
    </View>
  );
}
