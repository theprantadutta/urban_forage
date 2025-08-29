import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glassmorphism' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  className = '',
  style,
  interactive = false,
}) => {
  const scale = useSharedValue(1);
  const isInteractive = interactive || !!onPress;

  const handlePressIn = () => {
    if (isInteractive) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 300,
      });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (isInteractive) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePress = () => {
    if (onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Variant styles
  const getVariantClasses = () => {
    const baseClasses = 'rounded-2xl overflow-hidden';
    
    switch (variant) {
      case 'default':
        return `${baseClasses} bg-white dark:bg-gray-800 shadow-md`;
      case 'glassmorphism':
        return `${baseClasses} bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30`;
      case 'elevated':
        return `${baseClasses} bg-white dark:bg-gray-800 shadow-xl`;
      default:
        return `${baseClasses} bg-white dark:bg-gray-800 shadow-md`;
    }
  };

  // Padding styles
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-3';
      case 'medium':
        return 'p-4';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const cardClasses = `${getVariantClasses()} ${getPaddingClasses()} ${className}`;

  // For glassmorphism variant, we need to use BlurView
  if (variant === 'glassmorphism') {
    const CardComponent = isInteractive ? AnimatedTouchableOpacity : AnimatedView;
    
    return (
      <CardComponent
        style={[animatedStyle, style]}
        className={cardClasses}
        onPressIn={isInteractive ? handlePressIn : undefined}
        onPressOut={isInteractive ? handlePressOut : undefined}
        onPress={isInteractive ? handlePress : undefined}
        activeOpacity={isInteractive ? 0.9 : 1}
      >
        <BlurView
          intensity={20}
          tint="light"
          className="absolute inset-0 rounded-2xl"
        />
        <View className="relative z-10">
          {children}
        </View>
      </CardComponent>
    );
  }

  // For default and elevated variants
  const CardComponent = isInteractive ? AnimatedTouchableOpacity : AnimatedView;
  
  return (
    <CardComponent
      style={[animatedStyle, style]}
      className={cardClasses}
      onPressIn={isInteractive ? handlePressIn : undefined}
      onPressOut={isInteractive ? handlePressOut : undefined}
      onPress={isInteractive ? handlePress : undefined}
      activeOpacity={isInteractive ? 0.9 : 1}
    >
      {children}
    </CardComponent>
  );
};