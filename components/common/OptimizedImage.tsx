import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Text,
    View,
    ViewStyle,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps {
  source: string | { uri: string } | number;
  style?: ViewStyle;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  placeholder?: string;
  blurhash?: string;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  transition?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  showLoadingIndicator?: boolean;
  alt?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  className = '',
  width,
  height,
  aspectRatio = 1,
  placeholder,
  blurhash,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  contentFit = 'cover',
  transition = 200,
  onLoad,
  onError,
  fallbackIcon = 'image-outline',
  showLoadingIndicator = true,
  alt,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Calculate responsive dimensions
  const getImageDimensions = () => {
    if (width && height) {
      return { width, height };
    }
    
    if (width) {
      return { width, height: width / aspectRatio };
    }
    
    if (height) {
      return { width: height * aspectRatio, height };
    }
    
    // Default responsive width
    const defaultWidth = screenWidth * 0.9;
    return { width: defaultWidth, height: defaultWidth / aspectRatio };
  };

  const dimensions = getImageDimensions();

  // Generate optimized source URLs for different qualities
  const getOptimizedSource = () => {
    if (typeof source === 'number' || !source) {
      return source;
    }

    const sourceUri = typeof source === 'string' ? source : source.uri;
    
    // If it's a local asset or already optimized, return as-is
    if (!sourceUri.startsWith('http')) {
      return source;
    }

    // For remote images, we can add query parameters for optimization
    // This would typically integrate with a CDN like Cloudinary
    const optimizedUri = `${sourceUri}?w=${Math.round(dimensions.width)}&h=${Math.round(dimensions.height)}&q=auto&f=auto`;
    
    return { uri: optimizedUri };
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const containerStyle: ViewStyle = {
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    ...style,
  };

  return (
    <View style={containerStyle} className={className}>
      {!hasError ? (
        <>
          <Image
            source={getOptimizedSource()}
            style={{
              width: '100%',
              height: '100%',
            }}
            placeholder={placeholder || blurhash}
            contentFit={contentFit}
            priority={priority}
            cachePolicy={cachePolicy}
            transition={transition}
            onLoad={handleLoad}
            onError={handleError}
            accessible={!!alt}
            accessibilityLabel={alt}
          />
          
          {/* Loading Overlay */}
          {isLoading && showLoadingIndicator && (
            <View className="absolute inset-0 items-center justify-center bg-gray-100">
              <ActivityIndicator size="small" color="#2D5016" />
              <Text className="text-gray-500 text-xs mt-2">Loading...</Text>
            </View>
          )}
        </>
      ) : (
        /* Error Fallback */
        <View className="absolute inset-0 items-center justify-center bg-gray-100">
          <Ionicons name={fallbackIcon} size={32} color="#9CA3AF" />
          <Text className="text-gray-500 text-xs mt-2 text-center px-2">
            Image unavailable
          </Text>
        </View>
      )}
    </View>
  );
};

// Preset configurations for common use cases
export const FoodImage: React.FC<Omit<OptimizedImageProps, 'aspectRatio' | 'contentFit'>> = (props) => (
  <OptimizedImage
    {...props}
    aspectRatio={4/3}
    contentFit="cover"
    fallbackIcon="restaurant-outline"
    alt={props.alt || "Food item image"}
  />
);

export const ProfileImage: React.FC<Omit<OptimizedImageProps, 'aspectRatio' | 'contentFit'>> = (props) => (
  <OptimizedImage
    {...props}
    aspectRatio={1}
    contentFit="cover"
    fallbackIcon="person-outline"
    alt={props.alt || "Profile image"}
  />
);

export const ThumbnailImage: React.FC<Omit<OptimizedImageProps, 'priority' | 'cachePolicy'>> = (props) => (
  <OptimizedImage
    {...props}
    priority="low"
    cachePolicy="memory"
    showLoadingIndicator={false}
  />
);

export default OptimizedImage;