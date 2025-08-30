import React, { forwardRef, useEffect } from 'react';
import { Text, TextProps, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import {
    useEntranceAnimation,
    useFadeAnimation,
    useScaleAnimation,
    useSlideAnimation
} from '../../hooks/useAnimations';
import { usePressAnimation } from '../../hooks/useGestures';
import { useTheme } from '../../providers/ThemeProvider';

// Animated View with entrance animation
interface AnimatedViewProps extends ViewProps {
  children: React.ReactNode;
  entrance?: 'fade' | 'slide' | 'scale' | 'combined';
  delay?: number;
  duration?: number;
}

export const AnimatedView = forwardRef<View, AnimatedViewProps>(({
  children,
  entrance = 'fade',
  delay = 0,
  duration = 300,
  style,
  ...props
}, ref) => {
  const fadeAnim = useFadeAnimation(0);
  const slideAnim = useSlideAnimation(30);
  const scaleAnim = useScaleAnimation(0.9);
  const entranceAnim = useEntranceAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      switch (entrance) {
        case 'fade':
          fadeAnim.fadeIn(duration);
          break;
        case 'slide':
          slideAnim.slideIn();
          break;
        case 'scale':
          scaleAnim.scaleIn();
          break;
        case 'combined':
          entranceAnim.enter();
          break;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [entrance, delay, duration, fadeAnim, slideAnim, scaleAnim, entranceAnim]);

  const getAnimatedStyle = () => {
    switch (entrance) {
      case 'fade':
        return fadeAnim.animatedStyle;
      case 'slide':
        return slideAnim.animatedStyle;
      case 'scale':
        return scaleAnim.animatedStyle;
      case 'combined':
        return entranceAnim.animatedStyle;
      default:
        return {};
    }
  };

  return (
    <Animated.View
      ref={ref}
      style={[getAnimatedStyle(), style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
});

AnimatedView.displayName = 'AnimatedView';

// Animated Button with press animations
interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  pressAnimation?: 'scale' | 'opacity' | 'both';
  hapticFeedback?: boolean;
}

export const AnimatedButton = forwardRef<any, AnimatedButtonProps>(({
  children,
  pressAnimation = 'scale',
  hapticFeedback = true,
  style,
  onPressIn,
  onPressOut,
  ...props
}, ref) => {
  const scaleAnim = useScaleAnimation();
  const fadeAnim = useFadeAnimation(1);

  const handlePressIn = (event: any) => {
    if (pressAnimation === 'scale' || pressAnimation === 'both') {
      scaleAnim.pressIn();
    }
    if (pressAnimation === 'opacity' || pressAnimation === 'both') {
      fadeAnim.fadeOut(100);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (pressAnimation === 'scale' || pressAnimation === 'both') {
      scaleAnim.pressOut();
    }
    if (pressAnimation === 'opacity' || pressAnimation === 'both') {
      fadeAnim.fadeIn(100);
    }
    onPressOut?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const styles: any = {};
    
    if (pressAnimation === 'scale' || pressAnimation === 'both') {
      styles.transform = [{ scale: scaleAnim.scale.value }];
    }
    if (pressAnimation === 'opacity' || pressAnimation === 'both') {
      styles.opacity = fadeAnim.opacity.value;
    }
    
    return styles;
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

// Animated Text with typewriter effect
interface AnimatedTextProps extends TextProps {
  children: string;
  typewriter?: boolean;
  typewriterSpeed?: number;
  entrance?: 'fade' | 'slide';
  delay?: number;
}

export const AnimatedText = forwardRef<Text, AnimatedTextProps>(({
  children,
  typewriter = false,
  typewriterSpeed = 50,
  entrance = 'fade',
  delay = 0,
  style,
  ...props
}, ref) => {
  const displayText = useSharedValue('');
  const fadeAnim = useFadeAnimation(0);
  const slideAnim = useSlideAnimation(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (entrance === 'fade') {
        fadeAnim.fadeIn();
      } else if (entrance === 'slide') {
        slideAnim.slideIn();
      }

      if (typewriter) {
        let currentIndex = 0;
        const typewriterTimer = setInterval(() => {
          if (currentIndex <= children.length) {
            displayText.value = children.slice(0, currentIndex);
            currentIndex++;
          } else {
            clearInterval(typewriterTimer);
          }
        }, typewriterSpeed);

        return () => clearInterval(typewriterTimer);
      } else {
        displayText.value = children;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [children, typewriter, typewriterSpeed, delay, entrance, fadeAnim, slideAnim, displayText]);

  const animatedStyle = useAnimatedStyle(() => {
    const styles: any = {};
    
    if (entrance === 'fade') {
      styles.opacity = fadeAnim.opacity.value;
    } else if (entrance === 'slide') {
      styles.transform = [{ translateY: slideAnim.translateY.value }];
    }
    
    return styles;
  });

  // Note: Custom text renderer would be needed for true typewriter effect

  return (
    <Animated.Text
      ref={ref}
      style={[animatedStyle, style]}
      {...props}
    >
      {typewriter ? displayText.value : children}
    </Animated.Text>
  );
});

AnimatedText.displayName = 'AnimatedText';

// Simple Pressable View with animation
interface PressableViewProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const PressableView = forwardRef<View, PressableViewProps>(({
  children,
  onPress,
  style,
  ...props
}, ref) => {
  const { animatedStyle, pressIn, pressOut } = usePressAnimation();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      activeOpacity={1}
    >
      <Animated.View
        ref={ref}
        style={[animatedStyle, style]}
        {...props}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
});

PressableView.displayName = 'PressableView';

// Progress Bar with animation
interface AnimatedProgressBarProps extends ViewProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  duration?: number;
}

export const AnimatedProgressBar = forwardRef<View, AnimatedProgressBarProps>(({
  progress,
  color,
  backgroundColor,
  height = 4,
  animated = true,
  duration = 500,
  style,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(progress, { duration });
    } else {
      progressValue.value = progress;
    }
  }, [progress, animated, duration, progressValue]);

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });

  return (
    <View
      ref={ref}
      style={[
        {
          height,
          backgroundColor: backgroundColor || colors.border,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={[
          progressStyle,
          {
            height: '100%',
            backgroundColor: color || colors.primary,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
});

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

// Skeleton Loader
interface SkeletonLoaderProps extends ViewProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
}

export const SkeletonLoader = forwardRef<View, SkeletonLoaderProps>(({
  width = 200,
  height = 20,
  borderRadius = 4,
  animated = true,
  style,
  ...props
}, ref) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (animated) {
      opacity.value = withTiming(0.7, { duration: 800 }, (finished) => {
        if (finished) {
          opacity.value = withTiming(0.3, { duration: 800 });
        }
      });
    }
  }, [animated, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <Animated.View
      ref={ref}
      style={[
        {
          width,
          height,
          backgroundColor: skeletonColor,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
      {...props}
    />
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';