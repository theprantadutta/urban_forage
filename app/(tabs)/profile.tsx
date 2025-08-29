import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { signOut } = useAuthStore();

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleSettings = () => {
    router.push('/settings/index' as any);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/signin' as any);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const profileStats = [
    { label: 'Items Shared', value: user?.stats?.itemsShared || 0 },
    { label: 'Listings Created', value: user?.stats?.listingsCreated || 0 },
    { label: 'Community Rating', value: user?.stats?.communityRating || 0 },
  ];

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      onPress: handleEditProfile,
    },
    {
      icon: 'list-outline',
      title: 'My Listings',
      subtitle: 'Manage your food shares',
      onPress: () => {},
    },
    {
      icon: 'heart-outline',
      title: 'Favorites',
      subtitle: 'Saved food items',
      onPress: () => {},
    },
    {
      icon: 'time-outline',
      title: 'History',
      subtitle: 'Past transactions',
      onPress: () => {},
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: handleSettings,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView className="flex-1 bg-cream-white">
      {/* Header */}
      <View className="pt-4 pb-8 px-6 bg-forest-green">
        <View className="items-center">
          {/* Profile Image */}
          <View className="relative mb-4">
            <Image
              source={{
                uri: user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
              }}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            <TouchableOpacity 
              onPress={handleEditProfile}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-sage-green rounded-full items-center justify-center border-2 border-white"
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text className="text-2xl font-bold text-white mb-1">
            {user?.displayName || 'User Name'}
          </Text>
          <Text className="text-sage-green text-base">
            {user?.email || 'user@example.com'}
          </Text>
          {user?.profile?.verified && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="checkmark-circle" size={16} color="#87A96B" />
              <Text className="text-sage-green text-sm ml-1">Verified Member</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 py-4">
        <View className="bg-white rounded-2xl p-6 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Community Impact
          </Text>
          <View className="flex-row justify-between">
            {profileStats.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className="text-2xl font-bold text-forest-green">
                  {stat.value}
                </Text>
                <Text className="text-sm text-gray-500 text-center">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bio */}
      {user?.profile?.bio && (
        <View className="px-6 pb-4">
          <View className="bg-white rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              About
            </Text>
            <Text className="text-gray-600 leading-6">
              {user.profile.bio}
            </Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View className="px-6 pb-4">
        <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className={`flex-row items-center px-6 py-4 active:bg-gray-50 ${
                index < menuItems.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 rounded-2xl py-4 items-center active:bg-red-600"
        >
          <Text className="text-white font-semibold text-base">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}