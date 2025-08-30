import { useCallback, useEffect, useRef, useState } from 'react';

// Loading state hook
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const setLoadingData = useCallback((data: any) => {
    setData(data);
    setIsLoading(false);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    startLoading,
    stopLoading,
    setLoadingError,
    setLoadingData,
    reset,
  };
};

// Async operation hook with loading state
export const useAsyncOperation = <T = any>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    operation: (signal?: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel previous operation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      const result = await operation(signal);
      
      if (!signal.aborted) {
        setData(result);
        setIsLoading(false);
        return result;
      }
      
      return null;
    } catch (err) {
      if (!signal.aborted) {
        const error = err as Error;
        setError(error);
        setIsLoading(false);
        throw error;
      }
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setError(null);
    setData(null);
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    cancel,
    reset,
  };
};

// Multiple loading states hook
export const useMultipleLoadingStates = (keys: string[]) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const resetAll = useCallback(() => {
    setLoadingStates(keys.reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  }, [keys]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    resetAll,
  };
};

// Debounced loading hook
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, delay) as any;
  }, [delay]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setShowLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    showLoading,
    startLoading,
    stopLoading,
  };
};

// Loading state with timeout
export const useLoadingWithTimeout = (timeout: number = 30000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setHasTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setIsLoading(false);
    }, timeout) as any;
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setHasTimedOut(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading,
    reset,
  };
};

// Progressive loading hook
export const useProgressiveLoading = (stages: number[]) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const nextStage = useCallback(() => {
    if (currentStage < stages.length - 1) {
      const newStage = currentStage + 1;
      setCurrentStage(newStage);
      setProgress((newStage / stages.length) * 100);
    } else {
      setIsComplete(true);
      setProgress(100);
    }
  }, [currentStage, stages.length]);

  const reset = useCallback(() => {
    setCurrentStage(0);
    setProgress(0);
    setIsComplete(false);
  }, []);

  const goToStage = useCallback((stage: number) => {
    if (stage >= 0 && stage < stages.length) {
      setCurrentStage(stage);
      setProgress((stage / stages.length) * 100);
      setIsComplete(stage === stages.length - 1);
    }
  }, [stages.length]);

  return {
    currentStage,
    progress,
    isComplete,
    nextStage,
    reset,
    goToStage,
    totalStages: stages.length,
  };
};

// Loading state with retry logic
export const useLoadingWithRetry = (maxRetries: number = 3) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [canRetry, setCanRetry] = useState(true);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setIsLoading(false);
      setRetryCount(0);
      setCanRetry(true);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      
      if (retryCount < maxRetries) {
        setCanRetry(true);
      } else {
        setCanRetry(false);
      }
      
      throw error;
    }
  }, [retryCount, maxRetries]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }

    setRetryCount(prev => prev + 1);
    return execute(operation);
  }, [retryCount, maxRetries, execute]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    setCanRetry(true);
  }, []);

  return {
    isLoading,
    error,
    retryCount,
    canRetry,
    maxRetries,
    execute,
    retry,
    reset,
  };
};

// Batch loading hook
export const useBatchLoading = () => {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  const startLoading = useCallback((itemId: string) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(itemId);
      return newErrors;
    });
  }, []);

  const stopLoading = useCallback((itemId: string) => {
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const setError = useCallback((itemId: string, error: Error) => {
    setErrors(prev => new Map(prev).set(itemId, error));
    stopLoading(itemId);
  }, [stopLoading]);

  const isLoading = useCallback((itemId: string) => {
    return loadingItems.has(itemId);
  }, [loadingItems]);

  const getError = useCallback((itemId: string) => {
    return errors.get(itemId);
  }, [errors]);

  const isAnyLoading = useCallback(() => {
    return loadingItems.size > 0;
  }, [loadingItems]);

  const reset = useCallback(() => {
    setLoadingItems(new Set());
    setErrors(new Map());
  }, []);

  return {
    startLoading,
    stopLoading,
    setError,
    isLoading,
    getError,
    isAnyLoading,
    loadingCount: loadingItems.size,
    reset,
  };
};