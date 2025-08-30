import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedStatusBar } from '../components/ui/ThemedStatusBar';
import { QueryProvider, ThemeProvider } from '../providers';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="onboarding"
                options={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="auth/signin"
                options={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="auth/signup"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="auth/forgot-password"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="auth/profile-setup"
                options={{
                  headerShown: false,
                  animation: 'fade_from_bottom',
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="+not-found"
                options={{
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
            <ThemedStatusBar />
            </GestureHandlerRootView>
          </NavigationThemeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
