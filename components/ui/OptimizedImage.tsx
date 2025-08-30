import { Image, ImageProps, ImageSource } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeProvider';
import { useImagePerformance } from '../../utils/imagePerformance';
import { SkeletonLoader } from './AnimatedComponents';

interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'style'> {
  source: ImageSource | string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  placeholder?: string;
  blurhash?: string;
  showSkeleton?: boolean;
  borderRadius?: number;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  style?: ViewStyle;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  aspectRatio,
  placeholder,
  blurhash,
  showSkeleton = true,
  borderRadius = 0,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { colors, isDark } = useTheme();
  const { startTracking, markSuccess, markFailure } = useImagePerformance();
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.05);

  const imageUri = typeof source === 'string' ? source : source.uri || '';

  // Start performance tracking when component mounts
  useEffect(() => {
    if (imageUri) {
      const cacheHit = cachePolicy !== 'none';
      startTracking(imageUri, cacheHit);
    }
  }, [imageUri, cachePolicy, startTracking]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 300 });
    
    // Track successful load
    if (imageUri) {
      markSuccess(imageUri, { width: width || 0, height: height || 0 });
    }
    
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // Track failed load
    if (imageUri) {
      markFailure(imageUri, error?.message || 'Unknown error');
    }
    
    onError?.(error);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const containerStyle: ViewStyle = {
    width,
    height,
    aspectRatio,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: isDark ? colors.surface : colors.background,
    ...style,
  };

  // Convert string source to proper ImageSource
  const imageSource: ImageSource = typeof source === 'string' 
    ? { uri: source }
    : source;

  // Add caching and optimization parameters
  const optimizedSource: ImageSource = {
    ...imageSource,
    cacheKey: typeof source === 'string' ? source : undefined,
  };

  return (
    <View style={containerStyle}>
      {/* Skeleton loader */}
      {isLoading && showSkeleton && (
        <SkeletonLoader
          width={width || 300}
          height={height || 200}
          borderRadius={borderRadius}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? colors.surface : colors.border,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: colors.textSecondary,
              borderRadius: 12,
            }}
          />
        </View>
      )}

      {/* Optimized Image */}
      <AnimatedImage
        source={optimizedSource}
        style={[
          {
            width: '100%',
            height: '100%',
          },
          animatedStyle,
        ]}
        placeholder={placeholder || blurhash}
        placeholderContentFit="cover"
        contentFit="cover"
        transition={300}
        cachePolicy={cachePolicy}
        priority={priority}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

// Progressive Image component for large images
interface ProgressiveImageProps extends OptimizedImageProps {
  lowResSource?: string;
  highResSource: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  lowResSource,
  highResSource,
  ...props
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const highResOpacity = useSharedValue(0);

  const handleHighResLoad = () => {
    setHighResLoaded(true);
    highResOpacity.value = withTiming(1, { duration: 300 });
  };

  const highResAnimatedStyle = useAnimatedStyle(() => ({
    opacity: highResOpacity.value,
  }));

  return (
    <View style={{ position: 'relative' }}>
      {/* Low resolution image */}
      {lowResSource && !highResLoaded && (
        <OptimizedImage
          {...props}
          source={lowResSource}
          showSkeleton={true}
          cachePolicy="memory-disk"
        />
      )}

      {/* High resolution image */}
      <AnimatedImage
        {...props}
        source={{ uri: highResSource }}
        style={[
          {
            position: highResLoaded ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          },
          highResAnimatedStyle,
        ]}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
        onLoadEnd={handleHighResLoad}
      />
    </View>
  );
};