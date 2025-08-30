import { useTheme } from '../providers/ThemeProvider';
import { useHighContrast } from './accessibility';

// High contrast color palette
export const HighContrastColors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#0000FF',
    secondary: '#800080',
    accent: '#FF0000',
    text: '#000000',
    textSecondary: '#000000',
    border: '#000000',
    error: '#FF0000',
    warning: '#FF8C00',
    success: '#008000',
    info: '#0000FF',
    disabled: '#808080',
    shadow: '#000000',
  },
  dark: {
    background: '#000000',
    surface: '#000000',
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    border: '#FFFFFF',
    error: '#FF0000',
    warning: '#FFFF00',
    success: '#00FF00',
    info: '#00FFFF',
    disabled: '#808080',
    shadow: '#FFFFFF',
  },
} as const;

// High contrast theme hook
export const useHighContrastTheme = () => {
  const { colors, isDark } = useTheme();
  const isHighContrastEnabled = useHighContrast();

  const highContrastColors = isHighContrastEnabled
    ? isDark
      ? HighContrastColors.dark
      : HighContrastColors.light
    : colors;

  return {
    colors: highContrastColors,
    isHighContrastEnabled,
    isDark,
  };
};

// High contrast style utilities
export const HighContrastStyles = {
  // Enhanced border for better visibility
  enhancedBorder: (isHighContrast: boolean, color: string) => ({
    borderWidth: isHighContrast ? 2 : 1,
    borderColor: color,
  }),

  // Enhanced shadow for better depth perception
  enhancedShadow: (isHighContrast: boolean, color: string) => ({
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: isHighContrast ? 4 : 2,
    },
    shadowOpacity: isHighContrast ? 1 : 0.25,
    shadowRadius: isHighContrast ? 0 : 3.84,
    elevation: isHighContrast ? 8 : 5,
  }),

  // Enhanced text for better readability
  enhancedText: (isHighContrast: boolean, color: string, backgroundColor: string) => ({
    color,
    backgroundColor: isHighContrast ? backgroundColor : 'transparent',
    fontWeight: isHighContrast ? 'bold' : 'normal',
  }),

  // Enhanced focus indicator
  enhancedFocus: (isHighContrast: boolean, color: string) => ({
    borderWidth: isHighContrast ? 3 : 2,
    borderColor: color,
    borderStyle: 'solid' as const,
  }),

  // Enhanced button styles
  enhancedButton: (isHighContrast: boolean, backgroundColor: string, textColor: string, borderColor: string) => ({
    backgroundColor,
    borderWidth: isHighContrast ? 2 : 0,
    borderColor: isHighContrast ? borderColor : 'transparent',
    shadowColor: isHighContrast ? borderColor : backgroundColor,
    shadowOffset: {
      width: 0,
      height: isHighContrast ? 2 : 1,
    },
    shadowOpacity: isHighContrast ? 1 : 0.2,
    shadowRadius: isHighContrast ? 0 : 2,
    elevation: isHighContrast ? 4 : 2,
  }),
};

// Accessibility-aware component styles
export const createAccessibleStyles = (isHighContrast: boolean, colors: any) => ({
  // Card styles
  card: {
    backgroundColor: colors.surface,
    ...HighContrastStyles.enhancedBorder(isHighContrast, colors.border),
    ...HighContrastStyles.enhancedShadow(isHighContrast, colors.shadow),
    borderRadius: 8,
    padding: 16,
  },

  // Button styles
  primaryButton: {
    ...HighContrastStyles.enhancedButton(
      isHighContrast,
      colors.primary,
      colors.background,
      colors.text
    ),
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  secondaryButton: {
    ...HighContrastStyles.enhancedButton(
      isHighContrast,
      'transparent',
      colors.primary,
      colors.primary
    ),
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: isHighContrast ? 2 : 1,
  },

  // Input styles
  input: {
    backgroundColor: colors.background,
    ...HighContrastStyles.enhancedBorder(isHighContrast, colors.border),
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    color: colors.text,
    fontSize: 16,
  },

  // Text styles
  heading: {
    ...HighContrastStyles.enhancedText(isHighContrast, colors.text, colors.background),
    fontSize: 24,
    marginBottom: 8,
  },

  body: {
    ...HighContrastStyles.enhancedText(isHighContrast, colors.text, colors.background),
    fontSize: 16,
    lineHeight: 24,
  },

  caption: {
    ...HighContrastStyles.enhancedText(isHighContrast, colors.textSecondary, colors.background),
    fontSize: 12,
    lineHeight: 16,
  },

  // Focus styles
  focusIndicator: {
    ...HighContrastStyles.enhancedFocus(isHighContrast, colors.primary),
    borderRadius: 4,
  },

  // List styles
  listItem: {
    backgroundColor: colors.surface,
    ...HighContrastStyles.enhancedBorder(isHighContrast, colors.border),
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    borderBottomWidth: isHighContrast ? 1 : 0,
  },

  // Modal styles
  modal: {
    backgroundColor: colors.background,
    ...HighContrastStyles.enhancedBorder(isHighContrast, colors.border),
    ...HighContrastStyles.enhancedShadow(isHighContrast, colors.shadow),
    borderRadius: 12,
    padding: 20,
  },

  // Progress bar styles
  progressBar: {
    backgroundColor: colors.border,
    ...HighContrastStyles.enhancedBorder(isHighContrast, colors.text),
    height: isHighContrast ? 12 : 8,
    borderRadius: isHighContrast ? 6 : 4,
  },

  progressFill: {
    backgroundColor: colors.primary,
    height: '100%',
    borderRadius: isHighContrast ? 6 : 4,
  },
});

// Hook for accessible styles
export const useAccessibleStyles = () => {
  const { colors, isHighContrastEnabled } = useHighContrastTheme();
  
  return createAccessibleStyles(isHighContrastEnabled, colors);
};

// Color contrast utilities
export const ColorContrastUtils = {
  // Calculate relative luminance
  getRelativeLuminance: (color: string): number => {
    // Simple implementation - in production, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const l1 = ColorContrastUtils.getRelativeLuminance(color1);
    const l2 = ColorContrastUtils.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if color combination meets WCAG AA standards
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    const ratio = ColorContrastUtils.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard for normal text
  },

  // Check if color combination meets WCAG AAA standards
  meetsWCAGAAA: (foreground: string, background: string): boolean => {
    const ratio = ColorContrastUtils.getContrastRatio(foreground, background);
    return ratio >= 7; // WCAG AAA standard for normal text
  },

  // Get appropriate text color for background
  getTextColorForBackground: (backgroundColor: string, lightColor: string = '#FFFFFF', darkColor: string = '#000000'): string => {
    const lightRatio = ColorContrastUtils.getContrastRatio(lightColor, backgroundColor);
    const darkRatio = ColorContrastUtils.getContrastRatio(darkColor, backgroundColor);
    
    return lightRatio > darkRatio ? lightColor : darkColor;
  },
};