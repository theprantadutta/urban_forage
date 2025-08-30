import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import {
    compressImage,
    ImageCompressionOptions,
    ImageQuality,
    shouldCompressImage
} from './imageUtils';

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  compressionOptions?: ImageCompressionOptions;
  maxImages?: number;
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
  originalUri?: string;
  compressed: boolean;
}

// Request camera permissions
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

// Request media library permissions
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Media Library Permission Required',
          'Please grant media library permission to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
};

// Pick image from camera
export const pickImageFromCamera = async (
  options: ImagePickerOptions = {}
): Promise<PickedImage | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const {
      allowsEditing = true,
      aspect = [1, 1],
      quality = ImageQuality.HIGH,
      compressionOptions,
    } = options;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
      base64: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    let processedImage: PickedImage = {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
      type: asset.type,
      originalUri: asset.uri,
      compressed: false,
    };

    // Compress image if needed
    if (compressionOptions || shouldCompressImage(asset)) {
      try {
        const compressed = await compressImage(asset.uri, compressionOptions);
        processedImage = {
          ...processedImage,
          uri: compressed.uri,
          width: compressed.width,
          height: compressed.height,
          compressed: true,
        };
      } catch (compressionError) {
        console.warn('Image compression failed, using original:', compressionError);
      }
    }

    return processedImage;
  } catch (error) {
    console.error('Error picking image from camera:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
};

// Pick image from gallery
export const pickImageFromGallery = async (
  options: ImagePickerOptions = {}
): Promise<PickedImage[]> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return [];

    const {
      allowsEditing = false,
      aspect = [1, 1],
      quality = ImageQuality.HIGH,
      allowsMultipleSelection = false,
      maxImages = 10,
      compressionOptions,
    } = options;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
      allowsMultipleSelection,
      selectionLimit: maxImages,
      base64: false,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    const processedImages: PickedImage[] = [];

    for (const asset of result.assets) {
      let processedImage: PickedImage = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        originalUri: asset.uri,
        compressed: false,
      };

      // Compress image if needed
      if (compressionOptions || shouldCompressImage(asset)) {
        try {
          const compressed = await compressImage(asset.uri, compressionOptions);
          processedImage = {
            ...processedImage,
            uri: compressed.uri,
            width: compressed.width,
            height: compressed.height,
            compressed: true,
          };
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
        }
      }

      processedImages.push(processedImage);
    }

    return processedImages;
  } catch (error) {
    console.error('Error picking images from gallery:', error);
    Alert.alert('Error', 'Failed to select images. Please try again.');
    return [];
  }
};

// Show image picker options
export const showImagePickerOptions = (
  options: ImagePickerOptions = {}
): Promise<PickedImage[]> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const image = await pickImageFromCamera(options);
            resolve(image ? [image] : []);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const images = await pickImageFromGallery(options);
            resolve(images);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve([]),
        },
      ],
      { cancelable: true }
    );
  });
};

// Batch process multiple images
export const batchProcessImages = async (
  uris: string[],
  compressionOptions?: ImageCompressionOptions
): Promise<PickedImage[]> => {
  try {
    const processedImages: PickedImage[] = [];

    for (const uri of uris) {
      try {
        const compressed = await compressImage(uri, compressionOptions);
        processedImages.push({
          uri: compressed.uri,
          width: compressed.width,
          height: compressed.height,
          originalUri: uri,
          compressed: true,
        });
      } catch (error) {
        console.warn('Failed to process image:', uri, error);
        // Add original image if compression fails
        processedImages.push({
          uri,
          width: 0,
          height: 0,
          originalUri: uri,
          compressed: false,
        });
      }
    }

    return processedImages;
  } catch (error) {
    console.error('Error batch processing images:', error);
    throw error;
  }
};

// Create image picker hook
export const useImagePicker = () => {
  const pickFromCamera = (options?: ImagePickerOptions) => 
    pickImageFromCamera(options);

  const pickFromGallery = (options?: ImagePickerOptions) => 
    pickImageFromGallery(options);

  const showOptions = (options?: ImagePickerOptions) => 
    showImagePickerOptions(options);

  return {
    pickFromCamera,
    pickFromGallery,
    showOptions,
  };
};