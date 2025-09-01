import React, { useEffect } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { accessibleHapticFeedback } from '../../utils/accessibility';
import { animationTiming, springConfigs } from '../../utils/appPolish';

// Enhanced pressable with accessibility and haptic feedback
interface EnhancedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  scaleValue?: number;
  hapticFeedback?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
  delayLongPress?: number;
}

export const EnhancedPressable: React.FC<EnhancedPressableProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  scaleValue = 0.95,
  hapticFeedback = true,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  delayLongPress = 500,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const { isReduceMotionEnabled, announceMessage, isScreenReaderEnabled } = useAccessibility();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isReduceMotionEnabled ? 1 : scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = async () => {
    if (hapticFeedback) {
      await accessibleHapticFeedback('impact');
    }
    
    if (isScreenReaderEnabled && accessibilityLabel) {
      announceMessage(`${accessibilityLabel} activated`);
    }
    
    onPress?.();
  };

  const handleLongPress = async () => {
    if (hapticFeedback) {
      await accessibleHapticFeedback('selection');
    }
    
    if (isScreenReaderEnabled && accessibilityLabel) {
      announceMessage(`${accessibilityLabel} long pressed`);
    }
    
    onLongPress?.();
  };

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      if (!isReduceMotionEnabled) {
        scale.value = withSpring(scaleValue, springConfigs.snappy);
        opacity.value = withTiming(0.8, { duration: animationTiming.fast });
      }
    })
    .onFinalize((event) => {
      if (!isReduceMotionEnabled) {
        scale.value = withSpring(1, springConfigs.gentle);
        opacity.value = withTiming(1, { duration: animationTiming.fast });
      }
      
      if (event.state === 5) { // ENDED
        runOnJS(handlePress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(delayLongPress)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const composedGesture = Gesture.Race(gesture, longPressGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View 
        style={[style, animatedStyle]}
        accessible={true}
        accessibilityRole={accessibilityRole as any}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState || { disabled }}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Enhanced floating action button with accessibility
interface EnhancedFloatingActionButtonProps {
  onPress?: () => void;
  icon?: React.ReactNode;
  expanded?: boolean;
  actions?: {
    icon: React.ReactNode;
    onPress: () => void;
    label: string;
    accessibilityLabel?: string;
  }[];
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const EnhancedFloatingActionButton: React.FC<EnhancedFloatingActionButtonProps> = ({
  onPress,
  icon,
  expanded = false,
  actions = [],
  style,
  accessibilityLabel = 'Floating action button',
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const actionScale = useSharedValue(0);
  const actionOpacity = useSharedValue(0);
  const { isReduceMotionEnabled, announceMessage, isScreenReaderEnabled } = useAccessibility();

  useEffect(() => {
    if (expanded) {
      if (isScreenReaderEnabled) {
        announceMessage(`Action menu expanded. ${actions.length} actions available.`);
      }
      
      if (!isReduceMotionEnabled) {
        rotation.value = withSpring(45, springConfigs.bouncy);
        actionScale.value = withSpring(1, springConfigs.gentle);
        actionOpacity.value = withTiming(1, { duration: animationTiming.normal });
      } else {
        rotation.value = 45;
        actionScale.value = 1;
        actionOpacity.value = 1;
      }
    } else {
      if (isScreenReaderEnabled && expanded) {
        announceMessage('Action menu collapsed');
      }
      
      if (!isReduceMotionEnabled) {
        rotation.value = withSpring(0, springConfigs.gentle);
        actionScale.value = withTiming(0, { duration: animationTiming.fast });
        actionOpacity.value = withTiming(0, { duration: animationTiming.fast });
      } else {
        rotation.value = 0;
        actionScale.value = 0;
        actionOpacity.value = 0;
      }
    }
  }, [expanded, rotation, actionScale, actionOpacity, isReduceMotionEnabled, isScreenReaderEnabled, announceMessage, actions.length]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: isReduceMotionEnabled ? 1 : scale.value },
    ],
  }));

  const actionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: actionScale.value }],
    opacity: actionOpacity.value,
  }));

  const handlePress = async () => {
    if (!isReduceMotionEnabled) {
      scale.value = withSequence(
        withTiming(0.9, { duration: animationTiming.fast }),
        withSpring(1, springConfigs.bouncy)
      );
    }
    
    await accessibleHapticFeedback('impact');
    onPress?.();
  };

  const handleActionPress = async (action: typeof actions[0], index: number) => {
    await accessibleHapticFeedback('selection');
    
    if (isScreenReaderEnabled) {
      announceMessage(`${action.accessibilityLabel || action.label} activated`);
    }
    
    action.onPress();
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      {/* Action Items */}
      {actions.map((action, index) => (
        <Animated.View
          key={index}
          style={[
            {
              position: 'absolute',
              bottom: 70 + (index * 60),
              alignItems: 'center',
            },
            actionStyle,
          ]}
        >
          <EnhancedPressable
            onPress={() => handleActionPress(action, index)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#87A96B',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
            accessibilityLabel={action.accessibilityLabel || action.label}
            accessibilityHint={`Action ${index + 1} of ${actions.length}`}
          >
            {action.icon}
          </EnhancedPressable>
          
          {/* Action Label */}
          <View
            style={{
              position: 'absolute',
              right: 60,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
            accessible={true}
            accessibilityRole="text"
          >
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              {action.label}
            </Text>
          </View>
        </Animated.View>
      ))}

      {/* Main Button */}
      <EnhancedPressable 
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={expanded ? 'Double tap to collapse menu' : 'Double tap to expand menu'}
        accessibilityState={{ expanded }}
      >
        <Animated.View
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#2D5016',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 16,
            },
            mainButtonStyle,
          ]}
        >
          {icon}
        </Animated.View>
      </EnhancedPressable>
    </View>
  );
};

// Enhanced shimmer with accessibility
interface EnhancedShimmerProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const EnhancedShimmer: React.FC<EnhancedShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  accessibilityLabel = 'Loading content',
}) => {
  const shimmerTranslate = useSharedValue(-200);
  const { isReduceMotionEnabled } = useAccessibility();

  useEffect(() => {
    if (!isReduceMotionEnabled) {
      shimmerTranslate.value = withRepeat(
        withTiming(200, { duration: 1500 }),
        -1,
        false
      );
    }
  }, [shimmerTranslate, isReduceMotionEnabled]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: isReduceMotionEnabled ? 0 : shimmerTranslate.value }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          overflow: 'hidden',
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

// Enhanced bounce animation with accessibility
interface EnhancedBounceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const EnhancedBounce: React.FC<EnhancedBounceProps> = ({
  children,
  delay = 0,
  duration = 1000,
  style,
  accessibilityLabel,
}) => {
  const bounceValue = useSharedValue(0);
  const { isReduceMotionEnabled } = useAccessibility();

  useEffect(() => {
    if (!isReduceMotionEnabled) {
      bounceValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: duration / 2 }),
            withTiming(0, { duration: duration / 2 })
          ),
          -1,
          true
        )
      );
    }
  }, [delay, duration, bounceValue, isReduceMotionEnabled]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: isReduceMotionEnabled ? 0 : interpolate(
          bounceValue.value,
          [0, 1],
          [0, -10],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View 
      style={[style, bounceStyle]}
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Animated.View>
  );
};

// Enhanced pulse animation with accessibility
interface EnhancedPulseProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  duration?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const EnhancedPulse: React.FC<EnhancedPulseProps> = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 2000,
  style,
  accessibilityLabel,
}) => {
  const pulseValue = useSharedValue(0);
  const { isReduceMotionEnabled } = useAccessibility();

  useEffect(() => {
    if (!isReduceMotionEnabled) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2 }),
          withTiming(0, { duration: duration / 2 })
        ),
        -1,
        true
      );
    }
  }, [duration, pulseValue, isReduceMotionEnabled]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReduceMotionEnabled ? 1 : interpolate(
          pulseValue.value,
          [0, 1],
          [minScale, maxScale],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View 
      style={[style, pulseStyle]}
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Animated.View>
  );
};

export default {
  EnhancedPressable,
  EnhancedFloatingActionButton,
  EnhancedShimmer,
  EnhancedBounce,
  EnhancedPulse,
};