import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import type { NavigationRoute, RouteStep } from '../../hooks/useNavigation';

interface NavigationPanelProps {
  isVisible: boolean;
  currentStep: RouteStep | null;
  route: NavigationRoute | null;
  stepIndex: number;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onStopNavigation: () => void;
  onOpenInMaps: () => void;
  className?: string;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isVisible,
  currentStep,
  route,
  stepIndex,
  onNextStep,
  onPreviousStep,
  onStopNavigation,
  onOpenInMaps,
  className = "absolute bottom-0 left-0 right-0 z-50"
}) => {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  useEffect(() => {
    if (route && route.steps.length > 0) {
      const progress = (stepIndex + 1) / route.steps.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [stepIndex, route, progressAnim]);

  const handleNextStep = () => {
    Haptics.selectionAsync();
    onNextStep();
  };

  const handlePreviousStep = () => {
    Haptics.selectionAsync();
    onPreviousStep();
  };

  const handleStopNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStopNavigation();
  };

  const handleOpenInMaps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenInMaps();
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-left':
        return 'arrow-back';
      case 'turn-right':
        return 'arrow-forward';
      case 'turn-slight-left':
        return 'arrow-back-outline';
      case 'turn-slight-right':
        return 'arrow-forward-outline';
      case 'turn-sharp-left':
        return 'return-up-back';
      case 'turn-sharp-right':
        return 'return-up-forward';
      case 'uturn':
        return 'return-down-back';
      case 'straight':
        return 'arrow-up';
      case 'merge':
        return 'git-merge';
      case 'roundabout':
        return 'refresh-circle';
      default:
        return 'navigate';
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  if (!isVisible || !currentStep || !route) return null;

  const progress = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      className={className}
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Progress Bar */}
      <View className="h-1 bg-gray-200">
        <Animated.View
          className="h-full bg-forest-green"
          style={{ width: progress }}
        />
      </View>

      {/* Main Panel */}
      <View className="bg-white shadow-2xl">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center flex-1">
            <Text className="text-forest-green font-bold text-lg">
              Step {stepIndex + 1} of {route.steps.length}
            </Text>
            <View className="ml-3 px-2 py-1 bg-forest-green/10 rounded-full">
              <Text className="text-forest-green text-xs font-medium">
                {formatDistance(route.totalDistance)} • {formatDuration(route.totalDuration)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            onPress={handleStopNavigation}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Current Step */}
        <View className="px-4 py-4">
          <View className="flex-row items-start">
            {/* Maneuver Icon */}
            <View className="w-12 h-12 bg-forest-green rounded-full items-center justify-center mr-4 mt-1">
              <Ionicons 
                name={getManeuverIcon(currentStep.maneuver)} 
                size={24} 
                color="white" 
              />
            </View>

            {/* Instruction */}
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold leading-6 mb-2">
                {currentStep.instruction}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 text-sm mr-4">
                  {formatDistance(currentStep.distance)}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {formatDuration(currentStep.duration)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          {/* Previous Step */}
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl mr-2 ${
              stepIndex === 0 
                ? 'bg-gray-200' 
                : 'bg-white border border-gray-300 active:bg-gray-50'
            }`}
            onPress={handlePreviousStep}
            disabled={stepIndex === 0}
          >
            <Ionicons 
              name="chevron-back" 
              size={16} 
              color={stepIndex === 0 ? '#9CA3AF' : '#6B7280'} 
            />
            <Text className={`ml-1 font-medium text-sm ${
              stepIndex === 0 ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Previous
            </Text>
          </TouchableOpacity>

          {/* Open in Maps */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 px-4 bg-sage-green rounded-xl mx-1 active:bg-sage-green/90"
            onPress={handleOpenInMaps}
          >
            <Ionicons name="map" size={16} color="white" />
            <Text className="text-white font-medium ml-2 text-sm">
              Open in Maps
            </Text>
          </TouchableOpacity>

          {/* Next Step */}
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ml-2 ${
              stepIndex === route.steps.length - 1 
                ? 'bg-gray-200' 
                : 'bg-white border border-gray-300 active:bg-gray-50'
            }`}
            onPress={handleNextStep}
            disabled={stepIndex === route.steps.length - 1}
          >
            <Text className={`mr-1 font-medium text-sm ${
              stepIndex === route.steps.length - 1 ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Next
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={stepIndex === route.steps.length - 1 ? '#9CA3AF' : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default NavigationPanel;