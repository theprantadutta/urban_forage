import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NotificationData, NotificationType } from '../../services/notifications';

interface NotificationItem extends NotificationData {
  id: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

interface NotificationCenterProps {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onNotificationPress: (notification: NotificationItem) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  notifications,
  onClose,
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'new_nearby_listing':
        return 'location';
      case 'listing_expiring':
        return 'time';
      case 'listing_reserved':
        return 'checkmark-circle';
      case 'message_received':
        return 'chatbubble';
      case 'system_announcement':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'new_nearby_listing':
        return '#22C55E';
      case 'listing_expiring':
        return '#F59E0B';
      case 'listing_reserved':
        return '#3B82F6';
      case 'message_received':
        return '#8B5CF6';
      case 'system_announcement':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item: notification }: { item: NotificationItem }) => {
    const iconColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        className={`flex-row items-start p-4 border-b border-gray-100 ${
          !notification.read ? 'bg-blue-50/50' : 'bg-white'
        }`}
        onPress={() => {
          onNotificationPress(notification);
          if (!notification.read) {
            onMarkAsRead(notification.id);
          }
        }}
        activeOpacity={0.7}
      >
        {/* Icon or Avatar */}
        <View className="mr-3">
          {notification.avatar ? (
            <Image
              source={{ uri: notification.avatar }}
              className="w-12 h-12 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Ionicons
                name={getNotificationIcon(notification.type)}
                size={24}
                color={iconColor}
              />
            </View>
          )}
          
          {/* Unread Indicator */}
          {!notification.read && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 min-w-0">
          <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
            {notification.title}
          </Text>
          <Text className="text-gray-600 text-sm leading-5 mb-2" numberOfLines={3}>
            {notification.body}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatTimestamp(notification.timestamp)}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center ml-2"
          onPress={(e) => {
            e.stopPropagation();
            // Show action menu or mark as read
            if (!notification.read) {
              onMarkAsRead(notification.id);
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name={notification.read ? "ellipsis-horizontal" : "radio-button-off"} 
            size={16} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="notifications-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
        {filter === 'unread' ? 'All caught up!' : 'No notifications'}
      </Text>
      <Text className="text-gray-500 text-base text-center leading-6">
        {filter === 'unread' 
          ? "You've read all your notifications. Great job staying connected!"
          : "We'll notify you when there's something new in your community."
        }
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Text className="text-gray-900 text-xl font-bold mr-2">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row px-4 py-3 bg-gray-50 border-b border-gray-200">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-3 ${
              filter === 'all' ? 'bg-forest-green' : 'bg-white'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text
              className={`font-medium ${
                filter === 'all' ? 'text-white' : 'text-gray-600'
              }`}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-3 ${
              filter === 'unread' ? 'bg-forest-green' : 'bg-white'
            }`}
            onPress={() => setFilter('unread')}
          >
            <Text
              className={`font-medium ${
                filter === 'unread' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={onMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons 
                name="checkmark-done-outline" 
                size={16} 
                color={unreadCount > 0 ? "#2D5016" : "#9CA3AF"} 
              />
              <Text
                className={`ml-2 font-medium ${
                  unreadCount > 0 ? 'text-forest-green' : 'text-gray-400'
                }`}
              >
                Mark all as read
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center"
              onPress={onClearAll}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text className="ml-2 font-medium text-red-500">
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </Modal>
  );
};

export default NotificationCenter;