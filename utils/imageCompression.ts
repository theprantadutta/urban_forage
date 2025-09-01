import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();

export interface CompressionOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  resize?: 'contain' | 'cover' | 'stretch';
}

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  compressionRatio: number;
}

class ImageCompressionService {
  private static instance: ImageCompressionService;

  static getInstance(): ImageCompressionService {
    if (!ImageCompressionService.instance) {
      ImageCompressionService.instance = new ImageCompressionService();
    }
    return ImageCompressionService.instance;
  }

  // Preset compression configurations
  private presets = {
    thumbnail: {
      quality: 0.6,
      maxWidth: 150,
      maxHeight: 150,
      format: 'jpeg' as const,
    },
    small: {
      quality: 0.7,
      maxWidth: 300,
      maxHeight: 300,
      format: 'jpeg' as const,
    },
    medium: {
      quality: 0.8,
      maxWidth: 600,
      maxHeight: 600,
      format: 'jpeg' as const,
    },
    large: {
      quality: 0.85,
      maxWidth: 1200,
      maxHeight: 1200,
      format: 'jpeg' as const,
    },
    original: {
      quality: 0.9,
      format: 'jpeg' as const,
    },
  };

  async compressImage(
    uri: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    try {
      // Get original file info
      const originalInfo = await FileSystem.getInfoAsync(uri);
      const originalSize = (originalInfo as any).size || 0;

      // Get image dimensions
      const imageInfo = await this.getImageInfo(uri);
      
      // Calculate optimal dimensions
      const targetDimensions = this.calculateTargetDimensions(
        imageInfo.width,
        imageInfo.height,
        options
      );

      // Prepare manipulation actions
      const actions: ImageManipulator.Action[] = [];

      // Add resize action if needed
      if (
        targetDimensions.width !== imageInfo.width ||
        targetDimensions.height !== imageInfo.height
      ) {
        actions.push({
          resize: {
            width: targetDimensions.width,
            height: targetDimensions.height,
          },
        });
      }

      // Perform image manipulation
      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        {
          compress: options.quality || 0.8,
          format: this.getImageFormat(options.format),
          base64: false,
        }
      );

      // Get compressed file info
      const compressedInfo = await FileSystem.getInfoAsync(result.uri);
      const compressedSize = (compressedInfo as any).size || 0;

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: compressedSize,
        compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      throw error;
    }
  }

  async compressForUpload(uri: string): Promise<CompressionResult> {
    return this.compressImage(uri, this.presets.large);
  }

  async createThumbnail(uri: string): Promise<CompressionResult> {
    return this.compressImage(uri, this.presets.thumbnail);
  }

  async createMultipleSizes(
    uri: string,
    sizes: (keyof typeof this.presets)[] = ['thumbnail', 'small', 'medium', 'large']
  ): Promise<Record<string, CompressionResult>> {
    const results: Record<string, CompressionResult> = {};

    for (const size of sizes) {
      try {
        results[size] = await this.compressImage(uri, this.presets[size]);
      } catch (error) {
        console.error(`Failed to create ${size} version:`, error);
      }
    }

    return results;
  }

  private async getImageInfo(uri: string): Promise<{ width: number; height: number }> {
    try {
      // For local files, we need to use ImageManipulator to get dimensions
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 1,
        base64: false,
      });
      
      return {
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Failed to get image info:', error);
      // Return default dimensions as fallback
      return { width: 1000, height: 1000 };
    }
  }

  private calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    options: CompressionOptions
  ): { width: number; height: number } {
    let { maxWidth, maxHeight } = options;

    // Use screen dimensions as default max if not specified
    if (!maxWidth && !maxHeight) {
      maxWidth = screenWidth * pixelRatio;
      maxHeight = screenHeight * pixelRatio;
    }

    // If only one dimension is specified, calculate the other
    if (maxWidth && !maxHeight) {
      maxHeight = (maxWidth * originalHeight) / originalWidth;
    } else if (maxHeight && !maxWidth) {
      maxWidth = (maxHeight * originalWidth) / originalHeight;
    }

    // If image is smaller than max dimensions, don't upscale
    if (originalWidth <= (maxWidth || originalWidth) && 
        originalHeight <= (maxHeight || originalHeight)) {
      return { width: originalWidth, height: originalHeight };
    }

    // Calculate scale factor to fit within max dimensions
    const scaleX = maxWidth ? maxWidth / originalWidth : 1;
    const scaleY = maxHeight ? maxHeight / originalHeight : 1;
    const scale = Math.min(scaleX, scaleY);

    return {
      width: Math.round(originalWidth * scale),
      height: Math.round(originalHeight * scale),
    };
  }

  private getImageFormat(format?: string): ImageManipulator.SaveFormat {
    switch (format) {
      case 'png':
        return ImageManipulator.SaveFormat.PNG;
      case 'webp':
        return ImageManipulator.SaveFormat.WEBP;
      case 'jpeg':
      default:
        return ImageManipulator.SaveFormat.JPEG;
    }
  }

  // Utility method to estimate optimal quality based on image size
  getOptimalQuality(width: number, height: number): number {
    const pixels = width * height;
    
    if (pixels > 2000000) { // > 2MP
      return 0.7;
    } else if (pixels > 1000000) { // > 1MP
      return 0.75;
    } else if (pixels > 500000) { // > 0.5MP
      return 0.8;
    } else {
      return 0.85;
    }
  }

  // Method to check if compression is needed
  shouldCompress(
    width: number,
    height: number,
    fileSize: number,
    maxFileSize: number = 2 * 1024 * 1024 // 2MB
  ): boolean {
    const maxDimension = Math.max(screenWidth, screenHeight) * pixelRatio;
    const exceedsSize = fileSize > maxFileSize;
    const exceedsDimensions = width > maxDimension || height > maxDimension;
    
    return exceedsSize || exceedsDimensions;
  }

  // Batch compression for multiple images
  async compressBatch(
    uris: string[],
    options: CompressionOptions = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];
    
    for (let i = 0; i < uris.length; i++) {
      try {
        const result = await this.compressImage(uris[i], options);
        results.push(result);
        onProgress?.(i + 1, uris.length);
      } catch (error) {
        console.error(`Failed to compress image ${i}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    return results;
  }
}

export const imageCompression = ImageCompressionService.getInstance();
export default imageCompression;