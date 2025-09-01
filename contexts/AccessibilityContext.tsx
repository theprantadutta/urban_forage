import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { initializeAccessibility } from '../utils/accessibility';

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredContentSizeCategory: string;
  isLoading: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  refreshAccessibilityState: () => Promise<void>;
  announceMessage: (message: string) => void;
  setFocus: (ref: any) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    preferredContentSizeCategory: 'medium',
    isLoading: true,
  });

  const refreshAccessibilityState = async () => {
    try {
      const state = await initializeAccessibility();
      setAccessibilityState({
        ...state,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to refresh accessibility state:', error);
      setAccessibilityState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const announceMessage = (message: string) => {
    if (accessibilityState.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const setFocus = (ref: any) => {
    if (ref?.current && accessibilityState.isScreenReaderEnabled) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  };

  useEffect(() => {
    // Initialize accessibility state
    refreshAccessibilityState();

    // Set up listeners for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({
          ...prev,
          isScreenReaderEnabled: isEnabled,
        }));
      }
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({
          ...prev,
          isReduceMotionEnabled: isEnabled,
        }));
      }
    );

    let highContrastListener: any;
    if (Platform.OS === 'ios') {
      highContrastListener = AccessibilityInfo.addEventListener(
        'highTextContrastChanged' as any,
        (isEnabled: boolean) => {
          setAccessibilityState(prev => ({
            ...prev,
            isHighContrastEnabled: isEnabled,
          }));
        }
      );
    }

    // Cleanup listeners
    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
      highContrastListener?.remove();
    };
  }, []);

  const contextValue: AccessibilityContextType = {
    ...accessibilityState,
    refreshAccessibilityState,
    announceMessage,
    setFocus,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;