import { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { detectSeason } from '../utils/theme';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export const useSeasonalTheme = () => {
  const { seasonalTheme, setSeasonalTheme, getCurrentSeason } = useThemeStore();
  const [currentSeason, setCurrentSeason] = useState<Season>(() => {
    const season = getCurrentSeason();
    return season === 'auto' ? detectSeason() : season as Season;
  });

  // Update current season periodically
  useEffect(() => {
    const updateSeason = () => {
      const newSeason = detectSeason();
      setCurrentSeason(newSeason);
      
      // Auto-update seasonal theme if set to 'auto'
      if (seasonalTheme === 'auto') {
        // This will trigger a color update in the store
        useThemeStore.getState().updateColors();
      }
    };

    // Update immediately
    updateSeason();

    // Check for season changes daily
    const interval = setInterval(updateSeason, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [seasonalTheme]);

  const setManualSeasonalTheme = (theme: Season | 'auto') => {
    setSeasonalTheme(theme);
  };

  const getSeasonalColors = (season: Season) => {
    const seasonalPalettes = {
      spring: {
        primary: '#22c55e', // green-500
        secondary: '#87A96B', // sage-green
        accent: '#84cc16', // lime-500
        gradient: ['#22c55e', '#84cc16'],
      },
      summer: {
        primary: '#f59e0b', // amber-500
        secondary: '#D2691E', // warm-orange
        accent: '#eab308', // yellow-500
        gradient: ['#f59e0b', '#eab308'],
      },
      fall: {
        primary: '#ef4444', // red-500
        secondary: '#8B4513', // earth-brown
        accent: '#f97316', // orange-500
        gradient: ['#ef4444', '#f97316'],
      },
      winter: {
        primary: '#0ea5e9', // sky-500
        secondary: '#87CEEB', // sky-blue
        accent: '#06b6d4', // cyan-500
        gradient: ['#0ea5e9', '#06b6d4'],
      },
    };

    return seasonalPalettes[season];
  };

  const getSeasonalEmoji = (season: Season): string => {
    const emojis = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️',
    };
    return emojis[season];
  };

  const getSeasonalDescription = (season: Season): string => {
    const descriptions = {
      spring: 'Fresh growth and new beginnings',
      summer: 'Abundant harvest and warm sunshine',
      fall: 'Rich colors and cozy gatherings',
      winter: 'Peaceful reflection and crisp air',
    };
    return descriptions[season];
  };

  return {
    currentSeason,
    seasonalTheme,
    setSeasonalTheme: setManualSeasonalTheme,
    getSeasonalColors,
    getSeasonalEmoji,
    getSeasonalDescription,
    isAutoSeasonal: seasonalTheme === 'auto',
  };
};