
// Seasonal theme detection
export const detectSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
};

// Get seasonal accent color for NativeWind classes
export const getSeasonalAccentClass = (season?: 'spring' | 'summer' | 'fall' | 'winter' | 'auto'): string => {
  const currentSeason = season === 'auto' || !season ? detectSeason() : season;
  
  const seasonalClasses = {
    spring: 'spring-500',
    summer: 'summer-500', 
    fall: 'fall-500',
    winter: 'winter-500',
  };
  
  return seasonalClasses[currentSeason];
};

// Get seasonal background class
export const getSeasonalBackgroundClass = (season?: 'spring' | 'summer' | 'fall' | 'winter' | 'auto'): string => {
  const currentSeason = season === 'auto' || !season ? detectSeason() : season;
  
  const seasonalClasses = {
    spring: 'bg-spring-50 dark:bg-spring-900',
    summer: 'bg-summer-50 dark:bg-summer-900',
    fall: 'bg-fall-50 dark:bg-fall-900',
    winter: 'bg-winter-50 dark:bg-winter-900',
  };
  
  return seasonalClasses[currentSeason];
};

// Get themed NativeWind classes
export const getThemedClasses = (isDark: boolean) => ({
  background: {
    primary: isDark ? 'bg-gray-900' : 'bg-cream-white',
    surface: isDark ? 'bg-gray-800' : 'bg-white',
    card: isDark ? 'bg-gray-800/80' : 'bg-white/80',
  },
  text: {
    primary: isDark ? 'text-gray-50' : 'text-gray-800',
    secondary: isDark ? 'text-gray-300' : 'text-gray-500',
    accent: isDark ? 'text-sage-green' : 'text-forest-green',
  },
  border: {
    default: isDark ? 'border-gray-700' : 'border-gray-300',
    accent: isDark ? 'border-sage-green' : 'border-forest-green',
  },
  button: {
    primary: isDark 
      ? 'bg-sage-green text-gray-900' 
      : 'bg-forest-green text-white',
    secondary: isDark 
      ? 'bg-forest-green text-white' 
      : 'bg-sage-green text-white',
    outline: isDark 
      ? 'border-sage-green text-sage-green bg-transparent' 
      : 'border-forest-green text-forest-green bg-transparent',
  },
});

// Color manipulation utilities
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

export const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
};

// Theme transition utilities
export const getThemeTransitionDuration = (reducedMotion: boolean): number => {
  return reducedMotion ? 0 : 300;
};

export const getSpringConfig = (reducedMotion: boolean) => ({
  damping: reducedMotion ? 1000 : 15,
  stiffness: reducedMotion ? 1000 : 150,
  mass: 1,
});

// Accessibility utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsAccessibilityStandards = (foreground: string, background: string): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
};