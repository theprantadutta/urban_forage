import { updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db as firestore, storage } from '../config/firebase';
import { COLLECTIONS, STORAGE_PATHS } from '../constants/firebase';
import { ProfileSetupData, User } from '../types/auth';
import { generateAvatarURL, getFirebaseErrorMessage, sanitizeInput } from '../utils/firebase';

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface ImageUploadResult {
  success: boolean;
  error?: string;
  url?: string;
}

class UserProfileService {
  /**
   * Update user profile information
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<ProfileUpdateResult> {
    try {
      const userRef = doc(firestore, COLLECTIONS.USERS, userId);
      
      // Sanitize text inputs
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.displayName) {
        sanitizedUpdates.displayName = sanitizeInput(sanitizedUpdates.displayName);
      }
      if (sanitizedUpdates.profile?.bio) {
        sanitizedUpdates.profile.bio = sanitizeInput(sanitizedUpdates.profile.bio);
      }

      // Update Firestore document
      await updateDoc(userRef, sanitizedUpdates);

      // Update Firebase Auth profile if display name or photo changed
      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL,
        });
      }

      // Get updated user profile
      const updatedUser = await this.getUserProfile(userId);
      
      return { success: true, user: updatedUser || undefined };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Complete profile setup for new users
   */
  async completeProfileSetup(userId: string, profileData: ProfileSetupData): Promise<ProfileUpdateResult> {
    try {
      const updates: Partial<User> = {
        displayName: sanitizeInput(profileData.displayName),
        profile: {
          bio: profileData.bio ? sanitizeInput(profileData.bio) : '',
          interests: profileData.interests.map(interest => sanitizeInput(interest)),
          joinedAt: new Date(),
          verified: false,
        },
      };

      // Only add location if it exists
      if (profileData.location) {
        updates.location = profileData.location;
      }

      // Only add photoURL if it exists, otherwise use generated avatar
      if (profileData.photoURL) {
        updates.photoURL = profileData.photoURL;
      } else {
        updates.photoURL = generateAvatarURL(profileData.displayName);
      }

      return await this.updateProfile(userId, updates);
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(userId: string, imageUri: string): Promise<ImageUploadResult> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create storage reference
      const imageRef = ref(storage, `${STORAGE_PATHS.PROFILE_IMAGES}/${userId}/profile.jpg`);

      // Upload image
      await uploadBytes(imageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);

      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const imageRef = ref(storage, `${STORAGE_PATHS.PROFILE_IMAGES}/${userId}/profile.jpg`);
      await deleteObject(imageRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          profile: {
            ...data.profile,
            joinedAt: data.profile.joinedAt.toDate(),
          },
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Search users by display name
   */
  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    try {
      const sanitizedTerm = sanitizeInput(searchTerm.toLowerCase());
      
      const usersRef = collection(firestore, COLLECTIONS.USERS);
      const q = query(
        usersRef,
        where('displayName', '>=', sanitizedTerm),
        where('displayName', '<=', sanitizedTerm + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          profile: {
            ...data.profile,
            joinedAt: data.profile.joinedAt.toDate(),
          },
        } as User);
      });

      return users.slice(0, limit);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<User['preferences']>
  ): Promise<ProfileUpdateResult> {
    try {
      const userRef = doc(firestore, COLLECTIONS.USERS, userId);
      
      await updateDoc(userRef, {
        preferences: preferences,
      });

      const updatedUser = await this.getUserProfile(userId);
      
      return { success: true, user: updatedUser || undefined };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Update user location
   */
  async updateLocation(
    userId: string,
    location: User['location']
  ): Promise<ProfileUpdateResult> {
    try {
      const userRef = doc(firestore, COLLECTIONS.USERS, userId);
      
      await updateDoc(userRef, {
        location: location,
      });

      const updatedUser = await this.getUserProfile(userId);
      
      return { success: true, user: updatedUser || undefined };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Increment user stats
   */
  async incrementStats(
    userId: string,
    statType: keyof User['stats'],
    increment: number = 1
  ): Promise<ProfileUpdateResult> {
    try {
      const userRef = doc(firestore, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const currentStats = userDoc.data().stats || {};
      const newStats = {
        ...currentStats,
        [statType]: (currentStats[statType] || 0) + increment,
      };

      await updateDoc(userRef, {
        stats: newStats,
      });

      const updatedUser = await this.getUserProfile(userId);
      
      return { success: true, user: updatedUser || undefined };
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error as Error) };
    }
  }

  /**
   * Check if display name is available
   */
  async isDisplayNameAvailable(displayName: string, currentUserId?: string): Promise<boolean> {
    try {
      const sanitizedName = sanitizeInput(displayName.toLowerCase());
      
      const usersRef = collection(firestore, COLLECTIONS.USERS);
      const q = query(usersRef, where('displayName', '==', sanitizedName));
      
      const querySnapshot = await getDocs(q);
      
      // If no users found, name is available
      if (querySnapshot.empty) {
        return true;
      }

      // If current user is using this name, it's available for them
      if (currentUserId) {
        const existingUser = querySnapshot.docs[0];
        return existingUser.id === currentUserId;
      }

      return false;
    } catch (error) {
      console.error('Error checking display name availability:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
export default userProfileService;