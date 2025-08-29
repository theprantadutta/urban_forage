import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { Button, Input } from '../ui';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { resetPassword, error, clearError } = useAuth();
  const { errors, validateEmail, clearErrors } = useAuthValidation();

  // Animation values
  const formScale = useSharedValue(1);
  const successOpacity = useSharedValue(0);

  const handleResetPassword = async () => {
    clearError();
    clearErrors();

    if (!validateEmail(email)) {
      // Shake animation for validation errors
      formScale.value = withSequence(
        withTiming(1.02, { duration: 100 }),
        withTiming(0.98, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);
      
      if (result.error) {
        // Shake animation for errors
        formScale.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withTiming(0.98, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      } else {
        setIsEmailSent(true);
        successOpacity.value = withSpring(1);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: formScale.value }],
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
    };
  });

  if (isEmailSent) {
    return (
      <Animated.View style={successAnimatedStyle} className="w-full items-center">
        <View className="w-20 h-20 bg-sage-green rounded-full items-center justify-center mb-6">
          <Ionicons name="mail-outline" size={32} color="#FDF6E3" />
        </View>
        
        <Text className="text-2xl font-bold text-forest-green text-center mb-4">
          Check Your Email
        </Text>
        
        <Text className="text-gray-600 text-center mb-8 leading-6">
          We&apos;ve sent a password reset link to{'\n'}
          <Text className="font-semibold">{email}</Text>
        </Text>
        
        <Button
          variant="primary"
          size="large"
          onPress={handleBackToSignIn}
          className="mb-4"
          title="Back to Sign In"
        />
        
        <TouchableOpacity onPress={() => setIsEmailSent(false)}>
          <Text className="text-sage-green text-sm">
            Didn&apos;t receive the email? Try again
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={formAnimatedStyle} className="w-full">
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-sage-green rounded-full items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={24} color="#FDF6E3" />
        </View>
        
        <Text className="text-2xl font-bold text-forest-green text-center mb-2">
          Forgot Password?
        </Text>
        
        <Text className="text-gray-600 text-center leading-6">
          No worries! Enter your email address and we&apos;ll send you a link to reset your password.
        </Text>
      </View>

      {/* Error Message */}
      {(error || errors.email) && (
        <View className="mb-4">
          <View className="bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-600 text-sm text-center">
              {error || errors.email}
            </Text>
          </View>
        </View>
      )}

      {/* Email Input */}
      <View className="mb-6">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          type="email"
          error={errors.email}
          leftIcon="mail-outline"
          disabled={isLoading}
        />
      </View>

      {/* Reset Password Button */}
      <Button
        variant="primary"
        size="large"
        onPress={handleResetPassword}
        loading={isLoading}
        disabled={isLoading}
        className="mb-6"
        title="Send Reset Link"
      />

      {/* Back to Sign In */}
      <TouchableOpacity 
        onPress={handleBackToSignIn}
        disabled={isLoading}
        className="items-center"
      >
        <Text className="text-sage-green font-semibold">
          Back to Sign In
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ForgotPasswordForm;