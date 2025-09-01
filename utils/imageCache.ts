import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';

interface CacheEntry {
  uri: string;
  localPath: string;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cacheDir: string;
  private maxCacheSize: number; // in bytes
  private maxCacheAge: number; // in milliseconds
  private cacheIndex: Map<string, CacheEntry> = new Map();
  private initialized = false;

  private constructor() {
    this.cacheDir = `${FileSystem.cacheDirectory}images/`;
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
    this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      // Load cache index from storage
      await this.loadCacheIndex();
      
      // Clean up expired entries
      await this.cleanupExpiredEntries();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize image cache:', error);
    }
  }

  private async loadCacheIndex(): Promise<void> {
    try {
      const indexData = await AsyncStorage.getItem('image_cache_index');
      if (indexData) {
        const entries = JSON.parse(indexData);
        this.cacheIndex = new Map(entries);
      }
    } catch (error) {
      console.error('Failed to load cache index:', error);
      this.cacheIndex = new Map();
    }
  }

  private async saveCacheIndex(): Promise<void> {
    try {
      const entries = Array.from(this.cacheIndex.entries());
      await AsyncStorage.setItem('image_cache_index', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save cache index:', error);
    }
  }

  private generateCacheKey(uri: string): string {
    // Create a safe filename from the URI
    return uri.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cacheIndex) {
      if (now - entry.timestamp > this.maxCacheAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.removeEntry(key);
    }
  }

  private async removeEntry(key: string): Promise<void> {
    const entry = this.cacheIndex.get(key);
    if (entry) {
      try {
        await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
        this.cacheIndex.delete(key);
      } catch (error) {
        console.error('Failed to remove cache entry:', error);
      }
    }
  }

  private async enforceCacheSize(): Promise<void> {
    const currentSize = this.getCurrentCacheSize();
    
    if (currentSize <= this.maxCacheSize) return;

    // Sort entries by last accessed time (LRU)
    const entries = Array.from(this.cacheIndex.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let sizeToRemove = currentSize - this.maxCacheSize;
    
    for (const [key, entry] of entries) {
      if (sizeToRemove <= 0) break;
      
      await this.removeEntry(key);
      sizeToRemove -= entry.size;
    }
  }

  private getCurrentCacheSize(): number {
    return Array.from(this.cacheIndex.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  async getCachedImage(uri: string): Promise<string | null> {
    await this.initialize();

    const entry = this.cacheIndex.get(uri);
    if (!entry) return null;

    try {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (!fileInfo.exists) {
        // File was deleted externally, remove from index
        this.cacheIndex.delete(uri);
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.cacheIndex.set(uri, entry);

      return entry.localPath;
    } catch (error) {
      console.error('Failed to check cached image:', error);
      return null;
    }
  }

  async cacheImage(uri: string): Promise<string | null> {
    await this.initialize();

    try {
      const cacheKey = this.generateCacheKey(uri);
      const localPath = `${this.cacheDir}${cacheKey}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Failed to download image: ${downloadResult.status}`);
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      const size = (fileInfo as any).size || 0;

      // Create cache entry
      const entry: CacheEntry = {
        uri,
        localPath,
        timestamp: Date.now(),
        size,
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      this.cacheIndex.set(uri, entry);
      
      // Enforce cache size limits
      await this.enforceCacheSize();
      
      // Save updated index
      await this.saveCacheIndex();

      return localPath;
    } catch (error) {
      console.error('Failed to cache image:', error);
      return null;
    }
  }

  async preloadImages(uris: string[]): Promise<void> {
    await this.initialize();

    const uncachedUris = [];
    
    // Check which images are not cached
    for (const uri of uris) {
      const cached = await this.getCachedImage(uri);
      if (!cached) {
        uncachedUris.push(uri);
      }
    }

    // Cache uncached images in parallel (with limit)
    const batchSize = 3;
    for (let i = 0; i < uncachedUris.length; i += batchSize) {
      const batch = uncachedUris.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(uri => this.cacheImage(uri))
      );
    }
  }

  async clearCache(): Promise<void> {
    await this.initialize();

    try {
      // Remove all cached files
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      
      // Recreate cache directory
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      
      // Clear index
      this.cacheIndex.clear();
      await AsyncStorage.removeItem('image_cache_index');
      
      // Clear Expo Image cache
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    await this.initialize();

    const entries = Array.from(this.cacheIndex.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const entryCount = entries.length;
    
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = totalAccess > 0 ? (totalAccess / entryCount) : 0;
    
    const timestamps = entries.map(entry => entry.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    return {
      totalSize,
      entryCount,
      hitRate,
      oldestEntry,
      newestEntry,
    };
  }

  async optimizeCache(): Promise<void> {
    await this.initialize();
    
    // Remove expired entries
    await this.cleanupExpiredEntries();
    
    // Enforce size limits
    await this.enforceCacheSize();
    
    // Save updated index
    await this.saveCacheIndex();
  }

  // Utility method to format cache size
  formatCacheSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

export const imageCache = ImageCacheManager.getInstance();
export default imageCache;