import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-cream-white">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Page Not Found
        </Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          This screen does not exist.
        </Text>
        <Link href="/" className="bg-forest-green px-6 py-3 rounded-full">
          <Text className="text-white font-semibold">
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
