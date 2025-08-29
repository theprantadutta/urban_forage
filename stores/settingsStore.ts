import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Units = 'metric' | 'imperial';
export type Language = 'en' | 'es' | 'fr' | 'de';
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

export interface LocationSettings {
  enabled: boolean;
  shareLocation: boolean;
  radius: number; // in kilometers or miles based on units
  autoDetect: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  newListings: boolean;
  messages: boolean;
  reminders: boolean;
  marketing: boolean;
  frequency: NotificationFrequency;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showLocation: boolean;
  showStats: boolean;
  allowMessages: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

export interface AppSettings {
  // General settings
  language: Language;
  units: Units;
  currency: string;
  
  // Feature settings
  location: LocationSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  
  // App behavior
  autoRefresh: boolean;
  offlineMode: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  cacheSize: number; // in MB
  
  // Accessibility
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  screenReader: boolean;
  
  // Developer settings (hidden in production)
  debugMode: boolean;
  showPerformanceMetrics: boolean;
}

export interface SettingsState extends AppSettings {
  // Actions
  updateGeneralSettings: (settings: Partial<Pick<AppSettings, 'language' | 'units' | 'currency'>>) => void;
  updateLocationSettings: (settings: Partial<LocationSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateAppBehavior: (settings: Partial<Pick<AppSettings, 'autoRefresh' | 'offlineMode' | 'dataUsage' | 'cacheSize'>>) => void;
  updateAccessibilitySettings: (settings: Partial<Pick<AppSettings, 'fontSize' | 'highContrast' | 'screenReader'>>) => void;
  updateDeveloperSettings: (settings: Partial<Pick<AppSettings, 'debugMode' | 'showPerformanceMetrics'>>) => void;
  resetToDefaults: () => void;
  exportSettings: () => AppSettings;
  importSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  // General settings
  language: 'en',
  units: 'metric',
  currency: 'USD',
  
  // Feature settings
  location: {
    enabled: false,
    shareLocation: false,
    radius: 10, // 10km default
    autoDetect: true,
  },
  
  notifications: {
    enabled: true,
    newListings: true,
    messages: true,
    reminders: true,
    marketing: false,
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  
  privacy: {
    profileVisibility: 'public',
    showLocation: true,
    showStats: true,
    allowMessages: true,
    dataCollection: true,
    analytics: true,
  },
  
  // App behavior
  autoRefresh: true,
  offlineMode: false,
  dataUsage: 'medium',
  cacheSize: 100, // 100MB
  
  // Accessibility
  fontSize: 'medium',
  highContrast: false,
  screenReader: false,
  
  // Developer settings
  debugMode: false,
  showPerformanceMetrics: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // General settings
      updateGeneralSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      // Location settings
      updateLocationSettings: (settings) => {
        set((state) => ({
          ...state,
          location: { ...state.location, ...settings },
        }));
      },

      // Notification settings
      updateNotificationSettings: (settings) => {
        set((state) => ({
          ...state,
          notifications: { ...state.notifications, ...settings },
        }));
      },

      // Privacy settings
      updatePrivacySettings: (settings) => {
        set((state) => ({
          ...state,
          privacy: { ...state.privacy, ...settings },
        }));
      },

      // App behavior settings
      updateAppBehavior: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      // Accessibility settings
      updateAccessibilitySettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      // Developer settings
      updateDeveloperSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      // Reset to defaults
      resetToDefaults: () => {
        set(defaultSettings);
      },

      // Export settings
      exportSettings: () => {
        const state = get();
        const { 
          updateGeneralSettings, 
          updateLocationSettings, 
          updateNotificationSettings,
          updatePrivacySettings,
          updateAppBehavior,
          updateAccessibilitySettings,
          updateDeveloperSettings,
          resetToDefaults,
          exportSettings,
          importSettings,
          ...settings 
        } = state;
        return settings;
      },

      // Import settings
      importSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all settings except functions
      partialize: (state) => {
        const { 
          updateGeneralSettings, 
          updateLocationSettings, 
          updateNotificationSettings,
          updatePrivacySettings,
          updateAppBehavior,
          updateAccessibilitySettings,
          updateDeveloperSettings,
          resetToDefaults,
          exportSettings,
          importSettings,
          ...settings 
        } = state;
        return settings;
      },
    }
  )
);

// Selectors for better performance
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useUnits = () => useSettingsStore((state) => state.units);
export const useCurrency = () => useSettingsStore((state) => state.currency);
export const useLocationSettings = () => useSettingsStore((state) => state.location);
export const useNotificationSettings = () => useSettingsStore((state) => state.notifications);
export const usePrivacySettings = () => useSettingsStore((state) => state.privacy);
export const useFontSize = () => useSettingsStore((state) => state.fontSize);
export const useHighContrast = () => useSettingsStore((state) => state.highContrast);
export const useDebugMode = () => useSettingsStore((state) => state.debugMode);