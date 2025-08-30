import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import { springConfigs } from './useAnimations';

// Simple press animation hook
export const usePressAnimation = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);
  const hapticFeedback = useThemeStore((state) => state.hapticFeedback);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressIn = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (reducedMotion) {
      scale.value = 0.95;
      opacity.value = 0.8;
    } else {
      scale.value = withSpring(0.95, springConfigs.snappy);
      opacity.value = withSpring(0.8, springConfigs.snappy);
    }
  }, [scale, opacity, reducedMotion, hapticFeedback]);

  const pressOut = useCallback(() => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withSpring(1, springConfigs.snappy);
      opacity.value = withSpring(1, springConfigs.snappy);
    }
  }, [scale, opacity, reducedMotion]);

  return {
    animatedStyle,
    pressIn,
    pressOut,
  };
};

// Simple drag animation hook (without gesture handling)
export const useDragAnimation = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const setPosition = useCallback((x: number, y: number) => {
    if (reducedMotion) {
      translateX.value = x;
      translateY.value = y;
    } else {
      translateX.value = withSpring(x, springConfigs.gentle);
      translateY.value = withSpring(y, springConfigs.gentle);
    }
  }, [translateX, translateY, reducedMotion]);

  const resetPosition = useCallback(() => {
    setPosition(0, 0);
  }, [setPosition]);

  return {
    animatedStyle,
    translateX,
    translateY,
    setPosition,
    resetPosition,
  };
};

// Simple scale animation hook
export const useScaleGesture = () => {
  const scale = useSharedValue(1);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setScale = useCallback((newScale: number) => {
    if (reducedMotion) {
      scale.value = newScale;
    } else {
      scale.value = withSpring(newScale, springConfigs.gentle);
    }
  }, [scale, reducedMotion]);

  const resetScale = useCallback(() => {
    setScale(1);
  }, [setScale]);

  return {
    animatedStyle,
    scale,
    setScale,
    resetScale,
  };
};