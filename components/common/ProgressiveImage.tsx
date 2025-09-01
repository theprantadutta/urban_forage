import React, { useState } from 'react';
import {
    Animated,
    View,
    ViewStyle,
} from 'react-native';
import { OptimizedImage } from './OptimizedImage';

interface ProgressiveImageProps {
  source: string | { uri: string };
  lowQualitySource?: string | { uri: string };
  style?: ViewStyle;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  onLoad?: () => void;
  onError?: (error: any) => void;
  alt?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  lowQualitySource,
  style,
  className = '',
  width,
  height,
  aspectRatio = 1,
  contentFit = 'cover',
  onLoad,
  onError,
  alt,
}) => {

  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  
  const lowQualityOpacity = new Animated.Value(0);
  const highQualityOpacity = new Animated.Value(0);

  // Generate low quality source if not provided
  const getLowQualitySource = () => {
    if (lowQualitySource) return lowQualitySource;
    
    if (typeof source === 'string') {
      // Add low quality parameters to the URL
      return `${source}?w=50&q=30&blur=5`;
    } else if (source.uri) {
      return { uri: `${source.uri}?w=50&q=30&blur=5` };
    }
    
    return source;
  };

  const handleLowQualityLoad = () => {
    setLowQualityLoaded(true);
    Animated.timing(lowQualityOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleHighQualityLoad = () => {
    
    // Fade in high quality image
    Animated.timing(highQualityOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Fade out low quality image after high quality is visible
      Animated.timing(lowQualityOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    
    onLoad?.();
  };

  const handleError = (error: any) => {
    onError?.(error);
  };

  return (
    <View style={style} className={className}>
      {/* Low Quality Image */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: lowQualityOpacity,
        }}
      >
        <OptimizedImage
          source={getLowQualitySource()}
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          contentFit={contentFit}
          priority="high"
          cachePolicy="memory"
          onLoad={handleLowQualityLoad}
          onError={handleError}
          showLoadingIndicator={!lowQualityLoaded}
          alt={alt}
        />
      </Animated.View>

      {/* High Quality Image */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: highQualityOpacity,
        }}
      >
        <OptimizedImage
          source={source}
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          contentFit={contentFit}
          priority="normal"
          cachePolicy="memory-disk"
          onLoad={handleHighQualityLoad}
          onError={handleError}
          showLoadingIndicator={false}
          alt={alt}
        />
      </Animated.View>
    </View>
  );
};

export default ProgressiveImage;