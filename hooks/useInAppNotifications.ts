import { useCallback, useEffect, useState } from "react";
import type { NotificationData } from "../services/notifications";

interface NotificationItem extends NotificationData {
  id: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

interface InAppNotificationState {
  currentNotification: NotificationData | null;
  notificationHistory: NotificationItem[];
  unreadCount: number;
}

interface UseInAppNotificationsOptions {
  maxHistorySize?: number;
  autoHideDuration?: number;
}

export const useInAppNotifications = (
  options: UseInAppNotificationsOptions = {}
) => {
  const { maxHistorySize = 100, autoHideDuration = 4000 } = options;

  const [state, setState] = useState<InAppNotificationState>({
    currentNotification: null,
    notificationHistory: [],
    unreadCount: 0,
  });

  // Show a new in-app notification
  const showNotification = useCallback(
    (notification: NotificationData, avatar?: string) => {
      const notificationItem: NotificationItem = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
        avatar,
      };

      setState((prev) => ({
        ...prev,
        currentNotification: notification,
        notificationHistory: [
          notificationItem,
          ...prev.notificationHistory.slice(0, maxHistorySize - 1),
        ],
        unreadCount: prev.unreadCount + 1,
      }));

      // Auto-hide after duration
      if (autoHideDuration > 0) {
        setTimeout(() => {
          hideCurrentNotification();
        }, autoHideDuration);
      }
    },
    [autoHideDuration, maxHistorySize]
  );

  // Hide the current notification
  const hideCurrentNotification = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentNotification: null,
    }));
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notificationHistory: prev.notificationHistory.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notificationHistory: prev.notificationHistory.map((notification) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    }));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setState({
      currentNotification: null,
      notificationHistory: [],
      unreadCount: 0,
    });
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setState((prev) => {
      const notification = prev.notificationHistory.find(
        (n) => n.id === notificationId
      );
      const wasUnread = notification && !notification.read;

      return {
        ...prev,
        notificationHistory: prev.notificationHistory.filter(
          (n) => n.id !== notificationId
        ),
        unreadCount: wasUnread
          ? Math.max(0, prev.unreadCount - 1)
          : prev.unreadCount,
      };
    });
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: string) => {
      return state.notificationHistory.filter(
        (notification) => notification.type === type
      );
    },
    [state.notificationHistory]
  );

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return state.notificationHistory.filter(
      (notification) => !notification.read
    );
  }, [state.notificationHistory]);

  // Show notification for new nearby listing
  const showNewListingNotification = useCallback(
    (listing: any) => {
      showNotification({
        type: "new_nearby_listing" as any,
        listingId: listing.id,
        title: "🍎 New food nearby!",
        body: `${listing.title} is available ${listing.distance} away`,
        data: { listing },
      });
    },
    [showNotification]
  );

  // Show notification for expiring listing
  const showExpiringListingNotification = useCallback(
    (listing: any) => {
      showNotification({
        type: "listing_expiring" as any,
        listingId: listing.id,
        title: "⏰ Food expiring soon!",
        body: `${listing.title} expires ${listing.expiresAt}`,
        data: { listing },
      });
    },
    [showNotification]
  );

  // Show notification for reserved listing
  const showReservedListingNotification = useCallback(
    (listing: any) => {
      showNotification({
        type: "listing_reserved" as any,
        listingId: listing.id,
        title: "✅ Listing reserved!",
        body: `Your request for ${listing.title} has been accepted`,
        data: { listing },
      });
    },
    [showNotification]
  );

  // Show notification for new message
  const showMessageNotification = useCallback(
    (
      senderName: string,
      message: string,
      avatar?: string,
      listingId?: string
    ) => {
      showNotification(
        {
          type: "message_received" as any,
          listingId,
          title: `💬 Message from ${senderName}`,
          body:
            message.length > 50 ? `${message.substring(0, 50)}...` : message,
          data: { senderName, listingId },
        },
        avatar
      );
    },
    [showNotification]
  );

  // Show system announcement
  const showSystemAnnouncement = useCallback(
    (title: string, body: string) => {
      showNotification({
        type: "system_announcement" as any,
        title,
        body,
        data: {},
      });
    },
    [showNotification]
  );

  // Load notifications from storage (mock implementation)
  const loadNotifications = useCallback(async () => {
    try {
      // In a real app, this would load from AsyncStorage or API
      // For now, we'll use mock data
      const mockNotifications: NotificationItem[] = [
        {
          id: "notif_1",
          type: "new_nearby_listing" as any,
          listingId: "listing_1",
          title: "🍎 New food nearby!",
          body: "Fresh apples are available 0.5km away",
          data: {},
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
        },
        {
          id: "notif_2",
          type: "message_received" as any,
          title: "💬 Message from Sarah",
          body: "Hi! Are the vegetables still available?",
          data: { senderName: "Sarah" },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "notif_3",
          type: "listing_expiring" as any,
          listingId: "listing_2",
          title: "⏰ Food expiring soon!",
          body: "Bread expires in 2 hours",
          data: {},
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true,
        },
      ];

      setState((prev) => ({
        ...prev,
        notificationHistory: mockNotifications,
        unreadCount: mockNotifications.filter((n) => !n.read).length,
      }));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, []);

  // Save notifications to storage (mock implementation)
  const saveNotifications = useCallback(async () => {
    try {
      // In a real app, this would save to AsyncStorage
      console.log("Saving notifications to storage...");
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Save notifications when state changes
  useEffect(() => {
    saveNotifications();
  }, [state, saveNotifications]);

  return {
    // State
    currentNotification: state.currentNotification,
    notificationHistory: state.notificationHistory,
    unreadCount: state.unreadCount,

    // Actions
    showNotification,
    hideCurrentNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,

    // Helpers
    getNotificationsByType,
    getUnreadNotifications,

    // Convenience methods
    showNewListingNotification,
    showExpiringListingNotification,
    showReservedListingNotification,
    showMessageNotification,
    showSystemAnnouncement,
  };
};

export default useInAppNotifications;
