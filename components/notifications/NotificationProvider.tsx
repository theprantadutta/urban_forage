import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useInAppNotifications } from '../../hooks/useInAppNotifications';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationData } from '../../services/notifications';
import type { FoodListing } from '../map/FoodMarker';
import { InAppNotification } from './InAppNotification';
import { NotificationCenter } from './NotificationCenter';

interface NotificationContextType {
  // Push notifications
  pushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isRegistered: boolean;
  registerForNotifications: () => Promise<boolean>;
  clearNotifications: () => Promise<void>;
  
  // In-app notifications
  currentNotification: NotificationData | null;
  notificationHistory: any[];
  unreadCount: number;
  showNotification: (notification: NotificationData, avatar?: string) => void;
  hideCurrentNotification: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  
  // Notification center
  showNotificationCenter: boolean;
  setShowNotificationCenter: (show: boolean) => void;
  
  // Convenience methods
  notifyNewListing: (listing: FoodListing) => Promise<void>;
  notifyExpiring: (listing: FoodListing) => Promise<void>;
  showNewListingNotification: (listing: any) => void;
  showExpiringListingNotification: (listing: any) => void;
  showReservedListingNotification: (listing: any) => void;
  showMessageNotification: (senderName: string, message: string, avatar?: string, listingId?: string) => void;
  showSystemAnnouncement: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userLocation?: { latitude: number; longitude: number };
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userLocation,
}) => {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Push notifications hook
  const pushNotifications = useNotifications({
    userLocation,
    onNotificationReceived: (notification) => {
      console.log('Push notification received:', notification);
      // Convert push notification to in-app notification
      const notificationData = notification.request.content.data as unknown as NotificationData;
      if (notificationData) {
        inAppNotifications.showNotification(notificationData);
      }
    },
    onNotificationResponse: (response) => {
      console.log('Push notification response:', response);
      // Handle notification tap
      const notificationData = response.notification.request.content.data as unknown as NotificationData;
      if (notificationData) {
        // Navigate to appropriate screen based on notification type
        handleNotificationPress(notificationData);
      }
    },
  });

  // In-app notifications hook
  const inAppNotifications = useInAppNotifications({
    maxHistorySize: 100,
    autoHideDuration: 4000,
  });

  const handleNotificationPress = (notification: NotificationData) => {
    // Hide current notification
    inAppNotifications.hideCurrentNotification();
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'new_nearby_listing':
      case 'listing_expiring':
        if (notification.listingId) {
          console.log('Navigate to listing:', notification.listingId);
          // TODO: Navigate to listing detail
        }
        break;
      
      case 'message_received':
        console.log('Navigate to messages');
        // TODO: Navigate to messages
        break;
      
      case 'listing_reserved':
        console.log('Navigate to user listings');
        // TODO: Navigate to user's listings
        break;
      
      case 'system_announcement':
        console.log('Show system announcement');
        // TODO: Show announcement detail
        break;
      
      default:
        console.log('Unknown notification type:', notification.type);
    }
  };

  const handleNotificationCenterPress = (notification: any) => {
    setShowNotificationCenter(false);
    handleNotificationPress(notification);
  };

  // Auto-register for push notifications on mount
  useEffect(() => {
    pushNotifications.registerForNotifications();
  }, [pushNotifications]);

  const contextValue: NotificationContextType = {
    // Push notifications
    pushToken: pushNotifications.pushToken,
    permissionStatus: pushNotifications.permissionStatus,
    isRegistered: pushNotifications.isRegistered,
    registerForNotifications: pushNotifications.registerForNotifications,
    clearNotifications: pushNotifications.clearNotifications,
    
    // In-app notifications
    currentNotification: inAppNotifications.currentNotification,
    notificationHistory: inAppNotifications.notificationHistory,
    unreadCount: inAppNotifications.unreadCount,
    showNotification: inAppNotifications.showNotification,
    hideCurrentNotification: inAppNotifications.hideCurrentNotification,
    markAsRead: inAppNotifications.markAsRead,
    markAllAsRead: inAppNotifications.markAllAsRead,
    clearAll: inAppNotifications.clearAll,
    
    // Notification center
    showNotificationCenter,
    setShowNotificationCenter,
    
    // Convenience methods
    notifyNewListing: pushNotifications.notifyNewListing,
    notifyExpiring: pushNotifications.notifyExpiring,
    showNewListingNotification: inAppNotifications.showNewListingNotification,
    showExpiringListingNotification: inAppNotifications.showExpiringListingNotification,
    showReservedListingNotification: inAppNotifications.showReservedListingNotification,
    showMessageNotification: inAppNotifications.showMessageNotification,
    showSystemAnnouncement: inAppNotifications.showSystemAnnouncement,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* In-app notification overlay */}
      <InAppNotification
        notification={inAppNotifications.currentNotification!}
        visible={!!inAppNotifications.currentNotification}
        onPress={() => handleNotificationPress(inAppNotifications.currentNotification!)}
        onDismiss={inAppNotifications.hideCurrentNotification}
        position="top"
      />
      
      {/* Notification center modal */}
      <NotificationCenter
        visible={showNotificationCenter}
        notifications={inAppNotifications.notificationHistory}
        onClose={() => setShowNotificationCenter(false)}
        onNotificationPress={handleNotificationCenterPress}
        onMarkAsRead={inAppNotifications.markAsRead}
        onMarkAllAsRead={inAppNotifications.markAllAsRead}
        onClearAll={inAppNotifications.clearAll}
      />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;