import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility constants
export const AccessibilityConstants = {
  MINIMUM_TOUCH_TARGET_SIZE: 44,
  FOCUS_TIMEOUT: 100,
  ANNOUNCEMENT_DELAY: 500,
} as const;

// Accessibility roles for better semantic meaning
export const AccessibilityRoles = {
  BUTTON: 'button',
  LINK: 'link',
  TEXT: 'text',
  HEADING: 'header',
  IMAGE: 'image',
  LIST: 'list',
  LIST_ITEM: 'listitem',
  TAB: 'tab',
  TAB_LIST: 'tablist',
  SEARCH: 'search',
  MENU: 'menu',
  MENU_ITEM: 'menuitem',
  ALERT: 'alert',
  DIALOG: 'dialog',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  SLIDER: 'slider',
  PROGRESS_BAR: 'progressbar',
  LOADING: 'progressbar',
} as const;

// Accessibility states
export const AccessibilityStates = {
  DISABLED: { disabled: true },
  SELECTED: { selected: true },
  CHECKED: { checked: true },
  EXPANDED: { expanded: true },
  BUSY: { busy: true },
} as const;

// Accessibility traits for iOS
export const AccessibilityTraits = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  SEARCH_FIELD: 'searchField',
  IMAGE: 'image',
  SELECTED: 'selected',
  PLAYS_SOUND: 'playsSound',
  KEYBOARD_KEY: 'keyboardKey',
  STATIC_TEXT: 'staticText',
  SUMMARY_ELEMENT: 'summaryElement',
  NOT_ENABLED: 'notEnabled',
  UPDATES_FREQUENTLY: 'updatesFrequently',
  STARTS_MEDIA_SESSION: 'startsMediaSession',
  ADJUSTABLE: 'adjustable',
  ALLOWS_DIRECT_INTERACTION: 'allowsDirectInteraction',
  CAUSES_PAGE_TURN: 'causesPageTurn',
} as const;

// Screen reader detection
export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [screenReaderChanged, setScreenReaderChanged] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setIsScreenReaderEnabled(enabled);
        setScreenReaderChanged(true);
        // Reset the changed flag after a delay
        setTimeout(() => setScreenReaderChanged(false), 1000);
      }
    );

    return () => subscription?.remove();
  }, []);

  return {
    isScreenReaderEnabled,
    screenReaderChanged,
  };
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled
    );

    return () => subscription?.remove();
  }, []);

  return isReducedMotionEnabled;
};

// High contrast detection
export const useHighContrast = () => {
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isHighTextContrastEnabled?.().then(setIsHighContrastEnabled);

      const subscription = AccessibilityInfo.addEventListener(
        'highTextContrastChanged',
        setIsHighContrastEnabled
      );

      return () => subscription?.remove();
    }
  }, []);

  return isHighContrastEnabled;
};

// Accessibility announcements
export const useAccessibilityAnnouncements = () => {
  const announce = useCallback((message: string, priority: 'low' | 'high' = 'low') => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // For Android, we can use setAccessibilityFocus or announceForAccessibility
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  const announceDelayed = useCallback((message: string, delay: number = AccessibilityConstants.ANNOUNCEMENT_DELAY) => {
    setTimeout(() => announce(message), delay);
  }, [announce]);

  return {
    announce,
    announceDelayed,
  };
};

// Focus management
export const useFocusManagement = () => {
  const setAccessibilityFocus = useCallback((reactTag: number) => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    } else {
      // Android focus management
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }, []);

  const setAccessibilityFocusDelayed = useCallback((reactTag: number, delay: number = AccessibilityConstants.FOCUS_TIMEOUT) => {
    setTimeout(() => setAccessibilityFocus(reactTag), delay);
  }, [setAccessibilityFocus]);

  return {
    setAccessibilityFocus,
    setAccessibilityFocusDelayed,
  };
};

// Accessibility helpers
export const AccessibilityHelpers = {
  // Create accessible label from multiple strings
  createLabel: (...parts: (string | undefined | null)[]): string => {
    return parts.filter(Boolean).join(', ');
  },

  // Create accessible hint
  createHint: (action: string, result?: string): string => {
    if (result) {
      return `${action}. ${result}`;
    }
    return action;
  },

  // Format number for screen readers
  formatNumber: (num: number, unit?: string): string => {
    const formatted = num.toLocaleString();
    return unit ? `${formatted} ${unit}` : formatted;
  },

  // Format date for screen readers
  formatDate: (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format time for screen readers
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  },

  // Create loading announcement
  createLoadingAnnouncement: (isLoading: boolean, context?: string): string => {
    const baseMessage = isLoading ? 'Loading' : 'Loading complete';
    return context ? `${baseMessage}, ${context}` : baseMessage;
  },

  // Create error announcement
  createErrorAnnouncement: (error: string, context?: string): string => {
    const baseMessage = `Error: ${error}`;
    return context ? `${baseMessage}, in ${context}` : baseMessage;
  },

  // Create success announcement
  createSuccessAnnouncement: (message: string, context?: string): string => {
    const baseMessage = `Success: ${message}`;
    return context ? `${baseMessage}, in ${context}` : baseMessage;
  },

  // Get appropriate touch target size
  getTouchTargetSize: (size: number): number => {
    return Math.max(size, AccessibilityConstants.MINIMUM_TOUCH_TARGET_SIZE);
  },

  // Check if element meets minimum touch target size
  meetsMinimumTouchTarget: (width: number, height: number): boolean => {
    return width >= AccessibilityConstants.MINIMUM_TOUCH_TARGET_SIZE && 
           height >= AccessibilityConstants.MINIMUM_TOUCH_TARGET_SIZE;
  },
};

// Accessibility testing helpers
export const AccessibilityTesting = {
  // Log accessibility properties for debugging
  logAccessibilityProps: (componentName: string, props: any) => {
    if (__DEV__) {
      console.log(`[A11Y] ${componentName}:`, {
        accessibilityLabel: props.accessibilityLabel,
        accessibilityHint: props.accessibilityHint,
        accessibilityRole: props.accessibilityRole,
        accessibilityState: props.accessibilityState,
        accessible: props.accessible,
      });
    }
  },

  // Validate accessibility props
  validateAccessibilityProps: (componentName: string, props: any): string[] => {
    const warnings: string[] = [];

    if (props.accessibilityRole === 'button' && !props.accessibilityLabel) {
      warnings.push(`${componentName}: Button should have accessibilityLabel`);
    }

    if (props.accessibilityLabel && props.accessibilityLabel.length > 100) {
      warnings.push(`${componentName}: accessibilityLabel is too long (${props.accessibilityLabel.length} chars)`);
    }

    if (props.accessibilityHint && props.accessibilityHint.length > 150) {
      warnings.push(`${componentName}: accessibilityHint is too long (${props.accessibilityHint.length} chars)`);
    }

    if (__DEV__ && warnings.length > 0) {
      console.warn('[A11Y Warnings]:', warnings);
    }

    return warnings;
  },
};

// Accessibility context for theme-aware accessibility
export interface AccessibilityContextType {
  isScreenReaderEnabled: boolean;
  isReducedMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  announceMessage: (message: string) => void;
  setFocus: (reactTag: number) => void;
}

// Hook for comprehensive accessibility state
export const useAccessibility = (): AccessibilityContextType => {
  const { isScreenReaderEnabled } = useScreenReader();
  const isReducedMotionEnabled = useReducedMotion();
  const isHighContrastEnabled = useHighContrast();
  const { announce } = useAccessibilityAnnouncements();
  const { setAccessibilityFocus } = useFocusManagement();

  return {
    isScreenReaderEnabled,
    isReducedMotionEnabled,
    isHighContrastEnabled,
    announceMessage: announce,
    setFocus: setAccessibilityFocus,
  };
};

// Accessibility props builder
export const buildAccessibilityProps = (config: {
  label?: string;
  hint?: string;
  role?: string;
  state?: any;
  traits?: string[];
  value?: string;
  adjustable?: boolean;
  onAccessibilityAction?: (event: any) => void;
}) => {
  const props: any = {};

  if (config.label) {
    props.accessibilityLabel = config.label;
  }

  if (config.hint) {
    props.accessibilityHint = config.hint;
  }

  if (config.role) {
    props.accessibilityRole = config.role;
  }

  if (config.state) {
    props.accessibilityState = config.state;
  }

  if (config.value) {
    props.accessibilityValue = { text: config.value };
  }

  if (Platform.OS === 'ios' && config.traits) {
    props.accessibilityTraits = config.traits;
  }

  if (config.adjustable) {
    props.accessible = true;
    if (Platform.OS === 'ios') {
      props.accessibilityTraits = [...(props.accessibilityTraits || []), 'adjustable'];
    }
  }

  if (config.onAccessibilityAction) {
    props.onAccessibilityAction = config.onAccessibilityAction;
  }

  return props;
};