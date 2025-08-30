import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, useThemeStore } from '../stores/themeStore';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setSeasonalTheme: (theme: 'spring' | 'summer' | 'fall' | 'winter' | 'auto') => void;
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const {
    colors,
    isDark,
    mode,
    toggleTheme,
    setSeasonalTheme,
    getCurrentSeason,
    updateColors,
  } = useThemeStore();

  // Update theme when system color scheme changes
  useEffect(() => {
    if (mode === 'system') {
      useThemeStore.setState({ isDark: systemColorScheme === 'dark' });
      updateColors();
    }
  }, [systemColorScheme, mode, updateColors]);

  // Initialize theme on mount
  useEffect(() => {
    updateColors();
  }, [updateColors]);

  const contextValue: ThemeContextType = {
    colors,
    isDark,
    toggleTheme,
    setSeasonalTheme,
    currentSeason: getCurrentSeason() === 'auto' ? 'spring' : getCurrentSeason() as 'spring' | 'summer' | 'fall' | 'winter',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme utilities for component styling
export const createThemedStyles = (colors: ThemeColors, isDark: boolean) => ({
  // Background styles
  background: {
    primary: { backgroundColor: colors.background },
    surface: { backgroundColor: colors.surface },
    transparent: { backgroundColor: 'transparent' },
  },
  
  // Text styles
  text: {
    primary: { color: colors.text },
    secondary: { color: colors.textSecondary },
    accent: { color: colors.accent },
    onPrimary: { color: isDark ? colors.background : colors.surface },
  },
  
  // Border styles
  border: {
    default: { borderColor: colors.border },
    primary: { borderColor: colors.primary },
    accent: { borderColor: colors.accent },
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: isDark ? colors.background : colors.surface,
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: isDark ? colors.background : colors.surface,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      color: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
    },
  },
  
  // Status styles
  status: {
    error: { color: colors.error },
    success: { color: colors.success },
    warning: { color: colors.warning },
  },
});

// Hook for themed styles
export const useThemedStyles = () => {
  const { colors, isDark } = useTheme();
  return createThemedStyles(colors, isDark);
};