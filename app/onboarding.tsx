import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { OnboardingScreen } from '../components/onboarding';

export default function OnboardingPage() {
  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      // Navigate to sign-in screen after onboarding
      router.replace('/auth/signin' as any);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      router.replace('/auth/signin' as any);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as completed even when skipped
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      // Navigate to sign-in screen when skipped
      router.replace('/auth/signin' as any);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      router.replace('/auth/signin' as any);
    }
  };

  return (
    <OnboardingScreen 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}