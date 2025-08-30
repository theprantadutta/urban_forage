import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { imagePerformanceMonitor } from '../../utils/imagePerformance';
import { navigationPerformanceMonitor } from '../../utils/navigationOptimization';

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible = __DEV__, // Only show in development by default
  position = 'top-right',
}) => {
  const [imageStats, setImageStats] = useState({
    totalImages: 0,
    successfulLoads: 0,
    failedLoads: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  });
  
  const [memoryUsage, setMemoryUsage] = useState(0);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!visible) return;

    const updateStats = () => {
      const stats = imagePerformanceMonitor.getStats();
      setImageStats(stats);
    };

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    // Monitor memory usage (simplified)
    const updateMemory = () => {
      // In a real app, you'd use a native module to get actual memory usage
      // For now, we'll estimate based on image cache
      const estimatedMemory = imageStats.totalImages * 0.5; // 0.5MB per image estimate
      setMemoryUsage(estimatedMemory);
    };

    const interval = setInterval(updateMemory, 5000);
    updateMemory();

    return () => clearInterval(interval);
  }, [visible, imageStats.totalImages]);

  if (!visible) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 9999,
      padding: 8,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 8,
      minWidth: 200,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 50, left: 10 };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 10 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 50, left: 10 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 50, right: 10 };
      default:
        return { ...baseStyle, top: 50, right: 10 };
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    return `${Math.round(ms)}ms`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <View style={getPositionStyle()}>
      <Text style={[styles.title, { color: colors.text }]}>Performance</Text>
      
      {/* Image Performance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Images</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Loaded: {imageStats.successfulLoads}/{imageStats.totalImages}
        </Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Failed: {imageStats.failedLoads}
        </Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Avg Load: {formatTime(imageStats.averageLoadTime)}
        </Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Cache Hit: {formatPercentage(imageStats.cacheHitRate)}
        </Text>
      </View>

      {/* Memory Usage */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Memory</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Est. Usage: {formatBytes(memoryUsage * 1024 * 1024)}
        </Text>
      </View>

      {/* Navigation Performance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Navigation</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>
          Screens: {navigationPerformanceMonitor.getMetrics().size}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  stat: {
    fontSize: 10,
    marginBottom: 2,
  },
});

PerformanceMonitor.displayName = 'PerformanceMonitor';