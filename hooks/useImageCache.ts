import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';

interface ImageCacheEntry {
  uri: string;
  timestamp: number;
  size?: number;
}

interface UseImageCacheOptions {
  maxCacheSize?: number; // in MB
  maxAge?: number; // in milliseconds
  preloadImages?: string[];
}

interface UseImageCacheReturn {
  isImageCached: (uri: string) => Promise<boolean>;
  preloadImage: (uri: string) => Promise<void>;
  preloadImages: (uris: string[]) => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheSize: () => Promise<number>;
  getCacheInfo: () => Promise<ImageCacheEntry[]>;
}

const CACHE_KEY = '@image_cache_info';
const DEFAULT_MAX_CACHE_SIZE = 100; // 100MB
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useImageCache = (
  options: UseImageCacheOptions = {}
): UseImageCacheReturn => {
  const {
    maxCacheSize = DEFAULT_MAX_CACHE_SIZE,
    maxAge = DEFAULT_MAX_AGE,
    preloadImages = [],
  } = options;

  const [cacheInfo, setCacheInfo] = useState<ImageCacheEntry[]>([]);

  // Load cache info from storage
  useEffect(() => {
    loadCacheInfo();
  }, []);

  // Preload specified images on mount
  useEffect(() => {
    if (preloadImages.length > 0) {
      preloadImagesInternal(preloadImages);
    }
  }, [preloadImages]);

  const loadCacheInfo = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      if (stored) {
        const info: ImageCacheEntry[] = JSON.parse(stored);
        setCacheInfo(info);
      }
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  const saveCacheInfo = async (info: ImageCacheEntry[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(info));
      setCacheInfo(info);
    } catch (error) {
      console.error('Error saving cache info:', error);
    }
  };

  const isImageCached = useCallback(async (uri: string): Promise<boolean> => {
    try {
      // Check if image exists in Expo Image cache
      // This is a simplified check - in reality, you'd use expo-image cache APIs
      const entry = cacheInfo.find(item => item.uri === uri);
      if (!entry) return false;

      // Check if cache entry is still valid
      const now = Date.now();
      const isExpired = now - entry.timestamp > maxAge;
      
      if (isExpired) {
        // Remove expired entry
        const updatedInfo = cacheInfo.filter(item => item.uri !== uri);
        await saveCacheInfo(updatedInfo);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking image cache:', error);
      return false;
    }
  }, [cacheInfo, maxAge]);

  const preloadImage = useCallback(async (uri: string): Promise<void> => {
    try {
      // Check if already cached
      const cached = await isImageCached(uri);
      if (cached) return;

      // Preload image using Expo Image
      await Image.prefetch(uri);

      // Add to cache info
      const newEntry: ImageCacheEntry = {
        uri,
        timestamp: Date.now(),
      };

      const updatedInfo = [...cacheInfo.filter(item => item.uri !== uri), newEntry];
      await saveCacheInfo(updatedInfo);
    } catch (error) {
      console.error('Error preloading image:', error);
    }
  }, [cacheInfo, isImageCached]);

  const preloadImagesInternal = useCallback(async (uris: string[]): Promise<void> => {
    try {
      // Preload images in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < uris.length; i += batchSize) {
        const batch = uris.slice(i, i + batchSize);
        await Promise.all(batch.map(uri => preloadImage(uri)));
        
        // Small delay between batches
        if (i + batchSize < uris.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  }, [preloadImage]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      // Clear Expo Image cache
      await Image.clearDiskCache();
      await Image.clearMemoryCache();

      // Clear our cache info
      await AsyncStorage.removeItem(CACHE_KEY);
      setCacheInfo([]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    try {
      // This would return actual cache size in MB
      // For now, estimate based on number of cached images
      return cacheInfo.length * 0.5; // Rough estimate: 0.5MB per image
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }, [cacheInfo]);

  const getCacheInfo = useCallback(async (): Promise<ImageCacheEntry[]> => {
    return cacheInfo;
  }, [cacheInfo]);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanupExpiredEntries = async () => {
      const now = Date.now();
      const validEntries = cacheInfo.filter(
        entry => now - entry.timestamp <= maxAge
      );

      if (validEntries.length !== cacheInfo.length) {
        await saveCacheInfo(validEntries);
      }
    };

    // Run cleanup every hour
    const interval = setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cacheInfo, maxAge]);

  return {
    isImageCached,
    preloadImage,
    preloadImages: preloadImagesInternal,
    clearCache,
    getCacheSize,
    getCacheInfo,
  };
};

// Hook for managing image loading states
export const useImageLoading = (uri?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    if (!uri) return;

    setIsLoading(true);
    setHasError(false);
    setLoadTime(null);

    const startTime = Date.now();

    // Preload image to check if it loads successfully
    Image.prefetch(uri)
      .then(() => {
        setIsLoading(false);
        setLoadTime(Date.now() - startTime);
      })
      .catch(() => {
        setIsLoading(false);
        setHasError(true);
      });
  }, [uri]);

  return {
    isLoading,
    hasError,
    loadTime,
  };
};