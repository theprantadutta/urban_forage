import React from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ScreenTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'horizontal' | 'vertical';
  type?: 'slide' | 'fade' | 'scale' | 'push';
  onTransitionComplete?: () => void;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  isActive,
  direction = 'horizontal',
  type = 'slide',
  onTransitionComplete,
}) => {
  const translateX = useSharedValue(isActive ? 0 : screenWidth);
  const translateY = useSharedValue(isActive ? 0 : screenHeight);
  const opacity = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(isActive ? 1 : 0.8);

  React.useEffect(() => {
    const config = {
      damping: 20,
      stiffness: 200,
    };

    switch (type) {
      case 'slide':
        if (direction === 'horizontal') {
          translateX.value = withSpring(isActive ? 0 : screenWidth, config, (finished) => {
            if (finished && onTransitionComplete) {
              runOnJS(onTransitionComplete)();
            }
          });
        } else {
          translateY.value = withSpring(isActive ? 0 : screenHeight, config, (finished) => {
            if (finished && onTransitionComplete) {
              runOnJS(onTransitionComplete)();
            }
          });
        }
        break;
      case 'fade':
        opacity.value = withTiming(isActive ? 1 : 0, { duration: 300 }, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        });
        break;
      case 'scale':
        scale.value = withSpring(isActive ? 1 : 0.8, config, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        });
        opacity.value = withTiming(isActive ? 1 : 0, { duration: 300 });
        break;
      case 'push':
        translateX.value = withSpring(isActive ? 0 : screenWidth * 0.3, config);
        scale.value = withSpring(isActive ? 1 : 0.9, config, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        });
        break;
    }
  }, [isActive, direction, type, onTransitionComplete, translateX, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'slide':
        return {
          transform: [
            { translateX: direction === 'horizontal' ? translateX.value : 0 },
            { translateY: direction === 'vertical' ? translateY.value : 0 },
          ],
        };
      case 'fade':
        return {
          opacity: opacity.value,
        };
      case 'scale':
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };
      case 'push':
        return {
          transform: [
            { translateX: translateX.value },
            { scale: scale.value },
          ],
        };
      default:
        return {};
    }
  });

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface SharedElementTransitionProps {
  children: React.ReactNode;
  sharedId: string;
  isSource?: boolean;
}

export const SharedElementTransition: React.FC<SharedElementTransitionProps> = ({
  children,
  sharedId,
  isSource = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const startTransition = () => {
    'worklet';
    if (isSource) {
      scale.value = withSpring(0.8, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    } else {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 200 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      });
    }
  };

  return (
    <Animated.View style={[animatedStyle]} onTouchStart={startTransition}>
      {children}
    </Animated.View>
  );
};

interface GestureNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const GestureNavigation: React.FC<GestureNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Add resistance effect
      const resistance = 0.5;
      if (Math.abs(event.translationX) > threshold) {
        translateX.value = event.translationX * resistance;
      }
      if (Math.abs(event.translationY) > threshold) {
        translateY.value = event.translationY * resistance;
      }
      
      // Update opacity based on gesture progress
      const progress = Math.max(
        Math.abs(event.translationX) / screenWidth,
        Math.abs(event.translationY) / screenHeight
      );
      opacity.value = 1 - progress * 0.3;
    })
    .onEnd((event) => {
      const velocityThreshold = 500;
      const distanceThreshold = threshold;
      
      // Check for swipe gestures
      if (
        event.velocityX > velocityThreshold || 
        event.translationX > distanceThreshold
      ) {
        if (onSwipeRight) {
          runOnJS(onSwipeRight)();
        }
      } else if (
        event.velocityX < -velocityThreshold || 
        event.translationX < -distanceThreshold
      ) {
        if (onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else if (
        event.velocityY > velocityThreshold || 
        event.translationY > distanceThreshold
      ) {
        if (onSwipeDown) {
          runOnJS(onSwipeDown)();
        }
      } else if (
        event.velocityY < -velocityThreshold || 
        event.translationY < -distanceThreshold
      ) {
        if (onSwipeUp) {
          runOnJS(onSwipeUp)();
        }
      }
      
      // Reset position
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Custom hook for screen transitions
export const useScreenTransition = (isVisible: boolean) => {
  const translateX = useSharedValue(isVisible ? 0 : screenWidth);
  const opacity = useSharedValue(isVisible ? 1 : 0);
  const scale = useSharedValue(isVisible ? 1 : 0.9);

  React.useEffect(() => {
    translateX.value = withSpring(isVisible ? 0 : screenWidth, {
      damping: 20,
      stiffness: 200,
    });
    opacity.value = withTiming(isVisible ? 1 : 0, { duration: 300 });
    scale.value = withSpring(isVisible ? 1 : 0.9, {
      damping: 15,
      stiffness: 200,
    });
  }, [isVisible, translateX, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return { animatedStyle };
};

// Page transition configurations for different screen types
export const pageTransitions = {
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
                extrapolate: Extrapolate.CLAMP,
              }),
            },
          ],
        },
      };
    },
  },
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
                extrapolate: Extrapolate.CLAMP,
              }),
            },
          ],
        },
      };
    },
  },
  fadeIn: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },
  scaleFromCenter: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
                extrapolate: Extrapolate.CLAMP,
              }),
            },
          ],
        },
      };
    },
  },
};