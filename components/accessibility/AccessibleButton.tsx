import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
    ACCESSIBILITY_ROLES,
    accessibleHapticFeedback,
    createAccessibilityHint,
    createAccessibilityLabel,
    getAccessibleTextSize
} from '../../utils/accessibility';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  className = '',
  style,
  textStyle,
}) => {
  const buttonRef = useRef(null);
  const { isScreenReaderEnabled, isReduceMotionEnabled, announceMessage } = useAccessibility();

  const handlePress = async () => {
    if (disabled || loading) return;

    // Provide haptic feedback
    await accessibleHapticFeedback('impact');

    // Announce action for screen readers
    if (isScreenReaderEnabled) {
      announceMessage(`${title} activated`);
    }

    onPress();
  };

  // Generate accessibility properties
  const finalAccessibilityLabel = accessibilityLabel || createAccessibilityLabel(
    title,
    disabled ? 'disabled' : undefined,
    loading ? 'loading' : undefined
  );

  const finalAccessibilityHint = accessibilityHint || createAccessibilityHint(
    `activate ${title.toLowerCase()}`,
    disabled ? 'Button is currently disabled' : undefined
  );

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = 'rounded-2xl items-center justify-center active:scale-95';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-forest-green ${disabled ? 'opacity-50' : ''}`;
      case 'secondary':
        return `${baseStyles} bg-sage-green ${disabled ? 'opacity-50' : ''}`;
      case 'outline':
        return `${baseStyles} border-2 border-forest-green bg-transparent ${disabled ? 'opacity-50' : ''}`;
      case 'ghost':
        return `${baseStyles} bg-transparent ${disabled ? 'opacity-50' : ''}`;
      default:
        return `${baseStyles} bg-forest-green ${disabled ? 'opacity-50' : ''}`;
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 min-h-[36px]';
      case 'large':
        return 'px-8 py-4 min-h-[56px]';
      default:
        return 'px-6 py-3 min-h-[44px]'; // 44px minimum for accessibility
    }
  };

  // Get text styles
  const getTextStyles = () => {
    const baseSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;
    const fontSize = getAccessibleTextSize(baseSize);
    
    const colorClass = variant === 'outline' || variant === 'ghost' 
      ? 'text-forest-green' 
      : 'text-white';
    
    return {
      fontSize,
      fontWeight: '600' as const,
      textAlign: 'center' as const,
      ...textStyle,
    };
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const iconSize = getIconSize();
  const iconColor = variant === 'outline' || variant === 'ghost' ? '#2D5016' : '#FFFFFF';

  return (
    <TouchableOpacity
      ref={buttonRef}
      className={`${getVariantStyles()} ${getSizeStyles()} ${className}`}
      style={style}
      onPress={handlePress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
      accessibilityLabel={finalAccessibilityLabel}
      accessibilityHint={finalAccessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
      // Reduce animation if motion is reduced
      activeOpacity={isReduceMotionEnabled ? 1 : 0.8}
    >
      <View className="flex-row items-center justify-center">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={iconColor}
            style={{ marginRight: 8 }}
          />
        )}

        {/* Loading Indicator */}
        {loading ? (
          <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Text 
            className={variant === 'outline' || variant === 'ghost' ? 'text-forest-green' : 'text-white'}
            style={getTextStyles()}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {title}
          </Text>
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && !loading && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={iconColor}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AccessibleButton;