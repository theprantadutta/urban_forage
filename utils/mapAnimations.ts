import { Animated, Easing } from 'react-native';

// Animation utilities for map theme transitions
export class MapAnimations {
  private static themeTransition = new Animated.Value(0);
  private static seasonTransition = new Animated.Value(0);

  // Animate theme transition
  static animateThemeChange(callback?: () => void) {
    Animated.timing(this.themeTransition, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      this.themeTransition.setValue(0);
      callback?.();
    });
  }

  // Animate seasonal theme change
  static animateSeasonChange(callback?: () => void) {
    Animated.sequence([
      Animated.timing(this.seasonTransition, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: false,
      }),
      Animated.timing(this.seasonTransition, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      callback?.();
    });
  }

  // Get theme transition interpolation
  static getThemeTransition() {
    return this.themeTransition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
  }

  // Get season transition interpolation
  static getSeasonTransition() {
    return this.seasonTransition.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });
  }

  // Create smooth map region animation
  static createRegionAnimation(
    fromRegion: any,
    toRegion: any,
    duration: number = 1000
  ): Promise<any> {
    return new Promise((resolve) => {
      const animatedValue = new Animated.Value(0);
      
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        resolve(toRegion);
      });
    });
  }

  // Create marker bounce animation
  static createMarkerBounce(): Animated.CompositeAnimation {
    const bounceValue = new Animated.Value(0);
    
    return Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(bounceValue, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
  }

  // Create cluster expansion animation
  static createClusterExpansion(scale: Animated.Value): Animated.CompositeAnimation {
    return Animated.spring(scale, {
      toValue: 1.2,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    });
  }

  // Create smooth zoom animation
  static createZoomAnimation(
    currentZoom: number,
    targetZoom: number,
    duration: number = 500
  ): Promise<number> {
    return new Promise((resolve) => {
      const zoomValue = new Animated.Value(currentZoom);
      
      Animated.timing(zoomValue, {
        toValue: targetZoom,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        resolve(targetZoom);
      });
    });
  }
}