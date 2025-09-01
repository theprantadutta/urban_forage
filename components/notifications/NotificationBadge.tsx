import React from 'react';
import { Animated, Text } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  className?: string;
  animated?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'medium',
  color = '#EF4444',
  textColor = '#FFFFFF',
  className = '',
  animated = true,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated && count > 0) {
      Animated.sequence([
        Animated.spring(animatedValue, {
          toValue: 1.2,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animatedValue.setValue(count > 0 ? 1 : 0);
    }
  }, [count, animated, animatedValue]);

  if (count <= 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeStyles = {
    small: {
      container: 'min-w-[16px] h-4 px-1',
      text: 'text-xs',
    },
    medium: {
      container: 'min-w-[20px] h-5 px-1.5',
      text: 'text-xs',
    },
    large: {
      container: 'min-w-[24px] h-6 px-2',
      text: 'text-sm',
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <Animated.View
      className={`${currentSize.container} rounded-full items-center justify-center ${className}`}
      style={{
        backgroundColor: color,
        transform: [{ scale: animatedValue }],
      }}
    >
      <Text
        className={`${currentSize.text} font-bold`}
        style={{ color: textColor }}
        numberOfLines={1}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
};

export default NotificationBadge;