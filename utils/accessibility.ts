import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility constants
export const ACCESSIBILITY_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  TEXT: 'text',
  IMAGE: 'image',
  HEADER: 'header',
  SEARCH: 'search',
  TAB: 'tab',
  TABLIST: 'tablist',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  SLIDER: 'slider',
  PROGRESSBAR: 'progressbar',
  ALERT: 'alert',
  DIALOG: 'dialog',
  LIST: 'list',
  LISTITEM: 'listitem',
} as const;

export const ACCESSIBILITY_TRAITS = {
  NONE: 'none',
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  SEARCH: 'search',
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

// Accessibility state management
interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredContentSizeCategory: string;
}

let accessibilityState: AccessibilityState = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isHighContrastEnabled: false,
  preferredContentSizeCategory: 'medium',
};

// Initialize accessibility state
export const initializeAccessibility = async (): Promise<AccessibilityState> => {
  try {
    const [
      isScreenReaderEnabled,
      isReduceMotionEnabled,
      isHighContrastEnabled,
    ] = await Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      Platform.OS === 'ios' ? AccessibilityInfo.isHighTextContrastEnabled() : Promise.resolve(false),
    ]);

    accessibilityState = {
      isScreenReaderEnabled,
      isReduceMotionEnabled,
      isHighContrastEnabled,
      preferredContentSizeCategory: 'medium', // Default value
    };

    return accessibilityState;
  } catch (error) {
    console.error('Failed to initialize accessibility state:', error);
    return accessibilityState;
  }
};

// Get current accessibility state
export const getAccessibilityState = (): AccessibilityState => {
  return accessibilityState;
};

// Accessibility helpers
export const createAccessibilityLabel = (
  primary: string,
  secondary?: string,
  context?: string
): string => {
  let label = primary;
  
  if (secondary) {
    label += `, ${secondary}`;
  }
  
  if (context) {
    label += `. ${context}`;
  }
  
  return label;
};

export const createAccessibilityHint = (action: string, result?: string): string => {
  let hint = `Double tap to ${action}`;
  
  if (result) {
    hint += `. ${result}`;
  }
  
  return hint;
};

// Food listing accessibility helpers
export const getFoodListingAccessibilityLabel = (listing: {
  title: string;
  category: string;
  distance?: string;
  availability: string;
  timeLeft?: string;
  isUrgent?: boolean;
}): string => {
  const parts = [listing.title, listing.category];
  
  if (listing.distance) {
    parts.push(`${listing.distance} away`);
  }
  
  parts.push(`${listing.availability} availability`);
  
  if (listing.timeLeft) {
    parts.push(`${listing.timeLeft} remaining`);
  }
  
  if (listing.isUrgent) {
    parts.push('urgent pickup needed');
  }
  
  return parts.join(', ');
};

export const getMapMarkerAccessibilityLabel = (listing: {
  title: string;
  category: string;
  availability: string;
}): string => {
  return `${listing.title}, ${listing.category}, ${listing.availability} availability. Double tap to view details.`;
};

export const getFilterChipAccessibilityLabel = (
  filter: string,
  isSelected: boolean,
  count?: number
): string => {
  let label = filter;
  
  if (count !== undefined) {
    label += `, ${count} items`;
  }
  
  label += isSelected ? ', selected' : ', not selected';
  
  return label;
};

// Search accessibility helpers
export const getSearchResultsAccessibilityLabel = (count: number, query?: string): string => {
  if (count === 0) {
    return query ? `No results found for ${query}` : 'No results found';
  }
  
  const resultsText = count === 1 ? 'result' : 'results';
  const baseText = `${count} ${resultsText} found`;
  
  return query ? `${baseText} for ${query}` : baseText;
};

// Navigation accessibility helpers
export const getNavigationAccessibilityLabel = (
  destination: string,
  distance?: string,
  estimatedTime?: string
): string => {
  let label = `Navigate to ${destination}`;
  
  if (distance) {
    label += `, ${distance} away`;
  }
  
  if (estimatedTime) {
    label += `, estimated ${estimatedTime}`;
  }
  
  return label;
};

// Error state accessibility helpers
export const getErrorAccessibilityLabel = (
  errorType: string,
  message: string,
  hasRetry: boolean
): string => {
  let label = `${errorType} error: ${message}`;
  
  if (hasRetry) {
    label += '. Retry option available.';
  }
  
  return label;
};

// Loading state accessibility helpers
export const getLoadingAccessibilityLabel = (context: string): string => {
  return `Loading ${context}, please wait`;
};

// Haptic feedback for accessibility
export const accessibleHapticFeedback = async (
  type: 'selection' | 'impact' | 'notification' = 'selection'
): Promise<void> => {
  try {
    // Only provide haptic feedback if reduce motion is not enabled
    if (!accessibilityState.isReduceMotionEnabled) {
      switch (type) {
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'impact':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'notification':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }
    }
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

// Announce to screen reader
export const announceToScreenReader = (message: string): void => {
  if (accessibilityState.isScreenReaderEnabled) {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

// Focus management
export const setAccessibilityFocus = (ref: any): void => {
  if (ref?.current && accessibilityState.isScreenReaderEnabled) {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
};

// High contrast color helpers
export const getAccessibleColors = (defaultColors: {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}) => {
  if (!accessibilityState.isHighContrastEnabled) {
    return defaultColors;
  }
  
  // Return high contrast versions
  return {
    primary: '#000000',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    text: '#000000',
  };
};

// Text size helpers
export const getAccessibleTextSize = (baseSize: number): number => {
  // Adjust text size based on accessibility preferences
  const sizeMultipliers = {
    'extra-small': 0.8,
    'small': 0.9,
    'medium': 1.0,
    'large': 1.1,
    'extra-large': 1.2,
    'extra-extra-large': 1.3,
    'extra-extra-extra-large': 1.4,
  };
  
  const multiplier = sizeMultipliers[accessibilityState.preferredContentSizeCategory as keyof typeof sizeMultipliers] || 1.0;
  return Math.round(baseSize * multiplier);
};

// Keyboard navigation helpers
export const isKeyboardNavigationEnabled = (): boolean => {
  return Platform.OS === 'web' || Platform.OS === 'macos' || Platform.OS === 'windows';
};

export const getKeyboardShortcuts = () => {
  return {
    search: 'Cmd+F',
    filter: 'Cmd+Shift+F',
    refresh: 'Cmd+R',
    back: 'Escape',
    next: 'Tab',
    previous: 'Shift+Tab',
    select: 'Enter',
    close: 'Escape',
  };
};

// Keyboard navigation helpers
export const handleKeyboardNavigation = (
  event: any,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  if (!isKeyboardNavigationEnabled()) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      onArrowRight?.();
      break;
  }
};

// Screen reader navigation helpers
export const announceScreenChange = (screenName: string, context?: string) => {
  const message = context 
    ? `Navigated to ${screenName}. ${context}`
    : `Navigated to ${screenName}`;
  announceToScreenReader(message);
};

export const announceListUpdate = (itemCount: number, listType: string = 'items') => {
  const message = itemCount === 0 
    ? `No ${listType} available`
    : `${itemCount} ${listType} ${itemCount === 1 ? 'available' : 'available'}`;
  announceToScreenReader(message);
};

export const announceActionResult = (action: string, success: boolean, details?: string) => {
  const result = success ? 'successful' : 'failed';
  const message = details 
    ? `${action} ${result}. ${details}`
    : `${action} ${result}`;
  announceToScreenReader(message);
};

// Accessibility testing helpers
export const validateAccessibility = (component: {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessible?: boolean;
}): string[] => {
  const issues: string[] = [];
  
  if (!component.accessible && !component.accessibilityLabel) {
    issues.push('Component should have accessibilityLabel or be marked as accessible');
  }
  
  if (component.accessibilityLabel && component.accessibilityLabel.length > 100) {
    issues.push('Accessibility label should be concise (under 100 characters)');
  }
  
  if (component.accessibilityHint && component.accessibilityHint.length > 150) {
    issues.push('Accessibility hint should be concise (under 150 characters)');
  }
  
  return issues;
};

// Enhanced accessibility for map markers
export const getEnhancedMapMarkerAccessibility = (listing: {
  title: string;
  category: string;
  availability: string;
  distance?: string;
  timeLeft?: string;
  isUrgent?: boolean;
}, markerIndex?: number, totalMarkers?: number) => {
  const baseLabel = getMapMarkerAccessibilityLabel(listing);
  
  let enhancedLabel = baseLabel;
  
  if (markerIndex !== undefined && totalMarkers !== undefined) {
    enhancedLabel += ` Marker ${markerIndex + 1} of ${totalMarkers}.`;
  }
  
  if (listing.distance) {
    enhancedLabel += ` Located ${listing.distance} away.`;
  }
  
  if (listing.timeLeft) {
    enhancedLabel += ` ${listing.timeLeft} remaining.`;
  }
  
  if (listing.isUrgent) {
    enhancedLabel += ` Urgent pickup needed.`;
  }
  
  return {
    accessibilityLabel: enhancedLabel,
    accessibilityHint: 'Double tap to select and view details',
    accessibilityRole: ACCESSIBILITY_ROLES.BUTTON,
    accessibilityState: { selected: false },
    accessibilityValue: { 
      text: `${listing.availability} availability${listing.isUrgent ? ', urgent' : ''}` 
    }
  };
};

// Export hooks for React components
export const useReducedMotion = (): boolean => {
  return accessibilityState.isReduceMotionEnabled;
};

export const useHighContrast = (): boolean => {
  return accessibilityState.isHighContrastEnabled;
};

export default {
  initializeAccessibility,
  getAccessibilityState,
  createAccessibilityLabel,
  createAccessibilityHint,
  getFoodListingAccessibilityLabel,
  getMapMarkerAccessibilityLabel,
  getFilterChipAccessibilityLabel,
  getSearchResultsAccessibilityLabel,
  getNavigationAccessibilityLabel,
  getErrorAccessibilityLabel,
  getLoadingAccessibilityLabel,
  accessibleHapticFeedback,
  announceToScreenReader,
  setAccessibilityFocus,
  getAccessibleColors,
  getAccessibleTextSize,
  isKeyboardNavigationEnabled,
  getKeyboardShortcuts,
  validateAccessibility,
  handleKeyboardNavigation,
  announceScreenChange,
  announceListUpdate,
  announceActionResult,
  getEnhancedMapMarkerAccessibility,
  useReducedMotion,
  useHighContrast,
  ACCESSIBILITY_ROLES,
  ACCESSIBILITY_TRAITS,
};