import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Network from 'expo-network';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { checkNetworkConnectivity } from '../../utils/errorHandling';

interface NetworkErrorHandlerProps {
  onRetry?: () => Promise<void>;
  onOfflineMode?: () => void;
  showOfflineIndicator?: boolean;
  className?: string;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
  onRetry,
  onOfflineMode,
  showOfflineIndicator = true,
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  // Check network connectivity
  const checkConnectivity = useCallback(async () => {
    const connected = await checkNetworkConnectivity();
    setIsOnline(connected);
    return connected;
  }, []);

  // Handle retry action
  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const connected = await checkConnectivity();
      if (connected && onRetry) {
        await onRetry();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, checkConnectivity, onRetry]);

  // Handle offline mode
  const handleOfflineMode = useCallback(() => {
    Haptics.selectionAsync();
    onOfflineMode?.();
  }, [onOfflineMode]);

  // Monitor network state
  useEffect(() => {
    let networkSubscription: any;

    const setupNetworkMonitoring = async () => {
      // Initial check
      await checkConnectivity();

      // Set up network state listener
      networkSubscription = Network.addNetworkStateListener((state) => {
        const connected = state.isConnected && state.isInternetReachable;
        setIsOnline(connected || false);
      });
    };

    setupNetworkMonitoring();

    return () => {
      if (networkSubscription) {
        networkSubscription.remove();
      }
    };
  }, [checkConnectivity]);

  // Animate offline indicator
  useEffect(() => {
    if (!isOnline && showOfflineIndicator) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isOnline, showOfflineIndicator, slideAnim]);

  if (isOnline) {
    return null;
  }

  return (
    <>
      {/* Offline Indicator Banner */}
      {showOfflineIndicator && (
        <Animated.View
          className="absolute top-0 left-0 right-0 z-50"
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="bg-red-500 px-4 py-3 flex-row items-center justify-center">
            <Ionicons name="cloud-offline-outline" size={16} color="white" />
            <Text className="text-white font-medium text-sm ml-2">
              No internet connection
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Network Error Card */}
      <View className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Error Icon */}
        <View className="items-center mb-4">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="wifi-outline" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
            Connection Lost
          </Text>
        </View>

        {/* Error Message */}
        <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6 mb-6">
          Unable to connect to the internet. Please check your network connection and try again.
        </Text>

        {/* Network Status */}
        <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-700 dark:text-gray-300 font-medium">
              Network Status
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              <Text className="text-red-500 text-sm font-medium">
                Offline
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Check your WiFi or cellular connection
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          {/* Retry Button */}
          <TouchableOpacity
            className={`bg-forest-green px-6 py-4 rounded-2xl active:scale-95 ${
              isRetrying ? 'opacity-50' : ''
            }`}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name={isRetrying ? 'hourglass-outline' : 'refresh'} 
                size={20} 
                color="white" 
              />
              <Text className="text-white font-semibold text-base ml-2">
                {isRetrying ? 'Checking Connection...' : 'Try Again'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Offline Mode Button */}
          {onOfflineMode && (
            <TouchableOpacity
              className="bg-gray-200 dark:bg-gray-600 px-6 py-4 rounded-2xl active:scale-95"
              onPress={handleOfflineMode}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="download-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 dark:text-gray-300 font-semibold text-base ml-2">
                  Use Offline Mode
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        <View className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
            Troubleshooting tips:
          </Text>
          <View className="mt-2 space-y-1">
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Check your WiFi or cellular connection
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Try moving to an area with better signal
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
              • Restart your device if the problem persists
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');

  useEffect(() => {
    let networkSubscription: any;

    const setupNetworkMonitoring = async () => {
      // Initial check
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected === true && networkState.isInternetReachable === true);
      setNetworkType(networkState.type || 'unknown');

      // Set up listener
      networkSubscription = Network.addNetworkStateListener((state) => {
        setIsOnline(state.isConnected === true && state.isInternetReachable === true);
        setNetworkType(state.type || 'unknown');
      });
    };

    setupNetworkMonitoring();

    return () => {
      if (networkSubscription) {
        networkSubscription.remove();
      }
    };
  }, []);

  return { isOnline, networkType };
};

export default NetworkErrorHandler;