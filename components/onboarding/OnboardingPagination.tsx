import React from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPaginationProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
  activeColor?: string;
  inactiveColor?: string;
}

const PaginationDot: React.FC<{
  index: number;
  scrollX: Animated.SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}> = ({ index, scrollX, activeColor, inactiveColor }) => {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      [inactiveColor, activeColor, inactiveColor]
    );

    return {
      width,
      opacity,
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 rounded-full"
    />
  );
};

const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({ 
  data, 
  scrollX, 
  activeColor = '#2D5016',
  inactiveColor = '#87A96B' 
}) => {
  return (
    <View className="flex-row items-center justify-center space-x-2">
      {data.map((_, index) => (
        <PaginationDot
          key={index}
          index={index}
          scrollX={scrollX}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
      ))}
    </View>
  );
};

export default OnboardingPagination;