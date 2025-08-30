import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface AvailabilityIndicatorProps {
  availability: 'high' | 'medium' | 'low';
  timeLeft?: string;
  isUrgent?: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  availability,
  timeLeft,
  isUrgent = false,
  size = 'medium',
  showText = true,
  className = '',
}) => {
  const getAvailabilityConfig = () => {
    switch (availability) {
      case 'high':
        return {
          color: '#22C55E',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: 'checkmark-circle' as const,
          text: 'Plenty available',
        };
      case 'medium':
        return {
          color: '#F59E0B',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          icon: 'time' as const,
          text: 'Limited quantity',
        };
      case 'low':
        return {
          color: '#EF4444',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: 'warning' as const,
          text: 'Almost gone',
        };
      default:
        return {
          color: '#6B7280',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: 'help-circle' as const,
          text: 'Check availability',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          dotSize: 'w-2 h-2',
          iconSize: 12,
          textSize: 'text-xs',
          padding: 'px-2 py-1',
        };
      case 'large':
        return {
          dotSize: 'w-4 h-4',
          iconSize: 18,
          textSize: 'text-base',
          padding: 'px-4 py-2',
        };
      case 'medium':
      default:
        return {
          dotSize: 'w-3 h-3',
          iconSize: 14,
          textSize: 'text-sm',
          padding: 'px-3 py-1.5',
        };
    }
  };

  const availabilityConfig = getAvailabilityConfig();
  const sizeConfig = getSizeConfig();

  if (!showText) {
    return (
      <View className={`relative ${className}`}>
        <View
          className={`${sizeConfig.dotSize} rounded-full border-2 border-white`}
          style={{ backgroundColor: availabilityConfig.color }}
        />
        {isUrgent && (
          <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        )}
      </View>
    );
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <View
        className={`${availabilityConfig.bgColor} ${availabilityConfig.borderColor} border rounded-full ${sizeConfig.padding} flex-row items-center`}
      >
        <Ionicons
          name={availabilityConfig.icon}
          size={sizeConfig.iconSize}
          color={availabilityConfig.color}
        />
        {showText && (
          <Text className={`${availabilityConfig.textColor} ${sizeConfig.textSize} font-medium ml-1.5`}>
            {availabilityConfig.text}
          </Text>
        )}
      </View>
      
      {timeLeft && (
        <View className="ml-2 flex-row items-center">
          <Ionicons name="time-outline" size={sizeConfig.iconSize} color="#6B7280" />
          <Text className={`text-gray-600 ${sizeConfig.textSize} ml-1`}>
            {timeLeft} left
          </Text>
        </View>
      )}
      
      {isUrgent && (
        <View className="ml-2 bg-red-100 border border-red-200 rounded-full px-2 py-1">
          <Text className="text-red-800 text-xs font-medium">
            Urgent
          </Text>
        </View>
      )}
    </View>
  );
};

export default AvailabilityIndicator;