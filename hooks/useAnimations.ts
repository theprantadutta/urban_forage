import { useCallback } from 'react';
import {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';

// Spring configuration presets
export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 1,
  },
  slow: {
    damping: 25,
    stiffness: 50,
    mass: 1,
  },
};

// Timing configuration presets
export const timingConfigs = {
  fast: { duration: 200 },
  medium: { duration: 300 },
  slow: { duration: 500 },
  extraSlow: { duration: 800 },
};

// Scale animation hook
export const useScaleAnimation = (initialScale = 1) => {
  const scale = useSharedValue(initialScale);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = useCallback((toScale = 1, config = springConfigs.gentle) => {
    if (reducedMotion) {
      scale.value = toScale;
      return;
    }
    scale.value = withSpring(toScale, config);
  }, [scale, reducedMotion]);

  const scaleOut = useCallback((toScale = 0.95, config = springConfigs.gentle) => {
    if (reducedMotion) {
      scale.value = toScale;
      return;
    }
    scale.value = withSpring(toScale, config);
  }, [scale, reducedMotion]);

  const pressIn = useCallback(() => scaleOut(0.95, springConfigs.snappy), [scaleOut]);
  const pressOut = useCallback(() => scaleIn(1, springConfigs.snappy), [scaleIn]);

  return {
    scale,
    animatedStyle,
    scaleIn,
    scaleOut,
    pressIn,
    pressOut,
  };
};

// Fade animation hook
export const useFadeAnimation = (initialOpacity = 0) => {
  const opacity = useSharedValue(initialOpacity);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = useCallback((duration = 300, delay = 0) => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withTiming(1, { duration }, (finished) => {
      if (finished && delay > 0) {
        // Handle completion if needed
      }
    });
  }, [opacity, reducedMotion]);

  const fadeOut = useCallback((duration = 300) => {
    if (reducedMotion) {
      opacity.value = 0;
      return;
    }
    opacity.value = withTiming(0, { duration });
  }, [opacity, reducedMotion]);

  const fadeToggle = useCallback((duration = 300) => {
    const targetOpacity = opacity.value === 0 ? 1 : 0;
    if (reducedMotion) {
      opacity.value = targetOpacity;
      return;
    }
    opacity.value = withTiming(targetOpacity, { duration });
  }, [opacity, reducedMotion]);

  return {
    opacity,
    animatedStyle,
    fadeIn,
    fadeOut,
    fadeToggle,
  };
};

// Slide animation hook
export const useSlideAnimation = (initialTranslateY = 50) => {
  const translateY = useSharedValue(initialTranslateY);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const slideIn = useCallback((config = springConfigs.gentle) => {
    if (reducedMotion) {
      translateY.value = 0;
      return;
    }
    translateY.value = withSpring(0, config);
  }, [translateY, reducedMotion]);

  const slideOut = useCallback((toValue = 50, config = springConfigs.gentle) => {
    if (reducedMotion) {
      translateY.value = toValue;
      return;
    }
    translateY.value = withSpring(toValue, config);
  }, [translateY, reducedMotion]);

  return {
    translateY,
    animatedStyle,
    slideIn,
    slideOut,
  };
};

// Rotation animation hook
export const useRotationAnimation = (initialRotation = 0) => {
  const rotation = useSharedValue(initialRotation);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotateTo = useCallback((degrees: number, config = springConfigs.gentle) => {
    if (reducedMotion) {
      rotation.value = degrees;
      return;
    }
    rotation.value = withSpring(degrees, config);
  }, [rotation, reducedMotion]);

  const rotateBy = useCallback((degrees: number, config = springConfigs.gentle) => {
    if (reducedMotion) {
      rotation.value += degrees;
      return;
    }
    rotation.value = withSpring(rotation.value + degrees, config);
  }, [rotation, reducedMotion]);

  const spin = useCallback((duration = 1000, clockwise = true) => {
    if (reducedMotion) return;
    
    const targetRotation = clockwise ? 360 : -360;
    rotation.value = withRepeat(
      withTiming(targetRotation, { duration }),
      -1,
      false
    );
  }, [rotation, reducedMotion]);

  return {
    rotation,
    animatedStyle,
    rotateTo,
    rotateBy,
    spin,
  };
};

// Combined entrance animation hook
export const useEntranceAnimation = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const enter = useCallback((delay = 0) => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
      return;
    }

    const config = springConfigs.gentle;
    
    if (delay > 0) {
      setTimeout(() => {
        opacity.value = withSpring(1, config);
        translateY.value = withSpring(0, config);
        scale.value = withSpring(1, config);
      }, delay);
    } else {
      opacity.value = withSpring(1, config);
      translateY.value = withSpring(0, config);
      scale.value = withSpring(1, config);
    }
  }, [opacity, translateY, scale, reducedMotion]);

  const exit = useCallback((onComplete?: () => void) => {
    if (reducedMotion) {
      opacity.value = 0;
      translateY.value = -30;
      scale.value = 0.9;
      onComplete?.();
      return;
    }

    const config = springConfigs.snappy;
    opacity.value = withSpring(0, config);
    translateY.value = withSpring(-30, config);
    scale.value = withSpring(0.9, config, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });
  }, [opacity, translateY, scale, reducedMotion]);

  return {
    animatedStyle,
    enter,
    exit,
  };
};

// Staggered list animation hook
export const useStaggeredAnimation = (itemCount: number, staggerDelay = 100) => {
  const animations = Array.from({ length: itemCount }, () => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(20),
  }));

  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const getAnimatedStyle = useCallback((index: number) => {
    return useAnimatedStyle(() => ({
      opacity: animations[index]?.opacity.value || 0,
      transform: [{ translateY: animations[index]?.translateY.value || 0 }],
    }));
  }, [animations]);

  const startStaggeredAnimation = useCallback(() => {
    if (reducedMotion) {
      animations.forEach((anim) => {
        anim.opacity.value = 1;
        anim.translateY.value = 0;
      });
      return;
    }

    animations.forEach((anim, index) => {
      const delay = index * staggerDelay;
      setTimeout(() => {
        anim.opacity.value = withSpring(1, springConfigs.gentle);
        anim.translateY.value = withSpring(0, springConfigs.gentle);
      }, delay);
    });
  }, [animations, staggerDelay, reducedMotion]);

  return {
    getAnimatedStyle,
    startStaggeredAnimation,
  };
};

// Progress animation hook
export const useProgressAnimation = (initialProgress = 0) => {
  const progress = useSharedValue(initialProgress);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });

  const animateToProgress = useCallback((targetProgress: number, duration = 500) => {
    if (reducedMotion) {
      progress.value = targetProgress;
      return;
    }
    progress.value = withTiming(targetProgress, { duration });
  }, [progress, reducedMotion]);

  return {
    progress,
    animatedStyle,
    animateToProgress,
  };
};