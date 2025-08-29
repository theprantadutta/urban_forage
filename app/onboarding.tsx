import { router } from 'expo-router';
import React from 'react';
import { OnboardingScreen } from '../components/onboarding';
import { useAuthStore } from '../stores/authStore';

export default function OnboardingPage() {
  const { setOnboardingCompleted } = useAuthStore();

  const handleComplete = async () => {
    try {
      // Mark onboarding as completed in Zustand store
      setOnboardingCompleted(true);
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
      setOnboardingCompleted(true);
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