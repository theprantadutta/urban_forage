import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSetupForm from '../../components/auth/ProfileSetupForm';

export default function ProfileSetupPage() {
  return (
    <SafeAreaView className="flex-1 bg-cream-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ProfileSetupForm />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}