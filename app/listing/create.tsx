import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');

  const categories = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Bread & Bakery',
    'Meat & Seafood',
    'Pantry Items',
    'Prepared Foods',
    'Other',
  ];

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Here you would save the listing
    Alert.alert(
      'Success!',
      'Your food listing has been created.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-cream-white dark:bg-gray-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-forest-green">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">
            Create Listing
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-sage-green font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Photo Section */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Photos
          </Text>
          <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 rounded-xl h-40 items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Ionicons name="camera" size={40} className="text-gray-400 dark:text-gray-500 mb-2" />
            <Text className="text-gray-500 dark:text-gray-400 font-medium">
              Add Photos
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Tap to take or select photos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What are you sharing?"
            placeholderTextColor="#9CA3AF"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Description *
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your food item..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 min-h-[100px]"
          />
        </View>

        {/* Category */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  category === cat
                    ? 'bg-sage-green border-sage-green'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    category === cat
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quantity */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Quantity/Servings
          </Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 2 loaves, serves 4, 1 bag"
            placeholderTextColor="#9CA3AF"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100"
          />
        </View>

        {/* Pickup Details */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Pickup Details
          </Text>
          <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <TouchableOpacity className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-700 dark:text-gray-300">Location</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 mr-2">Set pickup location</Text>
                <Ionicons name="chevron-forward" size={16} className="text-gray-400 dark:text-gray-500" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between">
              <Text className="text-gray-700 dark:text-gray-300">Available until</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 mr-2">Select date</Text>
                <Ionicons name="chevron-forward" size={16} className="text-gray-400 dark:text-gray-500" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}