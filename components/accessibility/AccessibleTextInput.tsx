import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
    ACCESSIBILITY_ROLES,
    accessibleHapticFeedback,
    createAccessibilityHint,
    createAccessibilityLabel,
    getAccessibleTextSize
} from '../../utils/accessibility';

interface AccessibleTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  className?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  disabled = false,
  multiline = false,
  maxLength,
  showCharacterCount = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  className = '',
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { isScreenReaderEnabled, announceMessage } = useAccessibility();

  const handleFocus = () => {
    setIsFocused(true);
    if (isScreenReaderEnabled && label) {
      announceMessage(`${label} text field focused`);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleRightIconPress = async () => {
    if (onRightIconPress) {
      await accessibleHapticFeedback('selection');
      onRightIconPress();
    }
  };

  // Generate accessibility properties
  const finalAccessibilityLabel = accessibilityLabel || createAccessibilityLabel(
    label || placeholder || 'Text input',
    required ? 'required' : undefined,
    error ? 'has error' : undefined
  );

  const finalAccessibilityHint = accessibilityHint || createAccessibilityHint(
    'enter text',
    helperText || (maxLength ? `Maximum ${maxLength} characters` : undefined)
  );

  // Get container styles
  const getContainerStyles = () => {
    const baseStyles = 'border-2 rounded-2xl px-4 py-3 bg-white dark:bg-gray-800';
    
    if (error) {
      return `${baseStyles} border-red-500`;
    }
    
    if (isFocused) {
      return `${baseStyles} border-forest-green`;
    }
    
    if (disabled) {
      return `${baseStyles} border-gray-300 bg-gray-100 dark:bg-gray-700`;
    }
    
    return `${baseStyles} border-gray-300 dark:border-gray-600`;
  };

  // Get text styles
  const getTextStyles = (): TextStyle => {
    const baseSize = 16;
    const fontSize = getAccessibleTextSize(baseSize);
    
    return {
      fontSize,
      color: disabled ? '#9CA3AF' : '#1F2937',
      flex: 1,
      minHeight: multiline ? 80 : 24,
      textAlignVertical: multiline ? 'top' : 'center',
      ...inputStyle,
    };
  };

  const getLabelStyles = (): TextStyle => {
    const baseSize = 14;
    const fontSize = getAccessibleTextSize(baseSize);
    
    return {
      fontSize,
      fontWeight: '600',
      color: error ? '#EF4444' : '#374151',
      marginBottom: 8,
      ...labelStyle,
    };
  };

  const characterCount = value.length;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <View style={containerStyle} className={className}>
      {/* Label */}
      {label && (
        <Text 
          style={getLabelStyles()}
          accessible={true}
          accessibilityRole={ACCESSIBILITY_ROLES.TEXT}
        >
          {label}
          {required && (
            <Text className="text-red-500 ml-1" accessibilityLabel="required">
              *
            </Text>
          )}
        </Text>
      )}

      {/* Input Container */}
      <View className={getContainerStyles()}>
        <View className="flex-row items-center">
          {/* Left Icon */}
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={isFocused ? '#2D5016' : '#9CA3AF'}
              style={{ marginRight: 12 }}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={!disabled}
            multiline={multiline}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={getTextStyles()}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.SEARCH}
            accessibilityLabel={finalAccessibilityLabel}
            accessibilityHint={finalAccessibilityHint}
            accessibilityState={{
              disabled,
              selected: isFocused,
            }}
            testID={testID}
            {...textInputProps}
          />

          {/* Right Icon */}
          {rightIcon && (
            <TouchableOpacity
              onPress={handleRightIconPress}
              disabled={!onRightIconPress}
              accessible={true}
              accessibilityRole={ACCESSIBILITY_ROLES.BUTTON}
              accessibilityLabel={onRightIconPress ? 'Action button' : undefined}
              style={{ marginLeft: 12 }}
            >
              <Ionicons 
                name={rightIcon} 
                size={20} 
                color={isFocused ? '#2D5016' : '#9CA3AF'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Helper Text, Error, or Character Count */}
      <View className="mt-2">
        {error && (
          <Text 
            className="text-red-500 text-sm"
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.ALERT}
            accessibilityLabel={`Error: ${error}`}
          >
            {error}
          </Text>
        )}
        
        {!error && helperText && (
          <Text 
            className="text-gray-600 dark:text-gray-400 text-sm"
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.TEXT}
          >
            {helperText}
          </Text>
        )}
        
        {showCharacterCount && maxLength && (
          <Text 
            className={`text-sm text-right mt-1 ${
              isOverLimit ? 'text-red-500' : 'text-gray-500'
            }`}
            accessible={true}
            accessibilityRole={ACCESSIBILITY_ROLES.TEXT}
            accessibilityLabel={`${characterCount} of ${maxLength} characters used${
              isOverLimit ? ', over limit' : ''
            }`}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

export default AccessibleTextInput;