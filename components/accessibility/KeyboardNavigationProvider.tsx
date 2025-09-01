import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { handleKeyboardNavigation, isKeyboardNavigationEnabled } from '../../utils/accessibility';

interface KeyboardNavigationContextType {
  isKeyboardNavigationEnabled: boolean;
  focusedElementId: string | null;
  setFocusedElement: (id: string | null) => void;
  registerKeyboardHandler: (id: string, handlers: KeyboardHandlers) => void;
  unregisterKeyboardHandler: (id: string) => void;
}

interface KeyboardHandlers {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({ children }) => {
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const [keyboardHandlers, setKeyboardHandlers] = useState<Map<string, KeyboardHandlers>>(new Map());
  const [isEnabled] = useState(isKeyboardNavigationEnabled());

  const setFocusedElement = (id: string | null) => {
    setFocusedElementId(id);
  };

  const registerKeyboardHandler = (id: string, handlers: KeyboardHandlers) => {
    setKeyboardHandlers(prev => new Map(prev).set(id, handlers));
  };

  const unregisterKeyboardHandler = (id: string) => {
    setKeyboardHandlers(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  useEffect(() => {
    if (!isEnabled || Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!focusedElementId) return;

      const handlers = keyboardHandlers.get(focusedElementId);
      if (!handlers) return;

      handleKeyboardNavigation(
        event,
        handlers.onEnter,
        handlers.onEscape,
        handlers.onArrowUp,
        handlers.onArrowDown,
        handlers.onArrowLeft,
        handlers.onArrowRight
      );

      // Handle Tab navigation
      if (event.key === 'Tab') {
        event.preventDefault();
        if (event.shiftKey) {
          handlers.onShiftTab?.();
        } else {
          handlers.onTab?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedElementId, keyboardHandlers, isEnabled]);

  const contextValue: KeyboardNavigationContextType = {
    isKeyboardNavigationEnabled: isEnabled,
    focusedElementId,
    setFocusedElement,
    registerKeyboardHandler,
    unregisterKeyboardHandler,
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (context === undefined) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
};

// Hook for individual components to register keyboard handlers
export const useKeyboardHandler = (
  elementId: string,
  handlers: KeyboardHandlers,
  enabled: boolean = true
) => {
  const { registerKeyboardHandler, unregisterKeyboardHandler, setFocusedElement } = useKeyboardNavigation();

  useEffect(() => {
    if (enabled) {
      registerKeyboardHandler(elementId, handlers);
    } else {
      unregisterKeyboardHandler(elementId);
    }

    return () => unregisterKeyboardHandler(elementId);
  }, [elementId, handlers, enabled, registerKeyboardHandler, unregisterKeyboardHandler]);

  const focus = () => setFocusedElement(elementId);
  const blur = () => setFocusedElement(null);

  return { focus, blur };
};

export default KeyboardNavigationProvider;