import { useCallback, useEffect, useState } from 'react';
import { imageCache } from '../utils/imageCache';
import { CompressionResult, imageCompression } from '../utils/imageCompression';

interface UseImageOptimizationOptions {
  enableCaching?: boolean;
  enableCompression?: boolean;
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
  preloadImages?: string[];
}

interface ImageOptimizationState {
  isLoading: boolean;
  error: string | null;
  cacheStats: {
    totalSize: number;
    entryCount: number;
    hitRate: number;
  } | null;
}

export const useImageOptimization = (options: UseImageOptimizationOptions = {}) => {
  const {
    enableCaching = true,
    enableCompression = true,
    compressionQuality = 0.8,
    maxWidth,
    maxHeight,
    preloadImages = [],
  } = options;

  const [state, setState] = useState<ImageOptimizationState>({
    isLoading: false,
    error: null,
    cacheStats: null,
  });

  // Initialize cache and preload images
  useEffect(() => {
    const initialize = async () => {
      if (!enableCaching) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        await imageCache.initialize();
        
        if (preloadImages.length > 0) {
          await imageCache.preloadImages(preloadImages);
        }
        
        const stats = await imageCache.getCacheStats();
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          cacheStats: stats 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize cache'
        }));
      }
    };

    initialize();
  }, [enableCaching, preloadImages]);

  // Get optimized image URI
  const getOptimizedImage = useCallback(async (uri: string): Promise<string> => {
    try {
      // Check cache first if enabled
      if (enableCaching) {
        const cachedUri = await imageCache.getCachedImage(uri);
        if (cachedUri) {
          return cachedUri;
        }
      }

      // Compress image if needed
      if (enableCompression) {
        const compressionResult = await imageCompression.compressImage(uri, {
          quality: compressionQuality,
          maxWidth,
          maxHeight,
        });
        
        // Cache the compressed image
        if (enableCaching) {
          const cachedUri = await imageCache.cacheImage(compressionResult.uri);
          return cachedUri || compressionResult.uri;
        }
        
        return compressionResult.uri;
      }

      // Cache original image if no compression needed
      if (enableCaching) {
        const cachedUri = await imageCache.cacheImage(uri);
        return cachedUri || uri;
      }

      return uri;
    } catch (error) {
      console.error('Failed to optimize image:', error);
      return uri; // Return original URI as fallback
    }
  }, [enableCaching, enableCompression, compressionQuality, maxWidth, maxHeight]);

  // Compress image for upload
  const compressForUpload = useCallback(async (uri: string): Promise<CompressionResult> => {
    return imageCompression.compressForUpload(uri);
  }, []);

  // Create thumbnail
  const createThumbnail = useCallback(async (uri: string): Promise<CompressionResult> => {
    return imageCompression.createThumbnail(uri);
  }, []);

  // Create multiple sizes
  const createMultipleSizes = useCallback(async (uri: string, sizes?: string[]) => {
    return imageCompression.createMultipleSizes(uri, sizes as any);
  }, []);

  // Preload additional images
  const preloadAdditionalImages = useCallback(async (uris: string[]) => {
    if (!enableCaching) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await imageCache.preloadImages(uris);
      
      const stats = await imageCache.getCacheStats();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        cacheStats: stats 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to preload images'
      }));
    }
  }, [enableCaching]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!enableCaching) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await imageCache.clearCache();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        cacheStats: { totalSize: 0, entryCount: 0, hitRate: 0 }
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to clear cache'
      }));
    }
  }, [enableCaching]);

  // Optimize cache
  const optimizeCache = useCallback(async () => {
    if (!enableCaching) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await imageCache.optimizeCache();
      
      const stats = await imageCache.getCacheStats();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        cacheStats: stats 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to optimize cache'
      }));
    }
  }, [enableCaching]);

  // Get cache statistics
  const refreshCacheStats = useCallback(async () => {
    if (!enableCaching) return;
    
    try {
      const stats = await imageCache.getCacheStats();
      setState(prev => ({ ...prev, cacheStats: stats }));
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }
  }, [enableCaching]);

  // Format cache size for display
  const formatCacheSize = useCallback((bytes: number): string => {
    return imageCache.formatCacheSize(bytes);
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    cacheStats: state.cacheStats,
    
    // Methods
    getOptimizedImage,
    compressForUpload,
    createThumbnail,
    createMultipleSizes,
    preloadAdditionalImages,
    clearCache,
    optimizeCache,
    refreshCacheStats,
    formatCacheSize,
  };
};

export default useImageOptimization;