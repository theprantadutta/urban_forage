import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NotificationPreferences as NotificationPreferencesType } from '../../services/notifications';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../services/notifications';

interface NotificationPreferencesProps {
  preferences?: NotificationPreferencesType;
  onPreferencesChange?: (preferences: NotificationPreferencesType) => void;
  onClose?: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences = DEFAULT_NOTIFICATION_PREFERENCES,
  onPreferencesChange,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [currentPreferences, setCurrentPreferences] = useState<NotificationPreferencesType>(preferences);

  const updatePreference = <K extends keyof NotificationPreferencesType>(
    key: K,
    value: NotificationPreferencesType[K]
  ) => {
    const newPreferences = { ...currentPreferences, [key]: value };
    setCurrentPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    const newQuietHours = { ...currentPreferences.quietHours, [field]: value };
    updatePreference('quietHours', newQuietHours);
  };

  const PreferenceRow: React.FC<{
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ title, description, icon, value, onValueChange, disabled = false }) => (
    <View className="flex-row items-center justify-between py-4 px-4 bg-white rounded-xl mb-3">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-forest-green/10 rounded-full items-center justify-center mr-4">
          <Ionicons name={icon} size={20} color="#2D5016" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">
            {title}
          </Text>
          <Text className="text-gray-600 text-sm leading-5">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || !currentPreferences.enabled}
        trackColor={{ false: '#E5E7EB', true: '#87A96B' }}
        thumbColor={value ? '#2D5016' : '#9CA3AF'}
      />
    </View>
  );

  const DistanceSelector: React.FC = () => {
    const distances = [1, 2, 5, 10, 20];
    
    return (
      <View className="bg-white rounded-xl p-4 mb-3">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-forest-green/10 rounded-full items-center justify-center mr-4">
            <Ionicons name="location-outline" size={20} color="#2D5016" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              Notification Distance
            </Text>
            <Text className="text-gray-600 text-sm">
              Get notified about listings within this distance
            </Text>
          </View>
        </View>
        
        <View className="flex-row flex-wrap gap-2">
          {distances.map((distance) => (
            <TouchableOpacity
              key={distance}
              className={`px-4 py-2 rounded-full border ${
                currentPreferences.maxDistance === distance
                  ? 'bg-forest-green border-forest-green'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => updatePreference('maxDistance', distance)}
              disabled={!currentPreferences.enabled}
            >
              <Text
                className={`font-medium ${
                  currentPreferences.maxDistance === distance
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                {distance}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const QuietHoursSelector: React.FC = () => {
    const hours = Array.from({ length: 24 }, (_, i) => 
      `${i.toString().padStart(2, '0')}:00`
    );

    return (
      <View className="bg-white rounded-xl p-4 mb-3">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-forest-green/10 rounded-full items-center justify-center mr-4">
              <Ionicons name="moon-outline" size={20} color="#2D5016" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base mb-1">
                Quiet Hours
              </Text>
              <Text className="text-gray-600 text-sm">
                Silence notifications during these hours
              </Text>
            </View>
          </View>
          <Switch
            value={currentPreferences.quietHours.enabled}
            onValueChange={(value) => updateQuietHours('enabled', value)}
            disabled={!currentPreferences.enabled}
            trackColor={{ false: '#E5E7EB', true: '#87A96B' }}
            thumbColor={currentPreferences.quietHours.enabled ? '#2D5016' : '#9CA3AF'}
          />
        </View>

        {currentPreferences.quietHours.enabled && (
          <View className="space-y-3">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Start Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-2">
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`start-${hour}`}
                      className={`px-3 py-2 rounded-lg border ${
                        currentPreferences.quietHours.start === hour
                          ? 'bg-forest-green border-forest-green'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => updateQuietHours('start', hour)}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          currentPreferences.quietHours.start === hour
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">End Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-2">
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`end-${hour}`}
                      className={`px-3 py-2 rounded-lg border ${
                        currentPreferences.quietHours.end === hour
                          ? 'bg-forest-green border-forest-green'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => updateQuietHours('end', hour)}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          currentPreferences.quietHours.end === hour
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-gray-900 text-xl font-bold">
          Notification Settings
        </Text>
        {onClose && (
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <PreferenceRow
          title="Enable Notifications"
          description="Receive push notifications for food listings and messages"
          icon="notifications-outline"
          value={currentPreferences.enabled}
          onValueChange={(value) => updatePreference('enabled', value)}
        />

        {/* Notification Types */}
        <Text className="text-gray-900 text-lg font-bold mb-4 mt-2">
          Notification Types
        </Text>

        <PreferenceRow
          title="New Nearby Listings"
          description="Get notified when new food becomes available near you"
          icon="location-outline"
          value={currentPreferences.newNearbyListings}
          onValueChange={(value) => updatePreference('newNearbyListings', value)}
        />

        <PreferenceRow
          title="Expiring Listings"
          description="Reminders about food that's about to expire"
          icon="time-outline"
          value={currentPreferences.expiringListings}
          onValueChange={(value) => updatePreference('expiringListings', value)}
        />

        <PreferenceRow
          title="Reserved Listings"
          description="Updates when your food requests are accepted"
          icon="checkmark-circle-outline"
          value={currentPreferences.reservedListings}
          onValueChange={(value) => updatePreference('reservedListings', value)}
        />

        <PreferenceRow
          title="Messages"
          description="New messages from other community members"
          icon="chatbubble-outline"
          value={currentPreferences.messages}
          onValueChange={(value) => updatePreference('messages', value)}
        />

        <PreferenceRow
          title="System Announcements"
          description="Important updates and community announcements"
          icon="megaphone-outline"
          value={currentPreferences.systemAnnouncements}
          onValueChange={(value) => updatePreference('systemAnnouncements', value)}
        />

        {/* Distance Settings */}
        <Text className="text-gray-900 text-lg font-bold mb-4 mt-6">
          Distance Settings
        </Text>
        <DistanceSelector />

        {/* Quiet Hours */}
        <Text className="text-gray-900 text-lg font-bold mb-4 mt-6">
          Quiet Hours
        </Text>
        <QuietHoursSelector />

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default NotificationPreferences;