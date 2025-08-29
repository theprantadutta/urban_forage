import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';


interface OnboardingIllustrationProps {
  type: 'discover' | 'share' | 'sustainability';
  isActive: boolean;
}

const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({ type, isActive }) => {
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      
      // Add subtle floating animation
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 15, stiffness: 150 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withSpring(0.3);
      scale.value = withSpring(0.8);
    }
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const getIllustrationContent = () => {
    switch (type) {
      case 'discover':
        return (
          <View className="items-center justify-center">
            {/* Discover illustration - using simple shapes for now */}
            <View className="w-32 h-32 bg-sage-green rounded-full items-center justify-center mb-4">
              <View className="w-16 h-16 bg-golden-yellow rounded-full items-center justify-center">
                <View className="w-8 h-8 bg-warm-orange rounded-full" />
              </View>
            </View>
            <View className="flex-row space-x-2">
              <View className="w-4 h-4 bg-sage-green rounded-full" />
              <View className="w-4 h-4 bg-golden-yellow rounded-full" />
              <View className="w-4 h-4 bg-warm-orange rounded-full" />
            </View>
          </View>
        );
      
      case 'share':
        return (
          <View className="items-center justify-center">
            {/* Share illustration */}
            <View className="w-32 h-32 bg-forest-green rounded-2xl items-center justify-center mb-4 rotate-12">
              <View className="w-20 h-20 bg-golden-yellow rounded-xl items-center justify-center -rotate-12">
                <View className="w-12 h-12 bg-warm-orange rounded-lg" />
              </View>
            </View>
            <View className="flex-row space-x-3">
              <View className="w-3 h-8 bg-sage-green rounded-full" />
              <View className="w-3 h-6 bg-golden-yellow rounded-full" />
              <View className="w-3 h-10 bg-warm-orange rounded-full" />
            </View>
          </View>
        );
      
      case 'sustainability':
        return (
          <View className="items-center justify-center">
            {/* Sustainability illustration */}
            <View className="w-32 h-32 bg-sage-green rounded-full items-center justify-center mb-4">
              <View className="w-24 h-24 bg-forest-green rounded-full items-center justify-center">
                <View className="w-16 h-16 bg-golden-yellow rounded-full items-center justify-center">
                  <View className="w-8 h-8 bg-warm-orange rounded-full" />
                </View>
              </View>
            </View>
            <View className="flex-row space-x-1">
              {[...Array(5)].map((_, i) => (
                <View key={i} className="w-2 h-2 bg-sage-green rounded-full" />
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center h-64">
      {getIllustrationContent()}
    </Animated.View>
  );
};

export default OnboardingIllustration;