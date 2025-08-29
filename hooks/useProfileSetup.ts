import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UseProfileSetupReturn {
  profileImage: string | null;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  isLoading: boolean;
  pickImage: () => Promise<void>;
  requestLocation: () => Promise<void>;
  clearImage: () => void;
  clearLocation: () => void;
}

export const useProfileSetup = (): UseProfileSetupReturn => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to select your profile photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                // In a real app, you might want to open settings
                Alert.alert('Please enable camera permissions in Settings');
              }
            }
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, []);

  const requestLocation = useCallback(async () => {
    try {
      setIsLoading(true);

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access helps you discover food near you and lets others find your listings.',
          [
            { text: 'Skip', style: 'cancel' },
            { 
              text: 'Enable', 
              onPress: async () => {
                // Try again or guide to settings
                Alert.alert(
                  'Enable Location',
                  'Please enable location permissions in your device settings to use this feature.'
                );
              }
            }
          ]
        );
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formattedAddress = [
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: formattedAddress || 'Unknown location',
        });
      } else {
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: 'Location found',
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your location. Please make sure location services are enabled and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setProfileImage(null);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
  }, []);

  return {
    profileImage,
    location,
    isLoading,
    pickImage,
    requestLocation,
    clearImage,
    clearLocation,
  };
};