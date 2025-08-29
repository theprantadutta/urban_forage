import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, ListRenderItem, View } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ONBOARDING_SLIDES } from '../../constants/onboarding';
import { OnboardingProps, OnboardingSlide } from '../../types/onboarding';
import { Button } from '../ui';
import OnboardingPagination from './OnboardingPagination';
import OnboardingSlideComponent from './OnboardingSlide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const renderSlide: ListRenderItem<OnboardingSlide> = ({ item, index }) => (
    <OnboardingSlideComponent
      slide={item}
      index={index}
      scrollX={scrollX}
      isActive={index === currentIndex}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-cream-white">
      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <Button
          variant="ghost"
          size="small"
          onPress={handleSkip}
          className="px-4 py-2"
          title="Skip"
        />
      </View>

      {/* Slides */}
      <AnimatedFlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide as any}
        keyExtractor={(item: any) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 pb-12 pt-8 bg-transparent">
        {/* Pagination */}
        <View className="mb-8">
          <OnboardingPagination
            data={ONBOARDING_SLIDES}
            scrollX={scrollX}
            activeColor="#2D5016"
            inactiveColor="#87A96B"
          />
        </View>

        {/* Action Button */}
        <View className="px-8">
          <Button
            variant="primary"
            size="large"
            onPress={handleNext}
            className="w-full"
            title={isLastSlide ? 'Get Started' : 'Next'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;