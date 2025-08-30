import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { FoodListing } from './FoodMarker';

export interface ClusterData {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  pointCount: number;
  listings: FoodListing[];
}

interface ClusterMarkerProps {
  cluster: ClusterData;
  onPress?: (cluster: ClusterData) => void;
  isExpanding?: boolean;
}

const getCategoryDistribution = (listings: FoodListing[]) => {
  const distribution: Record<string, number> = {};
  listings.forEach(listing => {
    distribution[listing.category] = (distribution[listing.category] || 0) + 1;
  });
  return distribution;
};

const getDominantCategory = (listings: FoodListing[]): FoodListing['category'] => {
  const distribution = getCategoryDistribution(listings);
  return Object.entries(distribution).reduce((a, b) => 
    distribution[a[0]] > distribution[b[0]] ? a : b
  )[0] as FoodListing['category'];
};

const getCategoryColor = (category: FoodListing['category']): string => {
  switch (category) {
    case 'vegetables':
      return '#22c55e'; // Green
    case 'fruits':
      return '#f59e0b'; // Orange
    case 'bakery':
      return '#8b5cf6'; // Purple
    case 'dairy':
      return '#06b6d4'; // Cyan
    case 'prepared':
      return '#ef4444'; // Red
    case 'other':
    default:
      return '#6b7280'; // Gray
  }
};

const getClusterSize = (pointCount: number): number => {
  if (pointCount < 10) return 50;
  if (pointCount < 25) return 60;
  if (pointCount < 50) return 70;
  return 80;
};

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  cluster,
  onPress,
  isExpanding = false
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const dominantCategory = getDominantCategory(cluster.listings);
  const categoryColor = getCategoryColor(dominantCategory);
  const clusterSize = getClusterSize(cluster.pointCount);
  const distribution = getCategoryDistribution(cluster.listings);

  // Entry animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  // Pulsing animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  // Expansion animation
  useEffect(() => {
    if (isExpanding) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExpanding, scaleAnim, rotateAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Quick scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isExpanding ? 1.5 : 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(cluster);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Marker
      coordinate={cluster.coordinate}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
            { rotate: rotation },
          ],
        }}
      >
        <View className="items-center">
          {/* Main Cluster Circle */}
          <View 
            className="rounded-full items-center justify-center shadow-lg border-3 border-white"
            style={{ 
              backgroundColor: categoryColor,
              width: clusterSize,
              height: clusterSize,
            }}
          >
            {/* Count Display */}
            <Text className="text-white font-bold text-lg">
              {cluster.pointCount}
            </Text>
            
            {/* Category Icon */}
            <View className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full items-center justify-center shadow-md">
              <Ionicons
                name="apps"
                size={12}
                color={categoryColor}
              />
            </View>
          </View>

          {/* Category Distribution Indicators */}
          {Object.keys(distribution).length > 1 && (
            <View className="absolute -bottom-2 flex-row">
              {Object.entries(distribution).slice(0, 3).map(([category, count], index) => (
                <View
                  key={category}
                  className="w-3 h-3 rounded-full border border-white mx-0.5"
                  style={{ 
                    backgroundColor: getCategoryColor(category as FoodListing['category']),
                    transform: [{ scale: count > 1 ? 1.2 : 1 }],
                  }}
                />
              ))}
              {Object.keys(distribution).length > 3 && (
                <View className="w-3 h-3 rounded-full border border-white mx-0.5 bg-gray-400 items-center justify-center">
                  <Text className="text-white text-xs font-bold">+</Text>
                </View>
              )}
            </View>
          )}

          {/* Urgent Indicator */}
          {cluster.listings.some(listing => listing.isUrgent) && (
            <View className="absolute -top-3 -left-3 w-4 h-4 rounded-full bg-red-500 border-2 border-white">
              <Animated.View
                className="w-full h-full rounded-full bg-red-500"
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </Marker>
  );
};

export default ClusterMarker;