import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getCurrentSeason, getMapStyle } from '../constants/mapStyles';

export interface MapThemeConfig {
  mapStyle: any[];
  theme: 'light' | 'dark';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  isSeasonalThemeEnabled: boolean;
}

export const useMapTheme = () => {
  const systemColorScheme = useColorScheme();
  const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>(getCurrentSeason());

  // Update theme when system color scheme changes
  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  // Update season periodically (check every hour)
  useEffect(() => {
    const updateSeason = () => {
      const currentSeason = getCurrentSeason();
      if (currentSeason !== season) {
        setSeason(currentSeason);
      }
    };

    // Check season on mount
    updateSeason();

    // Set up interval to check season every hour
    const interval = setInterval(updateSeason, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [season]);

  // Get current map style based on theme and season
  const getMapStyleConfig = (): MapThemeConfig => {
    const currentSeason = isSeasonalThemeEnabled ? season : undefined;
    const mapStyle = getMapStyle(theme, currentSeason);

    return {
      mapStyle,
      theme,
      season,
      isSeasonalThemeEnabled
    };
  };

  // Toggle seasonal theme
  const toggleSeasonalTheme = () => {
    setIsSeasonalThemeEnabled(!isSeasonalThemeEnabled);
  };

  // Manually set theme (override system)
  const setManualTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  // Manually set season (for testing or user preference)
  const setManualSeason = (newSeason: 'spring' | 'summer' | 'fall' | 'winter') => {
    setSeason(newSeason);
  };

  return {
    ...getMapStyleConfig(),
    toggleSeasonalTheme,
    setManualTheme,
    setManualSeason
  };
};