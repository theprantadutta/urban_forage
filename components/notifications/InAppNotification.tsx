import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NotificationData, NotificationType } from '../../services/notifications';

const { width: screenWidth } = Dimensions.get('window');

interface InAppNotificationProps {
  notification: NotificationData;
  visible: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  autoHideDuration?: number;
  position?: 'top' | 'bottom';
}

export const InAppNotification: React.FC<InAppNotificationProps> = ({
  notification,
  visible,
  onPress,
  onDismiss,
  autoHideDuration = 4000,
  position = 'top',
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(position === 'top' ? -200 : 200)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showNotification = React.useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration
    if (autoHideDuration > 0) {
      autoHideTimer.current = setTimeout(() => {
        if (autoHideTimer.current) {
          clearTimeout(autoHideTimer.current);
          autoHideTimer.current = null;
        }

        Animated.parallel([
          Animated.spring(translateY, {
            toValue: position === 'top' ? -200 : 200,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 0.9,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss?.();
        });
      }, autoHideDuration);
    }
  }, [translateY, opacity, scale, autoHideDuration, position, onDismiss]);

  const hideNotification = React.useCallback(() => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: position === 'top' ? -200 : 200,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 0.9,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [translateY, opacity, scale, position, onDismiss]);

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, velocityX, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      translateX.setValue(translationX);
    } else if (state === State.END) {
      const shouldDismiss = Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 1000;

      if (shouldDismiss) {
        Animated.timing(translateX, {
          toValue: translationX > 0 ? screenWidth : -screenWidth,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          hideNotification();
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
    hideNotification();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hideNotification();
  };

  useEffect(() => {
    if (visible) {
      showNotification();
    } else {
      hideNotification();
    }

    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }
    };
  }, [visible, showNotification, hideNotification]);

  if (!visible) {
    return null;
  }

  const iconColor = getNotificationColor(notification.type);
  const topOffset = position === 'top' ? insets.top + 8 : undefined;
  const bottomOffset = position === 'bottom' ? insets.bottom + 8 : undefined;

  return (
    <View
      className="absolute left-0 right-0 z-50 px-4"
      style={{
        top: topOffset,
        bottom: bottomOffset,
      }}
      pointerEvents="box-none"
    >
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View
          className="bg-white rounded-2xl shadow-2xl border border-gray-100"
          style={{
            transform: [
              { translateY },
              { translateX },
              { scale },
            ],
            opacity,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={handlePress}
            activeOpacity={0.9}
          >
            {/* Icon */}
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Ionicons
                name={getNotificationIcon(notification.type)}
                size={24}
                color={iconColor}
              />
            </View>

            {/* Content */}
            <View className="flex-1 min-w-0">
              <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
                {notification.title}
              </Text>
              <Text className="text-gray-600 text-sm leading-5" numberOfLines={2}>
                {notification.body}
              </Text>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center ml-2"
              onPress={handleDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Progress Bar */}
          {autoHideDuration > 0 && (
            <View className="h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <Animated.View
                className="h-full rounded-b-2xl"
                style={{
                  backgroundColor: iconColor,
                  width: '100%',
                  transform: [
                    {
                      scaleX: opacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                }}
              />
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default InAppNotification;