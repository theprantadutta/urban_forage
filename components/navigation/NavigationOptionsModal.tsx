import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import type { NavigationDestination, NavigationOptions } from '../../hooks/useNavigation';

interface NavigationApp {
  name: string;
  available: boolean;
  action: () => Promise<boolean>;
}

interface NavigationOptionsModalProps {
  isVisible: boolean;
  destination: NavigationDestination | null;
  navigationApps: NavigationApp[];
  onClose: () => void;
  onStartInAppNavigation: (destination: NavigationDestination, options?: NavigationOptions) => Promise<boolean>;
  onCalculateETA: (destination: NavigationDestination) => Promise<number | null>;
}

export const NavigationOptionsModal: React.FC<NavigationOptionsModalProps> = ({
  isVisible,
  destination,
  navigationApps,
  onClose,
  onStartInAppNavigation,
  onCalculateETA,
}) => {
  const [selectedMode, setSelectedMode] = React.useState<'driving' | 'walking'>('driving');
  const [eta, setEta] = React.useState<number | null>(null);
  const [isCalculatingETA, setIsCalculatingETA] = React.useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const calculateETA = React.useCallback(async () => {
    if (!destination) return;
    
    setIsCalculatingETA(true);
    try {
      const estimatedTime = await onCalculateETA(destination);
      setEta(estimatedTime);
    } catch (error) {
      console.error('ETA calculation error:', error);
    } finally {
      setIsCalculatingETA(false);
    }
  }, [destination, onCalculateETA]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Calculate ETA when modal opens
      if (destination) {
        calculateETA();
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, destination, fadeAnim, scaleAnim, calculateETA]);

  const handleClose = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const handleModeChange = (mode: 'driving' | 'walking') => {
    Haptics.selectionAsync();
    setSelectedMode(mode);
    calculateETA(); // Recalculate ETA for new mode
  };

  const handleStartInAppNavigation = async () => {
    if (!destination) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await onStartInAppNavigation(destination, { mode: selectedMode });
      onClose();
    } catch (error) {
      console.error('Start navigation error:', error);
    }
  };

  const handleExternalNavigation = async (app: NavigationApp) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await app.action();
      onClose();
    } catch (error) {
      console.error('External navigation error:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getAppIcon = (appName: string) => {
    switch (appName.toLowerCase()) {
      case 'apple maps':
        return 'map';
      case 'google maps':
        return 'navigate-circle';
      case 'waze':
        return 'car-sport';
      default:
        return 'navigate';
    }
  };

  if (!destination) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        className="flex-1 bg-black/50 justify-end"
        style={{ opacity: fadeAnim }}
      >
        {/* Backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Modal Content */}
        <Animated.View
          className="bg-white rounded-t-3xl shadow-2xl"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 text-xl font-bold">
                  Navigate to
                </Text>
                <Text className="text-gray-600 text-base mt-1" numberOfLines={1}>
                  {destination.title || `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`}
                </Text>
              </View>
              <TouchableOpacity
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                onPress={handleClose}
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* ETA Display */}
            <View className="mt-4 p-3 bg-forest-green/10 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#2D5016" />
                <Text className="text-forest-green font-medium ml-2">
                  Estimated arrival: {' '}
                  {isCalculatingETA ? (
                    <Text className="text-gray-500">Calculating...</Text>
                  ) : eta ? (
                    <Text className="font-bold">{formatDuration(eta)}</Text>
                  ) : (
                    <Text className="text-gray-500">Unknown</Text>
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Travel Mode Selection */}
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 font-semibold mb-3">Travel Mode</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2 ${
                  selectedMode === 'driving'
                    ? 'border-forest-green bg-forest-green/10'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => handleModeChange('driving')}
              >
                <Ionicons 
                  name="car" 
                  size={20} 
                  color={selectedMode === 'driving' ? '#2D5016' : '#6B7280'} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedMode === 'driving' ? 'text-forest-green' : 'text-gray-700'
                }`}>
                  Driving
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2 ${
                  selectedMode === 'walking'
                    ? 'border-forest-green bg-forest-green/10'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => handleModeChange('walking')}
              >
                <Ionicons 
                  name="walk" 
                  size={20} 
                  color={selectedMode === 'walking' ? '#2D5016' : '#6B7280'} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedMode === 'walking' ? 'text-forest-green' : 'text-gray-700'
                }`}>
                  Walking
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Options */}
          <View className="px-6 py-4">
            <Text className="text-gray-900 font-semibold mb-4">Choose Navigation App</Text>
            
            {/* In-App Navigation */}
            <TouchableOpacity
              className="flex-row items-center p-4 bg-forest-green rounded-xl mb-3 active:bg-forest-green/90"
              onPress={handleStartInAppNavigation}
            >
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                <Ionicons name="navigate" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  UrbanForage Navigation
                </Text>
                <Text className="text-white/80 text-sm">
                  Navigate within the app
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>

            {/* External Navigation Apps */}
            {navigationApps.map((app, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  app.available 
                    ? 'bg-gray-50 active:bg-gray-100' 
                    : 'bg-gray-100 opacity-50'
                }`}
                onPress={() => app.available && handleExternalNavigation(app)}
                disabled={!app.available}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  app.available ? 'bg-gray-200' : 'bg-gray-300'
                }`}>
                  <Ionicons 
                    name={getAppIcon(app.name)} 
                    size={24} 
                    color={app.available ? '#6B7280' : '#9CA3AF'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold text-base ${
                    app.available ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {app.name}
                  </Text>
                  <Text className={`text-sm ${
                    app.available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {app.available ? 'Open in external app' : 'Not installed'}
                  </Text>
                </View>
                {app.available && (
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Padding for Safe Area */}
          <View className="h-8" />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default NavigationOptionsModal;