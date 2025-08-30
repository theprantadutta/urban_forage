import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showReviewCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 'medium',
  showReviewCount = true,
  className = '',
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          starSize: 12,
          textSize: 'text-xs',
          spacing: 'space-x-1',
        };
      case 'large':
        return {
          starSize: 18,
          textSize: 'text-base',
          spacing: 'space-x-2',
        };
      case 'medium':
      default:
        return {
          starSize: 14,
          textSize: 'text-sm',
          spacing: 'space-x-1.5',
        };
    }
  };

  const { starSize, textSize, spacing } = getSizeConfig();

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={starSize}
          color="#F59E0B"
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={starSize}
          color="#F59E0B"
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={starSize}
          color="#D1D5DB"
        />
      );
    }

    return stars;
  };

  return (
    <View className={`flex-row items-center ${spacing} ${className}`}>
      <View className="flex-row items-center">
        {renderStars()}
      </View>
      <Text className={`text-gray-700 font-medium ${textSize}`}>
        {rating.toFixed(1)}
      </Text>
      {showReviewCount && reviewCount && (
        <Text className={`text-gray-500 ${textSize}`}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

export default RatingDisplay;