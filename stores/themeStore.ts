import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SeasonalTheme = 'spring' | 'summer' | 'fall' | 'winter' | 'auto';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeState {
  // Theme settings
  mode: ThemeMode;
  seasonalTheme: SeasonalTheme;
  isDark: boolean;
  
  // Current theme colors
  colors: ThemeColors;
  
  // Animation preferences
  reducedMotion: boolean;
  hapticFeedback: boolean;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setSeasonalTheme: (theme: SeasonalTheme) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  toggleTheme: () => void;
  getCurrentSeason: () => SeasonalTheme;
  updateColors: () => void;
}

// Seasonal color palettes
const seasonalColors: Record<SeasonalTheme, Partial<ThemeColors>> = {
  spring: {
    primary: '#22c55e', // green-500
    secondary: '#87A96B', // sage-green
    accent: '#84cc16', // lime-500
  },
  summer: {
    primary: '#f59e0b', // amber-500
    secondary: '#D2691E', // warm-orange
    accent: '#eab308', // yellow-500
  },
  fall: {
    primary: '#ef4444', // red-500
    secondary: '#8B4513', // earth-brown
    accent: '#f97316', // orange-500
  },
  winter: {
    primary: '#0ea5e9', // sky-500
    secondary: '#87CEEB', // sky-blue
    accent: '#06b6d4', // cyan-500
  },
  auto: {
    primary: '#2D5016', // forest-green
    secondary: '#87A96B', // sage-green
    accent: '#D2691E', // warm-orange
  },
};

// Base theme colors
const lightColors: ThemeColors = {
  primary: '#2D5016', // forest-green
  secondary: '#87A96B', // sage-green
  accent: '#D2691E', // warm-orange
  background: '#FDF6E3', // cream-white
  surface: '#FFFFFF',
  text: '#1F2937', // gray-800
  textSecondary: '#6B7280', // gray-500
  border: '#E5E7EB', // gray-300
  error: '#EF4444', // red-500
  success: '#22C55E', // green-500
  warning: '#F59E0B', // amber-500
};

const darkColors: ThemeColors = {
  primary: '#87A96B', // sage-green (lighter in dark mode)
  secondary: '#2D5016', // forest-green
  accent: '#DAA520', // golden-yellow
  background: '#111827', // gray-900
  surface: '#1F2937', // gray-800
  text: '#F9FAFB', // gray-50
  textSecondary: '#D1D5DB', // gray-300
  border: '#374151', // gray-700
  error: '#F87171', // red-400
  success: '#34D399', // emerald-400
  warning: '#FBBF24', // amber-400
};

// Helper function to get current season
const getCurrentSeason = (): SeasonalTheme => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'system',
      seasonalTheme: 'auto',
      isDark: false,
      colors: lightColors,
      reducedMotion: false,
      hapticFeedback: true,

      // Actions
      setThemeMode: (mode: ThemeMode) => {
        set({ mode });
        get().updateColors();
      },

      setSeasonalTheme: (seasonalTheme: SeasonalTheme) => {
        set({ seasonalTheme });
        get().updateColors();
      },

      setReducedMotion: (reducedMotion: boolean) => {
        set({ reducedMotion });
      },

      setHapticFeedback: (hapticFeedback: boolean) => {
        set({ hapticFeedback });
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        get().updateColors();
      },

      getCurrentSeason,

      updateColors: () => {
        const { mode, seasonalTheme, isDark } = get();
        
        // Determine if we should use dark theme
        let shouldUseDark = isDark;
        if (mode === 'system') {
          // In a real app, you'd check system theme here
          // For now, we'll default to light
          shouldUseDark = false;
        } else {
          shouldUseDark = mode === 'dark';
        }

        // Get base colors
        let colors = shouldUseDark ? { ...darkColors } : { ...lightColors };

        // Apply seasonal theme
        const currentSeason = seasonalTheme === 'auto' ? getCurrentSeason() : seasonalTheme;
        const seasonalOverrides = seasonalColors[currentSeason];

        if (seasonalOverrides) {
          colors = { ...colors, ...seasonalOverrides };
        }

        set({ 
          isDark: shouldUseDark,
          colors 
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist theme preferences
      partialize: (state) => ({
        mode: state.mode,
        seasonalTheme: state.seasonalTheme,
        reducedMotion: state.reducedMotion,
        hapticFeedback: state.hapticFeedback,
      }),
      // Update colors after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.updateColors();
        }
      },
    }
  )
);

// Selectors
export const useThemeMode = () => useThemeStore((state) => state.mode);
export const useIsDark = () => useThemeStore((state) => state.isDark);
export const useThemeColors = () => useThemeStore((state) => state.colors);
export const useSeasonalTheme = () => useThemeStore((state) => state.seasonalTheme);
export const useReducedMotion = () => useThemeStore((state) => state.reducedMotion);
export const useHapticFeedback = () => useThemeStore((state) => state.hapticFeedback);