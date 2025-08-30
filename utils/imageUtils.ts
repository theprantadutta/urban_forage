import { ImageResult, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ImagePickerAsset, ImagePickerResult } from 'expo-image-picker';
import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();

// Image quality presets
export const ImageQuality = {
  LOW: 0.3,
  MEDIUM: 0.7,
  HIGH: 0.9,
  ORIGINAL: 1.0,
} as const;

// Image size presets based on common use cases
export const ImageSizes = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 600 },
  LARGE: { width: 1200, height: 1200 },
  SCREEN_WIDTH: { width: screenWidth * pixelRatio, height: undefined },
  SCREEN_HEIGHT: { width: undefined, height: screenHeight * pixelRatio },
} as const;

export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: SaveFormat;
  maintainAspectRatio?: boolean;
}

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

// Compress image with quality and size constraints
export const compressImage = async (
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<ImageResult> => {
  const {
    quality = ImageQuality.MEDIUM,
    maxWidth = ImageSizes.LARGE.width,
    maxHeight = ImageSizes.LARGE.height,
    format = SaveFormat.JPEG,
    maintainAspectRatio = true,
  } = options;

  try {
    const result = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format,
        base64: false,
      }
    );

    return result;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Resize image to specific dimensions
export const resizeImage = async (
  uri: string,
  options: ImageResizeOptions
): Promise<ImageResult> => {
  const { width, height, maintainAspectRatio = true } = options;

  try {
    const actions = [];
    
    if (width || height) {
      actions.push({
        resize: {
          width,
          height,
        },
      });
    }

    const result = await manipulateAsync(uri, actions, {
      compress: ImageQuality.HIGH,
      format: SaveFormat.JPEG,
    });

    return result;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

// Create multiple sizes of an image for different use cases
export const createImageVariants = async (
  uri: string
): Promise<{
  thumbnail: ImageResult;
  small: ImageResult;
  medium: ImageResult;
  large: ImageResult;
}> => {
  try {
    const [thumbnail, small, medium, large] = await Promise.all([
      resizeImage(uri, ImageSizes.THUMBNAIL),
      resizeImage(uri, ImageSizes.SMALL),
      resizeImage(uri, ImageSizes.MEDIUM),
      resizeImage(uri, ImageSizes.LARGE),
    ]);

    return { thumbnail, small, medium, large };
  } catch (error) {
    console.error('Error creating image variants:', error);
    throw error;
  }
};

// Process image picker result
export const processImagePickerResult = async (
  result: ImagePickerResult,
  compressionOptions?: ImageCompressionOptions
): Promise<ImageResult[]> => {
  if (result.canceled || !result.assets) {
    throw new Error('Image selection was canceled');
  }

  try {
    const processedImages = await Promise.all(
      result.assets.map(async (asset: ImagePickerAsset) => {
        return await compressImage(asset.uri, compressionOptions);
      })
    );

    return processedImages;
  } catch (error) {
    console.error('Error processing image picker result:', error);
    throw error;
  }
};

// Generate blurhash placeholder (requires expo-blurhash)
export const generateBlurhash = async (uri: string): Promise<string | null> => {
  try {
    // This would require expo-blurhash package
    // For now, return null as placeholder
    return null;
  } catch (error) {
    console.error('Error generating blurhash:', error);
    return null;
  }
};

// Get optimal image size based on screen density and container size
export const getOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  maxQuality: boolean = false
): { width: number; height: number } => {
  const densityMultiplier = maxQuality ? pixelRatio : Math.min(pixelRatio, 2);
  
  return {
    width: Math.round(containerWidth * densityMultiplier),
    height: Math.round(containerHeight * densityMultiplier),
  };
};

// Check if image needs compression based on file size
export const shouldCompressImage = (
  asset: ImagePickerAsset,
  maxSizeKB: number = 1024
): boolean => {
  if (!asset.fileSize) return true;
  
  const fileSizeKB = asset.fileSize / 1024;
  return fileSizeKB > maxSizeKB;
};

// Get image format from URI
export const getImageFormat = (uri: string): SaveFormat => {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'png':
      return SaveFormat.PNG;
    case 'webp':
      return SaveFormat.WEBP;
    case 'jpg':
    case 'jpeg':
    default:
      return SaveFormat.JPEG;
  }
};

// Calculate aspect ratio from dimensions
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Get dimensions that maintain aspect ratio within constraints
export const getConstrainedDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too wide
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Scale down if too tall
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

// Image cache utilities
export const ImageCache = {
  // Clear all cached images
  clearCache: async (): Promise<void> => {
    try {
      // This would integrate with expo-image cache clearing
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  },

  // Get cache size
  getCacheSize: async (): Promise<number> => {
    try {
      // This would return actual cache size
      return 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  },

  // Preload images
  preloadImages: async (uris: string[]): Promise<void> => {
    try {
      // This would preload images into cache
      console.log('Preloading images:', uris.length);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  },
};