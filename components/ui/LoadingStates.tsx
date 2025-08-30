import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../providers/ThemeProvider";

const { width: screenWidth } = Dimensions.get("window");

// Base loading component props
interface BaseLoadingProps {
  size?: "small" | "medium" | "large";
  color?: string;
  style?: any;
}

// Spinner loading component
export const SpinnerLoading: React.FC<BaseLoadingProps> = ({
  size = "medium",
  color,
  style,
}) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinnerSize = sizeMap[size];
  const spinnerColor = color || colors.primary;

  return (
    <View style={[styles.spinnerContainer, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}20`,
            borderTopColor: spinnerColor,
            borderWidth: spinnerSize / 10,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Dots loading component
export const DotsLoading: React.FC<BaseLoadingProps> = ({
  size = "medium",
  color,
  style,
}) => {
  const { colors } = useTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  const sizeMap = {
    small: 6,
    medium: 10,
    large: 14,
  };

  useEffect(() => {
    const animateDots = () => {
      dot1.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 })
      );

      setTimeout(() => {
        dot2.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        );
      }, 200);

      setTimeout(() => {
        dot3.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        );
      }, 400);
    };

    animateDots();
    const interval = setInterval(animateDots, 1200);
    return () => clearInterval(interval);
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(dot1.value, [0, 1], [0.8, 1.2], Extrapolation.CLAMP),
      },
    ],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(dot2.value, [0, 1], [0.8, 1.2], Extrapolation.CLAMP),
      },
    ],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(dot3.value, [0, 1], [0.8, 1.2], Extrapolation.CLAMP),
      },
    ],
  }));

  const dotSize = sizeMap[size];
  const dotColor = color || colors.primary;

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: dotColor },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: dotColor },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: dotColor },
          dot3Style,
        ]}
      />
    </View>
  );
};

// Pulse loading component
export const PulseLoading: React.FC<BaseLoadingProps> = ({
  size = "medium",
  color,
  style,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(
      scale.value,
      [1, 1.2],
      [0.7, 0.3],
      Extrapolation.CLAMP
    ),
  }));

  const pulseSize = sizeMap[size];
  const pulseColor = color || colors.primary;

  return (
    <View style={[styles.pulseContainer, style]}>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: pulseSize,
            height: pulseSize,
            backgroundColor: pulseColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Wave loading component
export const WaveLoading: React.FC<
  BaseLoadingProps & { barCount?: number }
> = ({ size = "medium", color, barCount = 5, style }) => {
  const { colors } = useTheme();

  // Create individual shared values for each bar
  const bar1 = useSharedValue(0);
  const bar2 = useSharedValue(0);
  const bar3 = useSharedValue(0);
  const bar4 = useSharedValue(0);
  const bar5 = useSharedValue(0);

  const bars = [bar1, bar2, bar3, bar4, bar5].slice(0, barCount);

  const sizeMap = {
    small: { width: 3, maxHeight: 20 },
    medium: { width: 4, maxHeight: 30 },
    large: { width: 6, maxHeight: 40 },
  };

  useEffect(() => {
    bars.forEach((bar, index) => {
      setTimeout(() => {
        bar.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        );
      }, index * 100);
    });
  }, [bars]);

  const { width: barWidth, maxHeight } = sizeMap[size];
  const barColor = color || colors.primary;

  // Create animated styles for each bar
  const bar1Style = useAnimatedStyle(() => ({
    height: interpolate(
      bar1.value,
      [0.3, 1],
      [maxHeight * 0.3, maxHeight],
      Extrapolation.CLAMP
    ),
  }));

  const bar2Style = useAnimatedStyle(() => ({
    height: interpolate(
      bar2.value,
      [0.3, 1],
      [maxHeight * 0.3, maxHeight],
      Extrapolation.CLAMP
    ),
  }));

  const bar3Style = useAnimatedStyle(() => ({
    height: interpolate(
      bar3.value,
      [0.3, 1],
      [maxHeight * 0.3, maxHeight],
      Extrapolation.CLAMP
    ),
  }));

  const bar4Style = useAnimatedStyle(() => ({
    height: interpolate(
      bar4.value,
      [0.3, 1],
      [maxHeight * 0.3, maxHeight],
      Extrapolation.CLAMP
    ),
  }));

  const bar5Style = useAnimatedStyle(() => ({
    height: interpolate(
      bar5.value,
      [0.3, 1],
      [maxHeight * 0.3, maxHeight],
      Extrapolation.CLAMP
    ),
  }));

  const barStyles = [
    bar1Style,
    bar2Style,
    bar3Style,
    bar4Style,
    bar5Style,
  ].slice(0, barCount);

  return (
    <View style={[styles.waveContainer, style]}>
      {bars.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              width: barWidth,
              backgroundColor: barColor,
            },
            barStyles[index],
          ]}
        />
      ))}
    </View>
  );
};

// Skeleton loading components
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLine: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const { isDark } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-screenWidth, screenWidth],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  const skeletonColor = isDark ? "#374151" : "#E5E7EB";
  const shimmerColor = isDark ? "#4B5563" : "#F3F4F6";

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: skeletonColor,
          borderRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: shimmerColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonCircle: React.FC<{ size: number; style?: any }> = ({
  size,
  style,
}) => {
  return (
    <SkeletonLine
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

// Complex skeleton layouts
export const SkeletonCard: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View style={[styles.skeletonCard, style]}>
      <SkeletonLine
        width="100%"
        height={200}
        borderRadius={8}
        style={{ marginBottom: 12 }}
      />
      <SkeletonLine width="80%" height={20} style={{ marginBottom: 8 }} />
      <SkeletonLine width="60%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.skeletonCardFooter}>
        <SkeletonCircle size={32} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonLine width="40%" height={14} style={{ marginBottom: 4 }} />
          <SkeletonLine width="60%" height={12} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{ itemCount?: number; style?: any }> = ({
  itemCount = 5,
  style,
}) => {
  return (
    <View style={[styles.skeletonList, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={styles.skeletonListItem}>
          <SkeletonCircle size={48} />
          <View style={styles.skeletonListContent}>
            <SkeletonLine width="70%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLine width="50%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const SkeletonProfile: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View style={[styles.skeletonProfile, style]}>
      <SkeletonCircle size={80} style={{ marginBottom: 16 }} />
      <SkeletonLine width="60%" height={24} style={{ marginBottom: 8 }} />
      <SkeletonLine width="40%" height={16} style={{ marginBottom: 16 }} />
      <SkeletonLine width="100%" height={14} style={{ marginBottom: 4 }} />
      <SkeletonLine width="80%" height={14} style={{ marginBottom: 4 }} />
      <SkeletonLine width="90%" height={14} />
    </View>
  );
};

// Full screen loading component
interface FullScreenLoadingProps {
  type?: "spinner" | "dots" | "pulse" | "wave";
  message?: string;
  showMessage?: boolean;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  type = "spinner",
  message = "Loading...",
  showMessage = true,
}) => {
  const { colors } = useTheme();

  const renderLoader = () => {
    switch (type) {
      case "dots":
        return <DotsLoading size="large" />;
      case "pulse":
        return <PulseLoading size="large" />;
      case "wave":
        return <WaveLoading size="large" />;
      default:
        return <SpinnerLoading size="large" />;
    }
  };

  return (
    <View
      style={[styles.fullScreenLoading, { backgroundColor: colors.background }]}
    >
      {renderLoader()}
      {showMessage && (
        <Text style={[styles.loadingMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Spinner styles
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderRadius: 50,
  },

  // Dots styles
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    borderRadius: 50,
  },

  // Pulse styles
  pulseContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    borderRadius: 50,
  },

  // Wave styles
  waveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
  },
  waveBar: {
    borderRadius: 2,
  },

  // Shimmer styles
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },

  // Skeleton layout styles
  skeletonCard: {
    padding: 16,
    backgroundColor: "transparent",
  },
  skeletonCardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonList: {
    padding: 16,
  },
  skeletonListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  skeletonListContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonProfile: {
    alignItems: "center",
    padding: 24,
  },

  // Full screen loading
  fullScreenLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingMessage: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});
