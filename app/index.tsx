import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

export default function AppEntry() {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { hasCompletedOnboarding } = useAuthStore();

    const checkAppState = useCallback(async () => {
        try {
            if (!hasCompletedOnboarding) {
                // First time user - show onboarding
                router.replace('/onboarding' as any);
            } else if (!user) {
                // User has completed onboarding but not signed in - show auth
                router.replace('/auth/signin' as any);
            } else {
                // User is authenticated - show main app
                router.replace('/(tabs)' as any);
            }
        } catch (error) {
            console.error('Error checking app state:', error);
            // Default to onboarding on error
            router.replace('/onboarding' as any);
        } finally {
            setIsLoading(false);
        }
    }, [user, hasCompletedOnboarding]);

    useEffect(() => {
        checkAppState();
    }, [checkAppState]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-cream-white">
                <ActivityIndicator size="large" color="#2D5016" />
            </View>
        );
    }

    return null;
}