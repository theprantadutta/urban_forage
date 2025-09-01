import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodListing } from '../components/map/FoodMarker';
import {
    clearAllNotifications,
    NotificationType,
    notifyExpiringListing,
    notifyNewNearbyListing,
    registerForPushNotifications,
    type NotificationData,
} from '../services/notifications';

interface UseNotificationsOptions {
  userLocation?: { latitude: number; longitude: number };
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
}

interface UseNotificationsReturn {
  pushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isRegistered: boolean;
  registerForNotifications: () => Promise<boolean>;
  clearNotifications: () => Promise<void>;
  notifyNewListing: (listing: FoodListing) => Promise<void>;
  notifyExpiring: (listing: FoodListing) => Promise<void>;
}

/**
 * Custom hook for managing push notifications
 */
export const useNotifications = ({
  userLocation,
  onNotificationReceived,
  onNotificationResponse,
}: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const notificationListener = useRef<Subscription | undefined>(undefined);
  const responseListener = useRef<Subscription | undefined>(undefined);

  // Register for push notifications
  const registerForNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const token = await registerForPushNotifications();
      
      if (token) {
        setPushToken(token);
        setIsRegistered(true);
        
        // Get current permission status
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering for notifications:', error);
      return false;
    }
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(async (): Promise<void> => {
    await clearAllNotifications();
  }, []);

  // Notify about new nearby listing
  const notifyNewListing = useCallback(async (listing: FoodListing): Promise<void> => {
    if (userLocation) {
      await notifyNewNearbyListing(listing, userLocation);
    }
  }, [userLocation]);

  // Notify about expiring listing
  const notifyExpiring = useCallback(async (listing: FoodListing): Promise<void> => {
    await notifyExpiringListing(listing);
  }, []);

  // Handle notification received while app is in foreground
  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  }, [onNotificationReceived]);

  // Handle notification response (user tapped notification)
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
    
    const notificationData = response.notification.request.content.data as unknown as NotificationData;
    
    // Handle different notification types
    switch (notificationData.type) {
      case NotificationType.NEW_NEARBY_LISTING:
      case NotificationType.LISTING_EXPIRING:
        // Navigate to listing detail
        if (notificationData.listingId) {
          console.log('Navigate to listing:', notificationData.listingId);
        }
        break;
      
      case NotificationType.MESSAGE_RECEIVED:
        // Navigate to messages
        console.log('Navigate to messages');
        break;
      
      case NotificationType.LISTING_RESERVED:
        // Navigate to user's listings
        console.log('Navigate to user listings');
        break;
      
      default:
        console.log('Unknown notification type:', notificationData.type);
    }
    
    onNotificationResponse?.(response);
  }, [onNotificationResponse]);

  // Set up notification listeners
  useEffect(() => {
    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleNotificationReceived, handleNotificationResponse]);

  // Check initial permission status
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    };

    checkPermissions();
  }, []);

  // Auto-register for notifications if permissions are granted
  useEffect(() => {
    if (permissionStatus === 'granted' && !isRegistered) {
      registerForNotifications();
    }
  }, [permissionStatus, isRegistered, registerForNotifications]);

  return {
    pushToken,
    permissionStatus,
    isRegistered,
    registerForNotifications,
    clearNotifications,
    notifyNewListing,
    notifyExpiring,
  };
};

export default useNotifications;