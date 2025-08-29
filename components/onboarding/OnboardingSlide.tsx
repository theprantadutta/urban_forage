import React from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { OnboardingSlide as SlideData } from '../../types/onboarding';
import OnboardingIllustration from './OnboardingIllustration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: SlideData;
  index: number;
  scrollX: Animated.SharedValue<number>;
  isActive: boolean;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ 
  slide, 
  index, 
  scrollX, 
  isActive 
}) => {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-SCREEN_WIDTH * 0.1, 0, SCREEN_WIDTH * 0.1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, -50],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const descriptionAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, -20],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View 
      style={[animatedStyle, { backgroundColor: slide.backgroundColor }]}
      className="flex-1 items-center justify-center px-8"
    >
      <View className="flex-1 items-center justify-center">
        {/* Illustration */}
        <View className="flex-1 items-center justify-center">
          <OnboardingIllustration 
            type={slide.illustration as 'discover' | 'share' | 'sustainability'} 
            isActive={isActive}
          />
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-start pt-8">
          <Animated.Text 
            style={[titleAnimatedStyle, { color: slide.textColor }]}
            className="text-4xl font-bold text-center mb-2"
          >
            {slide.title}
          </Animated.Text>

          <Animated.Text 
            style={[subtitleAnimatedStyle, { color: slide.textColor }]}
            className="text-xl font-semibold text-center mb-6 opacity-80"
          >
            {slide.subtitle}
          </Animated.Text>

          <Animated.Text 
            style={[descriptionAnimatedStyle, { color: slide.textColor }]}
            className="text-base text-center leading-6 opacity-70 max-w-sm"
          >
            {slide.description}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default OnboardingSlide;