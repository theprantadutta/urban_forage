import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { useReducedMotion } from './accessibility';

// Haptic feedback types
export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
  IMPACT_LIGHT = 'impactLight',
  IMPACT_MEDIUM = 'impactMedium',
  IMPACT_HEAVY = 'impactHeavy',
  NOTIFICATION_SUCCESS = 'notificationSuccess',
  NOTIFICATION_WARNING = 'notificationWarning',
  NOTIFICATION_ERROR = 'notificationError',
}

// Haptic patterns for complex interactions
export const HapticPatterns = {
  // Button press patterns
  BUTTON_PRESS: [HapticType.LIGHT],
  BUTTON_PRESS_IMPORTANT: [HapticType.MEDIUM],
  BUTTON_PRESS_DESTRUCTIVE: [HapticType.WARNING, HapticType.LIGHT],

  // Navigation patterns
  TAB_SWITCH: [HapticType.SELECTION],
  SCREEN_TRANSITION: [HapticType.LIGHT],
  MODAL_OPEN: [HapticType.MEDIUM],
  MODAL_CLOSE: [HapticType.LIGHT],

  // Interaction patterns
  TOGGLE_ON: [HapticType.SUCCESS],
  TOGGLE_OFF: [HapticType.LIGHT],
  SLIDER_TICK: [HapticType.SELECTION],
  PULL_TO_REFRESH: [HapticType.MEDIUM, HapticType.LIGHT],

  // Feedback patterns
  SUCCESS_ACTION: [HapticType.SUCCESS, HapticType.LIGHT],
  ERROR_ACTION: [HapticType.ERROR, HapticType.MEDIUM],
  WARNING_ACTION: [HapticType.WARNING],

  // List interactions
  LIST_ITEM_SELECT: [HapticType.SELECTION],
  LIST_ITEM_DELETE: [HapticType.WARNING, HapticType.LIGHT],
  LIST_REORDER: [HapticType.MEDIUM],

  // Form interactions
  INPUT_FOCUS: [HapticType.LIGHT],
  INPUT_ERROR: [HapticType.ERROR],
  FORM_SUBMIT: [HapticType.SUCCESS],

  // Game-like interactions
  ACHIEVEMENT: [HapticType.SUCCESS, HapticType.MEDIUM, HapticType.LIGHT],
  LEVEL_UP: [HapticType.SUCCESS, HapticType.SUCCESS],
  COIN_COLLECT: [HapticType.LIGHT],
} as const;

// Haptic manager class
class HapticManager {
  private isEnabled: boolean = true;
  private isReducedMotionEnabled: boolean = false;

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setReducedMotion(enabled: boolean) {
    this.isReducedMotionEnabled = enabled;
  }

  // Trigger single haptic feedback
  async trigger(type: HapticType): Promise<void> {
    if (!this.isEnabled || this.isReducedMotionEnabled) {
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        switch (type) {
          case HapticType.LIGHT:
          case HapticType.IMPACT_LIGHT:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;

          case HapticType.MEDIUM:
          case HapticType.IMPACT_MEDIUM:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;

          case HapticType.HEAVY:
          case HapticType.IMPACT_HEAVY:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;

          case HapticType.SUCCESS:
          case HapticType.NOTIFICATION_SUCCESS:
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;

          case HapticType.WARNING:
          case HapticType.NOTIFICATION_WARNING:
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;

          case HapticType.ERROR:
          case HapticType.NOTIFICATION_ERROR:
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;

          case HapticType.SELECTION:
            await Haptics.selectionAsync();
            break;

          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }

  // Trigger haptic pattern
  async triggerPattern(pattern: HapticType[], delay: number = 100): Promise<void> {
    if (!this.isEnabled || this.isReducedMotionEnabled) {
      return;
    }

    for (let i = 0; i < pattern.length; i++) {
      await this.trigger(pattern[i]);
      
      if (i < pattern.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Trigger contextual haptic feedback
  async triggerContextual(context: keyof typeof HapticPatterns): Promise<void> {
    const pattern = HapticPatterns[context];
    await this.triggerPattern([...pattern]);
  }
}

// Global haptic manager
export const hapticManager = new HapticManager();

// Hook for haptic feedback
export const useHaptics = () => {
  const isReducedMotionEnabled = useReducedMotion();

  // Update haptic manager with reduced motion preference
  React.useEffect(() => {
    hapticManager.setReducedMotion(isReducedMotionEnabled);
  }, [isReducedMotionEnabled]);

  const trigger = useCallback(async (type: HapticType) => {
    await hapticManager.trigger(type);
  }, []);

  const triggerPattern = useCallback(async (pattern: HapticType[], delay?: number) => {
    await hapticManager.triggerPattern(pattern, delay);
  }, []);

  const triggerContextual = useCallback(async (context: keyof typeof HapticPatterns) => {
    await hapticManager.triggerContextual(context);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    hapticManager.setEnabled(enabled);
  }, []);

  return {
    trigger,
    triggerPattern,
    triggerContextual,
    setEnabled,
    isReducedMotionEnabled,
  };
};

// Haptic-enhanced component hooks
export const useHapticButton = () => {
  const { triggerContextual } = useHaptics();

  const onPress = useCallback(async (callback?: () => void, type: 'normal' | 'important' | 'destructive' = 'normal') => {
    switch (type) {
      case 'important':
        await triggerContextual('BUTTON_PRESS_IMPORTANT');
        break;
      case 'destructive':
        await triggerContextual('BUTTON_PRESS_DESTRUCTIVE');
        break;
      default:
        await triggerContextual('BUTTON_PRESS');
    }
    
    callback?.();
  }, [triggerContextual]);

  return { onPress };
};

export const useHapticToggle = () => {
  const { triggerContextual } = useHaptics();

  const onToggle = useCallback(async (value: boolean, callback?: (value: boolean) => void) => {
    await triggerContextual(value ? 'TOGGLE_ON' : 'TOGGLE_OFF');
    callback?.(value);
  }, [triggerContextual]);

  return { onToggle };
};

export const useHapticNavigation = () => {
  const { triggerContextual } = useHaptics();

  const onTabSwitch = useCallback(async (callback?: () => void) => {
    await triggerContextual('TAB_SWITCH');
    callback?.();
  }, [triggerContextual]);

  const onScreenTransition = useCallback(async (callback?: () => void) => {
    await triggerContextual('SCREEN_TRANSITION');
    callback?.();
  }, [triggerContextual]);

  const onModalOpen = useCallback(async (callback?: () => void) => {
    await triggerContextual('MODAL_OPEN');
    callback?.();
  }, [triggerContextual]);

  const onModalClose = useCallback(async (callback?: () => void) => {
    await triggerContextual('MODAL_CLOSE');
    callback?.();
  }, [triggerContextual]);

  return {
    onTabSwitch,
    onScreenTransition,
    onModalOpen,
    onModalClose,
  };
};

export const useHapticList = () => {
  const { triggerContextual } = useHaptics();

  const onItemSelect = useCallback(async (callback?: () => void) => {
    await triggerContextual('LIST_ITEM_SELECT');
    callback?.();
  }, [triggerContextual]);

  const onItemDelete = useCallback(async (callback?: () => void) => {
    await triggerContextual('LIST_ITEM_DELETE');
    callback?.();
  }, [triggerContextual]);

  const onReorder = useCallback(async (callback?: () => void) => {
    await triggerContextual('LIST_REORDER');
    callback?.();
  }, [triggerContextual]);

  return {
    onItemSelect,
    onItemDelete,
    onReorder,
  };
};

export const useHapticForm = () => {
  const { triggerContextual } = useHaptics();

  const onInputFocus = useCallback(async (callback?: () => void) => {
    await triggerContextual('INPUT_FOCUS');
    callback?.();
  }, [triggerContextual]);

  const onInputError = useCallback(async (callback?: () => void) => {
    await triggerContextual('INPUT_ERROR');
    callback?.();
  }, [triggerContextual]);

  const onFormSubmit = useCallback(async (callback?: () => void) => {
    await triggerContextual('FORM_SUBMIT');
    callback?.();
  }, [triggerContextual]);

  return {
    onInputFocus,
    onInputError,
    onFormSubmit,
  };
};

export const useHapticFeedback = () => {
  const { triggerContextual } = useHaptics();

  const onSuccess = useCallback(async (callback?: () => void) => {
    await triggerContextual('SUCCESS_ACTION');
    callback?.();
  }, [triggerContextual]);

  const onError = useCallback(async (callback?: () => void) => {
    await triggerContextual('ERROR_ACTION');
    callback?.();
  }, [triggerContextual]);

  const onWarning = useCallback(async (callback?: () => void) => {
    await triggerContextual('WARNING_ACTION');
    callback?.();
  }, [triggerContextual]);

  return {
    onSuccess,
    onError,
    onWarning,
  };
};