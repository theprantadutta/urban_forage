import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Variant styles
  const getVariantClasses = () => {
    const baseClasses = 'rounded-full items-center justify-center flex-row';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-forest-green shadow-lg`;
      case 'secondary':
        return `${baseClasses} bg-sage-green shadow-md`;
      case 'outline':
        return `${baseClasses} border-2 border-forest-green bg-transparent`;
      case 'ghost':
        return `${baseClasses} bg-transparent`;
      default:
        return `${baseClasses} bg-forest-green shadow-lg`;
    }
  };

  // Size styles
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 min-h-[36px]';
      case 'medium':
        return 'px-6 py-3 min-h-[44px]';
      case 'large':
        return 'px-8 py-4 min-h-[52px]';
      default:
        return 'px-6 py-3 min-h-[44px]';
    }
  };

  // Text variant styles
  const getTextVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-white font-semibold';
      case 'secondary':
        return 'text-white font-semibold';
      case 'outline':
        return 'text-forest-green font-semibold';
      case 'ghost':
        return 'text-forest-green font-medium';
      default:
        return 'text-white font-semibold';
    }
  };

  // Text size styles
  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const buttonClasses = `${getVariantClasses()} ${getSizeClasses()} ${
    disabled || loading ? 'opacity-50' : ''
  } ${className}`;

  const textClasses = `${getTextVariantClasses()} ${getTextSizeClasses()}`;

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, style]}
      className={buttonClasses}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#2D5016' : '#FFFFFF'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={textClasses} style={textStyle}>
        {title}
      </Text>
    </AnimatedTouchableOpacity>
  );
};