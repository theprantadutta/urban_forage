import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useThemeStore } from '../../stores/themeStore';

interface FloatingActionButtonProps {
  onPress?: () => void;
  expanded?: boolean;
  actions?: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
  }[];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  expanded = false,
  actions = [],
}) => {
  const { colors } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  // Animated values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const actionOpacity = useSharedValue(0);
  const actionScale = useSharedValue(0);

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (actions.length > 0) {
      // Toggle expanded state
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      
      // Animate rotation
      rotation.value = withSpring(newExpanded ? 45 : 0, {
        damping: 15,
        stiffness: 200,
      });
      
      // Animate action buttons
      actionOpacity.value = withTiming(newExpanded ? 1 : 0, {
        duration: 200,
      });
      actionScale.value = withSpring(newExpanded ? 1 : 0, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      // Single action
      scale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 300,
      }, () => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
      });
      
      onPress?.();
    }
  };

  // Main button animated style
  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Action buttons animated style
  const actionButtonsStyle = useAnimatedStyle(() => {
    return {
      opacity: actionOpacity.value,
      transform: [{ scale: actionScale.value }],
    };
  });

  return (
    <View style={{ position: 'relative', alignItems: 'center' }}>
      {/* Action Buttons */}
      {actions.length > 0 && (
        <Animated.View
          style={[
            actionButtonsStyle,
            {
              position: 'absolute',
              bottom: 70,
              alignItems: 'center',
              gap: 12,
            },
          ]}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                action.onPress();
                setIsExpanded(false);
                rotation.value = withSpring(0);
                actionOpacity.value = withTiming(0);
                actionScale.value = withSpring(0);
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: action.color || colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color={action.color ? 'white' : colors.text}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Main Button */}
      <Animated.View style={mainButtonStyle}>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons
            name={actions.length > 0 ? 'add' : 'add-circle'}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};