import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
    ACCESSIBILITY_ROLES,
    accessibleHapticFeedback,
    getMapMarkerAccessibilityLabel,
} from '../../utils/accessibility';
import type { FoodListing } from '../map/FoodMarker';

interface AccessibleMapMarkerProps {
  listing: FoodListing;
  isSelected?: boolean;
  onPress?: (listing: FoodListing) => void;
  onCalloutPress?: (listing: FoodListing) => void;
  markerIndex?: number;
  totalMarkers?: number;
}

export const AccessibleMapMarker: React.FC<AccessibleMapMarkerProps> = ({
  listing,
  isSelected = false,
  onPress,
  onCalloutPress,
  markerIndex,
  totalMarkers,
}) => {
  const { isScreenReaderEnabled, announceMessage, isReduceMotionEnabled } = useAccessibility();
  const markerRef = useRef(null);

  const handlePress = async () => {
    await accessibleHapticFeedback('selection');
    
    // Announce marker selection for screen readers
    if (isScreenReaderEnabled) {
      const positionInfo = markerIndex !== undefined && totalMarkers !== undefined
        ? ` Marker ${markerIndex + 1} of ${totalMarkers}.`
        : '';
      
      announceMessage(
        `Selected ${listing.title}, ${listing.category} food listing.${positionInfo} ${listing.availability} availability.`
      );
    }
    
    onPress?.(listing);
  };

  const handleCalloutPress = async () => {
    await accessibleHapticFeedback('impact');
    
    if (isScreenReaderEnabled) {
      announceMessage(`Opening details for ${listing.title}`);
    }
    
    onCalloutPress?.(listing);
  };

  // Generate comprehensive accessibility label
  const accessibilityLabel = getMapMarkerAccessibilityLabel({
    title: listing.title,
    category: listing.category,
    availability: listing.availability,
  });

  const accessibilityHint = `Double tap to ${isSelected ? 'view details' : 'select marker'}. ${
    listing.distance ? `Located ${listing.distance} away.` : ''
  }${listing.timeLeft ? ` ${listing.timeLeft} remaining.` : ''}`;

  const accessibilityValue = {
    text: `${listing.availability} availability${listing.isUrgent ? ', urgent pickup needed' : ''}`,
  };

  const getCategoryIcon = (category: FoodListing['category']): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'vegetables':
        return 'leaf';
      case 'fruits':
        return 'nutrition';
      case 'bakery':
        return 'cafe';
      case 'dairy':
        return 'water';
      case 'prepared':
        return 'restaurant';
      case 'other':
      default:
        return 'basket';
    }
  };

  const getCategoryColor = (category: FoodListing['category']): string => {
    switch (category) {
      case 'vegetables':
        return '#22c55e';
      case 'fruits':
        return '#f59e0b';
      case 'bakery':
        return '#8b5cf6';
      case 'dairy':
        return '#06b6d4';
      case 'prepared':
        return '#ef4444';
      case 'other':
      default:
        return '#6b7280';
    }
  };

  const getAvailabilityColor = (availability: FoodListing['availability']): string => {
    switch (availability) {
      case 'high':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const categoryIcon = getCategoryIcon(listing.category);
  const categoryColor = getCategoryColor(listing.category);
  const availabilityColor = getAvailabilityColor(listing.availability);

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: listing.latitude,
        longitude: listing.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={false}
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityValue={accessibilityValue}
      accessibilityState={{
        selected: isSelected,
      }}
    >
      {/* Marker Visual */}
      <View
        className="items-center"
        accessible={false} // Parent marker handles accessibility
      >
        {/* Main Marker Body */}
        <View 
          className="w-12 h-12 rounded-full items-center justify-center shadow-lg border-2 border-white"
          style={{ backgroundColor: categoryColor }}
          accessible={false}
        >
          <Ionicons
            name={categoryIcon}
            size={20}
            color="white"
          />
        </View>

        {/* Availability Indicator */}
        <View 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: availabilityColor }}
          accessible={false}
        />

        {/* Urgent Indicator */}
        {listing.isUrgent && (
          <View 
            className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-red-500 border border-white"
            accessible={false}
          />
        )}

        {/* Marker Tail */}
        <View 
          className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent"
          style={{ 
            borderTopColor: categoryColor,
            marginTop: -1,
          }}
          accessible={false}
        />
      </View>

      {/* Accessible Callout */}
      {isSelected && (
        <View
          className="absolute -top-20 left-1/2 transform -translate-x-1/2"
          accessible={false} // Will be handled by TouchableOpacity inside
        >
          <TouchableOpacity
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-48"
            onPress={handleCalloutPress}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
            accessibilityLabel={`View details for ${listing.title}`}
            accessibilityHint={`Opens detailed information about this ${listing.category} listing`}
            accessibilityValue={{
              text: `${listing.availability} availability${listing.distance ? `, ${listing.distance} away` : ''}`,
            }}
          >
            <Text 
              className="text-forest-green font-semibold text-sm mb-1" 
              numberOfLines={1}
              accessible={false}
            >
              {listing.title}
            </Text>
            <View className="flex-row items-center justify-between" accessible={false}>
              <Text className="text-gray-600 text-xs capitalize" accessible={false}>
                {listing.category}
              </Text>
              {listing.distance && (
                <Text className="text-sage-green text-xs" accessible={false}>
                  {listing.distance}
                </Text>
              )}
            </View>
            {listing.timeLeft && (
              <Text className="text-gray-500 text-xs mt-1" accessible={false}>
                {listing.timeLeft} left
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Callout Tail */}
          <View className="items-center" accessible={false}>
            <View className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white" />
          </View>
        </View>
      )}
    </Marker>
  );
};

export default AccessibleMapMarker;