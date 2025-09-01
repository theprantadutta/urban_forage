import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { FoodListing } from '../components/map/FoodMarker';
import { logFirebaseOperation } from '../utils/firebase';

// Notification types
export enum NotificationType {
  NEW_NEARBY_LISTING = 'new_nearby_listing',
  LISTING_EXPIRING = 'listing_expiring',
  LISTING_RESERVED = 'listing_reserved',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

// Notification data interface
export interface NotificationData extends Record<string, unknown> {
  type: NotificationType;
  listingId?: string;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  newNearbyListings: boolean;
  expiringListings: boolean;
  reservedListings: boolean;
  messages: boolean;
  systemAnnouncements: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  maxDistance: number; // in kilometers
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  newNearbyListings: true,
  expiringListings: true,
  reservedListings: true,
  messages: true,
  systemAnnouncements: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  maxDistance: 5,
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification: Notifications.Notification) => {
    const preferences = await getNotificationPreferences();
    
    // Check if notifications are enabled
    if (!preferences.enabled) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    // Check quiet hours
    if (preferences.quietHours.enabled && isInQuietHours(preferences.quietHours)) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: true,
        shouldShowBanner: false,
        shouldShowList: true,
      };
    }

    // Check notification type preferences
    const notificationData = notification.request.content.data as unknown as NotificationData;
    const shouldShow = shouldShowNotification(notificationData?.type, preferences);

    return {
      shouldShowAlert: shouldShow,
      shouldPlaySound: shouldShow,
      shouldSetBadge: true,
      shouldShowBanner: shouldShow,
      shouldShowList: shouldShow,
    };
  },
});

/**
 * Register for push notifications
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    logFirebaseOperation('registerForPushNotifications', { platform: Platform.OS });

    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permissions not granted');
      return null;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    logFirebaseOperation('pushTokenObtained', { token: token.data });

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'UrbanForage',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D5016',
        sound: 'default',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('nearby_listings', {
        name: 'Nearby Food Listings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#87A96B',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('expiring_listings', {
        name: 'Expiring Listings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#F59E0B',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
  notificationData: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> => {
  try {
    const preferences = await getNotificationPreferences();
    
    if (!preferences.enabled || !shouldShowNotification(notificationData.type, preferences)) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null,
    });

    logFirebaseOperation('localNotificationScheduled', { 
      identifier, 
      type: notificationData.type 
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return null;
  }
};

/**
 * Send notification for new nearby listing
 */
export const notifyNewNearbyListing = async (
  listing: FoodListing,
  userLocation: { latitude: number; longitude: number }
): Promise<void> => {
  const preferences = await getNotificationPreferences();
  
  if (!preferences.newNearbyListings) return;

  // Check if listing is within notification distance
  const distance = parseFloat(listing.distance?.replace(/[^\d.]/g, '') || '999');
  const distanceKm = listing.distance?.includes('m') ? distance / 1000 : distance;
  
  if (distanceKm > preferences.maxDistance) return;

  const notificationData: NotificationData = {
    type: NotificationType.NEW_NEARBY_LISTING,
    listingId: listing.id,
    title: '🍎 New food nearby!',
    body: `${listing.title} is available ${listing.distance} away`,
    data: { listing },
  };

  await scheduleLocalNotification(notificationData);
};

/**
 * Send notification for expiring listing
 */
export const notifyExpiringListing = async (listing: FoodListing): Promise<void> => {
  const preferences = await getNotificationPreferences();
  
  if (!preferences.expiringListings) return;

  const notificationData: NotificationData = {
    type: NotificationType.LISTING_EXPIRING,
    listingId: listing.id,
    title: '⏰ Food expiring soon!',
    body: `${listing.title} expires ${listing.expiresAt}`,
    data: { listing },
  };

  await scheduleLocalNotification(notificationData);
};

/**
 * Send notification for reserved listing
 */
export const notifyListingReserved = async (listing: FoodListing): Promise<void> => {
  const preferences = await getNotificationPreferences();
  
  if (!preferences.reservedListings) return;

  const notificationData: NotificationData = {
    type: NotificationType.LISTING_RESERVED,
    listingId: listing.id,
    title: '✅ Listing reserved!',
    body: `Your request for ${listing.title} has been accepted`,
    data: { listing },
  };

  await scheduleLocalNotification(notificationData);
};

/**
 * Send notification for new message
 */
export const notifyNewMessage = async (
  senderName: string,
  message: string,
  listingId?: string
): Promise<void> => {
  const preferences = await getNotificationPreferences();
  
  if (!preferences.messages) return;

  const notificationData: NotificationData = {
    type: NotificationType.MESSAGE_RECEIVED,
    listingId,
    title: `💬 Message from ${senderName}`,
    body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
    data: { senderName, listingId },
  };

  await scheduleLocalNotification(notificationData);
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    logFirebaseOperation('allNotificationsCleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Clear notifications by type
 */
export const clearNotificationsByType = async (type: NotificationType): Promise<void> => {
  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    const identifiers = notifications
      .filter((notification: Notifications.Notification) => {
        const data = notification.request.content.data as unknown as NotificationData;
        return data.type === type;
      })
      .map((notification: Notifications.Notification) => notification.request.identifier);

    if (identifiers.length > 0) {
      await Notifications.dismissNotificationAsync(identifiers[0]);
      logFirebaseOperation('notificationsClearedByType', { type, count: identifiers.length });
    }
  } catch (error) {
    console.error('Error clearing notifications by type:', error);
  }
};

/**
 * Get notification preferences from storage
 */
const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    // In a real app, this would come from AsyncStorage or user preferences
    // For now, return default preferences
    return DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
};

/**
 * Check if current time is in quiet hours
 */
const isInQuietHours = (quietHours: { start: string; end: string }): boolean => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const [startHour, startMinute] = quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = quietHours.end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (startMinutes <= endMinutes) {
    // Same day quiet hours (e.g., 14:00 - 18:00)
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight quiet hours (e.g., 22:00 - 08:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

/**
 * Check if notification should be shown based on type and preferences
 */
const shouldShowNotification = (
  type: NotificationType,
  preferences: NotificationPreferences
): boolean => {
  switch (type) {
    case NotificationType.NEW_NEARBY_LISTING:
      return preferences.newNearbyListings;
    case NotificationType.LISTING_EXPIRING:
      return preferences.expiringListings;
    case NotificationType.LISTING_RESERVED:
      return preferences.reservedListings;
    case NotificationType.MESSAGE_RECEIVED:
      return preferences.messages;
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return preferences.systemAnnouncements;
    default:
      return true;
  }
};

export default {
  registerForPushNotifications,
  scheduleLocalNotification,
  notifyNewNearbyListing,
  notifyExpiringListing,
  notifyListingReserved,
  notifyNewMessage,
  clearAllNotifications,
  clearNotificationsByType,
};