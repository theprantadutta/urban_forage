import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    KeyboardTypeOptions,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  success?: boolean;
  type?: 'text' | 'email' | 'password' | 'phone';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success = false,
  type = 'text',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  className = '',
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(error ? 1 : 0);

  // Update animations when focus or error state changes
  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, focusAnimation]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error, errorAnimation]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Get keyboard type based on input type
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  // Get secure text entry
  const getSecureTextEntry = (): boolean => {
    return type === 'password' && !isPasswordVisible;
  };

  // Get right icon for password type
  const getRightIcon = () => {
    if (type === 'password') {
      return isPasswordVisible ? 'eye-off' : 'eye';
    }
    return rightIcon;
  };

  // Get right icon press handler
  const getRightIconPress = () => {
    if (type === 'password') {
      return togglePasswordVisibility;
    }
    return onRightIconPress;
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [
        interpolateColor(
          focusAnimation.value,
          [0, 1],
          ['#E5E7EB', '#2D5016'] // gray-300 to forest-green
        ),
        '#EF4444' // red-500
      ]
    );

    return {
      borderColor,
      borderWidth: withTiming(isFocused ? 2 : 1, { duration: 200 }),
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [
        interpolateColor(
          focusAnimation.value,
          [0, 1],
          ['#6B7280', '#2D5016'] // gray-500 to forest-green
        ),
        '#EF4444' // red-500
      ]
    );

    return { color };
  });

  const errorTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorAnimation.value,
    transform: [
      {
        translateY: withTiming(error ? 0 : -10, { duration: 200 }),
      },
    ],
  }));

  const successColor = success && !error ? '#22C55E' : undefined; // green-500

  return (
    <View style={[containerStyle]} className={className}>
      {/* Label */}
      {label && (
        <AnimatedText
          style={[
            labelAnimatedStyle,
            { color: successColor },
            labelStyle,
          ]}
          className="text-sm font-medium mb-2"
        >
          {label}
        </AnimatedText>
      )}

      {/* Input Container */}
      <AnimatedView
        style={[
          containerAnimatedStyle,
          { borderColor: successColor },
        ]}
        className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 min-h-[48px]"
      >
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? '#EF4444' : success ? '#22C55E' : isFocused ? '#2D5016' : '#6B7280'}
            style={{ marginRight: 12 }}
          />
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={getKeyboardType()}
          secureTextEntry={getSecureTextEntry()}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: '#1F2937', // gray-800
            },
            inputStyle,
          ]}
          className="text-gray-800 dark:text-white"
          placeholderTextColor="#9CA3AF" // gray-400
          {...props}
        />

        {/* Right Icon */}
        {getRightIcon() && (
          <TouchableOpacity
            onPress={getRightIconPress()}
            className="ml-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={getRightIcon() as keyof typeof Ionicons.glyphMap}
              size={20}
              color={error ? '#EF4444' : success ? '#22C55E' : isFocused ? '#2D5016' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {/* Error Message */}
      {error && (
        <AnimatedText
          style={[errorTextAnimatedStyle, errorStyle]}
          className="text-red-500 text-sm mt-2"
        >
          {error}
        </AnimatedText>
      )}

      {/* Success Indicator */}
      {success && !error && (
        <Text className="text-green-500 text-sm mt-2">
          ✓ Looks good!
        </Text>
      )}
    </View>
  );
};