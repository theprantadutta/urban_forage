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
import { SocialProvider } from '../../types/auth';
import { Button, Input } from '../ui';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signInWithSocial, error, clearError } = useAuth();
  const { errors, validateSignUpForm, clearErrors } = useAuthValidation();

  // Animation values
  const formScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  const handleSignUp = async () => {
    clearError();
    clearErrors();

    if (!validateSignUpForm(email, password, confirmPassword, displayName)) {
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
      const result = await signUp({ email, password, displayName });
      
      if (result.error) {
        errorOpacity.value = withSpring(1);
        // Shake animation for auth errors
        formScale.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withTiming(0.98, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      } else {
        // Success - navigate to profile setup
        router.replace('/auth/profile-setup' as any);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: SocialProvider) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await signInWithSocial(provider);
      
      if (result.error) {
        Alert.alert('Sign Up Error', result.error);
      } else {
        // For social sign-up, go to profile setup if it's a new user
        router.replace('/auth/profile-setup' as any);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: formScale.value }],
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorOpacity.value,
    };
  });

  return (
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View style={formAnimatedStyle} className="w-full max-w-sm">
      {/* Error Message */}
      {(error || Object.keys(errors).length > 0) && (
        <Animated.View style={errorAnimatedStyle} className="mb-4">
          <View className="bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-600 text-sm text-center">
              {error || Object.values(errors)[0]}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Display Name Input */}
      <View className="mb-4">
        <Input
          label="Full Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your full name"
          type="text"
          error={errors.displayName}
          leftIcon="person-outline"
          disabled={isLoading}
        />
      </View>

      {/* Email Input */}
      <View className="mb-4">
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

      {/* Password Input */}
      <View className="mb-4">
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          type="password"
          error={errors.password}
          leftIcon="lock-closed-outline"
          disabled={isLoading}
        />
      </View>

      {/* Confirm Password Input */}
      <View className="mb-6">
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          type="password"
          error={errors.confirmPassword}
          leftIcon="lock-closed-outline"
          disabled={isLoading}
        />
      </View>

      {/* Terms and Privacy */}
      <View className="mb-6">
        <Text className="text-xs text-gray-600 text-center leading-4">
          By signing up, you agree to our{' '}
          <Text className="text-sage-green">Terms of Service</Text>
          {' '}and{' '}
          <Text className="text-sage-green">Privacy Policy</Text>
        </Text>
      </View>

      {/* Sign Up Button */}
      <Button
        title="Create Account"
        variant="primary"
        size="large"
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
        className="mb-6"
      />

      {/* Divider */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 text-sm">or continue with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Social Login Buttons */}
      <View className="space-y-3 mb-6">
        <Button
          title="Continue with Google"
          variant="outline"
          size="large"
          onPress={() => handleSocialSignUp('google')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />

        <Button
          title="Continue with Apple"
          variant="outline"
          size="large"
          onPress={() => handleSocialSignUp('apple')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />

        <Button
          title="Continue with Facebook"
          variant="outline"
          size="large"
          onPress={() => handleSocialSignUp('facebook')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />
      </View>

      {/* Switch to Sign In */}
      <View className="flex-row items-center justify-center">
        <Text className="text-gray-600">Already have an account? </Text>
        <TouchableOpacity 
          onPress={onSwitchToSignIn}
          disabled={isLoading}
        >
          <Text className="text-sage-green font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
      </Animated.View>
    </View>
  );
};

export default SignUpForm;