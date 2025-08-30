import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

// Focus management types
export interface FocusableElement {
  id: string;
  ref: React.RefObject<any>;
  order?: number;
  disabled?: boolean;
}

// Focus manager class
class FocusManager {
  private focusableElements: Map<string, FocusableElement> = new Map();
  private currentFocusId: string | null = null;
  private focusHistory: string[] = [];

  // Register a focusable element
  register(element: FocusableElement) {
    this.focusableElements.set(element.id, element);
  }

  // Unregister a focusable element
  unregister(id: string) {
    this.focusableElements.delete(id);
    
    // Remove from history
    this.focusHistory = this.focusHistory.filter(historyId => historyId !== id);
    
    // Clear current focus if it was this element
    if (this.currentFocusId === id) {
      this.currentFocusId = null;
    }
  }

  // Set focus to a specific element
  setFocus(id: string): boolean {
    const element = this.focusableElements.get(id);
    
    if (!element || element.disabled) {
      return false;
    }

    const reactTag = findNodeHandle(element.ref.current);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
      this.currentFocusId = id;
      
      // Add to history
      this.focusHistory = this.focusHistory.filter(historyId => historyId !== id);
      this.focusHistory.push(id);
      
      return true;
    }

    return false;
  }

  // Move focus to next element
  focusNext(): boolean {
    const elements = this.getSortedElements();
    const currentIndex = elements.findIndex(el => el.id === this.currentFocusId);
    
    if (currentIndex === -1) {
      // No current focus, focus first element
      return elements.length > 0 ? this.setFocus(elements[0].id) : false;
    }

    // Find next focusable element
    for (let i = currentIndex + 1; i < elements.length; i++) {
      if (!elements[i].disabled && this.setFocus(elements[i].id)) {
        return true;
      }
    }

    // Wrap to beginning
    for (let i = 0; i <= currentIndex; i++) {
      if (!elements[i].disabled && this.setFocus(elements[i].id)) {
        return true;
      }
    }

    return false;
  }

  // Move focus to previous element
  focusPrevious(): boolean {
    const elements = this.getSortedElements();
    const currentIndex = elements.findIndex(el => el.id === this.currentFocusId);
    
    if (currentIndex === -1) {
      // No current focus, focus last element
      return elements.length > 0 ? this.setFocus(elements[elements.length - 1].id) : false;
    }

    // Find previous focusable element
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!elements[i].disabled && this.setFocus(elements[i].id)) {
        return true;
      }
    }

    // Wrap to end
    for (let i = elements.length - 1; i >= currentIndex; i--) {
      if (!elements[i].disabled && this.setFocus(elements[i].id)) {
        return true;
      }
    }

    return false;
  }

  // Focus first element
  focusFirst(): boolean {
    const elements = this.getSortedElements();
    
    for (const element of elements) {
      if (!element.disabled && this.setFocus(element.id)) {
        return true;
      }
    }

    return false;
  }

  // Focus last element
  focusLast(): boolean {
    const elements = this.getSortedElements();
    
    for (let i = elements.length - 1; i >= 0; i--) {
      if (!elements[i].disabled && this.setFocus(elements[i].id)) {
        return true;
      }
    }

    return false;
  }

  // Return to previous focus
  returnToPreviousFocus(): boolean {
    if (this.focusHistory.length < 2) {
      return false;
    }

    // Get the second-to-last item (last is current focus)
    const previousId = this.focusHistory[this.focusHistory.length - 2];
    return this.setFocus(previousId);
  }

  // Get current focus
  getCurrentFocus(): string | null {
    return this.currentFocusId;
  }

  // Get all registered elements sorted by order
  private getSortedElements(): FocusableElement[] {
    return Array.from(this.focusableElements.values()).sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }

  // Clear all elements
  clear() {
    this.focusableElements.clear();
    this.currentFocusId = null;
    this.focusHistory = [];
  }
}

// Global focus manager instance
export const globalFocusManager = new FocusManager();

// Hook for focus management
export const useFocusManager = () => {
  return {
    register: globalFocusManager.register.bind(globalFocusManager),
    unregister: globalFocusManager.unregister.bind(globalFocusManager),
    setFocus: globalFocusManager.setFocus.bind(globalFocusManager),
    focusNext: globalFocusManager.focusNext.bind(globalFocusManager),
    focusPrevious: globalFocusManager.focusPrevious.bind(globalFocusManager),
    focusFirst: globalFocusManager.focusFirst.bind(globalFocusManager),
    focusLast: globalFocusManager.focusLast.bind(globalFocusManager),
    returnToPreviousFocus: globalFocusManager.returnToPreviousFocus.bind(globalFocusManager),
    getCurrentFocus: globalFocusManager.getCurrentFocus.bind(globalFocusManager),
  };
};

// Hook for registering focusable elements
export const useFocusable = (
  id: string,
  options: {
    order?: number;
    disabled?: boolean;
    autoFocus?: boolean;
  } = {}
) => {
  const ref = useRef<any>(null);
  const { register, unregister, setFocus } = useFocusManager();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const element: FocusableElement = {
      id,
      ref,
      order: options.order,
      disabled: options.disabled,
    };

    register(element);

    // Auto focus if requested
    if (options.autoFocus && !options.disabled) {
      setTimeout(() => setFocus(id), 100);
    }

    return () => unregister(id);
  }, [id, options.order, options.disabled, options.autoFocus, register, unregister, setFocus]);

  // Track focus state
  useEffect(() => {
    const checkFocus = () => {
      const currentFocus = globalFocusManager.getCurrentFocus();
      setIsFocused(currentFocus === id);
    };

    // Check initially
    checkFocus();

    // Set up interval to check focus state
    const interval = setInterval(checkFocus, 100);

    return () => clearInterval(interval);
  }, [id]);

  const focus = useCallback(() => {
    return setFocus(id);
  }, [id, setFocus]);

  return {
    ref,
    focus,
    isFocused,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (containerId?: string) => {
  const { focusNext, focusPrevious, focusFirst, focusLast } = useFocusManager();

  const handleKeyPress = useCallback((event: any) => {
    if (Platform.OS !== 'web') return;

    const { key, shiftKey, ctrlKey, metaKey } = event.nativeEvent || event;

    switch (key) {
      case 'Tab':
        event.preventDefault();
        if (shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
        break;

      case 'Home':
        if (ctrlKey || metaKey) {
          event.preventDefault();
          focusFirst();
        }
        break;

      case 'End':
        if (ctrlKey || metaKey) {
          event.preventDefault();
          focusLast();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        focusNext();
        break;

      case 'ArrowUp':
        event.preventDefault();
        focusPrevious();
        break;
    }
  }, [focusNext, focusPrevious, focusFirst, focusLast]);

  return {
    onKeyPress: handleKeyPress,
  };
};

// Focus trap hook for modals and dialogs
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<any>(null);
  const [trapId] = useState(() => `focus-trap-${Date.now()}`);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    const previousFocus = globalFocusManager.getCurrentFocus();

    // Focus first element in trap
    setTimeout(() => {
      globalFocusManager.focusFirst();
    }, 100);

    // Return focus when trap is deactivated
    return () => {
      if (previousFocus) {
        globalFocusManager.setFocus(previousFocus);
      }
    };
  }, [isActive]);

  return {
    containerRef,
    trapId,
  };
};

// Skip link component for keyboard navigation
export const useSkipLinks = () => {
  const skipLinks = useRef<Array<{ id: string; label: string; target: string }>>([]);

  const addSkipLink = useCallback((id: string, label: string, target: string) => {
    skipLinks.current.push({ id, label, target });
  }, []);

  const removeSkipLink = useCallback((id: string) => {
    skipLinks.current = skipLinks.current.filter(link => link.id !== id);
  }, []);

  const skipTo = useCallback((target: string) => {
    globalFocusManager.setFocus(target);
  }, []);

  return {
    skipLinks: skipLinks.current,
    addSkipLink,
    removeSkipLink,
    skipTo,
  };
};

// Focus restoration hook
export const useFocusRestoration = () => {
  const previousFocusRef = useRef<string | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = globalFocusManager.getCurrentFocus();
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      globalFocusManager.setFocus(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
  };
};

// Roving tabindex hook for complex widgets
export const useRovingTabindex = (items: string[], orientation: 'horizontal' | 'vertical' = 'horizontal') => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((event: any, currentIndex: number) => {
    const { key } = event.nativeEvent || event;
    let newIndex = currentIndex;

    if (orientation === 'horizontal') {
      switch (key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
      }
    } else {
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowDown':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
      }
    }

    if (newIndex !== currentIndex) {
      setActiveIndex(newIndex);
      globalFocusManager.setFocus(items[newIndex]);
    }
  }, [items, orientation]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
};