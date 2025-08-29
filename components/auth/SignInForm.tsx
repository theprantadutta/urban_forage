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

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signInWithSocial, error, clearError } = useAuth();
  const { errors, validateSignInForm, clearErrors } = useAuthValidation();

  // Animation values
  const formScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  const handleSignIn = async () => {
    clearError();
    clearErrors();

    if (!validateSignInForm(email, password)) {
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
      const result = await signIn({ email, password });
      
      if (result.error) {
        errorOpacity.value = withSpring(1);
        // Shake animation for auth errors
        formScale.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withTiming(0.98, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      } else {
        // Success - navigate to main app
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: SocialProvider) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await signInWithSocial(provider);
      
      if (result.error) {
        Alert.alert('Sign In Error', result.error);
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password' as any);
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
      <View className="mb-6">
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          type="password"
          error={errors.password}
          leftIcon="lock-closed-outline"
          disabled={isLoading}
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity 
        onPress={handleForgotPassword}
        className="mb-6"
        disabled={isLoading}
      >
        <Text className="text-sage-green text-sm text-right">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <Button
        title="Sign In"
        variant="primary"
        size="large"
        onPress={handleSignIn}
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
          onPress={() => handleSocialSignIn('google')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />

        <Button
          title="Continue with Apple"
          variant="outline"
          size="large"
          onPress={() => handleSocialSignIn('apple')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />

        <Button
          title="Continue with Facebook"
          variant="outline"
          size="large"
          onPress={() => handleSocialSignIn('facebook')}
          disabled={isLoading}
          className="flex-row items-center justify-center"
        />
      </View>

      {/* Switch to Sign Up */}
      <View className="flex-row items-center justify-center">
        <Text className="text-gray-600">Don&apos;t have an account? </Text>
        <TouchableOpacity 
          onPress={onSwitchToSignUp}
          disabled={isLoading}
        >
          <Text className="text-sage-green font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
      </Animated.View>
    </View>
  );
};

export default SignInForm;