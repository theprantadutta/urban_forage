import { Dimensions, Platform } from "react-native";

// Screen dimensions and safe areas
export const screenDimensions = {
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
  scale: Dimensions.get("window").scale,
};

// Device type detection
export const deviceInfo = {
  isTablet: screenDimensions.width >= 768,
  isSmallScreen: screenDimensions.width < 375,
  isLargeScreen: screenDimensions.width >= 414,
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
};

// Animation timing constants
export const animationTiming = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Spring animation configs
export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  bouncy: {
    damping: 15,
    stiffness: 400,
    mass: 1,
  },
  snappy: {
    damping: 25,
    stiffness: 500,
    mass: 1,
  },
  wobbly: {
    damping: 10,
    stiffness: 200,
    mass: 1,
  },
};

// Micro-interaction helpers
export const microInteractions = {
  // Button press with haptic feedback
  buttonPress: async (callback?: () => void) => {
    const { hapticManager, HapticType } = await import("./haptics");
    await hapticManager.trigger(HapticType.IMPACT_LIGHT);
    callback?.();
  },

  // Selection with haptic feedback
  selection: async (callback?: () => void) => {
    const { hapticManager, HapticType } = await import("./haptics");
    await hapticManager.trigger(HapticType.SELECTION);
    callback?.();
  },

  // Success action with haptic feedback
  success: async (callback?: () => void) => {
    const { hapticManager, HapticType } = await import("./haptics");
    await hapticManager.trigger(HapticType.NOTIFICATION_SUCCESS);
    callback?.();
  },

  // Error action with haptic feedback
  error: async (callback?: () => void) => {
    const { hapticManager, HapticType } = await import("./haptics");
    await hapticManager.trigger(HapticType.NOTIFICATION_ERROR);
    callback?.();
  },

  // Warning action with haptic feedback
  warning: async (callback?: () => void) => {
    const { hapticManager, HapticType } = await import("./haptics");
    await hapticManager.trigger(HapticType.NOTIFICATION_WARNING);
    callback?.();
  },
};

// Visual polish constants
export const visualPolish = {
  // Shadow presets
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    floating: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
    },
  },

  // Border radius presets
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
  },

  // Opacity presets
  opacity: {
    disabled: 0.5,
    pressed: 0.8,
    overlay: 0.6,
    subtle: 0.3,
  },
};

// Layout helpers
export const layoutHelpers = {
  // Get responsive padding based on screen size
  getResponsivePadding: (base: number = 16) => {
    if (deviceInfo.isSmallScreen) return base * 0.75;
    if (deviceInfo.isLargeScreen) return base * 1.25;
    if (deviceInfo.isTablet) return base * 1.5;
    return base;
  },

  // Get responsive font size
  getResponsiveFontSize: (base: number = 16) => {
    if (deviceInfo.isSmallScreen) return base * 0.9;
    if (deviceInfo.isLargeScreen) return base * 1.1;
    if (deviceInfo.isTablet) return base * 1.2;
    return base;
  },

  // Get responsive spacing
  getResponsiveSpacing: (base: number = 8) => {
    if (deviceInfo.isSmallScreen) return base * 0.8;
    if (deviceInfo.isLargeScreen) return base * 1.2;
    if (deviceInfo.isTablet) return base * 1.5;
    return base;
  },

  // Center content with responsive margins
  getCenteredContainer: () => ({
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: layoutHelpers.getResponsivePadding(),
  }),

  // Get safe area padding
  getSafeAreaPadding: () => ({
    paddingTop: deviceInfo.isIOS ? 44 : 24,
    paddingBottom: deviceInfo.isIOS ? 34 : 16,
  }),
};

// Performance optimization helpers
export const performanceHelpers = {
  // Debounce function for user interactions
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Optimize image loading
  getOptimizedImageProps: (uri: string, width?: number, height?: number) => ({
    source: { uri },
    style: {
      width: width || screenDimensions.width,
      height: height || 200,
    },
    resizeMode: "cover" as const,
    loadingIndicatorSource: require("../assets/images/placeholder.png"),
  }),
};

// Accessibility polish
export const accessibilityPolish = {
  // Get accessible button props
  getAccessibleButtonProps: (label: string, hint?: string) => ({
    accessibilityRole: "button" as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessible: true,
  }),

  // Get accessible text props
  getAccessibleTextProps: (label?: string) => ({
    accessibilityRole: "text" as const,
    accessibilityLabel: label,
    accessible: true,
  }),

  // Get accessible image props
  getAccessibleImageProps: (alt: string) => ({
    accessibilityRole: "image" as const,
    accessibilityLabel: alt,
    accessible: true,
  }),

  // Get accessible input props
  getAccessibleInputProps: (label: string, hint?: string, value?: string) => ({
    accessibilityRole: "textinput" as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityValue: value ? { text: value } : undefined,
    accessible: true,
  }),
};

// Color manipulation helpers
export const colorHelpers = {
  // Add alpha to hex color
  addAlpha: (hex: string, alpha: number): string => {
    const alphaHex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex}${alphaHex}`;
  },

  // Lighten color
  lighten: (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.floor((num >> 16) + amount));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.floor((num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  },

  // Darken color
  darken: (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.floor((num >> 16) - amount));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) - amount));
    const b = Math.max(0, Math.floor((num & 0x0000ff) - amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  },
};

// Export all utilities
export default {
  screenDimensions,
  deviceInfo,
  animationTiming,
  springConfigs,
  microInteractions,
  visualPolish,
  layoutHelpers,
  performanceHelpers,
  accessibilityPolish,
  colorHelpers,
};
