import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { retryWithBackoff } from '../../utils/errorHandling';

interface RetryHandlerProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  retryCount?: number;
  error?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const RetryHandler: React.FC<RetryHandlerProps> = ({
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  autoRetry = false,
  retryCount = 0,
  error,
  className = '',
  size = 'medium',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentRetryCount, setCurrentRetryCount] = useState(retryCount);
  const [countdown, setCountdown] = useState(0);
  const [rotateAnim] = useState(new Animated.Value(0));

  const remainingRetries = maxRetries - currentRetryCount;
  const canRetry = remainingRetries > 0;

  // Auto retry with countdown
  useEffect(() => {
    if (autoRetry && canRetry && !isRetrying && currentRetryCount > 0) {
      const delay = retryDelay * Math.pow(2, currentRetryCount - 1); // Exponential backoff
      setCountdown(Math.ceil(delay / 1000));
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [autoRetry, canRetry, isRetrying, currentRetryCount, retryDelay]);

  // Rotation animation for retry button
  const startRotationAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const stopRotationAnimation = useCallback(() => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  }, [rotateAnim]);

  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;

    try {
      setIsRetrying(true);
      setCurrentRetryCount(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      startRotationAnimation();
      
      await retryWithBackoff(onRetry, 1, retryDelay);
      
      // Success - reset retry count
      setCurrentRetryCount(0);
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      // Keep the retry count for next attempt
    } finally {
      setIsRetrying(false);
      stopRotationAnimation();
    }
  }, [canRetry, isRetrying, onRetry, retryDelay, startRotationAnimation, stopRotationAnimation]);

  const handleCancelAutoRetry = useCallback(() => {
    Haptics.selectionAsync();
    setCountdown(0);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          icon: 16,
          text: 'text-sm',
          button: 'px-3 py-2',
        };
      case 'large':
        return {
          container: 'p-6',
          icon: 24,
          text: 'text-lg',
          button: 'px-6 py-4',
        };
      default:
        return {
          container: 'p-4',
          icon: 20,
          text: 'text-base',
          button: 'px-4 py-3',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${sizeClasses.container} ${className}`}>
      {/* Error Message */}
      {error && (
        <View className="flex-row items-start mb-4">
          <Ionicons name="warning-outline" size={sizeClasses.icon} color="#EF4444" />
          <Text className={`text-gray-700 dark:text-gray-300 ml-3 flex-1 ${sizeClasses.text}`}>
            {error}
          </Text>
        </View>
      )}

      {/* Retry Status */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className={`text-gray-900 dark:text-white font-semibold ${sizeClasses.text}`}>
            {isRetrying ? 'Retrying...' : canRetry ? 'Retry Available' : 'Max Retries Reached'}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {canRetry 
              ? `${remainingRetries} attempt${remainingRetries !== 1 ? 's' : ''} remaining`
              : 'Please try a different approach'
            }
          </Text>
        </View>
        
        {/* Retry Count Indicator */}
        <View className="flex-row items-center">
          {Array.from({ length: maxRetries }, (_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index < currentRetryCount 
                  ? 'bg-red-500' 
                  : index === currentRetryCount && isRetrying
                    ? 'bg-yellow-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Auto Retry Countdown */}
      {countdown > 0 && (
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
              <Text className="text-blue-600 dark:text-blue-400 text-sm ml-2">
                Auto retry in {countdown}s
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-lg active:scale-95"
              onPress={handleCancelAutoRetry}
            >
              <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        {/* Manual Retry Button */}
        <TouchableOpacity
          className={`flex-1 rounded-xl active:scale-95 ${sizeClasses.button} ${
            canRetry && !isRetrying
              ? 'bg-forest-green'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          onPress={handleRetry}
          disabled={!canRetry || isRetrying}
        >
          <View className="flex-row items-center justify-center">
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons
                name={isRetrying ? 'hourglass-outline' : 'refresh'}
                size={sizeClasses.icon}
                color={canRetry && !isRetrying ? 'white' : '#9CA3AF'}
              />
            </Animated.View>
            <Text className={`font-semibold ml-2 ${sizeClasses.text} ${
              canRetry && !isRetrying
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isRetrying ? 'Retrying...' : canRetry ? 'Retry Now' : 'No Retries Left'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Reset Button (when max retries reached) */}
        {!canRetry && (
          <TouchableOpacity
            className={`flex-1 bg-sage-green rounded-xl active:scale-95 ${sizeClasses.button}`}
            onPress={() => {
              setCurrentRetryCount(0);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="refresh-circle" size={sizeClasses.icon} color="white" />
              <Text className={`text-white font-semibold ml-2 ${sizeClasses.text}`}>
                Reset
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <Text className="text-gray-400 dark:text-gray-500 text-xs text-center mt-4">
        {canRetry 
          ? 'Automatic retry uses exponential backoff to avoid overwhelming the service'
          : 'Try refreshing the page or checking your connection'
        }
      </Text>
    </View>
  );
};

export default RetryHandler;