import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { userProfileService } from '../../services/userProfile';
import { ProfileSetupData } from '../../types/auth';
import { Button, Input } from '../ui';

const INTERESTS_OPTIONS = [
  'Organic Farming', 'Vegetable Gardening', 'Fruit Trees', 'Herbs',
  'Composting', 'Sustainable Living', 'Community Gardens', 'Cooking',
  'Preserving Food', 'Seasonal Eating', 'Local Markets', 'Food Sharing'
];

const ProfileSetupForm: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { user } = useAuth();

  // Animation values
  const formScale = useSharedValue(1);
  const stepOpacity = useSharedValue(1);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to select your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access helps you discover food near you. You can skip this step and add it later.'
        );
        return;
      }

      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: `${address.city}, ${address.region}`,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      stepOpacity.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else {
      handleCompleteSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      stepOpacity.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  };

  const handleCompleteSetup = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Required Field', 'Please enter your display name');
      formScale.value = withSequence(
        withTiming(1.02, { duration: 100 }),
        withTiming(0.98, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    }

    setIsLoading(true);

    try {
      let photoURL = profileImage;

      // Upload profile image if selected
      if (profileImage) {
        const uploadResult = await userProfileService.uploadProfileImage(user.id, profileImage);
        if (uploadResult.success && uploadResult.url) {
          photoURL = uploadResult.url;
        }
      }

      // Complete profile setup
      const profileData: ProfileSetupData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        interests: selectedInterests,
        location: location || undefined,
        photoURL: photoURL || undefined,
      };

      const result = await userProfileService.completeProfileSetup(user.id, profileData);

      if (result.success) {
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.error || 'Failed to complete profile setup');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: formScale.value }],
    };
  });

  const stepAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: stepOpacity.value,
    };
  });

  const renderStep1 = () => (
    <Animated.View style={stepAnimatedStyle} className="w-full">
      <Text className="text-2xl font-bold text-forest-green text-center mb-2">
        Let&apos;s set up your profile
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Tell us a bit about yourself to get started
      </Text>

      {/* Profile Image */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={handleImagePicker}
          className="w-24 h-24 rounded-full bg-sage-green items-center justify-center mb-3"
          disabled={isLoading}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <Ionicons name="camera-outline" size={32} color="#FDF6E3" />
          )}
        </TouchableOpacity>
        <Text className="text-sage-green text-sm">Tap to add photo</Text>
      </View>

      {/* Display Name */}
      <View className="mb-4">
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="How should we call you?"
          type="text"
          leftIcon="person-outline"
          disabled={isLoading}
        />
      </View>

      {/* Bio */}
      <View className="mb-6">
        <Input
          label="Bio (Optional)"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          type="text"
          leftIcon="create-outline"
          disabled={isLoading}
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={stepAnimatedStyle} className="w-full">
      <Text className="text-2xl font-bold text-forest-green text-center mb-2">
        What interests you?
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Select topics that match your interests
      </Text>

      <View className="flex-row flex-wrap justify-center gap-2 mb-6">
        {INTERESTS_OPTIONS.map((interest) => (
          <TouchableOpacity
            key={interest}
            onPress={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full border-2 ${selectedInterests.includes(interest)
              ? 'bg-sage-green border-sage-green'
              : 'bg-transparent border-sage-green'
              }`}
            disabled={isLoading}
          >
            <Text className={`text-sm ${selectedInterests.includes(interest)
              ? 'text-white font-semibold'
              : 'text-sage-green'
              }`}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-xs text-gray-500 text-center">
        Selected: {selectedInterests.length} interests
      </Text>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={stepAnimatedStyle} className="w-full">
      <Text className="text-2xl font-bold text-forest-green text-center mb-2">
        Enable location
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Help others find food near you and discover local offerings
      </Text>

      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-sage-green rounded-full items-center justify-center mb-4">
          <Ionicons name="location-outline" size={32} color="#FDF6E3" />
        </View>

        {location ? (
          <View className="items-center">
            <Text className="text-forest-green font-semibold mb-1">Location Set</Text>
            <Text className="text-gray-600 text-sm text-center">{location.address}</Text>
          </View>
        ) : (
          <Button
            title="Enable Location"
            variant="outline"
            size="medium"
            onPress={handleLocationPermission}
            loading={isLoading}
            disabled={isLoading}
          />
        )}
      </View>

      <Text className="text-xs text-gray-500 text-center">
        You can always change this later in settings
      </Text>
    </Animated.View>
  );

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-6 py-8">
        {/* Skip Button */}
        <View className="items-end mb-4">
          <TouchableOpacity
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text className="text-sage-green">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <View key={step} className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${step <= currentStep ? 'bg-sage-green' : 'bg-gray-300'
                }`}>
                <Text className={`text-sm font-semibold ${step <= currentStep ? 'text-white' : 'text-gray-500'
                  }`}>
                  {step}
                </Text>
              </View>
              {step < 3 && (
                <View className={`w-8 h-1 mx-2 ${step < currentStep ? 'bg-sage-green' : 'bg-gray-300'
                  }`} />
              )}
            </View>
          ))}
        </View>

        {/* Form Content */}
        <Animated.View style={formAnimatedStyle} className="flex-1">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </Animated.View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              title="Back"
              variant="outline"
              size="medium"
              onPress={handleBack}
              disabled={isLoading}
            />
          ) : (
            <View />
          )}

          <Button
            title={currentStep === 3 ? 'Complete Setup' : 'Next'}
            variant="primary"
            size="medium"
            onPress={handleNext}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileSetupForm;