import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
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
import { animationTiming, microInteractions, springConfigs } from '../../utils/appPolish';

// Pressable with scale animation and haptic feedback
interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  scaleValue?: number;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  scaleValue = 0.95,
  hapticFeedback = true,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(scaleValue, springConfigs.snappy);
      opacity.value = withTiming(0.8, { duration: animationTiming.fast });
    })
    .onFinalize((event) => {
      scale.value = withSpring(1, springConfigs.gentle);
      opacity.value = withTiming(1, { duration: animationTiming.fast });
      
      if (event.state === 5) { // ENDED
        if (hapticFeedback) {
          runOnJS(microInteractions.buttonPress)();
        }
        if (onPress) {
          runOnJS(onPress)();
        }
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      if (hapticFeedback) {
        runOnJS(microInteractions.selection)();
      }
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  const composedGesture = Gesture.Race(gesture, longPressGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Floating action button with expand animation
interface FloatingActionButtonProps {
  onPress?: () => void;
  icon?: React.ReactNode;
  expanded?: boolean;
  actions?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  }[];
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  expanded = false,
  actions = [],
  style,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const actionScale = useSharedValue(0);
  const actionOpacity = useSharedValue(0);

  useEffect(() => {
    if (expanded) {
      rotation.value = withSpring(45, springConfigs.bouncy);
      actionScale.value = withSpring(1, springConfigs.gentle);
      actionOpacity.value = withTiming(1, { duration: animationTiming.normal });
    } else {
      rotation.value = withSpring(0, springConfigs.gentle);
      actionScale.value = withTiming(0, { duration: animationTiming.fast });
      actionOpacity.value = withTiming(0, { duration: animationTiming.fast });
    }
  }, [expanded, rotation, actionScale, actionOpacity]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const actionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: actionScale.value }],
    opacity: actionOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: animationTiming.fast }),
      withSpring(1, springConfigs.bouncy)
    );
    microInteractions.buttonPress();
    onPress?.();
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
          <PressableScale
            onPress={action.onPress}
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
          >
            {action.icon}
          </PressableScale>
          {action.label && (
            <View
              style={{
                position: 'absolute',
                right: 60,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Animated.Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {action.label}
              </Animated.Text>
            </View>
          )}
        </Animated.View>
      ))}

      {/* Main Button */}
      <PressableScale onPress={handlePress}>
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
      </PressableScale>
    </View>
  );
};

// Shimmer loading effect
interface ShimmerProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerTranslate = useSharedValue(-200);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(200, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmerTranslate]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
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

// Bounce animation wrapper
interface BounceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  delay = 0,
  duration = 1000,
  style,
}) => {
  const bounceValue = useSharedValue(0);

  useEffect(() => {
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
  }, [delay, duration, bounceValue]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          bounceValue.value,
          [0, 1],
          [0, -10],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[style, bounceStyle]}>
      {children}
    </Animated.View>
  );
};

// Pulse animation wrapper
interface PulseProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  duration?: number;
  style?: ViewStyle;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 2000,
  style,
}) => {
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      ),
      -1,
      true
    );
  }, [duration, pulseValue]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          pulseValue.value,
          [0, 1],
          [minScale, maxScale],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[style, pulseStyle]}>
      {children}
    </Animated.View>
  );
};

// Slide in animation
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  distance = 50,
  delay = 0,
  duration = animationTiming.normal,
  style,
}) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    translateY.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration, distance, translateX, translateY, opacity]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, slideStyle]}>
      {children}
    </Animated.View>
  );
};

// Fade in animation
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = animationTiming.normal,
  style,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, fadeStyle]}>
      {children}
    </Animated.View>
  );
};

export default {
  PressableScale,
  FloatingActionButton,
  Shimmer,
  Bounce,
  Pulse,
  SlideIn,
  FadeIn,
};