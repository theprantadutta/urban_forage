import * as Haptics from 'expo-haptics';
import {
    Easing,
    SharedValue,
    runOnJS,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// Animation sequence builder
export class AnimationSequence {
  private animations: Array<() => void> = [];
  private onComplete?: () => void;

  constructor(onComplete?: () => void) {
    this.onComplete = onComplete;
  }

  // Add a spring animation to the sequence
  spring(
    sharedValue: SharedValue<number>,
    toValue: number,
    config?: Parameters<typeof withSpring>[1]
  ) {
    this.animations.push(() => {
      sharedValue.value = withSpring(toValue, config);
    });
    return this;
  }

  // Add a timing animation to the sequence
  timing(
    sharedValue: SharedValue<number>,
    toValue: number,
    config?: Parameters<typeof withTiming>[1]
  ) {
    this.animations.push(() => {
      sharedValue.value = withTiming(toValue, config);
    });
    return this;
  }

  // Add a delay to the sequence
  delay(duration: number) {
    this.animations.push(() => {
      // Delay is handled by withDelay in the execution
    });
    return this;
  }

  // Add haptic feedback to the sequence
  haptic(type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
    this.animations.push(() => {
      runOnJS(Haptics.impactAsync)(type);
    });
    return this;
  }

  // Execute the animation sequence
  execute() {
    this.animations.forEach((animation, index) => {
      setTimeout(() => {
        animation();
        if (index === this.animations.length - 1 && this.onComplete) {
          setTimeout(() => this.onComplete?.(), 100);
        }
      }, index * 50); // Small delay between animations
    });
  }
}

// Predefined animation presets
export const animationPresets = {
  // Entrance animations
  entrance: {
    fadeIn: (opacity: SharedValue<number>, duration = 300) => {
      opacity.value = withTiming(1, { duration });
    },
    
    slideInFromBottom: (translateY: SharedValue<number>, duration = 300) => {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
    },
    
    scaleIn: (scale: SharedValue<number>, duration = 300) => {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
        mass: 1,
      });
    },
    
    bounceIn: (scale: SharedValue<number>) => {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    },
  },

  // Exit animations
  exit: {
    fadeOut: (opacity: SharedValue<number>, duration = 200) => {
      opacity.value = withTiming(0, { duration });
    },
    
    slideOutToBottom: (translateY: SharedValue<number>, duration = 200) => {
      translateY.value = withTiming(100, { duration });
    },
    
    scaleOut: (scale: SharedValue<number>, duration = 200) => {
      scale.value = withTiming(0, { duration });
    },
  },

  // Interaction animations
  interaction: {
    pressIn: (scale: SharedValue<number>) => {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300,
        mass: 1,
      });
    },
    
    pressOut: (scale: SharedValue<number>) => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
        mass: 1,
      });
    },
    
    wiggle: (rotation: SharedValue<number>) => {
      rotation.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withRepeat(
          withSequence(
            withTiming(5, { duration: 100 }),
            withTiming(-5, { duration: 100 })
          ),
          3,
          true
        ),
        withTiming(0, { duration: 50 })
      );
    },
    
    pulse: (scale: SharedValue<number>) => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    },
  },

  // Loading animations
  loading: {
    spin: (rotation: SharedValue<number>) => {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    },
    
    breathe: (scale: SharedValue<number>) => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    },
    
    shimmer: (translateX: SharedValue<number>, width: number) => {
      translateX.value = withRepeat(
        withTiming(width, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    },
  },
};

// Stagger animation utility
export const createStaggeredAnimation = (
  items: Array<{ opacity: SharedValue<number>; translateY: SharedValue<number> }>,
  delay = 100,
  onComplete?: () => void
) => {
  items.forEach((item, index) => {
    const animationDelay = index * delay;
    
    setTimeout(() => {
      item.opacity.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
      
      item.translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      }, (finished) => {
        if (finished && index === items.length - 1 && onComplete) {
          runOnJS(onComplete)();
        }
      });
    }, animationDelay);
  });
};

// Parallax scroll animation utility
export const createParallaxAnimation = (
  scrollY: SharedValue<number>,
  itemHeight: number,
  index: number,
  parallaxFactor = 0.5
) => {
  'worklet';
  
  const inputRange = [
    (index - 1) * itemHeight,
    index * itemHeight,
    (index + 1) * itemHeight,
  ];
  
  const outputRange = [
    -itemHeight * parallaxFactor,
    0,
    itemHeight * parallaxFactor,
  ];
  
  return {
    transform: [
      {
        translateY: scrollY.value
          ? Math.max(
              Math.min(
                ((scrollY.value - inputRange[1]) / itemHeight) * itemHeight * parallaxFactor,
                outputRange[2]
              ),
              outputRange[0]
            )
          : 0,
      },
    ],
  };
};

// Easing functions
export const customEasing = {
  // Smooth ease in/out
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
  
  // Bouncy ease out
  bouncy: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  
  // Sharp ease in/out
  sharp: Easing.bezier(0.4, 0, 0.2, 1),
  
  // Gentle ease in/out
  gentle: Easing.bezier(0.4, 0, 0.6, 1),
};

// Animation timing utilities
export const getAnimationDuration = (reducedMotion: boolean, baseDuration: number) => {
  return reducedMotion ? 0 : baseDuration;
};

export const getSpringConfig = (reducedMotion: boolean, preset: 'gentle' | 'bouncy' | 'snappy' = 'gentle') => {
  if (reducedMotion) {
    return { damping: 1000, stiffness: 1000, mass: 1 };
  }
  
  const configs = {
    gentle: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 10, stiffness: 100, mass: 1 },
    snappy: { damping: 15, stiffness: 200, mass: 1 },
  };
  
  return configs[preset];
};