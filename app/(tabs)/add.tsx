import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AddScreen() {

  const handleCreateListing = () => {
    // TODO: Navigate to create listing screen when route is created
    console.log('Navigate to create listing');
  };

  const handleQuickShare = () => {
    // TODO: Navigate to quick share screen when route is created
    console.log('Navigate to quick share');
  };

  const handleBulkUpload = () => {
    // TODO: Navigate to bulk upload screen when route is created
    console.log('Navigate to bulk upload');
  };

  return (
    <ScrollView className="flex-1 bg-cream-white p-5">
      <View className="mb-8 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Share Food
        </Text>
        <Text className="text-base text-gray-600 leading-6">
          Help reduce food waste by sharing with your community
        </Text>
      </View>

      <View className="mb-8">
        {/* Create New Listing */}
        <TouchableOpacity
          className="flex-row items-center p-5 bg-white rounded-2xl border border-gray-200 mb-4 active:bg-gray-50"
          onPress={handleCreateListing}
        >
          <View className="w-15 h-15 bg-forest-green/20 rounded-full items-center justify-center mr-4">
            <Ionicons name="restaurant" size={32} color="#2D5016" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Create Listing
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              Share individual food items with photos and details
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Quick Share */}
        <TouchableOpacity
          className="flex-row items-center p-5 bg-white rounded-2xl border border-gray-200 mb-4 active:bg-gray-50"
          onPress={handleQuickShare}
        >
          <View className="w-15 h-15 bg-green-500/20 rounded-full items-center justify-center mr-4">
            <Ionicons name="flash" size={32} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Quick Share
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              Fast sharing for items that need to go quickly
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Bulk Upload */}
        <TouchableOpacity
          className="flex-row items-center p-5 bg-white rounded-2xl border border-gray-200 mb-4 active:bg-gray-50"
          onPress={handleBulkUpload}
        >
          <View className="w-15 h-15 bg-warm-orange/20 rounded-full items-center justify-center mr-4">
            <Ionicons name="albums" size={32} color="#D2691E" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Bulk Upload
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              Upload multiple items at once from events or cleanouts
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="mt-5">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Sharing Tips
        </Text>
        <View className="space-y-3">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-sm text-gray-600 flex-1 ml-3">
              Take clear, well-lit photos
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-sm text-gray-600 flex-1 ml-3">
              Include expiration dates
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-sm text-gray-600 flex-1 ml-3">
              Be honest about food condition
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-sm text-gray-600 flex-1 ml-3">
              Set realistic pickup times
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

