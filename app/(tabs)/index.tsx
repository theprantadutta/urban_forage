import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: string;
  distance: string;
  timeLeft: string;
  image?: string;
  isUrgent: boolean;
}

// Mock data for food listings
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
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleItemPress = (itemId: string) => {
    // TODO: Navigate to listing details when route is created
    console.log('Navigate to listing:', itemId);
  };

  const handleCategoryPress = (category: string) => {
    router.push(`/explore?category=${category}`);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 bg-white rounded-xl border border-gray-200 mb-3 active:bg-gray-50"
      onPress={() => handleItemPress(item.id)}
    >
      <View className="w-12 h-12 bg-forest-green/20 rounded-full items-center justify-center mr-3">
        <Ionicons name="restaurant" size={20} color="#2D5016" />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-base font-semibold text-gray-900 flex-1 pr-2" numberOfLines={1}>
            {item.title}
          </Text>
          {item.isUrgent && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-semibold">
                Urgent
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-600 leading-4 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 mr-3 ml-1">
              {item.distance}
            </Text>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {item.timeLeft}
            </Text>
          </View>
          <Text className="text-xs font-medium text-forest-green bg-forest-green/10 px-2 py-1 rounded-full">
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-cream-white">
      {/* Header */}
      <View className="pt-4 px-5 pb-5 bg-white">
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-base text-gray-500">
              Good morning,
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.displayName || 'User'}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-11 h-11 bg-cream-white rounded-full items-center justify-center relative"
            onPress={() => console.log('Navigate to notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View className="flex-row items-center px-4 py-3 bg-cream-white border border-gray-200 rounded-xl gap-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Search for food near you..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Ionicons name="options-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="p-5 mt-2 bg-white">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Today&apos;s Impact
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-xl font-bold text-green-600">24</Text>
            <Text className="text-xs text-gray-500 mt-1">Items Available</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-forest-green">1.2km</Text>
            <Text className="text-xs text-gray-500 mt-1">Avg Distance</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-warm-orange">8</Text>
            <Text className="text-xs text-gray-500 mt-1">Urgent Items</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View className="py-5 mt-2 bg-white">
        <Text className="text-lg font-semibold text-gray-900 mb-4 px-5">
          Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
          {['Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Prepared', 'Other'].map((category) => (
            <TouchableOpacity
              key={category}
              className="items-center py-4 px-5 mr-3 bg-cream-white border border-gray-200 rounded-xl min-w-[80px] active:bg-gray-50"
              onPress={() => handleCategoryPress(category)}
            >
              <Ionicons 
                name={getCategoryIcon(category)} 
                size={24} 
                color="#2D5016" 
              />
              <Text className="text-xs font-medium text-gray-900 mt-2">
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Food */}
      <View className="p-5 mt-2 bg-white">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Nearby Food
          </Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text className="text-sm font-semibold text-forest-green">
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockFoodItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

function getCategoryIcon(category: string): any {
  const icons: { [key: string]: string } = {
    'Vegetables': 'leaf-outline',
    'Fruits': 'nutrition-outline',
    'Bakery': 'cafe-outline',
    'Dairy': 'water-outline',
    'Prepared': 'restaurant-outline',
    'Other': 'ellipsis-horizontal-outline',
  };
  return icons[category] || 'ellipsis-horizontal-outline';
}

