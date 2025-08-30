import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMapTheme } from '../../hooks/useMapTheme';
import { MapAnimations } from '../../utils/mapAnimations';

interface MapControlsProps {
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  className = "absolute top-4 right-4"
}) => {
  const { 
    theme, 
    season, 
    isSeasonalThemeEnabled, 
    toggleSeasonalTheme, 
    setManualTheme 
  } = useMapTheme();

  const toggleTheme = () => {
    MapAnimations.animateThemeChange(() => {
      setManualTheme(theme === 'light' ? 'dark' : 'light');
    });
  };

  const handleSeasonalToggle = () => {
    MapAnimations.animateSeasonChange(() => {
      toggleSeasonalTheme();
    });
  };

  const getSeasonIcon = (currentSeason: string) => {
    switch (currentSeason) {
      case 'spring':
        return '🌸';
      case 'summer':
        return '☀️';
      case 'fall':
        return '🍂';
      case 'winter':
        return '❄️';
      default:
        return '🌿';
    }
  };

  const getSeasonColor = (currentSeason: string) => {
    switch (currentSeason) {
      case 'spring':
        return '#22c55e';
      case 'summer':
        return '#f59e0b';
      case 'fall':
        return '#ef4444';
      case 'winter':
        return '#0ea5e9';
      default:
        return '#87A96B';
    }
  };

  return (
    <View className={className}>
      <View className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2">
        {/* Theme Toggle */}
        <TouchableOpacity
          className="flex-row items-center justify-center p-3 mb-2 rounded-xl bg-forest-green/10 active:bg-forest-green/20"
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === 'light' ? 'sunny' : 'moon'}
            size={20}
            color={theme === 'light' ? '#D2691E' : '#87A96B'}
          />
          <Text className="text-forest-green dark:text-sage-green text-sm font-medium ml-2">
            {theme === 'light' ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>

        {/* Seasonal Theme Toggle */}
        <TouchableOpacity
          className={`flex-row items-center justify-center p-3 rounded-xl ${
            isSeasonalThemeEnabled 
              ? 'bg-sage-green/20 active:bg-sage-green/30' 
              : 'bg-gray-200/50 active:bg-gray-200/70'
          }`}
          onPress={handleSeasonalToggle}
        >
          <Text style={{ fontSize: 16 }}>
            {getSeasonIcon(season)}
          </Text>
          <Text 
            className={`text-sm font-medium ml-2 ${
              isSeasonalThemeEnabled 
                ? 'text-forest-green dark:text-sage-green' 
                : 'text-gray-500'
            }`}
          >
            {season.charAt(0).toUpperCase() + season.slice(1)}
          </Text>
        </TouchableOpacity>

        {/* Season Indicator */}
        {isSeasonalThemeEnabled && (
          <View className="mt-2 pt-2 border-t border-gray-200/50">
            <View className="flex-row items-center justify-center">
              <View 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getSeasonColor(season) }}
              />
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Seasonal theme active
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default MapControls;