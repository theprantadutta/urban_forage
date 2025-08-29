import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Placeholder data for messages
const conversations = [
  {
    id: '1',
    name: 'Sarah Chen',
    lastMessage: 'Thanks for the fresh tomatoes!',
    timestamp: '2m ago',
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    online: true,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    lastMessage: 'Is the bread still available?',
    timestamp: '1h ago',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    online: false,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    lastMessage: 'Perfect timing! I\'ll pick up at 3pm',
    timestamp: '3h ago',
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    online: true,
  },
  {
    id: '4',
    name: 'Community Garden',
    lastMessage: 'New harvest available this weekend',
    timestamp: '1d ago',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop',
    online: false,
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const renderConversation = ({ item }: { item: typeof conversations[0] }) => (
    <TouchableOpacity className="flex-row items-center px-6 py-4 border-b border-gray-200 bg-white active:bg-gray-50">
      <View className="relative mr-4">
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full"
        />
        {item.online && (
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-gray-900">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.timestamp}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${item.unread > 0
              ? 'text-gray-900 font-medium'
              : 'text-gray-500'
              }`}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View className="bg-sage-green rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-medium">
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-cream-white">
      {/* Header */}
      <View className="pt-4 pb-6 px-6 bg-forest-green">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">
            Messages
          </Text>
          <TouchableOpacity className="w-10 h-10 bg-sage-green rounded-full items-center justify-center">
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" className="mr-3" />
          <TextInput
            className="text-gray-900 flex-1"
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
      {/* Empty State (when no conversations) */}
      {conversations.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="chatbubbles-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
            No Messages Yet
          </Text>
          <Text className="text-gray-500 text-center leading-6">
            Start sharing food with your community to begin conversations with other members.
          </Text>
        </View>
      )}
    </View>
  );
}