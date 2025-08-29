import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Animation values
  const slideAnimation = useSharedValue(initialMode === 'signin' ? 0 : 1);

  const switchToSignIn = () => {
    setMode('signin');
    slideAnimation.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const switchToSignUp = () => {
    setMode('signup');
    slideAnimation.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      slideAnimation.value,
      [0, 1],
      [0, -20]
    );

    return {
      transform: [{ translateY }],
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      slideAnimation.value,
      [0, 1],
      [0, -20]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-cream-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8 justify-center">
            {/* Header */}
            <Animated.View style={headerAnimatedStyle} className="items-center mb-8">
              <View className="w-20 h-20 bg-sage-green rounded-2xl items-center justify-center mb-6">
                <Text className="text-2xl">🌱</Text>
              </View>

              <Text className="text-3xl font-bold text-forest-green text-center mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Join UrbanForage'}
              </Text>

              <Text className="text-gray-600 text-center leading-6">
                {mode === 'signin'
                  ? 'Sign in to continue discovering local food in your community'
                  : 'Create your account and start sharing fresh, local food with your neighbors'
                }
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={formAnimatedStyle} className="flex-1">
              {mode === 'signin' ? (
                <SignInForm onSwitchToSignUp={switchToSignUp} />
              ) : (
                <SignUpForm onSwitchToSignIn={switchToSignIn} />
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;