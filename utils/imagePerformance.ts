import { Dimensions, PixelRatio } from 'react-native';

interface ImageLoadMetrics {
  uri: string;
  startTime: number;
  endTime?: number;
  loadTime?: number;
  success: boolean;
  error?: string;
  cacheHit?: boolean;
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

interface PerformanceStats {
  totalImages: number;
  successfulLoads: number;
  failedLoads: number;
  averageLoadTime: number;
  cacheHitRate: number;
  totalDataTransferred: number;
}

class ImagePerformanceMonitor {
  private metrics: Map<string, ImageLoadMetrics> = new Map();
  private listeners: ((stats: PerformanceStats) => void)[] = [];

  // Start tracking an image load
  startTracking(uri: string, cacheHit: boolean = false): void {
    const metric: ImageLoadMetrics = {
      uri,
      startTime: Date.now(),
      success: false,
      cacheHit,
    };
    
    this.metrics.set(uri, metric);
  }

  // Mark image load as successful
  markSuccess(
    uri: string, 
    dimensions?: { width: number; height: number },
    fileSize?: number
  ): void {
    const metric = this.metrics.get(uri);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.loadTime = metric.endTime - metric.startTime;
    metric.success = true;
    metric.dimensions = dimensions;
    metric.fileSize = fileSize;

    this.notifyListeners();
  }

  // Mark image load as failed
  markFailure(uri: string, error: string): void {
    const metric = this.metrics.get(uri);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.loadTime = metric.endTime - metric.startTime;
    metric.success = false;
    metric.error = error;

    this.notifyListeners();
  }

  // Get performance statistics
  getStats(): PerformanceStats {
    const completedMetrics = Array.from(this.metrics.values()).filter(
      m => m.endTime !== undefined
    );

    const successfulLoads = completedMetrics.filter(m => m.success);
    const failedLoads = completedMetrics.filter(m => !m.success);
    const cacheHits = completedMetrics.filter(m => m.cacheHit);

    const totalLoadTime = successfulLoads.reduce((sum, m) => sum + (m.loadTime || 0), 0);
    const averageLoadTime = successfulLoads.length > 0 
      ? totalLoadTime / successfulLoads.length 
      : 0;

    const totalDataTransferred = successfulLoads.reduce(
      (sum, m) => sum + (m.fileSize || 0), 
      0
    );

    return {
      totalImages: completedMetrics.length,
      successfulLoads: successfulLoads.length,
      failedLoads: failedLoads.length,
      averageLoadTime,
      cacheHitRate: completedMetrics.length > 0 
        ? cacheHits.length / completedMetrics.length 
        : 0,
      totalDataTransferred,
    };
  }

  // Add performance listener
  addListener(callback: (stats: PerformanceStats) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.notifyListeners();
  }

  // Get detailed metrics for debugging
  getDetailedMetrics(): ImageLoadMetrics[] {
    return Array.from(this.metrics.values());
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => listener(stats));
  }
}

// Global performance monitor instance
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Performance optimization utilities
export const ImageOptimizationUtils = {
  // Calculate optimal image dimensions for screen
  getOptimalDimensions: (
    containerWidth: number,
    containerHeight: number,
    maxScale: number = 2
  ) => {
    const pixelRatio = PixelRatio.get();
    const scale = Math.min(pixelRatio, maxScale);
    
    return {
      width: Math.round(containerWidth * scale),
      height: Math.round(containerHeight * scale),
    };
  },

  // Check if image should be loaded based on viewport
  shouldLoadImage: (
    imagePosition: { x: number; y: number; width: number; height: number },
    viewportSize: { width: number; height: number },
    threshold: number = 100
  ): boolean => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    
    // Check if image is within viewport + threshold
    return (
      imagePosition.x + imagePosition.width >= -threshold &&
      imagePosition.x <= screenWidth + threshold &&
      imagePosition.y + imagePosition.height >= -threshold &&
      imagePosition.y <= screenHeight + threshold
    );
  },

  // Estimate memory usage for image
  estimateMemoryUsage: (width: number, height: number, channels: number = 4): number => {
    // RGBA = 4 bytes per pixel
    return width * height * channels;
  },

  // Check if device has sufficient memory for image
  canLoadImage: (width: number, height: number): boolean => {
    const estimatedMemory = ImageOptimizationUtils.estimateMemoryUsage(width, height);
    const maxMemoryPerImage = 50 * 1024 * 1024; // 50MB limit
    
    return estimatedMemory <= maxMemoryPerImage;
  },

  // Get recommended image quality based on network and device
  getRecommendedQuality: (): number => {
    // This would ideally check network conditions and device capabilities
    // For now, return a conservative quality
    const pixelRatio = PixelRatio.get();
    
    if (pixelRatio >= 3) return 0.8; // High DPI devices
    if (pixelRatio >= 2) return 0.7; // Medium DPI devices
    return 0.6; // Low DPI devices
  },
};

// Hook for monitoring image performance
export const useImagePerformance = () => {
  const startTracking = (uri: string, cacheHit?: boolean) => {
    imagePerformanceMonitor.startTracking(uri, cacheHit);
  };

  const markSuccess = (
    uri: string, 
    dimensions?: { width: number; height: number },
    fileSize?: number
  ) => {
    imagePerformanceMonitor.markSuccess(uri, dimensions, fileSize);
  };

  const markFailure = (uri: string, error: string) => {
    imagePerformanceMonitor.markFailure(uri, error);
  };

  const getStats = () => {
    return imagePerformanceMonitor.getStats();
  };

  return {
    startTracking,
    markSuccess,
    markFailure,
    getStats,
  };
};